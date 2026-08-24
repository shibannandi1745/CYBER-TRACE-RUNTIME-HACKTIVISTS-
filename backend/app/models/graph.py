from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class EdgeRelationType(str, Enum):
    CONNECTED_TO = "CONNECTED_TO"
    COMMUNICATES_WITH = "COMMUNICATES_WITH"
    AUTHENTICATED_BY = "AUTHENTICATED_BY"
    LOCATED_AT = "LOCATED_AT"
    CONTROLS = "CONTROLS"
    ACCESSES = "ACCESSES"


class GraphNode(BaseModel):
    id: str
    label: str
    type: str  # device type or user or floor
    floor: int
    room: str
    ip: str
    status: str
    risk_score: int
    criticality: str
    is_compromised: bool = False
    is_quarantined: bool = False
    is_target: bool = False
    is_origin: bool = False
    details: Dict[str, Any] = Field(default_factory=dict)


class GraphEdge(BaseModel):
    id: str
    source: str
    target: str
    relation: EdgeRelationType = EdgeRelationType.CONNECTED_TO
    is_attack_path: bool = False
    is_blocked: bool = False
    traffic_volume: int = 0
    last_event_time: float = 0.0


class ReconstructedEdge(BaseModel):
    source: str
    target: str
    status: str = "CONFIRMED"  # "CONFIRMED" or "INFERRED"
    confidence: float = 0.95
    supporting_event_ids: List[str] = Field(default_factory=list)


class AttackPath(BaseModel):
    path_id: str
    source_device: str
    target_device: str
    nodes: List[str]  # Ordered list of device IDs in the path
    edges: List[str]  # Ordered list of edge IDs
    reconstructed_edges: List[ReconstructedEdge] = Field(default_factory=list)
    confidence_score: float = Field(default=0.0, ge=0.0, le=100.0)
    has_missing_telemetry: bool = False
    missing_hops: List[str] = Field(default_factory=list)
    attack_techniques: List[str] = Field(default_factory=list)
    is_active: bool = True
    is_blocked: bool = False
    blocked_at_node: Optional[str] = None
    reconstructed_at: float = 0.0
    explanation: str = ""

