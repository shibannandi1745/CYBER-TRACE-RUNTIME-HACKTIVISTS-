import React from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: string;
  variant?: "cyan" | "emerald" | "amber" | "crimson" | "purple";
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  variant = "cyan",
  onClick,
}) => {
  const variantStyles = {
    cyan: {
      border: "border-cyan-500/20 hover:border-cyan-500/50",
      iconBg: "bg-cyan-950/60 text-cyan-400 border-cyan-500/30",
      glow: "hover:shadow-[0_0_20px_-5px_rgba(0,240,255,0.2)]",
      valColor: "text-cyan-300",
    },
    emerald: {
      border: "border-emerald-500/20 hover:border-emerald-500/50",
      iconBg: "bg-emerald-950/60 text-emerald-400 border-emerald-500/30",
      glow: "hover:shadow-[0_0_20px_-5px_rgba(16,185,129,0.2)]",
      valColor: "text-emerald-300",
    },
    amber: {
      border: "border-amber-500/20 hover:border-amber-500/50",
      iconBg: "bg-amber-950/60 text-amber-400 border-amber-500/30",
      glow: "hover:shadow-[0_0_20px_-5px_rgba(245,158,11,0.2)]",
      valColor: "text-amber-300",
    },
    crimson: {
      border: "border-rose-500/20 hover:border-rose-500/50",
      iconBg: "bg-rose-950/60 text-rose-400 border-rose-500/30",
      glow: "hover:shadow-[0_0_20px_-5px_rgba(244,63,94,0.25)]",
      valColor: "text-rose-400 font-bold",
    },
    purple: {
      border: "border-purple-500/20 hover:border-purple-500/50",
      iconBg: "bg-purple-950/60 text-purple-400 border-purple-500/30",
      glow: "hover:shadow-[0_0_20px_-5px_rgba(168,85,247,0.2)]",
      valColor: "text-purple-300",
    },
  }[variant];

  return (
    <div
      onClick={onClick}
      className={`cyber-card p-4 transition-all duration-300 border ${variantStyles.border} ${variantStyles.glow} ${
        onClick ? "cursor-pointer" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-slate-400 font-mono font-medium">{title}</span>
        <div className={`p-2 rounded-lg border ${variantStyles.iconBg}`}>{icon}</div>
      </div>
      <div className="mt-2 flex items-baseline justify-between">
        <span className={`text-2xl font-bold font-mono ${variantStyles.valColor}`}>{value}</span>
        {trend && <span className="text-xs font-mono text-slate-400">{trend}</span>}
      </div>
      {subtitle && <p className="mt-1 text-xs text-slate-400 font-sans truncate">{subtitle}</p>}
    </div>
  );
};
