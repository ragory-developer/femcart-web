"use client";
import { API_URL } from "@/lib/config";

import { showToast } from "@/lib/toast";
import { useSettingsStore } from "@/store/settingsStore";
import {
  Bell,
  ChevronRight,
  Code,
  CreditCard,
  Globe,
  Link as LinkIcon,
  Loader2,
  Save,
  Settings,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import { useEffect, useState } from "react";

const menuItems = [
  { id: "general", label: "General", icon: Globe },
  { id: "seo", label: "SEO & Permalinks", icon: LinkIcon },
  { id: "custom_code", label: "Custom Code", icon: Code },
  { id: "security", label: "Security", icon: ShieldCheck },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "payments", label: "Payments", icon: CreditCard },
  { id: "danger_zone", label: "Danger Zone", icon: AlertTriangle },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("seo");
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [validationStatuses, setValidationStatuses] = useState<
    Record<string, "idle" | "loading" | "valid" | "invalid">
  >({});
  const { setSettings: updateStore } = useSettingsStore();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token =
        localStorage.getItem("femcart_access_token") ||
        localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/global-settings/admin`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });
      const json = await res.json();
      if (json.success) {
        setSettings(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCleanData = async (type: string, label: string) => {
    if (!window.confirm(`WARNING: This will PERMANENTLY delete all ${label}. This action cannot be undone! Are you absolutely sure?`)) {
      return;
    }
    
    setSaving(true);
    try {
      const token = localStorage.getItem("femcart_access_token") || localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/global-settings/clean/${type}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (res.ok && json.success) {
        showToast.success(`${label} cleaned successfully!`);
      } else {
        showToast.error(json.message || `Failed to clean ${label}`);
      }
    } catch (e) {
      console.error(e);
      showToast.error(`Network error: Could not clean ${label}`);
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
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
        showToast.success("Settings saved successfully!");
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

  const validateGateway = async (
    gateway: "stripe" | "paypal" | "sslcz" | "nagad" | "bkash",
  ) => {
    setValidationStatuses((prev) => ({ ...prev, [gateway]: "loading" }));

    let endpoint = "";
    let body: any = {};

    if (gateway === "stripe") {
      endpoint = "/api/global-settings/validate-stripe";
      body = { secretKey: settings.stripe_secret_key };
    } else if (gateway === "paypal") {
      endpoint = "/api/global-settings/validate-paypal";
      body = {
        clientId: settings.paypal_client_id,
        secret: settings.paypal_client_secret,
        isLive: settings.paypal_is_live,
      };
    } else if (gateway === "sslcz") {
      endpoint = "/api/global-settings/validate-sslcz";
      body = {
        storeId: settings.sslcz_store_id,
        storePassword: settings.sslcz_store_password,
        isLive: settings.sslcz_is_live,
      };
    } else if (gateway === "nagad") {
      endpoint = "/api/global-settings/validate-nagad";
      body = {
        merchantID: settings.nagad_merchant_id,
        merchantNumber: settings.nagad_merchant_number,
        pubKey: settings.nagad_public_key,
        privKey: settings.nagad_private_key,
        isLive: settings.nagad_is_live,
      };
    } else if (gateway === "bkash") {
      endpoint = "/api/global-settings/validate-bkash";
      body = {
        appKey: settings.bkash_app_key,
        appSecret: settings.bkash_app_secret,
        username: settings.bkash_username,
        password: settings.bkash_password,
        isLive: settings.bkash_is_live,
      };
    }

    try {
      const token =
        localStorage.getItem("femcart_access_token") ||
        localStorage.getItem("token");
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (data.valid) {
        setValidationStatuses((prev) => ({ ...prev, [gateway]: "valid" }));
        showToast.success(
          `Successfully connected to ${gateway.toUpperCase()}!`,
        );
        // We can choose to save settings globally now, or let user click the global save
        // The plan stated to automatically save after successful connection.
        handleSave();
      } else {
        setValidationStatuses((prev) => ({ ...prev, [gateway]: "invalid" }));
        showToast.error(
          `Invalid credentials for ${gateway.toUpperCase()}. Could not connect.`,
        );
      }
    } catch (e) {
      setValidationStatuses((prev) => ({ ...prev, [gateway]: "invalid" }));
      showToast.error(
        `Network error while validating ${gateway.toUpperCase()}`,
      );
    }
  };

  const handleChange = (key: string, value: string) => {
    setSettings((prev: Record<string, string>) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
            <Settings size={32} className="text-emerald-500" /> System Settings
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage global configurations for your storefront
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <Save size={18} />
          )}
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Tree Menu (Sidebar) */}
        <aside className="w-full lg:w-72 shrink-0">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-2 shadow-sm overflow-hidden">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all group ${
                  activeTab === item.id
                    ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 font-bold"
                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon
                    size={20}
                    className={
                      activeTab === item.id
                        ? "text-emerald-500"
                        : "text-gray-400 group-hover:text-gray-600"
                    }
                  />
                  <span>{item.label}</span>
                </div>
                <ChevronRight
                  size={16}
                  className={`transition-transform duration-300 ${activeTab === item.id ? "rotate-90 opacity-100" : "opacity-0"}`}
                />
              </button>
            ))}
          </div>
        </aside>

        {/* Content Area */}
        <div className="flex-1 bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 p-8 shadow-sm min-h-[500px]">
          {loading ? (
            <div className="flex items-center justify-center h-full text-gray-400 font-medium">
              Loading settings...
            </div>
          ) : activeTab === "general" ? (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
              {/* Storefront Grid Section */}
              <section>
                <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight italic border-l-4 border-emerald-500 pl-4 mb-2">
                  Storefront Grid
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 font-medium">
                  Configure how products are displayed on the shop and category
                  pages.
                </p>

                <div className="space-y-6 max-w-md">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">
                      Products per Row (Desktop)
                    </label>
                    <select
                      value={settings.products_per_row || "3"}
                      onChange={(e) =>
                        handleChange("products_per_row", e.target.value)
                      }
                      className="w-full px-5 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium text-gray-900 dark:text-white appearance-none"
                    >
                      <option value="2">2 Columns</option>
                      <option value="3">3 Columns</option>
                      <option value="4">4 Columns</option>
                      <option value="5">5 Columns</option>
                      <option value="6">6 Columns</option>
                    </select>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider pl-1 mt-1">
                      Note: On mobile, it will automatically switch to 2 columns
                      for better usability.
                    </p>
                  </div>

                  <div className="space-y-2 pt-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">
                      Top Notification Bar
                    </label>
                    <input
                      type="text"
                      value={settings.top_bar_text ?? ""}
                      onChange={(e) =>
                        handleChange("top_bar_text", e.target.value)
                      }
                      className="w-full px-5 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium text-gray-900 dark:text-white"
                      placeholder="e.g. Buy 3-Pack, Save 300 TK!"
                    />
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider pl-1 mt-1">
                      Leave empty to hide the top notification bar.
                    </p>
                  </div>

                  <div className="pt-2">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative">
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={settings.enable_infinite_scroll === "true"}
                          onChange={(e) =>
                            handleChange(
                              "enable_infinite_scroll",
                              e.target.checked ? "true" : "false",
                            )
                          }
                        />
                        <div
                          className={`w-12 h-6 rounded-full transition-colors ${settings.enable_infinite_scroll === "true" ? "bg-emerald-500" : "bg-gray-200 dark:bg-gray-700"}`}
                        ></div>
                        <div
                          className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${settings.enable_infinite_scroll === "true" ? "translate-x-6" : ""}`}
                        ></div>
                      </div>
                      <div>
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-200 group-hover:text-emerald-500 transition-colors uppercase tracking-tight">
                          Enable Infinite Scroll
                        </span>
                        <p className="text-[10px] text-gray-500 font-medium">
                          Auto-load more products when scrolling down.
                        </p>
                      </div>
                    </label>
                  </div>

                  <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative">
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={settings.ignore_stock_limits === "true"}
                          onChange={(e) =>
                            handleChange(
                              "ignore_stock_limits",
                              e.target.checked ? "true" : "false",
                            )
                          }
                        />
                        <div
                          className={`w-12 h-6 rounded-full transition-colors ${settings.ignore_stock_limits === "true" ? "bg-emerald-500" : "bg-gray-200 dark:bg-gray-700"}`}
                        ></div>
                        <div
                          className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${settings.ignore_stock_limits === "true" ? "translate-x-6" : ""}`}
                        ></div>
                      </div>
                      <div>
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-200 group-hover:text-emerald-500 transition-colors uppercase tracking-tight">
                          Ignore Stock Limits
                        </span>
                        <p className="text-[10px] text-gray-500 font-medium">
                          Allow checking out products even if they are out of
                          stock. Stock low alerts will still show.
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* Online Checkout Flow Toggle */}
                  <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-4">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative">
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={settings.enable_checkout_flow !== "false"}
                          onChange={(e) =>
                            handleChange(
                              "enable_checkout_flow",
                              e.target.checked ? "true" : "false",
                            )
                          }
                        />
                        <div
                          className={`w-12 h-6 rounded-full transition-colors ${settings.enable_checkout_flow !== "false" ? "bg-emerald-500" : "bg-gray-200 dark:bg-gray-700"}`}
                        ></div>
                        <div
                          className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${settings.enable_checkout_flow !== "false" ? "translate-x-6" : ""}`}
                        ></div>
                      </div>
                      <div>
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-200 group-hover:text-emerald-500 transition-colors uppercase tracking-tight">
                          Enable Online Checkout
                        </span>
                        <p className="text-[10px] text-gray-500 font-medium">
                          Turn online checkout and &quot;Buy Now&quot; on or off across the store. When turned off, checkout routes and buttons are disabled.
                        </p>
                      </div>
                    </label>

                    {settings.enable_checkout_flow === "false" && (
                      <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 space-y-2 animate-in fade-in duration-300">
                        <label className="text-xs font-black text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                          Checkout Disabled Notice Message
                        </label>
                        <input
                          type="text"
                          value={settings.checkout_disabled_message ?? ""}
                          onChange={(e) =>
                            handleChange("checkout_disabled_message", e.target.value)
                          }
                          className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-gray-800 border border-amber-200 dark:border-amber-700 focus:ring-2 focus:ring-amber-500 text-sm font-medium text-gray-900 dark:text-white"
                          placeholder="e.g. Online ordering is temporarily paused. Please check back soon or contact support."
                        />
                        <p className="text-[10px] text-amber-700 dark:text-amber-400 font-medium">
                          This notice will be displayed to customers on the cart and when visiting checkout.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              <hr className="border-gray-100 dark:border-gray-800" />

              {/* Product Card Design Section */}
              <section>
                <h3 className="text-xl font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-tight italic border-l-4 border-emerald-500 pl-4 mb-2">
                  Product Card Design
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 font-medium">
                  Configure the global look and feel of all product cards and
                  their loading skeletons.
                </p>

                <div className="space-y-6 max-w-md">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">
                      Card Variant
                    </label>
                    <select
                      value={settings.productCardVariant || "classic"}
                      onChange={(e) =>
                        handleChange("productCardVariant", e.target.value)
                      }
                      className="w-full px-5 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium text-gray-900 dark:text-white appearance-none"
                    >
                      <option value="classic">
                        Classic (Shadows, Hover Effects)
                      </option>
                      <option value="sleek">Sleek (Gradient, Scale)</option>
                      <option value="festive">
                        Festive (Amber Tone, Decorative)
                      </option>
                      <option value="minimal">
                        Minimal (Clean, No Borders)
                      </option>
                      <option value="bordered">
                        Bordered (Strict Outlines)
                      </option>
                      <option value="neumorphic">
                        Neumorphic (Soft UI Shadows)
                      </option>
                      <option value="horizontal">Horizontal (List View)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">
                      Corner Radius
                    </label>
                    <select
                      value={settings.productCardRadius || "3xl"}
                      onChange={(e) =>
                        handleChange("productCardRadius", e.target.value)
                      }
                      className="w-full px-5 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium text-gray-900 dark:text-white appearance-none"
                    >
                      <option value="none">Sharp (0px)</option>
                      <option value="sm">Small</option>
                      <option value="md">Medium</option>
                      <option value="lg">Large</option>
                      <option value="xl">Extra Large</option>
                      <option value="2xl">2XL</option>
                      <option value="3xl">3XL (Modern Standard)</option>
                      <option value="full">Fully Rounded</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">
                      Badge Style
                    </label>
                    <select
                      value={settings.productCardBadgeStyle || "pill"}
                      onChange={(e) =>
                        handleChange("productCardBadgeStyle", e.target.value)
                      }
                      className="w-full px-5 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium text-gray-900 dark:text-white appearance-none"
                    >
                      <option value="pill">Floating Pills</option>
                      <option value="corner">Corner Wrap</option>
                      <option value="ribbon">Diagonal Ribbon</option>
                    </select>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative">
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={settings.productCardShowBadge !== "false"}
                          onChange={(e) =>
                            handleChange(
                              "productCardShowBadge",
                              e.target.checked ? "true" : "false",
                            )
                          }
                        />
                        <div
                          className={`w-12 h-6 rounded-full transition-colors ${settings.productCardShowBadge !== "false" ? "bg-emerald-500" : "bg-gray-200 dark:bg-gray-700"}`}
                        ></div>
                        <div
                          className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${settings.productCardShowBadge !== "false" ? "translate-x-6" : ""}`}
                        ></div>
                      </div>
                      <span className="text-sm font-bold text-gray-700 dark:text-gray-200 group-hover:text-emerald-500 transition-colors uppercase tracking-tight">
                        Show Badges (Sale/New)
                      </span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative">
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={settings.productCardShowRating !== "false"}
                          onChange={(e) =>
                            handleChange(
                              "productCardShowRating",
                              e.target.checked ? "true" : "false",
                            )
                          }
                        />
                        <div
                          className={`w-12 h-6 rounded-full transition-colors ${settings.productCardShowRating !== "false" ? "bg-emerald-500" : "bg-gray-200 dark:bg-gray-700"}`}
                        ></div>
                        <div
                          className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${settings.productCardShowRating !== "false" ? "translate-x-6" : ""}`}
                        ></div>
                      </div>
                      <span className="text-sm font-bold text-gray-700 dark:text-gray-200 group-hover:text-emerald-500 transition-colors uppercase tracking-tight">
                        Show Star Ratings
                      </span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative">
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={
                            settings.productCardShowAddToCart !== "false"
                          }
                          onChange={(e) =>
                            handleChange(
                              "productCardShowAddToCart",
                              e.target.checked ? "true" : "false",
                            )
                          }
                        />
                        <div
                          className={`w-12 h-6 rounded-full transition-colors ${settings.productCardShowAddToCart !== "false" ? "bg-emerald-500" : "bg-gray-200 dark:bg-gray-700"}`}
                        ></div>
                        <div
                          className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${settings.productCardShowAddToCart !== "false" ? "translate-x-6" : ""}`}
                        ></div>
                      </div>
                      <span className="text-sm font-bold text-gray-700 dark:text-gray-200 group-hover:text-emerald-500 transition-colors uppercase tracking-tight">
                        Show Add to Cart Button
                      </span>
                    </label>
                  </div>
                </div>
              </section>

              <hr className="border-gray-100 dark:border-gray-800" />

              {/* Verification Settings Section */}
              <section>
                <h3 className="text-xl font-black text-rose-600 dark:text-rose-500 uppercase tracking-tight italic border-l-4 border-rose-500 pl-4 mb-2">
                  Abandoned Cart Cleanup
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 font-medium">
                  Configure when inactive abandoned carts should be
                  automatically deleted.
                </p>

                <div className="space-y-6 max-w-md">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">
                      Auto-Cleanup Timeframe (Hours)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={settings.abandoned_cart_expiry_hours || "24"}
                      onChange={(e) =>
                        handleChange(
                          "abandoned_cart_expiry_hours",
                          e.target.value,
                        )
                      }
                      className="w-full px-5 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-rose-500 transition-all font-medium text-gray-900 dark:text-white"
                      placeholder="e.g. 24"
                    />
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider pl-1 mt-1">
                      Automatically delete carts inactive for this many hours.
                    </p>
                  </div>
                </div>
              </section>

              <hr className="border-gray-100 dark:border-gray-800" />

              {/* Verification Settings Section */}
              <section>
                <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight italic border-l-4 border-emerald-500 pl-4 mb-2">
                  Verification Settings
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 font-medium">
                  Enforce security and validity for your customers through OTP
                  verification.
                </p>

                <div className="space-y-6 max-w-md">
                  <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 space-y-4">
                    <div className="space-y-3 pb-4">
                      <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest pl-1 block">
                        Verification Method
                      </label>
                      <select
                        value={settings.checkout_verification_method || "phone"}
                        onChange={(e) =>
                          handleChange(
                            "checkout_verification_method",
                            e.target.value,
                          )
                        }
                        className="w-full px-5 py-3.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-emerald-500 transition-all font-medium text-gray-900 dark:text-white appearance-none cursor-pointer"
                      >
                        <option value="phone">Phone SMS (OTP)</option>
                        <option value="email">Email (OTP)</option>
                      </select>
                    </div>

                    <div className="h-px bg-gray-100 dark:bg-gray-800" />

                    <label className="flex items-center gap-4 cursor-pointer group pt-2">
                      <div className="relative">
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={
                            settings.verify_number_before_order === "true"
                          }
                          onChange={(e) =>
                            handleChange(
                              "verify_number_before_order",
                              e.target.checked ? "true" : "false",
                            )
                          }
                        />
                        <div
                          className={`w-12 h-6 rounded-full transition-colors ${settings.verify_number_before_order === "true" ? "bg-emerald-500" : "bg-gray-200 dark:bg-gray-700"}`}
                        ></div>
                        <div
                          className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${settings.verify_number_before_order === "true" ? "translate-x-6" : ""}`}
                        ></div>
                      </div>
                      <div className="flex-1">
                        <span className="text-sm font-black text-gray-700 dark:text-gray-200 group-hover:text-emerald-500 transition-colors uppercase tracking-tight">
                          Verify before order
                        </span>
                        <p className="text-[10px] text-gray-500 font-medium">
                          Require guest users to verify their contact info via
                          OTP before placing an order.
                        </p>
                      </div>
                    </label>

                    <div className="h-px bg-gray-100 dark:bg-gray-800" />

                    <label className="flex items-center gap-4 cursor-pointer group">
                      <div className="relative">
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={
                            settings.verify_user_before_signup === "true"
                          }
                          onChange={(e) =>
                            handleChange(
                              "verify_user_before_signup",
                              e.target.checked ? "true" : "false",
                            )
                          }
                        />
                        <div
                          className={`w-12 h-6 rounded-full transition-colors ${settings.verify_user_before_signup === "true" ? "bg-emerald-500" : "bg-gray-200 dark:bg-gray-700"}`}
                        ></div>
                        <div
                          className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${settings.verify_user_before_signup === "true" ? "translate-x-6" : ""}`}
                        ></div>
                      </div>
                      <div className="flex-1">
                        <span className="text-sm font-black text-gray-700 dark:text-gray-200 group-hover:text-emerald-500 transition-colors uppercase tracking-tight">
                          Verify user before sign up
                        </span>
                        <p className="text-[10px] text-gray-500 font-medium">
                          Require new users to verify their contact details
                          before completing registration.
                        </p>
                      </div>
                    </label>
                  </div>

                  <div className="flex items-start gap-3 p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800">
                    <div className="bg-blue-500 text-white p-1 rounded-md shrink-0 mt-0.5">
                      <ShieldCheck size={14} />
                    </div>
                    <p className="text-[11px] text-blue-700 dark:text-blue-400 leading-relaxed font-semibold uppercase tracking-tight">
                      Pro Tip: These settings help reduce fake orders and
                      improve data quality. Each successful SMS will cost Tk
                      0.40 and will be deducted from your wallet balance.
                    </p>
                  </div>
                </div>
              </section>

              <hr className="border-gray-100 dark:border-gray-800" />

              {/* Reward Points Settings Section */}
              <section>
                <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight italic border-l-4 border-emerald-500 pl-4 mb-2">
                  Reward Points
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 font-medium">
                  Configure how users earn reward points for their delivered
                  orders. Set both to 0 to disable.
                </p>

                <div className="space-y-6 max-w-md">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">
                        Amount Spent (Tk )
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={settings.reward_points_amount ?? "0"}
                        onChange={(e) =>
                          handleChange("reward_points_amount", e.target.value)
                        }
                        className="w-full px-5 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium text-gray-900 dark:text-white"
                        placeholder="e.g. 100"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">
                        Points Earned
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={settings.reward_points_earned ?? "0"}
                        onChange={(e) =>
                          handleChange("reward_points_earned", e.target.value)
                        }
                        className="w-full px-5 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium text-gray-900 dark:text-white"
                        placeholder="e.g. 1"
                      />
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800">
                    <div className="bg-emerald-500 text-white p-1 rounded-md shrink-0 mt-0.5">
                      <Save size={14} />
                    </div>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400 leading-relaxed font-semibold uppercase tracking-tight">
                      Reward points are calculated on the relative subtotal
                      (excluding delivery charges) and awarded securely only
                      when the order status reaches Delivered.
                    </p>
                  </div>
                </div>
              </section>
            </div>
          ) : activeTab === "seo" ? (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight italic border-l-4 border-emerald-500 pl-4 mb-2">
                  Permalink Structure
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 font-medium">
                  Choose how your product URLs appear in the browser address
                  bar. This is critical for SEO.
                </p>

                <div className="grid gap-4">
                  <label
                    className={`relative flex items-center p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                      settings.permalink_structure === "flat"
                        ? "border-emerald-500 bg-emerald-50/30 dark:bg-emerald-900/10"
                        : "border-gray-100 dark:border-gray-800 hover:border-gray-200"
                    }`}
                  >
                    <input
                      type="radio"
                      name="permalink"
                      value="flat"
                      checked={settings.permalink_structure === "flat"}
                      onChange={() =>
                        handleChange("permalink_structure", "flat")
                      }
                      className="sr-only"
                    />
                    <div className="flex-1">
                      <div className="font-bold text-gray-900 dark:text-white">
                        Flat Structure
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        Example: femcart.com/apple-phone
                      </div>
                    </div>
                    {settings.permalink_structure === "flat" && (
                      <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-white">
                        <Save size={12} />
                      </div>
                    )}
                  </label>

                  <label
                    className={`relative flex items-center p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                      settings.permalink_structure === "product"
                        ? "border-emerald-500 bg-emerald-50/30 dark:bg-emerald-900/10"
                        : "border-gray-100 dark:border-gray-800 hover:border-gray-200"
                    }`}
                  >
                    <input
                      type="radio"
                      name="permalink"
                      value="product"
                      checked={settings.permalink_structure === "product"}
                      onChange={() =>
                        handleChange("permalink_structure", "product")
                      }
                      className="sr-only"
                    />
                    <div className="flex-1">
                      <div className="font-bold text-gray-900 dark:text-white">
                        Product Prefix (Standard)
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        Example: femcart.com/product/apple-phone
                      </div>
                    </div>
                    {settings.permalink_structure === "product" && (
                      <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-white">
                        <Save size={12} />
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight italic border-l-4 border-emerald-500 pl-4 mb-6">
                  Meta Settings
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">
                      Store Name
                    </label>
                    <input
                      type="text"
                      value={settings.store_name ?? ""}
                      onChange={(e) =>
                        handleChange("store_name", e.target.value)
                      }
                      className="w-full px-5 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium text-gray-900 dark:text-white"
                      placeholder="e.g. Femcart"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">
                      Global SEO Title
                    </label>
                    <input
                      type="text"
                      value={settings.site_title ?? ""}
                      onChange={(e) =>
                        handleChange("site_title", e.target.value)
                      }
                      className="w-full px-5 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium text-gray-900 dark:text-white"
                      placeholder="e.g. Femcart | Your Organic Grocery Store"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">
                      Global Meta Description
                    </label>
                    <textarea
                      value={settings.meta_description ?? ""}
                      onChange={(e) =>
                        handleChange("meta_description", e.target.value)
                      }
                      rows={3}
                      className="w-full px-5 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium text-gray-900 dark:text-white"
                      placeholder="Default description for your home page..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">
                      Global Meta Keywords
                    </label>
                    <input
                      type="text"
                      value={settings.meta_keywords ?? ""}
                      onChange={(e) =>
                        handleChange("meta_keywords", e.target.value)
                      }
                      className="w-full px-5 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium text-gray-900 dark:text-white"
                      placeholder="keywords, for, your, site"
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === "custom_code" ? (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight italic border-l-4 border-emerald-500 pl-4 mb-2">
                  Header & Footer Code
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 font-medium">
                  Insert custom scripts or tags like Google Analytics, Facebook
                  Pixel, or custom CSS.
                </p>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">
                      Head Code
                    </label>
                    <textarea
                      value={settings.header_code ?? ""}
                      onChange={(e) =>
                        handleChange("header_code", e.target.value)
                      }
                      rows={6}
                      className="w-full px-5 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-emerald-500 transition-all font-mono text-sm text-gray-900 dark:text-white"
                      placeholder="<!-- Code injected inside the <head> tag (e.g., GTM head script) -->"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">
                      Body Code (Top)
                    </label>
                    <textarea
                      value={settings.body_code ?? ""}
                      onChange={(e) =>
                        handleChange("body_code", e.target.value)
                      }
                      rows={6}
                      className="w-full px-5 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-emerald-500 transition-all font-mono text-sm text-gray-900 dark:text-white"
                      placeholder="<!-- Code injected right after opening <body> tag (e.g., GTM noscript) -->"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">
                      Footer Code (Bottom)
                    </label>
                    <textarea
                      value={settings.footer_code ?? ""}
                      onChange={(e) =>
                        handleChange("footer_code", e.target.value)
                      }
                      rows={6}
                      className="w-full px-5 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-emerald-500 transition-all font-mono text-sm text-gray-900 dark:text-white"
                      placeholder="<!-- Code injected right before closing </body> tag -->"
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === "payments" ? (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-700 shadow-sm">
                <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight italic border-l-4 border-emerald-500 pl-4 mb-2">
                  Payment Methods Availability
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 font-medium">
                  Toggle which payment methods are available during checkout.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  {["COD", "STRIPE", "PAYPAL", "BKASH", "CARD", "NAGAD"].map(
                    (method) => (
                      <label
                        key={method}
                        className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl cursor-pointer border border-transparent hover:border-emerald-500/30 transition-all"
                      >
                        <div className="relative flex items-center">
                          <input
                            type="checkbox"
                            checked={
                              settings[
                                `payment_enable_${method.toLowerCase()}`
                              ] !== "false"
                            } // Default to true if undefined
                            onChange={(e) =>
                              handleChange(
                                `payment_enable_${method.toLowerCase()}`,
                                e.target.checked ? "true" : "false",
                              )
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 dark:peer-focus:ring-emerald-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-500"></div>
                        </div>
                        <span className="font-bold text-gray-900 dark:text-white">
                          {method === "CARD"
                            ? "SSL Commerz / Card"
                            : method === "COD"
                              ? "Cash on Delivery"
                              : method}
                        </span>
                      </label>
                    ),
                  )}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-700 shadow-sm">
                <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight italic border-l-4 border-emerald-500 pl-4 mb-2">
                  bKash Configuration
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 font-medium">
                  Configure your bKash merchant credentials.
                </p>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">
                      App Key
                    </label>
                    <input
                      type="text"
                      value={settings.bkash_app_key ?? ""}
                      onChange={(e) =>
                        handleChange("bkash_app_key", e.target.value)
                      }
                      className="w-full px-5 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-emerald-500 transition-all font-mono text-gray-900 dark:text-white"
                      placeholder="App Key..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">
                      App Secret
                    </label>
                    <input
                      type="password"
                      value={settings.bkash_app_secret ?? ""}
                      onChange={(e) =>
                        handleChange("bkash_app_secret", e.target.value)
                      }
                      className="w-full px-5 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-emerald-500 transition-all font-mono text-gray-900 dark:text-white"
                      placeholder="App Secret..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">
                      Username
                    </label>
                    <input
                      type="text"
                      value={settings.bkash_username ?? ""}
                      onChange={(e) =>
                        handleChange("bkash_username", e.target.value)
                      }
                      className="w-full px-5 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-emerald-500 transition-all font-mono text-gray-900 dark:text-white"
                      placeholder="Username..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">
                      Password
                    </label>
                    <input
                      type="password"
                      value={settings.bkash_password ?? ""}
                      onChange={(e) =>
                        handleChange("bkash_password", e.target.value)
                      }
                      className="w-full px-5 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-emerald-500 transition-all font-mono text-gray-900 dark:text-white"
                      placeholder="Password..."
                    />
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.bkash_is_live === "true"}
                      onChange={(e) =>
                        handleChange(
                          "bkash_is_live",
                          e.target.checked ? "true" : "false",
                        )
                      }
                      className="w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-600"
                    />
                    <span className="font-bold text-gray-900 dark:text-white text-sm">
                      Live Mode (Uncheck for Sandbox)
                    </span>
                  </label>
                  <div className="pt-4 flex justify-end border-t border-gray-100 dark:border-gray-700">
                    <button
                      onClick={() => validateGateway("bkash")}
                      disabled={validationStatuses.bkash === "loading"}
                      className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl font-bold transition-all shadow-md disabled:opacity-50"
                    >
                      {validationStatuses.bkash === "loading" ? (
                        <Loader2 className="animate-spin w-4 h-4" />
                      ) : (
                        <LinkIcon className="w-4 h-4" />
                      )}
                      Connect bKash
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-700 shadow-sm">
                <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight italic border-l-4 border-emerald-500 pl-4 mb-2">
                  Stripe Configuration
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 font-medium">
                  Configure your Stripe API keys to accept credit card payments.
                </p>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">
                      Stripe Secret Key (sk_test_... or sk_live_...)
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        value={settings.stripe_secret_key ?? ""}
                        onChange={(e) =>
                          handleChange("stripe_secret_key", e.target.value)
                        }
                        className="w-full px-5 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-emerald-500 transition-all font-mono text-gray-900 dark:text-white pr-12"
                        placeholder="sk_test_... or API Key ID"
                      />
                    </div>
                  </div>
                  <div className="pt-4 flex justify-end border-t border-gray-100 dark:border-gray-700">
                    <button
                      onClick={() => validateGateway("stripe")}
                      disabled={validationStatuses.stripe === "loading"}
                      className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl font-bold transition-all shadow-md disabled:opacity-50"
                    >
                      {validationStatuses.stripe === "loading" ? (
                        <Loader2 className="animate-spin w-4 h-4" />
                      ) : (
                        <LinkIcon className="w-4 h-4" />
                      )}
                      Connect Stripe
                    </button>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-700 shadow-sm">
                <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight italic border-l-4 border-emerald-500 pl-4 mb-2">
                  PayPal Configuration
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 font-medium">
                  Configure your PayPal Client ID and Secret to accept PayPal
                  payments.
                </p>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">
                      PayPal Client ID
                    </label>
                    <input
                      type="text"
                      value={settings.paypal_client_id ?? ""}
                      onChange={(e) =>
                        handleChange("paypal_client_id", e.target.value)
                      }
                      className="w-full px-5 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-emerald-500 transition-all font-mono text-gray-900 dark:text-white"
                      placeholder="Client ID..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">
                      PayPal Secret Key
                    </label>
                    <input
                      type="password"
                      value={settings.paypal_client_secret ?? ""}
                      onChange={(e) =>
                        handleChange("paypal_client_secret", e.target.value)
                      }
                      className="w-full px-5 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-emerald-500 transition-all font-mono text-gray-900 dark:text-white"
                      placeholder="Secret Key..."
                    />
                  </div>
                  <div className="pt-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.paypal_is_live === "true"}
                        onChange={(e) =>
                          handleChange(
                            "paypal_is_live",
                            e.target.checked ? "true" : "false",
                          )
                        }
                        className="w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-600"
                      />
                      <span className="font-bold text-gray-900 dark:text-white text-sm">
                        Live Mode (Uncheck for Sandbox)
                      </span>
                    </label>
                  </div>
                  <div className="pt-4 flex justify-end border-t border-gray-100 dark:border-gray-700">
                    <button
                      onClick={() => validateGateway("paypal")}
                      disabled={validationStatuses.paypal === "loading"}
                      className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl font-bold transition-all shadow-md disabled:opacity-50"
                    >
                      {validationStatuses.paypal === "loading" ? (
                        <Loader2 className="animate-spin w-4 h-4" />
                      ) : (
                        <LinkIcon className="w-4 h-4" />
                      )}
                      Connect PayPal
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-700 shadow-sm">
                <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight italic border-l-4 border-emerald-500 pl-4 mb-2">
                  SSL Commerz Configuration
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 font-medium">
                  Configure your SSL Commerz credentials to accept Local Cards,
                  Mobile Banking, and Net Banking.
                </p>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">
                      Store ID
                    </label>
                    <input
                      type="text"
                      value={settings.sslcz_store_id ?? ""}
                      onChange={(e) =>
                        handleChange("sslcz_store_id", e.target.value)
                      }
                      className="w-full px-5 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-emerald-500 transition-all font-mono text-gray-900 dark:text-white"
                      placeholder="Store ID..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">
                      Store Password
                    </label>
                    <input
                      type="password"
                      value={settings.sslcz_store_password ?? ""}
                      onChange={(e) =>
                        handleChange("sslcz_store_password", e.target.value)
                      }
                      className="w-full px-5 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-emerald-500 transition-all font-mono text-gray-900 dark:text-white"
                      placeholder="Store Password..."
                    />
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.sslcz_is_live === "true"}
                      onChange={(e) =>
                        handleChange(
                          "sslcz_is_live",
                          e.target.checked ? "true" : "false",
                        )
                      }
                      className="w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-600"
                    />
                    <span className="font-bold text-gray-900 dark:text-white text-sm">
                      Live Mode (Uncheck for Sandbox)
                    </span>
                  </label>
                  <div className="pt-4 flex justify-end border-t border-gray-100 dark:border-gray-700">
                    <button
                      onClick={() => validateGateway("sslcz")}
                      disabled={validationStatuses.sslcz === "loading"}
                      className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl font-bold transition-all shadow-md disabled:opacity-50"
                    >
                      {validationStatuses.sslcz === "loading" ? (
                        <Loader2 className="animate-spin w-4 h-4" />
                      ) : (
                        <LinkIcon className="w-4 h-4" />
                      )}
                      Connect SSL Commerz
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-700 shadow-sm">
                <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight italic border-l-4 border-emerald-500 pl-4 mb-2">
                  Nagad Configuration
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 font-medium">
                  Configure your Nagad Merchant credentials.
                </p>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">
                      Merchant ID
                    </label>
                    <input
                      type="text"
                      value={settings.nagad_merchant_id ?? ""}
                      onChange={(e) =>
                        handleChange("nagad_merchant_id", e.target.value)
                      }
                      className="w-full px-5 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-emerald-500 transition-all font-mono text-gray-900 dark:text-white"
                      placeholder="Merchant ID..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">
                      Merchant Number
                    </label>
                    <input
                      type="text"
                      value={settings.nagad_merchant_number ?? ""}
                      onChange={(e) =>
                        handleChange("nagad_merchant_number", e.target.value)
                      }
                      className="w-full px-5 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-emerald-500 transition-all font-mono text-gray-900 dark:text-white"
                      placeholder="01XXXXXXXXX"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">
                      Public Key (RSA)
                    </label>
                    <textarea
                      value={settings.nagad_public_key ?? ""}
                      onChange={(e) =>
                        handleChange("nagad_public_key", e.target.value)
                      }
                      rows={4}
                      className="w-full px-5 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-emerald-500 transition-all font-mono text-xs text-gray-900 dark:text-white"
                      placeholder="-----BEGIN PUBLIC KEY-----..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">
                      Private Key (RSA)
                    </label>
                    <textarea
                      value={settings.nagad_private_key ?? ""}
                      onChange={(e) =>
                        handleChange("nagad_private_key", e.target.value)
                      }
                      rows={4}
                      className="w-full px-5 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-emerald-500 transition-all font-mono text-xs text-gray-900 dark:text-white"
                      placeholder="-----BEGIN PRIVATE KEY-----..."
                    />
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.nagad_is_live === "true"}
                      onChange={(e) =>
                        handleChange(
                          "nagad_is_live",
                          e.target.checked ? "true" : "false",
                        )
                      }
                      className="w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-600"
                    />
                    <span className="font-bold text-gray-900 dark:text-white text-sm">
                      Live Mode (Uncheck for Sandbox)
                    </span>
                  </label>
                  <div className="pt-4 flex justify-end border-t border-gray-100 dark:border-gray-700">
                    <button
                      onClick={() => validateGateway("nagad")}
                      disabled={validationStatuses.nagad === "loading"}
                      className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl font-bold transition-all shadow-md disabled:opacity-50"
                    >
                      {validationStatuses.nagad === "loading" ? (
                        <Loader2 className="animate-spin w-4 h-4" />
                      ) : (
                        <LinkIcon className="w-4 h-4" />
                      )}
                      Connect Nagad
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === "danger_zone" ? (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="bg-red-50 dark:bg-red-900/20 rounded-3xl p-8 border border-red-100 dark:border-red-800 shadow-sm">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-900/40 flex items-center justify-center text-red-600 dark:text-red-400">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-red-900 dark:text-red-100 tracking-tight">
                      Danger Zone
                    </h2>
                    <p className="text-red-600/80 dark:text-red-300/80 text-sm font-medium mt-1">
                      Destructive actions that cannot be undone.
                    </p>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-red-100 dark:border-red-800/50 shadow-sm space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Clean Specific Data</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Choose which parts of the catalog to permanently delete or reset. Use with extreme caution.
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row flex-wrap gap-3">
                    <button
                      onClick={() => handleCleanData('products', 'Products & Variants')}
                      disabled={saving}
                      className="inline-flex flex-1 justify-center items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-xl font-bold transition-all shadow-sm disabled:opacity-50 min-w-[200px]"
                    >
                      {saving ? <Loader2 className="animate-spin w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                      Clean All Products
                    </button>
                    
                    <button
                      onClick={() => handleCleanData('categories', 'Categories')}
                      disabled={saving}
                      className="inline-flex flex-1 justify-center items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-xl font-bold transition-all shadow-sm disabled:opacity-50 min-w-[200px]"
                    >
                      {saving ? <Loader2 className="animate-spin w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                      Clean All Categories
                    </button>

                    <button
                      onClick={() => handleCleanData('brands', 'Brands')}
                      disabled={saving}
                      className="inline-flex flex-1 justify-center items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-xl font-bold transition-all shadow-sm disabled:opacity-50 min-w-[200px]"
                    >
                      {saving ? <Loader2 className="animate-spin w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                      Clean All Brands
                    </button>

                    <button
                      onClick={() => handleCleanData('caches', 'Caches')}
                      disabled={saving}
                      className="inline-flex flex-1 justify-center items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-3 rounded-xl font-bold transition-all shadow-sm disabled:opacity-50 min-w-[200px]"
                    >
                      {saving ? <Loader2 className="animate-spin w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                      Clear All Caches
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
                <Settings size={32} className="text-gray-300" />
              </div>
              <h3 className="text-2xl font-black text-gray-800 dark:text-white mb-2 italic">
                Feature Coming Soon
              </h3>
              <p className="text-gray-500 max-w-xs font-medium">
                The {activeTab} section is currently under development.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
