import React, { useState, useMemo } from "react";
import { useSimulation } from "../context/SimulationContext";
import { AuditEntry } from "../types";
import {
  ScrollText,
  User,
  Bot,
  Cpu,
  Download,
  Filter,
} from "lucide-react";

export const AuditLogPage: React.FC = () => {
  const { state } = useSimulation();
  const [actorFilter, setActorFilter] = useState<string>("ALL");

  if (!state) return null;

  const { audit_logs } = state;

  const filteredLogs = useMemo(() => {
    if (actorFilter === "ALL") return audit_logs;
    return audit_logs.filter((l: AuditEntry) => l.actor === actorFilter);
  }, [audit_logs, actorFilter]);

  const getActorBadge = (actor: string) => {
    switch (actor) {
      case "AI":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/40 flex items-center gap-1">
            <Bot className="w-3 h-3" />
            AI DEFENSE
          </span>
        );
      case "ANALYST":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-950 text-purple-300 border border-purple-500/40 flex items-center gap-1">
            <User className="w-3 h-3" />
            HUMAN ANALYST
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1">
            <Cpu className="w-3 h-3" />
            SYSTEM
          </span>
        );
    }
  };

  const handleExportLogs = () => {
    const blob = new Blob([JSON.stringify(audit_logs, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `CyberTrace_Audit_Logs_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  const db = state?.database;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-mono text-white flex items-center gap-2">
            <ScrollText className="w-5 h-5 text-cyan-400" />
            IMMUTABLE SECURITY DECISION & CONTAINMENT AUDIT LEDGER
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Cryptographically Ordered Action Trail • Human vs AI Autonomous Accountability
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Actor Filter */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-300">
            <Filter className="w-3.5 h-3.5 mr-1.5 text-cyan-400" />
            <select
              value={actorFilter}
              onChange={(e) => setActorFilter(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900">All Actors</option>
              <option value="AI" className="bg-slate-900">AI Defense Engine</option>
              <option value="ANALYST" className="bg-slate-900">Human Security Analyst</option>
              <option value="SYSTEM" className="bg-slate-900">System Kernel</option>
            </select>
          </div>

          <button
            onClick={handleExportLogs}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-300 font-mono text-xs border border-slate-700 transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>EXPORT LOGS</span>
          </button>
        </div>
      </div>

      {/* SQLite Database Metrics Banner */}
      {db && (
        <div className="cyber-card p-4 border-slate-800 bg-slate-950/80">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-500/40">
                <ScrollText className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold font-mono text-white">PERSISTENT BACKEND DATABASE:</span>
                  <span className="px-2 py-0.2 rounded-full text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-500/50">
                    {db.engine}
                  </span>
                </div>
                <div className="text-[11px] font-mono text-slate-400 mt-0.5 min-w-0">
                  Path: <code className="text-slate-300 break-all">{db.db_path}</code>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
              <div className="bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                <span className="text-slate-500">Storage Size: </span>
                <strong className="text-cyan-300">{db.size_formatted}</strong>
              </div>
              <div className="bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                <span className="text-slate-500">Total Rows: </span>
                <strong className="text-white">{db.total_records}</strong>
              </div>
              <div className="bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                <span className="text-slate-500">Audit Logs: </span>
                <strong className="text-purple-300">{db.table_counts.audit_logs || 0}</strong>
              </div>
              <div className="bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                <span className="text-slate-500">Telemetry: </span>
                <strong className="text-emerald-300">{db.table_counts.telemetry_events || 0}</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Audit Log Table */}
      <div className="cyber-card p-5 border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="pb-3 px-3">Audit ID</th>
                <th className="pb-3 px-3">Time</th>
                <th className="pb-3 px-3">Actor</th>
                <th className="pb-3 px-3">Action</th>
                <th className="pb-3 px-3">Target Asset</th>
                <th className="pb-3 px-3">Reason / Context</th>
                <th className="pb-3 px-3">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredLogs.map((log: AuditEntry) => (
                <tr key={log.audit_id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3 px-3 text-slate-400 whitespace-nowrap">{log.audit_id}</td>
                  <td className="py-3 px-3 text-slate-300 font-mono whitespace-nowrap">{log.formatted_time}</td>
                  <td className="py-3 px-3">{getActorBadge(log.actor)}</td>
                  <td className="py-3 px-3 font-bold text-white">
                    <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-300 inline-block whitespace-nowrap">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-white font-bold break-words max-w-[160px]">{log.target}</td>
                  <td className="py-3 px-3 text-slate-300 break-words max-w-md">{log.reason}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      log.result === "SUCCESS"
                        ? "bg-emerald-950 text-emerald-400 border border-emerald-500/40"
                        : "bg-slate-800 text-slate-400 border border-slate-700"
                    }`}>
                      {log.result}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
