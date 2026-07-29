"use client";
import { API_URL } from "@/lib/config";
import { toast } from "sonner";
import { Loader2, Link2, Key, Server } from "lucide-react";
import { useState, useEffect } from "react";

export default function ConnectionTab() {
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);

  const [formData, setFormData] = useState({
    shopUrl: "",
    accessToken: "",
    apiVersion: "2024-01",
  });

  function getToken() {
    return typeof window !== "undefined"
      ? localStorage.getItem("femcart_access_token") ||
          localStorage.getItem("token") ||
          ""
      : "";
  }

  useEffect(() => {
    fetch(`${API_URL}/api/shopify/settings`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((res) => res.json())
      .then((json) => {
        if (json && json.data && json.data.shopUrl) {
          setFormData({
            shopUrl: json.data.shopUrl,
            accessToken: json.data.accessToken || "*****",
            apiVersion: json.data.apiVersion || "2024-01",
          });
        }
      })
      .catch((err) => console.error("Could not load settings API", err));
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/shopify/settings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save settings");
      toast.success("Settings saved successfully.");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    try {
      const res = await fetch(`${API_URL}/api/shopify/test`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Connection failed");
      toast.success("Connection successful! Shopify API is reachable.");
    } catch (err: any) {
      toast.error(err.message || "Connection failed.");
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">
          Shopify API Credentials
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Enter your Shop URL and Admin API Access Token to securely connect your Shopify store.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-gray-700">
            Shop URL
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Link2 size={18} className="text-gray-400" />
            </div>
            <input
              type="url"
              name="shopUrl"
              value={formData.shopUrl}
              onChange={handleChange}
              placeholder="https://your-store.myshopify.com"
              required
              className="w-full pl-10 pr-4 py-2.5 text-gray-900 bg-white border border-gray-200/80 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all shadow-sm"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-gray-700">
            Admin API Access Token
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Key size={18} className="text-gray-400" />
            </div>
            <input
              type="password"
              name="accessToken"
              value={formData.accessToken}
              onChange={handleChange}
              placeholder="shpat_..."
              required
              className="w-full pl-10 pr-4 py-2.5 text-gray-900 bg-white border border-gray-200/80 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all shadow-sm font-mono text-sm"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-gray-700">
            API Version
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Server size={18} className="text-gray-400" />
            </div>
            <select
              name="apiVersion"
              value={formData.apiVersion}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-2.5 text-gray-900 bg-white border border-gray-200/80 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all shadow-sm appearance-none"
            >
              <option value="2024-01">2024-01 (Recommended)</option>
              <option value="2023-10">2023-10 (Legacy)</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 pt-6">
          <button
            type="submit"
            disabled={loading || testing}
            className="flex-1 md:flex-none px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={18} className="animate-spin" />}
            Save Settings
          </button>
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={loading || testing || !formData.shopUrl}
            className="flex-1 md:flex-none px-6 py-2.5 bg-white border border-gray-200 hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 font-semibold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
          >
            {testing ? <Loader2 size={18} className="animate-spin" /> : null}
            Test Connection
          </button>
        </div>
      </form>
    </div>
  );
}
