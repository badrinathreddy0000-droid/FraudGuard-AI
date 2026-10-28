import React from "react";
import { 
  ShieldCheck, 
  LayoutDashboard, 
  ScanLine, 
  FileSpreadsheet, 
  FlaskConical, 
  History, 
  Sliders, 
  Server,
  User,
  ExternalLink
} from "lucide-react";

export default function Sidebar({ activeTab, setActiveTab, currentUser, systemOnline }) {
  const navItems = [
    { id: "dashboard", label: "Executive Dashboard", icon: LayoutDashboard },
    { id: "predict", label: "Live Inspector", icon: ScanLine },
    { id: "batch", label: "Batch Evaluation", icon: FileSpreadsheet },
    { id: "lab", label: "Model Research Lab", icon: FlaskConical, badge: "IEEE-CIS" },
    { id: "transactions", label: "Investigation Console", icon: History },
    { id: "rules", label: "Rules & Thresholds", icon: Sliders },
    { id: "system", label: "System & Datasets", icon: Server },
  ];

  return (
    <aside className="w-64 bg-[#0e1424] border-r border-slate-800 flex flex-col justify-between shrink-0 select-none">
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 gap-3 border-b border-slate-800">
          <div className="h-9 w-9 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
              FraudGuard <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">AI</span>
            </h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">IEEE-CIS Engine</p>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-sm shadow-blue-500/5"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4 w-4 ${isActive ? "text-blue-400" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-300 border border-purple-500/30 font-semibold uppercase">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer User Info & Status */}
      <div className="p-4 border-t border-slate-800 space-y-3">
        <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${systemOnline ? "bg-emerald-400 animate-pulse" : "bg-rose-500"}`}></span>
              Backend API
            </span>
            <span className="text-[10px] font-mono text-slate-400">{systemOnline ? "v1.0.0 Online" : "Offline"}</span>
          </div>
          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800">
            <span>Role: <strong className="text-slate-200 capitalize">{currentUser?.role || "analyst"}</strong></span>
            <span className="text-[10px] text-blue-400 font-mono">IEEE-CIS</span>
          </div>
        </div>

        <div className="flex items-center justify-between px-1 text-[11px] text-slate-400">
          <span>Desktop/FraudGuard-AI</span>
          <span className="text-slate-400 hover:text-slate-200">Docs v1</span>
        </div>
      </div>
    </aside>
  );
}
