"use client";
import { API_URL } from "@/lib/config";

import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

function getToken() {
  return typeof window !== "undefined"
    ? localStorage.getItem("femcart_access_token") ||
        localStorage.getItem("token") ||
        ""
    : "";
}

export default function ConnectionTab() {
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    siteUrl: "",
    consumerKey: "",
    consumerSecret: "",
    apiVersion: "wc/v3",
  });

  useEffect(() => {
    // Fetch existing settings
    fetch(`${API_URL}/api/wordpress/settings`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    })
      .then((res) => res.json())
      .then((json) => {
        if (json && json.data && json.data.siteUrl) {
          setFormData({
            siteUrl: json.data.siteUrl,
            consumerKey: json.data.consumerKey,
            consumerSecret: "*****", // Do not reveal secret
            apiVersion: json.data.apiVersion || "wc/v3",
          });
        }
      })
      .catch((err) => console.error("Could not load settings API", err));
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setTestResult(null); // Clear previous test result on change
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTestResult(null);
    try {
      const res = await fetch(`${API_URL}/api/wordpress/settings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save settings");
      setTestResult({ success: true, message: "Settings saved successfully." });
    } catch (err: any) {
      setTestResult({ success: false, message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch(`${API_URL}/api/wordpress/test`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Connection failed");
      setTestResult({
        success: true,
        message: "Connection successful! WooCommerce API is reachable.",
      });
    } catch (err: any) {
      setTestResult({ success: false, message: err.message });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          WooCommerce API Credentials
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Enter your website URL, Consumer Key, and Consumer Secret to connect
          with WooCommerce.
        </p>
      </div>

      {testResult && (
        <div
          className={`p-4 rounded-xl flex items-start gap-3 ${
            testResult.success
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-pink-50 text-pink-800 border border-pink-200"
          }`}
        >
          {testResult.success ? (
            <CheckCircle2 className="shrink-0 text-emerald-500" />
          ) : (
            <XCircle className="shrink-0 text-pink-500" />
          )}
          <div className="text-sm font-medium">{testResult.message}</div>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Site URL
          </label>
          <input
            type="url"
            name="siteUrl"
            value={formData.siteUrl}
            onChange={handleChange}
            placeholder="https://example.com"
            required
            className="w-full px-4 py-2 text-gray-900 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Consumer Key
          </label>
          <input
            type="text"
            name="consumerKey"
            value={formData.consumerKey}
            onChange={handleChange}
            placeholder="ck_..."
            required
            className="w-full px-4 py-2 text-gray-900 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow text-sm font-mono"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Consumer Secret
          </label>
          <input
            type="password"
            name="consumerSecret"
            value={formData.consumerSecret}
            onChange={handleChange}
            placeholder="cs_..."
            required
            className="w-full px-4 py-2 text-gray-900 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow text-sm font-mono"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            API Version
          </label>
          <select
            name="apiVersion"
            value={formData.apiVersion}
            onChange={handleChange}
            className="w-full px-4 py-2 text-gray-900 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow"
          >
            <option value="wc/v3">wc/v3 (Recommended)</option>
            <option value="wc/v2">wc/v2 (Legacy)</option>
          </select>
        </div>

        <div className="flex gap-3 pt-4 border-t border-gray-100">
          <button
            type="submit"
            disabled={loading || testing}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={18} className="animate-spin" />}
            Save Settings
          </button>
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={loading || testing || !formData.siteUrl}
            className="px-6 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 hover:text-emerald-700 disabled:opacity-50 text-gray-700 font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {testing ? <Loader2 size={18} className="animate-spin" /> : null}
            Test Connection
          </button>
        </div>
      </form>
    </div>
  );
}
