import time
import asyncio
from typing import Dict, List, Optional, Any, Tuple
from .models.device import Device, DeviceStatus, Floor
from .models.telemetry import TelemetryEvent, EventSeverity, EventType
from .models.graph import AttackPath
from .models.threat import ThreatScore, ThreatSeverity
from .models.alert import AlertItem, EscalationLevel, AlertStatus, AnalystAvailability
from .models.incident import IncidentReport, IncidentSeverity, IncidentStatus, ContainmentMode
from .models.audit import AuditActor, AuditAction
from .simulation.building_state import initialize_smart_building
from .simulation.telemetry_generator import TelemetryGenerator
from .simulation.imperfection_engine import ImperfectionEngine
from .graph.network_graph import NetworkGraphEngine
from .detection.correlation_engine import CorrelationEngine, CorrelatedThreatIncident
from .scoring.threat_scorer import ThreatScorer
from .alerts.escalation_manager import EscalationManager
from .response.containment_engine import ContainmentEngine
from .integrity.file_integrity import FileIntegrityEngine
from .audit.audit_logger import AuditLogger
from .db.database import (
    init_db,
    save_telemetry_event,
    save_telemetry_events_batch,
    save_incident,
    save_audit_log,
    save_alert,
    save_file_state,
    record_file_restoration,
    get_database_stats,
)


class CyberTraceEngine:
    """
    Master Autonomous Cyber Defense & Simulation Orchestrator.
    Executes the continuous monitoring, correlation, threat scoring,
    3-stage escalation, safe recovery loop, and SQLite database persistence.
    """

    def __init__(self):
        # 0. Initialize SQLite Database
        init_db()

        # 1. State & Devices
        self.devices, self.floors = initialize_smart_building()
        
        # 2. Subsystems
        self.telemetry_gen = TelemetryGenerator(self.devices)
        self.imperfection_engine = ImperfectionEngine()
        self.graph_engine = NetworkGraphEngine(self.devices)
        self.correlation_engine = CorrelationEngine(self.devices)
        self.threat_scorer = ThreatScorer(self.devices)
        self.containment_engine = ContainmentEngine(self.devices, self.graph_engine)
        self.file_integrity_engine = FileIntegrityEngine()
        self.audit_logger = AuditLogger()

        # Persist initial file states to DB
        for f in self.file_integrity_engine.files.values():
            save_file_state(f)

        # 3. Escalation Manager wired with autonomous callback
        self.escalation_manager = EscalationManager(
            on_autonomous_containment_trigger=self._handle_autonomous_containment_trigger
        )

        # 4. Global Simulation Properties
        self.is_running = True
        self.is_paused = False
        self.sim_speed = 1.0  # 1.0x, 2.0x, 0.5x
        self.active_attack_path: Optional[AttackPath] = None
        self.current_threat_score: ThreatScore = self.threat_scorer.calculate_score(None)
        self.telemetry_feed: List[TelemetryEvent] = []
        self.incident_event_history: List[TelemetryEvent] = []
        self.active_incident: Optional[IncidentReport] = None
        self.total_duplicates_dropped = 0


    def _handle_autonomous_containment_trigger(self, incident_id: str, source_device: str, target_devices: List[str]):
        """Callback when Analyst fails to respond after 3 escalation alerts."""
        result = self.containment_engine.execute_containment(
            actor=AuditActor.AI,
            origin_device=source_device,
            target_devices=target_devices,
            incident_id=incident_id
        )

        entry = self.audit_logger.record_entry(
            actor=AuditActor.AI,
            action=AuditAction.APPROVE_CONTAINMENT,
            target=source_device,
            incident_id=incident_id,
            reason="Analyst unavailable after 3 escalating alerts — Autonomous Reversible Containment activated",
            result="SUCCESS",
            details=result
        )
        save_audit_log(entry)

        # Re-evaluate attack path
        if self.active_attack_path:
            self.active_attack_path = self.graph_engine.reconstruct_attack_path(
                origin_device=self.active_attack_path.source_device,
                target_device=self.active_attack_path.target_device,
                observed_hops=self.active_attack_path.nodes,
                missing_hops=self.active_attack_path.missing_hops
            )

        if self.active_incident:
            self.active_incident.containment_mode = ContainmentMode.AUTONOMOUS_AI
            self.active_incident.containment_actions = result["actions"]
            self.active_incident.containment_verified = result["is_contained"]
            self.active_incident.status = IncidentStatus.CONTAINED
            save_incident(self.active_incident)

    def tick(self) -> Dict[str, Any]:
        """
        Main simulation tick loop (invoked every interval).
        """
        if self.is_paused:
            return self.get_full_state()

        # 1. Generate Raw Telemetry (Baseline + Active Scenario Steps)
        raw_events = self.telemetry_gen.generate_tick_events()

        # Check for simulated file tamper payloads in telemetry events
        for ev in raw_events:
            if ev.payload and "file" in ev.payload:
                f_name = ev.payload["file"]
                f_act = ev.payload.get("action", "corrupt")
                self.file_integrity_engine.simulate_tampering(
                    filename=f_name,
                    action=f_act,
                    user=ev.user or "adversary",
                    device=ev.source_device,
                    incident_id="INC-1042"
                )
                if f_name in self.file_integrity_engine.files:
                    save_file_state(self.file_integrity_engine.files[f_name])

        # 2. Simulate Imperfections (Packet Loss, Delays, Duplication)
        transmitted_events = self.imperfection_engine.simulate_transmission(raw_events)

        # 3. Resilient Ingestion & Deduplication
        deduped_events, dups_count = self.imperfection_engine.process_and_deduplicate(transmitted_events)
        self.total_duplicates_dropped += dups_count

        # Persist deduplicated events to SQLite Database
        if deduped_events:
            save_telemetry_events_batch(deduped_events)

        # 4. Stream into Telemetry Feed (keep last 200 events) and record Incident Event History
        new_incident_events: List[TelemetryEvent] = []
        for ev in deduped_events:
            self.telemetry_feed.insert(0, ev)
            if ev.incident_id or ev.is_anomaly:
                self.incident_event_history.append(ev)
                new_incident_events.append(ev)

        self.telemetry_feed = self.telemetry_feed[:200]

        # 5. Correlate Events
        correlated_inc = self.correlation_engine.ingest_events(deduped_events)

        # 6. Calculate Explainable Threat Score
        self.current_threat_score = self.threat_scorer.calculate_score(correlated_inc)

        # Attach threat score snapshot to new incident events
        for ev in new_incident_events:
            ev.threat_score_snapshot = self.current_threat_score.overall_score

        # 7. Reconstruct Attack Path if suspicious activity exists
        if correlated_inc and correlated_inc.events:
            primary_target = list(correlated_inc.target_devices)[-1] if correlated_inc.target_devices else "Database-302"
            self.active_attack_path = self.graph_engine.reconstruct_attack_path(
                origin_device=correlated_inc.origin_device,
                target_device=primary_target,
                observed_hops=correlated_inc.observed_hops,
                missing_hops=correlated_inc.missing_hops,
                supporting_events=correlated_inc.events
            )

            # 8. Manage 3-Stage Alert Escalation
            alert_item = self.escalation_manager.evaluate_threat(
                incident_id=correlated_inc.incident_id,
                threat_score=self.current_threat_score,
                source_device=correlated_inc.origin_device,
                target_devices=list(correlated_inc.target_devices),
                attack_path_summary=" ➔ ".join(self.active_attack_path.nodes)
            )
            if alert_item:
                save_alert(alert_item)

            # 9. Maintain Incident Dossier & persist to SQLite
            self._update_incident_dossier(correlated_inc)

        return self.get_full_state()


    def _update_incident_dossier(self, inc: CorrelatedThreatIncident):
        now = time.time()
        impacted_files = [f.filename for f in self.file_integrity_engine.files.values() if f.status != "HEALTHY"]

        if not self.active_incident:
            self.active_incident = IncidentReport(
                incident_id=inc.incident_id,
                title="Coordinated Cyber-Physical Intrusion & Data Tampering",
                severity=IncidentSeverity(self.current_threat_score.severity.value),
                threat_score=self.current_threat_score.overall_score,
                confidence_score=self.current_threat_score.confidence,
                status=IncidentStatus.ACTIVE,
                start_time=now,
                affected_floors=sorted(list(inc.floors_traversed)),
                affected_devices=list(set([inc.origin_device] + list(inc.target_devices))),
                attack_path_summary=" ➔ ".join(self.active_attack_path.nodes) if self.active_attack_path else "",
                reconstructed_path=self.active_attack_path.nodes if self.active_attack_path else [],
                attack_techniques=list(inc.techniques_detected),
                data_impact_count=len(impacted_files),
                affected_files=impacted_files,
                executive_summary="Multi-stage unauthorized traversal originating from Floor 1 public edge, pivoting across enterprise network segments into Datacenter servers and Floor 4 smart access controllers."
            )
        else:
            self.active_incident.threat_score = self.current_threat_score.overall_score
            self.active_incident.severity = IncidentSeverity(self.current_threat_score.severity.value)
            self.active_incident.confidence_score = self.current_threat_score.confidence
            self.active_incident.affected_floors = sorted(list(inc.floors_traversed))
            self.active_incident.affected_devices = list(set([inc.origin_device] + list(inc.target_devices)))
            self.active_incident.attack_path_summary = " ➔ ".join(self.active_attack_path.nodes) if self.active_attack_path else ""
            self.active_incident.reconstructed_path = self.active_attack_path.nodes if self.active_attack_path else []
            self.active_incident.attack_techniques = list(inc.techniques_detected)
            self.active_incident.data_impact_count = len(impacted_files)
            self.active_incident.affected_files = impacted_files

        # Persist incident to SQLite
        save_incident(self.active_incident)

    # ------------------ ANALYST ACTIONS ------------------

    def silence_siren(self) -> Optional[AlertItem]:
        alert = self.escalation_manager.silence_siren()
        if alert:
            save_alert(alert)
        return alert

    def analyst_acknowledge(self, analyst_name: str = "SOC_Analyst") -> AlertItem:
        alert = self.escalation_manager.analyst_acknowledge(analyst_name)
        if alert:
            entry = self.audit_logger.record_entry(
                actor=AuditActor.ANALYST,
                action=AuditAction.ACKNOWLEDGE_ALERT,
                target=alert.source_device,
                incident_id=alert.incident_id,
                reason="Analyst acknowledged alert — autonomous timeout countdown paused",
                result="SUCCESS"
            )
            save_audit_log(entry)
            save_alert(alert)
        return alert

    def analyst_approve_containment(self, analyst_name: str = "SOC_Analyst") -> Dict[str, Any]:
        alert = self.escalation_manager.analyst_approve_containment(analyst_name)
        origin = alert.source_device if alert else "Laptop-102"
        targets = alert.target_devices if alert else ["Database-302", "FileServer-303"]
        inc_id = alert.incident_id if alert else "INC-1042"

        result = self.containment_engine.execute_containment(
            actor=AuditActor.ANALYST,
            origin_device=origin,
            target_devices=targets,
            incident_id=inc_id
        )

        entry = self.audit_logger.record_entry(
            actor=AuditActor.ANALYST,
            action=AuditAction.APPROVE_CONTAINMENT,
            target=origin,
            incident_id=inc_id,
            reason=f"Analyst {analyst_name} manually approved containment plan",
            result="SUCCESS",
            details=result
        )
        save_audit_log(entry)
        if alert:
            save_alert(alert)

        if self.active_attack_path:
            self.active_attack_path = self.graph_engine.reconstruct_attack_path(
                origin_device=self.active_attack_path.source_device,
                target_device=self.active_attack_path.target_device,
                observed_hops=self.active_attack_path.nodes,
                missing_hops=self.active_attack_path.missing_hops
            )

        if self.active_incident:
            self.active_incident.containment_mode = ContainmentMode.MANUAL_ANALYST
            self.active_incident.containment_actions = result["actions"]
            self.active_incident.containment_verified = result["is_contained"]
            self.active_incident.status = IncidentStatus.CONTAINED
            save_incident(self.active_incident)

        return result

    def analyst_reject_alert(self, reason: str = "False Positive", analyst_name: str = "SOC_Analyst"):
        self.escalation_manager.analyst_reject(reason, analyst_name)
        entry = self.audit_logger.record_entry(
            actor=AuditActor.ANALYST,
            action=AuditAction.REJECT_ALERT,
            target="Active_Alert",
            reason=f"Analyst marked alert as {reason}",
            result="DISMISSED"
        )
        save_audit_log(entry)

    def isolate_device(self, device_id: str, actor: AuditActor = AuditActor.ANALYST) -> Dict[str, Any]:
        self.containment_engine.execute_containment(
            actor=actor,
            origin_device=device_id,
            target_devices=[],
            incident_id="INC-1042"
        )
        entry = self.audit_logger.record_entry(
            actor=actor,
            action=AuditAction.ISOLATE_DEVICE,
            target=device_id,
            reason="Manual device isolation requested",
            result="SUCCESS"
        )
        save_audit_log(entry)
        return {"status": "ISOLATED", "device_id": device_id}

    def rollback_containment(self, device_id: str, actor: AuditActor = AuditActor.ANALYST) -> Dict[str, Any]:
        res = self.containment_engine.rollback_containment(device_id)
        entry = self.audit_logger.record_entry(
            actor=actor,
            action=AuditAction.UNISOLATE_DEVICE,
            target=device_id,
            reason="Reversible containment rolled back by operator",
            result="SUCCESS"
        )
        save_audit_log(entry)
        return res

    def restore_file(self, filename: str, target_version: Optional[int] = None) -> Dict[str, Any]:
        res = self.file_integrity_engine.restore_file(filename, target_version)
        if res.get("success", False):
            entry = self.audit_logger.record_entry(
                actor=AuditActor.ANALYST,
                action=AuditAction.RESTORE_FILE,
                target=filename,
                reason=f"Restored from version {res.get('restored_from_version')} snapshot",
                result="SUCCESS",
                details=res
            )
            save_audit_log(entry)
            record_file_restoration(
                filename=filename,
                restored_version=res.get("restored_from_version", 1),
                sha256_hash=res.get("known_good_hash", ""),
                status="RESTORED",
                performed_by="ANALYST"
            )
            if filename in self.file_integrity_engine.files:
                save_file_state(self.file_integrity_engine.files[filename])

            if self.active_incident:
                self.active_incident.recovered_files_count += 1
                save_incident(self.active_incident)
        return res

    def set_analyst_availability(self, status: AnalystAvailability):
        self.escalation_manager.set_analyst_availability(status)
        entry = self.audit_logger.record_entry(
            actor=AuditActor.ANALYST,
            action=AuditAction.CHANGE_AVAILABILITY,
            target=f"Analyst Status -> {status.value}",
            reason=f"Analyst availability updated to {status.value}",
            result="SUCCESS"
        )
        save_audit_log(entry)

    def trigger_scenario(self, scenario_id: str):
        self.reset_simulation()
        self.telemetry_gen.start_scenario(scenario_id)
        entry = self.audit_logger.record_entry(
            actor=AuditActor.SYSTEM,
            action=AuditAction.TRIGGER_SCENARIO,
            target=scenario_id,
            reason=f"Demonstration attack scenario initiated: {scenario_id}",
            result="RUNNING"
        )
        save_audit_log(entry)

    def reset_simulation(self):
        self.devices, self.floors = initialize_smart_building()
        self.telemetry_gen = TelemetryGenerator(self.devices)
        self.graph_engine = NetworkGraphEngine(self.devices)
        self.correlation_engine.reset()
        self.containment_engine = ContainmentEngine(self.devices, self.graph_engine)
        self.file_integrity_engine.reset()
        self.escalation_manager.reset()
        self.active_attack_path = None
        self.active_incident = None
        self.current_threat_score = self.threat_scorer.calculate_score(None)
        self.telemetry_feed.clear()
        self.incident_event_history.clear()
        self.total_duplicates_dropped = 0
        entry = self.audit_logger.record_entry(
            actor=AuditActor.SYSTEM,
            action=AuditAction.RESET_SIMULATION,
            target="Building_Twin",
            reason="Simulation state reset to baseline",
            result="SUCCESS"
        )
        save_audit_log(entry)
        for f in self.file_integrity_engine.files.values():
            save_file_state(f)

    def get_full_state(self) -> Dict[str, Any]:
        """Returns comprehensive state for frontend dashboard."""
        missing_map = self.imperfection_engine.get_missing_telemetry_status(list(self.devices.keys()))
        graph_view = self.graph_engine.export_graph_view(self.active_attack_path)
        db_stats = get_database_stats()

        return {
            "system_status": {
                "ai_defense_engine": "ACTIVE",
                "analyst_availability": self.escalation_manager.analyst_availability.value,
                "is_paused": self.is_paused,
                "sim_speed": self.sim_speed,
                "active_scenario": self.telemetry_gen.active_scenario_id,
                "is_scenario_running": self.telemetry_gen.is_scenario_running,
                "duplicates_dropped": self.total_duplicates_dropped,
                "database_status": db_stats["status"],
                "database_records": db_stats["total_records"]
            },
            "threat_score": self.current_threat_score.model_dump(),
            "active_alert": self.escalation_manager.active_alert.model_dump() if self.escalation_manager.active_alert else None,
            "active_incident": self.active_incident.model_dump() if self.active_incident else None,
            "attack_path": self.active_attack_path.model_dump() if self.active_attack_path else None,
            "devices": {k: d.model_dump() for k, d in self.devices.items()},
            "floors": [f.model_dump() for f in self.floors],
            "graph": graph_view,
            "telemetry_feed": [t.model_dump() for t in self.telemetry_feed[:80]],
            "incident_event_history": [e.model_dump() for e in self.incident_event_history],
            "file_integrity": {
                "files": {k: f.model_dump() for k, f in self.file_integrity_engine.files.items()},
                "stats": self.file_integrity_engine.get_summary_stats(),
                "timeline": self.file_integrity_engine.data_incident_timeline[-20:]
            },
            "containment": {
                "quarantined_devices": self.containment_engine.quarantined_devices,
                "blocked_routes": [f"{u}->{v}" for u, v in self.containment_engine.blocked_routes],
                "protected_assets": self.containment_engine.protected_critical_assets,
                "history": self.containment_engine.active_containments
            },
            "audit_logs": [l.model_dump() for l in self.audit_logger.get_logs(limit=40)],
            "missing_telemetry": missing_map,
            "database": db_stats
        }

