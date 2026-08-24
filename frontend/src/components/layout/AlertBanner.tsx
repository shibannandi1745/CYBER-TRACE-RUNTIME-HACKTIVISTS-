import React from "react";
import { useSimulation } from "../../context/SimulationContext";
import { AlertTriangle, Clock, CheckCircle2, XCircle, ArrowRight, ShieldCheck, VolumeX, Volume2 } from "lucide-react";

export const AlertBanner: React.FC = () => {
  const { state, acknowledgeAlert, approveContainment, rejectAlert, setActiveTab, unIsolateDevice, sirenState, silenceSiren, playSiren } = useSimulation();

  const alert = state?.active_alert;
  if (!alert) return null;

  const isAutonomous = alert.status === "AUTONOMOUS_TRIGGERED";
  const isAcknowledged = alert.status === "ACKNOWLEDGED";

  const stageHeaderLabel = {
    1: "SECURITY ALERT 1 OF 3",
    2: "SECURITY ALERT 2 OF 3",
    3: "CRITICAL SECURITY ALERT — 3 OF 3",
  }[alert.stage] || `SECURITY ALERT ${alert.stage} OF 3`;

  const stageColor = {
    1: "border-amber-500/50 bg-amber-950/90 text-amber-300",
    2: "border-orange-500/60 bg-orange-950/90 text-orange-300",
    3: "border-rose-500/80 bg-rose-950/95 text-rose-200",
  }[alert.stage] || "border-rose-500/80 bg-rose-950/95 text-rose-200";

  return (
    <div
      className={`mx-4 my-3 p-4 rounded-xl border shadow-2xl backdrop-blur-md transition-all ${
        isAutonomous
          ? "border-emerald-500/60 bg-emerald-950/90 shadow-[0_0_30px_rgba(16,185,129,0.25)]"
          : `${stageColor} shadow-[0_0_30px_rgba(244,63,94,0.3)]`
      }`}
    >
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        {/* Left Info */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className={`p-2.5 rounded-xl shrink-0 ${isAutonomous ? "bg-emerald-900/60 text-emerald-300 border border-emerald-500/40" : "bg-rose-900/60 text-rose-300 border border-rose-500/40"}`}>
            {isAutonomous ? <ShieldCheck className="w-6 h-6 animate-pulse" /> : <AlertTriangle className="w-6 h-6 animate-bounce" />}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold uppercase tracking-wider shrink-0 ${isAutonomous ? "bg-emerald-900 text-emerald-200" : "bg-rose-900 text-rose-200"}`}>
                {isAutonomous ? "AUTONOMOUS CONTAINMENT ENGAGED" : stageHeaderLabel}
              </span>
              <span className="text-xs font-mono text-slate-300 shrink-0">
                Incident <span className="font-bold text-white">#{alert.incident_id}</span>
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-900/80 text-cyan-300 border border-cyan-500/30 shrink-0">
                Threat Score: {alert.threat_score}/100
              </span>

              {/* Siren Visual Indicator */}
              {!isAutonomous && (
                <div className="shrink-0">
                  {sirenState === "PLAYING" && (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-mono bg-rose-950/90 text-rose-300 border border-rose-500/50 font-bold animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                      SIREN: ● ACTIVE
                    </span>
                  )}
                  {sirenState === "SILENCED" && (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-mono bg-amber-950/90 text-amber-300 border border-amber-500/50 font-bold">
                      <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                      SIREN: ● SILENCED
                    </span>
                  )}
                  {sirenState === "IDLE" && (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-mono bg-slate-900 text-slate-400 border border-slate-700">
                      <span className="w-2 h-2 rounded-full bg-slate-500"></span>
                      SIREN: ● READY
                    </span>
                  )}
                </div>
              )}
            </div>
            <h2 className="text-base font-bold font-mono text-white mt-1 break-words">{alert.title}</h2>
            <p className="text-xs text-slate-300 mt-0.5 break-words">{alert.message}</p>
            {alert.attack_path_summary && (
              <div className="mt-2 text-xs font-mono text-slate-300 flex items-center gap-1.5 flex-wrap min-w-0">
                <span className="text-slate-400 font-semibold shrink-0">ATTACK PATH:</span>
                <span className="text-cyan-300 bg-slate-900/90 px-2 py-0.5 rounded border border-slate-700 break-words max-w-full">
                  {alert.attack_path_summary}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right Countdown & Action Controls */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">
          {/* Live Countdown Timer if Pending */}
          {!isAutonomous && !isAcknowledged && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900/90 border border-slate-700 font-mono text-xs">
              <Clock className="w-4 h-4 text-amber-400 animate-spin" />
              <div>
                <div className="text-[10px] text-slate-400">AUTONOMOUS TIMEOUT:</div>
                <div className="text-sm font-bold text-amber-300">
                  00:{alert.seconds_remaining.toFixed(0).padStart(2, "0")}s
                </div>
              </div>
            </div>
          )}

          {isAcknowledged && (
            <div className="px-3 py-2 rounded-lg bg-slate-900/90 border border-emerald-500/40 text-emerald-400 font-mono text-xs flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Analyst Reviewing (Timeout Paused)</span>
            </div>
          )}

          {/* Action Buttons */}
          {!isAutonomous && (
            <div className="flex items-center gap-2 flex-wrap max-w-full">
              {/* SIREN OFF BUTTON */}
              {sirenState === "SILENCED" ? (
                <button
                  onClick={playSiren}
                  className="px-3 py-2 rounded-lg bg-amber-950/80 hover:bg-amber-900 text-amber-300 font-mono text-xs font-bold border border-amber-500/50 transition-colors flex items-center gap-1.5 shrink-0"
                  title="Siren is Silenced. Click to test/replay siren."
                >
                  <VolumeX className="w-4 h-4 text-amber-400" />
                  <span>Siren Silenced</span>
                </button>
              ) : (
                <button
                  onClick={silenceSiren}
                  className="px-3 py-2 rounded-lg bg-rose-950 hover:bg-rose-900 text-rose-200 font-mono text-xs font-bold border border-rose-500/60 shadow-[0_0_12px_rgba(244,63,94,0.4)] transition-all flex items-center gap-1.5 shrink-0 animate-pulse"
                  title="Silence Siren Audio (Keeps Alert Active)"
                >
                  <VolumeX className="w-4 h-4 text-rose-300" />
                  <span>🔇 SIREN OFF</span>
                </button>
              )}

              {!isAcknowledged && (
                <button
                  onClick={acknowledgeAlert}
                  className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs font-semibold border border-slate-600 transition-colors shrink-0"
                >
                  ACKNOWLEDGE
                </button>
              )}
              <button
                onClick={() => setActiveTab("replay")}
                className="px-3 py-2 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 font-mono text-xs font-semibold border border-cyan-500/40 transition-colors flex items-center gap-1 shrink-0"
              >
                <span>START REPLAY</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setActiveTab("reconstruction")}
                className="px-3 py-2 rounded-lg bg-purple-950/80 hover:bg-purple-900 text-purple-300 font-mono text-xs font-semibold border border-purple-500/40 transition-colors flex items-center gap-1 shrink-0"
              >
                <span>RECONSTRUCTION</span>
              </button>
              <button
                onClick={approveContainment}
                className="px-3.5 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-mono text-xs font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all flex items-center gap-1.5 shrink-0"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>APPROVE CONTAINMENT</span>
              </button>
              <button
                onClick={() => rejectAlert("Analyst marked as False Positive")}
                className="px-2.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-rose-400 font-mono text-xs transition-colors shrink-0"
                title="Dismiss Alert"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>

          )}

          {isAutonomous && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab("decisions")}
                className="px-3 py-2 rounded-lg bg-emerald-900 hover:bg-emerald-800 text-emerald-200 font-mono text-xs font-semibold border border-emerald-500/40"
              >
                VIEW AI DECISION LOG
              </button>
              {alert.source_device && (
                <button
                  onClick={() => unIsolateDevice(alert.source_device)}
                  className="px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-400 border border-amber-500/40 font-mono text-xs font-semibold"
                >
                  ROLLBACK CONTAINMENT
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
