from enum import Enum
from typing import List, Dict, Any
from pydantic import BaseModel, Field


class ThreatSeverity(str, Enum):
    LOW = "LOW"        # 0-30
    MEDIUM = "MEDIUM"  # 31-60
    HIGH = "HIGH"      # 61-80
    CRITICAL = "CRITICAL"  # 81-100


class ScoreFactor(BaseModel):
    name: str
    category: str  # Authentication, Network, Spatial, Data, Criticality, Velocity
    points: int
    description: str
    evidence: str


class ThreatScore(BaseModel):
    overall_score: int = Field(default=0, ge=0, le=100)
    severity: ThreatSeverity = ThreatSeverity.LOW
    confidence: float = Field(default=100.0, ge=0.0, le=100.0)
    factors: List[ScoreFactor] = Field(default_factory=list)
    reasons: List[str] = Field(default_factory=list)
    affected_devices_count: int = 0
    affected_floors: List[int] = Field(default_factory=list)
    critical_assets_at_risk: List[str] = Field(default_factory=list)
    calculated_at: float = 0.0
    recommendation: str = ""
