"use client";
import { API_URL } from "@/lib/config";
import { showToast } from "@/lib/toast";
import { useSettingsStore } from "@/store/settingsStore";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Clock,
  DollarSign,
  ExternalLink,
  HelpCircle,
  Image as ImageIcon,
  LayoutDashboard,
  Loader2,
  Megaphone,
  Pause,
  Play,
  PlusCircle,
  RefreshCw,
  Save,
  Settings,
  Target,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function FacebookManagerPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { setSettings: updateStore } = useSettingsStore();

  // Mock data for Dashboard & Campaigns until Backend is ready
  const [campaigns, setCampaigns] = useState<any[]>([
    {
      id: "1",
      name: "Spring Sale 2026 - Conversions",
      status: "ACTIVE",
      spend: 145.2,
      impressions: 12400,
      clicks: 850,
      purchases: 12,
      revenue: 464.64,
      roas: 3.2,
    },
    {
      id: "2",
      name: "Fresh Produce Retargeting",
      status: "PAUSED",
      spend: 50.0,
      impressions: 5000,
      clicks: 320,
      purchases: 4,
      revenue: 105.0,
      roas: 2.1,
    },
  ]);
  const [analytics, setAnalytics] = useState({
    spend: 195.2,
    impressions: 17400,
    clicks: 1170,
    purchases: 16,
    roas: 2.8,
    revenue: 546.56,
    cpa: 12.2,
  });

  const [accountHealth, setAccountHealth] = useState<any>({
    account_status: "ACTIVE",
    disable_reason: 0,
    amount_spent: "0.00",
    spend_cap: "No Limit",
    token_expiry_days: 60,
    api_limit_usage_percent: 5,
  });

  // Create Ad Form State
  const [adForm, setAdForm] = useState({
    productId: "",
    objective: "CONVERSIONS",
    placement: "AUTO",
    adText:
      "Check out our amazing products! Fresh and delivered directly to your door.",
    headline: "Fresh Groceries Delivered",
    dailyBudget: 10,
    ageMin: 18,
    ageMax: 65,
  });
  const [creatingAd, setCreatingAd] = useState(false);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    fetchSettings();
    fetchProducts();
    fetchAnalytics();
    fetchCampaigns();
    fetchHealth();
  }, []);

  const fetchHealth = async () => {
    try {
      const token =
        localStorage.getItem("femcart_access_token") ||
        localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/facebook-ads/health`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success && json.data) {
        setAccountHealth(json.data);
      }
    } catch (e) {
      console.error("Failed to fetch account health:", e);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const token =
        localStorage.getItem("femcart_access_token") ||
        localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/facebook-ads/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success && json.data) {
        setAnalytics(json.data);
      }
    } catch (e) {
      console.error("Failed to fetch analytics:", e);
    }
  };

  const fetchCampaigns = async () => {
    try {
      const token =
        localStorage.getItem("femcart_access_token") ||
        localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/facebook-ads/campaigns`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success && json.data) {
        setCampaigns(json.data);
      }
    } catch (e) {
      console.error("Failed to fetch campaigns:", e);
    }
  };

  const fetchSettings = async () => {
    try {
      const token =
        localStorage.getItem("femcart_access_token") ||
        localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/global-settings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) setSettings(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_URL}/api/products?limit=50`);
      const json = await res.json();
      if (json.success) setProducts(json.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const token =
        localStorage.getItem("femcart_access_token") ||
        localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/global-settings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ settings }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        updateStore(settings);
        showToast.success("Facebook settings saved successfully!");
      } else {
        showToast.error(json.message || "Failed to save settings");
      }
    } catch (e) {
      console.error(e);
      showToast.error("Network error: Could not save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateAd = async () => {
    if (!adForm.productId) return showToast.error("Please select a product");
    setCreatingAd(true);
    try {
      const token =
        localStorage.getItem("femcart_access_token") ||
        localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/facebook-ads/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(adForm),
      });
      const json = await res.json();
      if (json.success) {
        showToast.success("Ad Campaign launched successfully!");
        setActiveTab("dashboard");
      } else {
        showToast.error(
          json.message ||
            "Failed to launch ad. Check your connection settings.",
        );
      }
    } catch (e) {
      console.error(e);
      showToast.error("Network error while creating ad.");
    } finally {
      setCreatingAd(false);
    }
  };

  const toggleCampaign = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "ACTIVE" ? "PAUSED" : "ACTIVE";
    setCampaigns((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c)),
    );
    showToast.success(`Campaign ${newStatus.toLowerCase()}`);
    // Backend integration will go here
  };

  const handleChange = (key: string, value: string) => {
    setSettings((prev: any) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-blue-500" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-900 p-8 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-2">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-2xl text-white shadow-lg shadow-blue-500/20">
              <Megaphone size={28} />
            </div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              Facebook Ads Manager
            </h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium ml-16 max-w-xl">
            Launch ads, track analytics, and optimize your Meta campaigns
            directly from your e-commerce dashboard.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900/50 p-2 rounded-2xl border border-gray-100 dark:border-gray-800 w-fit">
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === "dashboard" ? "bg-white dark:bg-gray-800 text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-900 dark:hover:text-white"}`}
        >
          <LayoutDashboard size={18} /> Dashboard & Campaigns
        </button>
        <button
          onClick={() => setActiveTab("create")}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === "create" ? "bg-white dark:bg-gray-800 text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-900 dark:hover:text-white"}`}
        >
          <PlusCircle size={18} /> Create Ad
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === "settings" ? "bg-white dark:bg-gray-800 text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-900 dark:hover:text-white"}`}
        >
          <Settings size={18} /> Connection Settings
        </button>
      </div>

      {/* --- TAB: DASHBOARD --- */}
      {activeTab === "dashboard" && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {!settings.facebook_user_access_token && (
            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-2xl p-6 flex items-start gap-4">
              <AlertTriangle
                className="text-amber-500 shrink-0 mt-1"
                size={24}
              />
              <div>
                <h3 className="text-lg font-bold text-amber-900 dark:text-amber-400">
                  Ad Account Not Connected
                </h3>
                <p className="text-amber-700 dark:text-amber-500 mt-1">
                  You must connect your Facebook account in the Settings tab to
                  fetch live data.
                </p>
                <button
                  onClick={() => setActiveTab("settings")}
                  className="mt-3 px-4 py-2 bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-400 font-bold rounded-lg text-sm hover:bg-amber-200 dark:hover:bg-amber-900/60 transition-colors"
                >
                  Go to Settings
                </button>
              </div>
            </div>
          )}

          {/* Account Health Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div
              className={`p-5 rounded-2xl border flex items-center gap-4 ${accountHealth.account_status === "ACTIVE" ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/10 dark:border-emerald-900/30" : "bg-pink-50 border-pink-200 dark:bg-pink-900/10 dark:border-pink-900/30"}`}
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${accountHealth.account_status === "ACTIVE" ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400" : "bg-pink-100 text-pink-600 dark:bg-pink-900/40 dark:text-pink-400"}`}
              >
                {accountHealth.account_status === "ACTIVE" ? (
                  <CheckCircle2 size={24} />
                ) : (
                  <AlertTriangle size={24} />
                )}
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
                  Ad Account Status
                </p>
                <div
                  className={`text-lg font-black ${accountHealth.account_status === "ACTIVE" ? "text-emerald-700 dark:text-emerald-400" : "text-pink-700 dark:text-pink-400"}`}
                >
                  {accountHealth.account_status}
                </div>
              </div>
            </div>

            <div className="p-5 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Clock size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
                  Connection Health
                </p>
                <div className="text-lg font-black text-gray-900 dark:text-white">
                  {accountHealth.token_expiry_days} Days Safe
                </div>
                <p className="text-[10px] text-gray-400 font-medium leading-tight mt-1">
                  You won't need to re-login for{" "}
                  {accountHealth.token_expiry_days} days.
                </p>
              </div>
            </div>

            <div className="p-5 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <Activity size={24} />
              </div>
              <div className="w-full">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                    Facebook System Load
                  </p>
                  <div className="group relative">
                    <HelpCircle
                      size={14}
                      className="text-gray-400 cursor-help"
                    />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs rounded-xl shadow-xl z-50 font-medium">
                      Shows how heavily you are using the Facebook API. If this
                      bar turns red, wait a few minutes before creating new ads.
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-gray-100 dark:bg-gray-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-1000 ${accountHealth.api_limit_usage_percent > 80 ? "bg-pink-500" : "bg-indigo-500"}`}
                      style={{
                        width: `${accountHealth.api_limit_usage_percent}%`,
                      }}
                    ></div>
                  </div>
                  <span className="font-bold text-sm text-gray-900 dark:text-white">
                    {accountHealth.api_limit_usage_percent}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-900 rounded-[1.5rem] p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
              <div className="flex items-center gap-3 text-gray-500 mb-4">
                <div className="p-2 bg-gray-50 dark:bg-gray-800 text-gray-600 rounded-lg">
                  <Activity size={20} />
                </div>
                <span className="font-bold text-sm uppercase tracking-wider">
                  Total Spend
                </span>
              </div>
              <div className="text-3xl font-black text-gray-900 dark:text-white">
                ${analytics.spend.toFixed(2)}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-[1.5rem] p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
              <div className="flex items-center gap-3 text-gray-500 mb-4">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-lg">
                  <DollarSign size={20} />
                </div>
                <span className="font-bold text-sm uppercase tracking-wider">
                  Total Sold Amount
                </span>
              </div>
              <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                ${analytics.revenue.toFixed(2)}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-[1.5rem] p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
              <div className="flex items-center gap-3 text-gray-500 mb-4">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-lg">
                  <BarChart3 size={20} />
                </div>
                <span className="font-bold text-sm uppercase tracking-wider">
                  Total Sold (Volume)
                </span>
              </div>
              <div className="text-3xl font-black text-gray-900 dark:text-white">
                {analytics.purchases}
              </div>
            </div>
          </div>

          {/* Campaigns Table */}
          <div className="bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <h2 className="text-xl font-black text-gray-900 dark:text-white">
                Active Campaigns
              </h2>
              <button className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-xl transition-colors">
                <RefreshCw size={16} /> Refresh Data
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider font-bold">
                    <th className="p-4 pl-6">Status</th>
                    <th className="p-4">Campaign Name</th>
                    <th className="p-4">Spend</th>
                    <th className="p-4">Impressions</th>
                    <th className="p-4">Clicks</th>
                    <th className="p-4">Purchases</th>
                    <th className="p-4">Sold Amount</th>
                    <th className="p-4 pr-6 text-right">ROAS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {campaigns.map((c) => (
                    <tr
                      key={c.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                    >
                      <td className="p-4 pl-6">
                        <button
                          onClick={() => toggleCampaign(c.id, c.status)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${c.status === "ACTIVE" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                        >
                          {c.status === "ACTIVE" ? (
                            <Play size={12} className="fill-current" />
                          ) : (
                            <Pause size={12} className="fill-current" />
                          )}
                          {c.status}
                        </button>
                      </td>
                      <td className="p-4 font-bold text-gray-900 dark:text-white">
                        {c.name}
                      </td>
                      <td className="p-4 text-gray-600 dark:text-gray-300 font-medium">
                        ${c.spend.toFixed(2)}
                      </td>
                      <td className="p-4 text-gray-600 dark:text-gray-300">
                        {c.impressions.toLocaleString()}
                      </td>
                      <td className="p-4 text-gray-600 dark:text-gray-300">
                        {c.clicks.toLocaleString()}
                      </td>
                      <td className="p-4 font-bold text-gray-900 dark:text-white">
                        {c.purchases}
                      </td>
                      <td className="p-4 font-bold text-emerald-600 dark:text-emerald-400">
                        ${c.revenue?.toFixed(2) || "0.00"}
                      </td>
                      <td className="p-4 pr-6 text-right font-black text-indigo-600 dark:text-indigo-400">
                        {c.roas}x
                      </td>
                    </tr>
                  ))}
                  {campaigns.length === 0 && (
                    <tr>
                      <td
                        colSpan={8}
                        className="p-12 text-center text-gray-500 font-medium"
                      >
                        No campaigns found. Create your first ad!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB: CREATE AD --- */}
      {activeTab === "create" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm p-8 space-y-6">
            <div>
              <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                <Target className="text-blue-500" size={24} /> Ad Creator Studio
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Easily launch Dynamic Product Ads to drive sales.
              </p>
            </div>

            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">
                  Select Product
                </label>
                <select
                  value={adForm.productId}
                  onChange={(e) =>
                    setAdForm({ ...adForm, productId: e.target.value })
                  }
                  className="w-full px-5 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-900 dark:text-white"
                >
                  <option value="">-- Choose a product to advertise --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} - Tk {p.price}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">
                    What is your goal?
                  </label>
                  <select
                    value={adForm.objective}
                    onChange={(e) =>
                      setAdForm({ ...adForm, objective: e.target.value })
                    }
                    className="w-full px-5 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-900 dark:text-white"
                  >
                    <option value="CONVERSIONS">??? Get More Sales</option>
                    <option value="TRAFFIC">
                      ??? Get More Website Visitors
                    </option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">
                    Where to show ad?
                  </label>
                  <select
                    value={adForm.placement}
                    onChange={(e) =>
                      setAdForm({ ...adForm, placement: e.target.value })
                    }
                    className="w-full px-5 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-900 dark:text-white"
                  >
                    <option value="AUTO">? Everywhere (Recommended)</option>
                    <option value="FB">?? Facebook Only</option>
                    <option value="IG">?? Instagram Only</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">
                  Primary Text
                </label>
                <textarea
                  value={adForm.adText}
                  onChange={(e) =>
                    setAdForm({ ...adForm, adText: e.target.value })
                  }
                  rows={3}
                  className="w-full px-5 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-900 dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">
                  Headline
                </label>
                <input
                  type="text"
                  value={adForm.headline}
                  onChange={(e) =>
                    setAdForm({ ...adForm, headline: e.target.value })
                  }
                  className="w-full px-5 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">
                    Daily Budget ($)
                  </label>
                  <input
                    type="number"
                    min="5"
                    value={adForm.dailyBudget}
                    onChange={(e) =>
                      setAdForm({
                        ...adForm,
                        dailyBudget: Number(e.target.value),
                      })
                    }
                    className="w-full px-5 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-900 dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">
                    Age Targeting
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={adForm.ageMin}
                      onChange={(e) =>
                        setAdForm({ ...adForm, ageMin: Number(e.target.value) })
                      }
                      className="w-full px-3 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none text-center font-medium"
                    />
                    <span className="text-gray-400 font-bold">-</span>
                    <input
                      type="number"
                      value={adForm.ageMax}
                      onChange={(e) =>
                        setAdForm({ ...adForm, ageMax: Number(e.target.value) })
                      }
                      className="w-full px-3 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none text-center font-medium"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleCreateAd}
                disabled={creatingAd || !settings.facebook_user_access_token}
                className="w-full mt-4 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl font-black text-lg transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 disabled:opacity-50"
              >
                {creatingAd ? (
                  <Loader2 className="animate-spin" size={24} />
                ) : (
                  <Zap size={24} className="fill-white" />
                )}
                {creatingAd ? "Launching Campaign..." : "Launch Ad Campaign"}
              </button>
              {!settings.facebook_user_access_token && (
                <p className="text-center text-sm text-pink-500 font-bold mt-2">
                  Connect your Facebook account in settings to launch ads.
                </p>
              )}
            </div>
          </div>

          {/* Ad Preview */}
          <div className="bg-gray-50 dark:bg-gray-800/30 rounded-[2rem] border border-gray-200 dark:border-gray-800 p-8 flex flex-col items-center justify-center">
            <div className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-lg shadow-xl overflow-hidden border border-gray-100 dark:border-gray-800">
              <div className="p-3 flex items-center gap-2">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-800 rounded-full flex-shrink-0"></div>
                <div>
                  <div className="font-bold text-sm text-gray-900 dark:text-white">
                    Your E-commerce Store
                  </div>
                  <div className="text-xs text-gray-500">Sponsored • ??</div>
                </div>
              </div>
              <div className="px-3 pb-3 text-sm text-gray-800 dark:text-gray-200">
                {adForm.adText}
              </div>
              <div className="w-full aspect-square bg-gray-100 dark:bg-gray-800 flex items-center justify-center relative">
                {adForm.productId ? (
                  <div className="text-gray-400 flex flex-col items-center">
                    <ImageIcon size={48} className="opacity-50 mb-2" />
                    <span className="font-bold">
                      Product Image will appear here
                    </span>
                  </div>
                ) : (
                  <span className="text-gray-400 font-medium">
                    Select a product to preview
                  </span>
                )}
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider">
                    frehscart.com
                  </div>
                  <div className="font-bold text-gray-900 dark:text-white">
                    {adForm.headline || "Product Headline"}
                  </div>
                </div>
                <button className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-1.5 rounded font-bold text-sm">
                  Shop Now
                </button>
              </div>
            </div>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mt-8">
              Live Facebook Ad Preview
            </p>
          </div>
        </div>
      )}

      {/* --- TAB: SETTINGS (Multi-Tenant Configuration) --- */}
      {activeTab === "settings" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 p-8 shadow-sm">
            <div className="mb-8 pb-6 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                <Settings className="text-blue-500" size={20} /> Store
                Integration
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Connect your store's Facebook Page and Ad Account seamlessly.
              </p>
            </div>

            <div className="space-y-8">
              {/* Simplified OAuth Connection Flow for Store Owners */}
              <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-2xl p-6 text-center">
                <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <svg
                    viewBox="0 0 24 24"
                    className="w-8 h-8 text-blue-600 fill-current"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  Link Your Facebook Account
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  Securely connect your Facebook profile to allow Femcart to
                  manage your ad campaigns and track conversions automatically.
                </p>

                {settings.facebook_user_access_token ? (
                  <div className="flex flex-col items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">
                      <CheckCircle2 size={14} /> Connected Successfully
                    </span>
                    <button
                      onClick={() => {
                        handleChange("facebook_user_access_token", "");
                        handleChange("facebook_ad_account_id", "");
                      }}
                      className="text-sm text-rose-500 font-bold hover:text-rose-600"
                    >
                      Disconnect Account
                    </button>
                  </div>
                ) : (
                  <button className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20">
                    <ExternalLink size={18} /> Connect with Facebook
                  </button>
                )}
              </div>

              {/* Advanced Override */}
              <div className="mt-8 border-t border-gray-100 dark:border-gray-800 pt-6">
                <h4 className="font-bold text-gray-900 dark:text-white mb-4">
                  Advanced / Manual Configuration
                </h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">
                      Ad Account ID
                    </label>
                    <input
                      type="text"
                      value={settings.facebook_ad_account_id ?? ""}
                      onChange={(e) =>
                        handleChange("facebook_ad_account_id", e.target.value)
                      }
                      className="w-full px-5 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-900 dark:text-white"
                      placeholder="e.g. act_123456789"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">
                      System User Access Token
                    </label>
                    <textarea
                      value={settings.facebook_user_access_token ?? ""}
                      onChange={(e) =>
                        handleChange(
                          "facebook_user_access_token",
                          e.target.value,
                        )
                      }
                      rows={3}
                      className="w-full px-5 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-blue-500 font-medium text-xs text-gray-900 dark:text-white font-mono"
                      placeholder="Paste developer API token here to manually bypass OAuth..."
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2 mt-6">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">
                  Meta Pixel ID (Optional)
                </label>
                <input
                  type="text"
                  value={settings.facebook_pixel_id ?? ""}
                  onChange={(e) =>
                    handleChange("facebook_pixel_id", e.target.value)
                  }
                  className="w-full px-5 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-900 dark:text-white"
                  placeholder="Auto-detected or enter manually"
                />
              </div>

              <button
                onClick={handleSaveSettings}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 px-6 py-3 rounded-xl font-bold transition-all mt-6"
              >
                {saving ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Save size={18} />
                )}
                {saving ? "Saving..." : "Save Configuration"}
              </button>
            </div>
          </div>

          {/* Instructions Panel */}
          <div className="bg-gray-50 dark:bg-gray-800/30 rounded-[2rem] border border-gray-200 dark:border-gray-800 p-8">
            <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2 mb-6">
              <HelpCircle size={20} className="text-blue-500" /> How to Connect
            </h3>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 font-black flex items-center justify-center shrink-0">
                  1
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white mb-1">
                    Click "Connect with Facebook"
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                    A secure popup will appear asking you to log into your
                    personal Facebook account that has admin access to your
                    store's Business Page.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 font-black flex items-center justify-center shrink-0">
                  2
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white mb-1">
                    Grant Permissions
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                    Approve the requested permissions. We need access to manage
                    your ads and view your analytics.{" "}
                    <strong className="text-gray-700 dark:text-gray-300">
                      We will never post on your behalf without your consent.
                    </strong>
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 font-black flex items-center justify-center shrink-0">
                  3
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white mb-1">
                    Select your Ad Account
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                    Once connected, use the dropdown on the left to select the
                    specific Ad Account you want to use for billing and running
                    ads for this store.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-xl">
              <p className="text-xs text-amber-800 dark:text-amber-400 font-medium">
                <strong className="font-bold">Note:</strong> If you don't have
                an Ad Account yet, you must go to business.facebook.com to
                create one before connecting.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
