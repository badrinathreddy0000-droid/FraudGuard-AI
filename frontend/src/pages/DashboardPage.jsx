import React, { useState, useEffect } from "react";
import { 
  ShieldAlert, 
  DollarSign, 
  Activity, 
  AlertCircle, 
  Eye,
  ExternalLink
} from "lucide-react";
import StatCard from "../components/StatCard";
import TransactionModal from "../components/TransactionModal";
import api from "../services/api";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  CartesianGrid, 
  Cell 
} from "recharts";

export default function DashboardPage({ setActiveTab }) {
  const [kpis, setKpis] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [recentTxs, setRecentTxs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTx, setSelectedTx] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [kpiRes, timeRes, txRes] = await Promise.all([
        api.getKPIs(),
        api.getTimeline(),
        api.getTransactions({ limit: 8 })
      ]);
      setKpis(kpiRes.data);
      setTimeline(timeRes.data);
      setRecentTxs(txRes.data.items);
    } catch (e) {
      console.error("Dashboard fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const riskDistData = kpis?.risk_distribution ? [
    { name: "Low (<35%)", count: kpis.risk_distribution.low, color: "#10b981" },
    { name: "Medium (35-70%)", count: kpis.risk_distribution.medium, color: "#f59e0b" },
    { name: "High (70-90%)", count: kpis.risk_distribution.high, color: "#f97316" },
    { name: "Critical (>=90%)", count: kpis.risk_distribution.critical, color: "#ef4444" }
  ] : [];

  const handleTriageUpdate = async (id, status, notes) => {
    await api.updateTriage(id, status, notes);
    fetchData();
  };

  return (
    <div className="space-y-6">
      {/* 4 Top KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Scanned Volume"
          value={kpis ? `${kpis.total_scanned}` : "..."}
          subtitle={`Total: $${(kpis?.total_volume || 0).toLocaleString()}`}
          icon={Activity}
          color="blue"
          badge="Live Feed"
        />
        <StatCard
          title="Fraud Detection Rate"
          value={kpis ? `${kpis.fraud_rate}%` : "..."}
          subtitle="Baseline IEEE: 3.50%"
          icon={ShieldAlert}
          color="rose"
          badge="Calibrated"
        />
        <StatCard
          title="Losses Prevented"
          value={kpis ? `$${(kpis.amount_saved).toLocaleString()}` : "..."}
          subtitle={`${kpis?.blocked_count || 0} Auto-Blocked`}
          icon={DollarSign}
          color="emerald"
          badge="ROI Safe"
        />
        <StatCard
          title="Triage Queue"
          value={kpis ? `${kpis.review_count}` : "..."}
          subtitle="Needs Investigation"
          icon={AlertCircle}
          color="amber"
          badge="Actionable"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline Area Chart */}
        <div className="lg:col-span-2 bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Real-Time Risk Profile Stream</h3>
              <p className="text-xs text-slate-400">Transaction velocity and evaluated fraud probability over time</p>
            </div>
            <span className="text-[11px] text-blue-400 font-mono bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20">
              Live Telemetry
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px", fontSize: "12px" }}
                  formatter={(val) => [`${Number(val).toFixed(1)}%`, "Risk Score"]}
                />
                <Area type="monotone" dataKey="risk_score" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#riskGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Distribution Bar Chart */}
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-white tracking-tight">Risk Distribution</h3>
            <p className="text-xs text-slate-400">Transactions grouped by model risk tier</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskDistData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 10 }} interval={0} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px", fontSize: "12px" }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {riskDistData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Alerts Feed Table */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Recent Scanned Transactions</h3>
            <p className="text-xs text-slate-400">Live feed of transactions evaluated against LightGBM and rules</p>
          </div>
          <button
            onClick={() => setActiveTab("transactions")}
            className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
          >
            <span>Open Investigation Console</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Transaction ID</th>
                <th className="py-2.5 px-3">Amount</th>
                <th className="py-2.5 px-3">Card / Email</th>
                <th className="py-2.5 px-3">Risk Score</th>
                <th className="py-2.5 px-3">Decision</th>
                <th className="py-2.5 px-3">Analyst Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {recentTxs.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-800/30 transition">
                  <td className="py-3 px-3 font-mono font-medium text-white">{tx.transaction_id}</td>
                  <td className="py-3 px-3 font-semibold text-slate-200">${Number(tx.amount).toFixed(2)}</td>
                  <td className="py-3 px-3 text-slate-400">
                    <span className="capitalize text-slate-300 font-medium">{tx.card4}</span> • {tx.p_email}
                  </td>
                  <td className="py-3 px-3 font-mono font-bold">
                    <span className={
                      tx.risk_score >= 0.70 ? "text-rose-400" :
                      tx.risk_score >= 0.35 ? "text-amber-400" : "text-emerald-400"
                    }>
                      {(tx.risk_score * 100).toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      tx.decision === "BLOCK" ? "bg-rose-500/15 text-rose-400 border border-rose-500/30" :
                      tx.decision === "REVIEW" ? "bg-amber-500/15 text-amber-400 border border-amber-500/30" :
                      "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                    }`}>
                      {tx.decision}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-[11px] font-medium text-slate-400">{tx.analyst_status}</span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => setSelectedTx(tx)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                      title="Inspect Transaction"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Inspector */}
      {selectedTx && (
        <TransactionModal
          transaction={selectedTx}
          onClose={() => setSelectedTx(null)}
          onTriageUpdate={handleTriageUpdate}
        />
      )}
    </div>
  );
}
