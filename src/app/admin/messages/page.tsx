"use client";

import {
  Calendar,
  Eye,
  Mail,
  MailOpen,
  Phone,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function ContactMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState("all");
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const url = new URL(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/contact`,
      );
      url.searchParams.append("page", page.toString());
      if (search) url.searchParams.append("search", search);
      if (filter === "unread") url.searchParams.append("isRead", "false");
      if (filter === "read") url.searchParams.append("isRead", "true");

      const res = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setMessages(data.data);
        setTotalPages(data.pagination.totalPages || 1);
      }
    } catch (error) {
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [page, search, filter]);

  const toggleReadStatus = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/contact/${id}/read`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ isRead: !currentStatus }),
        },
      );
      if (res.ok) {
        toast.success(
          `Message marked as ${!currentStatus ? "read" : "unread"}`,
        );
        fetchMessages();
        if (selectedMessage && selectedMessage.id === id) {
          setSelectedMessage((prev) =>
            prev ? { ...prev, isRead: !currentStatus } : null,
          );
        }
      }
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const deleteMessage = async (id: string) => {
    if (!confirm("Are you sure you want to delete this message?")) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/contact/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      if (res.ok) {
        toast.success("Message deleted");
        fetchMessages();
        if (selectedMessage?.id === id) {
          setSelectedMessage(null);
        }
      }
    } catch (error) {
      toast.error("Failed to delete message");
    }
  };

  const isPhoneNumber = (str: string) => {
    // Simple regex to check if it contains mostly digits and typical phone characters
    return /^[\d\+\-\s\(\)]+$/.test(str) && str.length >= 7;
  };

  return (
    <div className="p-6 md:p-10 max-w-[1400px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">
            Contact Messages
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium mt-2">
            Manage customer inquiries and feedback.
          </p>
        </div>
      </div>

      <div className="glass p-6 md:p-8 rounded-3xl border border-gray-200/50 dark:border-gray-800/50 shadow-xl shadow-emerald-500/5">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-8">
          <div className="relative w-full md:w-96">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search messages..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-50/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-900 p-1.5 rounded-2xl w-full md:w-auto">
            {["all", "unread", "read"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-bold capitalize transition-all duration-300 ${
                  filter === f
                    ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-md shadow-gray-200/50 dark:shadow-black/20"
                    : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-20 h-20 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="text-gray-400" size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              No Messages Found
            </h3>
            <p className="text-gray-500">
              We couldn't find any contact messages matching your criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto overflow-hidden rounded-xl border border-gray-200 dark:border-gray-750 shadow-sm bg-white dark:bg-gray-800">
            <table className="w-full text-left border-collapse min-w-[800px] text-sm">
              <thead>
                <tr className="bg-gray-50/80 dark:bg-gray-800/80">
                  <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider align-middle border border-gray-200 dark:border-gray-700">
                    Status
                  </th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider align-middle border border-gray-200 dark:border-gray-700">
                    Date
                  </th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider align-middle border border-gray-200 dark:border-gray-700">
                    Name
                  </th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider align-middle border border-gray-200 dark:border-gray-700">
                    Contact Info
                  </th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider align-middle border border-gray-200 dark:border-gray-700">
                    Subject
                  </th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider align-middle border border-gray-200 dark:border-gray-700 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {messages.map((msg) => (
                  <tr
                    key={msg.id}
                    className={`group transition-colors duration-200 hover:bg-gray-50/80 dark:hover:bg-gray-750/30 cursor-pointer ${
                      !msg.isRead
                        ? "bg-emerald-50/30 dark:bg-emerald-900/10 font-medium"
                        : ""
                    }`}
                    onClick={() => {
                      setSelectedMessage(msg);
                      if (!msg.isRead) toggleReadStatus(msg.id, msg.isRead);
                    }}
                  >
                    <td className="px-6 py-4 align-middle border border-gray-200 dark:border-gray-750 whitespace-nowrap">
                      {!msg.isRead ? (
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 text-xs font-black uppercase tracking-widest rounded-full">
                          New
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 text-xs font-black uppercase tracking-widest rounded-full">
                          Read
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 align-middle border border-gray-200 dark:border-gray-750 whitespace-nowrap text-gray-600 dark:text-gray-400">
                      {new Date(msg.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 align-middle border border-gray-200 dark:border-gray-750 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold text-xs shrink-0">
                          {msg.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-gray-900 dark:text-white font-bold text-sm">
                          {msg.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 align-middle border border-gray-200 dark:border-gray-750 whitespace-nowrap text-gray-600 dark:text-gray-400">
                      {msg.email}
                    </td>
                    <td className="px-6 py-4 align-middle border border-gray-200 dark:border-gray-750 text-gray-900 dark:text-gray-300 max-w-[200px] truncate">
                      {msg.subject}
                    </td>
                    <td className="px-6 py-4 align-middle border border-gray-200 dark:border-gray-750 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMessage(msg);
                          if (!msg.isRead) toggleReadStatus(msg.id, msg.isRead);
                        }}
                        className="p-2 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-xl transition-colors"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 disabled:opacity-50 font-bold text-sm hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
            >
              Previous
            </button>
            <span className="font-bold text-sm px-4">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 disabled:opacity-50 font-bold text-sm hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* View Message Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
              <h2 className="text-xl font-black text-gray-900 dark:text-white">
                Message Details
              </h2>
              <button
                onClick={() => setSelectedMessage(null)}
                className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 md:p-8 overflow-y-auto flex-1 space-y-6">
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 bg-emerald-50/50 dark:bg-emerald-900/10 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-800/30">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-xl font-bold shrink-0">
                    {selectedMessage.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                      {selectedMessage.name}
                    </h3>
                    <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                      {selectedMessage.email}
                    </p>
                  </div>
                </div>
                <div className="text-sm text-gray-500 font-medium flex items-center gap-2">
                  <Calendar size={16} />
                  {new Date(selectedMessage.createdAt).toLocaleString()}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Subject
                </h4>
                <p className="text-lg font-black text-gray-900 dark:text-white">
                  {selectedMessage.subject}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Message
                </h4>
                <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 p-6 rounded-2xl text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {selectedMessage.message}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex flex-col md:flex-row justify-between gap-4">
              <div className="flex gap-3">
                <a
                  href={
                    isPhoneNumber(selectedMessage.email)
                      ? `tel:${selectedMessage.email}`
                      : `mailto:${selectedMessage.email}`
                  }
                  className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-sm transition-colors shadow-lg shadow-emerald-500/20"
                >
                  {isPhoneNumber(selectedMessage.email) ? (
                    <Phone size={16} />
                  ) : (
                    <Mail size={16} />
                  )}
                  Contact Customer
                </a>

                {/* Fallback secondary contact method if it's ambiguous, or always show both */}
                <a
                  href={`mailto:${selectedMessage.email}`}
                  className={`flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-bold text-sm transition-colors ${isPhoneNumber(selectedMessage.email) ? "block" : "hidden"}`}
                >
                  <Mail size={16} /> Send Email
                </a>
                <a
                  href={`tel:${selectedMessage.email}`}
                  className={`flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-bold text-sm transition-colors ${!isPhoneNumber(selectedMessage.email) ? "block" : "hidden"}`}
                >
                  <Phone size={16} /> Call
                </a>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() =>
                    toggleReadStatus(selectedMessage.id, selectedMessage.isRead)
                  }
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold text-sm transition-colors"
                >
                  {selectedMessage.isRead ? (
                    <Mail size={16} />
                  ) : (
                    <MailOpen size={16} />
                  )}
                  Mark {selectedMessage.isRead ? "Unread" : "Read"}
                </button>
                <button
                  onClick={() => deleteMessage(selectedMessage.id)}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl font-bold text-sm transition-colors"
                >
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
