import time
import random
import uuid
from typing import List, Dict, Optional
from ..models.telemetry import TelemetryEvent, EventSeverity, EventType
from ..models.device import Device
from .scenarios import AttackStep, get_scenario_steps


class TelemetryGenerator:
    """
    Generates continuous baseline background telemetry representing normal building operations,
    and manages active attack scenarios.
    """

    def __init__(self, devices: Dict[str, Device]):
        self.devices = devices
        self.active_scenario_id: Optional[str] = None
        self.scenario_start_time: Optional[float] = None
        self.scenario_steps: List[AttackStep] = []
        self.scenario_step_index: int = 0
        self.is_scenario_running: bool = False
        self.event_counter: int = 1000

    def start_scenario(self, scenario_id: str):
        self.active_scenario_id = scenario_id
        self.scenario_steps = get_scenario_steps(scenario_id)
        self.scenario_start_time = time.time()
        self.scenario_step_index = 0
        self.is_scenario_running = True

    def stop_scenario(self):
        self.active_scenario_id = None
        self.scenario_start_time = None
        self.scenario_steps = []
        self.scenario_step_index = 0
        self.is_scenario_running = False

    def generate_tick_events(self) -> List[TelemetryEvent]:
        """
        Called once every simulation tick (e.g. every 1.0s).
        Returns a list of raw telemetry events (both baseline and attack events).
        """
        now = time.time()
        events: List[TelemetryEvent] = []

        # 1. Generate 1-3 Normal Baseline Traffic Events
        baseline_count = random.randint(1, 2)
        for _ in range(baseline_count):
            normal_event = self._generate_normal_event(now)
            if normal_event:
                events.append(normal_event)

        # 2. Check and emit scheduled Scenario Attack Events
        if self.is_scenario_running and self.scenario_steps:
            elapsed = now - self.scenario_start_time
            while (
                self.scenario_step_index < len(self.scenario_steps)
                and elapsed >= self.scenario_steps[self.scenario_step_index].delay_offset
            ):
                step = self.scenario_steps[self.scenario_step_index]
                attack_event = self._create_attack_event(step, now)
                events.append(attack_event)
                self.scenario_step_index += 1

            if self.scenario_step_index >= len(self.scenario_steps):
                # Scenario steps completed
                self.is_scenario_running = False

        return events

    def _generate_normal_event(self, now: float) -> Optional[TelemetryEvent]:
        self.event_counter += 1
        templates = [
            {
                "src": "Workstation-201",
                "dst": "AppServer-301",
                "user": "finance_analyst",
                "type": EventType.NETWORK_CONNECTION,
                "floor": 2,
                "room": "Finance Office",
                "segment": "VLAN-20-CORP",
                "sev": EventSeverity.INFO,
                "desc": "HTTPS REST API query to accounting service"
            },
            {
                "src": "Workstation-202",
                "dst": "Database-302",
                "user": "engineer_lead",
                "type": EventType.FILE_ACCESS,
                "floor": 2,
                "room": "Engineering Lab",
                "segment": "VLAN-20-CORP",
                "sev": EventSeverity.INFO,
                "desc": "Read access to CAD project blueprints"
            },
            {
                "src": "Workstation-203",
                "dst": "Printer-201",
                "user": "hr_manager",
                "type": EventType.NETWORK_CONNECTION,
                "floor": 2,
                "room": "HR & Print Center",
                "segment": "VLAN-20-CORP",
                "sev": EventSeverity.INFO,
                "desc": "IPP secure print job dispatched: onboarding_doc.pdf"
            },
            {
                "src": "TempSensor-202",
                "dst": "IoTGateway-201",
                "user": "IOT_TELEMETRY",
                "type": EventType.NETWORK_CONNECTION,
                "floor": 2,
                "room": "Engineering Lab",
                "segment": "VLAN-50-IOT",
                "sev": EventSeverity.INFO,
                "desc": "MQTT ambient sensor heartbeat: 22.4°C / 45% RH"
            },
            {
                "src": "Reception-PC-101",
                "dst": "EdgeRouter-101",
                "user": "reception_staff",
                "type": EventType.LOGIN_SUCCESS,
                "floor": 1,
                "room": "Lobby Reception",
                "segment": "VLAN-10-GUEST-PUB",
                "sev": EventSeverity.INFO,
                "desc": "Kerberos SSO session renewed for front desk badge station"
            },
            {
                "src": "AppServer-301",
                "dst": "Database-302",
                "user": "svc_app_backend",
                "type": EventType.NETWORK_CONNECTION,
                "floor": 3,
                "room": "App Server Cluster Rack A1",
                "segment": "VLAN-30-SERVERS",
                "sev": EventSeverity.INFO,
                "desc": "PostgreSQL connection pool keepalive probe"
            },
            {
                "src": "CCTV-101",
                "dst": "CCTV-Master-402",
                "user": "SYSTEM",
                "type": EventType.NETWORK_CONNECTION,
                "floor": 1,
                "room": "Main Entrance",
                "segment": "VLAN-40-SEC-OT",
                "sev": EventSeverity.INFO,
                "desc": "RTSP H.265 video keyframe sync"
            }
        ]

        t = random.choice(templates)
        formatted_time = time.strftime("%H:%M:%S", time.localtime(now))
        return TelemetryEvent(
            event_id=f"EVT-{self.event_counter}",
            timestamp=now,
            formatted_time=formatted_time,
            source_device=t["src"],
            destination_device=t["dst"],
            user=t["user"],
            event_type=t["type"],
            floor=t["floor"],
            room=t["room"],
            network_segment=t["segment"],
            severity=t["sev"],
            description=t["desc"],
            is_anomaly=False
        )

    def _create_attack_event(self, step: AttackStep, now: float) -> TelemetryEvent:
        self.event_counter += 1
        formatted_time = time.strftime("%H:%M:%S", time.localtime(now))
        inc_id = "INC-C04-001" if self.active_scenario_id == "coordinated_attack" else f"INC-{self.active_scenario_id.upper() if self.active_scenario_id else '1042'}"
        return TelemetryEvent(
            event_id=f"EVT-ATK-{self.event_counter}",
            timestamp=now,
            formatted_time=formatted_time,
            source_device=step.src_device,
            destination_device=step.dst_device,
            user=step.user,
            event_type=step.event_type,
            floor=step.floor,
            room=step.room,
            network_segment=step.segment,
            severity=step.severity,
            description=step.description,
            payload=step.payload,
            is_anomaly=True,
            correlation_id=self.active_scenario_id,
            attack_stage=step.attack_stage,
            scenario_step_index=step.step_index,
            incident_id=inc_id,
            evidence_source=step.evidence_source
        )

