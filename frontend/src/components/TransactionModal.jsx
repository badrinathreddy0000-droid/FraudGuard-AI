import React, { useState } from "react";
import { X, CheckCircle, AlertTriangle, XCircle, ShieldAlert, Clock, ArrowRight } from "lucide-react";

export default function TransactionModal({ transaction, onClose, onTriageUpdate }) {
  if (!transaction) return null;

  const [notes, setNotes] = useState(transaction.analyst_notes || "");
  const [submitting, setSubmitting] = useState(false);

  const handleAction = async (status) => {
    setSubmitting(true);
    try {
      await onTriageUpdate(transaction.transaction_id || transaction.id, status, notes);
      onClose();
    } catch (e) {
      alert("Error updating status: " + e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getBadge = (decision) => {
    if (decision === "BLOCK") return <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">BLOCK (AUTO-REJECT)</span>;
    if (decision === "REVIEW") return <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">MANUAL REVIEW QUEUE</span>;
    return <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">ALLOW (LOW RISK)</span>;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#111827] border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{transaction.transaction_id}</h3>
              <p className="text-xs text-slate-400">Created: {new Date(transaction.created_at).toLocaleString()}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Top Score Banner */}
          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 uppercase font-semibold">Decision Verdict</p>
              <div className="mt-1.5">{getBadge(transaction.decision)}</div>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400 uppercase font-semibold">Risk Probability</p>
              <p className="text-2xl font-black text-white mt-1">{(transaction.risk_score * 100).toFixed(1)}%</p>
            </div>
          </div>

          {/* Key Features Grid */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">Transaction Attributes</h4>
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-900/50 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 block">Amount</span>
                <strong className="text-white text-sm font-bold">${Number(transaction.amount).toFixed(2)}</strong>
              </div>
              <div className="bg-slate-900/50 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 block">Product Code</span>
                <strong className="text-white text-sm font-semibold">{transaction.product_cd}</strong>
              </div>
              <div className="bg-slate-900/50 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 block">Card Type</span>
                <strong className="text-white text-sm font-semibold capitalize">{transaction.card4} ({transaction.card6})</strong>
              </div>
              <div className="bg-slate-900/50 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 block">Email Domain</span>
                <strong className="text-white text-sm font-semibold truncate block">{transaction.p_email}</strong>
              </div>
              <div className="bg-slate-900/50 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 block">Velocity (C1)</span>
                <strong className="text-white text-sm font-semibold">{transaction.c1}</strong>
              </div>
              <div className="bg-slate-900/50 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 block">Geo Distance (dist1)</span>
                <strong className="text-white text-sm font-semibold">{transaction.dist1 || 0} mi</strong>
              </div>
            </div>
          </div>

          {/* Top Risk Explanations */}
          {transaction.top_risk_factors && transaction.top_risk_factors.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">Model Feature Attribution (Explainability)</h4>
              <div className="space-y-2">
                {transaction.top_risk_factors.map((factor, idx) => (
                  <div key={idx} className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 flex items-start gap-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded mt-0.5 ${
                      factor.impact === "positive" ? "bg-rose-500/15 text-rose-400 border border-rose-500/30" : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                    }`}>
                      {factor.impact === "positive" ? "RISK DRIVER" : "SAFE DRIVER"}
                    </span>
                    <div className="flex-1 text-xs">
                      <div className="font-semibold text-slate-200">{factor.feature}</div>
                      <div className="text-slate-400 mt-0.5">{factor.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rules Triggered */}
          {transaction.rules_triggered && transaction.rules_triggered.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">Heuristic Security Rules Triggered</h4>
              <div className="space-y-1.5">
                {transaction.rules_triggered.map((rule, idx) => (
                  <div key={idx} className="bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-lg text-xs text-rose-300 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
                    <span>{rule}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Analyst Notes Input */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">Investigation Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add investigator observations, cardholder contact notes, or merchant confirmation..."
              rows={2}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Footer Triage Action Buttons */}
        <div className="p-4 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            Current Status: <strong className="text-slate-200">{transaction.analyst_status || "PENDING"}</strong>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleAction("DISMISSED")}
              disabled={submitting}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700"
            >
              Dismiss Alert
            </button>
            <button
              onClick={() => handleAction("FALSE_POSITIVE")}
              disabled={submitting}
              className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-semibold border border-emerald-500/40"
            >
              Mark False Positive
            </button>
            <button
              onClick={() => handleAction("CONFIRMED_FRAUD")}
              disabled={submitting}
              className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-900/40"
            >
              Confirm Fraud & Block
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
