import React from "react";

interface BadgeProps {
  label: string;
  variant?: "normal" | "suspicious" | "high_risk" | "compromised" | "quarantined" | "protected" | "info" | "cyan";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
}

const VARIANT_MAP: Record<string, string> = {
  normal: "bg-emerald-950/70 text-emerald-400 border border-emerald-700/50",
  suspicious: "bg-amber-950/70 text-amber-400 border border-amber-600/50 animate-pulse",
  high_risk: "bg-orange-950/70 text-orange-400 border border-orange-600/50",
  compromised: "bg-rose-950/80 text-rose-400 border border-rose-600/60 font-bold",
  quarantined: "bg-purple-950/80 text-purple-300 border border-purple-600/60",
  protected: "bg-blue-950/80 text-blue-400 border border-blue-600/60",
  info: "bg-slate-800/80 text-slate-300 border border-slate-700",
  cyan: "bg-cyan-950/80 text-cyan-400 border border-cyan-500/50",
};

export const Badge: React.FC<BadgeProps> = ({ label, variant = "info", size = "sm", icon }) => {
  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-sm font-medium",
    lg: "px-3 py-1.5 text-base font-semibold",
  }[size];

  const variantClass = VARIANT_MAP[variant.toLowerCase()] || VARIANT_MAP.info;

  return (
    <span className={`inline-flex items-center gap-1.5 max-w-full shrink-0 rounded-full uppercase tracking-wider font-mono ${sizeClasses} ${variantClass}`}>
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span className="truncate">{label}</span>
    </span>
  );
};
