"use client";

import { API_URL } from "@/lib/config";
import { Logger } from "@/lib/logger";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Loader2, Smartphone, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface PhoneVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  newPhone: string;
  onSuccess: () => void;
}

export default function PhoneVerificationModal({
  isOpen,
  onClose,
  newPhone,
  onSuccess,
}: PhoneVerificationModalProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(60);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    let interval: any;
    if (isOpen && resendTimer > 0) {
      interval = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen, resendTimer]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length < 6) {
      toast.error("Code must be 6 digits");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token =
        localStorage.getItem("femcart_access_token") ||
        localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/users/verify-phone-change`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newPhone, code }),
      });

      const json = await res.json();
      if (json.success) {
        toast.success("Phone number verified successfully");
        onSuccess();
        onClose();
      } else {
        const msg = json.message || "Invalid verification code";
        setError(msg);
        toast.error(msg);
        Logger.warn(
          "Phone verification failed",
          json,
          "PhoneVerificationModal",
        );
      }
    } catch (err) {
      setError("An unexpected network error occurred");
      toast.error("Network error. Please try again.");
      Logger.error("Failed to verify phone", err, "PhoneVerificationModal");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setIsResending(true);
    setError(null);
    try {
      const token =
        localStorage.getItem("femcart_access_token") ||
        localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/users/request-phone-change`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newPhone }),
      });

      const json = await res.json();
      if (json.success) {
        toast.success("Verification code resent");
        setResendTimer(60);
      } else {
        toast.error(json.message || "Failed to resend code");
        Logger.warn("Resend OTP failed", json, "PhoneVerificationModal");
      }
    } catch (err) {
      setError("Failed to resend code due to network error");
      toast.error("Network error while resending");
      Logger.error("Failed to resend OTP", err, "PhoneVerificationModal");
    } finally {
      setIsResending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-[clamp(1rem,3vw,1.5rem)] bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white dark:bg-gray-900 w-full max-w-md rounded-[clamp(1.5rem,4vw,2.5rem)] overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800"
        >
          <div className="p-[clamp(1.5rem,4vw,2rem)]">
            <div className="flex justify-between items-center mb-6">
              <div className="w-[clamp(2.5rem,6vw,3rem)] h-[clamp(2.5rem,6vw,3rem)] bg-blue-50 dark:bg-blue-900/30 rounded-[clamp(0.75rem,2vw,1rem)] flex items-center justify-center text-blue-600">
                <Smartphone size={24} />
              </div>
              <button
                onClick={onClose}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors text-gray-400"
              >
                <X size={20} />
              </button>
            </div>

            <h2 className="text-[clamp(1.25rem,4vw,1.5rem)] font-black text-gray-900 dark:text-white uppercase italic tracking-tight mb-2">
              Verify New Number
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-[clamp(0.875rem,2vw,1rem)] font-medium mb-[clamp(1.5rem,4vw,2rem)]">
              We've sent a 6-digit code to{" "}
              <span className="text-blue-600 font-bold">{newPhone}</span>.
              Please enter it below to confirm the change.
            </p>

            <form onSubmit={handleVerify} className="space-y-6">
              <div>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="Enter Code"
                  className="w-full px-[clamp(1rem,3vw,1.5rem)] py-[clamp(0.75rem,2vw,1rem)] min-h-[44px] bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-lg outline-none focus:border-blue-500 font-black text-center text-[16px] sm:text-[clamp(1.25rem,4vw,1.5rem)] tracking-[0.5em] text-gray-900 dark:text-white transition-all"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 p-4 bg-pink-50 text-pink-600 rounded-lg text-xs font-bold border border-pink-100">
                  <AlertCircle size={14} />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || code.length < 6}
                className="w-full py-[clamp(0.875rem,2vw,1rem)] min-h-[48px] bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-[clamp(1rem,3vw,1.5rem)] font-black uppercase tracking-widest text-[clamp(0.75rem,1.5vw,0.875rem)] transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  "Verify & Save"
                )}
              </button>
            </form>

            <div className="mt-[clamp(1.5rem,4vw,2rem)] text-center">
              <button
                onClick={handleResend}
                disabled={resendTimer > 0 || isResending}
                className="min-h-[44px] px-2 flex items-center justify-center mx-auto text-[clamp(0.65rem,1.5vw,0.75rem)] font-black uppercase tracking-widest text-gray-400 hover:text-blue-600 disabled:opacity-50 transition-colors"
              >
                {resendTimer > 0
                  ? `Resend Code in ${resendTimer}s`
                  : isResending
                    ? "Resending..."
                    : "Resend Code"}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
