"use client";

import { API_URL } from "@/lib/config";
import { showToast } from "@/lib/toast";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Clock,
  History,
  Loader2,
  Plus,
  Wallet,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function WalletManagementPage() {
  const [balance, setBalance] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    fetchBalance();
    fetchHistory();
  }, []);

  const fetchBalance = async () => {
    try {
      const token =
        localStorage.getItem("femcart_access_token") ||
        localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/wallet/balance`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const json = await res.json();
      if (json.success) {
        setBalance(json.data !== null ? json.data : 0);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const token =
        localStorage.getItem("femcart_access_token") ||
        localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/wallet/history`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const json = await res.json();
      if (json.success) {
        setTransactions(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleTopUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token =
        localStorage.getItem("femcart_access_token") ||
        localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/wallet/top-up`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          note: "Self top up via dashboard",
        }),
      });
      const json = await res.json();
      if (json.success) {
        if (json.data && json.data.requiresRedirect) {
          window.location.href = json.data.paymentUrl;
          return;
        }
        setBalance(json.data.balance);
        setShowModal(false);
        setAmount("");
        fetchHistory(); // Refresh history
      } else {
        showToast.error(json.message || "Failed to add balance");
      }
    } catch (e) {
      console.error(e);
      showToast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
          <Wallet className="text-emerald-500" size={32} />
          Global Wallet Management
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Monitor your operations fund, view transaction history, and top-up
          credits.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Balance Vault */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 p-8 shadow-sm overflow-hidden relative">
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <Wallet size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic">
                The Vault
              </h3>
              <p className="text-xs text-gray-500 font-medium tracking-tight mt-0.5">
                Automated SMS & Operations Fund
              </p>
            </div>
          </div>

          <div className="flex items-end gap-3 mb-4">
            <span className="text-6xl font-black text-gray-900 dark:text-white tracking-tighter italic">
              ?{balance !== null ? balance.toLocaleString() : "..."}
            </span>
            <span className="text-base font-bold text-gray-400 mb-2.5 tracking-tight uppercase">
              Available Balance
            </span>
          </div>

          {balance !== null && balance < 100 && (
            <div className="mt-6 p-4 bg-pink-50 dark:bg-pink-900/10 border-l-4 border-pink-500 rounded-r-xl">
              <p className="text-sm text-pink-600 dark:text-pink-400 font-bold tracking-tight uppercase">
                ?? Warning: Critical low balance!
              </p>
              <p className="text-xs text-pink-500/80 dark:text-pink-400/80 mt-1 font-medium">
                Please top up immediately. If the balance reaches 0, critical
                actions like OTP verification and SMS notifications will fail to
                deliver.
              </p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 p-8 shadow-sm overflow-hidden relative flex flex-col justify-center items-center text-center">
          <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center text-emerald-500 mb-6 border border-gray-100 dark:border-gray-700 shadow-sm">
            <Plus size={32} />
          </div>
          <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">
            Need More Credits?
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 max-w-[200px]">
            Instantly recharge your global wallet to keep operations running
            smoothly.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-4 rounded-2xl transition-all font-black text-lg shadow-xl shadow-emerald-600/20 uppercase tracking-widest flex items-center justify-center gap-2"
          >
            <Plus size={20} /> Top Up Wallet
          </button>
        </div>
      </div>

      {/* Transaction History Section */}
      <div className="bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-gray-100 dark:bg-gray-800 p-2.5 rounded-xl text-gray-500">
            <History size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic">
              Wallet History
            </h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
              Last 100 Transactions
            </p>
          </div>
        </div>

        <div className="overflow-x-auto overflow-hidden rounded-xl border border-gray-200 dark:border-gray-750 shadow-sm bg-white dark:bg-gray-800 mt-4">
          {historyLoading ? (
            <div className="py-12 flex items-center justify-center">
              <Loader2 className="animate-spin text-emerald-500" size={32} />
            </div>
          ) : transactions.length === 0 ? (
            <div className="py-12 text-center">
              <Clock className="mx-auto text-gray-300 mb-3" size={48} />
              <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">
                No transactions found
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[800px] text-sm">
              <thead>
                <tr className="bg-gray-50/80 dark:bg-gray-800/80">
                  <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider align-middle border border-gray-200 dark:border-gray-700 whitespace-nowrap">
                    Date & Time
                  </th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider align-middle border border-gray-200 dark:border-gray-700">
                    Type
                  </th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider align-middle border border-gray-200 dark:border-gray-700">
                    Amount
                  </th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider align-middle border border-gray-200 dark:border-gray-700">
                    Purpose
                  </th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className="group transition-colors duration-200 hover:bg-gray-50/80 dark:hover:bg-gray-750/30"
                  >
                    <td className="px-6 py-4 align-middle border border-gray-200 dark:border-gray-750">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-900 dark:text-white">
                          {new Date(tx.createdAt).toLocaleDateString()}
                        </span>
                        <span className="text-[10px] text-gray-400 font-medium">
                          {new Date(tx.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 align-middle border border-gray-200 dark:border-gray-750">
                      <div className="flex items-center gap-2">
                        {tx.type === "DEDUCTION" ? (
                          <ArrowDownCircle
                            size={14}
                            className="text-pink-500"
                          />
                        ) : (
                          <ArrowUpCircle
                            size={14}
                            className="text-emerald-500"
                          />
                        )}
                        <span
                          className={`text-[10px] font-black uppercase tracking-widest ${
                            tx.type === "DEDUCTION"
                              ? "text-pink-500"
                              : "text-emerald-500"
                          }`}
                        >
                          {tx.type}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 align-middle border border-gray-200 dark:border-gray-750">
                      <span className="text-sm font-black text-gray-900 dark:text-white">
                        {tx.type === "DEDUCTION" ? "-" : "+"}?
                        {tx.amount.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 align-middle border border-gray-200 dark:border-gray-750">
                      <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase leading-relaxed line-clamp-2">
                        {tx.note || "N/A"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Top Up Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="fixed inset-0 bg-gray-950/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 p-8 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-500/20 p-2.5 rounded-xl text-emerald-500">
                    <Wallet size={24} />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic">
                    Top Up Wallet
                  </h3>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleTopUp} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">
                    Amount (?)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full px-6 py-4 text-2xl font-black bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-600 outline-none"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[500, 1000, 5000].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setAmount(val.toString())}
                      className="py-2.5 text-xs font-black uppercase tracking-widest rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent hover:border-emerald-500 text-gray-600 dark:text-gray-400 hover:text-emerald-500 transition-all"
                    >
                      +?{val}
                    </button>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={loading || !amount}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white py-4 rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-emerald-600/20 flex items-center justify-center gap-2 mt-4"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    "Process Add Balance"
                  )}
                </button>
              </form>

              <p className="text-[10px] text-center text-gray-400 mt-6 font-bold uppercase tracking-widest">
                Safe & Secure Encrypted Transaction
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
