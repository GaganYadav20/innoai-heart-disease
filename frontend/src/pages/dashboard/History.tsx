import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Filter, Download, Trash2, Eye, Calendar, Cpu } from "lucide-react";
import api from "@/services/api";
import { formatDateTime, getRiskBadgeClass } from "@/lib/utils";

export default function History() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["prediction-history", page],
    queryFn: () => api.get(`/predictions/history?page=${page}&size=10`).then(r => r.data.data),
  });

  const predictions = data?.content || [];
  const totalPages = data?.totalPages || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Prediction History</h1>
          <p className="text-gray-400 text-sm mt-1">View and manage your past predictions</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--color-surface-2)] text-gray-300 hover:text-white border border-white/5 transition-colors text-sm">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Search */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search predictions..."
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-[var(--color-surface-2)] border border-white/5 text-white placeholder-gray-500 focus:border-primary-500 outline-none transition-all"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[var(--color-surface-2)] border border-white/5 text-gray-400 hover:text-white transition-colors">
          <Filter className="w-4 h-4" /> Filters
        </button>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-4">Date</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-4">Model</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-4">Risk Score</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-4">Category</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-4">Heart Age</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-4">Confidence</th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-500">Loading...</td></tr>
              ) : predictions.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-500">No predictions yet. Upload a report to get started.</td></tr>
              ) : (
                predictions.map((pred: any) => (
                  <motion.tr
                    key={pred.id}
                    className="border-b border-white/3 hover:bg-white/2 transition-colors cursor-pointer"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => navigate(`/dashboard/prediction/${pred.id}`)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        {formatDateTime(pred.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <Cpu className="w-4 h-4 text-primary-400" />
                        {pred.modelName?.replace(/_/g, " ")}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-white">
                        {(parseFloat(pred.riskScore) * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRiskBadgeClass(pred.riskCategory)}`}>
                        {pred.riskCategory}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">{pred.heartAge}y</td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {(parseFloat(pred.confidenceScore) * 100).toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/prediction/${pred.id}`); }}
                        className="p-2 text-gray-400 hover:text-primary-400 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-white/5">
            <span className="text-sm text-gray-500">Page {page + 1} of {totalPages}</span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-4 py-2 rounded-lg bg-[var(--color-surface-3)] text-sm text-gray-300 disabled:opacity-50"
              >Previous</button>
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="px-4 py-2 rounded-lg bg-[var(--color-surface-3)] text-sm text-gray-300 disabled:opacity-50"
              >Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
