import os
import sqlite3
import json
import time
from typing import List, Dict, Any, Optional
from threading import Lock

# Database file path
DB_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
DB_PATH = os.path.join(DB_DIR, "cybertrace.db")

_db_lock = Lock()


def get_db_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH, timeout=10.0, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Initializes SQLite database schemas and indexes."""
    with _db_lock:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Performance pragmas
        cursor.execute("PRAGMA journal_mode = WAL;")
        cursor.execute("PRAGMA synchronous = NORMAL;")

        # 1. Telemetry Events Table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS telemetry_events (
            event_id TEXT PRIMARY KEY,
            timestamp REAL,
            formatted_time TEXT,
            source_device TEXT,
            destination_device TEXT,
            user TEXT,
            event_type TEXT,
            floor INTEGER,
            room TEXT,
            network_segment TEXT,
            severity TEXT,
            description TEXT,
            is_anomaly INTEGER,
            is_delayed INTEGER,
            is_duplicate INTEGER,
            delay_seconds REAL,
            correlation_id TEXT,
            payload_json TEXT
        );
        """)
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_telemetry_time ON telemetry_events(timestamp DESC);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_telemetry_sev ON telemetry_events(severity);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_telemetry_src ON telemetry_events(source_device);")

        # 2. Incidents Table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS incidents (
            incident_id TEXT PRIMARY KEY,
            title TEXT,
            severity TEXT,
            threat_score INTEGER,
            confidence_score REAL,
            status TEXT,
            start_time REAL,
            end_time REAL,
            affected_floors_json TEXT,
            affected_devices_json TEXT,
            attack_path_summary TEXT,
            reconstructed_path_json TEXT,
            attack_techniques_json TEXT,
            data_impact_count INTEGER,
            affected_files_json TEXT,
            containment_mode TEXT,
            containment_actions_json TEXT,
            containment_verified INTEGER,
            recovered_files_count INTEGER,
            executive_summary TEXT,
            updated_at REAL
        );
        """)

        # 3. Audit Logs Table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS audit_logs (
            audit_id TEXT PRIMARY KEY,
            timestamp REAL,
            formatted_time TEXT,
            actor TEXT,
            action TEXT,
            target TEXT,
            incident_id TEXT,
            reason TEXT,
            result TEXT,
            details_json TEXT
        );
        """)
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_audit_time ON audit_logs(timestamp DESC);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_audit_actor ON audit_logs(actor);")

        # 4. Alerts Table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS alerts (
            alert_id TEXT PRIMARY KEY,
            incident_id TEXT,
            stage INTEGER,
            max_stage INTEGER,
            threat_score INTEGER,
            title TEXT,
            message TEXT,
            source_device TEXT,
            target_devices_json TEXT,
            attack_path_summary TEXT,
            recommended_actions_json TEXT,
            created_at REAL,
            expires_at REAL,
            timeout_seconds REAL,
            status TEXT,
            analyst_action_taken TEXT,
            autonomous_action_executed INTEGER,
            evidence_summary_json TEXT
        );
        """)

        # 5. Protected Files Table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS protected_files (
            file_id TEXT PRIMARY KEY,
            filename TEXT UNIQUE,
            file_path TEXT,
            owner TEXT,
            device_id TEXT,
            floor INTEGER,
            room TEXT,
            current_hash TEXT,
            known_good_hash TEXT,
            current_version INTEGER,
            known_good_version INTEGER,
            status TEXT,
            is_recovery_available INTEGER,
            created_at REAL,
            last_modified_at REAL,
            last_impacted_by_incident TEXT,
            last_impacted_by_user TEXT
        );
        """)

        # 6. File Versions Table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS file_versions (
            version_id TEXT PRIMARY KEY,
            file_id TEXT,
            version_number INTEGER,
            timestamp REAL,
            formatted_time TEXT,
            sha256_hash TEXT,
            size_bytes INTEGER,
            content_summary TEXT,
            is_known_good INTEGER,
            modified_by TEXT,
            device_id TEXT,
            FOREIGN KEY (file_id) REFERENCES protected_files(file_id)
        );
        """)

        # 7. Restoration History Table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS restoration_history (
            restore_id INTEGER PRIMARY KEY AUTOINCREMENT,
            filename TEXT,
            restored_at REAL,
            formatted_time TEXT,
            restored_from_version INTEGER,
            sha256_hash TEXT,
            status TEXT,
            performed_by TEXT
        );
        """)

        conn.commit()
        conn.close()


# ------------------ REPOSITORY HELPER FUNCTIONS ------------------

def save_telemetry_event(event: Any):
    """Inserts a single telemetry event into SQLite."""
    with _db_lock:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
        INSERT OR REPLACE INTO telemetry_events (
            event_id, timestamp, formatted_time, source_device, destination_device,
            user, event_type, floor, room, network_segment, severity, description,
            is_anomaly, is_delayed, is_duplicate, delay_seconds, correlation_id, payload_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            event.event_id,
            event.timestamp,
            event.formatted_time or time.strftime("%H:%M:%S", time.localtime(event.timestamp)),
            event.source_device,
            event.destination_device,
            event.user,
            event.event_type.value if hasattr(event.event_type, "value") else str(event.event_type),
            event.floor,
            event.room,
            event.network_segment,
            event.severity.value if hasattr(event.severity, "value") else str(event.severity),
            event.description,
            1 if event.is_anomaly else 0,
            1 if event.is_delayed else 0,
            1 if event.is_duplicate else 0,
            event.delay_seconds,
            event.correlation_id,
            json.dumps(event.payload or {})
        ))
        conn.commit()
        conn.close()


def save_telemetry_events_batch(events: List[Any]):
    """Bulk inserts a batch of telemetry events into SQLite."""
    if not events:
        return
    with _db_lock:
        conn = get_db_connection()
        cursor = conn.cursor()
        data = [
            (
                ev.event_id,
                ev.timestamp,
                ev.formatted_time or time.strftime("%H:%M:%S", time.localtime(ev.timestamp)),
                ev.source_device,
                ev.destination_device,
                ev.user,
                ev.event_type.value if hasattr(ev.event_type, "value") else str(ev.event_type),
                ev.floor,
                ev.room,
                ev.network_segment,
                ev.severity.value if hasattr(ev.severity, "value") else str(ev.severity),
                ev.description,
                1 if ev.is_anomaly else 0,
                1 if ev.is_delayed else 0,
                1 if ev.is_duplicate else 0,
                ev.delay_seconds,
                ev.correlation_id,
                json.dumps(ev.payload or {})
            )
            for ev in events
        ]
        cursor.executemany("""
        INSERT OR REPLACE INTO telemetry_events (
            event_id, timestamp, formatted_time, source_device, destination_device,
            user, event_type, floor, room, network_segment, severity, description,
            is_anomaly, is_delayed, is_duplicate, delay_seconds, correlation_id, payload_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, data)
        conn.commit()
        conn.close()


def save_incident(incident: Any):
    """Upserts an incident dossier into SQLite."""
    if not incident:
        return
    with _db_lock:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
        INSERT OR REPLACE INTO incidents (
            incident_id, title, severity, threat_score, confidence_score, status,
            start_time, end_time, affected_floors_json, affected_devices_json,
            attack_path_summary, reconstructed_path_json, attack_techniques_json,
            data_impact_count, affected_files_json, containment_mode,
            containment_actions_json, containment_verified, recovered_files_count,
            executive_summary, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            incident.incident_id,
            incident.title,
            incident.severity.value if hasattr(incident.severity, "value") else str(incident.severity),
            incident.threat_score,
            incident.confidence_score,
            incident.status.value if hasattr(incident.status, "value") else str(incident.status),
            incident.start_time,
            incident.end_time,
            json.dumps(incident.affected_floors),
            json.dumps(incident.affected_devices),
            incident.attack_path_summary,
            json.dumps(incident.reconstructed_path),
            json.dumps(incident.attack_techniques),
            incident.data_impact_count,
            json.dumps(incident.affected_files),
            incident.containment_mode.value if hasattr(incident.containment_mode, "value") else str(incident.containment_mode),
            json.dumps(incident.containment_actions),
            1 if incident.containment_verified else 0,
            incident.recovered_files_count,
            incident.executive_summary,
            time.time()
        ))
        conn.commit()
        conn.close()


def save_audit_log(entry: Any):
    """Inserts an immutable audit log entry into SQLite."""
    with _db_lock:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
        INSERT OR REPLACE INTO audit_logs (
            audit_id, timestamp, formatted_time, actor, action, target,
            incident_id, reason, result, details_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            entry.audit_id,
            entry.timestamp,
            entry.formatted_time,
            entry.actor.value if hasattr(entry.actor, "value") else str(entry.actor),
            entry.action.value if hasattr(entry.action, "value") else str(entry.action),
            entry.target,
            entry.incident_id,
            entry.reason,
            entry.result,
            json.dumps(entry.details or {})
        ))
        conn.commit()
        conn.close()


def save_alert(alert: Any):
    """Upserts an alert item into SQLite."""
    if not alert:
        return
    with _db_lock:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
        INSERT OR REPLACE INTO alerts (
            alert_id, incident_id, stage, max_stage, threat_score, title, message,
            source_device, target_devices_json, attack_path_summary, recommended_actions_json,
            created_at, expires_at, timeout_seconds, status, analyst_action_taken,
            autonomous_action_executed, evidence_summary_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            alert.alert_id,
            alert.incident_id,
            alert.stage.value if hasattr(alert.stage, "value") else int(alert.stage),
            alert.max_stage,
            alert.threat_score,
            alert.title,
            alert.message,
            alert.source_device,
            json.dumps(alert.target_devices),
            alert.attack_path_summary,
            json.dumps(alert.recommended_actions),
            alert.created_at,
            alert.expires_at,
            alert.timeout_seconds,
            alert.status.value if hasattr(alert.status, "value") else str(alert.status),
            alert.analyst_action_taken,
            1 if alert.autonomous_action_executed else 0,
            json.dumps(alert.evidence_summary)
        ))
        conn.commit()
        conn.close()


def save_file_state(f: Any):
    """Upserts protected file metadata and its version snapshots into SQLite."""
    with _db_lock:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
        INSERT OR REPLACE INTO protected_files (
            file_id, filename, file_path, owner, device_id, floor, room,
            current_hash, known_good_hash, current_version, known_good_version,
            status, is_recovery_available, created_at, last_modified_at,
            last_impacted_by_incident, last_impacted_by_user
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            f.file_id,
            f.filename,
            f.file_path,
            f.owner,
            f.device_id,
            f.floor,
            f.room,
            f.current_hash,
            f.known_good_hash,
            f.current_version,
            f.known_good_version,
            f.status.value if hasattr(f.status, "value") else str(f.status),
            1 if f.is_recovery_available else 0,
            f.created_at,
            f.last_modified_at,
            f.last_impacted_by_incident,
            f.last_impacted_by_user
        ))

        # Save all associated versions
        for ver in f.versions:
            cursor.execute("""
            INSERT OR REPLACE INTO file_versions (
                version_id, file_id, version_number, timestamp, formatted_time,
                sha256_hash, size_bytes, content_summary, is_known_good,
                modified_by, device_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                f"{f.file_id}_{ver.version_id}",
                f.file_id,
                ver.version_number,
                ver.timestamp,
                ver.formatted_time,
                ver.sha256_hash,
                ver.size_bytes,
                ver.content_summary,
                1 if ver.is_known_good else 0,
                ver.modified_by,
                ver.device_id
            ))

        conn.commit()
        conn.close()


def record_file_restoration(filename: str, restored_version: int, sha256_hash: str, status: str = "RESTORED", performed_by: str = "ANALYST"):
    """Records a file restoration event in SQLite."""
    now = time.time()
    formatted = time.strftime("%H:%M:%S", time.localtime(now))
    with _db_lock:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
        INSERT INTO restoration_history (
            filename, restored_at, formatted_time, restored_from_version, sha256_hash, status, performed_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (filename, now, formatted, restored_version, sha256_hash, status, performed_by))
        conn.commit()
        conn.close()


# ------------------ QUERY FUNCTIONS ------------------

def get_historical_events(limit: int = 100, severity: Optional[str] = None, floor: Optional[int] = None, search: Optional[str] = None) -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    query = "SELECT * FROM telemetry_events WHERE 1=1"
    params = []

    if severity and severity != "ALL":
        query += " AND severity = ?"
        params.append(severity)
    if floor is not None:
        query += " AND floor = ?"
        params.append(floor)
    if search:
        query += " AND (source_device LIKE ? OR description LIKE ? OR user LIKE ?)"
        params.extend([f"%{search}%", f"%{search}%", f"%{search}%"])

    query += " ORDER BY timestamp DESC LIMIT ?"
    params.append(limit)

    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]


def get_historical_incidents(limit: int = 50) -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM incidents ORDER BY start_time DESC LIMIT ?", (limit,))
    rows = cursor.fetchall()
    conn.close()
    result = []
    for r in rows:
        d = dict(r)
        d["affected_floors"] = json.loads(d["affected_floors_json"] or "[]")
        d["affected_devices"] = json.loads(d["affected_devices_json"] or "[]")
        d["reconstructed_path"] = json.loads(d["reconstructed_path_json"] or "[]")
        d["attack_techniques"] = json.loads(d["attack_techniques_json"] or "[]")
        d["affected_files"] = json.loads(d["affected_files_json"] or "[]")
        d["containment_actions"] = json.loads(d["containment_actions_json"] or "[]")
        result.append(d)
    return result


def get_historical_audit_logs(actor: Optional[str] = None, limit: int = 100) -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    if actor and actor != "ALL":
        cursor.execute("SELECT * FROM audit_logs WHERE actor = ? ORDER BY timestamp DESC LIMIT ?", (actor, limit))
    else:
        cursor.execute("SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT ?", (limit,))
    rows = cursor.fetchall()
    conn.close()
    result = []
    for r in rows:
        d = dict(r)
        d["details"] = json.loads(d["details_json"] or "{}")
        result.append(d)
    return result


def get_database_stats() -> Dict[str, Any]:
    """Returns database size and row counts across all persisted tables."""
    conn = get_db_connection()
    cursor = conn.cursor()

    stats = {}
    tables = [
        "telemetry_events", "incidents", "audit_logs",
        "alerts", "protected_files", "file_versions", "restoration_history"
    ]

    total_records = 0
    for table in tables:
        try:
            cursor.execute(f"SELECT COUNT(*) FROM {table}")
            cnt = cursor.fetchone()[0]
            stats[table] = cnt
            total_records += cnt
        except Exception:
            stats[table] = 0

    conn.close()

    db_size_bytes = os.path.getsize(DB_PATH) if os.path.exists(DB_PATH) else 0

    return {
        "status": "ONLINE",
        "engine": "SQLite WAL Mode",
        "db_path": DB_PATH,
        "size_bytes": db_size_bytes,
        "size_formatted": f"{(db_size_bytes / 1024):.1f} KB" if db_size_bytes < 1048576 else f"{(db_size_bytes / 1048576):.2f} MB",
        "total_records": total_records,
        "table_counts": stats
    }
