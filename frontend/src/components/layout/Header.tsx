import React, { useState } from "react";
import { useSimulation } from "../../context/SimulationContext";
import { Shield, ShieldAlert, Activity, User, Play, Pause, RotateCcw, Zap, Wifi, WifiOff, Database, Volume2, VolumeX } from "lucide-react";
import { Badge } from "../common/Badge";

interface HeaderProps {
  onOpenSimulator: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSimulator }) => {
  const { state, isConnected, setAnalystAvailability, togglePause, resetSimulation, sirenState, silenceSiren, playSiren } = useSimulation();

  const availability = state?.system_status.analyst_availability || "AVAILABLE";
  const isPaused = state?.system_status.is_paused || false;
  const threatScore = state?.threat_score.overall_score || 0;
  const severity = state?.threat_score.severity || "LOW";
  const dbStats = state?.database;

  const severityColor = {
    LOW: "text-emerald-400 border-emerald-500/40 bg-emerald-950/40",
    MEDIUM: "text-amber-400 border-amber-500/40 bg-amber-950/40",
    HIGH: "text-orange-400 border-orange-500/40 bg-orange-950/40",
    CRITICAL: "text-rose-400 border-rose-500/50 bg-rose-950/60 font-bold animate-pulse",
  }[severity];

  const availabilityColor = {
    AVAILABLE: "bg-emerald-500 text-emerald-950",
    BUSY: "bg-amber-500 text-amber-950",
    AWAY: "bg-orange-500 text-orange-950",
    OFFLINE: "bg-rose-500 text-rose-950",
  }[availability];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-2.5 flex flex-wrap md:flex-nowrap items-center justify-between gap-3 shadow-xl">
      {/* Brand Identity */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-500/40 shadow-[0_0_15px_rgba(0,240,255,0.3)] shrink-0">
          <Shield className="w-5 h-5 text-cyan-400" />
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
          </span>
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-base font-bold font-mono tracking-wider text-white truncate">
              CYBER<span className="text-cyan-400">TRACE</span> <span className="text-xs px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/40">AI</span>
            </h1>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 flex items-center gap-1 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
              AI DEFENSE: ACTIVE
            </span>
          </div>
          <p className="text-[11px] text-slate-400 tracking-tight truncate hidden sm:block">
            Spatial Cyber Threat Reconstruction & Autonomous Defense
          </p>
        </div>
      </div>

      {/* Center Status Indicators */}
      <div className="hidden lg:flex items-center gap-3 min-w-0">
        {/* Threat Score Pill */}
        <div className={`flex items-center gap-2 px-3 py-1 rounded-lg border font-mono text-xs shrink-0 ${severityColor}`}>
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>THREAT RISK:</span>
          <span className="font-bold text-sm">{threatScore}/100</span>
          <span className="uppercase text-[10px] tracking-wider font-semibold">({severity})</span>
        </div>

        {/* SQLite Database Live Persistence Indicator */}
        <div
          title={`SQLite WAL Database: ${dbStats?.total_records || 0} records stored (${dbStats?.size_formatted || '0 KB'})`}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 shrink-0"
        >
          <Database className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="text-slate-400">SQLITE:</span>
          <span className="text-emerald-400 font-bold">ONLINE</span>
          <span className="text-[10px] text-slate-500 font-mono">({dbStats?.total_records || 0} rows)</span>
        </div>

        {/* Active Scenario Indicator */}
        {state?.system_status.active_scenario && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-mono min-w-0">
            <Zap className="w-3.5 h-3.5 text-cyan-400 animate-bounce shrink-0" />
            <span className="text-slate-400 shrink-0">SCENARIO:</span>
            <span className="font-semibold uppercase truncate max-w-[140px]" title={state.system_status.active_scenario.replace('_', ' ')}>
              {state.system_status.active_scenario.replace('_', ' ')}
            </span>
          </div>
        )}
      </div>

      {/* Right Controls & Analyst State */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0">
        {/* Analyst Availability Dropdown */}
        <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 rounded-lg px-2.5 py-1 min-w-0">
          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-xs text-slate-400 font-mono hidden sm:inline shrink-0">ANALYST:</span>
          <select
            value={availability}
            onChange={(e) => setAnalystAvailability(e.target.value as any)}
            className="bg-transparent text-xs font-mono font-semibold text-white focus:outline-none cursor-pointer max-w-[130px] sm:max-w-none truncate"
          >
            <option value="AVAILABLE" className="bg-slate-900 text-emerald-400">AVAILABLE (Human-in-Loop)</option>
            <option value="BUSY" className="bg-slate-900 text-amber-400">BUSY (Delayed Response)</option>
            <option value="AWAY" className="bg-slate-900 text-orange-400">AWAY (Auto-Escalation)</option>
            <option value="OFFLINE" className="bg-slate-900 text-rose-400">OFFLINE (Auto-Containment)</option>
          </select>
          <span className={`w-2 h-2 rounded-full shrink-0 ${availabilityColor}`}></span>
        </div>

        {/* Attack Siren / Buzzer Alarm Controller */}
        {sirenState === "PLAYING" ? (
          <button
            onClick={silenceSiren}
            title="Silence Siren Audio (Keeps Alert Active)"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white border border-rose-400 text-xs font-mono font-bold transition-all shrink-0 shadow-[0_0_20px_rgba(244,63,94,0.6)] animate-pulse"
          >
            <VolumeX className="w-4 h-4 text-white shrink-0 animate-spin" />
            <span>🔇 SIREN OFF</span>
          </button>
        ) : sirenState === "SILENCED" ? (
          <button
            onClick={playSiren}
            title="Siren is Silenced. Click to test/replay siren."
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-950/90 hover:bg-amber-900 text-amber-300 border border-amber-500/60 text-xs font-mono font-bold transition-all shrink-0"
          >
            <VolumeX className="w-4 h-4 text-amber-400 shrink-0" />
            <span>SIREN SILENCED</span>
          </button>
        ) : (
          <button
            onClick={playSiren}
            title="Test 3-Pulse Cyber Attack Siren Sound"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-rose-900 via-rose-800 to-amber-900 hover:from-rose-800 hover:to-amber-800 text-rose-100 border border-rose-500/70 text-xs font-mono font-bold transition-all shrink-0 shadow-[0_0_15px_rgba(244,63,94,0.4)] hover:shadow-[0_0_20px_rgba(244,63,94,0.6)] hover:scale-105"
          >
            <Volume2 className="w-4 h-4 text-rose-300 shrink-0 animate-pulse" />
            <span>🚨 TEST SIREN</span>
          </button>
        )}


        {/* Quick Simulator Drawer Trigger */}
        <button
          onClick={onOpenSimulator}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-mono font-bold shadow-[0_0_12px_rgba(0,240,255,0.3)] transition-all shrink-0"
        >
          <Zap className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden md:inline">ATTACK SIMULATOR</span>
        </button>

        {/* Simulation Controls */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 shrink-0">
          <button
            onClick={togglePause}
            title={isPaused ? "Resume Simulation" : "Pause Simulation"}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
          >
            {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5 text-amber-400" />}
          </button>
          <button
            onClick={resetSimulation}
            title="Reset Simulation State"
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-cyan-400 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Live WS Status */}
        <div
          title={isConnected ? "WebSocket Live Connected" : "Connecting to Backend..."}
          className="flex items-center justify-center p-1.5 rounded-lg bg-slate-900 border border-slate-800 shrink-0"
        >
          {isConnected ? (
            <Wifi className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          ) : (
            <WifiOff className="w-3.5 h-3.5 text-rose-400 animate-bounce" />
          )}
        </div>
      </div>
    </header>
  );
};
