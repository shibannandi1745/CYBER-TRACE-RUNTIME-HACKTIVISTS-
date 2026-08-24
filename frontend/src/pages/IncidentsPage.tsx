import React from "react";
import { useSimulation } from "../context/SimulationContext";
import { Badge } from "../components/common/Badge";
import {
  FileText,
  Download,
  Printer,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";

export const IncidentsPage: React.FC = () => {
  const { state } = useSimulation();

  if (!state) return null;

  const { active_incident, threat_score, attack_path, containment, file_integrity } = state;

  const handleExportJSON = () => {
    if (!active_incident) return;
    const reportData = {
      incident: active_incident,
      threat_score,
      attack_path,
      containment,
      data_integrity_stats: file_integrity.stats,
      exported_at: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `CyberTrace_Incident_${active_incident.incident_id}.json`;
    a.click();
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-mono text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            INCIDENT INVESTIGATION DOSSIERS & FORENSIC REPORTS
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Automated Blast Radius Mapping • Containment Audit • Executive Summaries
          </p>
        </div>

        {active_incident && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportJSON}
              className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-300 font-mono text-xs border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>EXPORT JSON</span>
            </button>
            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>PRINT REPORT</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Incident Dossier */}
      {active_incident ? (
        <div className="cyber-card p-6 border-slate-800 bg-slate-950/95 space-y-6">
          {/* Dossier Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3 min-w-0">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap min-w-0">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40 shrink-0">
                  INCIDENT #{active_incident.incident_id}
                </span>
                <Badge label={active_incident.severity} variant="compromised" />
                <Badge label={active_incident.status} variant="protected" />
              </div>
              <h3 className="text-lg font-bold font-mono text-white mt-1.5 break-words">{active_incident.title}</h3>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono shrink-0">
              <div className="text-right">
                <div className="text-slate-400">THREAT SCORE:</div>
                <div className="text-xl font-bold text-rose-400">{active_incident.threat_score}/100</div>
              </div>
              <div className="text-right">
                <div className="text-slate-400">CONFIDENCE:</div>
                <div className="text-xl font-bold text-cyan-300">{active_incident.confidence_score.toFixed(0)}%</div>
              </div>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 min-w-0">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block mb-1">
              EXECUTIVE FORENSIC SUMMARY
            </span>
            <p className="text-xs font-mono text-slate-200 leading-relaxed break-words">
              {active_incident.executive_summary}
            </p>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 min-w-0">
              <div className="text-xs font-mono text-slate-400">AFFECTED FLOORS</div>
              <div className="text-lg font-bold font-mono text-white mt-1 break-words">
                Floors {active_incident.affected_floors.join(", ")}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">{active_incident.affected_floors.length} Building Levels</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 min-w-0">
              <div className="text-xs font-mono text-slate-400">AFFECTED HOSTS</div>
              <div className="text-lg font-bold font-mono text-rose-400 mt-1">
                {active_incident.affected_devices.length} Devices
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Identified in attack blast radius</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 min-w-0">
              <div className="text-xs font-mono text-slate-400">DATA IMPACT</div>
              <div className="text-lg font-bold font-mono text-amber-400 mt-1">
                {active_incident.data_impact_count} Files Impacted
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">{file_integrity.stats.recoverable} Recovery Snapshots Available</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 min-w-0">
              <div className="text-xs font-mono text-slate-400">CONTAINMENT MODE</div>
              <div className="text-lg font-bold font-mono text-emerald-400 mt-1 truncate">
                {active_incident.containment_mode.replace('_', ' ')}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {active_incident.containment_verified ? "✓ Attack Vector Severed" : "Active Containment Loop"}
              </div>
            </div>
          </div>

          {/* Reconstructed Attack Vector */}
          {active_incident.attack_path_summary && (
            <div className="space-y-2 min-w-0">
              <span className="text-xs uppercase font-mono text-slate-400 block">
                CORRELATED MULTI-HOP TRAVERSAL PATH
              </span>
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-300 font-bold break-words">
                {active_incident.attack_path_summary}
              </div>
            </div>
          )}

          {/* Detected Attack Techniques */}
          {active_incident.attack_techniques.length > 0 && (
            <div className="space-y-2 min-w-0">
              <span className="text-xs uppercase font-mono text-slate-400 block">
                IDENTIFIED ADVERSARY TECHNIQUES
              </span>
              <div className="flex flex-wrap gap-2">
                {active_incident.attack_techniques.map((tech: string, i: number) => (
                  <span key={i} className="px-2.5 py-1 rounded bg-slate-900 border border-rose-500/40 text-rose-300 text-xs font-mono break-words">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Containment Audit Trail */}
          {active_incident.containment_actions.length > 0 && (
            <div className="space-y-2 min-w-0">
              <span className="text-xs uppercase font-mono text-emerald-400 block flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Executed Containment Actions:</span>
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {active_incident.containment_actions.map((act: string, i: number) => (
                  <div key={i} className="p-2.5 rounded-lg bg-slate-900 border border-emerald-500/30 text-xs font-mono text-slate-200 break-words">
                    {act}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="cyber-card p-12 text-center border-slate-800">
          <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
          <h3 className="text-base font-bold font-mono text-white">NO ACTIVE INCIDENTS</h3>
          <p className="text-xs text-slate-400 font-mono mt-1">
            System baseline is nominal. Launch a scenario from the Attack Simulator to generate live incident reports.
          </p>
        </div>
      )}
    </div>
  );
};
