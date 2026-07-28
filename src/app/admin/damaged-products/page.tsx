"use client";

import { API_URL } from "@/lib/config";
import {
  PackageOpen,
  PackageMinus,
  Search,
  ShoppingCart,
  Users,
  RefreshCw,
} from "lucide-react";
import React, { useEffect, useState } from "react";

interface User {
  name: string;
  email: string | null;
}

interface Order {
  id: string;
  status: string;
  createdAt: string;
  user: User;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
}

interface OrderItem {
  id: string;
  quantity: number;
  damagedQuantity: number;
  price: number;
  product: Product | null;
  variant?: { product: Product } | null;
  order: Order;
}

const getFirstImage = (imagesData: any) => {
  if (!imagesData) return null;
  if (Array.isArray(imagesData) && imagesData.length > 0) return imagesData[0];
  if (typeof imagesData === "string") {
    try {
      const parsed = JSON.parse(imagesData);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : null;
    } catch (e) {
      if (imagesData.startsWith("http") || imagesData.startsWith("/"))
        return imagesData;
      return null;
    }
  }
  return null;
};

export default function DamagedProductsPage() {
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchProduct, setSearchProduct] = useState("");
  const [restockingId, setRestockingId] = useState<string | null>(null);

  const [restockModalOpen, setRestockModalOpen] = useState(false);
  const [restockItem, setRestockItem] = useState<{
    id: string;
    maxQty: number;
    productName: string;
  } | null>(null);
  const [restockQuantity, setRestockQuantity] = useState(1);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const token =
        localStorage.getItem("femcart_access_token") ||
        localStorage.getItem("token") ||
        "";
      const res = await fetch(`${API_URL}/api/orders/damaged-items?limit=100`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (data.success) {
        setItems(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch damaged items:", error);
    } finally {
      setLoading(false);
    }
  };

  const openRestockModal = (item: OrderItem) => {
    const productName =
      (item.product || item.variant?.product)?.name || "Unknown Product";
    setRestockItem({ id: item.id, maxQty: item.damagedQuantity, productName });
    setRestockQuantity(item.damagedQuantity);
    setRestockModalOpen(true);
  };

  const handleConfirmRestock = async () => {
    if (!restockItem) return;
    if (restockQuantity <= 0 || restockQuantity > restockItem.maxQty) {
      alert("Invalid quantity.");
      return;
    }

    try {
      setRestockingId(restockItem.id);
      const token =
        localStorage.getItem("femcart_access_token") ||
        localStorage.getItem("token") ||
        "";
      const res = await fetch(
        `${API_URL}/api/orders/damaged-items/${restockItem.id}/restock`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ quantity: restockQuantity }),
        },
      );

      const data = await res.json();
      if (data.success) {
        setRestockModalOpen(false);
        fetchItems(); // Refresh
      } else {
        alert(data.message || "Failed to restock.");
      }
    } catch (error) {
      console.error("Restock error:", error);
      alert("An error occurred while restocking.");
    } finally {
      setRestockingId(null);
    }
  };

  // Filter Logic
  const filteredItems = items.filter((item) => {
    if (searchProduct) {
      const actualProduct = item.product || item.variant?.product;
      const matchName = actualProduct?.name
        ?.toLowerCase()
        .includes(searchProduct.toLowerCase());
      const matchOrder = item.order?.id
        ?.toLowerCase()
        .includes(searchProduct.toLowerCase());
      if (!matchName && !matchOrder) return false;
    }
    return true;
  });

  const totalDamagedValue = filteredItems.reduce(
    (sum, item) => sum + item.price * item.damagedQuantity,
    0,
  );
  const totalItemsDamaged = filteredItems.reduce(
    (sum, item) => sum + item.damagedQuantity,
    0,
  );

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMins = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMins / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 0)
      return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
    if (diffInHours > 0)
      return `${diffInHours} hr${diffInHours > 1 ? "s" : ""} ago`;
    return `${diffInMins} min${diffInMins !== 1 ? "s" : ""} ago`;
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
          <PackageMinus className="text-rose-500" size={32} />
          Damaged Products
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Track and manage items returned by customers due to damage.
        </p>
      </div>

      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-[1.5rem] p-6 border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-900/20 text-rose-600 flex items-center justify-center shrink-0">
            <PackageMinus size={28} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
              Total Items Damaged
            </p>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white">
              {totalItemsDamaged} Units
            </h3>
            <p className="text-xs font-bold text-gray-400 mt-1">
              Pending review or write-off
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-[1.5rem] p-6 border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 flex items-center justify-center shrink-0">
            <ShoppingCart size={28} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
              Total Value Lost
            </p>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white">
              ${totalDamagedValue.toFixed(2)}
            </h3>
            <p className="text-xs font-bold text-gray-400 mt-1">
              Estimated loss
            </p>
          </div>
        </div>
      </div>

      {/* Filters and Table Container */}
      <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
        {/* Filters Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-gray-100 dark:border-gray-800">
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-auto">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search products or order ID..."
                value={searchProduct}
                onChange={(e) => setSearchProduct(e.target.value)}
                className="w-full sm:w-72 pl-10 pr-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-rose-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto overflow-hidden rounded-xl border border-gray-200 dark:border-gray-750 shadow-sm">
          <table className="w-full text-left border-collapse min-w-[800px] text-sm">
            <thead>
              <tr className="bg-gray-50/80 dark:bg-gray-800/80">
                <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider align-middle border border-gray-200 dark:border-gray-700">
                  Order & Customer
                </th>
                <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider align-middle border border-gray-200 dark:border-gray-700">
                  Damaged Product
                </th>
                <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider align-middle border border-gray-200 dark:border-gray-700 text-center">
                  Qty
                </th>
                <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider align-middle border border-gray-200 dark:border-gray-700 text-right">
                  Value
                </th>
                <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider align-middle border border-gray-200 dark:border-gray-700 text-right">
                  Time
                </th>
                <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider align-middle border border-gray-200 dark:border-gray-700 text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-8 text-center text-gray-500 font-medium"
                  >
                    Loading damaged items...
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8">
                    <div className="flex flex-col items-center justify-center gap-3 text-gray-400">
                      <PackageOpen
                        size={48}
                        className="text-gray-300 dark:text-gray-700"
                      />
                      <p className="font-medium text-gray-500">
                        No damaged items found.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr
                    key={item.id}
                    className="group transition-colors duration-200 hover:bg-gray-50/80 dark:hover:bg-gray-750/30"
                  >
                    <td className="px-6 py-4 align-middle border border-gray-200 dark:border-gray-750">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                          <Users size={18} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-gray-900 dark:text-white">
                              {item.order?.user?.name || "Customer"}
                            </p>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5 font-mono">
                            Order: {item.order?.id}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 align-middle border border-gray-200 dark:border-gray-750">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden shrink-0 border border-gray-200 dark:border-gray-700">
                          {(() => {
                            const p = item.product || item.variant?.product;
                            const img = getFirstImage(p?.images);
                            return img ? (
                              <img
                                src={img}
                                alt={p?.name || "Product"}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <PackageOpen size={16} />
                              </div>
                            );
                          })()}
                        </div>
                        <p className="font-bold text-gray-800 dark:text-gray-200 line-clamp-1">
                          {(item.product || item.variant?.product)?.name ||
                            "Unknown Product"}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 align-middle border border-gray-200 dark:border-gray-750 text-center font-black text-rose-600 dark:text-rose-400 text-lg">
                      {item.damagedQuantity}
                    </td>
                    <td className="px-6 py-4 align-middle border border-gray-200 dark:border-gray-750 font-black text-gray-700 dark:text-gray-300 text-right text-lg">
                      ${(item.price * item.damagedQuantity).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 align-middle border border-gray-200 dark:border-gray-750 text-right text-gray-500 text-xs font-medium">
                      {formatRelativeTime(item.order.createdAt)}
                    </td>
                    <td className="px-6 py-4 align-middle border border-gray-200 dark:border-gray-750 text-center">
                      <button
                        onClick={() => openRestockModal(item)}
                        disabled={restockingId === item.id}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <RefreshCw
                          size={14}
                          className={
                            restockingId === item.id ? "animate-spin" : ""
                          }
                        />
                        {restockingId === item.id ? "Restocking..." : "Restock"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Restock Modal */}
      {restockModalOpen && restockItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
            onClick={() => !restockingId && setRestockModalOpen(false)}
          />
          <div className="bg-white dark:bg-gray-900 rounded-[2rem] w-full max-w-md shadow-2xl z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 text-white flex items-center gap-4 bg-emerald-500">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                <RefreshCw size={24} />
              </div>
              <div>
                <h3 className="font-black text-xl uppercase tracking-widest">
                  Restock Item
                </h3>
                <p className="text-white/80 text-sm font-medium line-clamp-1">
                  {restockItem.productName}
                </p>
              </div>
            </div>

            <div className="p-8">
              <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-3">
                Quantity to Restock
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max={restockItem.maxQty}
                  value={restockQuantity}
                  onChange={(e) =>
                    setRestockQuantity(parseInt(e.target.value) || 1)
                  }
                  className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-xl px-4 py-4 text-xl font-black text-center text-gray-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">
                  Max: {restockItem.maxQty}
                </span>
              </div>
            </div>

            <div className="p-6 bg-gray-50 dark:bg-gray-800/50 flex gap-3">
              <button
                onClick={() => setRestockModalOpen(false)}
                disabled={restockingId !== null}
                className="flex-1 py-4 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRestock}
                disabled={restockingId !== null}
                className="flex-1 py-4 rounded-xl text-sm font-black uppercase tracking-widest text-white shadow-lg transition-transform hover:-translate-y-0.5 active:translate-y-0 bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30"
              >
                {restockingId !== null ? "Restocking..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
