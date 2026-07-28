"use client";
import { API_URL } from "@/lib/config";

import { showToast } from "@/lib/toast";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  ListTodo,
  Loader2,
  Pause,
  Play,
  RefreshCw,
  Trash2,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface ImportTask {
  id: string;
  name: string;
  status: "pending" | "queued" | "running" | "paused" | "done" | "failed";
  pageNumber: number;
  perPage: number;
  totalItems: number;
  imported: number;
  failed: number;
  details: string[];
  startedAt: string | null;
  finishedAt: string | null;
  createdAt: string;
}

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    color: "text-gray-400",
    bg: "bg-gray-700",
    icon: Clock,
  },
  queued: {
    label: "Queued",
    color: "text-orange-400",
    bg: "bg-orange-900/50",
    icon: Clock,
  },
  running: {
    label: "Running",
    color: "text-blue-400",
    bg: "bg-blue-900/50",
    icon: Loader2,
  },
  paused: {
    label: "Paused",
    color: "text-yellow-400",
    bg: "bg-yellow-900/40",
    icon: AlertTriangle,
  },
  done: {
    label: "Done",
    color: "text-green-400",
    bg: "bg-green-900/30",
    icon: CheckCircle2,
  },
  failed: {
    label: "Failed",
    color: "text-pink-400",
    bg: "bg-pink-900/30",
    icon: XCircle,
  },
};

function getToken() {
  return typeof window !== "undefined"
    ? localStorage.getItem("femcart_access_token") ||
        localStorage.getItem("token") ||
        ""
    : "";
}

export default function ImportProcessTab() {
  const [tasks, setTasks] = useState<ImportTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());
  const logRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/wordpress/tasks`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setTasks(
          data.data.map((t: any) => ({
            ...t,
            details:
              typeof t.details === "string"
                ? JSON.parse(t.details || "[]") || []
                : t.details || [],
          })),
        );
      }
    } catch (e) {
      /* ignore */
    }
  }, []);

  // Poll while any task is running or queued
  const hasActiveTasks = tasks.some(
    (t) => t.status === "running" || t.status === "queued",
  );
  useEffect(() => {
    fetchTasks();
    const interval = setInterval(fetchTasks, hasActiveTasks ? 2000 : 5000);
    return () => clearInterval(interval);
  }, [fetchTasks, hasActiveTasks]);

  const pendingCount = tasks.filter((t) => t.status === "pending").length;
  const queuedCount = tasks.filter((t) => t.status === "queued").length;
  const runningCount = tasks.filter((t) => t.status === "running").length;
  const doneCount = tasks.filter((t) => t.status === "done").length;
  const failedCount = tasks.filter((t) => t.status === "failed").length;
  const totalImported = tasks.reduce((sum, t) => sum + (t.imported || 0), 0);

  // Auto-scroll log terminals when new lines arrive
  useEffect(() => {
    expandedLogs.forEach((id) => {
      const el = logRefs.current[id];
      if (el) el.scrollTop = el.scrollHeight;
    });
  }, [tasks, expandedLogs]);

  const generateTasks = async () => {
    setGenerating(true);
    try {
      const res = await fetch(`${API_URL}/api/wordpress/tasks/generate`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      const data = await res.json();
      if (data.success) await fetchTasks();
      else showToast.error(data.message);
    } finally {
      setGenerating(false);
    }
  };

  const clearTasks = async () => {
    if (!confirm("Delete all tasks? Running tasks will not be stopped."))
      return;
    await fetch(`${API_URL}/api/wordpress/tasks`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
    setTasks([]);
    setExpandedLogs(new Set());
  };

  const startTask = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/wordpress/task/${id}/start`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      const data = await res.json();
      if (!data.success) showToast.error(data.message);
      await fetchTasks();
    } finally {
      setLoading(false);
    }
  };

  const pauseTask = async (id: string) => {
    await fetch(`${API_URL}/api/wordpress/task/${id}/pause`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
    await fetchTasks();
  };

  const toggleLogs = (id: string) => {
    setExpandedLogs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">
            Import Task Manager
          </h2>
          <p className="text-sm text-gray-400 mt-0.5">
            Products are split into batches of 20. Only 1 batch runs at a time
            to prevent server freeze.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={fetchTasks}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm transition-colors"
          >
            <RefreshCw size={14} /> Refresh
          </button>
          <button
            onClick={clearTasks}
            disabled={tasks.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-pink-700 hover:bg-pink-600 text-white text-sm transition-colors disabled:opacity-40"
          >
            <Trash2 size={14} /> Clear All
          </button>
          <button
            onClick={generateTasks}
            disabled={generating}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors disabled:opacity-50"
          >
            {generating ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <ListTodo size={14} />
            )}
            {generating ? "Generating..." : "Import All"}
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      {tasks.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: "Pending", value: pendingCount, color: "text-gray-400" },
            { label: "Queued", value: queuedCount, color: "text-orange-400" },
            { label: "Running", value: runningCount, color: "text-blue-400" },
            { label: "Done", value: doneCount, color: "text-green-400" },
            {
              label: "Imported",
              value: totalImported,
              color: "text-emerald-400",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-gray-800 rounded-xl p-4 text-center border border-gray-700 shadow-sm"
            >
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mt-1">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Task List */}
      {tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <ListTodo size={40} className="text-gray-600 mb-3" />
          <p className="text-gray-400 font-medium">No import tasks yet.</p>
          <p className="text-gray-500 text-sm mt-1">
            Click "Import All" to scan your WooCommerce store.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => {
            const cfg = STATUS_CONFIG[task.status] || STATUS_CONFIG.pending;
            const StatusIcon = cfg.icon;
            const progress =
              task.totalItems > 0
                ? Math.round((task.imported / task.totalItems) * 100)
                : 0;
            const isExpanded = expandedLogs.has(task.id);

            return (
              <div
                key={task.id}
                className={`rounded-xl border overflow-hidden transition-all ${cfg.bg} border-gray-700`}
              >
                {/* Task Header Row */}
                <div className="flex items-center gap-3 p-4">
                  <div className={cfg.color}>
                    <StatusIcon
                      size={18}
                      className={
                        task.status === "running"
                          ? "animate-spin"
                          : task.status === "queued"
                            ? "animate-pulse"
                            : ""
                      }
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-white truncate">
                        {task.name}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter bg-gray-900/50 ${cfg.color} border border-white/5`}
                      >
                        {cfg.label}
                      </span>
                    </div>
                    {/* Progress Bar */}
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 bg-gray-950 rounded-full h-1.5 border border-white/5">
                        <div
                          className={`h-1.5 rounded-full transition-all duration-500 ${task.status === "done" ? "bg-green-500" : "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"}`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-gray-400 font-bold whitespace-nowrap">
                        {task.imported}/{task.totalItems}
                        {task.failed > 0 && (
                          <span className="text-pink-400 ml-1">
                            ({task.failed} failed)
                          </span>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {task.status === "running" ? (
                      <button
                        onClick={() => pauseTask(task.id)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold transition-colors"
                      >
                        <Pause size={12} /> Pause
                      </button>
                    ) : ["pending", "paused", "failed"].includes(
                        task.status,
                      ) ? (
                      <button
                        onClick={() => startTask(task.id)}
                        disabled={loading}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors disabled:opacity-50"
                      >
                        <Play size={12} />{" "}
                        {task.status === "paused" || task.status === "failed"
                          ? "Resume"
                          : "Start"}
                      </button>
                    ) : task.status === "queued" ? (
                      <div className="px-3 py-1.5 text-[10px] text-gray-500 font-bold italic">
                        Waiting...
                      </div>
                    ) : null}

                    <button
                      onClick={() => toggleLogs(task.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-bold transition-colors border border-gray-700"
                    >
                      {isExpanded ? (
                        <ChevronUp size={12} />
                      ) : (
                        <ChevronDown size={12} />
                      )}
                      Logs
                    </button>
                  </div>
                </div>

                {/* Log Terminal */}
                {isExpanded && (
                  <div
                    ref={(el) => {
                      logRefs.current[task.id] = el;
                    }}
                    className="bg-gray-950 border-t border-gray-800 p-3 max-h-64 overflow-y-auto font-mono text-[10px] leading-relaxed"
                  >
                    {!task.details || task.details.length === 0 ? (
                      <p className="text-gray-600 italic">
                        No log entries yet. Start the task to see detailed
                        output.
                      </p>
                    ) : (
                      task.details.map((line, i) => {
                        const color =
                          line.includes("?") || line.includes("??")
                            ? "text-green-400"
                            : line.includes("?") || line.includes("??")
                              ? "text-pink-400"
                              : line.includes("??") || line.includes("??")
                                ? "text-yellow-400"
                                : line.includes("??")
                                  ? "text-blue-400"
                                  : line.includes("???")
                                    ? "text-purple-400"
                                    : line.includes("??")
                                      ? "text-cyan-400"
                                      : "text-gray-400";
                        return (
                          <p key={i} className={color}>
                            {line}
                          </p>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
