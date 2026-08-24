import time
import hashlib
from typing import Dict, List, Optional
from ..models.integrity import ProtectedFile, FileVersion, FileIntegrityStatus


def _sha256(content: str) -> str:
    return hashlib.sha256(content.encode()).hexdigest()[:16]


class FileIntegrityEngine:
    """
    Simulates file integrity monitoring (FIM), SHA-256 hash verification,
    tamper/corruption detection, and snapshot-based disaster recovery.
    """

    def __init__(self):
        self.files: Dict[str, ProtectedFile] = {}
        self.data_incident_timeline: List[Dict[str, any]] = []
        self._initialize_protected_vault()

    def _initialize_protected_vault(self):
        now = time.time()

        # 1. financial_report.xlsx
        h1 = _sha256("Q3-Revenue-Financials-v1")
        h2 = _sha256("Q3-Revenue-Financials-v2-Audited")
        h3 = _sha256("Q3-Revenue-Financials-v3-Final-KnownGood")
        self.files["financial_report.xlsx"] = ProtectedFile(
            file_id="FILE-001",
            filename="financial_report.xlsx",
            file_path="/var/vault/shares/finance/financial_report.xlsx",
            owner="CFO_Office",
            device_id="FileServer-303",
            floor=3,
            room="Server Rack B1",
            created_at=now - 7200,
            last_modified_at=now - 1200,
            current_hash=h3,
            known_good_hash=h3,
            current_version=3,
            known_good_version=3,
            status=FileIntegrityStatus.HEALTHY,
            is_recovery_available=True,
            versions=[
                FileVersion(version_id="v1", version_number=1, timestamp=now - 7200, formatted_time="10:00:00", sha256_hash=h1, size_bytes=1048576, content_summary="Initial Q3 Draft", is_known_good=False, modified_by="cfo_user", device_id="Workstation-201"),
                FileVersion(version_id="v2", version_number=2, timestamp=now - 3600, formatted_time="10:10:00", sha256_hash=h2, size_bytes=1072000, content_summary="Audited Ledger Table", is_known_good=False, modified_by="senior_auditor", device_id="Workstation-201"),
                FileVersion(version_id="v3", version_number=3, timestamp=now - 1200, formatted_time="10:20:00", sha256_hash=h3, size_bytes=1084200, content_summary="Certified Executive Balance Sheet", is_known_good=True, modified_by="cfo_user", device_id="FileServer-303")
            ]
        )

        # 2. security_config.json
        sc_h1 = _sha256("SecConfig-v1")
        sc_h2 = _sha256("SecConfig-v2-Hardened")
        self.files["security_config.json"] = ProtectedFile(
            file_id="FILE-002",
            filename="security_config.json",
            file_path="/etc/cybertrace/security_config.json",
            owner="SecOps_Admin",
            device_id="AppServer-301",
            floor=3,
            room="Server Rack A1",
            created_at=now - 14400,
            last_modified_at=now - 2400,
            current_hash=sc_h2,
            known_good_hash=sc_h2,
            current_version=2,
            known_good_version=2,
            status=FileIntegrityStatus.HEALTHY,
            is_recovery_available=True,
            versions=[
                FileVersion(version_id="v1", version_number=1, timestamp=now - 14400, formatted_time="08:00:00", sha256_hash=sc_h1, size_bytes=4096, content_summary="Base Firewall & ACL Policies", is_known_good=False, modified_by="secops_lead", device_id="SOC-Terminal-401"),
                FileVersion(version_id="v2", version_number=2, timestamp=now - 2400, formatted_time="09:30:00", sha256_hash=sc_h2, size_bytes=4280, content_summary="Strict Zero-Trust Perimeter Rules", is_known_good=True, modified_by="secops_lead", device_id="AppServer-301")
            ]
        )

        # 3. database.db
        db_h1 = _sha256("SQL-Master-Cluster-Healthy")
        self.files["database.db"] = ProtectedFile(
            file_id="FILE-003",
            filename="database.db",
            file_path="/var/lib/postgresql/data/database.db",
            owner="DBA_Cluster",
            device_id="Database-302",
            floor=3,
            room="Server Rack A2",
            created_at=now - 86400,
            last_modified_at=now - 600,
            current_hash=db_h1,
            known_good_hash=db_h1,
            current_version=1,
            known_good_version=1,
            status=FileIntegrityStatus.HEALTHY,
            is_recovery_available=True,
            versions=[
                FileVersion(version_id="v1", version_number=1, timestamp=now - 86400, formatted_time="00:00:00", sha256_hash=db_h1, size_bytes=21474836480, content_summary="Master SQL Cluster Snapshot (Hourly Verified)", is_known_good=True, modified_by="postgres_cron", device_id="BackupVault-304")
            ]
        )

        # 4. employee_records.csv
        hr_h1 = _sha256("HR-Active-Employees-v1")
        self.files["employee_records.csv"] = ProtectedFile(
            file_id="FILE-004",
            filename="employee_records.csv",
            file_path="/var/vault/shares/hr/employee_records.csv",
            owner="HR_Director",
            device_id="FileServer-303",
            floor=3,
            room="Server Rack B1",
            created_at=now - 36000,
            last_modified_at=now - 1800,
            current_hash=hr_h1,
            known_good_hash=hr_h1,
            current_version=1,
            known_good_version=1,
            status=FileIntegrityStatus.HEALTHY,
            is_recovery_available=True,
            versions=[
                FileVersion(version_id="v1", version_number=1, timestamp=now - 36000, formatted_time="07:00:00", sha256_hash=hr_h1, size_bytes=524288, content_summary="Certified Personnel Roster", is_known_good=True, modified_by="hr_manager", device_id="FileServer-303")
            ]
        )

        # 5. project_data.json
        pj_h1 = _sha256("Engineering-CAD-Assets")
        self.files["project_data.json"] = ProtectedFile(
            file_id="FILE-005",
            filename="project_data.json",
            file_path="/var/vault/shares/engineering/project_data.json",
            owner="Engineering_Lead",
            device_id="FileServer-303",
            floor=3,
            room="Server Rack B1",
            created_at=now - 48000,
            last_modified_at=now - 3000,
            current_hash=pj_h1,
            known_good_hash=pj_h1,
            current_version=1,
            known_good_version=1,
            status=FileIntegrityStatus.HEALTHY,
            is_recovery_available=True,
            versions=[
                FileVersion(version_id="v1", version_number=1, timestamp=now - 48000, formatted_time="06:00:00", sha256_hash=pj_h1, size_bytes=8388608, content_summary="Master CAD Schema", is_known_good=True, modified_by="engineer_lead", device_id="FileServer-303")
            ]
        )

        # 6. Unprotected Scratch File (To demonstrate accurate recovery unavailable rule)
        unp_h = _sha256("Unprotected-Temporary-Export")
        self.files["unprotected_scratch.tmp"] = ProtectedFile(
            file_id="FILE-006",
            filename="unprotected_scratch.tmp",
            file_path="/tmp/unprotected_scratch.tmp",
            owner="Guest_User",
            device_id="Laptop-102",
            floor=1,
            room="Visitor Lounge",
            created_at=now - 600,
            last_modified_at=now - 300,
            current_hash=unp_h,
            known_good_hash=unp_h,
            current_version=1,
            known_good_version=1,
            status=FileIntegrityStatus.HEALTHY,
            is_recovery_available=False,  # NO BACKUP EXISTS!
            versions=[
                FileVersion(version_id="v1", version_number=1, timestamp=now - 600, formatted_time="10:35:00", sha256_hash=unp_h, size_bytes=1200, content_summary="Ephemeral scratch log without backup retention", is_known_good=False, modified_by="guest", device_id="Laptop-102")
            ]
        )

    def simulate_tampering(self, filename: str, action: str, user: str = "adversary", device: str = "FileServer-303", incident_id: str = "INC-1042"):
        """Simulates file modification, deletion, or corruption."""
        if filename not in self.files:
            return

        f = self.files[filename]
        now = time.time()
        formatted_time = time.strftime("%H:%M:%S", time.localtime(now))

        if action == "corrupt" or action == "modify":
            bad_hash = _sha256(f"CORRUPTED-{now}")
            f.current_hash = bad_hash
            f.current_version += 1
            f.last_modified_at = now
            f.status = FileIntegrityStatus.CORRUPTED if action == "corrupt" else FileIntegrityStatus.MODIFIED
            f.last_impacted_by_incident = incident_id
            f.last_impacted_by_user = user

            # Add corrupted version to history
            f.versions.append(FileVersion(
                version_id=f"v{f.current_version}",
                version_number=f.current_version,
                timestamp=now,
                formatted_time=formatted_time,
                sha256_hash=bad_hash,
                size_bytes=int(f.versions[-1].size_bytes * 0.7) if f.versions else 1024,
                content_summary="MALICIOUS ENCRYPTION / TAMPER SIGNATURE DETECTED",
                is_known_good=False,
                modified_by=user,
                device_id=device
            ))

            self.data_incident_timeline.append({
                "time": formatted_time,
                "timestamp": now,
                "file": filename,
                "action": "CORRUPTED" if action == "corrupt" else "MODIFIED",
                "device": device,
                "user": user,
                "status": f.status.value,
                "recovery_available": f.is_recovery_available
            })

        elif action == "delete":
            f.status = FileIntegrityStatus.DELETED
            f.current_hash = "DELETED_NULL_HASH"
            f.last_modified_at = now
            f.last_impacted_by_incident = incident_id
            f.last_impacted_by_user = user

            self.data_incident_timeline.append({
                "time": formatted_time,
                "timestamp": now,
                "file": filename,
                "action": "DELETED",
                "device": device,
                "user": user,
                "status": "DELETED",
                "recovery_available": f.is_recovery_available
            })

    def restore_file(self, filename: str, target_version: Optional[int] = None) -> Dict[str, any]:
        """
        Restores a corrupted or deleted file from the last known-good snapshot.
        """
        if filename not in self.files:
            return {"success": False, "message": f"File {filename} not found."}

        f = self.files[filename]
        if not f.is_recovery_available:
            return {
                "success": False,
                "recovery_available": False,
                "message": f"Recovery Not Available for {filename}. No protected previous snapshot or backup vault copy exists."
            }

        target_ver = target_version or f.known_good_version
        matching_v = next((v for v in f.versions if v.version_number == target_ver), None)

        if not matching_v:
            return {"success": False, "message": f"Version {target_ver} not found in vault."}

        now = time.time()
        formatted_time = time.strftime("%H:%M:%S", time.localtime(now))

        f.current_hash = matching_v.sha256_hash
        f.status = FileIntegrityStatus.RESTORED
        f.last_modified_at = now

        f.restoration_history.append({
            "restored_at": now,
            "formatted_time": formatted_time,
            "restored_from_version": target_ver,
            "sha256_hash": matching_v.sha256_hash,
            "status": "RESTORED"
        })

        self.data_incident_timeline.append({
            "time": formatted_time,
            "timestamp": now,
            "file": filename,
            "action": "RESTORED",
            "device": f.device_id,
            "user": "CYBERTRACE_RECOVERY_ENGINE",
            "status": "RESTORED",
            "recovery_available": True
        })

        return {
            "success": True,
            "file": filename,
            "status": "RESTORED",
            "restored_from_version": target_ver,
            "restore_time": formatted_time,
            "known_good_hash": matching_v.sha256_hash,
            "message": f"Successfully restored {filename} from Version {target_ver} (Known-Good Snapshot)."
        }

    def get_summary_stats(self) -> Dict[str, int]:
        total = len(self.files)
        healthy = sum(1 for f in self.files.values() if f.status in [FileIntegrityStatus.HEALTHY, FileIntegrityStatus.RESTORED])
        modified = sum(1 for f in self.files.values() if f.status == FileIntegrityStatus.MODIFIED)
        deleted = sum(1 for f in self.files.values() if f.status == FileIntegrityStatus.DELETED)
        corrupted = sum(1 for f in self.files.values() if f.status == FileIntegrityStatus.CORRUPTED)
        recoverable = sum(1 for f in self.files.values() if f.is_recovery_available and f.status != FileIntegrityStatus.HEALTHY)
        unrecoverable = sum(1 for f in self.files.values() if not f.is_recovery_available and f.status != FileIntegrityStatus.HEALTHY)

        return {
            "total_files": total,
            "healthy": healthy,
            "modified": modified,
            "deleted": deleted,
            "corrupted": corrupted,
            "recoverable": recoverable,
            "unrecoverable": unrecoverable
        }

    def reset(self):
        self.files.clear()
        self.data_incident_timeline.clear()
        self._initialize_protected_vault()
