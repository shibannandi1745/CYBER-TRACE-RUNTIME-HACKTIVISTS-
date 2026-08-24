import React from "react";
import { useSimulation } from "../../context/SimulationContext";
import {
  LayoutDashboard,
  Building2,
  GitFork,
  AlertTriangle,
  Brain,
  FileCheck2,
  RotateCcw,
  FileText,
  Clock,
  ScrollText,
  ShieldCheck,
  PlayCircle,
  SearchCode,
  Volume2,
  VolumeX,
} from "lucide-react";

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, state, sirenState, silenceSiren, playSiren } = useSimulation();


  const activeAlertCount = state?.active_alert ? 1 : 0;
  const impactedFilesCount = state?.file_integrity?.stats
    ? state.file_integrity.stats.corrupted + state.file_integrity.stats.deleted + state.file_integrity.stats.modified
    : 0;
  const activeIncidentCount = state?.active_incident && state.active_incident.status !== "CLOSED" ? 1 : 0;

  const investigationItems = [
    { id: "timeline", label: "Attack Timeline", icon: <Clock className="w-4 h-4" /> },
    { id: "replay", label: "Forensic Replay", icon: <PlayCircle className="w-4 h-4" />, badge: "STEP-BY-STEP", badgeColor: "bg-cyan-950 text-cyan-300 border border-cyan-500/40" },
    { id: "reconstruction", label: "Reconstruction", icon: <SearchCode className="w-4 h-4" />, badge: "EVIDENCE", badgeColor: "bg-purple-950 text-purple-300 border border-purple-500/40" },
  ];

  const navItems = [
    { id: "overview", label: "Overview", icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: "building", label: "Live Building", icon: <Building2 className="w-4 h-4" /> },
    { id: "graph", label: "Attack Graph", icon: <GitFork className="w-4 h-4" /> },
    {
      id: "alerts",
      label: "Alert Center",
      icon: <AlertTriangle className="w-4 h-4" />,
      badge: activeAlertCount > 0 ? `${state?.active_alert?.stage}/3` : undefined,
      badgeColor: "bg-rose-500 text-white animate-pulse",
    },
    { id: "decisions", label: "AI Decisions", icon: <Brain className="w-4 h-4" /> },
    {
      id: "integrity",
      label: "Data Integrity",
      icon: <FileCheck2 className="w-4 h-4" />,
      badge: impactedFilesCount > 0 ? `${impactedFilesCount}` : undefined,
      badgeColor: "bg-amber-500 text-slate-950 font-bold",
    },
    { id: "recovery", label: "Recovery Center", icon: <RotateCcw className="w-4 h-4" /> },
    {
      id: "incidents",
      label: "Incidents",
      icon: <FileText className="w-4 h-4" />,
      badge: activeIncidentCount > 0 ? "1 ACTIVE" : undefined,
      badgeColor: "bg-cyan-500 text-slate-950 font-semibold",
    },
    { id: "audit", label: "Audit Log", icon: <ScrollText className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-64 bg-slate-950/80 border-r border-slate-800/80 flex flex-col flex-shrink-0 h-full select-none">
      {/* Navigation Links */}
      <div className="p-3 space-y-3 flex-1 overflow-y-auto">
        {/* Core SOC Operations */}
        <div className="space-y-1">
          <div className="px-3 py-1.5 text-[10px] uppercase font-mono tracking-widest text-slate-500">
            SOC Operations
          </div>
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-mono font-medium transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-cyan-950/80 to-slate-900 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_-3px_rgba(0,240,255,0.25)]"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <span className={`shrink-0 ${isActive ? "text-cyan-400" : "text-slate-400"}`}>{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 ml-1 ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* C-04 Forensic Investigation Suite */}
        <div className="space-y-1 pt-2 border-t border-slate-800/60">
          <div className="px-3 py-1.5 text-[10px] uppercase font-mono tracking-widest text-purple-400 font-bold flex items-center justify-between">
            <span>C-04 Investigation</span>
          </div>
          {investigationItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-mono font-medium transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-purple-950/80 to-slate-900 text-purple-300 border border-purple-500/40 shadow-[0_0_15px_-3px_rgba(168,85,247,0.25)]"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <span className={`shrink-0 ${isActive ? "text-purple-400" : "text-slate-400"}`}>{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold shrink-0 ml-1 ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>


      {/* Emergency Siren Controller in Sidebar */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950">
        {sirenState === "PLAYING" ? (
          <button
            onClick={silenceSiren}
            className="w-full py-2 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold border border-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.5)] transition-all flex items-center justify-center gap-2 animate-pulse"
          >
            <VolumeX className="w-4 h-4 animate-spin" />
            <span>SILENCE ACTIVE SIREN</span>
          </button>
        ) : (
          <button
            onClick={playSiren}
            className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-rose-950 to-slate-900 hover:from-rose-900 hover:to-slate-850 text-rose-300 hover:text-white font-mono text-xs font-bold border border-rose-500/50 hover:border-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.25)] transition-all flex items-center justify-center gap-2"
          >
            <Volume2 className="w-4 h-4 text-rose-400 animate-pulse" />
            <span>TEST EMERGENCY SIREN</span>
          </button>
        )}
      </div>

      {/* System Engine Status Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-900/40">
        <div className="cyber-card p-2.5 text-[11px] font-mono border-emerald-500/20">
          <div className="flex items-center justify-between text-emerald-400 font-semibold mb-1">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              ENGINE STATUS
            </span>
            <span className="text-[10px] px-1 bg-emerald-950 rounded border border-emerald-500/30">ONLINE</span>
          </div>
          <div className="text-[10px] text-slate-400 space-y-0.5">
            <div>Floors Monitored: 4</div>
            <div>Devices Tracked: {state ? Object.keys(state.devices).length : 27}</div>
            <div>Deduplicated: {state?.system_status.duplicates_dropped || 0} pkts</div>
          </div>
        </div>
      </div>
    </aside>
  );
};

