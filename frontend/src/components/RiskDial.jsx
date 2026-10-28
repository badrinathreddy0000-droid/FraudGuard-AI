import React from "react";

export default function RiskDial({ score = 0, size = 160 }) {
  // score is 0.0 to 1.0
  const percentage = Math.round(score * 100);
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score * circumference);

  let color = "#10b981"; // Low (emerald)
  let label = "LOW RISK";
  let labelColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";

  if (score >= 0.90) {
    color = "#ef4444"; // Critical (red)
    label = "CRITICAL RISK";
    labelColor = "text-red-400 bg-red-500/10 border-red-500/30";
  } else if (score >= 0.70) {
    color = "#f97316"; // High (orange)
    label = "HIGH RISK";
    labelColor = "text-orange-400 bg-orange-500/10 border-orange-500/30";
  } else if (score >= 0.35) {
    color = "#f59e0b"; // Medium (amber)
    label = "ELEVATED RISK";
    labelColor = "text-amber-400 bg-amber-500/10 border-amber-500/30";
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#1e293b"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Animated Value Arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-extrabold text-white tracking-tight">{percentage}%</span>
          <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">Fraud Score</span>
        </div>
      </div>

      <div className={`mt-3 px-2.5 py-1 rounded-full text-xs font-bold border ${labelColor}`}>
        {label}
      </div>
    </div>
  );
}
