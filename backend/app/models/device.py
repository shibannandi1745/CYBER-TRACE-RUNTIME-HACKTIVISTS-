from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class DeviceStatus(str, Enum):
    NORMAL = "NORMAL"
    SUSPICIOUS = "SUSPICIOUS"
    HIGH_RISK = "HIGH_RISK"
    COMPROMISED = "COMPROMISED"
    QUARANTINED = "QUARANTINED"
    PROTECTED = "PROTECTED"


class DeviceCriticality(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class DeviceType(str, Enum):
    WORKSTATION = "WORKSTATION"
    LAPTOP = "LAPTOP"
    ROUTER = "ROUTER"
    SWITCH = "SWITCH"
    SERVER = "SERVER"
    DATABASE = "DATABASE"
    FILE_SERVER = "FILE_SERVER"
    CCTV = "CCTV"
    DOOR_CONTROLLER = "DOOR_CONTROLLER"
    BMS = "BMS"
    IOT_GATEWAY = "IOT_GATEWAY"
    SENSOR = "SENSOR"
    PRINTER = "PRINTER"
    ACCESS_POINT = "ACCESS_POINT"


class Device(BaseModel):
    id: str
    name: str
    type: DeviceType
    ip_address: str
    floor: int
    room: str
    network_segment: str  # e.g., "VLAN-10-GUEST", "VLAN-20-CORP", "VLAN-30-SERVERS", "VLAN-40-SEC-OT"
    criticality: DeviceCriticality
    status: DeviceStatus = DeviceStatus.NORMAL
    risk_score: int = Field(default=0, ge=0, le=100)
    connected_devices: List[str] = Field(default_factory=list)
    active_sessions: List[str] = Field(default_factory=list)
    blocked_connections: List[str] = Field(default_factory=list)
    is_isolated: bool = False
    is_telemetry_reporting: bool = True
    last_heartbeat: float = 0.0
    threat_reasons: List[str] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)


class Room(BaseModel):
    id: str
    name: str
    floor: int
    coordinates: Dict[str, float]  # x, y, width, height in 2D/isometric layout
    device_ids: List[str] = Field(default_factory=list)


class Floor(BaseModel):
    floor_number: int
    name: str
    description: str
    rooms: List[Room] = Field(default_factory=list)
    device_ids: List[str] = Field(default_factory=list)
