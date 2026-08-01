"use client";
import { API_URL } from "@/lib/config";

import { showToast } from "@/lib/toast";
import { useSettingsStore } from "@/store/settingsStore";
import {
  Image as ImageIcon,
  LayoutGrid,
  PackageOpen,
  Pencil,
  Plus,
  Search,
  Trash2,
  Star,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import Swal from "sweetalert2";
import { UndoToast } from "@/components/ui/UndoToast";
import { resolveImageUrl } from "@/lib/utils";
import DataTable, { DataTableColumn } from "@/components/ui/DataTable";

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
  brand: { id: string; name: string; slug: string } | null;
  priceRange?: { min: number; max: number } | null;
  variants?: { id: string; stock: number }[];
}

const API = `${API_URL}/api/products`;

function getToken() {
  return typeof window !== "undefined"
    ? localStorage.getItem("femcart_access_token") ||
        localStorage.getItem("token") ||
        ""
    : "";
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination & Filtering
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [stockStatusFilter, setStockStatusFilter] = useState("");
  const [productTypeFilter, setProductTypeFilter] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [pendingDeletions, setPendingDeletions] = useState<string[]>([]);
  const [showUndo, setShowUndo] = useState(false);
  const { settings } = useSettingsStore();

  // Columns layout configuration
  const columns: DataTableColumn<Product>[] = [
    {
      key: "image",
      header: "Product",
      thClassName: "w-[10%]",
      render: (product) => (
        <Link
          href={
            settings.permalink_structure === "product"
              ? `/product/${product.slug}`
              : `/${product.slug}`
          }
          target="_blank"
          rel="noopener noreferrer"
          className="w-14 h-14 rounded-xl border border-gray-200/80 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex items-center justify-center overflow-hidden shrink-0 shadow-sm group-hover:shadow-md transition-all duration-300 cursor-pointer block"
        >
          {product.image ? (
            <img
              src={resolveImageUrl(product.image)}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <ImageIcon size={20} className="text-gray-400" />
          )}
        </Link>
      ),
    },
    {
      key: "name",
      header: "Name",
      thClassName: "w-[22%]",
      render: (product) => (
        <Link
          href={
            settings.permalink_structure === "product"
              ? `/product/${product.slug}`
              : `/${product.slug}`
          }
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold text-sm text-gray-900 dark:text-gray-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 line-clamp-2 transition-colors"
          title={`View ${product.name} on live site`}
        >
          {product.name}
        </Link>
      ),
    },
    {
      key: "categories",
      header: "Categories",
      thClassName: "w-[18%]",
      render: (product) => {
        const catText =
          product.categories.length > 0
            ? product.categories.map((c) => c.name).join(", ")
            : "";
        return (
          <p
            className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-normal line-clamp-1 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors"
            title={catText}
          >
            {product.categories.length > 0 ? (
              catText
            ) : (
              <span className="text-[10px] font-bold text-pink-500 dark:text-pink-450">
                Uncategorized
              </span>
            )}
          </p>
        );
      },
    },
    {
      key: "brand",
      header: "Brand",
      thClassName: "w-[12%]",
      render: (product) =>
        product.brand ? (
          <p
            className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-normal line-clamp-1 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors"
            title={product.brand.name}
          >
            {product.brand.name}
          </p>
        ) : (
          <span className="text-xs text-gray-400">—</span>
        ),
    },
    {
      key: "price",
      header: "Price",
      thClassName: "w-[13%]",
      render: (product) => (
        <div>
          <div className="font-semibold text-sm text-gray-850 dark:text-gray-200">
            {formatPrice(product)}
          </div>
          {product.productType === "VARIABLE" && (
            <span className="inline-flex items-center gap-1 mt-1.5 text-[9px] bg-emerald-50 dark:bg-emerald-900/30 text-emerald-650 dark:text-emerald-450 font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
              <LayoutGrid size={10} /> Variable
            </span>
          )}
        </div>
      ),
    },
    {
      key: "stock",
      header: "Stock",
      thClassName: "w-[13%]",
      render: (product) => {
        if (product.productType === "VARIABLE") {
          const totalStock =
            product.variants?.reduce(
              (sum: number, v: any) => sum + (v.stock || 0),
              0,
            ) || 0;
          return (
            <div className="flex flex-col gap-1">
              <span
                className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold font-mono w-fit whitespace-nowrap ${
                  totalStock > 10
                    ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                    : totalStock > 0
                      ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                      : "bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400"
                }`}
              >
                {totalStock > 0 ? `${totalStock} in stock` : "Out of stock"}
              </span>
              <span className="text-[10px] text-gray-455 dark:text-gray-400 font-medium">
                ({product.variants?.length || 0} variants)
              </span>
            </div>
          );
        }

        return (
          <span
            className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold font-mono w-fit whitespace-nowrap ${
              product.stock > 10
                ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                : product.stock > 0
                  ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                  : "bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400"
            }`}
          >
            {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
          </span>
        );
      },
    },
    {
      key: "featured",
      header: "Featured",
      thClassName: "w-[9%]",
      render: (product) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleFeatured(product.id, !product.featured)}
            className={`p-2 rounded-xl transition-all duration-200 border hover:shadow-sm ${
              product.featured
                ? "bg-amber-50 dark:bg-amber-955/20 border-amber-200 dark:border-amber-900/50 text-amber-555 dark:text-amber-450 scale-105"
                : "bg-gray-50/50 dark:bg-gray-800 border-gray-150 dark:border-gray-700 text-gray-300 dark:text-gray-655 hover:text-amber-450 hover:bg-amber-50/30 dark:hover:bg-amber-955/10 hover:border-amber-100"
            }`}
            title={
              product.featured
                ? "Featured Product. Click to unfeature"
                : "Click to feature this product"
            }
          >
            <Star size={16} fill={product.featured ? "currentColor" : "none"} />
          </button>

          {product.specialPrice && product.specialPrice < product.price && (
            <span
              className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/50 cursor-help"
              title={getSaleDates(product)}
            >
              {Math.round(
                ((product.price - product.specialPrice) / product.price) * 100,
              )}
              % OFF
            </span>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      header: <div className="text-right">Actions</div>,
      thClassName: "text-right w-[10%]",
      tdClassName: "text-right",
      render: (product) => {
        const isMultipleSelected = selectedProducts.length > 1;
        return (
          <div className="flex items-center justify-end gap-2">
            {isMultipleSelected ? (
              <button
                disabled
                className="p-2 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-gray-300 dark:text-gray-600 cursor-not-allowed opacity-50"
                title="Edit disabled when multiple selected"
              >
                <Pencil size={15} />
              </button>
            ) : (
              <Link
                href={`/admin/products/edit/${product.slug}`}
                className="p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-550 hover:text-emerald-600 hover:border-emerald-250 dark:hover:border-emerald-900/50 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 transition-all shadow-sm hover:shadow active:scale-95"
                title="Edit Product"
              >
                <Pencil size={15} />
              </Link>
            )}
            <button
              onClick={() => handleDeleteClick(product.id)}
              disabled={isMultipleSelected}
              className={`p-2 rounded-xl border transition-all shadow-sm ${
                isMultipleSelected
                  ? "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-300 dark:text-gray-600 cursor-not-allowed opacity-50"
                  : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-550 hover:text-pink-650 hover:border-pink-250 dark:hover:border-pink-900/50 hover:bg-pink-50/50 dark:hover:bg-pink-900/20 hover:shadow active:scale-95"
              }`}
              title={
                isMultipleSelected
                  ? "Delete disabled when multiple selected"
                  : "Delete Product"
              }
            >
              <Trash2 size={15} />
            </button>
          </div>
        );
      },
    },
  ];

  // Responsive mobile layout card builder
  const renderMobileCard = (
    product: Product,
    isSelected: boolean,
    onToggleSelect: () => void,
  ) => {
    return (
      <div
        className={`bg-white dark:bg-gray-800 rounded-2xl border p-4 space-y-3.5 shadow-sm transition-all duration-300 relative overflow-hidden ${
          isSelected
            ? "border-emerald-400 dark:border-emerald-500/50 bg-emerald-50/20 dark:bg-emerald-500/5 shadow-md shadow-emerald-500/10"
            : "border-gray-100 dark:border-white/5 hover:border-emerald-200 dark:hover:border-emerald-500/20 hover:shadow-md"
        }`}
      >
        <div className="flex items-start gap-4">
          <input
            type="checkbox"
            className="rounded border-gray-300 dark:border-gray-655 text-emerald-600 focus:ring-emerald-500 bg-white dark:bg-gray-700 w-4.5 h-4.5 cursor-pointer mt-1 shrink-0"
            checked={isSelected}
            onChange={(e) => {
              e.stopPropagation();
              onToggleSelect();
            }}
          />
          <div className="w-16 h-16 rounded-xl border border-gray-200/80 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
            {product.image ? (
              <img
                src={resolveImageUrl(product.image)}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <ImageIcon size={22} className="text-gray-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <Link
              href={
                settings.permalink_structure === "product"
                  ? `/product/${product.slug}`
                  : `/${product.slug}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-sm text-gray-900 dark:text-gray-150 line-clamp-2 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            >
              {product.name}
            </Link>
            <div className="mt-2 space-y-1.5">
              {product.brand && (
                <p
                  className="text-[11px] text-gray-500 dark:text-gray-400 font-medium leading-normal line-clamp-1"
                  title={product.brand.name}
                >
                  {product.brand.name}
                </p>
              )}
              <p
                className="text-[11px] text-gray-500 dark:text-gray-400 font-medium leading-normal line-clamp-1"
                title={product.categories.map((c) => c.name).join(", ")}
              >
                {product.categories.length > 0 ? (
                  product.categories.map((c) => c.name).join(", ")
                ) : (
                  <span className="text-[9px] font-bold text-pink-550">
                    Uncategorized
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="h-px bg-gray-100 dark:bg-gray-750/50" />

        <div className="flex justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div>{formatPrice(product)}</div>
            {product.productType === "VARIABLE" ? (
              (() => {
                const totalStock =
                  product.variants?.reduce(
                    (sum: number, v: any) => sum + (v.stock || 0),
                    0,
                  ) || 0;
                return (
                  <span
                    className={`inline-flex px-2 py-0.5 rounded text-[10px] font-black font-mono w-fit whitespace-nowrap ${
                      totalStock > 10
                        ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                        : totalStock > 0
                          ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                          : "bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400"
                    }`}
                  >
                    {totalStock > 0 ? `${totalStock} in stock` : "Out of stock"}
                  </span>
                );
              })()
            ) : (
              <span
                className={`inline-flex px-2 py-0.5 rounded text-[10px] font-black font-mono w-fit whitespace-nowrap ${
                  product.stock > 10
                    ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                    : product.stock > 0
                      ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                      : "bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400"
                }`}
              >
                {product.stock > 0
                  ? `${product.stock} in stock`
                  : "Out of stock"}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleFeatured(product.id, !product.featured)}
              className={`p-1.5 rounded-lg border transition-colors ${
                product.featured
                  ? "bg-amber-50 dark:bg-amber-955/20 border-amber-200 dark:border-amber-900/50 text-amber-550"
                  : "bg-gray-50/50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-300 dark:text-gray-550"
              }`}
            >
              <Star
                size={14}
                fill={product.featured ? "currentColor" : "none"}
              />
            </button>
            {(() => {
              const isMultipleSelected = selectedProducts.length > 1;
              return isMultipleSelected ? (
                <button
                  disabled
                  className="p-1.5 rounded-lg bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-gray-300 dark:text-gray-600 cursor-not-allowed opacity-50"
                >
                  <Pencil size={14} />
                </button>
              ) : (
                <Link
                  href={`/admin/products/edit/${product.slug}`}
                  className="p-1.5 rounded-lg bg-gray-50/50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-550 dark:text-gray-400 hover:text-emerald-600 transition-colors"
                >
                  <Pencil size={14} />
                </Link>
              );
            })()}
            {(() => {
              const isMultipleSelected = selectedProducts.length > 1;
              return (
                <button
                  onClick={() => handleDeleteClick(product.id)}
                  disabled={isMultipleSelected}
                  className={`p-1.5 rounded-lg border transition-colors ${
                    isMultipleSelected
                      ? "bg-gray-50/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-300 dark:text-gray-600 cursor-not-allowed opacity-50"
                      : "bg-gray-50/50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-550 dark:text-gray-450 hover:text-pink-650"
                  }`}
                >
                  <Trash2 size={14} />
                </button>
              );
            })()}
          </div>
        </div>
      </div>
    );
  };

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
      if (stockStatusFilter) params.set("stockStatus", stockStatusFilter);
      if (productTypeFilter) params.set("productType", productTypeFilter);

      const res = await fetch(`${API}?${params}`);
      const json = await res.json();
      if (json.success) {
        setProducts(json.data || []);
        if (json.pagination) {
          setTotalPages(json.pagination.totalPages);
          setTotalItems(json.pagination.total);
        }
        setSelectedProducts([]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, stockStatusFilter, productTypeFilter]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Reset to page 1 when search or filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, stockStatusFilter, productTypeFilter]);

  const toggleFeatured = async (id: string, currentFeatured: boolean) => {
    try {
      const res = await fetch(`${API}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ featured: currentFeatured }),
      });
      const json = await res.json();
      if (json.success) {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === id ? { ...p, featured: currentFeatured } : p,
          ),
        );
        showToast.success(
          `Product ${currentFeatured ? "marked as featured" : "removed from featured"}`,
        );
      } else {
        showToast.error(json.message || "Failed to update featured state");
      }
    } catch (e) {
      showToast.error("Network error");
    }
  };

  const executeDeletions = async (idsToDrop: string[]) => {
    try {
      const res = await fetch(`${API}/bulk-delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ productIds: idsToDrop }),
      });
      if (res.ok) {
        fetchProducts();
      } else {
        const err = await res.json();
        showToast.error(err.message || "Failed to delete products");
      }
    } catch (e) {
      showToast.error("Network error");
    }
  };

  const initiateDeleteFlow = async (ids: string[], isBulk: boolean) => {
    const result = await Swal.fire({
      title: "Permanently Delete Products?",
      text: `You are about to delete ${ids.length} product(s). This action will permanently remove them from the database.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete permanently",
      cancelButtonText: "Cancel",
      background: settings.theme === "dark" ? "#1f2937" : "#ffffff",
      color: settings.theme === "dark" ? "#f9fafb" : "#111827",
    });

    if (!result.isConfirmed) return;

    setPendingDeletions((prev) => [...new Set([...prev, ...ids])]);
    if (isBulk) setSelectedProducts([]);

    setShowUndo(true);
  };

  const handleUndoComplete = () => {
    executeDeletions(pendingDeletions);
    setShowUndo(false);
    setPendingDeletions([]);
  };

  const handleUndoCancel = () => {
    setShowUndo(false);
    setPendingDeletions([]);
    showToast.success("Deletion cancelled");
  };

  const handleDeleteClick = (id: string) => {
    initiateDeleteFlow([id], false);
  };

  const initiateBulkDelete = () => {
    initiateDeleteFlow(selectedProducts, true);
  };

  const formatPrice = (p: Product) => {
    if (p.productType === "VARIABLE" && p.priceRange) {
      if (p.priceRange.min === p.priceRange.max)
        return (
          <span className="font-mono text-sm">
            ৳ {p.priceRange.min.toFixed(2)}
          </span>
        );
      return (
        <span className="font-mono text-xs md:text-sm">
          ৳ {p.priceRange.min.toFixed(2)} – ৳ {p.priceRange.max.toFixed(2)}
        </span>
      );
    }

    const isOnSale = p.specialPrice && p.specialPrice < p.price;
    if (isOnSale) {
      return (
        <div className="flex flex-col">
          <span className="text-emerald-600 dark:text-emerald-400 font-bold font-mono text-sm">
            ৳ {p.specialPrice?.toFixed(2)}
          </span>
          <span className="text-xs text-gray-400 line-through font-mono">
            ৳ {p.price.toFixed(2)}
          </span>
        </div>
      );
    }

    return <span className="font-mono text-sm">৳ {p.price.toFixed(2)}</span>;
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

  const visibleProducts = products.filter(
    (p) => !pendingDeletions.includes(p.id),
  );

  return (
    <div className="max-w-7xl mx-auto pb-12 px-4 sm:px-6">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            Products
          </h1>
          <p className="text-gray-500 dark:text-gray-405 mt-1 text-sm">
            Create, manage, and monitor all your inventory items
          </p>
        </div>
        <Link
          href="/admin/products/create"
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-emerald-600/20 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus size={18} /> Add New Product
        </Link>
      </div>

      <div className="flex flex-col min-h-[500px] bg-transparent border-none shadow-none">
        {/* Toolbar */}
        <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-750 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 shadow-sm min-h-[72px]">
          {selectedProducts.length > 0 ? (
            <div className="flex flex-1 items-center justify-between w-full animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center gap-4">
                <div className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 w-8 h-8 rounded-full flex items-center justify-center font-bold font-mono">
                  {selectedProducts.length}
                </div>
                <span className="font-semibold text-gray-700 dark:text-gray-200">
                  Products Selected
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedProducts([])}
                  className="px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={initiateBulkDelete}
                  className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-transform active:scale-95 shadow-md shadow-pink-600/10"
                >
                  <Trash2 size={16} /> Delete Selected
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-1 flex-wrap items-center gap-3 animate-in fade-in duration-200">
                <div className="relative w-full max-w-xs">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={16}
                  />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-750 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none text-gray-900 dark:text-white transition-all shadow-sm"
                  />
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2">
                  <select
                    value={productTypeFilter}
                    onChange={(e) => {
                      setProductTypeFilter(e.target.value);
                      setPage(1);
                    }}
                    className="bg-white dark:bg-gray-750 border border-gray-200 dark:border-gray-600 rounded-xl text-xs px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-gray-700 dark:text-gray-200 transition-all shadow-sm font-semibold cursor-pointer"
                  >
                    <option value="">All Types</option>
                    <option value="SIMPLE">Simple Product</option>
                    <option value="VARIABLE">Variable Product</option>
                  </select>

                  <select
                    value={stockStatusFilter}
                    onChange={(e) => {
                      setStockStatusFilter(e.target.value);
                      setPage(1);
                    }}
                    className="bg-white dark:bg-gray-750 border border-gray-200 dark:border-gray-600 rounded-xl text-xs px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-gray-700 dark:text-gray-200 transition-all shadow-sm font-semibold cursor-pointer"
                  >
                    <option value="">All Stock</option>
                    <option value="IN_STOCK">In Stock (&gt;10)</option>
                    <option value="LOW_STOCK">Low Stock (1-10)</option>
                    <option value="OUT_OF_STOCK">Out of Stock</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0 justify-between md:justify-end animate-in fade-in duration-200">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 font-medium">
                    Show:
                  </span>
                  <select
                    value={limit}
                    onChange={(e) => {
                      setLimit(Number(e.target.value));
                      setPage(1);
                    }}
                    className="bg-white dark:bg-gray-750 border border-gray-200 dark:border-gray-600 rounded-lg text-xs px-2 py-1 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-gray-900 dark:text-white transition-all shadow-sm"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
                <div className="text-sm text-gray-500 font-semibold tracking-wide bg-gray-100 dark:bg-gray-750 px-3 py-1 rounded-lg">
                  {totalItems} products
                </div>
              </div>
            </>
          )}
        </div>
        {/* Table View */}
        <div className="flex-1">
          <DataTable
            data={visibleProducts}
            columns={columns}
            loading={loading}
            enableSelection
            selectedIds={selectedProducts}
            onSelectChange={setSelectedProducts}
            renderMobileCard={renderMobileCard}
            tableWrapperClassName="hidden md:block overflow-x-auto w-full"
            emptyState={
              <div className="flex flex-col items-center justify-center py-20 text-gray-500 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-750 rounded-2xl">
                <PackageOpen
                  size={48}
                  className="mx-auto mb-3 opacity-20 text-gray-400"
                />
                <p className="font-semibold text-gray-700 dark:text-gray-300">
                  No products found
                </p>
                <p className="text-xs mt-1 text-gray-400">
                  Try adjusting your search or filters.
                </p>
              </div>
            }
          />
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-750 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 shadow-sm">
            <span className="text-sm text-gray-500 dark:text-gray-400 font-medium order-2 sm:order-1">
              Showing page{" "}
              <span className="font-bold text-gray-700 dark:text-gray-200">
                {page}
              </span>{" "}
              of{" "}
              <span className="font-bold text-gray-700 dark:text-gray-200">
                {totalPages}
              </span>
            </span>
            <div className="flex items-center gap-1 order-1 sm:order-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1.5 rounded-lg border border-gray-250 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-650 disabled:opacity-50 disabled:hover:bg-transparent transition-colors shadow-sm cursor-pointer"
              >
                Previous
              </button>

              <div className="flex items-center gap-1 mx-1">
                {/* Modern Pagination Logic */}
                {(() => {
                  const pages = [];
                  const delta = 2; // Number of pages either side of current page
                  const left = page - delta;
                  const right = page + delta + 1;
                  const range = [];
                  const rangeWithDots = [];
                  let l;

                  for (let i = 1; i <= totalPages; i++) {
                    if (
                      i === 1 ||
                      i === totalPages ||
                      (i >= left && i < right)
                    ) {
                      range.push(i);
                    }
                  }

                  for (const i of range) {
                    if (l) {
                      if (i - l === 2) {
                        rangeWithDots.push(l + 1);
                      } else if (i - l !== 1) {
                        rangeWithDots.push("...");
                      }
                    }
                    rangeWithDots.push(i);
                    l = i;
                  }

                  return rangeWithDots.map((p, index) => (
                    <button
                      key={index}
                      onClick={() => typeof p === "number" && setPage(p)}
                      disabled={p === "..."}
                      className={`min-w-[32px] h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${
                        p === page
                          ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/10"
                          : p === "..."
                            ? "text-gray-400 cursor-default"
                            : "text-gray-650 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                      }`}
                    >
                      {p}
                    </button>
                  ));
                })()}
              </div>

              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 rounded-lg border border-gray-250 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-650 disabled:opacity-50 disabled:hover:bg-transparent transition-colors shadow-sm cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <UndoToast
        isOpen={showUndo}
        message={`Deleting ${pendingDeletions.length} product(s)`}
        duration={10}
        onUndo={handleUndoCancel}
        onComplete={handleUndoComplete}
        onDismiss={handleUndoCancel}
      />
    </div>
  );
}
