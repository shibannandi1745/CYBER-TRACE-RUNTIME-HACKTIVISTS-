from enum import Enum
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field
import time


class EventSeverity(str, Enum):
    INFO = "INFO"
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class EventType(str, Enum):
    # Authentication
    LOGIN_SUCCESS = "LOGIN_SUCCESS"
    LOGIN_FAILED = "LOGIN_FAILED"
    MULTIPLE_FAILED_LOGINS = "MULTIPLE_FAILED_LOGINS"
    UNUSUAL_LOGIN = "UNUSUAL_LOGIN"
    NEW_DEVICE_AUTH = "NEW_DEVICE_AUTH"
    SESSION_CREATED = "SESSION_CREATED"
    SESSION_TERMINATED = "SESSION_TERMINATED"
    PRIVILEGE_ESCALATION = "PRIVILEGE_ESCALATION"

    # Network
    NETWORK_CONNECTION = "NETWORK_CONNECTION"
    NEW_NETWORK_RELATIONSHIP = "NEW_NETWORK_RELATIONSHIP"
    PORT_SCAN = "PORT_SCAN"
    LATERAL_MOVEMENT = "LATERAL_MOVEMENT"
    SUSPICIOUS_DATA_TRANSFER = "SUSPICIOUS_DATA_TRANSFER"
    BEACONING = "BEACONING"

    # File / Data
    FILE_ACCESS = "FILE_ACCESS"
    FILE_MODIFIED = "FILE_MODIFIED"
    FILE_DELETED = "FILE_DELETED"
    FILE_CORRUPTED = "FILE_CORRUPTED"
    RANSOMWARE_ENCRYPTION = "RANSOMWARE_ENCRYPTION"

    # Physical / Cyber-Physical / OT
    PHYSICAL_ACCESS_CMD = "PHYSICAL_ACCESS_CMD"
    DOOR_CONTROLLER_CMD = "DOOR_CONTROLLER_CMD"
    DOOR_UNLOCKED_UNAUTHORIZED = "DOOR_UNLOCKED_UNAUTHORIZED"
    CCTV_DISCONNECT = "CCTV_DISCONNECT"
    BMS_HVAC_SETPOINT_CHANGE = "BMS_HVAC_SETPOINT_CHANGE"
    DEVICE_OFFLINE = "DEVICE_OFFLINE"

    # Telemetry Imperfection
    TELEMETRY_UNAVAILABLE = "TELEMETRY_UNAVAILABLE"


class TelemetryEvent(BaseModel):
    event_id: str
    timestamp: float = Field(default_factory=time.time)
    formatted_time: Optional[str] = None
    source_device: str
    destination_device: Optional[str] = None
    user: Optional[str] = "SYSTEM"
    event_type: EventType
    floor: int
    room: Optional[str] = None
    network_segment: Optional[str] = None
    severity: EventSeverity = EventSeverity.INFO
    description: str
    payload: Dict[str, Any] = Field(default_factory=dict)
    
    # Imperfection simulation markers
    is_duplicate: bool = False
    is_delayed: bool = False
    original_timestamp: Optional[float] = None
    delay_seconds: float = 0.0
    is_anomaly: bool = False
    correlation_id: Optional[str] = None

    # Forensic and Attack Lifecycle Metadata
    attack_stage: Optional[str] = None
    scenario_step_index: Optional[int] = None
    incident_id: Optional[str] = None
    evidence_source: Optional[str] = None
    threat_score_snapshot: Optional[int] = None

