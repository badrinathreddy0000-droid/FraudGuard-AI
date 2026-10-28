import React, { useState } from "react";
import { 
  ScanLine, 
  AlertTriangle, 
  RotateCcw,
  Zap
} from "lucide-react";
import RiskDial from "../components/RiskDial";
import api from "../services/api";

export default function PredictPage() {
  const defaultForm = {
    TransactionAmt: 45.50,
    ProductCD: "W",
    card4: "visa",
    card6: "debit",
    P_emaildomain: "gmail.com",
    R_emaildomain: "",
    C1: 1.0,
    dist1: 12.0,
    addr1: 299.0,
    addr2: 87.0
  };

  const [form, setForm] = useState(defaultForm);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const scenarios = [
    {
      name: "Legitimate Retail Purchase",
      desc: "$45.50 • Visa Debit • Normal Cadence",
      data: {
        TransactionAmt: 45.50,
        ProductCD: "W",
        card4: "visa",
        card6: "debit",
        P_emaildomain: "gmail.com",
        R_emaildomain: "",
        C1: 1.0,
        dist1: 8.0,
        addr1: 299.0,
        addr2: 87.0
      }
    },
    {
      name: "Micro-Charge Bot Testing",
      desc: "$1.15 • Discover Credit • High Velocity C1=22",
      data: {
        TransactionAmt: 1.15,
        ProductCD: "C",
        card4: "discover",
        card6: "credit",
        P_emaildomain: "tempmail.com",
        R_emaildomain: "",
        C1: 22.0,
        dist1: 0.0,
        addr1: 299.0,
        addr2: 87.0
      }
    },
    {
      name: "High-Value Account Takeover",
      desc: "$4,850.00 • Mastercard • Anonymous Mail • Dist=1450mi",
      data: {
        TransactionAmt: 4850.00,
        ProductCD: "C",
        card4: "mastercard",
        card6: "credit",
        P_emaildomain: "protonmail.com",
        R_emaildomain: "mail.com",
        C1: 14.0,
        dist1: 1450.0,
        addr1: 126.0,
        addr2: 87.0
      }
    },
    {
      name: "Suspicious Velocity Burst",
      desc: "$620.00 • Visa Credit • C1=6 • Above Average",
      data: {
        TransactionAmt: 620.00,
        ProductCD: "W",
        card4: "visa",
        card6: "credit",
        P_emaildomain: "yahoo.com",
        R_emaildomain: "",
        C1: 6.0,
        dist1: 180.0,
        addr1: 299.0,
        addr2: 87.0
      }
    }
  ];

  const handleScore = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const res = await api.predictSingle(form);
      setResult(res.data);
    } catch (err) {
      alert("Scoring failed: " + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Preset Scenarios Header */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="h-4 w-4 text-amber-400" />
          <h3 className="text-sm font-bold text-white tracking-tight">Load Pre-Configured IEEE-CIS Fraud Scenarios</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {scenarios.map((sc, idx) => (
            <button
              key={idx}
              onClick={() => { setForm(sc.data); setResult(null); }}
              className="text-left p-3 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/40 transition group"
            >
              <div className="font-semibold text-xs text-slate-200 group-hover:text-blue-400 transition">{sc.name}</div>
              <div className="text-[11px] text-slate-400 mt-1">{sc.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Form Panel */}
        <div className="lg:col-span-7 bg-[#111827] border border-slate-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Transaction Telemetry Input</h3>
              <p className="text-xs text-slate-400">Configure key IEEE-CIS features for model evaluation</p>
            </div>
            <button
              onClick={() => { setForm(defaultForm); setResult(null); }}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 px-2 py-1 rounded bg-slate-800"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </button>
          </div>

          <form onSubmit={handleScore} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Transaction Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.TransactionAmt}
                  onChange={(e) => setForm({ ...form, TransactionAmt: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm font-mono text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Product Code (ProductCD)</label>
                <select
                  value={form.ProductCD}
                  onChange={(e) => setForm({ ...form, ProductCD: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="W">W - Standard E-Commerce</option>
                  <option value="C">C - Commercial / Crypto</option>
                  <option value="R">R - Recurring / Digital</option>
                  <option value="H">H - High-Risk Merchandise</option>
                  <option value="S">S - Services</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Card Brand (card4)</label>
                <select
                  value={form.card4}
                  onChange={(e) => setForm({ ...form, card4: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-blue-500 capitalize"
                >
                  <option value="visa">Visa</option>
                  <option value="mastercard">Mastercard</option>
                  <option value="discover">Discover</option>
                  <option value="american express">American Express</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Card Type (card6)</label>
                <select
                  value={form.card6}
                  onChange={(e) => setForm({ ...form, card6: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-blue-500 capitalize"
                >
                  <option value="debit">Debit</option>
                  <option value="credit">Credit</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Purchaser Email Domain</label>
                <input
                  type="text"
                  value={form.P_emaildomain}
                  onChange={(e) => setForm({ ...form, P_emaildomain: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  placeholder="gmail.com, protonmail.com..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Recipient Email Domain</label>
                <input
                  type="text"
                  value={form.R_emaildomain}
                  onChange={(e) => setForm({ ...form, R_emaildomain: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  placeholder="Optional recipient domain"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Linkage Velocity Count (C1)</label>
                <input
                  type="number"
                  value={form.C1}
                  onChange={(e) => setForm({ ...form, C1: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm font-mono text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Billing Distance (dist1 miles)</label>
                <input
                  type="number"
                  value={form.dist1}
                  onChange={(e) => setForm({ ...form, dist1: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm font-mono text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition"
            >
              {loading ? (
                <span>Executing LightGBM Inference...</span>
              ) : (
                <>
                  <ScanLine className="h-4 w-4" />
                  <span>Execute Real-Time Fraud Assessment</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Live Evaluation Result Panel */}
        <div className="lg:col-span-5 bg-[#111827] border border-slate-800 rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white tracking-tight">Detection Verdict</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                {result ? result.model_used : "Awaiting Transaction"}
              </span>
            </div>

            {result ? (
              <div className="space-y-6">
                {/* Risk Dial */}
                <div className="py-2">
                  <RiskDial score={result.risk_score} size={170} />
                </div>

                {/* Verdict Decision Banner */}
                <div className={`p-4 rounded-xl border text-center ${
                  result.decision === "BLOCK" ? "bg-rose-500/10 border-rose-500/30 text-rose-300" :
                  result.decision === "REVIEW" ? "bg-amber-500/10 border-amber-500/30 text-amber-300" :
                  "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                }`}>
                  <span className="text-[10px] font-bold uppercase tracking-wider block">Decision Protocol</span>
                  <span className="text-xl font-black tracking-tight">{result.decision}</span>
                </div>

                {/* Rules Triggered */}
                {result.rules_triggered.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Heuristics Triggered:</span>
                    {result.rules_triggered.map((r, i) => (
                      <div key={i} className="text-xs bg-rose-500/15 border border-rose-500/20 text-rose-300 px-3 py-1.5 rounded-lg flex items-center gap-2">
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-rose-400" />
                        <span>{r}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Top Contributing Factors */}
                {result.top_risk_factors.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Key Risk Drivers:</span>
                    {result.top_risk_factors.map((f, i) => (
                      <div key={i} className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 flex items-start gap-2.5">
                        <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded mt-0.5 ${
                          f.impact === "positive" ? "bg-rose-500/20 text-rose-400" : "bg-emerald-500/20 text-emerald-400"
                        }`}>
                          {f.score_contribution}
                        </span>
                        <div className="text-xs text-slate-300 flex-1">{f.description}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-3">
                <ScanLine className="h-10 w-10 text-slate-700 animate-pulse" />
                <p className="text-xs">Adjust inputs or select a preset scenario on the left, then click Execute to score.</p>
              </div>
            )}
          </div>

          {result && (
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span>ID: {result.transaction_id}</span>
              <span>Latency: 12ms</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
