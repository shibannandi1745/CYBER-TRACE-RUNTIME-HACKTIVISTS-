from typing import List, Dict, Any
from ..models.telemetry import TelemetryEvent, EventSeverity, EventType
import time


class AttackStep:
    def __init__(
        self,
        delay_offset: float,
        src_device: str,
        dst_device: str,
        user: str,
        event_type: EventType,
        floor: int,
        room: str,
        segment: str,
        severity: EventSeverity,
        description: str,
        payload: Dict[str, Any] = None,
        threat_weight: int = 15,
        attack_stage: str = "RECONNAISSANCE",
        step_index: int = 0,
        evidence_source: str = "SECURITY_EVENT_STORE"
    ):
        self.delay_offset = delay_offset
        self.src_device = src_device
        self.dst_device = dst_device
        self.user = user
        self.event_type = event_type
        self.floor = floor
        self.room = room
        self.segment = segment
        self.severity = severity
        self.description = description
        self.payload = payload or {}
        self.threat_weight = threat_weight
        self.attack_stage = attack_stage
        self.step_index = step_index
        self.evidence_source = evidence_source


def get_scenario_steps(scenario_id: str) -> List[AttackStep]:
    """
    Returns the timed sequence of events for a specific attack scenario.
    """
    if scenario_id == "coordinated_attack":
        return [
            # Stage 1: Initial Reconnaissance & Brute Force on Floor 1
            AttackStep(
                delay_offset=1.0,
                src_device="Laptop-102",
                dst_device="EdgeRouter-101",
                user="admin_temp",
                event_type=EventType.LOGIN_FAILED,
                floor=1,
                room="Visitor Lounge",
                segment="VLAN-10-GUEST-PUB",
                severity=EventSeverity.LOW,
                description="Repeated failed authentication attempts on concierge endpoint",
                threat_weight=10,
                attack_stage="RECONNAISSANCE",
                step_index=0,
                evidence_source="AUTHENTICATION_LOG"
            ),
            AttackStep(
                delay_offset=3.0,
                src_device="Laptop-102",
                dst_device="EdgeRouter-101",
                user="admin_temp",
                event_type=EventType.MULTIPLE_FAILED_LOGINS,
                floor=1,
                room="Visitor Lounge",
                segment="VLAN-10-GUEST-PUB",
                severity=EventSeverity.MEDIUM,
                description="Brute-force credential spraying detected from IP 10.1.10.25",
                threat_weight=15,
                attack_stage="RECONNAISSANCE",
                step_index=1,
                evidence_source="AUTHENTICATION_LOG"
            ),
            AttackStep(
                delay_offset=5.5,
                src_device="Laptop-102",
                dst_device="EdgeRouter-101",
                user="j_reception",
                event_type=EventType.UNUSUAL_LOGIN,
                floor=1,
                room="Visitor Lounge",
                segment="VLAN-10-GUEST-PUB",
                severity=EventSeverity.HIGH,
                description="Unusual successful authentication from untrusted subnet (Guest VLAN)",
                threat_weight=15,
                attack_stage="INITIAL_ACCESS",
                step_index=2,
                evidence_source="AUTHENTICATION_LOG"
            ),
            # Stage 2: Lateral Pivoting across Floors (Floor 1 -> Floor 3)
            AttackStep(
                delay_offset=8.0,
                src_device="Laptop-102",
                dst_device="EdgeRouter-101",
                user="j_reception",
                event_type=EventType.NEW_NETWORK_RELATIONSHIP,
                floor=1,
                room="Visitor Lounge",
                segment="VLAN-10-GUEST-PUB",
                severity=EventSeverity.HIGH,
                description="Unauthorized routing tunnel established across VLAN-10 and VLAN-01",
                threat_weight=15,
                attack_stage="LATERAL_MOVEMENT",
                step_index=3,
                evidence_source="ROUTER_LOG"
            ),
            AttackStep(
                delay_offset=11.0,
                src_device="EdgeRouter-101",
                dst_device="CoreSwitch-301",
                user="unknown_agent",
                event_type=EventType.LATERAL_MOVEMENT,
                floor=1,
                room="Telecom Closet 1",
                segment="VLAN-01-INFRA",
                severity=EventSeverity.HIGH,
                description="Cross-floor lateral packet injection targeting Datacenter core infrastructure",
                threat_weight=20,
                attack_stage="LATERAL_MOVEMENT",
                step_index=4,
                evidence_source="NETWORK_TELEMETRY"
            ),
            AttackStep(
                delay_offset=14.0,
                src_device="CoreSwitch-301",
                dst_device="AppServer-301",
                user="root_daemon",
                event_type=EventType.PRIVILEGE_ESCALATION,
                floor=3,
                room="Server Rack A1",
                segment="VLAN-30-SERVERS",
                severity=EventSeverity.CRITICAL,
                description="Root privilege escalation exploited via SSH tunnel on AppServer-301",
                threat_weight=25,
                attack_stage="PRIVILEGE_ESCALATION",
                step_index=5,
                evidence_source="SERVER_AUDIT"
            ),
            # Stage 3: Database & Sensitive File Exfiltration/Destruction
            AttackStep(
                delay_offset=17.0,
                src_device="AppServer-301",
                dst_device="Database-302",
                user="postgres_svc",
                event_type=EventType.SUSPICIOUS_DATA_TRANSFER,
                floor=3,
                room="Server Rack A2",
                segment="VLAN-30-SERVERS",
                severity=EventSeverity.HIGH,
                description="Mass query exfiltration of corporate credentials & database schemas",
                threat_weight=20,
                attack_stage="COLLECTION",
                step_index=6,
                evidence_source="DATABASE_AUDIT"
            ),
            AttackStep(
                delay_offset=20.0,
                src_device="AppServer-301",
                dst_device="FileServer-303",
                user="root_daemon",
                event_type=EventType.FILE_MODIFIED,
                floor=3,
                room="Server Rack B1",
                segment="VLAN-30-SERVERS",
                severity=EventSeverity.CRITICAL,
                description="Unauthorized overwrite detected in financial_report.xlsx",
                payload={"file": "financial_report.xlsx", "action": "corrupt"},
                threat_weight=20,
                attack_stage="IMPACT",
                step_index=7,
                evidence_source="SERVER_AUDIT"
            ),
            AttackStep(
                delay_offset=22.5,
                src_device="AppServer-301",
                dst_device="FileServer-303",
                user="root_daemon",
                event_type=EventType.FILE_DELETED,
                floor=3,
                room="Server Rack B1",
                segment="VLAN-30-SERVERS",
                severity=EventSeverity.CRITICAL,
                description="Malicious deletion of security_config.json detected",
                payload={"file": "security_config.json", "action": "delete"},
                threat_weight=20,
                attack_stage="IMPACT",
                step_index=8,
                evidence_source="SERVER_AUDIT"
            ),
            # Stage 4: Physical Security & OT Sabotage (Floor 4)
            AttackStep(
                delay_offset=25.0,
                src_device="AppServer-301",
                dst_device="SmartDoor-403",
                user="root_daemon",
                event_type=EventType.DOOR_UNLOCKED_UNAUTHORIZED,
                floor=4,
                room="Executive Access Air-Lock",
                segment="VLAN-40-SEC-OT",
                severity=EventSeverity.CRITICAL,
                description="Unauthorized physical door unlock command sent to Executive Smart Lock",
                threat_weight=20,
                attack_stage="IMPACT",
                step_index=9,
                evidence_source="ENDPOINT_TELEMETRY"
            ),
            AttackStep(
                delay_offset=28.0,
                src_device="CCTV-101",
                dst_device="CCTV-Master-402",
                user="SYSTEM",
                event_type=EventType.CCTV_DISCONNECT,
                floor=1,
                room="Main Entrance",
                segment="VLAN-40-SEC-OT",
                severity=EventSeverity.HIGH,
                description="Main Entrance CCTV video telemetry stream abruptly disconnected",
                threat_weight=15,
                attack_stage="DEFENSE_EVASION",
                step_index=10,
                evidence_source="NETWORK_TELEMETRY"
            )
        ]

    elif scenario_id == "ransomware_wave":
        return [
            AttackStep(
                delay_offset=1.0,
                src_device="Workstation-201",
                dst_device="CoreSwitch-201",
                user="finance_analyst",
                event_type=EventType.UNUSUAL_LOGIN,
                floor=2,
                room="Finance Office",
                segment="VLAN-20-CORP",
                severity=EventSeverity.MEDIUM,
                description="Phishing payload executed via macro attachment on Workstation-201",
                threat_weight=20,
                attack_stage="INITIAL_ACCESS",
                step_index=0,
                evidence_source="ENDPOINT_TELEMETRY"
            ),
            AttackStep(
                delay_offset=3.5,
                src_device="Workstation-201",
                dst_device="FileServer-303",
                user="finance_analyst",
                event_type=EventType.RANSOMWARE_ENCRYPTION,
                floor=3,
                room="Server Rack B1",
                segment="VLAN-30-SERVERS",
                severity=EventSeverity.CRITICAL,
                description="Mass file encryption sequence initiated on network share (employee_records.csv)",
                payload={"file": "employee_records.csv", "action": "corrupt"},
                threat_weight=35,
                attack_stage="IMPACT",
                step_index=1,
                evidence_source="SERVER_AUDIT"
            ),
            AttackStep(
                delay_offset=6.0,
                src_device="Workstation-201",
                dst_device="FileServer-303",
                user="finance_analyst",
                event_type=EventType.FILE_CORRUPTED,
                floor=3,
                room="Server Rack B1",
                segment="VLAN-30-SERVERS",
                severity=EventSeverity.CRITICAL,
                description="Ransomware encryption spreading to project_data.json",
                payload={"file": "project_data.json", "action": "corrupt"},
                threat_weight=30,
                attack_stage="IMPACT",
                step_index=2,
                evidence_source="SERVER_AUDIT"
            )
        ]

    elif scenario_id == "ot_sabotage":
        return [
            AttackStep(
                delay_offset=1.0,
                src_device="IoTGateway-201",
                dst_device="BMS-Controller-404",
                user="mqtt_service",
                event_type=EventType.BEACONING,
                floor=2,
                room="Telecom & IoT Hub",
                segment="VLAN-50-IOT",
                severity=EventSeverity.HIGH,
                description="Firmware backdoor beaconing detected from IoT Gateway",
                threat_weight=25,
                attack_stage="INITIAL_ACCESS",
                step_index=0,
                evidence_source="NETWORK_TELEMETRY"
            ),
            AttackStep(
                delay_offset=4.0,
                src_device="BMS-Controller-404",
                dst_device="IndustrialHVAC-405",
                user="admin_bms",
                event_type=EventType.BMS_HVAC_SETPOINT_CHANGE,
                floor=4,
                room="HVAC Datacenter Chiller Plant",
                segment="VLAN-40-SEC-OT",
                severity=EventSeverity.CRITICAL,
                description="Dangerous chiller setpoint override: Datacenter cooling shut down command",
                threat_weight=35,
                attack_stage="IMPACT",
                step_index=1,
                evidence_source="ENDPOINT_TELEMETRY"
            )
        ]

    elif scenario_id == "stealth_imperfect":
        return [
            AttackStep(
                delay_offset=1.0,
                src_device="Workstation-202",
                dst_device="CoreSwitch-201",
                user="engineer_1",
                event_type=EventType.PORT_SCAN,
                floor=2,
                room="Engineering Lab",
                segment="VLAN-20-CORP",
                severity=EventSeverity.LOW,
                description="Low and slow SYN scan originating from Engineering desktop",
                threat_weight=15,
                attack_stage="RECONNAISSANCE",
                step_index=0,
                evidence_source="NETWORK_TELEMETRY"
            ),
            AttackStep(
                delay_offset=5.0,
                src_device="Workstation-202",
                dst_device="Database-302",
                user="engineer_1",
                event_type=EventType.TELEMETRY_UNAVAILABLE,
                floor=3,
                room="Enterprise Database Rack A2",
                segment="VLAN-30-SERVERS",
                severity=EventSeverity.MEDIUM,
                description="Intermediate telemetry switch lost reporting during lateral probe",
                threat_weight=20,
                attack_stage="DEFENSE_EVASION",
                step_index=1,
                evidence_source="ROUTER_LOG"
            )
        ]

    return []

