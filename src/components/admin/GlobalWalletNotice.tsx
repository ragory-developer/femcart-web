"use client";

import { API_URL } from "@/lib/config";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, ArrowRight, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function GlobalWalletNotice() {
  const [balance, setBalance] = useState<number | null>(null);
  const [show, setShow] = useState(false);
  const router = useRouter();

  const fetchBalance = async () => {
    try {
      const token =
        localStorage.getItem("femcart_access_token") ||
        localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(`${API_URL}/api/wallet/balance`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();

      if (json.success && json.data !== null && json.data < 100) {
        setBalance(json.data);
        setShow(true);
      }
    } catch (e) {
      console.error("Failed to check wallet balance for notice", e);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.4, type: "spring", bounce: 0.3 }}
          className="fixed bottom-6 right-6 z-50 w-full max-w-sm"
        >
          <div className="bg-pink-50 dark:bg-rose-950/80 backdrop-blur-xl border-l-4 border-rose-500 rounded-lg shadow-2xl p-5 border-y border-r border-rose-100 dark:border-rose-900/50">
            <div className="flex items-start justify-between absolute right-3 top-3">
              <button
                onClick={() => setShow(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex gap-4">
              <div className="p-2.5 bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl shrink-0 h-fit">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h4 className="text-base font-black text-rose-800 dark:text-rose-300 tracking-tight uppercase leading-none mb-1.5 pt-1">
                  Critical Low Balance
                </h4>
                <p className="text-sm font-medium text-rose-600 dark:text-rose-400/80 mb-3">
                  Your wallet is currently at{" "}
                  <span className="font-bold underline">
                    Tk {balance?.toLocaleString()}
                  </span>
                  . If it drops to 0, SMS verification and global notifications
                  will completely halt!
                </p>
                <button
                  onClick={() => {
                    setShow(false);
                    router.push("/admin/settings");
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-white bg-rose-500 hover:bg-rose-600 px-4 py-2 rounded-lg transition-colors shadow-lg shadow-rose-500/20"
                >
                  Top Up Now <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
