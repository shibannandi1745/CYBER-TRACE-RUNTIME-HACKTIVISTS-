from enum import Enum
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field
import time


class AuditActor(str, Enum):
    AI = "AI"
    ANALYST = "ANALYST"
    SYSTEM = "SYSTEM"


class AuditAction(str, Enum):
    ISOLATE_DEVICE = "ISOLATE_DEVICE"
    UNISOLATE_DEVICE = "UNISOLATE_DEVICE"
    BLOCK_CONNECTION = "BLOCK_CONNECTION"
    UNBLOCK_CONNECTION = "UNBLOCK_CONNECTION"
    REVOKE_SESSION = "REVOKE_SESSION"
    PROTECT_ASSET = "PROTECT_ASSET"
    RESTORE_FILE = "RESTORE_FILE"
    ESCALATE_ALERT = "ESCALATE_ALERT"
    ACKNOWLEDGE_ALERT = "ACKNOWLEDGE_ALERT"
    APPROVE_CONTAINMENT = "APPROVE_CONTAINMENT"
    REJECT_ALERT = "REJECT_ALERT"
    TRIGGER_SCENARIO = "TRIGGER_SCENARIO"
    RESET_SIMULATION = "RESET_SIMULATION"
    CHANGE_AVAILABILITY = "CHANGE_AVAILABILITY"


class AuditEntry(BaseModel):
    audit_id: str
    timestamp: float = Field(default_factory=time.time)
    formatted_time: str
    actor: AuditActor
    action: AuditAction
    target: str
    incident_id: Optional[str] = None
    reason: str
    result: str = "SUCCESS"  # SUCCESS, FAILED, PENDING
    details: Dict[str, Any] = Field(default_factory=dict)
