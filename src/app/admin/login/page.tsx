"use client";

import { useAuth } from "@/context/AuthContext";
import { API_URL } from "@/lib/config";
import { getDefaultRouteForUser } from "@/lib/admin-permissions";
import { Eye, EyeOff, Lock, Mail, ShieldCheck, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { user, login } = useAuth();
  const router = useRouter();

  // Redirect if already logged in as admin
  useEffect(() => {
    if (user?.role === "ADMIN" || user?.role === "SUPER_ADMIN") {
      router.replace(getDefaultRouteForUser(user));
    }
  }, [user, router]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.message || "Invalid credentials");

      const { user, accessToken, refreshToken } = payload.data;

      if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
        throw new Error("Unauthorized. Admin access only.");
      }

      login(accessToken, refreshToken, user);
      // Determine the best route based on permissions (not everyone has dashboard access)
      router.push(getDefaultRouteForUser(user));
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Login failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col justify-center bg-slate-50 dark:bg-slate-950 py-12 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
      {/* Decorative ambient background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-pink-600/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center mb-6">
          <div className="bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-500 p-3 rounded-xl shadow-sm border border-pink-100 dark:border-pink-500/20">
            <ShieldCheck size={28} />
          </div>
        </div>
        <h2 className="mt-2 text-center text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Admin Portal
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
          Secure access for authorized personnel
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white dark:bg-slate-900 py-8 px-4 shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] border border-slate-200/80 dark:border-slate-800 sm:rounded-2xl sm:px-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 to-pink-600" />
          {error && (
            <div className="bg-pink-50 dark:bg-pink-500/10 border border-pink-200 dark:border-pink-500/20 text-pink-600 dark:text-pink-400 px-4 py-3 rounded-lg mb-6 text-sm font-medium flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-pink-500 animate-pulse" />
              {error}
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200 mb-2">
                Email address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-pink-500 transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  placeholder="admin@femcart.com"
                  className="block w-full rounded-xl border border-gray-200 dark:border-gray-700 py-3.5 pl-11 pr-4 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-pink-500 focus:outline-none focus:ring-4 focus:ring-pink-500/10 sm:text-sm bg-gray-50/50 dark:bg-gray-900/50 transition-all duration-300"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200 mb-2">
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-pink-500 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="block w-full rounded-xl border border-gray-200 dark:border-gray-700 py-3.5 pl-11 pr-12 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-pink-500 focus:outline-none focus:ring-4 focus:ring-pink-500/10 sm:text-sm bg-gray-50/50 dark:bg-gray-900/50 transition-all duration-300"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setShowPassword((visible) => !visible)}
                  className="absolute right-3 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-pink-600 to-pink-500 text-white font-bold py-3.5 rounded-xl hover:from-pink-500 hover:to-pink-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-600 shadow-[0_8px_20px_rgba(220,38,38,0.25)] hover:shadow-[0_12px_25px_rgba(220,38,38,0.35)] transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none mt-6 text-sm flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="animate-spin" size={18} />
                  Verifying...
                </span>
              ) : (
                "Secure Login"
              )}
            </button>
          </form>
        </div>

        <div className="text-center mt-8 relative z-10">
          <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">
            &copy; 2026 Femcart Infrastructure.
          </p>
        </div>
      </div>
    </div>
  );
}
