"use client";
import { API_URL } from "@/lib/config";
import { toast } from "sonner";
import Swal from "sweetalert2";

const WavingText = ({ text }: { text: string }) => (
  <span className="inline-flex space-x-[1px]">
    {text.split("").map((char, index) => (
      <span
        key={index}
        className="inline-block animate-wave"
        style={{ 
          animationDelay: `${index * 0.1}s`, 
          animationDuration: '1.2s' 
        }}
      >
        {char === " " ? "\u00A0" : char}
      </span>
    ))}
    <style>{`
      @keyframes wave {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-2px); }
      }
      .animate-wave {
        animation: wave ease-in-out infinite;
      }
    `}</style>
  </span>
);

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
  Settings,
  Database,
  Image as ImageIcon
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
    color: "text-gray-500",
    bg: "bg-gray-100",
    border: "border-gray-200",
    icon: Clock,
  },
  queued: {
    label: "Queued",
    color: "text-amber-500",
    bg: "bg-amber-50",
    border: "border-amber-200",
    icon: Clock,
  },
  running: {
    label: "Running",
    color: "text-blue-500",
    bg: "bg-blue-50",
    border: "border-blue-200",
    icon: Loader2,
  },
  paused: {
    label: "Paused",
    color: "text-orange-500",
    bg: "bg-orange-50",
    border: "border-orange-200",
    icon: AlertTriangle,
  },
  done: {
    label: "Done",
    color: "text-emerald-500",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    icon: CheckCircle2,
  },
  failed: {
    label: "Failed",
    color: "text-rose-500",
    bg: "bg-rose-50",
    border: "border-rose-200",
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
  const [entityType, setEntityType] = useState("PRODUCTS");
  const [imageStorageStrategy, setImageStorageStrategy] = useState("AWS_S3");
  const logRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/shopify/tasks`, {
        headers: { Authorization: `Bearer ${getToken()}` },
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
      // ignore
    }
  }, []);

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

  useEffect(() => {
    expandedLogs.forEach((id) => {
      const el = logRefs.current[id];
      if (el) el.scrollTop = el.scrollHeight;
    });
  }, [tasks, expandedLogs]);

  const generateTasks = async () => {
    setGenerating(true);
    try {
      const res = await fetch(`${API_URL}/api/shopify/tasks/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ entityType, imageStorageStrategy }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Tasks generated successfully!");
        await fetchTasks();
      } else {
        toast.error(data.message || "Failed to generate tasks");
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong.");
    } finally {
      setGenerating(false);
    }
  };

  const clearTasks = async () => {
    const result = await Swal.fire({
      title: "Delete all tasks?",
      text: "Running tasks will not be stopped.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Yes, delete them"
    });
    
    if (!result.isConfirmed) return;

    try {
      await fetch(`${API_URL}/api/shopify/tasks`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setTasks([]);
      setExpandedLogs(new Set());
      toast.success("Tasks cleared successfully.");
    } catch (err) {
      toast.error("Failed to clear tasks.");
    }
  };

  const startTask = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/shopify/task/${id}/start`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (!data.success) toast.error(data.message);
      else toast.success("Task started.");
      await fetchTasks();
    } catch (err) {
      toast.error("Failed to start task.");
    } finally {
      setLoading(false);
    }
  };

  const pauseTask = async (id: string) => {
    try {
      await fetch(`${API_URL}/api/shopify/task/${id}/pause`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      toast.success("Task paused.");
      await fetchTasks();
    } catch (err) {
      toast.error("Failed to pause task.");
    }
  };

  const toggleLogs = (id: string) => {
    setExpandedLogs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Improved log parser to style logs correctly without emojis
  const formatLogLine = (line: string) => {
    const lowerLine = line.toLowerCase();
    if (lowerLine.includes("success") || lowerLine.includes("imported")) return "text-emerald-400";
    if (lowerLine.includes("error") || lowerLine.includes("failed")) return "text-rose-400";
    if (lowerLine.includes("skip") || lowerLine.includes("warn")) return "text-amber-400";
    if (lowerLine.includes("start") || lowerLine.includes("queue")) return "text-blue-400";
    return "text-gray-300";
  };

  return (
    <div className="space-y-8">
      {/* Configuration Box */}
      <div className="bg-white border border-gray-200/80 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                <Database size={16} className="text-gray-400" /> Entity to Import
              </label>
              <select
                value={entityType}
                onChange={(e) => setEntityType(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-gray-800 text-sm font-medium transition-all"
              >
                <option value="PRODUCTS">Products</option>
                <option value="ORDERS">Orders</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                <ImageIcon size={16} className="text-gray-400" /> Image Strategy
              </label>
              <select
                value={imageStorageStrategy}
                onChange={(e) => setImageStorageStrategy(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-gray-800 text-sm font-medium transition-all"
              >
                <option value="AWS_S3">AWS S3 (Recommended)</option>
                <option value="LOCAL">Local Server (/uploads)</option>
                <option value="DIRECT_LINK">Direct shopify Link (Fastest)</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={generateTasks}
              disabled={generating}
              className="flex-1 md:flex-none px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 disabled:opacity-50 text-white font-semibold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 whitespace-nowrap"
            >
              {generating ? <Loader2 size={18} className="animate-spin" /> : <ListTodo size={18} />}
              {generating ? "Generating..." : "Generate Tasks"}
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Settings size={20} className="text-emerald-600" /> Active Operations
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Data is split into small batches to ensure server stability.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchTasks}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-sm transition-colors"
          >
            <RefreshCw size={14} /> Refresh
          </button>
          <button
            onClick={clearTasks}
            disabled={tasks.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 font-medium text-sm transition-colors disabled:opacity-50"
          >
            <Trash2 size={14} /> Clear All
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      {tasks.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {[
            { label: "Pending", value: pendingCount, color: "text-gray-500", bg: "bg-gray-50" },
            { label: "Queued", value: queuedCount, color: "text-amber-500", bg: "bg-amber-50" },
            { label: "Running", value: runningCount, color: "text-blue-500", bg: "bg-blue-50" },
            { label: "Done", value: doneCount, color: "text-emerald-500", bg: "bg-emerald-50" },
            { label: "Items Imported", value: totalImported, color: "text-teal-600", bg: "bg-teal-50" },
          ].map((s) => (
            <div
              key={s.label}
              className={`${s.bg} rounded-2xl p-4 text-center border border-gray-100/50 shadow-sm`}
            >
              <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-[11px] uppercase tracking-wider text-gray-500 font-bold mt-1">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Task List */}
      {tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 mb-4">
            <ListTodo size={28} className="text-gray-400" />
          </div>
          <h3 className="text-gray-900 font-bold text-lg mb-1">No Active Tasks</h3>
          <p className="text-gray-500 text-sm max-w-sm text-center">
            Configure your settings above and click "Generate Tasks" to begin synchronizing your store data.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
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
                className={`bg-white rounded-2xl border transition-all shadow-sm overflow-hidden ${
                  task.status === "running" ? "border-blue-200 ring-2 ring-blue-50" : "border-gray-200/80"
                }`}
              >
                <div className="flex items-center gap-4 p-5">
                  {task.status !== "running" && (
                    <div className={`p-3 rounded-xl ${cfg.bg} ${cfg.color}`}>
                      <StatusIcon
                        size={20}
                        className={task.status === "queued" ? "animate-pulse" : ""}
                      />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-bold text-gray-900 truncate">
                        {task.name}
                      </span>
                      <span
                        className={`text-[10px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider ${cfg.bg} ${cfg.color} ${cfg.border} border whitespace-nowrap`}
                      >
                        {task.status === "running" ? <WavingText text={cfg.label.toUpperCase()} /> : cfg.label}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden border border-gray-200/50">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ease-out ${
                            task.status === "done" 
                              ? "bg-emerald-500" 
                              : task.status === "failed"
                                ? "bg-rose-500"
                                : "bg-blue-500"
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 font-semibold whitespace-nowrap min-w-[100px] text-right">
                        {task.imported} / {task.totalItems} items
                        {task.failed > 0 && (
                          <span className="text-rose-500 ml-1">
                            ({task.failed} err)
                          </span>
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-4">
                    {task.status === "running" ? (
                      <button
                        onClick={() => pauseTask(task.id)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-600 text-xs font-bold transition-colors"
                      >
                        <Pause size={14} /> Pause
                      </button>
                    ) : ["pending", "paused", "failed"].includes(
                        task.status,
                      ) ? (
                      <button
                        onClick={() => startTask(task.id)}
                        disabled={loading}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-600 text-xs font-bold transition-colors disabled:opacity-50"
                      >
                        <Play size={14} />
                        {task.status === "paused" || task.status === "failed"
                          ? "Resume"
                          : "Start"}
                      </button>
                    ) : task.status === "queued" ? (
                      <div className="px-3 py-2 text-xs text-gray-400 font-bold italic">
                        Waiting...
                      </div>
                    ) : null}

                    <button
                      onClick={() => toggleLogs(task.id)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors border ${
                        isExpanded 
                          ? "bg-gray-900 text-white border-gray-900" 
                          : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      Logs
                    </button>
                  </div>
                </div>

                {/* Dark Mode Terminal UI */}
                {isExpanded && (
                  <div className="bg-[#0D1117] border-t border-gray-200/50">
                    <div className="flex items-center gap-2 px-4 py-2 border-b border-white/5 bg-[#161B22]">
                      <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></div>
                      </div>
                      <span className="text-[10px] text-gray-400 font-mono tracking-wider">task_execution_log.sh</span>
                    </div>
                    <div
                      ref={(el) => { logRefs.current[task.id] = el; }}
                      className="p-4 max-h-[300px] overflow-y-auto font-mono text-xs leading-relaxed"
                    >
                      {!task.details || task.details.length === 0 ? (
                        <p className="text-gray-500 italic flex items-center gap-2">
                          <span className="text-gray-400">$</span> Waiting for task to start...
                        </p>
                      ) : (
                        task.details.map((line, i) => (
                          <div key={i} className="flex items-start gap-3 py-0.5 hover:bg-white/[0.02] px-2 -mx-2 rounded">
                            <span className="text-gray-600 select-none shrink-0 w-6 text-right">{i+1}</span>
                            <span className={`${formatLogLine(line)} break-all`}>
                              {line}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
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
