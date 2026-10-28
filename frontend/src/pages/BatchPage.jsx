import React, { useState } from "react";
import { 
  FileSpreadsheet, 
  UploadCloud, 
  Download, 
  CheckCircle, 
  AlertCircle
} from "lucide-react";
import api from "../services/api";

export default function BatchPage() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [batchSummary, setBatchSummary] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.uploadBatch(formData);
      setBatchSummary(res.data);
    } catch (e) {
      alert("Batch evaluation error: " + (e.response?.data?.detail || e.message));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Box */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Bulk Transaction CSV Evaluation</h3>
            <p className="text-xs text-slate-400">Upload bulk IEEE-CIS formatted CSV files for high-throughput batch inference</p>
          </div>
          <a
            href={api.getSampleCsvUrl()}
            download
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 text-xs font-semibold border border-slate-700 transition"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download Sample CSV</span>
          </a>
        </div>

        <div className="border-2 border-dashed border-slate-700 hover:border-blue-500/50 rounded-xl p-8 text-center bg-slate-900/30 transition">
          <UploadCloud className="h-10 w-10 text-slate-400 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-200">
            {file ? file.name : "Drag & drop your CSV file here, or browse"}
          </p>
          <p className="text-xs text-slate-400 mt-1">Supports IEEE-CIS features (TransactionAmt, ProductCD, card4, P_emaildomain, C1...)</p>

          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
            id="batch-file-input"
          />

          <div className="mt-4 flex items-center justify-center gap-3">
            <label
              htmlFor="batch-file-input"
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer border border-slate-700"
            >
              Choose CSV File
            </label>
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className={`px-5 py-2 rounded-lg text-xs font-bold text-white transition ${
                !file || uploading
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/30"
              }`}
            >
              {uploading ? "Evaluating Batch Rows..." : "Run Batch Evaluation"}
            </button>
          </div>
        </div>
      </div>

      {/* Batch Results & Summary */}
      {batchSummary && (
        <div className="space-y-6">
          {/* Summary KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#111827] border border-slate-800 rounded-xl p-4">
              <span className="text-xs text-slate-400 uppercase font-semibold">Processed Rows</span>
              <p className="text-2xl font-black text-white mt-1">{batchSummary.total_processed}</p>
            </div>
            <div className="bg-[#111827] border border-slate-800 rounded-xl p-4">
              <span className="text-xs text-slate-400 uppercase font-semibold">Batch Fraud Rate</span>
              <p className="text-2xl font-black text-rose-400 mt-1">{batchSummary.fraud_rate_pct}%</p>
            </div>
            <div className="bg-[#111827] border border-slate-800 rounded-xl p-4">
              <span className="text-xs text-slate-400 uppercase font-semibold">Total Scanned ($)</span>
              <p className="text-2xl font-black text-slate-200 mt-1">${batchSummary.total_amount_scanned.toLocaleString()}</p>
            </div>
            <div className="bg-[#111827] border border-slate-800 rounded-xl p-4">
              <span className="text-xs text-slate-400 uppercase font-semibold">Losses Blocked ($)</span>
              <p className="text-2xl font-black text-emerald-400 mt-1">${batchSummary.blocked_amount_prevented.toLocaleString()}</p>
            </div>
          </div>

          {/* Results Table */}
          <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-sm">
            <h4 className="text-sm font-bold text-white mb-3">Batch Scored Records</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                    <th className="py-2 px-3">Transaction ID</th>
                    <th className="py-2 px-3">Amount</th>
                    <th className="py-2 px-3">Card / Email</th>
                    <th className="py-2 px-3">Risk Score</th>
                    <th className="py-2 px-3">Decision</th>
                    <th className="py-2 px-3">Top Risk Driver</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {batchSummary.transactions.map((tx, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/30">
                      <td className="py-2.5 px-3 font-mono font-medium text-white">{tx.transaction_id}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-200">${Number(tx.amount).toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-slate-400 capitalize">{tx.card4} • {tx.p_email}</td>
                      <td className="py-2.5 px-3 font-mono font-bold">
                        <span className={
                          tx.risk_score >= 0.70 ? "text-rose-400" :
                          tx.risk_score >= 0.35 ? "text-amber-400" : "text-emerald-400"
                        }>
                          {(tx.risk_score * 100).toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          tx.decision === "BLOCK" ? "bg-rose-500/15 text-rose-400 border border-rose-500/30" :
                          tx.decision === "REVIEW" ? "bg-amber-500/15 text-amber-400 border border-amber-500/30" :
                          "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                        }`}>
                          {tx.decision}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 truncate max-w-xs">{tx.top_risk_driver}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
