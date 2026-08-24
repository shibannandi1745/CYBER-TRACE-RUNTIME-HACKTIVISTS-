import React, { useState, useMemo } from "react";
import { useSimulation } from "../context/SimulationContext";
import { Badge } from "../components/common/Badge";
import { ReconstructedEdge, TelemetryEvent } from "../types";
import {
  SearchCode,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Shield,
  Key,
  Network,
  Activity,
  Server,
  Database,
  Laptop,
  ArrowRight,
  Play,
  RotateCcw,
  Sparkles,
  Layers,
  FileCheck2,
  HelpCircle,
  Clock,
  Eye,
} from "lucide-react";

export const ReconstructionPage: React.FC = () => {
  const { state, setSelectedDeviceId, setActiveTab } = useSimulation();

  if (!state) return null;

  const { attack_path, threat_score, active_incident, incident_event_history, telemetry_feed, file_integrity } = state;

  const events = (incident_event_history && incident_event_history.length > 0) ? incident_event_history : telemetry_feed;

  // Determine available evidence sources present in the captured incident events
  const evidenceSources = useMemo(() => {
    const present = new Set<string>();
    events.forEach((e) => {
      if (e.evidence_source) present.add(e.evidence_source);
    });

    return [
      { id: "AUTHENTICATION_LOG", label: "Authentication Logs", icon: <Key className="w-4 h-4 text-amber-400" />, available: present.has("AUTHENTICATION_LOG") || events.some(e => e.event_type.includes("LOGIN")) },
      { id: "ROUTER_LOG", label: "Router & Firewall Logs", icon: <Network className="w-4 h-4 text-cyan-400" />, available: present.has("ROUTER_LOG") || events.some(e => e.event_type.includes("NETWORK")) },
      { id: "NETWORK_TELEMETRY", label: "Network Flow Telemetry", icon: <Activity className="w-4 h-4 text-blue-400" />, available: present.has("NETWORK_TELEMETRY") || events.some(e => e.event_type.includes("LATERAL")) },
      { id: "SERVER_AUDIT", label: "Server Audit Logs", icon: <Server className="w-4 h-4 text-purple-400" />, available: present.has("SERVER_AUDIT") || events.some(e => e.event_type.includes("PRIVILEGE")) },
      { id: "DATABASE_AUDIT", label: "Database Audit Telemetry", icon: <Database className="w-4 h-4 text-rose-400" />, available: present.has("DATABASE_AUDIT") || events.some(e => e.event_type.includes("FILE") || e.event_type.includes("DATA")) },
      { id: "ENDPOINT_TELEMETRY", label: "Endpoint EDR Telemetry", icon: <Laptop className="w-4 h-4 text-emerald-400" />, available: present.has("ENDPOINT_TELEMETRY") || events.some(e => e.source_device.includes("Laptop") || e.source_device.includes("Workstation")) },
      { id: "SECURITY_EVENT_STORE", label: "Central Security Event Store", icon: <Shield className="w-4 h-4 text-cyan-400" />, available: true },
    ];
  }, [events]);

  // Reconstruction state: "IDLE" | "RUNNING" | "COMPLETE"
  const [reconstructionState, setReconstructionState] = useState<"IDLE" | "RUNNING" | "COMPLETE">("IDLE");
  const [activePhaseIndex, setActivePhaseIndex] = useState<number>(0);

  const phases = [
    "Collecting independent evidence sources...",
    "Correlating spatial-temporal network relationships...",
    "Identifying missing telemetry hops...",
    "Inferring unmonitored traversal links...",
    "Reconstructing verified attack path...",
    "Calculating multi-factor confidence score...",
  ];

  const handleStartReconstruction = () => {
    setReconstructionState("RUNNING");
    setActivePhaseIndex(0);

    let current = 0;
    const interval = setInterval(() => {
      current += 1;
      if (current < phases.length) {
        setActivePhaseIndex(current);
      } else {
        clearInterval(interval);
        setReconstructionState("COMPLETE");
      }
    }, 600);
  };

  // Reconstructed edges list
  const reconstructedHops: ReconstructedEdge[] = useMemo(() => {
    if (attack_path?.reconstructed_edges && attack_path.reconstructed_edges.length > 0) {
      return attack_path.reconstructed_edges;
    }
    if (!attack_path || !attack_path.nodes || attack_path.nodes.length < 2) {
      return [];
    }

    // Fallback build
    const hops: ReconstructedEdge[] = [];
    for (let i = 0; i < attack_path.nodes.length - 1; i++) {
      const src = attack_path.nodes[i];
      const dst = attack_path.nodes[i + 1];
      const isInferred = attack_path.missing_hops.includes(src) || attack_path.missing_hops.includes(dst);
      hops.push({
        source: src,
        target: dst,
        status: isInferred ? "INFERRED" : "CONFIRMED",
        confidence: isInferred ? 0.76 : 0.95,
        supporting_event_ids: [`EVT-CORR-${i + 1}`]
      });
    }
    return hops;
  }, [attack_path]);

  const confidenceScore = attack_path?.confidence_score ?? threat_score.confidence;

  const getConfidenceLevel = (score: number) => {
    if (score >= 90) return { label: "VERY HIGH CONFIDENCE", color: "text-emerald-400", bg: "bg-emerald-950/80 border-emerald-500/40" };
    if (score >= 70) return { label: "HIGH CONFIDENCE", color: "text-cyan-400", bg: "bg-cyan-950/80 border-cyan-500/40" };
    if (score >= 40) return { label: "MODERATE CONFIDENCE", color: "text-amber-400", bg: "bg-amber-950/80 border-amber-500/40" };
    return { label: "LOW CONFIDENCE", color: "text-rose-400", bg: "bg-rose-950/80 border-rose-500/40" };
  };

  const confidenceMeta = getConfidenceLevel(confidenceScore);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold font-mono text-white flex items-center gap-2">
              <SearchCode className="w-5 h-5 text-purple-400" />
              ATTACK RECONSTRUCTION & EVIDENCE CORRELATION
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/40 font-bold">
              INDEPENDENT EVIDENCE
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Surviving Telemetry Synthesis • Confirmed vs. Inferred Hop Verification • Explainable AI Confidence
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("replay")}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/40 font-mono text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <Play className="w-3.5 h-3.5" />
            <span>OPEN FORENSIC REPLAY</span>
          </button>
        </div>
      </div>

      {/* Main Critical Banner */}
      <div className="cyber-card p-5 border-rose-500/50 bg-rose-950/30 space-y-2 shadow-[0_0_25px_rgba(244,63,94,0.15)]">
        <div className="flex items-center gap-2 text-rose-300 font-mono font-bold text-sm">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 animate-pulse" />
          <span>CRITICAL INCIDENT: UNAUTHORIZED DATABASE & STORAGE MANIPULATION DETECTED</span>
        </div>
        <p className="text-xs font-mono text-slate-200 leading-relaxed">
          Primary database and file storage records were modified/deleted. C-04 preserves and synthesizes independent security telemetry across authentication, router, network flow, and endpoint logs to reconstruct the attacker’s progression without relying on attacked local tables.
        </p>
      </div>

      {/* Reconstruction Trigger & Progress Panel */}
      <div className="cyber-card p-5 border-purple-500/40 bg-slate-950 space-y-4 shadow-[0_0_20px_rgba(168,85,247,0.15)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
          <div>
            <span className="text-xs font-mono font-bold text-purple-300 uppercase tracking-wider block">
              FORENSIC EVIDENCE STATUS
            </span>
            <span className="text-xs font-mono text-slate-400">
              {events.length} correlated events recorded across {evidenceSources.filter(s => s.available).length} telemetry vaults
            </span>
          </div>

          <button
            onClick={handleStartReconstruction}
            disabled={reconstructionState === "RUNNING"}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 text-white font-mono text-xs font-bold shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {reconstructionState === "RUNNING" ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>RECONSTRUCTING PATH...</span>
              </>
            ) : reconstructionState === "COMPLETE" ? (
              <>
                <RotateCcw className="w-4 h-4" />
                <span>REPLAY RECONSTRUCTION</span>
              </>
            ) : (
              <>
                <SearchCode className="w-4 h-4" />
                <span>START RECONSTRUCTION</span>
              </>
            )}
          </button>
        </div>

        {/* Dynamic Multi-Phase Progress Bar during execution */}
        {reconstructionState === "RUNNING" && (
          <div className="p-3.5 rounded-lg bg-purple-950/40 border border-purple-500/40 space-y-2 animate-fade-in">
            <div className="flex justify-between text-xs font-mono text-purple-300 font-bold">
              <span>{phases[activePhaseIndex]}</span>
              <span>{Math.round(((activePhaseIndex + 1) / phases.length) * 100)}%</span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
              <div
                className="bg-gradient-to-r from-purple-500 to-cyan-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${((activePhaseIndex + 1) / phases.length) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Evidence Sources Checklist */}
        <div>
          <label className="text-[11px] uppercase font-mono tracking-wider text-slate-400 block mb-2.5">
            INDEPENDENT EVIDENCE COLLECTION STATUS
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {evidenceSources.map((source) => (
              <div
                key={source.id}
                className={`p-3 rounded-lg border flex items-center justify-between text-xs font-mono transition-all ${
                  source.available
                    ? "bg-slate-900/90 border-emerald-500/40 text-slate-200"
                    : "bg-slate-950/60 border-slate-800 text-slate-500 opacity-60"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {source.icon}
                  <span className="truncate">{source.label}</span>
                </div>
                {source.available ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-slate-600 shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Results Section (shown always or on complete) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Reconstructed Attack Path Diagram (7 cols) */}
        <div className="lg:col-span-7 cyber-card p-5 border-slate-800 bg-slate-950/95 space-y-4">
          <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-800 gap-2">
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              RECONSTRUCTED SPATIAL-NETWORK ATTACK PATH
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              {reconstructedHops.length} Hops Correlated
            </span>
          </div>

          {/* Reconstructed Hop Chain */}
          {reconstructedHops.length === 0 ? (
            <div className="p-8 text-center text-slate-500 font-mono text-xs">
              No active attack path available to reconstruct. Trigger a simulation scenario first.
            </div>
          ) : (
            <div className="space-y-3">
              {reconstructedHops.map((hop, i) => {
                const isConfirmed = hop.status === "CONFIRMED";
                return (
                  <div
                    key={i}
                    className={`p-3.5 rounded-lg border transition-all ${
                      isConfirmed
                        ? "bg-slate-900/80 border-slate-800 hover:border-cyan-500/50"
                        : "bg-amber-950/20 border-dashed border-amber-500/50 hover:border-amber-400"
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                      {/* Hop Source -> Target */}
                      <div className="flex items-center gap-2 font-bold">
                        <span className="text-slate-400 text-[10px]">HOP {i + 1}:</span>
                        <button
                          onClick={() => { setSelectedDeviceId(hop.source); setActiveTab("graph"); }}
                          className="text-white hover:text-cyan-300 underline decoration-slate-700"
                        >
                          {hop.source}
                        </button>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <button
                          onClick={() => { setSelectedDeviceId(hop.target); setActiveTab("graph"); }}
                          className="text-cyan-300 hover:text-cyan-200 underline decoration-slate-700"
                        >
                          {hop.target}
                        </button>
                      </div>

                      {/* Status badge: Confirmed vs Inferred */}
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            isConfirmed
                              ? "bg-emerald-950/80 text-emerald-300 border-emerald-500/40"
                              : "bg-amber-950/80 text-amber-300 border-amber-500/50"
                          }`}
                        >
                          {isConfirmed ? "CONFIRMED LOG" : "INFERRED LINK"}
                        </span>
                        <span className="text-slate-400 text-[11px]">
                          {Math.round(hop.confidence * 100)}% Conf
                        </span>
                      </div>
                    </div>

                    {/* Supporting Event Reference */}
                    <div className="mt-2 pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-[10px] font-mono text-slate-400 gap-2">
                      <span>Evidence Link: {isConfirmed ? "Direct telemetry match" : "Surrounding spatial correlation"}</span>
                      {hop.supporting_event_ids && hop.supporting_event_ids.length > 0 && (
                        <span>Events: {hop.supporting_event_ids.join(", ")}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Explanation Footer */}
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300 leading-relaxed">
            <strong>Forensic Guarantee:</strong> Primary database records were modified/deleted. C-04 reconstructed the incident from surviving independent security telemetry. Confirmed hops are directly verified by multi-source logs; inferred hops bridge unmonitored segments with explicit confidence scoring.
          </div>
        </div>

        {/* Confidence Gauge & Correlation Detail (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Confidence Score Card */}
          <div className="cyber-card p-5 border-cyan-500/40 bg-slate-950/95 space-y-3 shadow-[0_0_20px_rgba(0,240,255,0.1)]">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block font-bold">
              RECONSTRUCTION CONFIDENCE SCORE
            </span>

            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold font-mono text-cyan-300">
                {confidenceScore.toFixed(1)}%
              </div>
              <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold border ${confidenceMeta.bg} ${confidenceMeta.color}`}>
                {confidenceMeta.label}
              </span>
            </div>

            {/* Progress Gauge */}
            <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-800">
              <div
                className="bg-gradient-to-r from-emerald-500 via-cyan-400 to-rose-500 h-full rounded-full"
                style={{ width: `${confidenceScore}%` }}
              ></div>
            </div>

            <div className="grid grid-cols-4 text-[9.5px] font-mono text-slate-500 pt-1">
              <div>0-39% Low</div>
              <div className="text-center">40-69% Mod</div>
              <div className="text-center">70-89% High</div>
              <div className="text-right">90-100% V.High</div>
            </div>
          </div>

          {/* Incident Dossier Summary */}
          <div className="cyber-card p-5 border-slate-800 bg-slate-950/95 space-y-3">
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider block pb-2 border-b border-slate-800">
              INCIDENT FORENSIC DOSSIER
            </span>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400">Incident Identifier:</span>
                <strong className="text-cyan-300">{active_incident?.incident_id || "INC-C04-001"}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400">Probable Origin:</span>
                <span className="text-white">Laptop-102 (Floor 1 Visitor Lounge)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400">Target Asset:</span>
                <span className="text-rose-300 font-bold">Database-302 (Floor 3)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400">Primary DB State:</span>
                <span className="text-amber-400">Damaged / Deleted</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400">Reconstruction Method:</span>
                <span className="text-emerald-400">Independent Evidence Synthesis</span>
              </div>
            </div>

            <button
              onClick={() => setActiveTab("timeline")}
              className="w-full py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-800 font-mono text-xs font-bold transition-all text-center mt-2"
            >
              VIEW CORRELATED TIMELINE EVENTS
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
