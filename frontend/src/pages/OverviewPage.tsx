import React from "react";
import { useSimulation } from "../context/SimulationContext";
import { StatCard } from "../components/common/StatCard";
import { ThreatGauge } from "../components/common/Gauge";
import { Badge } from "../components/common/Badge";
import { Device, Floor } from "../types";
import {
  ShieldAlert,
  ShieldCheck,
  Building2,
  GitFork,
  FileWarning,
  ArrowRight,
  Server,
  AlertTriangle,
  PlayCircle,
  SearchCode,
  Lock,
} from "lucide-react";

export const OverviewPage: React.FC = () => {
  const { state, setActiveTab, setSelectedDeviceId, isolateDevice } = useSimulation();

  if (!state) return null;

  const { threat_score, attack_path, devices, floors, file_integrity, containment, active_incident, incident_event_history } = state;

  const devicesList = Object.values(devices) as Device[];
  const compromisedCount = devicesList.filter((d: Device) => d.status === "COMPROMISED" || d.status === "HIGH_RISK").length;
  const quarantinedCount = containment.quarantined_devices.length;
  const dataImpactCount = file_integrity.stats.corrupted + file_integrity.stats.deleted + file_integrity.stats.modified;

  // Context-aware early warning logic (stage + score + critical asset approached)
  const showEarlyWarning =
    threat_score.overall_score >= 40 &&
    threat_score.overall_score < 85 &&
    incident_event_history?.some(
      (e) => e.attack_stage === "LATERAL_MOVEMENT" || e.attack_stage === "PRIVILEGE_ESCALATION"
    ) &&
    active_incident &&
    active_incident.status === "ACTIVE";

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Context-Aware Early Warning Banner */}
      {showEarlyWarning && (
        <div className="cyber-card p-4 border-amber-500/50 bg-amber-950/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-[0_0_20px_rgba(245,158,11,0.2)] animate-pulse">
          <div className="flex items-start gap-3 min-w-0">
            <div className="p-2 rounded-lg bg-amber-900/80 border border-amber-500/50 text-amber-300 shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold font-mono text-amber-300 uppercase tracking-wider">
                EARLY WARNING: SUSPICIOUS LATERAL PROGRESSION DETECTED
              </div>
              <p className="text-xs font-mono text-slate-200 mt-0.5">
                Attack activity is progressing toward a critical network segment. Current trajectory is approaching a potential critical asset (AppServer-301 / Database-302).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            {attack_path?.source_device && (
              <button
                onClick={() => isolateDevice(attack_path.source_device)}
                className="flex-1 sm:flex-none px-3 py-1.5 rounded-lg bg-purple-700 hover:bg-purple-600 text-white font-mono text-xs font-bold transition-all shadow-[0_0_10px_rgba(168,85,247,0.3)] flex items-center justify-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>ISOLATE {attack_path.source_device}</span>
              </button>
            )}
            <button
              onClick={() => setActiveTab("reconstruction")}
              className="flex-1 sm:flex-none px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/40 font-mono text-xs font-bold transition-all"
            >
              INVESTIGATE
            </button>
          </div>
        </div>
      )}

      {/* Top Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Overall Threat Score"
          value={`${threat_score.overall_score}/100`}
          subtitle={threat_score.severity + " SEVERITY LEVEL"}
          icon={<ShieldAlert className="w-5 h-5" />}
          variant={threat_score.overall_score > 60 ? "crimson" : threat_score.overall_score > 30 ? "amber" : "emerald"}
          onClick={() => setActiveTab("decisions")}
        />
        <StatCard
          title="Compromised Hosts"
          value={compromisedCount}
          subtitle={`${quarantinedCount} devices quarantined`}
          icon={<Server className="w-5 h-5" />}
          variant={compromisedCount > 0 ? "crimson" : "cyan"}
          onClick={() => setActiveTab("building")}
        />
        <StatCard
          title="Impacted Files"
          value={dataImpactCount}
          subtitle={`${file_integrity.stats.recoverable} recoverable via snapshots`}
          icon={<FileWarning className="w-5 h-5" />}
          variant={dataImpactCount > 0 ? "amber" : "emerald"}
          onClick={() => setActiveTab("integrity")}
        />
        <StatCard
          title="Attack Path Confidence"
          value={attack_path ? `${attack_path.confidence_score.toFixed(0)}%` : "100%"}
          subtitle={attack_path ? `${attack_path.nodes.length} hops detected` : "No active traversal"}
          icon={<GitFork className="w-5 h-5" />}
          variant="purple"
          onClick={() => setActiveTab("graph")}
        />
      </div>


      {/* Main Grid: Threat Analysis & Spatial Building Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Threat Analysis & Attack Path Reconstructor */}
        <div className="lg:col-span-7 space-y-6">
          {/* Active Attack Path Reconstructor Card */}
          <div className="cyber-card p-5 border-cyan-500/30">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <GitFork className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-bold font-mono text-white">RECONSTRUCTED ATTACK VECTOR</h3>
              </div>
              {attack_path ? (
                <Badge
                  label={attack_path.is_blocked ? "PROPAGATION BLOCKED" : "ACTIVE ATTACK VECTOR"}
                  variant={attack_path.is_blocked ? "protected" : "compromised"}
                />
              ) : (
                <Badge label="SYSTEM NOMINAL" variant="normal" />
              )}
            </div>

            {attack_path ? (
              <div className="mt-4 space-y-4">
                {/* Node Flow Visualizer */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 overflow-x-auto">
                  <div className="flex items-center gap-2 min-w-max">
                    {attack_path.nodes.map((nodeId: string, idx: number) => {
                      const dev = devices[nodeId];
                      const isLast = idx === attack_path.nodes.length - 1;
                      const isOrigin = idx === 0;

                      return (
                        <React.Fragment key={nodeId}>
                          <div
                            onClick={() => {
                              setSelectedDeviceId(nodeId);
                              setActiveTab("building");
                            }}
                            className={`p-2.5 rounded-lg border cursor-pointer transition-all hover:scale-105 ${
                              dev?.is_isolated
                                ? "bg-purple-950/80 border-purple-500/60 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.3)]"
                                : isOrigin
                                ? "bg-rose-950/80 border-rose-500/60 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.3)]"
                                : dev?.status === "COMPROMISED"
                                ? "bg-amber-950/80 border-amber-500/60 text-amber-300"
                                : "bg-slate-900 border-slate-700 text-slate-300"
                            }`}
                          >
                            <div className="text-[10px] font-mono text-slate-400">
                              {isOrigin ? "ORIGIN (F" + dev?.floor + ")" : isLast ? "TARGET (F" + dev?.floor + ")" : "HOP " + idx}
                            </div>
                            <div className="text-xs font-bold font-mono">{nodeId}</div>
                            <div className="text-[9px] font-mono text-slate-400">{dev?.ip_address || "10.x.x.x"}</div>
                          </div>
                          {!isLast && (
                            <ArrowRight
                              className={`w-4 h-4 flex-shrink-0 ${
                                attack_path.is_blocked && idx === 0 ? "text-rose-500 line-through" : "text-cyan-400 animate-pulse"
                              }`}
                            />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-400 pt-1">
                  <span>Confidence: <strong className="text-cyan-300">{attack_path.confidence_score.toFixed(1)}%</strong></span>
                  <span>Missing Telemetry: <strong className={attack_path.has_missing_telemetry ? "text-amber-400" : "text-emerald-400"}>{attack_path.has_missing_telemetry ? "YES (Confidence penalized)" : "NONE (Full visibility)"}</strong></span>
                  <button
                    onClick={() => setActiveTab("graph")}
                    className="text-cyan-400 hover:text-cyan-300 underline shrink-0"
                  >
                    Open Full Graph &rarr;
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 font-mono text-xs">
                No active multi-hop attack vectors currently traversing the simulated network topology.
              </div>
            )}
          </div>

          {/* Explainable Contributing Factors */}
          <div className="cyber-card p-5 border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 gap-2">
              <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2 min-w-0 flex-1">
                <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="truncate">EXPLAINABLE CONTRIBUTING RISK FACTORS</span>
              </h3>
              <span className="text-xs font-mono text-slate-400 shrink-0">
                Score: {threat_score.overall_score}/100
              </span>
            </div>

            {threat_score.factors.length > 0 ? (
              <div className="mt-4 space-y-2.5">
                {threat_score.factors.map((f, i) => (
                  <div key={i} className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-3 min-w-0">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold font-mono text-cyan-300">{f.name}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono shrink-0">
                          {f.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 break-words">{f.description}</p>
                    </div>
                    <span className="text-sm font-bold font-mono text-rose-400 shrink-0 ml-2">+{f.points}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-slate-500 font-mono text-xs">
                AI Defense Engine baseline is nominal. No anomalous risk factors flagged.
              </div>
            )}
          </div>
        </div>

        {/* Right 5 Cols: Spatial Building Summary & Threat Radial Gauge */}
        <div className="lg:col-span-5 space-y-6">
          {/* Radial Threat Gauge Card */}
          <div className="cyber-card p-5 border-slate-800 flex flex-col items-center text-center">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-400 mb-3">
              REAL-TIME THREAT RADAR
            </h3>
            <ThreatGauge score={threat_score.overall_score} severity={threat_score.severity} size={150} />
            <p className="mt-4 text-xs text-slate-300 font-mono leading-relaxed px-4 break-words">
              {threat_score.recommendation}
            </p>
          </div>

          {/* Building Floors Status Overview */}
          <div className="cyber-card p-5 border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 gap-2">
              <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2 min-w-0 flex-1">
                <Building2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="truncate">SPATIAL FLOORS (4 LEVELS)</span>
              </h3>
              <button
                onClick={() => setActiveTab("building")}
                className="text-xs font-mono text-cyan-400 hover:underline shrink-0"
              >
                Interactive View &rarr;
              </button>
            </div>

            <div className="mt-4 space-y-2.5">
              {floors.map((floor: Floor) => {
                const floorDevices = floor.device_ids.map((id: string) => devices[id]).filter(Boolean);
                const hasCompromised = floorDevices.some((d: Device) => d.status === "COMPROMISED" || d.status === "HIGH_RISK");
                const hasQuarantined = floorDevices.some((d: Device) => d.is_isolated);

                return (
                  <div
                    key={floor.floor_number}
                    onClick={() => setActiveTab("building")}
                    className={`p-3 rounded-lg border cursor-pointer transition-all hover:border-cyan-500/40 ${
                      hasCompromised
                        ? "bg-rose-950/40 border-rose-500/40"
                        : hasQuarantined
                        ? "bg-purple-950/40 border-purple-500/40"
                        : "bg-slate-900/50 border-slate-800"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 min-w-0">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="font-bold font-mono text-xs text-white shrink-0">LEVEL {floor.floor_number}</span>
                        <span className="text-[11px] text-slate-400 truncate min-w-0 flex-1">{floor.name.split(":")[1] || floor.name}</span>
                      </div>
                      <Badge
                        label={hasCompromised ? "THREAT ACTIVE" : hasQuarantined ? "QUARANTINED" : "NORMAL"}
                        variant={hasCompromised ? "compromised" : hasQuarantined ? "quarantined" : "normal"}
                      />
                    </div>
                    <div className="mt-1.5 flex items-center gap-2 text-[10px] font-mono text-slate-400">
                      <span>Devices: {floorDevices.length}</span>
                      <span>•</span>
                      <span>Rooms: {floor.rooms.length}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
