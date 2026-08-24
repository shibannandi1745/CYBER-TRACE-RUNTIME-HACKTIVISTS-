import time
from typing import Optional, List, Dict, Callable
from ..models.alert import AlertItem, EscalationLevel, AlertStatus, AnalystAvailability
from ..models.threat import ThreatScore, ThreatSeverity


class EscalationManager:
    """
    Manages the 3-Stage Human-in-the-Loop alert lifecycle, countdown timers,
    analyst availability states, and autonomous containment triggers.
    """

    def __init__(self, on_autonomous_containment_trigger: Optional[Callable] = None):
        self.analyst_availability: AnalystAvailability = AnalystAvailability.AVAILABLE
        self.active_alert: Optional[AlertItem] = None
        self.alert_history: List[AlertItem] = []
        self.on_autonomous_containment_trigger = on_autonomous_containment_trigger
        self.alert_counter = 100
        self.stage_duration_seconds = 18.0  # Duration per alert stage in regular demo time

    def set_analyst_availability(self, status: AnalystAvailability):
        self.analyst_availability = status

    def evaluate_threat(
        self,
        incident_id: str,
        threat_score: ThreatScore,
        source_device: str,
        target_devices: List[str],
        attack_path_summary: str
    ) -> Optional[AlertItem]:
        """
        Evaluates current threat score and either creates, updates, or ticks active alert.
        """
        now = time.time()

        # If no critical or high threat, clear or keep history
        if threat_score.overall_score < 40 and not self.active_alert:
            return None

        # If no active alert exists and threat score >= 40, initiate Alert Level 1
        if not self.active_alert and threat_score.overall_score >= 40:
            self.alert_counter += 1
            duration = 10.0 if self.analyst_availability in [AnalystAvailability.AWAY, AnalystAvailability.OFFLINE] else self.stage_duration_seconds
            
            self.active_alert = AlertItem(
                alert_id=f"ALT-{self.alert_counter}",
                incident_id=incident_id,
                stage=EscalationLevel.LEVEL_1,
                max_stage=3,
                threat_score=threat_score.overall_score,
                title="Stage 1/3: Suspicious Cyber Activity Detected",
                message="Multiple authentication anomalies and unauthorized lateral probing detected. Analyst review required.",
                source_device=source_device,
                target_devices=target_devices,
                attack_path_summary=attack_path_summary,
                recommended_actions=[
                    f"Inspect telemetry from {source_device}",
                    "Approve preemptive isolation of suspicious host"
                ],
                created_at=now,
                expires_at=now + duration,
                timeout_seconds=duration,
                seconds_remaining=duration,
                status=AlertStatus.PENDING,
                evidence_summary=threat_score.reasons
            )
            return self.active_alert

        # If active alert already exists, tick its countdown and check escalation
        if self.active_alert and self.active_alert.status == AlertStatus.PENDING:
            # Update live threat score and evidence
            self.active_alert.threat_score = threat_score.overall_score
            self.active_alert.evidence_summary = threat_score.reasons

            # Calculate remaining seconds
            remaining = max(0.0, self.active_alert.expires_at - now)
            self.active_alert.seconds_remaining = round(remaining, 1)

            # Check if timer expired for current stage
            if remaining <= 0:
                self._handle_stage_timeout(now, threat_score, source_device, target_devices, attack_path_summary)

        return self.active_alert

    def _handle_stage_timeout(
        self,
        now: float,
        threat_score: ThreatScore,
        source_device: str,
        target_devices: List[str],
        attack_path_summary: str
    ):
        current_stage = self.active_alert.stage

        if current_stage == EscalationLevel.LEVEL_1:
            # Escalate to Stage 2
            self.active_alert.stage = EscalationLevel.LEVEL_2
            self.active_alert.siren_silenced = False  # Reset siren silence state for fresh Siren 2 sound
            self.active_alert.title = "Stage 2/3: Escalated Security Alert - Threat Active"
            self.active_alert.message = "Threat activity escalating across network segments. Analyst response urgently required."
            duration = 10.0 if self.analyst_availability in [AnalystAvailability.AWAY, AnalystAvailability.OFFLINE] else self.stage_duration_seconds
            self.active_alert.expires_at = now + duration
            self.active_alert.timeout_seconds = duration
            self.active_alert.seconds_remaining = duration
            self.active_alert.recommended_actions = [
                f"Isolate {source_device} immediately",
                "Sever routing path to Datacenter VLAN-30"
            ]

        elif current_stage == EscalationLevel.LEVEL_2:
            # Escalate to Stage 3 (Final Warning before Autonomous Containment)
            self.active_alert.stage = EscalationLevel.LEVEL_3
            self.active_alert.siren_silenced = False  # Reset siren silence state for fresh Siren 3 sound
            self.active_alert.title = "Stage 3/3: CRITICAL FINAL NOTICE - Autonomous Containment Imminent"
            self.active_alert.message = "No analyst response received. Threat score critical. Autonomous AI containment will engage upon timer expiration."
            duration = 8.0 if self.analyst_availability in [AnalystAvailability.AWAY, AnalystAvailability.OFFLINE] else 12.0
            self.active_alert.expires_at = now + duration
            self.active_alert.timeout_seconds = duration
            self.active_alert.seconds_remaining = duration
            self.active_alert.recommended_actions = [
                "[ANALYST INTERVENTION] Approve manual containment or override",
                "[AI AUTONOMOUS] Predefined reversible quarantine & route block executing soon"
            ]

        elif current_stage == EscalationLevel.LEVEL_3:
            # Trigger Autonomous Containment!
            self.active_alert.status = AlertStatus.AUTONOMOUS_TRIGGERED
            self.active_alert.autonomous_action_executed = True
            self.active_alert.title = "Autonomous Containment Activated"
            self.active_alert.message = "Analyst timeout reached after 3 escalating alerts. Predefined reversible containment successfully executed by AI defense engine."
            
            if self.on_autonomous_containment_trigger:
                self.on_autonomous_containment_trigger(
                    incident_id=self.active_alert.incident_id,
                    source_device=source_device,
                    target_devices=target_devices
                )

    def silence_siren(self) -> Optional[AlertItem]:
        if self.active_alert:
            self.active_alert.siren_silenced = True
        return self.active_alert

    def analyst_acknowledge(self, analyst_name: str = "SOC_Analyst") -> AlertItem:
        if self.active_alert:
            self.active_alert.status = AlertStatus.ACKNOWLEDGED
            self.active_alert.analyst_action_taken = f"Acknowledged by {analyst_name}"
            self.active_alert.analyst_action_timestamp = time.time()
            # Pauses autonomous timeout
            self.active_alert.seconds_remaining = 999.0
        return self.active_alert

    def analyst_approve_containment(self, analyst_name: str = "SOC_Analyst") -> AlertItem:
        if self.active_alert:
            self.active_alert.status = AlertStatus.APPROVED
            self.active_alert.analyst_action_taken = f"Containment Approved by {analyst_name}"
            self.active_alert.analyst_action_timestamp = time.time()
        return self.active_alert

    def analyst_reject(self, reason: str = "False Positive", analyst_name: str = "SOC_Analyst") -> AlertItem:
        if self.active_alert:
            self.active_alert.status = AlertStatus.REJECTED
            self.active_alert.analyst_action_taken = f"Rejected ({reason}) by {analyst_name}"
            self.active_alert.analyst_action_timestamp = time.time()
            self.alert_history.append(self.active_alert)
            self.active_alert = None
        return None

    def reset(self):
        if self.active_alert:
            self.alert_history.append(self.active_alert)
        self.active_alert = None
