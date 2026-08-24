from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
import time


class EscalationLevel(int, Enum):
    LEVEL_1 = 1  # Warning / Initial Notice
    LEVEL_2 = 2  # Escalated Security Alert
    LEVEL_3 = 3  # Critical Alert / Autonomous Countdown


class AlertStatus(str, Enum):
    PENDING = "PENDING"
    ACKNOWLEDGED = "ACKNOWLEDGED"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    ESCALATED = "ESCALATED"
    AUTONOMOUS_TRIGGERED = "AUTONOMOUS_TRIGGERED"
    RESOLVED = "RESOLVED"


class AnalystAvailability(str, Enum):
    AVAILABLE = "AVAILABLE"
    BUSY = "BUSY"
    AWAY = "AWAY"
    OFFLINE = "OFFLINE"


class AlertItem(BaseModel):
    alert_id: str
    incident_id: str
    stage: EscalationLevel
    max_stage: int = 3
    threat_score: int
    title: str
    message: str
    source_device: str
    target_devices: List[str]
    attack_path_summary: str
    recommended_actions: List[str]
    created_at: float = Field(default_factory=time.time)
    expires_at: float = 0.0
    timeout_seconds: float = 20.0
    seconds_remaining: float = 20.0
    status: AlertStatus = AlertStatus.PENDING
    analyst_action_taken: Optional[str] = None
    analyst_action_timestamp: Optional[float] = None
    autonomous_action_executed: bool = False
    siren_silenced: bool = False
    evidence_summary: List[str] = Field(default_factory=list)
