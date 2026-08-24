import React from "react";
import { useSimulation } from "../context/SimulationContext";
import { Badge } from "../components/common/Badge";
import { StatCard } from "../components/common/StatCard";
import { ProtectedFile } from "../types";
import {
  FileCheck2,
  FileWarning,
  FileX,
  FileCode,
  RotateCcw,
  ShieldCheck,
  Clock,
  Database,
  Lock,
} from "lucide-react";

export const DataIntegrityPage: React.FC = () => {
  const { state, setActiveTab } = useSimulation();

  if (!state) return null;

  const { file_integrity } = state;
  const filesList = Object.values(file_integrity.files) as ProtectedFile[];
  const stats = file_integrity.stats;

  const getFileStatusBadge = (status: string) => {
    switch (status) {
      case "HEALTHY":
        return <Badge label="HEALTHY" variant="normal" />;
      case "RESTORED":
        return <Badge label="RESTORED" variant="protected" />;
      case "MODIFIED":
        return <Badge label="MODIFIED" variant="suspicious" />;
      case "DELETED":
        return <Badge label="DELETED" variant="compromised" />;
      case "CORRUPTED":
        return <Badge label="CORRUPTED" variant="compromised" />;
      default:
        return <Badge label={status} variant="info" />;
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-mono text-white flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-cyan-400" />
            FILE INTEGRITY MONITORING & CRYPTOGRAPHIC LEDGER
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Continuous SHA-256 Hash Verification • Tamper & Ransomware Destruction Detection
          </p>
        </div>
        <button
          onClick={() => setActiveTab("recovery")}
          className="px-3.5 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 text-white font-mono text-xs font-bold shadow-[0_0_15px_rgba(0,240,255,0.25)] flex items-center gap-1.5"
        >
          <RotateCcw className="w-4 h-4" />
          <span>OPEN RECOVERY CENTER</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard
          title="Total Files"
          value={stats.total_files}
          icon={<FileCode className="w-4 h-4" />}
          variant="cyan"
        />
        <StatCard
          title="Healthy"
          value={stats.healthy}
          icon={<ShieldCheck className="w-4 h-4" />}
          variant="emerald"
        />
        <StatCard
          title="Modified"
          value={stats.modified}
          icon={<FileWarning className="w-4 h-4" />}
          variant="amber"
        />
        <StatCard
          title="Deleted"
          value={stats.deleted}
          icon={<FileX className="w-4 h-4" />}
          variant="crimson"
        />
        <StatCard
          title="Corrupted"
          value={stats.corrupted}
          icon={<FileWarning className="w-4 h-4" />}
          variant="crimson"
        />
        <StatCard
          title="Recoverable"
          value={stats.recoverable}
          subtitle={`${stats.unrecoverable} unrecoverable`}
          icon={<RotateCcw className="w-4 h-4" />}
          variant="purple"
        />
      </div>

      {/* Main Files Table */}
      <div className="cyber-card p-5 border-slate-800">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-cyan-400" />
            PROTECTED DATA STORAGE ASSETS
          </h3>
          <span className="text-xs font-mono text-slate-400">
            {filesList.length} Protected Enterprise Files
          </span>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="pb-3 px-3">File Name</th>
                <th className="pb-3 px-3">Device & Location</th>
                <th className="pb-3 px-3">Owner</th>
                <th className="pb-3 px-3">Integrity Status</th>
                <th className="pb-3 px-3">Current Hash (SHA-256)</th>
                <th className="pb-3 px-3">Known Good Hash</th>
                <th className="pb-3 px-3">Versions</th>
                <th className="pb-3 px-3">Recovery Status</th>
                <th className="pb-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filesList.map((f: ProtectedFile) => (
                <tr key={f.file_id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3 px-3 font-bold text-white">
                    <div className="flex items-center gap-2 max-w-[180px] truncate" title={f.filename}>
                      <FileCode className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                      <span className="truncate">{f.filename}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-200">{f.device_id}</div>
                    <div className="text-[10px] text-slate-400">Floor {f.floor} • {f.room}</div>
                  </td>
                  <td className="py-3 px-3 text-slate-400">{f.owner}</td>
                  <td className="py-3 px-3">{getFileStatusBadge(f.status)}</td>
                  <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">
                    <span
                      title={f.current_hash}
                      className={`max-w-[140px] truncate inline-block font-mono align-middle ${
                        f.current_hash === f.known_good_hash ? "text-emerald-400" : "text-rose-400 font-bold"
                      }`}
                    >
                      {f.current_hash}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-emerald-400 font-mono text-[11px]">
                    <span title={f.known_good_hash} className="max-w-[140px] truncate inline-block font-mono align-middle">
                      {f.known_good_hash}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-300 whitespace-nowrap">
                      v{f.current_version} (Good: v{f.known_good_version})
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    {f.is_recovery_available ? (
                      <span className="text-[11px] font-mono text-emerald-400 font-semibold flex items-center gap-1 whitespace-nowrap">
                        <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                        <span>Recovery Available</span>
                      </span>
                    ) : (
                      <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1 whitespace-nowrap">
                        <Lock className="w-3.5 h-3.5 shrink-0" />
                        <span>Recovery Not Available</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => setActiveTab("recovery")}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 font-mono text-xs border border-slate-700 transition-colors whitespace-nowrap"
                    >
                      View Versions
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Data Modification/Deletion Incident Timeline */}
      <div className="cyber-card p-5 border-slate-800">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            DATA TAMPER & INCIDENT TIMELINE (WHAT / WHEN / WHERE / WHO)
          </h3>
          <span className="text-xs font-mono text-slate-400">
            {file_integrity.timeline.length} Recorded Events
          </span>
        </div>

        {file_integrity.timeline.length > 0 ? (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="pb-2 px-3">WHEN (TIME)</th>
                  <th className="pb-2 px-3">WHAT (FILE)</th>
                  <th className="pb-2 px-3">ACTION DETECTED</th>
                  <th className="pb-2 px-3">WHERE (DEVICE)</th>
                  <th className="pb-2 px-3">WHO (ACTOR)</th>
                  <th className="pb-2 px-3">INTEGRITY STATE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-slate-300">
                {file_integrity.timeline.map((item: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-900/30">
                    <td className="py-2.5 px-3 text-slate-400">{item.time}</td>
                    <td className="py-2.5 px-3 font-bold text-white">
                      <div className="truncate max-w-[150px] sm:max-w-[250px]" title={item.file}>
                        {item.file}
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.action === "RESTORED"
                          ? "bg-emerald-950 text-emerald-300"
                          : item.action === "DELETED"
                          ? "bg-rose-950 text-rose-300"
                          : "bg-amber-950 text-amber-300"
                      }`}>
                        {item.action}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">{item.device}</td>
                    <td className="py-2.5 px-3 text-cyan-300 font-bold">{item.user}</td>
                    <td className="py-2.5 px-3">{getFileStatusBadge(item.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-500 font-mono text-xs">
            No unauthorized data modifications, corruptions, or deletions recorded in active session.
          </div>
        )}
      </div>
    </div>
  );
};
