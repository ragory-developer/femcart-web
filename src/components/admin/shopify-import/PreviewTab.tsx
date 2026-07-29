"use client";
import { API_URL } from "@/lib/config";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Square,
  Image as ImageIcon,
  ExternalLink,
  Package,
  ArrowRightCircle
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

  const fetchProducts = async (p: number) => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_URL}/api/shopify/products?page=${p}&per_page=10`,
        { headers: { Authorization: `Bearer ${getToken()}` } },
      );
      
      const data = await res.json().catch(() => null);
      
      if (!res.ok) {
        // If there are no settings configured yet, just fail silently and show empty state
        if (data?.message === 'No shopify settings configured') {
          setProducts([]);
          return;
        }
        throw new Error(data?.message || "Failed to fetch products. Check Connection Settings.");
      }
      
      setProducts(data?.data || []);
      setTotalPages(data?.pagination?.totalPages || 1);
    } catch (err: any) {
      toast.error(err.message || "Failed to load products.");
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
    try {
      const res = await fetch(`${API_URL}/api/shopify/import/selected`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ productIds: Array.from(selectedIds) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to start import");
      toast.success("Import job for selected products has been queued successfully.");
      setSelectedIds(new Set());
    } catch (err: any) {
      toast.error(err.message || "Something went wrong.");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="relative pb-24">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Package size={20} className="text-emerald-600" /> Preview Shopify Products
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Browse products directly from your connected store before importing.
          </p>
        </div>
      </div>

      <div className="bg-white border border-gray-200/80 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50/80 border-b border-gray-100 text-gray-500">
              <tr>
                <th className="px-6 py-4 font-semibold w-12 text-center">
                  <button
                    onClick={toggleSelectAll}
                    disabled={products.length === 0}
                    className="p-1 rounded text-gray-400 hover:text-emerald-600 transition-colors disabled:opacity-50"
                  >
                    {products.length > 0 && selectedIds.size === products.length ? (
                      <CheckSquare size={18} className="text-emerald-600" />
                    ) : (
                      <Square size={18} />
                    )}
                  </button>
                </th>
                <th className="px-6 py-4 font-semibold w-20">Media</th>
                <th className="px-6 py-4 font-semibold">Product Name</th>
                <th className="px-6 py-4 font-semibold">SKU</th>
                <th className="px-6 py-4 font-semibold">Price</th>
                <th className="px-6 py-4 font-semibold">Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-gray-400">
                    <Loader2 size={32} className="animate-spin mx-auto mb-3 text-emerald-500" />
                    <p className="font-medium text-gray-500">Fetching products from Shopify...</p>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-gray-500 bg-gray-50/30">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 mx-auto mb-4">
                      <ImageIcon size={28} className="text-gray-400" />
                    </div>
                    <p className="font-semibold text-gray-700">No products found</p>
                    <p className="text-sm mt-1">Please check your Connection Settings.</p>
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const isSelected = selectedIds.has(p.id);
                  const imgUrl = p.images?.[0]?.src;
                  return (
                    <tr
                      key={p.id}
                      className={`transition-colors cursor-pointer group ${
                        isSelected ? "bg-emerald-50/40" : "hover:bg-gray-50/60"
                      }`}
                      onClick={() => toggleSelect(p.id)}
                    >
                      <td className="px-6 py-3 text-center">
                        <button
                          className={`p-1 rounded transition-colors ${
                            isSelected ? "text-emerald-600" : "text-gray-300 group-hover:text-emerald-400"
                          }`}
                        >
                          {isSelected ? <CheckSquare size={18} /> : <Square size={18} />}
                        </button>
                      </td>
                      <td className="px-6 py-3">
                        <div className="w-12 h-12 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden relative shadow-sm">
                          {imgUrl ? (
                            <img src={imgUrl} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 p-1">
                              <ImageIcon size={16} />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-3 font-semibold text-gray-900 truncate max-w-[200px] sm:max-w-xs" title={p.name}>
                        <a
                          href={p.permalink}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="hover:text-emerald-600 flex items-center gap-1.5 transition-colors"
                        >
                          {p.name}
                          <ExternalLink size={12} className="text-gray-400" />
                        </a>
                      </td>
                      <td className="px-6 py-3 text-gray-500 font-mono text-xs">
                        {p.sku || <span className="text-gray-300 italic">Not set</span>}
                      </td>
                      <td className="px-6 py-3 text-gray-900 font-semibold">
                        ${p.price || "0.00"}
                      </td>
                      <td className="px-6 py-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                            p.type === "variable" 
                              ? "bg-purple-50 text-purple-600 border border-purple-200" 
                              : "bg-blue-50 text-blue-600 border border-blue-200"
                          }`}
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
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between text-sm bg-gray-50/50">
            <div className="text-gray-600 font-medium">
              Page <span className="font-bold text-gray-900">{page}</span> of <span className="font-bold text-gray-900">{totalPages}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 border border-gray-200 bg-white rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors shadow-sm"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 border border-gray-200 bg-white rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors shadow-sm"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Floating Action Bar */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-gray-900/95 backdrop-blur-md text-white px-6 py-4 rounded-2xl shadow-2xl shadow-black/20 border border-white/10"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                {selectedIds.size}
              </div>
              <span className="font-medium text-sm">products selected</span>
            </div>
            
            <div className="w-px h-8 bg-white/10 mx-2"></div>
            
            <button
              onClick={handleImportSelected}
              disabled={importing}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold rounded-xl transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20"
            >
              {importing ? <Loader2 size={16} className="animate-spin" /> : <ArrowRightCircle size={16} />}
              {importing ? "Importing..." : "Import Selected"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
