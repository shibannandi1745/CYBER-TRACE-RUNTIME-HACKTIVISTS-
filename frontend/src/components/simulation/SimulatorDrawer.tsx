import React, { useState } from "react";
import { useSimulation } from "../../context/SimulationContext";
import { X, Play, RotateCcw, Zap, Flame, ShieldCheck, Activity, Sliders, Skull, Cpu, Radio, Volume2 } from "lucide-react";

interface SimulatorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SimulatorDrawer: React.FC<SimulatorDrawerProps> = ({ isOpen, onClose }) => {
  const { state, triggerScenario, resetSimulation, setSimSpeed, setImperfectionConfig, playSiren } = useSimulation();

  const [dupRate, setDupRate] = useState(5);
  const [delayRate, setDelayRate] = useState(10);
  const [dropRate, setDropRate] = useState(5);
  const [speed, setSpeed] = useState(1);

  if (!isOpen) return null;

  const scenarios = [
    {
      id: "coordinated_attack",
      title: "1. Full Multi-Floor Coordinated Cyber Attack",
      subtitle: "Brute force Floor 1 -> Pivot to Floor 3 Server Farm -> SQL Exfil -> File Destruction -> Floor 4 Door Lock Sabotage -> CCTV Telemetry Kill",
      icon: <Flame className="w-5 h-5 text-rose-400" />,
      tag: "FLAGSHIP HACKATHON DEMO",
      tagColor: "bg-rose-950 text-rose-300 border-rose-500/50",
    },
    {
      id: "ransomware_wave",
      title: "2. Ransomware & Mass File Encryption",
      subtitle: "Phishing payload on Workstation-201 rapidly encrypts shared storage files; triggers snapshot detection & automated rollback",
      icon: <Skull className="w-5 h-5 text-purple-400" />,
      tag: "DATA RESILIENCE",
      tagColor: "bg-purple-950 text-purple-300 border-purple-500/50",
    },
    {
      id: "ot_sabotage",
      title: "3. IoT & Physical Facilities OT Sabotage",
      subtitle: "Backdoored IoT Gateway compromises BMS Controller and manipulates Datacenter HVAC Chiller setpoints to induce thermal failure",
      icon: <Cpu className="w-5 h-5 text-amber-400" />,
      tag: "CYBER-PHYSICAL",
      tagColor: "bg-amber-950 text-amber-300 border-amber-500/50",
    },
    {
      id: "stealth_imperfect",
      title: "4. Stealth Probe under Heavy Telemetry Loss",
      subtitle: "Slow reconnaissance with intermittent dead switches; verifies AI confidence degradation without system failure",
      icon: <Radio className="w-5 h-5 text-cyan-400" />,
      tag: "TELEMETRY RESILIENCE",
      tagColor: "bg-cyan-950 text-cyan-300 border-cyan-500/50",
    },
  ];

  const handleApplyImperfections = () => {
    setImperfectionConfig(dupRate / 100, delayRate / 100, dropRate / 100);
  };

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
    setSimSpeed(newSpeed);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md max-w-[calc(100vw-1rem)] bg-slate-950 border-l border-cyan-500/30 h-full flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <Zap className="w-5 h-5 text-cyan-400 animate-pulse shrink-0" />
            <div className="min-w-0">
              <h2 className="text-base font-bold font-mono text-cyan-400 truncate">ATTACK SCENARIO SIMULATOR</h2>
              <p className="text-[11px] text-slate-400 truncate">Real-time telemetry injection & stress testing</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Explicit Attack Siren / Buzzer Control HUD Card */}
          <div className="cyber-card p-4 border-rose-500/50 bg-rose-950/40 shadow-[0_0_15px_rgba(244,63,94,0.2)] flex items-center justify-between gap-3 min-w-0">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="p-2 rounded-lg bg-rose-900/80 border border-rose-500/50 shrink-0">
                <Volume2 className="w-5 h-5 text-rose-300 animate-pulse" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold font-mono text-rose-200 truncate">ATTACK SIREN / BUZZER ALARM</div>
                <div className="text-[10px] text-slate-300 truncate">Auto-sounds 3 pulses when threat is detected</div>
              </div>
            </div>
            <button
              onClick={() => {
                playSiren();
              }}
              className="px-3 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold border border-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.4)] transition-all flex items-center gap-1.5 shrink-0"
            >
              <Volume2 className="w-3.5 h-3.5 shrink-0" />
              <span>TEST BUZZER</span>
            </button>
          </div>

          {/* Preset Attack Scenarios */}
          <div>
            <label className="text-xs uppercase font-mono tracking-wider text-slate-400 block mb-3">
              PRESET DEMO SCENARIOS
            </label>
            <div className="space-y-3">
              {scenarios.map((sc) => (
                <div
                  key={sc.id}
                  className="cyber-card p-3.5 border-slate-800 hover:border-cyan-500/40 transition-all group min-w-0"
                >
                  <div className="flex items-start justify-between gap-2 min-w-0">
                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 shrink-0">
                        {sc.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold font-mono text-white group-hover:text-cyan-300 transition-colors break-words">
                          {sc.title}
                        </div>
                        <span className={`inline-block mt-1 px-1.5 py-0.2 text-[9px] font-mono rounded border shrink-0 ${sc.tagColor}`}>
                          {sc.tag}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2 leading-relaxed break-words">{sc.subtitle}</p>
                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={() => {
                        triggerScenario(sc.id);
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-cyan-600/30 hover:bg-cyan-500 text-cyan-200 hover:text-slate-950 font-mono text-xs font-bold border border-cyan-500/50 transition-all flex items-center gap-1.5 shrink-0"
                    >
                      <Play className="w-3.5 h-3.5 shrink-0" />
                      <span>LAUNCH SCENARIO</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>


          {/* Simulation Speed Knob */}
          <div className="cyber-card p-4 border-slate-800">
            <label className="text-xs uppercase font-mono tracking-wider text-slate-400 block mb-2">
              SIMULATION CLOCK VELOCITY
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[0.5, 1, 2, 5].map((s) => (
                <button
                  key={s}
                  onClick={() => handleSpeedChange(s)}
                  className={`py-1.5 rounded text-xs font-mono font-bold transition-all ${
                    speed === s
                      ? "bg-cyan-500 text-slate-950 shadow-[0_0_10px_rgba(0,240,255,0.4)]"
                      : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>

          {/* Telemetry Imperfection Controls */}
          <div className="cyber-card p-4 border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs uppercase font-mono tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                TELEMETRY IMPERFECTION NOISE
              </label>
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
                <span>Packet Drop / Missing Rate:</span>
                <span className="text-cyan-300 font-bold">{dropRate}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={dropRate}
                onChange={(e) => setDropRate(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
                <span>Latency Jitter / Delay Rate:</span>
                <span className="text-amber-300 font-bold">{delayRate}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="60"
                value={delayRate}
                onChange={(e) => setDelayRate(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
                <span>Duplicate Packet Rate:</span>
                <span className="text-purple-300 font-bold">{dupRate}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="40"
                value={dupRate}
                onChange={(e) => setDupRate(Number(e.target.value))}
                className="w-full accent-purple-400 cursor-pointer"
              />
            </div>

            <button
              onClick={handleApplyImperfections}
              className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 font-mono text-xs border border-cyan-500/30 transition-colors"
            >
              APPLY IMPERFECTION KNOBS
            </button>
          </div>

          {/* Reset Engine Button */}
          <button
            onClick={() => {
              resetSimulation();
              onClose();
            }}
            className="w-full py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-mono text-xs font-semibold border border-slate-700 transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4 text-cyan-400" />
            <span>RESET TO NORMAL BASELINE</span>
          </button>
        </div>
      </div>
    </div>
  );
};
