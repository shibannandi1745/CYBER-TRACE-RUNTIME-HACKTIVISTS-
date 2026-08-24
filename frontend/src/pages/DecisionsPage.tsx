import React from "react";
import { useSimulation } from "../context/SimulationContext";
import { Badge } from "../components/common/Badge";
import { ThreatGauge } from "../components/common/Gauge";
import { ScoreFactor } from "../types";
import {
  Brain,
  CheckCircle,
  ShieldCheck,
  ShieldAlert,
  GitFork,
  MapPin,
  Clock,
  Server,
  Zap,
} from "lucide-react";

export const DecisionsPage: React.FC = () => {
  const { state } = useSimulation();

  if (!state) return null;

  const { threat_score, attack_path, active_incident } = state;

  const questions = [
    {
      q: "1. What happened?",
      a: active_incident ? active_incident.title : "Normal baseline network telemetry observed across all floors.",
      icon: <Zap className="w-4 h-4 text-cyan-400" />,
    },
    {
      q: "2. Where did it happen?",
      a: active_incident
        ? `Traversed Floor(s) ${active_incident.affected_floors.join(", ")} targeting Datacenter & OT controllers.`
        : "Building facility operating within spatial baselines.",
      icon: <MapPin className="w-4 h-4 text-emerald-400" />,
    },
    {
      q: "3. When did it happen?",
      a: active_incident
        ? `Incident detected with active anomalies correlated over recent time window.`
        : "Continuous live monitoring active.",
      icon: <Clock className="w-4 h-4 text-amber-400" />,
    },
    {
      q: "4. Which devices are involved?",
      a: active_incident
        ? `${active_incident.affected_devices.join(", ")} (${active_incident.affected_devices.length} hosts)`
        : "All 27 devices healthy and reporting.",
      icon: <Server className="w-4 h-4 text-purple-400" />,
    },
    {
      q: "5. How are the events related?",
      a: active_incident
        ? `Correlated across temporal velocity, cross-VLAN routing, and physical floor ascension.`
        : "Uncorrelated standard background telemetry.",
      icon: <GitFork className="w-4 h-4 text-rose-400" />,
    },
    {
      q: "6. What is the probable attack path?",
      a: attack_path ? attack_path.nodes.join(" ➔ ") : "None detected.",
      icon: <GitFork className="w-4 h-4 text-cyan-400" />,
    },
    {
      q: "7. Why is it suspicious?",
      a: threat_score.reasons.join("; ") || "No suspicious anomalies flagged.",
      icon: <ShieldAlert className="w-4 h-4 text-amber-400" />,
    },
    {
      q: "8. What is the current threat score?",
      a: `${threat_score.overall_score}/100 (${threat_score.severity} Severity with ${threat_score.confidence.toFixed(0)}% Confidence)`,
      icon: <Brain className="w-4 h-4 text-rose-400" />,
    },
    {
      q: "9. What action is recommended?",
      a: threat_score.recommendation,
      icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />,
    },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-mono text-white flex items-center gap-2">
            <Brain className="w-5 h-5 text-cyan-400" />
            WHY DID AI TAKE THIS ACTION? (EXPLAINABLE AI ENGINE)
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Transparent Rule & Anomaly Formulation • Audit-Grade Threat Attribution
          </p>
        </div>
        <Badge
          label={`CONFIDENCE: ${threat_score.confidence.toFixed(0)}%`}
          variant={threat_score.confidence >= 80 ? "protected" : "suspicious"}
        />
      </div>

      {/* Main Grid: 9 Core Questions & Factor Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: The 9 Explainability Questions */}
        <div className="lg:col-span-7 space-y-3">
          <div className="text-xs uppercase font-mono text-slate-400 mb-2">
            EXPLAINABLE THREAT ANALYSIS MATRIX
          </div>
          {questions.map((item, idx) => (
            <div key={idx} className="cyber-card p-4 border-slate-800 hover:border-cyan-500/30 transition-all min-w-0">
              <div className="flex items-center gap-2 text-xs font-bold font-mono text-cyan-300 min-w-0">
                <span className="shrink-0">{item.icon}</span>
                <span className="break-words">{item.q}</span>
              </div>
              <p className="text-xs font-mono text-slate-300 mt-1.5 pl-6 leading-relaxed break-words">
                {item.a}
              </p>
            </div>
          ))}
        </div>

        {/* Right 5 Cols: Factor Score Breakdown & Recommendation */}
        <div className="lg:col-span-5 space-y-6">
          {/* Threat Gauge */}
          <div className="cyber-card p-5 border-slate-800 flex flex-col items-center text-center">
            <h3 className="text-xs font-bold font-mono uppercase text-slate-400 mb-3">
              EXPLAINABLE RISK COMPOSITION
            </h3>
            <ThreatGauge score={threat_score.overall_score} severity={threat_score.severity} size={140} />
            <div className="mt-3 text-xs font-mono text-cyan-300 font-bold">
              {threat_score.severity} SEVERITY THREAT
            </div>
          </div>

          {/* Evidence Checklist */}
          <div className="cyber-card p-5 border-slate-800">
            <h3 className="text-sm font-bold font-mono text-white mb-3 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>CORROBORATED EVIDENCE FACTORS</span>
            </h3>
            {threat_score.factors.length > 0 ? (
              <div className="space-y-2.5">
                {threat_score.factors.map((f: ScoreFactor, i: number) => (
                  <div key={i} className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between gap-3 min-w-0">
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold font-mono text-slate-200 break-words">✓ {f.name}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5 break-words">{f.evidence}</div>
                    </div>
                    <span className="text-xs font-bold font-mono text-rose-400 shrink-0 ml-2">+{f.points}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-slate-500 font-mono text-xs">
                No anomalous factors present.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
