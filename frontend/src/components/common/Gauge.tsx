import React from "react";

interface ThreatGaugeProps {
  score: number;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  size?: number;
}

export const ThreatGauge: React.FC<ThreatGaugeProps> = ({ score, severity, size = 120 }) => {
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const colorMap = {
    LOW: { stroke: "#10b981", text: "text-emerald-400", glow: "rgba(16, 185, 129, 0.4)" },
    MEDIUM: { stroke: "#f59e0b", text: "text-amber-400", glow: "rgba(245, 158, 11, 0.4)" },
    HIGH: { stroke: "#f97316", text: "text-orange-400", glow: "rgba(249, 115, 22, 0.5)" },
    CRITICAL: { stroke: "#f43f5e", text: "text-rose-400", glow: "rgba(244, 63, 94, 0.6)" },
  }[severity] || { stroke: "#00f0ff", text: "text-cyan-400", glow: "rgba(0, 240, 255, 0.4)" };

  return (
    <div className="relative flex flex-col items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#1e293b"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Value bar */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colorMap.stroke}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          style={{
            transition: "stroke-dashoffset 0.6s ease-in-out, stroke 0.4s ease",
            filter: `drop-shadow(0 0 8px ${colorMap.glow})`,
          }}
        />
      </svg>
      {/* Center Value */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
        <span className={`font-mono font-extrabold text-2xl leading-none ${colorMap.text}`}>
          {score}
        </span>
        <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 mt-0.5">/100</span>
        <span className={`text-[9px] font-bold font-mono tracking-wider uppercase mt-0.5 ${colorMap.text}`}>
          {severity}
        </span>
      </div>
    </div>
  );
};
