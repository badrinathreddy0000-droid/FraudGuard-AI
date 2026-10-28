import React from "react";

export default function StatCard({ title, value, subtitle, icon: Icon, color = "blue", badge }) {
  const colorMap = {
    blue: "bg-blue-500/10 border-blue-500/20 text-blue-400",
    emerald: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    amber: "bg-amber-500/10 border-amber-500/20 text-amber-400",
    rose: "bg-rose-500/10 border-rose-500/20 text-rose-400",
    purple: "bg-purple-500/10 border-purple-500/20 text-purple-400"
  };

  return (
    <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-bold text-white mt-1 tracking-tight">{value}</h3>
        </div>
        <div className={`p-2.5 rounded-lg border ${colorMap[color] || colorMap.blue}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between text-xs">
        <span className="text-slate-400">{subtitle}</span>
        {badge && (
          <span className="font-semibold text-slate-300 bg-slate-800 px-2 py-0.5 rounded text-[11px]">
            {badge}
          </span>
        )}
      </div>
    </div>
  );
}
