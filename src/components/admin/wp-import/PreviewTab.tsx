"use client";
import { API_URL } from "@/lib/config";

import {
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Square,
} from "lucide-react";
import { useEffect, useState } from "react";

function getToken() {
  return typeof window !== "undefined"
    ? localStorage.getItem("femcart_access_token") ||
        localStorage.getItem("token") ||
        ""
    : "";
}

export default function PreviewTab() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const fetchProducts = async (p: number) => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(
        `${API_URL}/api/wordpress/products?page=${p}&per_page=10`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        },
      );
      if (!res.ok)
        throw new Error("Failed to fetch products. Check Connection Settings.");
      const data = await res.json();
      setProducts(data.data || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(page);
  }, [page]);

  const toggleSelect = (id: number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === products.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(products.map((p) => p.id)));
    }
  };

  const handleImportSelected = async () => {
    if (selectedIds.size === 0) return;
    setImporting(true);
    setMessage(null);
    try {
      const res = await fetch(`${API_URL}/api/wordpress/import/selected`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ productIds: Array.from(selectedIds) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to start import");
      setMessage({
        type: "success",
        text: "Import job for selected products has been queued successfully.",
      });
      setSelectedIds(new Set());
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Preview WooCommerce Products
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Browse products directly from your connected store before importing.
          </p>
        </div>
        <button
          onClick={handleImportSelected}
          disabled={selectedIds.size === 0 || loading || importing}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-medium rounded-xl transition-colors flex items-center gap-2"
        >
          {importing ? <Loader2 size={16} className="animate-spin" /> : null}
          Import Selected ({selectedIds.size})
        </button>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl text-sm font-medium ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-pink-50 text-pink-800 border border-pink-200"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-500">
              <tr>
                <th className="px-6 py-4 font-medium w-12 text-center">
                  <button
                    onClick={toggleSelectAll}
                    className="p-1 rounded text-gray-400 hover:text-emerald-500 transition-colors"
                  >
                    {products.length > 0 &&
                    selectedIds.size === products.length ? (
                      <CheckSquare size={18} />
                    ) : (
                      <Square size={18} />
                    )}
                  </button>
                </th>
                <th className="px-6 py-4 font-medium w-20">Image</th>
                <th className="px-6 py-4 font-medium">Product</th>
                <th className="px-6 py-4 font-medium">SKU</th>
                <th className="px-6 py-4 font-medium">Price</th>
                <th className="px-6 py-4 font-medium">Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-gray-400"
                  >
                    <Loader2
                      size={32}
                      className="animate-spin mx-auto mb-2 text-emerald-500"
                    />
                    <p>Loading products from WooCommerce...</p>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No products found. Check your Connection Settings.
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const isSelected = selectedIds.has(p.id);
                  const imgUrl = p.images?.[0]?.src;
                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-gray-50 transition-colors ${isSelected ? "bg-emerald-50/30" : ""}`}
                    >
                      <td className="px-6 py-3 text-center">
                        <button
                          onClick={() => toggleSelect(p.id)}
                          className={`p-1 rounded transition-colors ${isSelected ? "text-emerald-500" : "text-gray-300 hover:text-emerald-500"}`}
                        >
                          {isSelected ? (
                            <CheckSquare size={18} />
                          ) : (
                            <Square size={18} />
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden relative shadow-sm">
                          {imgUrl ? (
                            <img
                              src={imgUrl}
                              alt={p.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs text-center p-1">
                              No img
                            </div>
                          )}
                        </div>
                      </td>
                      <td
                        className="px-6 py-3 font-medium text-gray-900 truncate max-w-xs"
                        title={p.name}
                      >
                        <a
                          href={p.permalink}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:text-emerald-600 hover:underline"
                        >
                          {p.name}
                        </a>
                      </td>
                      <td className="px-6 py-3 text-gray-500">
                        {p.sku || "-"}
                      </td>
                      <td className="px-6 py-3 text-gray-900 font-medium">
                        ${p.price || "0.00"}
                      </td>
                      <td className="px-6 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${p.type === "variable" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}
                        >
                          {p.type}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between text-sm">
            <div className="text-gray-700 dark:text-gray-300 font-medium">
              Page{" "}
              <span className="font-bold text-gray-900 dark:text-white">
                {page}
              </span>{" "}
              of{" "}
              <span className="font-bold text-gray-900 dark:text-white">
                {totalPages}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1 border border-gray-200 rounded text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                title="Previous Page"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1 border border-gray-200 rounded text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                title="Next Page"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
