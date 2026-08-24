import time
from typing import Dict, List, Tuple, Optional
from ..models.device import Device, DeviceStatus
from ..models.graph import AttackPath
from ..graph.network_graph import NetworkGraphEngine
from ..models.audit import AuditActor, AuditAction


class ContainmentEngine:
    """
    Executes predefined, safe, and reversible containment actions in the simulated environment.
    Supports both Human-Analyst-Approved containment and Autonomous AI containment.
    """

    def __init__(self, devices: Dict[str, Device], graph_engine: NetworkGraphEngine):
        self.devices = devices
        self.graph_engine = graph_engine
        self.active_containments: List[Dict[str, any]] = []
        self.quarantined_devices: List[str] = []
        self.blocked_routes: List[Tuple[str, str]] = []
        self.revoked_sessions: List[str] = []
        self.protected_critical_assets: List[str] = []

    def execute_containment(
        self,
        actor: AuditActor,
        origin_device: str,
        target_devices: List[str],
        incident_id: str = "INC-1042"
    ) -> Dict[str, any]:
        """
        Executes standard 4-pillar containment:
          1. Quarantine origin device
          2. Block lateral pivot edges
          3. Revoke active adversary sessions
          4. Shield critical destination assets
        """
        now = time.time()
        actions_taken = []

        # 1. Isolate origin device
        if origin_device in self.devices:
            self.devices[origin_device].is_isolated = True
            self.devices[origin_device].status = DeviceStatus.QUARANTINED
            self.graph_engine.isolate_node(origin_device)
            self.quarantined_devices.append(origin_device)
            actions_taken.append(f"✓ Isolated device {origin_device} (Quarantine applied)")

        # 2. Block direct connected routes from origin
        if origin_device in self.devices:
            for neighbor in self.devices[origin_device].connected_devices:
                self.graph_engine.block_edge(origin_device, neighbor)
                self.blocked_routes.append((origin_device, neighbor))
                actions_taken.append(f"✓ Severed edge route {origin_device} ➔ {neighbor}")

        # 3. Revoke active sessions
        session_id = f"SESS-{origin_device}-992"
        self.revoked_sessions.append(session_id)
        if origin_device in self.devices:
            self.devices[origin_device].active_sessions.clear()
        actions_taken.append(f"✓ Revoked rogue session token ({session_id})")

        # 4. Shield critical target assets
        critical_targets = ["Database-302", "FileServer-303", "SmartDoor-403", "BackupVault-304"]
        for target in target_devices + critical_targets:
            if target in self.devices and target != origin_device:
                self.devices[target].status = DeviceStatus.PROTECTED
                self.protected_critical_assets.append(target)
                actions_taken.append(f"✓ Enforced critical asset firewall shield on {target}")

        # 5. Perform Post-Containment Verification
        is_contained, remaining_vulnerable = self.graph_engine.verify_containment(
            origin_device=origin_device,
            critical_targets=critical_targets
        )

        verification_status = "Attack propagation blocked." if is_contained else f"Containment incomplete — secondary path detected to {', '.join(remaining_vulnerable)}"

        containment_record = {
            "incident_id": incident_id,
            "timestamp": now,
            "actor": actor.value,
            "origin_device": origin_device,
            "actions": actions_taken,
            "is_contained": is_contained,
            "verification_message": verification_status,
            "is_reversible": True
        }
        self.active_containments.append(containment_record)
        return containment_record

    def rollback_containment(self, origin_device: str) -> Dict[str, any]:
        """
        Reverses containment actions on a device (Un-quarantine and unblock).
        """
        if origin_device in self.devices:
            self.devices[origin_device].is_isolated = False
            self.devices[origin_device].status = DeviceStatus.NORMAL
            self.devices[origin_device].risk_score = 0
            self.graph_engine.un_isolate_node(origin_device)
            if origin_device in self.quarantined_devices:
                self.quarantined_devices.remove(origin_device)

            for neighbor in self.devices[origin_device].connected_devices:
                self.graph_engine.unblock_edge(origin_device, neighbor)

        return {
            "status": "ROLLED_BACK",
            "device_id": origin_device,
            "message": f"Containment reversed for {origin_device}. Device returned to NORMAL state."
        }

    def reset(self):
        for dev_id in list(self.quarantined_devices):
            self.rollback_containment(dev_id)
        self.quarantined_devices.clear()
        self.blocked_routes.clear()
        self.revoked_sessions.clear()
        self.protected_critical_assets.clear()
        self.active_containments.clear()
