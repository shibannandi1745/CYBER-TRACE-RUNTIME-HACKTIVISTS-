import time
from typing import Dict, List, Optional
from ..models.threat import ThreatScore, ThreatSeverity, ScoreFactor
from ..models.device import Device, DeviceCriticality
from ..detection.correlation_engine import CorrelatedThreatIncident


class ThreatScorer:
    """
    Computes an explainable 0-100 threat/risk score based on correlated evidence,
    device criticality, spatial movement, and attack severity factors.
    """

    def __init__(self, devices: Dict[str, Device]):
        self.devices = devices

    def calculate_score(self, incident: Optional[CorrelatedThreatIncident]) -> ThreatScore:
        if not incident or not incident.events:
            return ThreatScore(
                overall_score=0,
                severity=ThreatSeverity.LOW,
                confidence=100.0,
                factors=[],
                reasons=["Environment operating within normal baseline activity."],
                affected_devices_count=0,
                affected_floors=[],
                critical_assets_at_risk=[],
                calculated_at=time.time(),
                recommendation="Continue automated AI defense monitoring."
            )

        factors: List[ScoreFactor] = []
        reasons: List[str] = []
        raw_score = 0

        # Factor 1: Authentication Anomaly
        if any("Authentication" in t for t in incident.techniques_detected):
            pts = 15
            raw_score += pts
            factors.append(ScoreFactor(
                name="Authentication Anomaly",
                category="Authentication",
                points=pts,
                description="Repeated failed logins followed by unusual successful authentication from untrusted subnet.",
                evidence=f"Origin device: {incident.origin_device}"
            ))
            reasons.append("Multiple failed authentication attempts & anomalous login")

        # Factor 2: New Network Relationship / Lateral Movement
        if any("Lateral Movement" in t for t in incident.techniques_detected):
            pts = 15
            raw_score += pts
            factors.append(ScoreFactor(
                name="New Network Relationship",
                category="Network",
                points=pts,
                description="Unauthorized routing tunnel and lateral pivot across network segments.",
                evidence=f"Segments crossed: {', '.join(incident.segments_crossed)}"
            ))
            reasons.append("Unauthorized cross-segment routing tunnel established")

        # Factor 3: Cross-Floor Spatial Movement
        if len(incident.floors_traversed) >= 2:
            pts = 10
            raw_score += pts
            floors_str = ", ".join(f"Floor {f}" for f in sorted(incident.floors_traversed))
            factors.append(ScoreFactor(
                name="Cross-Floor Spatial Traversal",
                category="Spatial",
                points=pts,
                description="Threat activity physically traversed multiple building floors in sequence.",
                evidence=f"Traversed: {floors_str}"
            ))
            reasons.append(f"Spatial traversal across multiple building levels ({floors_str})")

        # Factor 4: Critical Infrastructure / Server Access
        critical_assets: List[str] = []
        for dev_id in incident.target_devices:
            if dev_id in self.devices and self.devices[dev_id].criticality in [DeviceCriticality.HIGH, DeviceCriticality.CRITICAL]:
                critical_assets.append(dev_id)

        if critical_assets:
            pts = 20
            raw_score += pts
            factors.append(ScoreFactor(
                name="Critical Server & Infrastructure Compromise",
                category="Criticality",
                points=pts,
                description="High-value production servers and core switches targeted by unauthorized sessions.",
                evidence=f"Targeted assets: {', '.join(critical_assets)}"
            ))
            reasons.append(f"Targeted critical assets: {', '.join(critical_assets)}")

        # Factor 5: Data Destruction / Tampering
        if incident.data_destruction_detected:
            pts = 20
            raw_score += pts
            factors.append(ScoreFactor(
                name="Data Modification / Destruction Activity",
                category="Data",
                points=pts,
                description="Unauthorized file overwrites, deletions, or ransomware encryption behavior.",
                evidence="Impacted files detected on FileServer-303"
            ))
            reasons.append("Critical file modification / deletion detected on secure storage vault")

        # Factor 6: Physical Controller / OT Targeting
        if incident.physical_sabotage_detected:
            pts = 10
            raw_score += pts
            factors.append(ScoreFactor(
                name="Physical OT & Access Controller Sabotage",
                category="Physical",
                points=pts,
                description="Tampering with smart door access controls, CCTV video streams, or BMS HVAC plant.",
                evidence="Floor 4 OT / Door controller commands executed"
            ))
            reasons.append("Physical security door / CCTV controller targeted")

        # Factor 7: Anomaly Velocity / High Frequency
        if len(incident.events) >= 5:
            pts = 10
            raw_score += pts
            factors.append(ScoreFactor(
                name="High Attack Velocity",
                category="Velocity",
                points=pts,
                description="Sustained burst of high-severity anomalous telemetry within a short time window.",
                evidence=f"{len(incident.events)} correlated security events in active session"
            ))
            reasons.append(f"High event velocity ({len(incident.events)} correlated anomalies)")

        # Cap score at 100
        final_score = min(100, max(0, raw_score))

        # Determine Severity
        if final_score >= 81:
            severity = ThreatSeverity.CRITICAL
            recommendation = "Autonomous isolation of origin device and firewall route blocking recommended immediately."
        elif final_score >= 61:
            severity = ThreatSeverity.HIGH
            recommendation = "Security analyst review required; prepare device containment."
        elif final_score >= 31:
            severity = ThreatSeverity.MEDIUM
            recommendation = "Investigate suspicious login activity and monitor lateral hops."
        else:
            severity = ThreatSeverity.LOW
            recommendation = "Log events and observe baseline behavior."

        # Confidence calculation
        confidence = 94.0
        if incident.missing_hops:
            confidence = max(50.0, 94.0 - (len(incident.missing_hops) * 15.0))

        # Update risk scores on affected devices
        if incident.origin_device in self.devices:
            self.devices[incident.origin_device].risk_score = final_score
            self.devices[incident.origin_device].threat_reasons = reasons

        for target_id in incident.target_devices:
            if target_id in self.devices:
                self.devices[target_id].risk_score = min(100, int(final_score * 0.85))

        return ThreatScore(
            overall_score=final_score,
            severity=severity,
            confidence=confidence,
            factors=factors,
            reasons=reasons,
            affected_devices_count=1 + len(incident.target_devices),
            affected_floors=sorted(list(incident.floors_traversed)),
            critical_assets_at_risk=critical_assets,
            calculated_at=time.time(),
            recommendation=recommendation
        )
