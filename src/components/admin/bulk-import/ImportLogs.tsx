import React, { useEffect, useState } from "react";
import { API_URL } from "@/lib/config";
import { AlertCircle, CheckCircle2, Loader2, RefreshCw } from "lucide-react";

interface ImportLog {
  id: string;
  status: string;
  totalProducts: number;
  imported: number;
  failed: number;
  errors: string | null;
  startedAt: string | null;
  finishedAt: string | null;
  createdAt: string;
}

export default function ImportLogs() {
  const [logs, setLogs] = useState<ImportLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setRefreshing(true);
      const token =
        localStorage.getItem("femcart_access_token") ||
        localStorage.getItem("token") ||
        "";

      const res = await fetch(`${API_URL}/api/bulk-import/logs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) {
        setLogs(json.data || []);
      }
    } catch (e) {
      console.error("Failed to fetch import logs:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "processing":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
            <Loader2 size={10} className="animate-spin" /> Processing
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
            <CheckCircle2 size={10} /> Success
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400">
            <AlertCircle size={10} /> Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-50 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400">
            Idle
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-gray-500 gap-3">
        <Loader2 size={24} className="animate-spin text-emerald-600" />
        <span className="text-xs font-semibold">Loading import logs...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
        <div>
          <h3 className="text-sm font-bold text-gray-800 dark:text-white">
            Bulk Import Tasks History
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Monitor real-time progress, log outputs, and results of import tasks.
          </p>
        </div>
        <button
          onClick={fetchLogs}
          disabled={refreshing}
          className="p-2 rounded-xl border border-gray-250/50 dark:border-gray-800 hover:bg-gray-150/40 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 disabled:opacity-50 transition-colors"
        >
          <RefreshCw
            size={14}
            className={refreshing ? "animate-spin" : ""}
          />
        </button>
      </div>

      {logs.length === 0 ? (
        <div className="text-center p-12 border border-dashed border-gray-200 dark:border-gray-800 rounded-3xl text-gray-400">
          <p className="text-xs font-bold">No import tasks have been registered yet.</p>
        </div>
      ) : (
        <div className="overflow-hidden border border-gray-200 dark:border-gray-800 rounded-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50/80 dark:bg-gray-900/50 text-gray-500 font-semibold border-b border-gray-200 dark:border-gray-800">
                  <th className="px-4 py-3">Task ID</th>
                  <th className="px-4 py-3">Created At</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Total Rows</th>
                  <th className="px-4 py-3 text-right text-emerald-600 dark:text-emerald-400">Imported</th>
                  <th className="px-4 py-3 text-right text-rose-600 dark:text-rose-400">Failed</th>
                  <th className="px-4 py-3 text-center">Errors</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => {
                  const isExpanded = expandedLogId === log.id;
                  const dateStr = log.startedAt
                    ? new Date(log.startedAt).toLocaleString()
                    : new Date(log.createdAt).toLocaleString();

                  return (
                    <React.Fragment key={log.id}>
                      <tr className="border-b border-gray-100 dark:border-gray-850 hover:bg-gray-50/50 dark:hover:bg-gray-900/20">
                        <td className="px-4 py-3 font-mono font-medium text-gray-800 dark:text-gray-200">
                          {log.id.slice(-6).toUpperCase()}
                        </td>
                        <td className="px-4 py-3 text-gray-500">{dateStr}</td>
                        <td className="px-4 py-3 text-center">
                          {getStatusBadge(log.status)}
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-gray-700 dark:text-gray-300">
                          {log.totalProducts}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                          {log.imported}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-rose-600 dark:text-rose-400">
                          {log.failed}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {log.errors ? (
                            <button
                              onClick={() =>
                                setExpandedLogId(isExpanded ? null : log.id)
                              }
                              className="text-xs font-bold text-blue-500 hover:text-blue-600 underline"
                            >
                              {isExpanded ? "Hide Details" : "View Errors"}
                            </button>
                          ) : (
                            <span className="text-gray-400 font-medium">-</span>
                          )}
                        </td>
                      </tr>

                      {isExpanded && log.errors && (
                        <tr>
                          <td colSpan={7} className="px-4 py-3 bg-rose-50/30 dark:bg-rose-950/10 border-b border-gray-200 dark:border-gray-800">
                            <div className="p-3 bg-rose-50/80 dark:bg-rose-950/20 border border-rose-100/50 dark:border-rose-900/30 rounded-xl">
                              <h4 className="text-xs font-bold text-rose-800 dark:text-rose-400 mb-1.5 flex items-center gap-1">
                                <AlertCircle size={12} /> Execution Errors List:
                              </h4>
                              <pre className="text-[10px] font-mono text-rose-700 dark:text-rose-400 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-[180px]">
                                {log.errors}
                              </pre>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
