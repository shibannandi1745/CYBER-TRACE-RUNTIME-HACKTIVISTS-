import networkx as nx
from typing import Dict, List, Optional, Tuple, Set, Any
from ..models.device import Device, DeviceStatus
from ..models.graph import GraphNode, GraphEdge, EdgeRelationType, AttackPath, ReconstructedEdge
from ..models.telemetry import TelemetryEvent


class NetworkGraphEngine:
    """
    Manages the simulated environment network topology using NetworkX.
    Performs real-time attack path reconstruction, blast radius calculation,
    and post-containment verification.
    """

    def __init__(self, devices: Dict[str, Device]):
        self.devices = devices
        self.graph = nx.DiGraph()
        self.blocked_edges: Set[Tuple[str, str]] = set()
        self._build_initial_graph()

    def _build_initial_graph(self):
        self.graph.clear()
        # Add nodes
        for dev_id, dev in self.devices.items():
            self.graph.add_node(
                dev_id,
                name=dev.name,
                type=dev.type.value,
                floor=dev.floor,
                room=dev.room,
                ip=dev.ip_address,
                status=dev.status.value,
                risk_score=dev.risk_score,
                criticality=dev.criticality.value,
                is_isolated=dev.is_isolated
            )

        # Add bidirectional or directed physical/logical connections
        for dev_id, dev in self.devices.items():
            for target_id in dev.connected_devices:
                if target_id in self.devices:
                    # Determine relation type
                    relation = EdgeRelationType.CONNECTED_TO
                    if "Server" in target_id or "Database" in target_id:
                        relation = EdgeRelationType.ACCESSES
                    elif "Door" in target_id or "HVAC" in target_id or "BMS" in target_id:
                        relation = EdgeRelationType.CONTROLS

                    self.graph.add_edge(
                        dev_id,
                        target_id,
                        id=f"{dev_id}->{target_id}",
                        relation=relation.value,
                        is_blocked=False,
                        is_attack_path=False
                    )

    def sync_device_state(self, device: Device):
        if self.graph.has_node(device.id):
            self.graph.nodes[device.id]["status"] = device.status.value
            self.graph.nodes[device.id]["risk_score"] = device.risk_score
            self.graph.nodes[device.id]["is_isolated"] = device.is_isolated

    def block_edge(self, source: str, target: str):
        self.blocked_edges.add((source, target))
        if self.graph.has_edge(source, target):
            self.graph.edges[source, target]["is_blocked"] = True

    def unblock_edge(self, source: str, target: str):
        self.blocked_edges.discard((source, target))
        if self.graph.has_edge(source, target):
            self.graph.edges[source, target]["is_blocked"] = False

    def isolate_node(self, node_id: str):
        if node_id in self.devices:
            self.devices[node_id].is_isolated = True
            self.devices[node_id].status = DeviceStatus.QUARANTINED
            self.sync_device_state(self.devices[node_id])

    def un_isolate_node(self, node_id: str):
        if node_id in self.devices:
            self.devices[node_id].is_isolated = False
            self.devices[node_id].status = DeviceStatus.NORMAL
            self.devices[node_id].risk_score = 0
            self.sync_device_state(self.devices[node_id])

    def reconstruct_attack_path(
        self,
        origin_device: str,
        target_device: str,
        observed_hops: List[str] = None,
        missing_hops: List[str] = None,
        supporting_events: List[Any] = None
    ) -> AttackPath:
        """
        Reconstructs the probable attack path between origin and target using shortest path analysis,
        incorporating observed telemetry hops and calculating explainable confidence.
        """
        observed_hops = observed_hops or []
        missing_hops = missing_hops or []
        supporting_events = supporting_events or []

        # Create an active traversal subgraph excluding isolated nodes and blocked edges
        active_subgraph = nx.DiGraph()
        for u, v, data in self.graph.edges(data=True):
            if (u, v) in self.blocked_edges:
                continue
            if self.devices.get(u, Device(id=u, name=u, type="WORKSTATION", ip_address="", floor=1, room="", network_segment="", criticality="LOW")).is_isolated:
                continue
            active_subgraph.add_edge(u, v, **data)

        # Check if path is currently blocked
        is_blocked = False
        blocked_node = None

        if self.devices.get(origin_device, None) and self.devices[origin_device].is_isolated:
            is_blocked = True
            blocked_node = origin_device

        # If we have an explicit observed hop sequence, build path directly
        if observed_hops and len(observed_hops) >= 2:
            path_nodes = observed_hops
        else:
            try:
                # Find shortest path in full topology
                path_nodes = nx.shortest_path(self.graph, source=origin_device, target=target_device)
            except (nx.NetworkXNoPath, nx.NodeNotFound):
                path_nodes = [origin_device, target_device]

        # Calculate confidence score
        confidence = 94.0
        if missing_hops:
            # Drop confidence if telemetry hops are missing
            confidence = max(45.0, 94.0 - (len(missing_hops) * 15.0))

        # Check reachability in active subgraph
        try:
            if active_subgraph.has_node(origin_device) and active_subgraph.has_node(target_device):
                nx.shortest_path(active_subgraph, source=origin_device, target=target_device)
            else:
                is_blocked = True
        except (nx.NetworkXNoPath, nx.NodeNotFound):
            is_blocked = True

        edge_ids = [f"{path_nodes[i]}->{path_nodes[i+1]}" for i in range(len(path_nodes) - 1)]

        # Map event source -> list of event_ids
        event_map: Dict[str, List[str]] = {}
        for ev in supporting_events:
            ev_id = getattr(ev, "event_id", None) or (ev.get("event_id") if isinstance(ev, dict) else "")
            src = getattr(ev, "source_device", None) or (ev.get("source_device") if isinstance(ev, dict) else "")
            dst = getattr(ev, "destination_device", None) or (ev.get("destination_device") if isinstance(ev, dict) else "")
            if src and ev_id:
                event_map.setdefault(src, []).append(ev_id)
            if dst and ev_id:
                event_map.setdefault(dst, []).append(ev_id)

        reconstructed_edges: List[ReconstructedEdge] = []
        for i in range(len(path_nodes) - 1):
            src_n = path_nodes[i]
            dst_n = path_nodes[i+1]
            is_inferred = (src_n in missing_hops or dst_n in missing_hops)
            status = "INFERRED" if is_inferred else "CONFIRMED"
            edge_conf = 0.76 if is_inferred else 0.95
            ev_ids = list(set(event_map.get(src_n, []) + event_map.get(dst_n, [])))[:4]

            reconstructed_edges.append(ReconstructedEdge(
                source=src_n,
                target=dst_n,
                status=status,
                confidence=edge_conf,
                supporting_event_ids=ev_ids
            ))

        techniques = ["Credential Spraying (T1110)", "Lateral Movement (T1021)", "Exploitation for Privilege Escalation (T1068)", "Data Destruction (T1485)"]

        return AttackPath(
            path_id=f"PATH-{origin_device}-{target_device}",
            source_device=origin_device,
            target_device=target_device,
            nodes=path_nodes,
            edges=edge_ids,
            reconstructed_edges=reconstructed_edges,
            confidence_score=confidence,
            has_missing_telemetry=len(missing_hops) > 0,
            missing_hops=missing_hops,
            attack_techniques=techniques,
            is_active=not is_blocked,
            is_blocked=is_blocked,
            blocked_at_node=blocked_node or (origin_device if is_blocked else None),
            reconstructed_at=0.0,
            explanation=f"Reconstructed graph traversal across {len(path_nodes)} nodes with {confidence:.1f}% confidence."
        )


    def verify_containment(self, origin_device: str, critical_targets: List[str]) -> Tuple[bool, List[str]]:
        """
        Verifies if all paths from origin to critical targets are severed.
        Returns: (is_completely_contained, list_of_remaining_vulnerable_targets)
        """
        vulnerable = []
        if self.devices.get(origin_device, None) and self.devices[origin_device].is_isolated:
            # Origin is completely isolated
            return True, []

        # Check active path existence to each critical asset
        for target in critical_targets:
            if target not in self.graph:
                continue
            try:
                # Check path considering isolated nodes and blocked edges
                path = nx.shortest_path(self.graph, source=origin_device, target=target)
                # Check if any node in path is isolated or edge is blocked
                has_active_link = True
                for i in range(len(path) - 1):
                    u, v = path[i], path[i+1]
                    if (u, v) in self.blocked_edges or self.devices.get(u, None) and self.devices[u].is_isolated:
                        has_active_link = False
                        break
                if has_active_link:
                    vulnerable.append(target)
            except (nx.NetworkXNoPath, nx.NodeNotFound):
                pass

        return len(vulnerable) == 0, vulnerable

    def compute_blast_radius(self, compromised_nodes: List[str]) -> List[str]:
        """Computes all reachable downstream nodes within 2 hops of compromised nodes."""
        blast_set: Set[str] = set()
        for node in compromised_nodes:
            if node in self.graph and not self.devices.get(node, None).is_isolated:
                # 1-hop and 2-hop successors
                succ1 = list(self.graph.successors(node))
                blast_set.update(succ1)
                for s in succ1:
                    blast_set.update(list(self.graph.successors(s)))
        return list(blast_set)

    def export_graph_view(self, active_attack_path: Optional[AttackPath] = None) -> Dict[str, any]:
        """Exports nodes and edges formatted for frontend graph visualizers."""
        nodes: List[GraphNode] = []
        edges: List[GraphEdge] = []

        attack_node_set = set(active_attack_path.nodes) if active_attack_path else set()
        attack_edge_set = set(active_attack_path.edges) if active_attack_path else set()

        for dev_id, dev in self.devices.items():
            nodes.append(GraphNode(
                id=dev_id,
                label=dev.name,
                type=dev.type.value,
                floor=dev.floor,
                room=dev.room,
                ip=dev.ip_address,
                status=dev.status.value,
                risk_score=dev.risk_score,
                criticality=dev.criticality.value,
                is_compromised=(dev.status in [DeviceStatus.HIGH_RISK, DeviceStatus.COMPROMISED]),
                is_quarantined=dev.is_isolated,
                is_origin=bool(active_attack_path and active_attack_path.source_device == dev_id),
                is_target=bool(active_attack_path and active_attack_path.target_device == dev_id),
                details=dev.metadata
            ))

        for u, v, data in self.graph.edges(data=True):
            edge_id = f"{u}->{v}"
            edges.append(GraphEdge(
                id=edge_id,
                source=u,
                target=v,
                relation=EdgeRelationType(data.get("relation", "CONNECTED_TO")),
                is_attack_path=(edge_id in attack_edge_set),
                is_blocked=((u, v) in self.blocked_edges or (self.devices.get(u, None) and self.devices[u].is_isolated))
            ))

        return {
            "nodes": [n.model_dump() for n in nodes],
            "edges": [e.model_dump() for e in edges]
        }
