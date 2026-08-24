export type DeviceStatus = "NORMAL" | "SUSPICIOUS" | "HIGH_RISK" | "COMPROMISED" | "QUARANTINED" | "PROTECTED";
export type DeviceCriticality = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type DeviceType = "WORKSTATION" | "LAPTOP" | "ROUTER" | "SWITCH" | "SERVER" | "DATABASE" | "FILE_SERVER" | "CCTV" | "DOOR_CONTROLLER" | "BMS" | "IOT_GATEWAY" | "SENSOR" | "PRINTER" | "ACCESS_POINT";

export interface Device {
  id: string;
  name: string;
  type: DeviceType;
  ip_address: string;
  floor: number;
  room: string;
  network_segment: string;
  criticality: DeviceCriticality;
  status: DeviceStatus;
  risk_score: number;
  connected_devices: string[];
  active_sessions: string[];
  blocked_connections: string[];
  is_isolated: boolean;
  is_telemetry_reporting: boolean;
  last_heartbeat: number;
  threat_reasons: string[];
  metadata: Record<string, any>;
}

export interface Room {
  id: string;
  name: string;
  floor: number;
  coordinates: { x: number; y: number; width: number; height: number };
  device_ids: string[];
}

export interface Floor {
  floor_number: number;
  name: string;
  description: string;
  rooms: Room[];
  device_ids: string[];
}

export type EventSeverity = "INFO" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type EventType =
  | "LOGIN_SUCCESS"
  | "LOGIN_FAILED"
  | "MULTIPLE_FAILED_LOGINS"
  | "UNUSUAL_LOGIN"
  | "NEW_DEVICE_AUTH"
  | "SESSION_CREATED"
  | "SESSION_TERMINATED"
  | "PRIVILEGE_ESCALATION"
  | "NETWORK_CONNECTION"
  | "NEW_NETWORK_RELATIONSHIP"
  | "PORT_SCAN"
  | "LATERAL_MOVEMENT"
  | "SUSPICIOUS_DATA_TRANSFER"
  | "BEACONING"
  | "FILE_ACCESS"
  | "FILE_MODIFIED"
  | "FILE_DELETED"
  | "FILE_CORRUPTED"
  | "RANSOMWARE_ENCRYPTION"
  | "PHYSICAL_ACCESS_CMD"
  | "DOOR_CONTROLLER_CMD"
  | "DOOR_UNLOCKED_UNAUTHORIZED"
  | "CCTV_DISCONNECT"
  | "BMS_HVAC_SETPOINT_CHANGE"
  | "DEVICE_OFFLINE"
  | "TELEMETRY_UNAVAILABLE";

export interface TelemetryEvent {
  event_id: string;
  timestamp: number;
  formatted_time?: string;
  source_device: string;
  destination_device?: string;
  user?: string;
  event_type: EventType;
  floor: number;
  room?: string;
  network_segment?: string;
  severity: EventSeverity;
  description: string;
  payload?: Record<string, any>;
  is_duplicate: boolean;
  is_delayed: boolean;
  original_timestamp?: number;
  delay_seconds: number;
  is_anomaly: boolean;
  correlation_id?: string;
  attack_stage?: string;
  scenario_step_index?: number;
  incident_id?: string;
  evidence_source?: string;
  threat_score_snapshot?: number;
}

export interface ReconstructedEdge {
  source: string;
  target: string;
  status: "CONFIRMED" | "INFERRED";
  confidence: number;
  supporting_event_ids: string[];
}

export interface ScoreFactor {
  name: string;
  category: string;
  points: number;
  description: string;
  evidence: string;
}

export interface ThreatScore {
  overall_score: number;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  confidence: number;
  factors: ScoreFactor[];
  reasons: string[];
  affected_devices_count: number;
  affected_floors: number[];
  critical_assets_at_risk: string[];
  calculated_at: number;
  recommendation: string;
}

export type SirenState = "IDLE" | "PLAYING" | "SILENCED";

export interface AlertItem {
  alert_id: string;
  incident_id: string;
  stage: number; // 1, 2, 3
  max_stage: number;
  threat_score: number;
  title: string;
  message: string;
  source_device: string;
  target_devices: string[];
  attack_path_summary: string;
  recommended_actions: string[];
  created_at: number;
  expires_at: number;
  timeout_seconds: number;
  seconds_remaining: number;
  status: "PENDING" | "ACKNOWLEDGED" | "APPROVED" | "REJECTED" | "ESCALATED" | "AUTONOMOUS_TRIGGERED" | "RESOLVED";
  analyst_action_taken?: string;
  analyst_action_timestamp?: number;
  autonomous_action_executed: boolean;
  siren_silenced?: boolean;
  evidence_summary: string[];
}

export interface AttackPath {
  path_id: string;
  source_device: string;
  target_device: string;
  nodes: string[];
  edges: string[];
  reconstructed_edges?: ReconstructedEdge[];
  confidence_score: number;
  has_missing_telemetry: boolean;
  missing_hops: string[];
  attack_techniques: string[];
  is_active: boolean;
  is_blocked: boolean;
  blocked_at_node?: string;
  reconstructed_at: number;
  explanation: string;
}


export interface GraphNode {
  id: string;
  label: string;
  type: string;
  floor: number;
  room: string;
  ip: string;
  status: DeviceStatus;
  risk_score: number;
  criticality: DeviceCriticality;
  is_compromised: boolean;
  is_quarantined: boolean;
  is_origin: boolean;
  is_target: boolean;
  details: Record<string, any>;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  relation: string;
  is_attack_path: boolean;
  is_blocked: boolean;
  traffic_volume: number;
  last_event_time: number;
}

export interface FileVersion {
  version_id: string;
  version_number: number;
  timestamp: number;
  formatted_time: string;
  sha256_hash: string;
  size_bytes: number;
  content_summary: string;
  is_known_good: boolean;
  modified_by: string;
  device_id: string;
}

export interface ProtectedFile {
  file_id: string;
  filename: string;
  file_path: string;
  owner: string;
  device_id: string;
  floor: number;
  room: string;
  created_at: number;
  last_modified_at: number;
  current_hash: string;
  known_good_hash: string;
  current_version: number;
  known_good_version: number;
  status: "HEALTHY" | "MODIFIED" | "DELETED" | "CORRUPTED" | "RESTORED";
  is_recovery_available: boolean;
  versions: FileVersion[];
  last_impacted_by_incident?: string;
  last_impacted_by_user?: string;
  restoration_history: Array<Record<string, any>>;
}

export interface IncidentReport {
  incident_id: string;
  title: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  threat_score: number;
  confidence_score: number;
  status: "ACTIVE" | "CONTAINED" | "RESOLVED" | "CLOSED";
  start_time: number;
  end_time?: number;
  affected_floors: number[];
  affected_devices: string[];
  attack_path_summary: string;
  reconstructed_path: string[];
  attack_techniques: string[];
  data_impact_count: number;
  affected_files: string[];
  containment_mode: "MANUAL_ANALYST" | "AUTONOMOUS_AI" | "HYBRID" | "UNCONTAINED";
  containment_actions: string[];
  containment_verified: boolean;
  recovery_status: string;
  recovered_files_count: number;
  unrecoverable_files_count: number;
  events_timeline: Array<Record<string, any>>;
  executive_summary: string;
}

export interface AuditEntry {
  audit_id: string;
  timestamp: number;
  formatted_time: string;
  actor: "AI" | "ANALYST" | "SYSTEM";
  action: string;
  target: string;
  incident_id?: string;
  reason: string;
  result: string;
  details: Record<string, any>;
}

export interface DatabaseStats {
  status: string;
  engine: string;
  db_path: string;
  size_bytes: number;
  size_formatted: string;
  total_records: number;
  table_counts: Record<string, number>;
}

export type ReplayStatus = "IDLE" | "PLAYING" | "PAUSED" | "COMPLETE";

export interface ReplayState {
  status: ReplayStatus;
  currentStepIndex: number;
  totalSteps: number;
  speed: number;
  events: TelemetryEvent[];
  highlightedNodes: Set<string>;
  highlightedEdges: Set<string>;
  currentThreatScore: number;
  currentAttackStage: string;
}

export type EvidenceSourceType =
  | "AUTHENTICATION_LOG"
  | "ROUTER_LOG"
  | "FIREWALL_LOG"
  | "NETWORK_TELEMETRY"
  | "SERVER_AUDIT"
  | "ENDPOINT_TELEMETRY"
  | "DATABASE_AUDIT"
  | "SECURITY_EVENT_STORE";

export type ReconstructionPhase =
  | "IDLE"
  | "COLLECTING"
  | "CORRELATING"
  | "IDENTIFYING_GAPS"
  | "INFERRING"
  | "BUILDING_PATH"
  | "CALCULATING_CONFIDENCE"
  | "COMPLETE";

export interface ReconstructionResult {
  phase: ReconstructionPhase;
  collectedSources: EvidenceSourceType[];
  missingSources: EvidenceSourceType[];
  confirmedHops: ReconstructedEdge[];
  inferredHops: ReconstructedEdge[];
  overallConfidence: number;
  confidenceLabel: string;
  incidentId: string;
  attackOrigin: string;
  criticalAsset: string;
}

export interface SimulationState {
  system_status: {
    ai_defense_engine: string;
    analyst_availability: "AVAILABLE" | "BUSY" | "AWAY" | "OFFLINE";
    is_paused: boolean;
    sim_speed: number;
    active_scenario?: string;
    is_scenario_running: boolean;
    duplicates_dropped: number;
    database_status?: string;
    database_records?: number;
  };
  threat_score: ThreatScore;
  active_alert: AlertItem | null;
  active_incident: IncidentReport | null;
  attack_path: AttackPath | null;
  devices: Record<string, Device>;
  floors: Floor[];
  graph: {
    nodes: GraphNode[];
    edges: GraphEdge[];
  };
  telemetry_feed: TelemetryEvent[];
  incident_event_history: TelemetryEvent[];
  file_integrity: {
    files: Record<string, ProtectedFile>;
    stats: {
      total_files: number;
      healthy: number;
      modified: number;
      deleted: number;
      corrupted: number;
      recoverable: number;
      unrecoverable: number;
    };
    timeline: Array<Record<string, any>>;
  };
  containment: {
    quarantined_devices: string[];
    blocked_routes: string[];
    protected_assets: string[];
    history: Array<Record<string, any>>;
  };
  audit_logs: AuditEntry[];
  missing_telemetry: Record<string, boolean>;
  database?: DatabaseStats;
}

