"use client";

import SearchableDropdown from "@/components/ui/SearchableDropdown";
import { API_URL } from "@/lib/config";
import { useAuthStore } from "@/store/authStore";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  ChevronRight,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  Map,
  MapPin,
  Navigation,
  Phone,
  User,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/* --- Types ----------------------------------------------- */
type Step = 1 | 2 | 3 | 4;

interface LocationItem {
  id: string;
  name: string;
}

/* --- Step Indicator --------------------------------------- */
const STEPS = [
  { label: "Phone", icon: Phone },
  { label: "Verify", icon: KeyRound },
  { label: "Profile", icon: User },
  { label: "Address", icon: MapPin },
];

function StepIndicator({ current }: { current: Step }) {
  return (
    <div className="flex items-center justify-center mb-10 select-none">
      {STEPS.map((s, i) => {
        const num = (i + 1) as Step;
        const done = current > num;
        const active = current === num;
        const Icon = s.icon;
        return (
          <div key={num} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-md
                  ${done ? "bg-emerald-500 text-white shadow-emerald-200 dark:shadow-emerald-900/40 scale-95" : ""}
                  ${active ? "bg-blue-600 text-white shadow-blue-200 dark:shadow-blue-900/50 scale-110 ring-4 ring-blue-100 dark:ring-blue-900/40" : ""}
                  ${!done && !active ? "bg-gray-100 dark:bg-gray-800 text-gray-400" : ""}
                `}
              >
                {done ? <CheckCircle2 size={18} /> : <Icon size={16} />}
              </div>
              <span
                className={`text-[10px] font-black uppercase tracking-widest transition-colors
                ${active ? "text-blue-600" : done ? "text-emerald-500" : "text-gray-400"}`}
              >
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`w-12 sm:w-16 h-0.5 mx-1 mb-5 rounded-full transition-all duration-500
                ${done ? "bg-emerald-400" : "bg-gray-200 dark:bg-gray-700"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* --- Shared input style ----------------------------------- */
const inputCls = (icon = true) =>
  "block w-full rounded-xl border border-gray-200 dark:border-gray-700 py-3.5 pl-11 pr-4 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-pink-500 focus:outline-none focus:ring-4 focus:ring-pink-500/10 sm:text-sm bg-gray-50/50 dark:bg-gray-900/50 transition-all duration-300";
const btnCls =
  "w-full bg-gradient-to-r from-pink-600 to-pink-500 text-white font-bold py-3.5 rounded-xl hover:from-pink-500 hover:to-pink-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-600 shadow-[0_8px_20px_rgba(220,38,38,0.25)] hover:shadow-[0_12px_25px_rgba(220,38,38,0.35)] transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none text-sm flex items-center justify-center gap-2";

/* --- Main Page -------------------------------------------- */
export default function RegisterPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();

  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 1 & 2 data
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [isRegistered, setIsRegistered] = useState(false); // already has a full account

  // Step 2: temp tokens (from verifyOtp)
  const [tempToken, setTempToken] = useState("");

  // Step 3 data
  const [name, setName] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  // Step 4 — location data
  const [states, setStates] = useState<LocationItem[]>([]);
  const [cities, setCities] = useState<LocationItem[]>([]);
  const [areas, setAreas] = useState<LocationItem[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingAreas, setLoadingAreas] = useState(false);
  const [addrForm, setAddrForm] = useState({
    label: "Home",
    stateId: "",
    state: "",
    cityId: "",
    city: "",
    areaId: "",
    area: "",
    address: "",
    recipientName: "",
    recipientPhone: "",
  });

  /* --- Countdown timer --- */
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  /* --- Fetch states once --- */
  useEffect(() => {
    fetch(`${API_URL}/api/locations/states`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setStates(d.data);
      })
      .catch(() => {});
  }, []);

  const fetchCities = async (stateId: string) => {
    if (!stateId) {
      setCities([]);
      setAreas([]);
      return;
    }
    setLoadingCities(true);
    try {
      const res = await fetch(
        `${API_URL}/api/locations/cities?stateId=${stateId}`,
      );
      const d = await res.json();
      if (d.success) setCities(d.data);
    } finally {
      setLoadingCities(false);
    }
    setAreas([]);
    setAddrForm((f) => ({ ...f, cityId: "", city: "", areaId: "", area: "" }));
  };

  const fetchAreas = async (cityId: string) => {
    if (!cityId) {
      setAreas([]);
      return;
    }
    setLoadingAreas(true);
    try {
      const res = await fetch(
        `${API_URL}/api/locations/areas?cityId=${cityId}`,
      );
      const d = await res.json();
      if (d.success) setAreas(d.data);
    } finally {
      setLoadingAreas(false);
    }
    setAddrForm((f) => ({ ...f, areaId: "", area: "" }));
  };

  /* --------------------------------------
   * STEP 1 — Send OTP
   * -------------------------------------- */
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phoneNumber }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || "Failed to send OTP.");
        return;
      }
      if (data.data?.isRegistered) {
        // Full account already exists — redirect to login
        setIsRegistered(true);
        return;
      }
      setCountdown(60);
      setStep(2);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* --------------------------------------
   * STEP 2 — Verify OTP
   * -------------------------------------- */
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phoneNumber, code: otp }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || "Invalid OTP code.");
        return;
      }
      // Store temp token to use for address saving later
      setTempToken(data.data.accessToken);
      localStorage.setItem("femcart_access_token", data.data.accessToken);
      localStorage.setItem("femcart_refresh_token", data.data.refreshToken);
      localStorage.setItem("token", data.data.accessToken);
      setOtp("");
      setStep(3);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* --------------------------------------
   * STEP 3 — Complete profile
   * -------------------------------------- */
  const handleCompleteProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/complete-registration`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phoneNumber,
          name,
          email: emailAddress || undefined,
          password,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || "Failed to save profile.");
        return;
      }
      // Update stored tokens with fresh ones
      localStorage.setItem("femcart_access_token", data.data.accessToken);
      localStorage.setItem("femcart_refresh_token", data.data.refreshToken);
      localStorage.setItem("token", data.data.accessToken);
      localStorage.setItem("user", JSON.stringify(data.data.user));
      setTempToken(data.data.accessToken);
      setAddrForm((f) => ({
        ...f,
        recipientName: name,
        recipientPhone: phoneNumber,
      }));
      setStep(4);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* --------------------------------------
   * STEP 4 — Save address
   * -------------------------------------- */
  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !addrForm.stateId ||
      !addrForm.cityId ||
      !addrForm.areaId ||
      !addrForm.address.trim()
    ) {
      setError("Please fill in all address fields.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const token =
        tempToken ||
        localStorage.getItem("femcart_access_token") ||
        localStorage.getItem("token") ||
        "";
      const res = await fetch(`${API_URL}/api/users/addresses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(addrForm),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || "Failed to save address.");
        return;
      }
      // Load the user object and finalize auth
      let storedUser = null;
      try {
        const userStr = localStorage.getItem("user");
        if (userStr && userStr !== "undefined") {
          storedUser = JSON.parse(userStr);
        }
      } catch (e) {
        console.error("Failed to parse user in register page", e);
      }
      if (storedUser) setUser(storedUser);
      // Clear tokens — user must log in freshly
      localStorage.removeItem("femcart_access_token");
      localStorage.removeItem("femcart_refresh_token");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      router.push("/login?registered=1");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* --- "Already registered" modal --- */
  if (isRegistered) {
    return (
      <div className="container mx-auto px-4 py-24 flex items-center justify-center min-h-[80vh]">
        <div className="bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-[2.5rem] p-10 shadow-2xl max-w-md w-full text-center">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/40 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Phone size={28} className="text-blue-600" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic mb-3">
            Phone Number Already Registered
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-8">
            <span className="font-bold text-gray-800 dark:text-gray-200">
              {phoneNumber}
            </span>{" "}
            is already linked to an account. Please log in instead.
          </p>
          <div className="space-y-3">
            <Link
              href="/login"
              className="flex items-center justify-center w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black uppercase tracking-wide transition-all"
            >
              Go to Login
            </Link>
            <button
              onClick={() => {
                setIsRegistered(false);
                setPhoneNumber("");
              }}
              className="w-full py-3.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold transition-all"
            >
              Use Different Phone Number
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] flex flex-col justify-center bg-slate-50 dark:bg-slate-950 py-12 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
      {/* Decorative ambient background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-pink-600/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Link href="/" className="flex justify-center mb-6 group">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-1 group-hover:scale-[1.02] transition-transform origin-center">
            Femcart
          </h1>
        </Link>
        <h2 className="mt-2 text-center text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Create an account
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
          Join Femcart — takes less than 2 minutes.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white dark:bg-slate-900 py-8 px-4 shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] border border-slate-200/80 dark:border-slate-800 sm:rounded-2xl sm:px-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 to-pink-600" />
          <div className="mb-6">
            <StepIndicator current={step} />
          </div>

          {/* Error */}
          {error && (
            <div className="bg-pink-50 dark:bg-pink-500/10 border border-pink-200 dark:border-pink-500/20 text-pink-600 dark:text-pink-400 px-4 py-3 rounded-lg mb-6 text-sm font-medium flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-pink-500 animate-pulse min-w-[8px]" />
              {error}
            </div>
          )}

          {/* --- STEP 1: Phone --- */}
          {step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div>
                <label
                  htmlFor="regEmail"
                  className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200 mb-2"
                >
                  Phone Number
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-pink-500 transition-colors">
                    <Phone size={18} />
                  </div>
                  <input
                    id="regEmail"
                    type="tel"
                    required
                    placeholder="01XXXXXXXXX"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className={inputCls()}
                  />
                </div>
              </div>
              <button
                id="reg-send-otp-btn"
                type="submit"
                disabled={
                  loading ||
                  phoneNumber.length < 11 ||
                  !phoneNumber.startsWith("01")
                }
                className={btnCls}
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <>
                    Send verification code <ChevronRight size={16} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* --- STEP 2: OTP --- */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor="regOtp"
                    className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200"
                  >
                    6-Digit Code
                  </label>
                  <span className="text-xs text-gray-500">
                    Sent to{" "}
                    <strong className="text-gray-900 dark:text-gray-200 font-medium">
                      {phoneNumber}
                    </strong>
                  </span>
                </div>
                <div className="relative group">
                  <KeyRound
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-pink-500 transition-colors"
                    size={18}
                  />
                  <input
                    id="regOtp"
                    type="text"
                    inputMode="numeric"
                    required
                    maxLength={6}
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    className={inputCls()}
                  />
                </div>
              </div>

              {/* Resend */}
              <div className="text-center text-sm">
                {countdown > 0 ? (
                  <span className="text-gray-400">
                    Resend code in{" "}
                    <strong className="text-blue-600">{countdown}s</strong>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setOtp("");
                      setStep(1);
                    }}
                    className="text-blue-600 font-bold hover:underline"
                  >
                    Resend OTP
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setError("");
                  }}
                  className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold transition-all hover:bg-gray-200 dark:hover:bg-gray-700 text-sm shadow-sm"
                >
                  <ArrowLeft size={16} /> Back
                </button>
                <button
                  id="reg-verify-otp-btn"
                  type="submit"
                  disabled={loading || otp.length < 6}
                  className={btnCls}
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <>
                      <CheckCircle2 size={18} /> Verify Code
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* --- STEP 3: Profile --- */}
          {step === 3 && (
            <form onSubmit={handleCompleteProfile} className="space-y-4">
              <div>
                <label
                  htmlFor="regName"
                  className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200 mb-2"
                >
                  Full Name
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-pink-500 transition-colors">
                    <User size={18} />
                  </div>
                  <input
                    id="regName"
                    type="text"
                    required
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={inputCls()}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="regPhone"
                  className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200 mb-2"
                >
                  Email Address (Optional)
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-pink-500 transition-colors">
                    <Mail size={18} />
                  </div>
                  <input
                    id="regPhone"
                    type="email"
                    placeholder="name@example.com"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    className={inputCls(true)}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="regPassword"
                  className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200 mb-2"
                >
                  Create Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Lock size={18} />
                  </div>
                  <input
                    id="regPassword"
                    type={showPass ? "text" : "password"}
                    required
                    placeholder="Min. 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputCls(true)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none"
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  id="reg-profile-btn"
                  type="submit"
                  disabled={loading || !name.trim() || password.length < 6}
                  className="w-full bg-pink-600 text-white font-semibold py-2.5 rounded-lg hover:bg-pink-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-600 shadow-sm transition-all duration-200 disabled:opacity-50 mt-6 text-sm flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <>
                      Continue <ChevronRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* --- STEP 4: Address --- */}
          {step === 4 && (
            <form onSubmit={handleSaveAddress} className="space-y-4">
              <p className="text-xs text-gray-400 font-medium -mt-2 mb-4">
                <MapPin size={12} className="inline mr-1" />
                Where should we deliver your orders?
              </p>

              {/* Recipient name + phone */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 pl-1">
                    Recipient Name
                  </label>
                  <div className="relative">
                    <User
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                      size={16}
                    />
                    <input
                      type="text"
                      required
                      placeholder="Full name"
                      value={addrForm.recipientName}
                      onChange={(e) =>
                        setAddrForm((f) => ({
                          ...f,
                          recipientName: e.target.value,
                        }))
                      }
                      className={inputCls()}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 pl-1">
                    Mobile
                  </label>
                  <div className="relative">
                    <Phone
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                      size={16}
                    />
                    <input
                      type="tel"
                      required
                      placeholder="01XXXXXXXXX"
                      value={addrForm.recipientPhone}
                      onChange={(e) =>
                        setAddrForm((f) => ({
                          ...f,
                          recipientPhone: e.target.value,
                        }))
                      }
                      className={inputCls()}
                    />
                  </div>
                </div>
              </div>

              {/* Division + Label */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 pl-1">
                    <Building2 size={10} className="inline mr-1" />
                    Division
                  </label>
                  <SearchableDropdown
                    value={addrForm.stateId}
                    onChange={(v) => {
                      const s = states.find((st) => st.id === v);
                      setAddrForm((f) => ({
                        ...f,
                        stateId: v,
                        state: s?.name || "",
                      }));
                      fetchCities(v);
                    }}
                    options={states.map((s) => ({
                      value: s.id,
                      label: s.name,
                    }))}
                    placeholder="Select..."
                    searchPlaceholder="Search division..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 pl-1">
                    Label
                  </label>
                  <select
                    value={addrForm.label}
                    onChange={(e) =>
                      setAddrForm((f) => ({ ...f, label: e.target.value }))
                    }
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-sm"
                  >
                    <option value="Home">?? Home</option>
                    <option value="Work">?? Work</option>
                    <option value="Other">?? Other</option>
                  </select>
                </div>
              </div>

              {/* City + Area */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 pl-1">
                    <Map size={10} className="inline mr-1" />
                    City / District
                  </label>
                  {loadingCities ? (
                    <div className="flex items-center gap-2 py-3.5 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-400 text-sm">
                      <Loader2 size={14} className="animate-spin" /> Loading...
                    </div>
                  ) : (
                    <SearchableDropdown
                      value={addrForm.cityId}
                      onChange={(v) => {
                        const c = cities.find((ct) => ct.id === v);
                        setAddrForm((f) => ({
                          ...f,
                          cityId: v,
                          city: c?.name || "",
                        }));
                        fetchAreas(v);
                      }}
                      options={cities.map((c) => ({
                        value: c.id,
                        label: c.name,
                      }))}
                      placeholder={
                        !addrForm.stateId ? "Division first" : "Select..."
                      }
                      searchPlaceholder="Search city..."
                      disabled={!addrForm.stateId}
                    />
                  )}
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 pl-1">
                    <Navigation size={10} className="inline mr-1" />
                    Area / Upazila
                  </label>
                  {loadingAreas ? (
                    <div className="flex items-center gap-2 py-3.5 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-400 text-sm">
                      <Loader2 size={14} className="animate-spin" /> Loading...
                    </div>
                  ) : (
                    <SearchableDropdown
                      value={addrForm.areaId}
                      onChange={(v) => {
                        const a = areas.find((ar) => ar.id === v);
                        setAddrForm((f) => ({
                          ...f,
                          areaId: v,
                          area: a?.name || "",
                        }));
                      }}
                      options={areas.map((a) => ({
                        value: a.id,
                        label: a.name,
                      }))}
                      placeholder={
                        !addrForm.cityId ? "City first" : "Select..."
                      }
                      searchPlaceholder="Search area..."
                      disabled={!addrForm.cityId}
                    />
                  )}
                </div>
              </div>

              {/* Street address */}
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 pl-1">
                  Street Address
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="House no., road, building, floor..."
                  value={addrForm.address}
                  onChange={(e) =>
                    setAddrForm((f) => ({ ...f, address: e.target.value }))
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-sm resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  id="reg-address-btn"
                  type="submit"
                  disabled={
                    loading ||
                    !addrForm.stateId ||
                    !addrForm.cityId ||
                    !addrForm.areaId ||
                    !addrForm.address.trim()
                  }
                  className="w-full bg-pink-600 text-white font-semibold py-2.5 rounded-lg hover:bg-pink-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-600 shadow-sm transition-all duration-200 disabled:opacity-50 mt-6 text-sm flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <>
                      <CheckCircle2 size={16} /> Complete Registration
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Footer link */}
          <div className="mt-8 text-center border-t border-slate-200/80 dark:border-slate-800 pt-6 relative z-10">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-pink-600 dark:text-pink-400 hover:text-pink-500 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
