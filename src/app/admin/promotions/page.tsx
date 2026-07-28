"use client";
import { API_URL } from "@/lib/config";

import { showToast } from "@/lib/toast";
import { useSettingsStore } from "@/store/settingsStore";
import {
  Calculator,
  Calendar,
  CheckCircle2,
  Image as ImageIcon,
  PackageOpen,
  Percent,
  Search,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface Product {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  price: number;
  specialPrice: number | null;
  specialPriceStart: string | null;
  specialPriceEnd: string | null;
  stock: number;
  featured: boolean;
  productType: "SIMPLE" | "VARIABLE";
  categories: { id: string; name: string }[];
}

const API = `${API_URL}/api/products`;

export default function PromotionsPage() {
  const [activeTab, setActiveTab] = useState<"APPLY" | "ACTIVE">("APPLY");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination & Filtering
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const { settings } = useSettingsStore();

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showApplyModal, setShowApplyModal] = useState(false);

  // Filters state
  const [categoryFilter, setCategoryFilter] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<
    { id: string; name: string; slug: string }[]
  >([]);

  // Fetch categories and brands for filters
  useEffect(() => {
    fetch(`${API_URL}/api/categories`)
      .then((r) => r.json())
      .then((j) => {
        if (j.success) {
          const flatCats: any[] = [];
          const flatten = (cats: any[], depth = 0) => {
            cats.forEach((c) => {
              flatCats.push({ id: c.id, name: c.name, slug: c.slug, depth });
              if (c.children?.length) flatten(c.children, depth + 1);
            });
          };
          flatten(j.data || []);
          setCategories(flatCats);
        }
      })
      .catch(console.error);

    fetch(`${API_URL}/api/brands?limit=50`)
      .then((r) => r.json())
      .then((j) => j.success && setBrands(j.data || []))
      .catch(console.error);
  }, []);

  // Promotion Form Form State
  const [promoType, setPromoType] = useState<"PERCENT" | "FIXED">("PERCENT");
  const [promoValue, setPromoValue] = useState<string>("");
  const [promoStart, setPromoStart] = useState<string>("");
  const [promoEnd, setPromoEnd] = useState<string>("");
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (categoryFilter) params.set("category", categoryFilter);
      if (brandFilter) params.set("brand", brandFilter);
      if (activeTab === "ACTIVE") {
        params.set("hasPromotion", "true");
      } else if (activeTab === "APPLY") {
        params.set("hasPromotion", "false");
      }

      const res = await fetch(`${API}?${params}`);
      const json = await res.json();
      if (json.success) {
        setProducts(json.data || []);
        if (json.pagination) {
          setTotalPages(json.pagination.totalPages);
          setTotalItems(json.pagination.total);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, activeTab, categoryFilter, brandFilter]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Reset page and selections when tab or search or filters changes
  useEffect(() => {
    setPage(1);
    setSelectedIds(new Set());
  }, [debouncedSearch, activeTab, categoryFilter, brandFilter]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const newSelected = new Set(selectedIds);
      products.forEach((p) => newSelected.add(p.id));
      setSelectedIds(newSelected);
    } else {
      const newSelected = new Set(selectedIds);
      products.forEach((p) => newSelected.delete(p.id));
      setSelectedIds(newSelected);
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedIds(newSelected);
  };

  const isAllSelectedOnPage =
    products.length > 0 && products.every((p) => selectedIds.has(p.id));

  const handleApplyPromotion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIds.size === 0)
      return showToast.error("Select at least one product.");
    if (!promoValue || isNaN(Number(promoValue)) || Number(promoValue) <= 0)
      return showToast.error("Enter a valid discount value.");

    setApplying(true);
    try {
      const res = await fetch(`${API}/bulk-promotions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productIds: Array.from(selectedIds),
          type: promoType,
          value: Number(promoValue),
          startDate: promoStart || null,
          endDate: promoEnd || null,
          remove: false,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setShowApplyModal(false);
        setSelectedIds(new Set());
        setPromoValue("");
        setPromoStart("");
        setPromoEnd("");
        fetchProducts();
      } else {
        showToast.error(json.message || "Failed to apply promotion.");
      }
    } catch (err) {
      showToast.error("Network error.");
    } finally {
      setApplying(false);
    }
  };

  const handleRemovePromotions = async () => {
    if (selectedIds.size === 0)
      return showToast.error("Select at least one product.");
    if (
      !confirm(
        "Are you sure you want to remove the promotion from the selected products?",
      )
    )
      return;

    try {
      const res = await fetch(`${API}/bulk-promotions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productIds: Array.from(selectedIds),
          remove: true,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setSelectedIds(new Set());
        fetchProducts();
      } else {
        showToast.error(json.message || "Failed to remove promotions.");
      }
    } catch (err) {
      showToast.error("Network error.");
    }
  };

  const getSaleDates = (p: Product) => {
    if (!p.specialPriceStart && !p.specialPriceEnd) return "Active Sale";
    const start = p.specialPriceStart
      ? new Date(p.specialPriceStart).toLocaleDateString()
      : "Now";
    const end = p.specialPriceEnd
      ? new Date(p.specialPriceEnd).toLocaleDateString()
      : "Always";
    return `Sale: ${start} - ${end}`;
  };

  return (
    <div className="max-w-7xl mx-auto pb-12 relative">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
            <Percent className="text-emerald-500" size={32} />
            Promotions
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage bulk discounts and promotional offers
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
        <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
          <button
            onClick={() => setActiveTab("APPLY")}
            className={`flex-1 sm:flex-none uppercase tracking-wider text-xs font-bold px-6 py-4 flex items-center justify-center gap-2 transition-all border-b-2 ${
              activeTab === "APPLY"
                ? "border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-white dark:bg-gray-800"
                : "border-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            }`}
          >
            <CheckCircle2
              size={16}
              className={activeTab === "APPLY" ? "text-emerald-500" : ""}
            />{" "}
            Apply Promotion
          </button>
          <button
            onClick={() => setActiveTab("ACTIVE")}
            className={`flex-1 sm:flex-none uppercase tracking-wider text-xs font-bold px-6 py-4 flex items-center justify-center gap-2 transition-all border-b-2 ${
              activeTab === "ACTIVE"
                ? "border-amber-500 text-amber-600 dark:text-amber-400 bg-white dark:bg-gray-800"
                : "border-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            }`}
          >
            <Percent
              size={16}
              className={activeTab === "ACTIVE" ? "text-amber-500" : ""}
            />{" "}
            Active Promotions
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[300px]">
              <div className="relative flex-1 min-w-[200px]">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="Search products by product name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none text-gray-900 dark:text-white transition-all shadow-sm"
                />
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none text-gray-900 dark:text-white transition-all shadow-sm"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {"—".repeat(c.depth || 0)} {c.name}
                  </option>
                ))}
              </select>
              <select
                value={brandFilter}
                onChange={(e) => setBrandFilter(e.target.value)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none text-gray-900 dark:text-white transition-all shadow-sm"
              >
                <option value="">All Brands</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.slug}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 font-medium">Show:</span>
                <select
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setPage(1);
                  }}
                  className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-xs px-2 py-1 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-gray-900 dark:text-white transition-all shadow-sm"
                >
                  <option value={10}>10</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={500}>500</option>
                  <option value={1000}>1000</option>
                </select>
              </div>
              <div className="text-sm text-gray-500 font-medium">
                {totalItems} products found
              </div>
            </div>
          </div>
        </div>

        {/* Table View */}
        <div className="flex-1 overflow-x-auto relative">
          <table className="w-full text-left border-collapse min-w-[800px] text-sm">
            <thead className="sticky top-0 bg-gray-50/80 dark:bg-gray-800/80 z-10 backdrop-blur-sm">
              <tr>
                <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider align-middle border border-gray-200 dark:border-gray-700 w-[5%]">
                  <input
                    type="checkbox"
                    checked={isAllSelectedOnPage}
                    onChange={handleSelectAll}
                    disabled={products.length === 0}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 bg-white border-gray-300 transition-all dark:bg-gray-800 dark:border-gray-600 cursor-pointer"
                  />
                </th>
                <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider align-middle border border-gray-200 dark:border-gray-700 w-[10%]">
                  Product
                </th>
                <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider align-middle border border-gray-200 dark:border-gray-700 w-[35%]">
                  Name & Categories
                </th>
                <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider align-middle border border-gray-200 dark:border-gray-700 w-[15%]">
                  Price
                </th>
                <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider align-middle border border-gray-200 dark:border-gray-700 w-[15%]">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {loading && products.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-12 text-center text-gray-400 text-sm"
                  >
                    Loading products...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-16 text-center text-gray-500 bg-gray-50/30 dark:bg-gray-800/30"
                  >
                    <PackageOpen
                      size={48}
                      className="mx-auto mb-3 opacity-20"
                    />
                    <p className="font-semibold text-gray-700 dark:text-gray-300">
                      No products found
                    </p>
                    <p className="text-xs mt-1">
                      Try adjusting your search criteria.
                    </p>
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const isChecked = selectedIds.has(product.id);
                  return (
                    <tr
                      key={product.id}
                      className={`group transition-colors duration-200 hover:bg-gray-50/80 dark:hover:bg-gray-750/30 ${isChecked ? "bg-emerald-50/50 dark:bg-emerald-900/10" : ""}`}
                    >
                      <td className="px-6 py-4 align-middle border border-gray-200 dark:border-gray-750">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelect(product.id)}
                          className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 bg-white border-gray-300 transition-all dark:bg-gray-800 dark:border-gray-600 cursor-pointer"
                        />
                      </td>
                      <td className="px-6 py-4 align-middle border border-gray-200 dark:border-gray-750">
                        <div
                          className="w-12 h-12 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex items-center justify-center overflow-hidden shrink-0 cursor-pointer"
                          onClick={() =>
                            window.open(
                              settings?.permalink_structure === "product"
                                ? `/product/${product.slug}`
                                : `/${product.slug}`,
                              "_blank",
                            )
                          }
                        >
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <ImageIcon size={18} className="text-gray-400" />
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4 align-middle border border-gray-200 dark:border-gray-750">
                        <span
                          className="font-bold text-sm text-gray-800 dark:text-gray-200 line-clamp-1 cursor-pointer hover:text-emerald-600 transition-colors"
                          onClick={() =>
                            window.open(
                              settings?.permalink_structure === "product"
                                ? `/product/${product.slug}`
                                : `/${product.slug}`,
                              "_blank",
                            )
                          }
                        >
                          {product.name}
                        </span>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {product.categories.length > 0 ? (
                            product.categories.map((c) => (
                              <span
                                key={c.id}
                                className="inline-flex text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-semibold px-1.5 py-0.5 rounded"
                              >
                                {c.name}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-pink-500 dark:text-pink-400">
                              Uncategorized
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4 align-middle border border-gray-200 dark:border-gray-750">
                        <div className="flex flex-col">
                          {product.specialPrice &&
                          product.specialPrice < product.price ? (
                            <>
                              <span className="text-blue-600 dark:text-blue-400 font-bold">
                                ${product.specialPrice.toFixed(2)}
                              </span>
                              <span className="text-[10px] text-gray-400 line-through">
                                ${product.price.toFixed(2)}
                              </span>
                            </>
                          ) : (
                            <span className="font-semibold text-sm text-gray-700 dark:text-gray-300">
                              ${product.price.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4 align-middle border border-gray-200 dark:border-gray-750">
                        {product.specialPrice &&
                        product.specialPrice < product.price ? (
                          <span
                            className="inline-flex w-fit items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/50 cursor-help"
                            title={getSaleDates(product)}
                          >
                            %{" "}
                            {Math.round(
                              ((product.price - product.specialPrice) /
                                product.price) *
                                100,
                            )}
                            % OFF
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 pb-20">
            <span className="text-sm text-gray-600 dark:text-gray-400 font-medium overflow-hidden">
              Showing page{" "}
              <span className="font-bold text-gray-900 dark:text-white">
                {page}
              </span>{" "}
              of{" "}
              <span className="font-bold text-gray-900 dark:text-white">
                {totalPages}
              </span>
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors shadow-sm"
              >
                Prev
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors shadow-sm"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Floating Action Bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-auto md:right-12 z-50 bg-gray-900 text-white rounded-2xl shadow-2xl p-4 flex items-center gap-6 border border-gray-700 min-w-[320px] animate-in slide-in-from-bottom-5">
          <div className="font-bold">
            <span className="text-emerald-400">{selectedIds.size}</span>{" "}
            selected
          </div>
          <div className="flex-1 flex justify-end">
            {activeTab === "APPLY" ? (
              <button
                onClick={() => setShowApplyModal(true)}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2 rounded-xl font-bold transition-colors shadow-lg shadow-emerald-500/20 text-sm"
              >
                Configure Discount
              </button>
            ) : (
              <button
                onClick={handleRemovePromotions}
                className="bg-pink-500 hover:bg-pink-600 text-white px-5 py-2 rounded-xl font-bold transition-colors shadow-lg shadow-pink-500/20 text-sm"
              >
                Remove Discounts
              </button>
            )}
          </div>
        </div>
      )}

      {/* Apply Discount Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700 overflow-hidden slide-in-from-bottom-4 animate-in">
            <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                <Calculator className="text-emerald-500" size={20} /> Apply Bulk
                Discount
              </h3>
              <button
                onClick={() => setShowApplyModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleApplyPromotion} className="p-6 space-y-5">
              <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-sm p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/50 mb-4 font-medium">
                You are about to apply a discount to {selectedIds.size} product
                {selectedIds.size > 1 ? "s" : ""}.
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Discount Type
                </label>
                <div className="flex rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm">
                  <button
                    type="button"
                    onClick={() => setPromoType("PERCENT")}
                    className={`flex-1 py-2 text-sm font-bold transition ${promoType === "PERCENT" ? "bg-emerald-500 text-white" : "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-750"}`}
                  >
                    Percentage (%)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPromoType("FIXED")}
                    className={`flex-1 py-2 text-sm font-bold transition ${promoType === "FIXED" ? "bg-emerald-500 text-white" : "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-750"}`}
                  >
                    Fixed Amount ($)
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Discount Value
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                    {promoType === "PERCENT" ? <Percent size={14} /> : "$"}
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={promoValue}
                    onChange={(e) => setPromoValue(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-shadow text-gray-900 dark:text-white"
                    placeholder={`e.g., ${promoType === "PERCENT" ? "15" : "5.00"}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                    <Calendar size={14} /> Start Date{" "}
                    <span className="text-gray-400 font-normal ml-1">
                      (Opt)
                    </span>
                  </label>
                  <input
                    type="date"
                    value={promoStart}
                    onChange={(e) => setPromoStart(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-shadow text-gray-900 dark:text-white text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                    <Calendar size={14} /> End Date{" "}
                    <span className="text-gray-400 font-normal ml-1">
                      (Opt)
                    </span>
                  </label>
                  <input
                    type="date"
                    value={promoEnd}
                    onChange={(e) => setPromoEnd(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-shadow text-gray-900 dark:text-white text-sm"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="flex-1 py-2.5 rounded-xl font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={applying}
                  className="flex-1 py-2.5 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-600 disabled:opacity-70 text-white transition shadow-lg shadow-emerald-500/20"
                >
                  {applying ? "Applying..." : "Apply Discount"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
