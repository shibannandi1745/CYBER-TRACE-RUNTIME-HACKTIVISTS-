import React, { useState, useMemo } from "react";
import { useSimulation } from "../context/SimulationContext";
import { Badge } from "../components/common/Badge";
import { TelemetryEvent } from "../types";
import {
  Clock,
  Search,
  Filter,
  PlayCircle,
  SearchCode,
  ArrowRight,
  ShieldAlert,
  Server,
  Database,
  Laptop,
  Radio,
  FileCode,
  Key,
  Network,
  Activity,
  Layers,
  ChevronRight,
  Shield,
  Eye,
} from "lucide-react";

export const TimelinePage: React.FC = () => {
  const { state, setSelectedDeviceId, setActiveTab } = useSimulation();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [severityFilter, setSeverityFilter] = useState<string>("ALL");

  if (!state) return null;

  const { incident_event_history, telemetry_feed, active_incident, threat_score } = state;

  // Use incident_event_history if populated; otherwise fallback to telemetry_feed
  const baseEvents: TelemetryEvent[] = useMemo(() => {
    if (incident_event_history && incident_event_history.length > 0) {
      return incident_event_history;
    }
    return telemetry_feed;
  }, [incident_event_history, telemetry_feed]);

  const filteredEvents = useMemo(() => {
    return baseEvents.filter((ev: TelemetryEvent) => {
      // Search
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        !term ||
        ev.event_id.toLowerCase().includes(term) ||
        ev.source_device.toLowerCase().includes(term) ||
        (ev.destination_device && ev.destination_device.toLowerCase().includes(term)) ||
        (ev.user && ev.user.toLowerCase().includes(term)) ||
        ev.description.toLowerCase().includes(term) ||
        (ev.attack_stage && ev.attack_stage.toLowerCase().includes(term)) ||
        (ev.evidence_source && ev.evidence_source.toLowerCase().includes(term));

      // Category filter
      let matchesCategory = true;
      if (categoryFilter === "AUTHENTICATION") {
        matchesCategory =
          ev.event_type.includes("LOGIN") ||
          ev.event_type.includes("AUTH") ||
          ev.evidence_source === "AUTHENTICATION_LOG";
      } else if (categoryFilter === "NETWORK") {
        matchesCategory =
          ev.event_type.includes("NETWORK") ||
          ev.event_type.includes("LATERAL") ||
          ev.event_type.includes("PORT_SCAN") ||
          ev.evidence_source === "ROUTER_LOG" ||
          ev.evidence_source === "NETWORK_TELEMETRY";
      } else if (categoryFilter === "DEVICE") {
        matchesCategory =
          ev.event_type.includes("PRIVILEGE") ||
          ev.event_type.includes("DOOR") ||
          ev.event_type.includes("BMS") ||
          ev.evidence_source === "ENDPOINT_TELEMETRY" ||
          ev.evidence_source === "SERVER_AUDIT";
      } else if (categoryFilter === "DATABASE") {
        matchesCategory =
          ev.event_type.includes("FILE") ||
          ev.event_type.includes("DATA") ||
          ev.event_type.includes("RANSOMWARE") ||
          ev.evidence_source === "DATABASE_AUDIT";
      } else if (categoryFilter === "CRITICAL") {
        matchesCategory = ev.severity === "CRITICAL" || ev.severity === "HIGH";
      }

      // Severity filter
      const matchesSeverity = severityFilter === "ALL" || ev.severity === severityFilter;

      return matchesSearch && matchesCategory && matchesSeverity;
    });
  }, [baseEvents, searchTerm, categoryFilter, severityFilter]);

  const handleInspectDevice = (deviceId: string) => {
    setSelectedDeviceId(deviceId);
    setActiveTab("graph");
  };

  const getStageColor = (stage?: string) => {
    switch (stage) {
      case "RECONNAISSANCE":
        return "bg-slate-800 text-slate-300 border-slate-700";
      case "INITIAL_ACCESS":
        return "bg-amber-950/80 text-amber-300 border-amber-500/40";
      case "LATERAL_MOVEMENT":
        return "bg-orange-950/80 text-orange-300 border-orange-500/40";
      case "PRIVILEGE_ESCALATION":
        return "bg-rose-950/80 text-rose-300 border-rose-500/40";
      case "COLLECTION":
        return "bg-purple-950/80 text-purple-300 border-purple-500/40";
      case "IMPACT":
        return "bg-rose-900/90 text-white border-rose-500 font-bold shadow-[0_0_10px_rgba(244,63,94,0.3)]";
      case "DEFENSE_EVASION":
        return "bg-cyan-950/80 text-cyan-300 border-cyan-500/40";
      default:
        return "bg-slate-900 text-slate-400 border-slate-800";
    }
  };

  const getEvidenceSourceBadge = (source?: string) => {
    const s = source || "SECURITY_EVENT_STORE";
    let icon = <Shield className="w-3 h-3 text-cyan-400 shrink-0" />;
    let label = "Security Event Store";

    if (s === "AUTHENTICATION_LOG") {
      icon = <Key className="w-3 h-3 text-amber-400 shrink-0" />;
      label = "Authentication Log";
    } else if (s === "ROUTER_LOG") {
      icon = <Network className="w-3 h-3 text-cyan-400 shrink-0" />;
      label = "Router Telemetry";
    } else if (s === "NETWORK_TELEMETRY") {
      icon = <Activity className="w-3 h-3 text-blue-400 shrink-0" />;
      label = "Network Flow";
    } else if (s === "SERVER_AUDIT") {
      icon = <Server className="w-3 h-3 text-purple-400 shrink-0" />;
      label = "Server Audit";
    } else if (s === "DATABASE_AUDIT") {
      icon = <Database className="w-3 h-3 text-rose-400 shrink-0" />;
      label = "Database Audit";
    } else if (s === "ENDPOINT_TELEMETRY") {
      icon = <Laptop className="w-3 h-3 text-emerald-400 shrink-0" />;
      label = "Endpoint Telemetry";
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-300">
        {icon}
        <span>{label}</span>
      </span>
    );
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header with Quick Navigation */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold font-mono text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-cyan-400" />
              ATTACK INCIDENT TIMELINE & CHRONOLOGY
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-bold">
              FORENSIC CHRONICLE
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Preserved Multi-Source Incident History • Correlated Cross-Floor Event Progression
          </p>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab("replay")}
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-950 to-slate-900 border border-cyan-500/50 hover:border-cyan-400 text-cyan-300 font-mono text-xs font-bold transition-all shadow-[0_0_15px_rgba(0,240,255,0.2)] flex items-center gap-1.5"
          >
            <PlayCircle className="w-4 h-4 text-cyan-400" />
            <span>OPEN FORENSIC REPLAY</span>
          </button>
          <button
            onClick={() => setActiveTab("reconstruction")}
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-950 to-slate-900 border border-purple-500/50 hover:border-purple-400 text-purple-300 font-mono text-xs font-bold transition-all shadow-[0_0_15px_rgba(168,85,247,0.2)] flex items-center gap-1.5"
          >
            <SearchCode className="w-4 h-4 text-purple-400" />
            <span>EVIDENCE RECONSTRUCTION</span>
          </button>
        </div>
      </div>

      {/* Incident Status Banner */}
      {active_incident && (
        <div className="cyber-card p-4 border-cyan-500/30 bg-slate-950/90 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-rose-950 text-rose-300 border border-rose-500/50 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
              {active_incident.incident_id}
            </span>
            <span className="text-xs font-mono text-slate-300 font-bold">
              {active_incident.title}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
            <div>
              <span className="text-slate-400 mr-1">EVENTS RECORDED:</span>
              <strong className="text-white">{filteredEvents.length}</strong>
            </div>
            <div>
              <span className="text-slate-400 mr-1">CURRENT THREAT:</span>
              <strong className="text-rose-400 font-bold">{threat_score.overall_score}/100</strong>
            </div>
            <div>
              <span className="text-slate-400 mr-1">CONFIDENCE:</span>
              <strong className="text-cyan-400 font-bold">{threat_score.confidence.toFixed(1)}%</strong>
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs & Search */}
      <div className="cyber-card p-4 border-slate-800 space-y-3">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-slate-800/80">
          {[
            { id: "ALL", label: "All Events" },
            { id: "AUTHENTICATION", label: "Authentication" },
            { id: "NETWORK", label: "Network & Lateral" },
            { id: "DEVICE", label: "Endpoint & Privilege" },
            { id: "DATABASE", label: "Database & Files" },
            { id: "CRITICAL", label: "Critical Only" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
                categoryFilter === cat.id
                  ? "bg-cyan-500 text-slate-950 font-bold shadow-[0_0_10px_rgba(0,240,255,0.3)]"
                  : "bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search & Severity Row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by device, IP, user, stage, or evidence..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">Severity:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">CRITICAL</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
              <option value="INFO">INFO</option>
            </select>
          </div>
        </div>
      </div>

      {/* Chronological Attack Timeline Stream */}
      <div className="space-y-3">
        {filteredEvents.length === 0 ? (
          <div className="cyber-card p-12 text-center border-slate-800">
            <Clock className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <div className="text-sm font-mono font-bold text-slate-400">NO MATCHING TIMELINE EVENTS</div>
            <p className="text-xs font-mono text-slate-500 mt-1">
              Launch an attack scenario from the Simulator drawer to generate live chronological telemetry.
            </p>
          </div>
        ) : (
          <div className="relative pl-6 space-y-3 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
            {filteredEvents.map((ev: TelemetryEvent, idx: number) => {
              const isCrit = ev.severity === "CRITICAL";
              const isHigh = ev.severity === "HIGH";
              const score = ev.threat_score_snapshot ?? (isCrit ? 96 : isHigh ? 68 : 32);

              return (
                <div
                  key={ev.event_id || idx}
                  className={`relative cyber-card p-4 border-slate-800/90 transition-all hover:border-cyan-500/50 ${
                    isCrit ? "bg-rose-950/20 border-rose-500/40" : isHigh ? "bg-orange-950/20 border-orange-500/40" : "bg-slate-950/90"
                  }`}
                >
                  {/* Timeline Dot */}
                  <div
                    className={`absolute -left-[27px] top-5 w-3.5 h-3.5 rounded-full border-2 border-slate-950 shrink-0 ${
                      isCrit
                        ? "bg-rose-500 shadow-[0_0_8px_#f43f5e]"
                        : isHigh
                        ? "bg-orange-500"
                        : "bg-cyan-500"
                    }`}
                  ></div>

                  {/* Top Bar: Timestamp, Attack Stage, Evidence Source & Threat Score */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-800/80 text-xs font-mono">
                    <div className="flex flex-wrap items-center gap-2 min-w-0">
                      <span className="text-slate-400 font-bold">{ev.formatted_time || "10:00:00"}</span>
                      {ev.attack_stage && (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${getStageColor(ev.attack_stage)}`}>
                          {ev.attack_stage.replace("_", " ")}
                        </span>
                      )}
                      {getEvidenceSourceBadge(ev.evidence_source)}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-[11px] text-slate-400 flex items-center gap-1">
                        <span>THREAT SCORE:</span>
                        <strong className={`font-bold ${score >= 80 ? "text-rose-400" : score >= 50 ? "text-orange-400" : "text-amber-400"}`}>
                          {score}/100
                        </strong>
                      </div>
                      <Badge
                        label={ev.severity}
                        variant={
                          isCrit
                            ? "compromised"
                            : isHigh
                            ? "high_risk"
                            : ev.severity === "MEDIUM"
                            ? "suspicious"
                            : "info"
                        }
                      />
                    </div>
                  </div>

                  {/* Middle Content: Source -> Destination & Description */}
                  <div className="py-2.5 space-y-2 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 min-w-0">
                      <div className="flex items-center gap-2 font-mono text-sm font-bold text-white min-w-0">
                        <button
                          onClick={() => handleInspectDevice(ev.source_device)}
                          className="hover:text-cyan-300 underline decoration-cyan-500/40 hover:decoration-cyan-400 transition-colors truncate max-w-[120px] sm:max-w-[200px]"
                          title="Inspect device on Attack Graph"
                        >
                          {ev.source_device}
                        </button>
                        {ev.destination_device && (
                          <>
                            <ArrowRight className="w-4 h-4 text-slate-500 shrink-0" />
                            <button
                              onClick={() => handleInspectDevice(ev.destination_device!)}
                              className="text-cyan-300 hover:text-cyan-200 underline decoration-cyan-500/40 hover:decoration-cyan-300 transition-colors truncate max-w-[120px] sm:max-w-[200px]"
                              title="Inspect target device on Attack Graph"
                            >
                              {ev.destination_device}
                            </button>
                          </>
                        )}
                      </div>

                      <div className="text-xs font-mono text-slate-400 shrink-0">
                        Floor {ev.floor} {ev.room ? `• ${ev.room}` : ""} {ev.network_segment ? `• [${ev.network_segment}]` : ""}
                      </div>
                    </div>

                    <p className="text-xs font-mono text-slate-200 leading-relaxed break-words">
                      {ev.description}
                    </p>
                  </div>

                  {/* Footer Row: User, Event ID, Quick Graph Inspector */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-[11px] font-mono text-slate-400">
                    <div className="flex items-center gap-3">
                      <span>User: <strong className="text-slate-200">{ev.user || "SYSTEM"}</strong></span>
                      <span>Event ID: <code className="text-slate-300">{ev.event_id}</code></span>
                      {ev.is_anomaly && (
                        <span className="px-1.5 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-500/40 text-[9px] font-bold">
                          ANOMALOUS ACTIVITY
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleInspectDevice(ev.source_device)}
                      className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors text-[10.5px] font-bold"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>HIGHLIGHT ON GRAPH</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

