import React from "react";
import { Shield, Sparkles, RefreshCw } from "lucide-react";

export default function Navbar({ title, subtitle, onRefresh, isRefreshing, activeModel }) {
  return (
    <header className="h-16 bg-[#0e1424]/80 backdrop-blur border-b border-slate-800 px-8 flex items-center justify-between shrink-0 z-10">
      <div>
        <h2 className="text-lg font-bold text-white tracking-tight">{title}</h2>
        <p className="text-xs text-slate-400">{subtitle}</p>
      </div>

      <div className="flex items-center gap-4">
        {/* Active Model Pill */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300">
          <Sparkles className="h-3.5 w-3.5 text-blue-400" />
          <span>Active: <strong className="text-white font-medium">{activeModel || "Class-weighted LightGBM"}</strong></span>
        </div>

        {/* Refresh Action */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-blue-400" : ""}`} />
            <span>Sync</span>
          </button>
        )}
      </div>
    </header>
  );
}
