"use client";

import UserSidebar from "@/components/dashboard/UserSidebar";
import { useAuth } from "@/context/AuthContext";
import { API_URL } from "@/lib/config";
import {
  Loader2,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  ShieldCheck,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface WalletData {
  balance: number;
  rewardPoints: number;
  transactions: Array<{
    id: string;
    amount: number;
    type: string;
    status: string;
    note?: string;
    createdAt: string;
  }>;
}

export default function WalletPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.replace("/login?redirect=/profile/wallet");
      } else if (user.isGuest) {
        router.replace("/profile");
      }
    }
  }, [user, authLoading, router]);

  const fetchWallet = async () => {
    try {
      const token =
        localStorage.getItem("femcart_access_token") ||
        localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/users/wallet`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (error) {
      console.error("Failed to fetch wallet", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchWallet();
    }
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  if (!user || !data) return null;

  return (
    <div className="bg-[#f8fafc] dark:bg-gray-950 min-h-[100dvh] py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="w-full lg:w-80 shrink-0">
            <UserSidebar />
          </aside>

          <main className="flex-grow">
            <div className="mb-8">
              <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter uppercase italic flex items-center gap-3">
                <Wallet className="text-blue-500" size={32} /> Wallet & Rewards
              </h1>
              <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">
                Manage your store credit and reward points
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Wallet Balance Card */}
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 dark:from-blue-900 dark:to-gray-900 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 -mr-8 -mt-8 w-48 h-48 bg-white/5 rounded-full blur-2xl"></div>
                <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 bg-blue-500/20 rounded-full blur-xl"></div>

                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <p className="text-gray-300 font-bold uppercase tracking-widest text-xs mb-1">
                        Available Balance
                      </p>
                      <h2 className="text-4xl sm:text-5xl font-black tracking-tighter">
                        ?{data.balance.toLocaleString()}
                      </h2>
                    </div>
                    <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl">
                      <CreditCard size={24} className="text-white" />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button className="flex-1 bg-white text-gray-900 py-3 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-gray-100 transition-colors shadow-lg">
                      Top Up
                    </button>
                    <button className="flex-1 bg-white/10 hover:bg-white/20 text-white backdrop-blur-md py-3 rounded-xl font-black uppercase tracking-widest text-xs border border-white/10 transition-colors">
                      Withdraw
                    </button>
                  </div>
                </div>
              </div>

              {/* Reward Points Card */}
              <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-xl shadow-orange-500/20">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>

                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <p className="text-orange-100 font-bold uppercase tracking-widest text-xs mb-1">
                        Reward Points
                      </p>
                      <h2 className="text-4xl sm:text-5xl font-black tracking-tighter">
                        {data.rewardPoints.toLocaleString()}{" "}
                        <span className="text-xl">PTS</span>
                      </h2>
                    </div>
                    <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
                      <ShieldCheck size={24} className="text-white" />
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-orange-50 mb-3 bg-black/20 p-3 rounded-xl inline-block">
                      100 Points = ?1 Store Credit
                    </p>
                    <button
                      disabled={data.rewardPoints < 100}
                      className="w-full bg-white text-orange-600 py-3 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-gray-50 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Convert to Balance
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Transactions History */}
            <div className="bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                <h3 className="text-xl font-black uppercase italic tracking-tighter">
                  Transaction History
                </h3>
              </div>

              {data.transactions.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Wallet className="text-gray-400" size={24} />
                  </div>
                  <p className="text-gray-500 font-medium">
                    No transactions found.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50 dark:divide-gray-800/50">
                  {data.transactions.map((tx) => {
                    const isCredit = tx.amount > 0;
                    return (
                      <div
                        key={tx.id}
                        className="p-4 sm:p-6 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                              isCredit
                                ? "bg-green-50 text-green-600 dark:bg-green-900/20"
                                : "bg-pink-50 text-pink-600 dark:bg-pink-900/20"
                            }`}
                          >
                            {isCredit ? (
                              <ArrowDownRight size={20} />
                            ) : (
                              <ArrowUpRight size={20} />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white">
                              {tx.type}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(tx.createdAt).toLocaleDateString(
                                "en-GB",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </p>
                            {tx.note && (
                              <p className="text-sm text-gray-500 mt-0.5">
                                {tx.note}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p
                            className={`font-black text-lg ${isCredit ? "text-green-600" : "text-gray-900 dark:text-white"}`}
                          >
                            {isCredit ? "+" : ""}?
                            {Math.abs(tx.amount).toLocaleString()}
                          </p>
                          <span
                            className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md ${
                              tx.status === "COMPLETED"
                                ? "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {tx.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
