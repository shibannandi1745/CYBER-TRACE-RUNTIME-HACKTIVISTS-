import React, { useState, useMemo } from "react";
import { useSimulation } from "../context/SimulationContext";
import { Badge } from "../components/common/Badge";
import { Device, GraphNode, GraphEdge } from "../types";
import {
  GitFork,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Filter,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Server,
  Database,
  Laptop,
  Cpu,
  Wifi,
  Activity,
  ArrowRight,
  Lock,
  Radio,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  Zap,
} from "lucide-react";

export const AttackGraphPage: React.FC = () => {
  const { state, isolateDevice, unIsolateDevice, setSelectedDeviceId, selectedDeviceId } = useSimulation();
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [filterFloor, setFilterFloor] = useState<number | "ALL">("ALL");

  if (!state) return null;

  const { graph, attack_path, devices } = state;

  // Filter nodes by floor if requested
  const visibleNodes = useMemo(() => {
    if (filterFloor === "ALL") return graph.nodes;
    return graph.nodes.filter((n: GraphNode) => n.floor === filterFloor);
  }, [graph.nodes, filterFloor]);

  const attackNodeSet = useMemo(() => new Set(attack_path?.nodes || []), [attack_path]);
  const attackEdgeSet = useMemo(() => new Set(attack_path?.edges || []), [attack_path]);

  const selectedNode = selectedDeviceId ? (devices[selectedDeviceId] as Device) : null;

  // Layout node coordinates in a circular or multi-tiered floor topology
  const nodePositions = useMemo(() => {
    const positions: Record<string, { x: number; y: number }> = {};
    const floorGroups: Record<number, string[]> = { 1: [], 2: [], 3: [], 4: [] };

    graph.nodes.forEach((n: GraphNode) => {
      if (floorGroups[n.floor]) floorGroups[n.floor].push(n.id);
    });

    // Tier 1 (Floor 1) on Left, Tier 2 on Center-Left, Tier 3 on Center-Right, Tier 4 on Right
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

  // Helper for Node Icon
  const getNodeIcon = (typeStr: string) => {
    const type = typeStr.toUpperCase();
    if (type.includes("SERVER")) return <Server className="w-3.5 h-3.5 shrink-0" />;
    if (type.includes("DATABASE") || type.includes("DB")) return <Database className="w-3.5 h-3.5 shrink-0" />;
    if (type.includes("LAPTOP") || type.includes("WORKSTATION")) return <Laptop className="w-3.5 h-3.5 shrink-0" />;
    if (type.includes("ROUTER") || type.includes("SWITCH") || type.includes("GATEWAY")) return <Wifi className="w-3.5 h-3.5 shrink-0" />;
    return <Cpu className="w-3.5 h-3.5 shrink-0" />;
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* CSS Animation for Attack Path Edge Flow */}
      <style>{`
        @keyframes attackEdgeFlow {
          0% { stroke-dashoffset: 20; }
          100% { stroke-dashoffset: 0; }
        }
        .attack-flow-line {
          animation: attackEdgeFlow 1.1s linear infinite;
        }
        @keyframes socPulseOpacity {
          0%, 100% { opacity: 0.55; }
          50% { opacity: 1; }
        }
        .soc-dot-pulse {
          animation: socPulseOpacity 1.6s ease-in-out infinite;
        }
      `}</style>

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold font-mono text-white flex items-center gap-2">
              <GitFork className="w-5 h-5 text-cyan-400" />
              ATTACK GRAPH & SPATIAL THREAT RECONSTRUCTION
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 font-semibold">
              SOC VISUALIZER
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Directed Network Multigraph • Multi-Hop Pathfinding & Blast Radius Analysis
          </p>
        </div>

        {/* Action Buttons & Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Floor Filter */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs font-mono text-slate-300">
            <Filter className="w-3.5 h-3.5 mr-1.5 text-cyan-400 shrink-0" />
            <span className="text-slate-400 text-[11px] mr-1 hidden sm:inline">FLOOR:</span>
            <select
              value={filterFloor}
              onChange={(e) => setFilterFloor(e.target.value === "ALL" ? "ALL" : Number(e.target.value))}
              className="bg-transparent focus:outline-none cursor-pointer font-bold text-white text-xs"
            >
              <option value="ALL" className="bg-slate-900 text-slate-200">ALL FLOORS (Complete Graph)</option>
              <option value={1} className="bg-slate-900 text-cyan-300">Floor 1 (Public Edge)</option>
              <option value={2} className="bg-slate-900 text-amber-300">Floor 2 (Corporate & IoT)</option>
              <option value={3} className="bg-slate-900 text-orange-300">Floor 3 (Data Center)</option>
              <option value={4} className="bg-slate-900 text-rose-300">Floor 4 (SOC & OT Failsafe)</option>
            </select>
          </div>

          {/* Zoom controls */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1 gap-1">
            <button
              onClick={() => setZoomLevel((z) => Math.min(1.5, z + 0.1))}
              className="p-1 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
              title="Zoom In (+10%)"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <span className="px-1 text-[11px] font-mono font-bold text-cyan-400 min-w-[36px] text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.1))}
              className="p-1 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
              title="Zoom Out (-10%)"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-cyan-400 transition-colors border-l border-slate-800 ml-0.5 pl-1.5"
              title="Reset Zoom to 100%"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Graph & Node Details Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Graph Canvas 8 or 12 cols */}
        <div className={selectedNode ? "lg:col-span-8" : "lg:col-span-12"}>
          <div className="cyber-card p-4 border-slate-800/90 bg-slate-950/95 relative overflow-hidden min-h-[600px] flex flex-col justify-between shadow-[0_0_40px_rgba(0,0,0,0.6)]">
            {/* Top Graph Overlay Bar */}
            <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-800/80 z-10 gap-3">
              <div className="flex flex-wrap items-center gap-3 text-xs font-mono min-w-0">
                <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                  NODES: <strong className="text-white font-bold">{graph.nodes.length}</strong>
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                  RELATIONSHIPS: <strong className="text-white font-bold">{graph.edges.length}</strong>
                </span>
                {attack_path && (
                  <span className="text-rose-300 font-bold font-mono px-2.5 py-0.5 rounded bg-rose-950/90 border border-rose-500/60 flex items-center gap-1.5 shrink-0 shadow-[0_0_15px_rgba(244,63,94,0.3)] animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping shrink-0"></span>
                    ACTIVE PATH ({attack_path.nodes.length} HOPS)
                  </span>
                )}
              </div>

              {attack_path && (
                <div className="text-xs font-mono text-slate-300 flex flex-wrap items-center gap-2 min-w-0 bg-slate-900/80 px-3 py-1 rounded-lg border border-slate-800">
                  <span className="text-slate-400">PATH CONFIDENCE:</span>
                  <strong className="text-cyan-400 text-sm font-bold">{attack_path.confidence_score.toFixed(1)}%</strong>
                  {attack_path.has_missing_telemetry && (
                    <span className="text-[10px] text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/40 shrink-0 font-semibold">
                      Telemetry Loss (-15%)
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* SVG Interactive Canvas */}
            <div className="flex-1 w-full relative overflow-auto py-3">
              <svg
                width="980"
                height="560"
                className="mx-auto"
                style={{ transform: `scale(${zoomLevel})`, transformOrigin: "top center", transition: "transform 0.2s ease" }}
              >
                {/* SVG Definitions for Grid Pattern, Gradients & Arrow Markers */}
                <defs>
                  {/* Subtle Grid Dot Pattern */}
                  <pattern id="soc-grid" width="24" height="24" patternUnits="userSpaceOnUse">
                    <circle cx="12" cy="12" r="0.85" fill="#334155" opacity="0.4" />
                  </pattern>

                  {/* Radial Background Depth Gradient */}
                  <radialGradient id="soc-radial-glow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#0f172a" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#020617" stopOpacity="1" />
                  </radialGradient>

                  {/* Arrowhead Markers */}
                  <marker
                    id="arrow-attack"
                    viewBox="0 0 10 10"
                    refX="16"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1 L 10 5 L 0 9 z" fill="#f43f5e" />
                  </marker>

                  <marker
                    id="arrow-normal"
                    viewBox="0 0 10 10"
                    refX="14"
                    refY="5"
                    markerWidth="5"
                    markerHeight="5"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 2 L 8 5 L 0 8 z" fill="#475569" />
                  </marker>

                  {/* Subtle Drop Shadows & Glow Filters */}
                  <filter id="glow-attack" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="6" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>

                  <filter id="glow-selected" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="5" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Canvas Grid Background */}
                <rect width="980" height="560" fill="url(#soc-radial-glow)" />
                <rect width="980" height="560" fill="url(#soc-grid)" />

                {/* Background Floor Boundary Tiers */}
                <g>
                  <rect x="18" y="16" width="206" height="528" rx="10" fill="rgba(15, 23, 42, 0.45)" stroke="#1e293b" strokeWidth="1.5" strokeDasharray="6 4" />
                  <rect x="18" y="16" width="206" height="28" rx="8" fill="rgba(15, 23, 42, 0.8)" />
                  <text x="28" y="34" fill="#38bdf8" fontSize="10.5" fontFamily="monospace" fontWeight="bold">LEVEL 1: PUBLIC EDGE</text>

                  <rect x="258" y="16" width="224" height="528" rx="10" fill="rgba(15, 23, 42, 0.45)" stroke="#1e293b" strokeWidth="1.5" strokeDasharray="6 4" />
                  <rect x="258" y="16" width="224" height="28" rx="8" fill="rgba(15, 23, 42, 0.8)" />
                  <text x="268" y="34" fill="#fbbf24" fontSize="10.5" fontFamily="monospace" fontWeight="bold">LEVEL 2: CORP & IOT</text>

                  <rect x="508" y="16" width="214" height="528" rx="10" fill="rgba(15, 23, 42, 0.45)" stroke="#1e293b" strokeWidth="1.5" strokeDasharray="6 4" />
                  <rect x="508" y="16" width="214" height="28" rx="8" fill="rgba(15, 23, 42, 0.8)" />
                  <text x="518" y="34" fill="#fb923c" fontSize="10.5" fontFamily="monospace" fontWeight="bold">LEVEL 3: DATACENTER</text>

                  <rect x="748" y="16" width="224" height="528" rx="10" fill="rgba(15, 23, 42, 0.45)" stroke="#1e293b" strokeWidth="1.5" strokeDasharray="6 4" />
                  <rect x="748" y="16" width="224" height="28" rx="8" fill="rgba(15, 23, 42, 0.8)" />
                  <text x="758" y="34" fill="#f43f5e" fontSize="10.5" fontFamily="monospace" fontWeight="bold">LEVEL 4: SOC & OT</text>
                </g>

                {/* Edges Layer */}
                {graph.edges.map((edge: GraphEdge) => {
                  const p1 = nodePositions[edge.source];
                  const p2 = nodePositions[edge.target];
                  if (!p1 || !p2) return null;

                  const isAttack = edge.is_attack_path || attackEdgeSet.has(edge.id);
                  const isBlocked = edge.is_blocked;
                  const midX = (p1.x + p2.x) / 2;
                  const midY = (p1.y + p2.y) / 2;

                  return (
                    <g key={edge.id}>
                      {/* Outer Glow for Attack Edges */}
                      {isAttack && (
                        <line
                          x1={p1.x}
                          y1={p1.y}
                          x2={p2.x}
                          y2={p2.y}
                          stroke="#f43f5e"
                          strokeWidth="6"
                          opacity="0.25"
                          strokeLinecap="round"
                        />
                      )}

                      {/* Primary Line */}
                      <line
                        x1={p1.x}
                        y1={p1.y}
                        x2={p2.x}
                        y2={p2.y}
                        stroke={isBlocked ? "#64748b" : isAttack ? "#f43f5e" : "#334155"}
                        strokeWidth={isAttack ? 3.2 : 1.5}
                        strokeDasharray={isBlocked ? "4,4" : isAttack ? "10,6" : undefined}
                        className={isAttack ? "attack-flow-line" : ""}
                        markerEnd={isAttack ? "url(#arrow-attack)" : "url(#arrow-normal)"}
                        opacity={isAttack ? 1.0 : 0.65}
                      />

                      {/* Blocked Badge Marker on Edge Midpoint */}
                      {isBlocked && (
                        <g transform={`translate(${midX}, ${midY})`}>
                          <circle r="7" fill="#1e293b" stroke="#f43f5e" strokeWidth="1.5" />
                          <text y="3" textAnchor="middle" fill="#f43f5e" fontSize="9" fontWeight="bold">✕</text>
                        </g>
                      )}
                    </g>
                  );
                })}

                {/* Nodes Layer */}
                {visibleNodes.map((node: GraphNode) => {
                  const pos = nodePositions[node.id];
                  if (!pos) return null;

                  const isAttack = attackNodeSet.has(node.id);
                  const isOrigin = attack_path?.source_device === node.id;
                  const isTarget = attack_path?.target_device === node.id;
                  const isIsolated = node.is_quarantined;
                  const isSelected = selectedDeviceId === node.id;

                  // Node Card Styling according to state
                  let cardBg = "rgba(15, 23, 42, 0.95)";
                  let cardBorder = "#334155";
                  let statusDotColor = "#10b981"; // Normal emerald
                  let statusLabel = "NORMAL";

                  if (isIsolated) {
                    cardBg = "rgba(88, 28, 135, 0.4)";
                    cardBorder = "#c084fc";
                    statusDotColor = "#c084fc";
                    statusLabel = "ISOLATED";
                  } else if (isOrigin) {
                    cardBg = "rgba(153, 27, 27, 0.5)";
                    cardBorder = "#f43f5e";
                    statusDotColor = "#f43f5e";
                    statusLabel = "ORIGIN";
                  } else if (isTarget) {
                    cardBg = "rgba(159, 18, 57, 0.5)";
                    cardBorder = "#fb7185";
                    statusDotColor = "#fb7185";
                    statusLabel = "TARGET";
                  } else if (isAttack || node.status === "COMPROMISED") {
                    cardBg = "rgba(131, 24, 67, 0.45)";
                    cardBorder = "#f43f5e";
                    statusDotColor = "#f43f5e";
                    statusLabel = "COMPROMISED";
                  } else if (node.status === "HIGH_RISK") {
                    cardBg = "rgba(124, 45, 18, 0.45)";
                    cardBorder = "#f97316";
                    statusDotColor = "#f97316";
                    statusLabel = "HIGH RISK";
                  } else if (node.status === "SUSPICIOUS") {
                    cardBg = "rgba(120, 53, 15, 0.45)";
                    cardBorder = "#f59e0b";
                    statusDotColor = "#f59e0b";
                    statusLabel = "SUSPICIOUS";
                  } else if (node.status === "PROTECTED") {
                    cardBg = "rgba(30, 58, 138, 0.45)";
                    cardBorder = "#38bdf8";
                    statusDotColor = "#38bdf8";
                    statusLabel = "SECURE";
                  }

                  if (isSelected) {
                    cardBorder = "#00f0ff";
                  }

                  const cardW = 108;
                  const cardH = 44;

                  return (
                    <g
                      key={node.id}
                      transform={`translate(${pos.x - cardW / 2}, ${pos.y - cardH / 2})`}
                      onClick={() => setSelectedDeviceId(node.id)}
                      className="cursor-pointer group"
                    >
                      {/* Pulse Ring for Active Attack Nodes — opacity-only animation, no scale, no jitter */}
                      {(isAttack || isOrigin || isTarget) && (
                        <rect
                          x="-4"
                          y="-4"
                          width={cardW + 8}
                          height={cardH + 8}
                          rx="10"
                          fill="transparent"
                          stroke="#f43f5e"
                          strokeWidth="1.5"
                        >
                          <animate
                            attributeName="opacity"
                            values="0.6;0.1;0.6"
                            dur="1.8s"
                            repeatCount="indefinite"
                          />
                        </rect>
                      )}

                      {/* Main Professional Node Card Container */}
                      <rect
                        width={cardW}
                        height={cardH}
                        rx="7"
                        fill={cardBg}
                        stroke={cardBorder}
                        strokeWidth={isSelected ? 2.5 : isAttack ? 2 : 1.2}
                        filter={isAttack ? "url(#glow-attack)" : isSelected ? "url(#glow-selected)" : undefined}
                        className="transition-all duration-200 group-hover:stroke-cyan-400"
                      />

                      {/* Top Accent Line */}
                      <rect
                        x="0"
                        y="0"
                        width={cardW}
                        height="3"
                        rx="1.5"
                        fill={cardBorder}
                      />

                      {/* Node Header Row: Status Indicator Dot & Device ID */}
                      <circle cx="12" cy="16" r="3.5" fill={statusDotColor} className={isAttack ? "soc-dot-pulse" : ""} />

                      <text
                        x="21"
                        y="19"
                        fill="#ffffff"
                        fontSize="9.5"
                        fontFamily="monospace"
                        fontWeight="bold"
                        className="tracking-tight"
                      >
                        {node.id.length > 13 ? node.id.slice(0, 11) + ".." : node.id}
                      </text>

                      {/* Subtitle Row: IP Address & Status Tag */}
                      <text
                        x="12"
                        y="34"
                        fill="#94a3b8"
                        fontSize="7.5"
                        fontFamily="monospace"
                      >
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
                        {statusLabel}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Bottom Legend */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-800/90 text-[11px] font-mono text-slate-400 bg-slate-950/80 px-2 py-1 rounded-lg">
              <div className="flex flex-wrap items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Normal Host
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e] animate-pulse"></span> Attack Path Hop
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-400"></span> Quarantined / Isolated
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span> Shielded Asset
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-4 border-b-2 stroke-dasharray-4 border-rose-500 inline-block"></span> Attack Flow
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-800 border border-rose-500 text-[8px] flex items-center justify-center text-rose-500 font-bold">✕</span> Blocked Route
                </span>
              </div>
              <div className="text-slate-400 flex items-center gap-1 text-[10.5px]">
                <Eye className="w-3 h-3 text-cyan-400" />
                <span>Click any node to inspect SOC telemetry & active containment controls</span>
              </div>
            </div>
          </div>
        </div>

        {/* Node Detail Sidebar (If Selected) */}
        {selectedNode && (
          <div className="lg:col-span-4 cyber-card p-5 border-cyan-500/50 bg-slate-950/95 space-y-4 shadow-[0_0_30px_rgba(0,240,255,0.15)]">
            <div className="pb-3 border-b border-slate-800 flex items-start justify-between gap-2 min-w-0">
              <div className="min-w-0 flex-1 pr-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="shrink-0 flex items-center">{getNodeIcon(selectedNode.type)}</span>
                  <h3 className="text-sm font-bold font-mono text-cyan-300 truncate min-w-0" title={selectedNode.id}>{selectedNode.id}</h3>
                </div>
                <p className="text-xs text-slate-400 truncate mt-0.5 min-w-0 w-full" title={selectedNode.name}>{selectedNode.name}</p>
              </div>
              <span className="shrink-0 min-w-0 flex justify-end truncate">
                <Badge
                  label={selectedNode.is_isolated ? "ISOLATED" : selectedNode.status}
                  variant={selectedNode.is_isolated ? "quarantined" : (selectedNode.status.toLowerCase() as any)}
                />
              </span>
            </div>

            {/* Risk Gauge Bar */}
            <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1.5 min-w-0">
              <div className="flex justify-between items-center text-xs font-mono min-w-0 gap-2">
                <span className="text-slate-400 uppercase font-semibold shrink-0">Threat Risk Level:</span>
                <span className="text-rose-400 font-bold text-sm shrink-0">{selectedNode.risk_score}/100</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                <div
                  className={`h-full rounded-full transition-all ${
                    selectedNode.risk_score > 70
                      ? "bg-gradient-to-r from-orange-500 to-rose-500"
                      : selectedNode.risk_score > 40
                      ? "bg-gradient-to-r from-amber-500 to-orange-500"
                      : "bg-gradient-to-r from-emerald-500 to-teal-500"
                  }`}
                  style={{ width: `${selectedNode.risk_score}%` }}
                ></div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="space-y-2 text-xs font-mono min-w-0">
              <div className="flex justify-between py-1.5 border-b border-slate-900 gap-2 min-w-0 w-full">
                <span className="text-slate-400 shrink-0">Device Category:</span>
                <span className="text-white font-semibold truncate min-w-0 text-right">{selectedNode.type}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-900 gap-2 min-w-0 w-full">
                <span className="text-slate-400 shrink-0">IP Address:</span>
                <span className="text-cyan-300 font-bold truncate min-w-0 text-right">{selectedNode.ip_address}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-900 gap-2 min-w-0 w-full">
                <span className="text-slate-400 shrink-0">Floor & Location:</span>
                <span className="text-white truncate min-w-0 text-right">Floor {selectedNode.floor} • {selectedNode.room}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-900 gap-2 min-w-0 w-full">
                <span className="text-slate-400 shrink-0">Network Segment:</span>
                <span className="text-slate-300 truncate min-w-0 text-right">{selectedNode.network_segment}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-900 gap-2 min-w-0 w-full">
                <span className="text-slate-400 shrink-0">Asset Criticality:</span>
                <span className={`font-bold shrink-0 text-right ${
                  selectedNode.criticality === "CRITICAL" ? "text-rose-400" :
                  selectedNode.criticality === "HIGH" ? "text-orange-400" : "text-amber-400"
                }`}>{selectedNode.criticality}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-900 gap-2 min-w-0 w-full">
                <span className="text-slate-400 shrink-0">Active Connections:</span>
                <span className="text-cyan-400 font-bold shrink-0 text-right">{selectedNode.connected_devices.length} Peer Hosts</span>
              </div>
            </div>

            {/* Threat Reasons / Evidence if any */}
            {selectedNode.threat_reasons && selectedNode.threat_reasons.length > 0 && (
              <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-500/30 text-xs font-mono space-y-1">
                <span className="text-rose-400 font-bold uppercase block text-[10px]">Detected Anomaly Indicators:</span>
                {selectedNode.threat_reasons.map((r, i) => (
                  <div key={i} className="text-rose-200 text-[11px] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>
                    <span>{r}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              {selectedNode.is_isolated ? (
                <button
                  onClick={() => unIsolateDevice(selectedNode.id)}
                  className="w-full py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/50 font-mono text-xs font-bold transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                >
                  RESTORE TO NORMAL (UN-QUARANTINE)
                </button>
              ) : (
                <button
                  onClick={() => isolateDevice(selectedNode.id)}
                  className="w-full py-2.5 rounded-lg bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 text-white font-mono text-xs font-bold shadow-[0_0_15px_rgba(168,85,247,0.35)] transition-all flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4 text-purple-200" />
                  <span>ISOLATE HOST IN SIMULATION</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
