import os
import sys
import time

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.app.db.database import (
    init_db,
    save_telemetry_event,
    save_telemetry_events_batch,
    save_incident,
    save_audit_log,
    save_alert,
    save_file_state,
    record_file_restoration,
    get_historical_events,
    get_historical_incidents,
    get_historical_audit_logs,
    get_database_stats,
    DB_PATH
)
from backend.app.models.telemetry import TelemetryEvent, EventType, EventSeverity
from backend.app.models.incident import IncidentReport, IncidentSeverity, IncidentStatus, ContainmentMode
from backend.app.models.audit import AuditEntry, AuditActor, AuditAction
from backend.app.models.alert import AlertItem, EscalationLevel, AlertStatus
from backend.app.models.integrity import ProtectedFile, FileVersion, FileIntegrityStatus


def test_sqlite_database():
    print("[*] Testing SQLite Database Initialization...")
    init_db()
    assert os.path.exists(DB_PATH), f"Database file not created at {DB_PATH}"
    print(f"[OK] Database initialized at: {DB_PATH}")

    # 1. Test Telemetry Events Batch Persistence
    print("[*] Testing Telemetry Batch Insert into SQLite...")
    now = time.time()
    events = [
        TelemetryEvent(
            event_id=f"EVT-TEST-{i}",
            timestamp=now + i,
            formatted_time=time.strftime("%H:%M:%S", time.localtime(now + i)),
            source_device="Laptop-102",
            destination_device="EdgeRouter-101",
            user="test_admin",
            event_type=EventType.LOGIN_FAILED,
            floor=1,
            room="Visitor Lounge",
            network_segment="VLAN-10-GUEST-PUB",
            severity=EventSeverity.HIGH,
            description=f"Test security anomaly probe #{i}",
            is_anomaly=True
        )
        for i in range(5)
    ]
    save_telemetry_events_batch(events)
    queried = get_historical_events(limit=10, severity="HIGH")
    assert len(queried) >= 5
    print(f"[OK] Successfully inserted and queried {len(queried)} high-severity telemetry events from SQLite.")

    # 2. Test Incident Persistence
    print("[*] Testing Incident Dossier Persistence in SQLite...")
    inc = IncidentReport(
        incident_id="INC-SQLITE-99",
        title="SQLite Persistence Integration Validation Incident",
        severity=IncidentSeverity.CRITICAL,
        threat_score=95,
        confidence_score=94.0,
        status=IncidentStatus.ACTIVE,
        start_time=now,
        affected_floors=[1, 3, 4],
        affected_devices=["Laptop-102", "AppServer-301", "Database-302"],
        attack_path_summary="Laptop-102 -> AppServer-301 -> Database-302",
        reconstructed_path=["Laptop-102", "AppServer-301", "Database-302"],
        attack_techniques=["Credential Spraying", "Privilege Escalation"],
        data_impact_count=2,
        affected_files=["financial_report.xlsx"],
        containment_mode=ContainmentMode.AUTONOMOUS_AI,
        containment_actions=["Isolated Laptop-102", "Blocked Route"],
        containment_verified=True,
        executive_summary="Validation incident test report."
    )
    save_incident(inc)
    queried_incidents = get_historical_incidents()
    matching = next((i for i in queried_incidents if i["incident_id"] == "INC-SQLITE-99"), None)
    assert matching is not None
    assert matching["threat_score"] == 95
    print(f"[OK] Incident #{matching['incident_id']} stored and queried with complete JSON fields.")

    # 3. Test Audit Log Persistence
    print("[*] Testing Audit Log Ledger Persistence in SQLite...")
    audit = AuditEntry(
        audit_id="AUD-TEST-88",
        timestamp=now,
        formatted_time=time.strftime("%H:%M:%S", time.localtime(now)),
        actor=AuditActor.AI,
        action=AuditAction.APPROVE_CONTAINMENT,
        target="Laptop-102",
        incident_id="INC-SQLITE-99",
        reason="Autonomous containment test",
        result="SUCCESS",
        details={"path": "isolated"}
    )
    save_audit_log(audit)
    queried_audits = get_historical_audit_logs(actor="AI")
    assert any(a["audit_id"] == "AUD-TEST-88" for a in queried_audits)
    print(f"[OK] Audit log AUD-TEST-88 persisted and retrieved.")

    # 4. Test File Integrity & Restoration Persistence
    print("[*] Testing File Versioning & Restoration in SQLite...")
    pf = ProtectedFile(
        file_id="FILE-TEST-01",
        filename="test_financials.xlsx",
        file_path="/vault/test_financials.xlsx",
        owner="CFO",
        device_id="FileServer-303",
        floor=3,
        room="Server Rack B1",
        created_at=now,
        last_modified_at=now,
        current_hash="hash_v2",
        known_good_hash="hash_v1",
        current_version=2,
        known_good_version=1,
        status=FileIntegrityStatus.CORRUPTED,
        is_recovery_available=True,
        versions=[
            FileVersion(version_id="v1", version_number=1, timestamp=now - 300, formatted_time="10:00:00", sha256_hash="hash_v1", size_bytes=1024, content_summary="Good draft", is_known_good=True, modified_by="cfo", device_id="FileServer-303"),
            FileVersion(version_id="v2", version_number=2, timestamp=now, formatted_time="10:05:00", sha256_hash="hash_v2", size_bytes=1024, content_summary="Corrupted", is_known_good=False, modified_by="adversary", device_id="FileServer-303")
        ]
    )
    save_file_state(pf)
    record_file_restoration("test_financials.xlsx", 1, "hash_v1", "RESTORED", "ANALYST")
    print(f"[OK] Protected file state and restoration record saved.")

    # 5. Test Database Stats
    stats = get_database_stats()
    print(f"[OK] Database Statistics: Engine={stats['engine']}, Size={stats['size_formatted']}, Total Records={stats['total_records']}")
    print(f"     Table Distribution: {stats['table_counts']}")
    assert stats["total_records"] > 0

    print("\n========================================================")
    print("ALL SQLITE DATABASE VERIFICATION TESTS PASSED (100%)!")
    print("========================================================\n")


if __name__ == "__main__":
    test_sqlite_database()
