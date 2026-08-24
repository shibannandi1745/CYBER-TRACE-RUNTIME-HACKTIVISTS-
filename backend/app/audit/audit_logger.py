import time
from typing import List, Dict, Optional
from ..models.audit import AuditEntry, AuditActor, AuditAction


class AuditLogger:
    """
    Maintains an immutable simulated audit ledger of all security actions,
    analyst approvals/rejections, and autonomous AI containment events.
    """

    def __init__(self):
        self.logs: List[AuditEntry] = []
        self.entry_counter = 5000
        self._add_system_boot_entries()

    def _add_system_boot_entries(self):
        now = time.time() - 300
        self.record_entry(
            actor=AuditActor.SYSTEM,
            action=AuditAction.RESET_SIMULATION,
            target="Building-Digital-Twin-4F",
            reason="Platform initialization & security monitoring baseline established",
            result="SUCCESS"
        )
        self.record_entry(
            actor=AuditActor.AI,
            action=AuditAction.PROTECT_ASSET,
            target="BackupVault-304",
            reason="Air-gap policy enforcement on disaster recovery vault",
            result="SUCCESS"
        )

    def record_entry(
        self,
        actor: AuditActor,
        action: AuditAction,
        target: str,
        reason: str,
        result: str = "SUCCESS",
        incident_id: Optional[str] = None,
        details: Optional[Dict[str, any]] = None
    ) -> AuditEntry:
        self.entry_counter += 1
        now = time.time()
        formatted_time = time.strftime("%H:%M:%S", time.localtime(now))

        entry = AuditEntry(
            audit_id=f"AUD-{self.entry_counter}",
            timestamp=now,
            formatted_time=formatted_time,
            actor=actor,
            action=action,
            target=target,
            incident_id=incident_id,
            reason=reason,
            result=result,
            details=details or {}
        )
        self.logs.insert(0, entry)  # Prepend newest first
        return entry

    def get_logs(self, actor: Optional[AuditActor] = None, limit: int = 100) -> List[AuditEntry]:
        if actor:
            return [l for l in self.logs if l.actor == actor][:limit]
        return self.logs[:limit]

    def reset(self):
        self.logs.clear()
        self._add_system_boot_entries()
