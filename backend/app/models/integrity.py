from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
import time


class FileIntegrityStatus(str, Enum):
    HEALTHY = "HEALTHY"
    MODIFIED = "MODIFIED"
    DELETED = "DELETED"
    CORRUPTED = "CORRUPTED"
    RESTORED = "RESTORED"


class FileVersion(BaseModel):
    version_id: str
    version_number: int
    timestamp: float
    formatted_time: str
    sha256_hash: str
    size_bytes: int
    content_summary: str
    is_known_good: bool = False
    modified_by: str = "SYSTEM"
    device_id: str


class ProtectedFile(BaseModel):
    file_id: str
    filename: str
    file_path: str
    owner: str
    device_id: str
    floor: int
    room: str
    created_at: float
    last_modified_at: float
    current_hash: str
    known_good_hash: str
    current_version: int
    known_good_version: int
    status: FileIntegrityStatus = FileIntegrityStatus.HEALTHY
    is_recovery_available: bool = True
    versions: List[FileVersion] = Field(default_factory=list)
    last_impacted_by_incident: Optional[str] = None
    last_impacted_by_user: Optional[str] = None
    restoration_history: List[Dict[str, Any]] = Field(default_factory=list)
