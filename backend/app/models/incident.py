from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
import time


class IncidentSeverity(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class IncidentStatus(str, Enum):
    ACTIVE = "ACTIVE"
    CONTAINED = "CONTAINED"
    RESOLVED = "RESOLVED"
    CLOSED = "CLOSED"


class ContainmentMode(str, Enum):
    MANUAL_ANALYST = "MANUAL_ANALYST"
    AUTONOMOUS_AI = "AUTONOMOUS_AI"
    HYBRID = "HYBRID"
    UNCONTAINED = "UNCONTAINED"


class IncidentReport(BaseModel):
    incident_id: str
    title: str
    severity: IncidentSeverity = IncidentSeverity.CRITICAL
    threat_score: int
    confidence_score: float
    status: IncidentStatus = IncidentStatus.ACTIVE
    start_time: float = Field(default_factory=time.time)
    end_time: Optional[float] = None
    affected_floors: List[int] = Field(default_factory=list)
    affected_devices: List[str] = Field(default_factory=list)
    attack_path_summary: str = ""
    reconstructed_path: List[str] = Field(default_factory=list)
    attack_techniques: List[str] = Field(default_factory=list)
    data_impact_count: int = 0
    affected_files: List[str] = Field(default_factory=list)
    containment_mode: ContainmentMode = ContainmentMode.UNCONTAINED
    containment_actions: List[str] = Field(default_factory=list)
    containment_verified: bool = False
    recovery_status: str = "Pending"
    recovered_files_count: int = 0
    unrecoverable_files_count: int = 0
    events_timeline: List[Dict[str, Any]] = Field(default_factory=list)
    executive_summary: str = ""
