import React, { useState, useEffect } from "react";
import { 
  FlaskConical, 
  Check, 
  Award, 
  TrendingUp, 
  Info, 
  Sparkles,
  BarChart2,
  LineChart as LineChartIcon
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid, 
  Legend 
} from "recharts";
import api from "../services/api";

export default function ModelLabPage({ onActiveModelChange }) {
  const [benchmarks, setBenchmarks] = useState([]);
  const [curves, setCurves] = useState([]);
  const [activeModel, setActiveModel] = useState("Class-weighted LightGBM");
  const [evalType, setEvalType] = useState("Chronological 70/30");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [bmRes, curveRes, activeRes] = await Promise.all([
          api.getBenchmarks(),
          api.getPerformanceCurves(),
          api.getActiveModel()
        ]);
        setBenchmarks(bmRes.data);
        setCurves(curveRes.data);
        setActiveModel(activeRes.data.active_model);
      } catch (e) {
        console.error("Model lab fetch error:", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSelectModel = async (modelName) => {
    setUpdating(true);
    try {
      await api.setActiveModel(modelName);
      setActiveModel(modelName);
      if (onActiveModelChange) onActiveModelChange(modelName);
    } catch (e) {
      alert("Failed to activate model: " + e.message);
    } finally {
      setUpdating(false);
    }
  };

  const filteredBenchmarks = benchmarks.filter(b => b.evaluation_type === evalType);

  return (
    <div className="space-y-6">
      {/* Top Banner: Research Provenance */}
      <div className="bg-gradient-to-r from-blue-900/30 via-purple-900/20 to-slate-900 border border-blue-500/30 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase tracking-wider">
                Notebook Synced
              </span>
              <span className="text-xs text-slate-400 font-mono">IEEE_CIS_Fraud_Detection_Modeling.ipynb</span>
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">Class Imbalance Research & Model Comparison Lab</h3>
            <p className="text-xs text-slate-300 max-w-2xl mt-1">
              Comparative benchmark across 4 imbalance techniques evaluated on 590K transactions: Baseline, Class-Weighted, SMOTENC, and Random Undersampling.
            </p>
          </div>

          {/* Active Model Pill */}
          <div className="bg-slate-900/90 border border-slate-700/80 p-3 rounded-xl shrink-0">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Active Live Scoring Model</span>
            <span className="text-sm font-bold text-white flex items-center gap-2 mt-0.5">
              <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse"></span>
              {activeModel}
            </span>
          </div>
        </div>
      </div>

      {/* Evaluation Selector Switch */}
      <div className="flex items-center justify-between bg-[#111827] border border-slate-800 p-3 rounded-xl">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-300 pl-2">Evaluation Split:</span>
          <div className="flex rounded-lg bg-slate-900 p-1 border border-slate-800">
            <button
              onClick={() => setEvalType("Chronological 70/30")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                evalType === "Chronological 70/30"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Chronological 70/30 (Real-World Time Series)
            </button>
            <button
              onClick={() => setEvalType("Randomized 5-fold CV")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                evalType === "Randomized 5-fold CV"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Randomized 5-Fold Cross Validation
            </button>
          </div>
        </div>

        <div className="text-xs text-slate-400 hidden sm:block pr-2">
          {evalType === "Chronological 70/30" 
            ? "Simulates real production data where future is evaluated on past"
            : "Standard stratified cross-validation benchmark"}
        </div>
      </div>

      {/* Benchmark Metric Grid Table */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-white tracking-tight">Performance Matrix ({evalType})</h4>
            <p className="text-xs text-slate-400">Direct reproduction of output metrics from your Colab notebook</p>
          </div>
          <span className="text-xs font-mono text-slate-400">4 Methods Evaluated</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] bg-slate-900/60">
                <th className="py-3 px-4">Imbalance Technique</th>
                <th className="py-3 px-4">PR-AUC</th>
                <th className="py-3 px-4">Precision</th>
                <th className="py-3 px-4">Recall</th>
                <th className="py-3 px-4">F1 Score</th>
                <th className="py-3 px-4">F2 Score</th>
                <th className="py-3 px-4">MCC</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredBenchmarks.map((b) => {
                const isSelected = activeModel.toLowerCase().includes(b.method_name.toLowerCase().split(" ")[0]);
                const isPraucChampion = evalType === "Chronological 70/30" && b.method_name.includes("Class-weighted");
                const isF1Champion = evalType === "Chronological 70/30" && b.method_name.includes("SMOTENC");
                const isRecallChampion = b.method_name.includes("Random Undersampling");

                return (
                  <tr key={b.id} className={`hover:bg-slate-800/40 transition ${isSelected ? "bg-blue-950/20" : ""}`}>
                    <td className="py-3 px-4 font-semibold text-white">
                      <div className="flex items-center gap-2">
                        <span>{b.method_name}</span>
                        {isPraucChampion && (
                          <span className="text-[10px] bg-amber-500/15 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded font-bold">
                            PR-AUC Champion
                          </span>
                        )}
                        {isF1Champion && (
                          <span className="text-[10px] bg-purple-500/15 text-purple-300 border border-purple-500/30 px-1.5 py-0.5 rounded font-bold">
                            F1/MCC Champion
                          </span>
                        )}
                        {isRecallChampion && (
                          <span className="text-[10px] bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded font-bold">
                            Max Recall
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 font-normal mt-0.5">{b.description}</p>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-blue-400">{b.pr_auc.toFixed(4)}</td>
                    <td className="py-3 px-4 font-mono">{b.precision.toFixed(4)}</td>
                    <td className="py-3 px-4 font-mono">{b.recall.toFixed(4)}</td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-200">{b.f1.toFixed(4)}</td>
                    <td className="py-3 px-4 font-mono">{b.f2.toFixed(4)}</td>
                    <td className="py-3 px-4 font-mono">{b.mcc.toFixed(4)}</td>
                    <td className="py-3 px-4 text-right">
                      {isSelected ? (
                        <span className="px-2.5 py-1 rounded bg-blue-500/20 text-blue-300 text-[11px] font-bold border border-blue-500/30 flex items-center gap-1 justify-end">
                          <Check className="h-3.5 w-3.5" /> Active
                        </span>
                      ) : (
                        <button
                          onClick={() => handleSelectModel(b.method_name)}
                          disabled={updating}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold border border-slate-700 transition"
                        >
                          Activate
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Precision-Recall Curves Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-white tracking-tight">Precision-Recall Curve Comparison</h4>
              <p className="text-xs text-slate-400">Comparing PR trade-offs across all 4 imbalance techniques</p>
            </div>
            <div className="text-[11px] font-mono text-slate-400">Chronological Split</div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={curves} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="recall" stroke="#64748b" tick={{ fontSize: 11 }} label={{ value: "Recall", position: "insideBottomRight", offset: -5, fill: "#64748b", fontSize: 11 }} />
                <YAxis stroke="#64748b" domain={[0, 1.0]} tick={{ fontSize: 11 }} label={{ value: "Precision", angle: -90, position: "insideLeft", offset: 10, fill: "#64748b", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px", fontSize: "12px" }}
                  formatter={(val, name) => [`${(Number(val) * 100).toFixed(1)}%`, name]}
                />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                <Line type="monotone" dataKey="Baseline" stroke="#94a3b8" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Class-Weighted" stroke="#3b82f6" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="SMOTENC" stroke="#a855f7" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Undersampling" stroke="#10b981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Key Findings Card */}
        <div className="lg:col-span-4 bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <h4 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
            <Award className="h-4 w-4 text-amber-400" />
            <span>Research Conclusions</span>
          </h4>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <strong className="text-blue-300 block font-semibold mb-0.5">1. Class-Weighted Wins on PR-AUC</strong>
              <p className="text-slate-300">
                On the chronological split, Class-Weighted LightGBM achieved the highest PR-AUC (0.5279), boosting fraud recall to 66.12%.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <strong className="text-purple-300 block font-semibold mb-0.5">2. SMOTENC Wins on F1 & MCC</strong>
              <p className="text-slate-300">
                Synthetic sampling balanced precision (75.21%) and recall (35.72%), earning the highest F1 (0.4844) and Matthews correlation (0.5075).
              </p>
            </div>

            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <strong className="text-emerald-300 block font-semibold mb-0.5">3. Temporal Drift Impact</strong>
              <p className="text-slate-300">
                Random CV overestimated baseline PR-AUC at 0.7109 due to temporal leakage. Chronological evaluation is essential for production fraud.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
