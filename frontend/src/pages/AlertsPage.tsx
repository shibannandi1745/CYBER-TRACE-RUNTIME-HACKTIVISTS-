import React from "react";
import { useSimulation } from "../context/SimulationContext";
import { Badge } from "../components/common/Badge";
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  User,
  VolumeX,
  Volume2,
} from "lucide-react";

export const AlertsPage: React.FC = () => {
  const { state, acknowledgeAlert, approveContainment, rejectAlert, setActiveTab, sirenState, silenceSiren, playSiren } = useSimulation();

  if (!state) return null;

  const { active_alert } = state;

  const stageHeaderLabel = active_alert ? {
    1: "SECURITY ALERT 1 OF 3",
    2: "SECURITY ALERT 2 OF 3",
    3: "CRITICAL SECURITY ALERT — 3 OF 3",
  }[active_alert.stage] || `SECURITY ALERT ${active_alert.stage} OF 3` : "";

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold font-mono text-white flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
          3-STAGE HUMAN-IN-THE-LOOP ALERT ESCALATION QUEUE
        </h2>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          Progressive Escalation Protocol • Autonomous Containment Safeguards
        </p>
      </div>

      {/* Active Escalating Alert */}
      {active_alert ? (
        <div className="cyber-card p-6 border-rose-500/50 bg-slate-950/95 shadow-[0_0_30px_rgba(244,63,94,0.2)]">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="p-2 rounded-xl bg-rose-950 text-rose-400 border border-rose-500/50 shrink-0">
                <AlertTriangle className="w-6 h-6 animate-pulse" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge label={stageHeaderLabel} variant="compromised" />
                  <span className="text-xs font-mono text-slate-400 shrink-0">Incident #{active_alert.incident_id}</span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-900 text-cyan-300 border border-cyan-500/30 shrink-0">
                    Threat Score: {active_alert.threat_score}/100
                  </span>

                  {/* Siren Visual Indicator */}
                  <div className="shrink-0">
                    {sirenState === "PLAYING" && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-mono bg-rose-950/90 text-rose-300 border border-rose-500/50 font-bold animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                        SIREN: ● ACTIVE
                      </span>
                    )}
                    {sirenState === "SILENCED" && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-mono bg-amber-950/90 text-amber-300 border border-amber-500/50 font-bold">
                        <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                        SIREN: ● SILENCED
                      </span>
                    )}
                    {sirenState === "IDLE" && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-mono bg-slate-900 text-slate-400 border border-slate-700">
                        <span className="w-2 h-2 rounded-full bg-slate-500"></span>
                        SIREN: ● READY
                      </span>
                    )}
                  </div>
                </div>
                <h3 className="text-lg font-bold font-mono text-white mt-1 break-words">{active_alert.title}</h3>
              </div>
            </div>

            {/* Countdown HUD */}
            <div className="flex items-center gap-3 bg-slate-900 px-4 py-2 rounded-xl border border-slate-800 shrink-0">
              <Clock className="w-5 h-5 text-amber-400 animate-spin shrink-0" />
              <div>
                <div className="text-[10px] uppercase font-mono text-slate-400">AUTONOMOUS TIMEOUT:</div>
                <div className="text-base font-bold font-mono text-amber-300">
                  00:{active_alert.seconds_remaining.toFixed(0).padStart(2, "0")}s
                </div>
              </div>
            </div>
          </div>

          {/* Body Content */}
          <div className="py-4 space-y-4">
            <p className="text-xs font-mono text-slate-300 leading-relaxed break-words">{active_alert.message}</p>

            {/* Attack Path Details */}
            {active_alert.attack_path_summary && (
              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 min-w-0">
                <span className="text-[11px] uppercase font-mono text-slate-400 block mb-1">
                  Correlated Attack Path:
                </span>
                <span className="text-xs font-mono text-cyan-300 font-bold break-words">{active_alert.attack_path_summary}</span>
              </div>
            )}

            {/* Recommended Actions */}
            <div>
              <span className="text-[11px] uppercase font-mono text-slate-400 block mb-2">
                Recommended Containment Procedures:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {active_alert.recommended_actions.map((rec: string, i: number) => (
                  <div key={i} className="p-2.5 rounded-lg bg-slate-900/50 border border-slate-800 text-xs font-mono text-slate-300 flex items-center gap-2 min-w-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span className="break-words">{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons Footer */}
          <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 min-w-0">
            <div className="text-xs font-mono text-slate-400 flex items-center gap-1.5 min-w-0 flex-1">
              <User className="w-4 h-4 text-cyan-400 shrink-0" />
              <span className="break-words">Analyst in command. AI awaits input or timeout escalation.</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* SIREN OFF BUTTON */}
              {sirenState === "SILENCED" ? (
                <button
                  onClick={playSiren}
                  className="px-4 py-2 rounded-lg bg-amber-950/80 hover:bg-amber-900 text-amber-300 font-mono text-xs font-bold border border-amber-500/50 transition-colors flex items-center gap-1.5"
                  title="Siren is Silenced. Click to test/replay siren."
                >
                  <VolumeX className="w-4 h-4 text-amber-400" />
                  <span>[Siren Silenced]</span>
                </button>
              ) : (
                <button
                  onClick={silenceSiren}
                  className="px-4 py-2 rounded-lg bg-rose-950 hover:bg-rose-900 text-rose-200 font-mono text-xs font-bold border border-rose-500/60 shadow-[0_0_12px_rgba(244,63,94,0.4)] transition-all flex items-center gap-1.5 animate-pulse"
                  title="Silence Siren Audio (Keeps Alert Active)"
                >
                  <VolumeX className="w-4 h-4 text-rose-300" />
                  <span>[🔇 SIREN OFF]</span>
                </button>
              )}

              <button
                onClick={acknowledgeAlert}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs font-bold border border-slate-600 transition-colors"
              >
                [ACKNOWLEDGE]
              </button>
              <button
                onClick={() => setActiveTab("graph")}
                className="px-4 py-2 rounded-lg bg-cyan-950 hover:bg-cyan-900 text-cyan-300 font-mono text-xs font-bold border border-cyan-500/40 transition-colors flex items-center gap-1"
              >
                <span>[INVESTIGATE]</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={approveContainment}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white font-mono text-xs font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>[APPROVE CONTAINMENT]</span>
              </button>
              <button
                onClick={() => rejectAlert("Analyst Dismissed")}
                className="px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-rose-400 font-mono text-xs border border-rose-500/30 transition-colors"
              >
                [REJECT]
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="cyber-card p-12 text-center border-slate-800">
          <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
          <h3 className="text-base font-bold font-mono text-white">NO ACTIVE ESCALATIONS IN QUEUE</h3>
          <p className="text-xs text-slate-400 font-mono mt-1 max-w-md mx-auto">
            Environment telemetry is monitored 24/7 by the AI Defense Engine. Escalation alerts will queue when threat scores exceed threshold.
          </p>
        </div>
      )}

      {/* Escalation Stage Architecture Reference */}
      <div className="cyber-card p-5 border-slate-800">
        <h3 className="text-sm font-bold font-mono text-cyan-400 mb-3 uppercase">
          Escalation Protocol Architecture
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          <div className="p-3.5 rounded-lg bg-slate-900 border border-amber-500/30 space-y-1">
            <div className="text-amber-400 font-bold">STAGE 1: WARNING</div>
            <p className="text-slate-400 text-[11px]">
              Initial anomaly detection. Initiates 18s countdown for human analyst acknowledgement.
            </p>
          </div>
          <div className="p-3.5 rounded-lg bg-slate-900 border border-orange-500/30 space-y-1">
            <div className="text-orange-400 font-bold">STAGE 2: ESCALATED ALERT</div>
            <p className="text-slate-400 text-[11px]">
              Lateral threat activity confirmed. Urgently requests human approval for device isolation.
            </p>
          </div>
          <div className="p-3.5 rounded-lg bg-slate-900 border border-rose-500/40 space-y-1">
            <div className="text-rose-400 font-bold">STAGE 3: AUTONOMOUS FAILSAFE</div>
            <p className="text-slate-400 text-[11px]">
              Final warning. If analyst remains unavailable, AI executes predefined reversible containment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
