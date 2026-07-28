"use client";

import { API_URL } from "@/lib/config";
import {
  ChevronDown,
  ChevronUp,
  Clock,
  MessageSquare,
  PackageOpen,
  Search,
  ShoppingCart,
  Ticket,
  Users,
  UserX,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { SmsCouponModal } from "../../../components/admin/SmsCouponModal";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string | null;
}

interface CartItem {
  id: string;
  quantity: number;
  product: Product;
}

interface User {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  isGuest: boolean;
}

interface Cart {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  totalValue: number;
  user: User;
  items: CartItem[];
}

export default function AbandonedCartsPage() {
  const [carts, setCarts] = useState<Cart[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<"ALL" | "GUEST" | "REGISTERED">(
    "ALL",
  );
  const [searchProduct, setSearchProduct] = useState("");
  const [expandedCartId, setExpandedCartId] = useState<string | null>(null);

  // Bulk action states
  const [selectedCartIds, setSelectedCartIds] = useState<string[]>([]);
  const [isSmsModalOpen, setIsSmsModalOpen] = useState(false);
  const [smsType, setSmsType] = useState<"SMS" | "COUPON">("SMS");
  const [smsMessage, setSmsMessage] = useState("");

  const [dateFilter, setDateFilter] = useState<
    "ALL" | "TODAY" | "LAST_7" | "LAST_30"
  >("ALL");

  useEffect(() => {
    fetchCarts();
    fetchCarts();
  }, []);

  const fetchCarts = async () => {
    try {
      setLoading(true);
      const token =
        localStorage.getItem("femcart_access_token") ||
        localStorage.getItem("token") ||
        "";
      const res = await fetch(`${API_URL}/api/cart/abandoned`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (data.success) {
        setCarts(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch abandoned carts:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter Logic
  const filteredCarts = carts.filter((cart) => {
    // 1. Guest/Registered Filter
    if (filterType === "GUEST" && !cart.user?.isGuest) return false;
    if (filterType === "REGISTERED" && cart.user?.isGuest) return false;

    // 2. Product Search Filter
    if (searchProduct) {
      const hasProduct = cart.items.some((item) =>
        item.product?.name?.toLowerCase().includes(searchProduct.toLowerCase()),
      );
      if (!hasProduct) return false;
    }

    // 3. Date Filter
    if (dateFilter !== "ALL") {
      const cartDate = new Date(cart.createdAt);
      const now = new Date();
      const diffInDays =
        (now.getTime() - cartDate.getTime()) / (1000 * 3600 * 24);

      if (dateFilter === "TODAY" && diffInDays > 1) return false;
      if (dateFilter === "LAST_7" && diffInDays > 7) return false;
      if (dateFilter === "LAST_30" && diffInDays > 30) return false;
    }

    return true;
  });

  const toggleSelectAll = () => {
    if (
      selectedCartIds.length === filteredCarts.length &&
      filteredCarts.length > 0
    ) {
      setSelectedCartIds([]);
    } else {
      setSelectedCartIds(filteredCarts.map((c) => c.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedCartIds.includes(id)) {
      setSelectedCartIds(selectedCartIds.filter((i) => i !== id));
    } else {
      setSelectedCartIds([...selectedCartIds, id]);
    }
  };

  const getParsedMessage = (cart: Cart | undefined, template: string) => {
    if (!cart) return "";
    let msg =
      template ||
      (smsType === "COUPON"
        ? "Hi [Name], we noticed you left items in your cart! Use code SAVE10 for 10% off."
        : "Hi [Name], you left items in your Femcart. Come back and checkout!");

    // Parse placeholders
    msg = msg.replace(/\[Name\]/g, cart.user?.name || "Customer");

    // Parse CartItems
    const itemsList = cart.items
      .map((i) => `${i.quantity}x ${i.product?.name}`)
      .join(", ");
    msg = msg.replace(/\[CartItems\]/g, itemsList);

    // Generate a checkout link (could be customized per user/cart)
    const domain =
      typeof window !== "undefined"
        ? window.location.origin
        : "https://femcart.com";
    const cartLink = `${domain}/checkout`;
    msg = msg.replace(/\[CartLink\]/g, cartLink);

    return msg;
  };

  // Calculate summary metrics
  const totalAbandonedValue = filteredCarts.reduce(
    (sum, cart) => sum + (cart.totalValue || 0),
    0,
  );
  const guestCartsCount = filteredCarts.filter((c) => c.user?.isGuest).length;
  const registeredCartsCount = filteredCarts.length - guestCartsCount;

  const insertPlaceholder = (placeholder: string) => {
    setSmsMessage(
      (prev) =>
        prev +
        (prev.endsWith(" ") || prev.length === 0 ? "" : " ") +
        placeholder,
    );
  };

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
          <ShoppingCart className="text-rose-500" size={32} />
          Abandoned Carts
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Track and analyze carts where users added items but failed to
          checkout.
        </p>
      </div>

      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-[1.5rem] p-6 border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-900/20 text-rose-600 flex items-center justify-center shrink-0">
            <ShoppingCart size={28} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
              Potential Value Lost
            </p>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white">
              ${totalAbandonedValue.toFixed(2)}
            </h3>
            <p className="text-xs font-bold text-gray-400 mt-1">
              Total value of carts shown
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-[1.5rem] p-6 border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 flex items-center justify-center shrink-0">
            <UserX size={28} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
              Guest Abandonments
            </p>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white">
              {guestCartsCount} Carts
            </h3>
            <p className="text-xs font-bold text-gray-400 mt-1">
              Users without accounts
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-[1.5rem] p-6 border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center shrink-0">
            <Users size={28} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
              Registered Abandonments
            </p>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white">
              {registeredCartsCount} Carts
            </h3>
            <p className="text-xs font-bold text-gray-400 mt-1">
              Logged in users
            </p>
          </div>
        </div>
      </div>

      {/* Filters and Table Container */}
      <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
        {/* Filters Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 p-1 rounded-xl">
            <button
              onClick={() => setFilterType("ALL")}
              className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${filterType === "ALL" ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}
            >
              All Carts
            </button>
            <button
              onClick={() => setFilterType("REGISTERED")}
              className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${filterType === "REGISTERED" ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}
            >
              Registered Only
            </button>
            <button
              onClick={() => setFilterType("GUEST")}
              className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${filterType === "GUEST" ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}
            >
              Guests Only
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-auto">
              <select
                value={dateFilter}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setDateFilter(
                    e.target.value as "ALL" | "TODAY" | "LAST_7" | "LAST_30",
                  )
                }
                className="w-full sm:w-48 pl-10 pr-4 py-2.5 rounded-xl border-none bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-rose-500 transition-all text-sm font-bold text-gray-900 dark:text-white appearance-none"
              >
                <option value="ALL">All Time</option>
                <option value="TODAY">Last 24 Hours</option>
                <option value="LAST_7">Last 7 Days</option>
                <option value="LAST_30">Last 30 Days</option>
              </select>
              <Clock
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
              <ChevronDown
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
            </div>

            <div className="relative w-full sm:w-auto">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search products..."
                value={searchProduct}
                onChange={(e) => setSearchProduct(e.target.value)}
                className="w-full sm:w-64 pl-10 pr-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-rose-500 transition-all"
              />
            </div>
          </div>

          {/* Bulk Actions */}
          <div className="flex items-center gap-2">
            <button
              disabled={selectedCartIds.length === 0}
              onClick={() => {
                setSmsType("SMS");
                setIsSmsModalOpen(true);
              }}
              className="text-xs font-bold bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 border border-gray-200 dark:border-gray-700"
            >
              <MessageSquare size={16} /> Send SMS{" "}
              {selectedCartIds.length > 0 && `(${selectedCartIds.length})`}
            </button>
            <button
              disabled={selectedCartIds.length === 0}
              onClick={() => {
                setSmsType("COUPON");
                setIsSmsModalOpen(true);
              }}
              className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-xl shadow-md shadow-emerald-500/20 transition-all flex items-center gap-2"
            >
              <Ticket size={16} /> Send Coupon{" "}
              {selectedCartIds.length > 0 && `(${selectedCartIds.length})`}
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto overflow-hidden rounded-xl border border-gray-200 dark:border-gray-750 shadow-sm">
          <table className="w-full text-left border-collapse min-w-[800px] text-sm">
            <thead>
              <tr className="bg-gray-50/80 dark:bg-gray-800/80">
                <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider align-middle border border-gray-200 dark:border-gray-700 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={
                      filteredCarts.length > 0 &&
                      selectedCartIds.length === filteredCarts.length
                    }
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 text-rose-500 focus:ring-rose-500 cursor-pointer"
                  />
                </th>
                <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider align-middle border border-gray-200 dark:border-gray-700">
                  Customer
                </th>
                <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider align-middle border border-gray-200 dark:border-gray-700">
                  Items Summary
                </th>
                <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider align-middle border border-gray-200 dark:border-gray-700 text-right">
                  Cart Value
                </th>
                <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider align-middle border border-gray-200 dark:border-gray-700 text-right">
                  Time Abandoned
                </th>
                <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider align-middle border border-gray-200 dark:border-gray-700 text-center">
                  Details
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
                    Loading abandoned carts...
                  </td>
                </tr>
              ) : filteredCarts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8">
                    <div className="flex flex-col items-center justify-center gap-3 text-gray-400">
                      <PackageOpen
                        size={48}
                        className="text-gray-300 dark:text-gray-700"
                      />
                      <p className="font-medium text-gray-500">
                        No abandoned carts found matching filters.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCarts.map((cart) => (
                  <React.Fragment key={cart.id}>
                    <tr
                      className={`group transition-colors duration-200 hover:bg-gray-50/80 dark:hover:bg-gray-750/30 cursor-pointer ${expandedCartId === cart.id ? "bg-rose-50/80 dark:bg-rose-900/20" : ""}`}
                      onClick={() =>
                        setExpandedCartId(
                          expandedCartId === cart.id ? null : cart.id,
                        )
                      }
                    >
                      <td className="px-6 py-4 align-middle border border-gray-200 dark:border-gray-750">
                        <div
                          className="flex items-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            checked={selectedCartIds.includes(cart.id)}
                            onChange={() => toggleSelect(cart.id)}
                            className="w-4 h-4 rounded border-gray-300 text-rose-500 focus:ring-rose-500 cursor-pointer"
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 align-middle border border-gray-200 dark:border-gray-750">
                        <div className="flex items-center gap-3">
                          {cart.user?.isGuest ? (
                            <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                              <UserX size={18} />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                              <Users size={18} />
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-gray-900 dark:text-white">
                                {cart.user?.name || "Unknown"}
                              </p>
                              {cart.user?.isGuest ? (
                                <span className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-1.5 py-0.5 rounded-[4px] text-[9px] font-black uppercase tracking-wider">
                                  GUEST
                                </span>
                              ) : (
                                <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-1.5 py-0.5 rounded-[4px] text-[9px] font-black uppercase tracking-wider">
                                  USER
                                </span>
                              )}
                            </div>
                            {(cart.user?.email || cart.user?.phone) && (
                              <p className="text-xs text-gray-500 mt-0.5">
                                {cart.user?.isGuest
                                  ? cart.user?.phone
                                  : cart.user?.email || cart.user?.phone}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 align-middle border border-gray-200 dark:border-gray-750">
                        <p className="font-bold text-gray-800 dark:text-gray-200">
                          {cart.items.reduce(
                            (sum, item) => sum + item.quantity,
                            0,
                          )}{" "}
                          items{" "}
                          <span className="font-medium text-gray-400 text-xs">
                            ({cart.items.length} unique)
                          </span>
                        </p>
                        <p className="text-xs text-gray-400 truncate max-w-[200px] mt-0.5">
                          {cart.items
                            .map((i) => `${i.quantity}x ${i.product?.name}`)
                            .join(", ")}
                        </p>
                      </td>
                      <td className="px-6 py-4 align-middle border border-gray-200 dark:border-gray-750 font-black text-rose-600 dark:text-rose-400 text-right text-lg">
                        ${(cart.totalValue || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 align-middle border border-gray-200 dark:border-gray-750 text-right">
                        <div className="flex items-center justify-end gap-1.5 text-rose-500 dark:text-rose-400 font-bold text-xs bg-rose-50 dark:bg-rose-900/20 px-2.5 py-1 rounded-full w-fit ml-auto">
                          <Clock size={14} />
                          {formatRelativeTime(cart.updatedAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 align-middle border border-gray-200 dark:border-gray-750 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedCartId(
                              expandedCartId === cart.id ? null : cart.id,
                            );
                          }}
                          className={`p-2 rounded-xl transition-all duration-300 ${expandedCartId === cart.id ? "bg-rose-500 text-white shadow-md shadow-rose-500/20" : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"}`}
                        >
                          {expandedCartId === cart.id ? (
                            <ChevronUp size={18} />
                          ) : (
                            <ChevronDown size={18} />
                          )}
                        </button>
                      </td>
                    </tr>
                    {/* Expanded Row Details */}
                    {expandedCartId === cart.id && (
                      <tr className="bg-rose-50/50 dark:bg-rose-900/10">
                        <td
                          colSpan={6}
                          className="p-0 border-b border-rose-100 dark:border-rose-900/30"
                        >
                          <div className="px-6 py-5 shadow-inner">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="text-sm font-black text-gray-800 dark:text-gray-200">
                                Cart Contents
                              </h4>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                              {cart.items.map((item) => (
                                <div
                                  key={item.id}
                                  className="flex items-center gap-4 bg-white dark:bg-gray-800 p-3 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
                                >
                                  <div className="w-14 h-14 rounded-xl bg-gray-50 dark:bg-gray-900 flex items-center justify-center overflow-hidden shrink-0 border border-gray-100 dark:border-gray-800">
                                    {item.product?.image ? (
                                      <img
                                        src={item.product.image}
                                        alt={item.product.name}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <PackageOpen
                                        size={20}
                                        className="text-gray-400"
                                      />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">
                                      {item.product?.name || "Unknown Product"}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className="text-xs font-black text-rose-600 dark:text-rose-400">
                                        ${item.product?.price || 0}
                                      </span>
                                      <span className="text-[10px] font-bold text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                                        Qty: {item.quantity}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SMS/Coupon Modal */}
      <SmsCouponModal
        isOpen={isSmsModalOpen}
        onClose={() => setIsSmsModalOpen(false)}
        smsType={smsType}
        selectedCount={selectedCartIds.length}
        smsMessage={smsMessage}
        setSmsMessage={setSmsMessage}
        insertPlaceholder={insertPlaceholder}
        previewMessage={getParsedMessage(
          filteredCarts.find((c) => c.id === selectedCartIds[0]),
          smsMessage,
        )}
        onSend={() => {
          const selected = filteredCarts.filter((c) =>
            selectedCartIds.includes(c.id),
          );
          const payloads = selected.map((cart) => ({
            phone: cart.user?.phone || "No Phone",
            message: getParsedMessage(cart, smsMessage),
          }));

          console.log("🚀 SENDING PAYLOADS:", payloads);
          alert(
            `Successfully parsed and sent messages to ${selectedCartIds.length} users!\n\nOpen your browser console to see the exact parsed payloads.`,
          );

          setIsSmsModalOpen(false);
          setSelectedCartIds([]);
          setSmsMessage("");
        }}
      />
    </div>
  );
}
