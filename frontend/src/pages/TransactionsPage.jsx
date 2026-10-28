import React, { useState, useEffect } from "react";
import { 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  RefreshCw,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import TransactionModal from "../components/TransactionModal";
import api from "../services/api";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedTx, setSelectedTx] = useState(null);

  // Filters
  const [search, setSearch] = useState("");
  const [decisionFilter, setDecisionFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(0);
  const limit = 20;

  const fetchTxs = async () => {
    setLoading(true);
    try {
      const res = await api.getTransactions({
        search: search || undefined,
        decision: decisionFilter || undefined,
        analyst_status: statusFilter || undefined,
        skip: page * limit,
        limit: limit
      });
      setTransactions(res.data.items);
      setTotal(res.data.total);
    } catch (e) {
      console.error("Error fetching transactions:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTxs();
  }, [page, decisionFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchTxs();
  };

  const handleTriageUpdate = async (id, status, notes) => {
    await api.updateTriage(id, status, notes);
    fetchTxs();
  };

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by ID, email, or card..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
          />
        </form>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Filter className="h-3.5 w-3.5" />
            <span>Decision:</span>
          </div>
          <select
            value={decisionFilter}
            onChange={(e) => { setDecisionFilter(e.target.value); setPage(0); }}
            className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">All Decisions</option>
            <option value="ALLOW">Allow Only</option>
            <option value="REVIEW">Review Only</option>
            <option value="BLOCK">Block Only</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
            className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending Triage</option>
            <option value="CONFIRMED_FRAUD">Confirmed Fraud</option>
            <option value="FALSE_POSITIVE">False Positive</option>
            <option value="DISMISSED">Dismissed</option>
          </select>

          <button
            onClick={fetchTxs}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Reload Transactions"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Main Transactions Table */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] bg-slate-900/60">
                <th className="py-3 px-4">Transaction ID</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4">Purchaser Email</th>
                <th className="py-3 px-4">Risk Probability</th>
                <th className="py-3 px-4">Decision</th>
                <th className="py-3 px-4">Analyst Status</th>
                <th className="py-3 px-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {transactions.length > 0 ? (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3 px-4 font-mono font-medium text-white">{tx.transaction_id}</td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">{new Date(tx.created_at).toLocaleTimeString()}</td>
                    <td className="py-3 px-4 font-semibold text-slate-200">${Number(tx.amount).toFixed(2)}</td>
                    <td className="py-3 px-4 text-slate-300 capitalize">{tx.card4} ({tx.card6})</td>
                    <td className="py-3 px-4 text-slate-400 truncate max-w-[140px]">{tx.p_email}</td>
                    <td className="py-3 px-4 font-mono font-bold">
                      <span className={
                        tx.risk_score >= 0.70 ? "text-rose-400" :
                        tx.risk_score >= 0.35 ? "text-amber-400" : "text-emerald-400"
                      }>
                        {(tx.risk_score * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        tx.decision === "BLOCK" ? "bg-rose-500/15 text-rose-400 border border-rose-500/30" :
                        tx.decision === "REVIEW" ? "bg-amber-500/15 text-amber-400 border border-amber-500/30" :
                        "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                      }`}>
                        {tx.decision}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-[11px] font-semibold ${
                        tx.analyst_status === "CONFIRMED_FRAUD" ? "text-rose-400" :
                        tx.analyst_status === "FALSE_POSITIVE" ? "text-emerald-400" :
                        tx.analyst_status === "DISMISSED" ? "text-slate-500" : "text-amber-400"
                      }`}>
                        {tx.analyst_status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedTx(tx)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium border border-slate-700 transition"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">
                    No transactions match the selected filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Showing {transactions.length} of {total} records</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="p-1.5 rounded bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700 text-slate-300"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="font-mono">Page {page + 1}</span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={(page + 1) * limit >= total}
              className="p-1.5 rounded bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700 text-slate-300"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
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
