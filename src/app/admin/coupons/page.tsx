"use client";
import { API_URL } from "@/lib/config";

import { showToast } from "@/lib/toast";
import {
  BarChart2,
  Check,
  Pencil,
  Plus,
  Search,
  Ticket,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

interface Coupon {
  id: string;
  code: string;
  discount: number;
  type: "PERCENT" | "FIXED";
  minOrder: number;
  maxUses: number;
  usedCount: number;
  active: boolean;
  expiresAt: string | null;
  createdAt: string;
}

const API = `${API_URL}/api/coupons`;

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [code, setCode] = useState("");
  const [discount, setDiscount] = useState("");
  const [type, setType] = useState<"PERCENT" | "FIXED">("PERCENT");
  const [minOrder, setMinOrder] = useState("");
  const [maxUses, setMaxUses] = useState("100");
  const [expiresAt, setExpiresAt] = useState("");
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const [reportData, setReportData] = useState<any>(null);
  const [loadingReport, setLoadingReport] = useState(false);

  const fetchCoupons = async () => {
    try {
      const token =
        localStorage.getItem("femcart_access_token") ||
        localStorage.getItem("token");
      const res = await fetch(`${API}?limit=50`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) setCoupons(json.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const resetForm = () => {
    setCode("");
    setDiscount("");
    setType("PERCENT");
    setMinOrder("");
    setMaxUses("100");
    setExpiresAt("");
    setActive(true);
    setShowForm(false);
    setEditingId(null);
  };

  const startEdit = (coupon: Coupon) => {
    setEditingId(coupon.id);
    setCode(coupon.code);
    setDiscount(coupon.discount.toString());
    setType(coupon.type);
    setMinOrder(coupon.minOrder ? coupon.minOrder.toString() : "");
    setMaxUses(coupon.maxUses ? coupon.maxUses.toString() : "100");
    setExpiresAt(coupon.expiresAt ? coupon.expiresAt.split("T")[0] : "");
    setActive(coupon.active);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !discount)
      return showToast.error("Code and discount are required");

    setSaving(true);
    try {
      const token =
        localStorage.getItem("femcart_access_token") ||
        localStorage.getItem("token");
      const payload = {
        code: code.trim().toUpperCase(),
        discount: parseFloat(discount),
        type,
        minOrder: minOrder ? parseFloat(minOrder) : 0,
        maxUses: maxUses ? parseInt(maxUses) : 100,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
        active,
      };

      const url = editingId ? `${API}/${editingId}` : API;
      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showToast.success("Coupon saved successfully!");
        resetForm();
        fetchCoupons();
      } else {
        const err = await res.json();
        showToast.error(err.message || "Failed to save coupon data.");
      }
    } catch (err) {
      console.error(err);
      showToast.error("Network error occurred.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this coupon?")) return;
    try {
      const token =
        localStorage.getItem("femcart_access_token") ||
        localStorage.getItem("token");
      const res = await fetch(`${API}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) fetchCoupons();
      else showToast.error("Failed to delete");
    } catch {
      showToast.error("Network error");
    }
  };

  const fetchReport = async (code: string) => {
    setLoadingReport(true);
    setReportData(null);
    try {
      const token =
        localStorage.getItem("femcart_access_token") ||
        localStorage.getItem("token");
      const res = await fetch(`${API}/${code}/report`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) setReportData(json.data);
    } catch (e) {
      console.error(e);
      showToast.error("Failed to fetch report");
    } finally {
      setLoadingReport(false);
    }
  };

  const filteredCoupons = coupons.filter((c) =>
    c.code.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Report Loading Modal */}
      {loadingReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-xl flex items-center gap-4">
            <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="font-bold text-gray-700 dark:text-gray-200">
              Loading Report...
            </p>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {reportData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-200">
          <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                  <BarChart2 className="text-emerald-500" /> Coupon Report
                </h2>
                <p className="text-emerald-600 font-bold tracking-widest uppercase text-xs mt-1">
                  {reportData.code}
                </p>
              </div>
              <button
                onClick={() => setReportData(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-gray-500 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 mb-8">
              <div className="bg-gray-50 dark:bg-gray-800 p-5 rounded-2xl flex justify-between items-center border border-gray-100 dark:border-gray-700">
                <span className="text-sm font-bold text-gray-500">
                  Total Orders Using Coupon
                </span>
                <span className="text-2xl font-black text-gray-900 dark:text-white">
                  {reportData.totalOrders}
                </span>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-900/20 p-5 rounded-2xl flex justify-between items-center border border-emerald-100 dark:border-emerald-800/30">
                <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                  Total Discount Given
                </span>
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  Tk {(reportData.totalDiscount || 0).toFixed(2)}
                </span>
              </div>
            </div>

            <a
              href={`/admin/orders?couponCode=${reportData.code}`}
              className="w-full flex items-center justify-center gap-2 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold transition-all hover:scale-[1.02] active:scale-95 shadow-md shadow-gray-200 dark:shadow-none inline-block text-center cursor-pointer"
            >
              View Orders
            </a>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3 tracking-tight">
            <Ticket size={28} className="text-emerald-600" /> Coupon Management
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
            Create and manage discount codes for checkout
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-md active:scale-95 text-sm"
          >
            <Plus size={18} /> Add New Coupon
          </button>
        )}
      </div>

      <div className="flex flex-col lg:flex-row-reverse gap-8">
        {/* Form Section */}
        {showForm && (
          <aside className="w-full lg:w-[400px] shrink-0 animate-in slide-in-from-right duration-500">
            <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 p-8 shadow-2xl shadow-emerald-500/5 sticky top-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                  {editingId ? "Edit Coupon" : "Add New Coupon"}
                </h2>
                <button
                  onClick={resetForm}
                  className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider pl-1">
                    Coupon Code
                  </label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="e.g. SUMMER25"
                    className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-emerald-500 transition-all font-bold text-gray-900 dark:text-white uppercase"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider pl-1">
                      Discount
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={discount}
                      onChange={(e) => setDiscount(e.target.value)}
                      placeholder="e.g. 10"
                      className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-emerald-500 transition-all font-bold text-gray-900 dark:text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider pl-1">
                      Type
                    </label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as any)}
                      className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-emerald-500 transition-all font-bold text-gray-900 dark:text-white"
                    >
                      <option value="PERCENT">Percentage %</option>
                      <option value="FIXED">Fixed Amount ?</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider pl-1">
                    Min Order Amount (?)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={minOrder}
                    onChange={(e) => setMinOrder(e.target.value)}
                    placeholder="e.g. 500"
                    className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm font-bold text-gray-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider pl-1">
                      Max Uses
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={maxUses}
                      onChange={(e) => setMaxUses(e.target.value)}
                      className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm font-bold text-gray-900 dark:text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider pl-1">
                      Status
                    </label>
                    <button
                      type="button"
                      onClick={() => setActive(!active)}
                      className={`w-full py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-colors ${
                        active
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400"
                      }`}
                    >
                      {active ? (
                        <>
                          <Check size={16} /> Active
                        </>
                      ) : (
                        <>
                          <X size={16} /> Inactive
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider pl-1">
                    Expiration Date
                  </label>
                  <input
                    type="date"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm font-bold text-gray-900 dark:text-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-4 mt-4 bg-emerald-600 text-white rounded-xl font-black uppercase tracking-wider shadow-md hover:bg-emerald-700 active:scale-[0.98] transition-all disabled:opacity-50 text-sm"
                >
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Update Coupon"
                      : "Create Coupon"}
                </button>
              </form>
            </div>
          </aside>
        )}

        {/* List Section */}
        <div className="flex-1 bg-white dark:bg-gray-900 rounded-[3rem] border border-gray-100 dark:border-gray-800 p-8 shadow-sm">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                Coupons Overview
              </h3>
              <p className="text-xs text-gray-500">
                Manage checkout discount codes
              </p>
            </div>
            <div className="relative hidden md:block">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="text"
                placeholder="Search coupons..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-3 rounded-2xl border-none bg-gray-50 dark:bg-gray-800 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none text-gray-900 dark:text-white w-64 transition-all"
              />
            </div>
          </div>

          <div className="grid gap-4">
            {loading ? (
              <div className="py-20 text-center text-gray-400 font-medium">
                Fetching coupons...
              </div>
            ) : filteredCoupons.length === 0 ? (
              <div className="py-20 text-center">
                <Ticket size={48} className="mx-auto text-gray-200 mb-4" />
                <p className="text-gray-400 font-medium tracking-tight">
                  No coupons found.
                </p>
              </div>
            ) : (
              filteredCoupons.map((coupon) => (
                <div
                  key={coupon.id}
                  className={`group flex items-center justify-between p-4 rounded-3xl border transition-all ${
                    coupon.active
                      ? "border-gray-50 dark:border-gray-800 hover:border-emerald-100"
                      : "border-pink-50 dark:border-pink-900/20 bg-pink-50/50 dark:bg-pink-900/10"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${
                        coupon.active
                          ? "bg-emerald-50 dark:bg-emerald-900/30 border-emerald-100 dark:border-emerald-900/20 text-emerald-500"
                          : "bg-pink-50 dark:bg-pink-900/30 border-pink-100 dark:border-pink-900/20 text-pink-500"
                      }`}
                    >
                      <Ticket size={24} />
                    </div>
                    <div>
                      <p className="font-black text-lg text-gray-900 dark:text-white flex items-center gap-2">
                        {coupon.code}
                        {!coupon.active && (
                          <span className="bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest">
                            Inactive
                          </span>
                        )}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 mt-1">
                        <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                          {coupon.type === "PERCENT"
                            ? `${coupon.discount}% OFF`
                            : `Tk ${coupon.discount} OFF`}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                        <span className="text-[11px] font-bold text-gray-500 uppercase">
                          Min Tk {coupon.minOrder}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                        <span className="text-[11px] font-bold text-blue-500 uppercase">
                          Used {coupon.usedCount}/{coupon.maxUses}
                        </span>
                        {coupon.expiresAt && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                            <span
                              className={`text-[11px] font-bold uppercase ${new Date(coupon.expiresAt) < new Date() ? "text-pink-500" : "text-gray-500"}`}
                            >
                              Exp:{" "}
                              {new Date(coupon.expiresAt).toLocaleDateString()}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => fetchReport(coupon.code)}
                      title="View Report"
                      className="p-3 rounded-2xl hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-gray-400 hover:text-emerald-500 transition-colors"
                    >
                      <BarChart2 size={18} />
                    </button>
                    <button
                      onClick={() => startEdit(coupon)}
                      className="p-3 rounded-2xl hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-400 hover:text-blue-500 transition-colors"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(coupon.id)}
                      className="p-3 rounded-2xl hover:bg-pink-50 dark:hover:bg-pink-900/20 text-gray-400 hover:text-pink-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
