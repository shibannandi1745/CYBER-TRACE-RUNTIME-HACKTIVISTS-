import time
from typing import List, Dict, Set, Optional, Tuple
from ..models.telemetry import TelemetryEvent, EventSeverity, EventType
from ..models.device import Device, DeviceStatus, DeviceCriticality


class CorrelatedThreatIncident:
    def __init__(self, incident_id: str, origin_device: str):
        self.incident_id = incident_id
        self.origin_device = origin_device
        self.target_devices: Set[str] = set()
        self.events: List[TelemetryEvent] = []
        self.floors_traversed: Set[int] = set()
        self.segments_crossed: Set[str] = set()
        self.observed_hops: List[str] = [origin_device]
        self.missing_hops: List[str] = []
        self.techniques_detected: Set[str] = set()
        self.data_destruction_detected: bool = False
        self.physical_sabotage_detected: bool = False
        self.last_updated: float = time.time()


class CorrelationEngine:
    """
    Correlates continuous telemetry streams across:
      - Time (burst velocity and event sequencing)
      - Space (spatial traversal across physical building floors)
      - Network (cross-VLAN and routing relationships)
    """

    def __init__(self, devices: Dict[str, Device]):
        self.devices = devices
        self.active_incidents: Dict[str, CorrelatedThreatIncident] = {}
        self.recent_events_window: List[TelemetryEvent] = []

    def ingest_events(self, events: List[TelemetryEvent]) -> Optional[CorrelatedThreatIncident]:
        """
        Processes a batch of deduplicated telemetry events and correlates threats.
        Returns the primary active threat incident if suspicious activity is present.
        """
        now = time.time()
        # Keep sliding window of last 120 seconds
        self.recent_events_window.extend(events)
        self.recent_events_window = [e for e in self.recent_events_window if (now - e.timestamp) <= 120.0]

        active_incident: Optional[CorrelatedThreatIncident] = None

        for event in events:
            if not event.is_anomaly and event.severity in [EventSeverity.INFO, EventSeverity.LOW]:
                continue

            src = event.source_device
            dst = event.destination_device

            # Determine or retrieve active incident
            incident_key = "INC-1042"
            if incident_key not in self.active_incidents:
                self.active_incidents[incident_key] = CorrelatedThreatIncident(
                    incident_id=incident_key,
                    origin_device=src
                )

            inc = self.active_incidents[incident_key]
            inc.events.append(event)
            inc.last_updated = now

            if event.floor:
                inc.floors_traversed.add(event.floor)
            if event.network_segment:
                inc.segments_crossed.add(event.network_segment)

            if dst:
                inc.target_devices.add(dst)
                if dst not in inc.observed_hops:
                    inc.observed_hops.append(dst)

            # Mark devices as suspicious or high risk
            if src in self.devices and not self.devices[src].is_isolated:
                if event.severity == EventSeverity.CRITICAL:
                    self.devices[src].status = DeviceStatus.HIGH_RISK
                elif self.devices[src].status == DeviceStatus.NORMAL:
                    self.devices[src].status = DeviceStatus.SUSPICIOUS

            if dst and dst in self.devices and not self.devices[dst].is_isolated:
                if event.severity == EventSeverity.CRITICAL:
                    self.devices[dst].status = DeviceStatus.COMPROMISED
                elif event.severity == EventSeverity.HIGH and self.devices[dst].status == DeviceStatus.NORMAL:
                    self.devices[dst].status = DeviceStatus.SUSPICIOUS

            # Detect special technique categories
            if event.event_type in [EventType.LOGIN_FAILED, EventType.MULTIPLE_FAILED_LOGINS, EventType.UNUSUAL_LOGIN]:
                inc.techniques_detected.add("Authentication Anomaly / Credential Spray")
            elif event.event_type in [EventType.NEW_NETWORK_RELATIONSHIP, EventType.LATERAL_MOVEMENT, EventType.PORT_SCAN]:
                inc.techniques_detected.add("Lateral Movement / Unauthorized Route")
            elif event.event_type == EventType.PRIVILEGE_ESCALATION:
                inc.techniques_detected.add("Privilege Escalation")
            elif event.event_type in [EventType.FILE_MODIFIED, EventType.FILE_DELETED, EventType.FILE_CORRUPTED, EventType.RANSOMWARE_ENCRYPTION]:
                inc.data_destruction_detected = True
                inc.techniques_detected.add("Data Destruction / Ransomware Impact")
            elif event.event_type in [EventType.DOOR_UNLOCKED_UNAUTHORIZED, EventType.DOOR_CONTROLLER_CMD, EventType.BMS_HVAC_SETPOINT_CHANGE, EventType.CCTV_DISCONNECT]:
                inc.physical_sabotage_detected = True
                inc.techniques_detected.add("Physical Security / OT Sabotage")
            elif event.event_type == EventType.TELEMETRY_UNAVAILABLE:
                inc.missing_hops.append(src)

            active_incident = inc

        # If no new anomaly in this tick, but an active incident exists within window, return it
        if not active_incident and "INC-1042" in self.active_incidents:
            inc = self.active_incidents["INC-1042"]
            if (now - inc.last_updated) <= 120.0:
                active_incident = inc

        return active_incident

    def reset(self):
        self.active_incidents.clear()
        self.recent_events_window.clear()
