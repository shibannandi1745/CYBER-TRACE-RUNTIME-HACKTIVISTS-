import React, { useState, useEffect, useMemo, useRef } from "react";
import { useSimulation } from "../context/SimulationContext";
import { Badge } from "../components/common/Badge";
import { TelemetryEvent, GraphNode, GraphEdge } from "../types";
import {
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
  PlayCircle,
  Clock,
  ShieldAlert,
  ShieldCheck,
  Server,
  Database,
  Laptop,
  Radio,
  FileCode,
  ArrowRight,
  Zap,
  Activity,
  CheckCircle2,
  AlertTriangle,
  FileText,
  SearchCode,
  Flame,
} from "lucide-react";

export const ForensicReplayPage: React.FC = () => {
  const { state, setSelectedDeviceId, setActiveTab } = useSimulation();

  if (!state) return null;

  const { incident_event_history, active_incident, threat_score, graph } = state;

  // Filter replay events by active incident or valid attack events, sorted by step_index
  const replayEvents: TelemetryEvent[] = useMemo(() => {
    if (!incident_event_history || incident_event_history.length === 0) {
      return [];
    }
    const targetIncId = active_incident?.incident_id;
    const filtered = incident_event_history.filter(
      (e) => (targetIncId ? e.incident_id === targetIncId : true) && (e.is_anomaly || e.attack_stage)
    );

    return filtered.sort((a, b) => {
      if (a.scenario_step_index !== undefined && b.scenario_step_index !== undefined) {
        return a.scenario_step_index - b.scenario_step_index;
      }
      return a.timestamp - b.timestamp;
    });
  }, [incident_event_history, active_incident]);

  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1.0);
  const timerRef = useRef<any>(null);
  const activeEventRef = useRef<HTMLDivElement | null>(null);

  const totalSteps = replayEvents.length;
  const currentEvent: TelemetryEvent | null = replayEvents[currentStep] || null;
  const isComplete = totalSteps > 0 && currentStep === totalSteps - 1;

  // Replay timer loop
  useEffect(() => {
    if (isPlaying && totalSteps > 0) {
      const intervalMs = 1800 / speed;
      timerRef.current = setTimeout(() => {
        setCurrentStep((prev) => {
          if (prev >= totalSteps - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, intervalMs);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, currentStep, speed, totalSteps]);

  // Compute active nodes and edges up to currentStep
  const { activeNodeSet, activeEdgeSet, currentNodeId } = useMemo(() => {
    const nodes = new Set<string>();
    const edges = new Set<string>();
    let current = "";

    for (let i = 0; i <= currentStep && i < replayEvents.length; i++) {
      const ev = replayEvents[i];
      if (ev.source_device) nodes.add(ev.source_device);
      if (ev.destination_device) {
        nodes.add(ev.destination_device);
        edges.add(`${ev.source_device}->${ev.destination_device}`);
      }
      if (i === currentStep) {
        current = ev.destination_device || ev.source_device;
      }
    }

    return { activeNodeSet: nodes, activeEdgeSet: edges, currentNodeId: current };
  }, [replayEvents, currentStep]);

  // Node positions on graph
  const nodePositions = useMemo(() => {
    const positions: Record<string, { x: number; y: number }> = {};
    const floorGroups: Record<number, string[]> = { 1: [], 2: [], 3: [], 4: [] };

    graph.nodes.forEach((n: GraphNode) => {
      if (floorGroups[n.floor]) floorGroups[n.floor].push(n.id);
    });

    const tierX = { 1: 125, 2: 365, 3: 605, 4: 845 };

    Object.entries(floorGroups).forEach(([floorStr, ids]) => {
      const f = Number(floorStr);
      const x = tierX[f as keyof typeof tierX] || 400;
      const count = ids.length;
      const spacingY = 480 / (count + 1);

      ids.forEach((id: string, idx: number) => {
        positions[id] = {
          x: x + (idx % 2 === 0 ? -20 : 20),
          y: (idx + 1) * spacingY + 38,
        };
      });
    });

    return positions;
  }, [graph.nodes]);

  const handlePlayToggle = () => {
    if (isComplete) {
      setCurrentStep(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleRestart = () => {
    setIsPlaying(false);
    setCurrentStep(0);
  };

  const handlePrev = () => {
    setIsPlaying(false);
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setIsPlaying(false);
    setCurrentStep((prev) => Math.min(totalSteps - 1, prev + 1));
  };

  const handleScrubberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsPlaying(false);
    setCurrentStep(Number(e.target.value));
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* CSS for Replay Pulse */}
      <style>{`
        @keyframes replayPulseGlow {
          0%, 100% { opacity: 0.8; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(1.08); }
        }
        .replay-active-node {
          filter: drop-shadow(0 0 12px rgba(244,63,94,0.9));
        }
      `}</style>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold font-mono text-white flex items-center gap-2">
              <PlayCircle className="w-5 h-5 text-cyan-400" />
              ATTACK INCIDENT FORENSIC REPLAY
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-bold">
              STEP-BY-STEP RECONSTRUCTION
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Deterministic Incident Playback • Progressive Asset Compromise & Lateral Hop Tracing
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("reconstruction")}
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-950 to-slate-900 border border-purple-500/50 hover:border-purple-400 text-purple-300 font-mono text-xs font-bold transition-all shadow-[0_0_15px_rgba(168,85,247,0.2)] flex items-center gap-1.5"
          >
            <SearchCode className="w-4 h-4 text-purple-400" />
            <span>VIEW RECONSTRUCTION</span>
          </button>
        </div>
      </div>

      {totalSteps === 0 ? (
        <div className="cyber-card p-12 text-center border-slate-800 space-y-4">
          <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto" />
          <h3 className="text-base font-bold font-mono text-white">NO RECORDED INCIDENT FOR REPLAY</h3>
          <p className="text-xs font-mono text-slate-400 max-w-md mx-auto">
            Run or complete an attack scenario from the Attack Simulator to capture deterministic telemetry and start forensic replay.
          </p>
        </div>
      ) : (
        <>
          {/* Replay Control Bar */}
          <div className="cyber-card p-4 border-cyan-500/40 bg-slate-950 space-y-3 shadow-[0_0_25px_rgba(0,240,255,0.15)]">
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Playback Transport Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRestart}
                  className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors"
                  title="Restart Replay"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={handlePrev}
                  disabled={currentStep === 0}
                  className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Previous Step"
                >
                  <SkipBack className="w-4 h-4" />
                </button>
                <button
                  onClick={handlePlayToggle}
                  className={`px-4 py-2 rounded-lg font-mono text-xs font-bold transition-all flex items-center gap-2 ${
                    isPlaying
                      ? "bg-amber-600 hover:bg-amber-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                      : isComplete
                      ? "bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_15px_rgba(0,240,255,0.4)]"
                      : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                  }`}
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-4 h-4" />
                      <span>PAUSE</span>
                    </>
                  ) : isComplete ? (
                    <>
                      <RotateCcw className="w-4 h-4" />
                      <span>REPLAY AGAIN</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      <span>PLAY REPLAY</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleNext}
                  disabled={currentStep === totalSteps - 1}
                  className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Next Step"
                >
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>

              {/* Step Counter & Speed Knobs */}
              <div className="flex items-center gap-4 text-xs font-mono">
                <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 mr-1">STEP:</span>
                  <strong className="text-cyan-300">{currentStep + 1}</strong>
                  <span className="text-slate-500"> / {totalSteps}</span>
                </div>

                <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5">
                  {[0.5, 1, 2].map((s) => (
                    <button
                      key={s}
                      onClick={() => setSpeed(s)}
                      className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                        speed === s
                          ? "bg-cyan-500 text-slate-950 font-bold"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Timeline Progress Scrubber */}
            <div className="space-y-1">
              <input
                type="range"
                min="0"
                max={totalSteps - 1}
                value={currentStep}
                onChange={handleScrubberChange}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>START: {replayEvents[0]?.formatted_time || "00:00:00"}</span>
                <span>{Math.round(((currentStep + 1) / totalSteps) * 100)}% COMPLETED</span>
                <span>END: {replayEvents[totalSteps - 1]?.formatted_time || "00:00:00"}</span>
              </div>
            </div>
          </div>

          {/* Live Incident HUD & Graph Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Embedded Replay Graph (8 cols) */}
            <div className="lg:col-span-8 cyber-card p-4 border-slate-800 bg-slate-950/95 relative overflow-hidden flex flex-col justify-between min-h-[580px]">
              {/* Overlay Top Bar */}
              <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-800 text-xs font-mono gap-2">
                <div className="flex items-center gap-3">
                  <span className="text-slate-400">ACTIVE POSITION:</span>
                  <strong className="text-rose-400 font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                    {currentNodeId || "Reconnaissance Phase"}
                  </strong>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-slate-400">THREAT PROGRESSION:</span>
                  <strong className="text-amber-400 font-bold text-sm">
                    {currentEvent?.threat_score_snapshot ?? 32}/100
                  </strong>
                </div>
              </div>

              {/* Interactive SVG Graph Canvas */}
              <div className="flex-1 w-full relative overflow-auto py-3">
                <svg width="980" height="520" className="mx-auto">
                  {/* Background Floor Tiers */}
                  <g>
                    <rect x="18" y="16" width="206" height="488" rx="10" fill="rgba(15, 23, 42, 0.45)" stroke="#1e293b" strokeWidth="1.5" strokeDasharray="6 4" />
                    <rect x="18" y="16" width="206" height="28" rx="8" fill="rgba(15, 23, 42, 0.8)" />
                    <text x="28" y="34" fill="#38bdf8" fontSize="10.5" fontFamily="monospace" fontWeight="bold">LEVEL 1: PUBLIC EDGE</text>

                    <rect x="258" y="16" width="224" height="488" rx="10" fill="rgba(15, 23, 42, 0.45)" stroke="#1e293b" strokeWidth="1.5" strokeDasharray="6 4" />
                    <rect x="258" y="16" width="224" height="28" rx="8" fill="rgba(15, 23, 42, 0.8)" />
                    <text x="268" y="34" fill="#fbbf24" fontSize="10.5" fontFamily="monospace" fontWeight="bold">LEVEL 2: CORP & IOT</text>

                    <rect x="508" y="16" width="214" height="488" rx="10" fill="rgba(15, 23, 42, 0.45)" stroke="#1e293b" strokeWidth="1.5" strokeDasharray="6 4" />
                    <rect x="508" y="16" width="214" height="28" rx="8" fill="rgba(15, 23, 42, 0.8)" />
                    <text x="518" y="34" fill="#fb923c" fontSize="10.5" fontFamily="monospace" fontWeight="bold">LEVEL 3: DATACENTER</text>

                    <rect x="748" y="16" width="224" height="488" rx="10" fill="rgba(15, 23, 42, 0.45)" stroke="#1e293b" strokeWidth="1.5" strokeDasharray="6 4" />
                    <rect x="748" y="16" width="224" height="28" rx="8" fill="rgba(15, 23, 42, 0.8)" />
                    <text x="758" y="34" fill="#f43f5e" fontSize="10.5" fontFamily="monospace" fontWeight="bold">LEVEL 4: SOC & OT</text>
                  </g>

                  {/* Edges */}
                  {graph.edges.map((edge: GraphEdge) => {
                    const p1 = nodePositions[edge.source];
                    const p2 = nodePositions[edge.target];
                    if (!p1 || !p2) return null;

                    const isReplayEdge = activeEdgeSet.has(edge.id) || activeEdgeSet.has(`${edge.source}->${edge.target}`);

                    return (
                      <line
                        key={edge.id}
                        x1={p1.x}
                        y1={p1.y}
                        x2={p2.x}
                        y2={p2.y}
                        stroke={isReplayEdge ? "#f43f5e" : "#334155"}
                        strokeWidth={isReplayEdge ? 3.5 : 1}
                        strokeDasharray={isReplayEdge ? "8 4" : undefined}
                        opacity={isReplayEdge ? 1.0 : 0.4}
                        style={{
                          filter: isReplayEdge ? "drop-shadow(0 0 8px rgba(244,63,94,0.8))" : undefined,
                        }}
                      />
                    );
                  })}

                  {/* Nodes */}
                  {graph.nodes.map((node: GraphNode) => {
                    const pos = nodePositions[node.id];
                    if (!pos) return null;

                    const isCompromisedInReplay = activeNodeSet.has(node.id);
                    const isCurrentlyActive = currentNodeId === node.id;

                    const cardW = 108;
                    const cardH = 44;

                    const cardBg = isCurrentlyActive
                      ? "rgba(159, 18, 57, 0.7)"
                      : isCompromisedInReplay
                      ? "rgba(131, 24, 67, 0.45)"
                      : "rgba(15, 23, 42, 0.9)";

                    const cardBorder = isCurrentlyActive
                      ? "#f43f5e"
                      : isCompromisedInReplay
                      ? "#fb7185"
                      : "#334155";

                    const statusDotColor = isCompromisedInReplay ? "#f43f5e" : "#10b981";

                    return (
                      <g
                        key={node.id}
                        transform={`translate(${pos.x - cardW / 2}, ${pos.y - cardH / 2})`}
                        onClick={() => setSelectedDeviceId(node.id)}
                        className="cursor-pointer"
                      >
                        {isCurrentlyActive && (
                          <rect
                            x="-4"
                            y="-4"
                            width={cardW + 8}
                            height={cardH + 8}
                            rx="10"
                            fill="transparent"
                            stroke="#f43f5e"
                            strokeWidth="2"
                            className="animate-ping"
                            opacity="0.4"
                          />
                        )}

                        <rect
                          width={cardW}
                          height={cardH}
                          rx="7"
                          fill={cardBg}
                          stroke={cardBorder}
                          strokeWidth={isCurrentlyActive ? 2.5 : isCompromisedInReplay ? 2 : 1}
                        />

                        {/* Top Accent Line */}
                        <rect x="0" y="0" width={cardW} height="3" rx="1.5" fill={cardBorder} />

                        {/* Status Dot */}
                        <circle cx="12" cy="16" r="3.5" fill={statusDotColor} />

                        {/* Node Label */}
                        <text
                          x="21"
                          y="19"
                          fill="#ffffff"
                          fontSize="9.5"
                          fontFamily="monospace"
                          fontWeight="bold"
                        >
                          {node.id.length > 13 ? node.id.slice(0, 11) + ".." : node.id}
                        </text>

                        {/* Node IP & Tag */}
                        <text x="12" y="34" fill="#94a3b8" fontSize="7.5" fontFamily="monospace">
                          {node.ip}
                        </text>

                        <text
                          x={cardW - 8}
                          y="34"
                          textAnchor="end"
                          fill={statusDotColor}
                          fontSize="7"
                          fontFamily="monospace"
                          fontWeight="bold"
                        >
                          {isCompromisedInReplay ? "AFFECTED" : "NOMINAL"}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Bottom Legend */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-800 text-[11px] font-mono text-slate-400">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Unaffected Host
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e]"></span> Compromised Node
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-4 border-b-2 border-dashed border-rose-500 inline-block"></span> Lateral Hop Traversed
                  </span>
                </div>
                <div>Showing playback step {currentStep + 1} of {totalSteps}</div>
              </div>
            </div>

            {/* Replay State & Incident Dossier Sidebar (4 cols) */}
            <div className="lg:col-span-4 space-y-4">
              {/* Current Step Status Card */}
              {currentEvent && (
                <div className="cyber-card p-4 border-cyan-500/40 bg-slate-950/95 space-y-3 shadow-[0_0_20px_rgba(0,240,255,0.15)]">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-cyan-400 font-bold">
                      CURRENT PLAYBACK EVENT
                    </span>
                    <span className="text-xs font-mono text-slate-400">{currentEvent.formatted_time}</span>
                  </div>

                  {/* Stage & Severity */}
                  <div className="flex flex-wrap items-center gap-2">
                    {currentEvent.attack_stage && (
                      <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-rose-950 text-rose-300 border border-rose-500/50">
                        {currentEvent.attack_stage.replace("_", " ")}
                      </span>
                    )}
                    <Badge label={currentEvent.severity} variant="compromised" />
                  </div>

                  {/* Nodes traversal */}
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1 text-xs font-mono min-w-0">
                    <div className="flex justify-between gap-2 min-w-0 w-full">
                      <span className="text-slate-400 shrink-0">SOURCE:</span>
                      <strong className="text-white truncate min-w-0 text-right">{currentEvent.source_device}</strong>
                    </div>
                    {currentEvent.destination_device && (
                      <div className="flex justify-between gap-2 min-w-0 w-full">
                        <span className="text-slate-400 shrink-0">TARGET:</span>
                        <strong className="text-cyan-300 truncate min-w-0 text-right">{currentEvent.destination_device}</strong>
                      </div>
                    )}
                    <div className="flex justify-between gap-2 min-w-0 w-full">
                      <span className="text-slate-400 shrink-0">LOCATION:</span>
                      <span className="text-slate-300 truncate min-w-0 text-right">Floor {currentEvent.floor} • {currentEvent.room || "Rack A"}</span>
                    </div>
                    <div className="flex justify-between gap-2 min-w-0 w-full">
                      <span className="text-slate-400 shrink-0">USER:</span>
                      <span className="text-slate-200 truncate min-w-0 text-right">{currentEvent.user || "SYSTEM"}</span>
                    </div>
                  </div>

                  {/* Event Description */}
                  <p className="text-xs font-mono text-slate-200 leading-relaxed break-words bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                    {currentEvent.description}
                  </p>

                  {/* Threat Score Snapshot */}
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">THREAT SCORE AT STEP:</span>
                    <strong className="text-rose-400 font-bold text-sm">
                      {currentEvent.threat_score_snapshot ?? 32}/100
                    </strong>
                  </div>
                </div>
              )}

              {/* Incident Summary Card when complete */}
              {isComplete && (
                <div className="cyber-card p-5 border-emerald-500/40 bg-slate-950 space-y-4 shadow-[0_0_25px_rgba(16,185,129,0.2)] animate-fade-in">
                  <div className="flex items-center gap-2 text-emerald-400 font-mono font-bold text-sm pb-2 border-b border-slate-800">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <span>FORENSIC REPLAY COMPLETE</span>
                  </div>

                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex justify-between py-1 border-b border-slate-900">
                      <span className="text-slate-400">Incident ID:</span>
                      <strong className="text-cyan-300">{active_incident?.incident_id || "INC-C04-001"}</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-900">
                      <span className="text-slate-400">Attack Origin:</span>
                      <span className="text-white">{replayEvents[0]?.source_device} (Floor 1)</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-900">
                      <span className="text-slate-400">Critical Target:</span>
                      <span className="text-rose-300 font-bold">Database-302 & FileServer-303</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-900">
                      <span className="text-slate-400">Total Hops Traversed:</span>
                      <strong className="text-white">{activeNodeSet.size} Devices</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-900">
                      <span className="text-slate-400">Reconstruction Confidence:</span>
                      <strong className="text-cyan-400">{threat_score.confidence.toFixed(1)}%</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-900">
                      <span className="text-slate-400">Database Impact:</span>
                      <span className="text-amber-400">Unauthorized DELETE & Overwrite</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300 leading-relaxed">
                    <strong>Recommended Response:</strong> Isolate compromised endpoints, sever lateral VLAN tunnels, and preserve independent audit logs.
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => setActiveTab("reconstruction")}
                      className="py-2 px-3 rounded-lg bg-purple-900/60 hover:bg-purple-800 text-purple-200 border border-purple-500/50 font-mono text-xs font-bold transition-all text-center"
                    >
                      View Evidence
                    </button>
                    <button
                      onClick={() => setActiveTab("timeline")}
                      className="py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/40 font-mono text-xs font-bold transition-all text-center"
                    >
                      View Timeline
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
