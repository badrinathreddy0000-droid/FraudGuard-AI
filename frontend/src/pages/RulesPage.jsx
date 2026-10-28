import React, { useState, useEffect } from "react";
import { 
  Sliders, 
  Plus, 
  Trash2, 
  Check, 
  AlertTriangle, 
  ShieldAlert,
  Save
} from "lucide-react";
import api from "../services/api";

export default function RulesPage() {
  const [rules, setRules] = useState([]);
  const [allowThreshold, setAllowThreshold] = useState(0.35);
  const [reviewThreshold, setReviewThreshold] = useState(0.70);
  const [savingThresholds, setSavingThresholds] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Rule Form
  const [newRule, setNewRule] = useState({
    name: "",
    description: "",
    field: "amount",
    operator: ">",
    threshold_value: "1000.0",
    action: "REVIEW"
  });

  const loadData = async () => {
    try {
      const [rulesRes, threshRes] = await Promise.all([
        api.getRules(),
        api.getThresholds()
      ]);
      setRules(rulesRes.data);
      setAllowThreshold(threshRes.data.allow_threshold);
      setReviewThreshold(threshRes.data.review_threshold);
    } catch (e) {
      console.error("Error loading rules:", e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleRule = async (id) => {
    await api.toggleRule(id);
    loadData();
  };

  const handleDeleteRule = async (id) => {
    if (!confirm("Are you sure you want to delete this rule?")) return;
    await api.deleteRule(id);
    loadData();
  };

  const handleSaveThresholds = async () => {
    setSavingThresholds(true);
    try {
      await api.updateThresholds(allowThreshold, reviewThreshold);
      alert("Risk thresholds updated successfully!");
    } catch (e) {
      alert("Error saving thresholds: " + e.message);
    } finally {
      setSavingThresholds(false);
    }
  };

  const handleCreateRule = async (e) => {
    e.preventDefault();
    try {
      await api.createRule(newRule);
      setShowAddModal(false);
      setNewRule({
        name: "",
        description: "",
        field: "amount",
        operator: ">",
        threshold_value: "1000.0",
        action: "REVIEW"
      });
      loadData();
    } catch (e) {
      alert("Failed to create rule: " + (e.response?.data?.detail || e.message));
    }
  };

  return (
    <div className="space-y-6">
      {/* Threshold Configuration Card */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Dynamic Risk Scoring Thresholds</h3>
            <p className="text-xs text-slate-400">Calibrate the trade-off between customer friction and fraud risk mitigation</p>
          </div>
          <button
            onClick={handleSaveThresholds}
            disabled={savingThresholds}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-sm"
          >
            <Save className="h-3.5 w-3.5" />
            <span>{savingThresholds ? "Saving..." : "Save Thresholds"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Allow Threshold */}
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-400 uppercase">Allow Threshold (Auto-Pass)</span>
              <span className="text-base font-mono font-bold text-white">{(allowThreshold * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.60"
              step="0.01"
              value={allowThreshold}
              onChange={(e) => setAllowThreshold(parseFloat(e.target.value))}
              className="w-full accent-emerald-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-slate-400 mt-2">
              Scores below {(allowThreshold * 100).toFixed(0)}% are deemed safe and automatically approved without analyst overhead.
            </p>
          </div>

          {/* Block Threshold */}
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-rose-400 uppercase">Block Threshold (Auto-Reject)</span>
              <span className="text-base font-mono font-bold text-white">{(reviewThreshold * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0.50"
              max="0.95"
              step="0.01"
              value={reviewThreshold}
              onChange={(e) => setReviewThreshold(parseFloat(e.target.value))}
              className="w-full accent-rose-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-slate-400 mt-2">
              Scores between {(allowThreshold * 100).toFixed(0)}% and {(reviewThreshold * 100).toFixed(0)}% enter the manual review queue; scores above {(reviewThreshold * 100).toFixed(0)}% are blocked.
            </p>
          </div>
        </div>
      </div>

      {/* Rules Engine Table */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Active Heuristic Security Rules</h3>
            <p className="text-xs text-slate-400">Deterministic rule overrides that execute alongside ML LightGBM inference</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 text-xs font-bold border border-slate-700 transition"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Custom Rule</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] bg-slate-900/60">
                <th className="py-3 px-4">Rule Name</th>
                <th className="py-3 px-4">Trigger Condition</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {rules.map((rule) => (
                <tr key={rule.id} className="hover:bg-slate-800/30 transition">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-white">{rule.name}</div>
                    <div className="text-[11px] text-slate-400">{rule.description}</div>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-300">
                    <span className="text-blue-400">{rule.field}</span> {rule.operator} <span className="text-white font-bold">{rule.threshold_value}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      rule.action === "BLOCK" ? "bg-rose-500/15 text-rose-400 border border-rose-500/30" :
                      rule.action === "REVIEW" ? "bg-amber-500/15 text-amber-400 border border-amber-500/30" :
                      "bg-blue-500/15 text-blue-400 border border-blue-500/30"
                    }`}>
                      {rule.action}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleToggleRule(rule.id)}
                      className={`px-2 py-1 rounded-full text-[10px] font-bold border transition ${
                        rule.is_active
                          ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                          : "bg-slate-800 text-slate-500 border-slate-700"
                      }`}
                    >
                      {rule.is_active ? "Enabled" : "Disabled"}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleDeleteRule(rule.id)}
                      className="p-1 rounded text-slate-500 hover:text-rose-400 transition"
                      title="Delete Rule"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Rule Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-white tracking-tight">Create Custom Fraud Rule</h3>

            <form onSubmit={handleCreateRule} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Rule Name</label>
                <input
                  type="text"
                  required
                  value={newRule.name}
                  onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                  placeholder="e.g. Disposable Domain Block"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Description</label>
                <input
                  type="text"
                  value={newRule.description}
                  onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                  placeholder="Explains what this rule does"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Field</label>
                  <select
                    value={newRule.field}
                    onChange={(e) => setNewRule({ ...newRule, field: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="amount">amount (TransactionAmt)</option>
                    <option value="c1">c1 (Velocity Count)</option>
                    <option value="dist1">dist1 (Distance)</option>
                    <option value="p_email">p_email (Email Domain)</option>
                    <option value="card4">card4 (Card Brand)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Operator</label>
                  <select
                    value={newRule.operator}
                    onChange={(e) => setNewRule({ ...newRule, operator: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500 font-mono"
                  >
                    <option value=">">&gt; Greater Than</option>
                    <option value="<">&lt; Less Than</option>
                    <option value="==">== Equals</option>
                    <option value="in">in (Comma List)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Threshold Value</label>
                <input
                  type="text"
                  required
                  value={newRule.threshold_value}
                  onChange={(e) => setNewRule({ ...newRule, threshold_value: e.target.value })}
                  placeholder="e.g. 5000.0 or tempmail.com,mail.com"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 font-mono text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Action Trigger</label>
                <select
                  value={newRule.action}
                  onChange={(e) => setNewRule({ ...newRule, action: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="REVIEW">REVIEW (Queue for Analyst)</option>
                  <option value="BLOCK">BLOCK (Immediate Rejection)</option>
                  <option value="ALERT">ALERT (Informational Only)</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md shadow-blue-600/30"
                >
                  Create Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
