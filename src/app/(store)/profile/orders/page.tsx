"use client";

import OrderDetailsModal from "@/components/dashboard/OrderDetailsModal";
import UserSidebar from "@/components/dashboard/UserSidebar";
import { useAuth } from "@/context/AuthContext";
import { API_URL } from "@/lib/config";
import { showToast } from "@/lib/toast";
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Clock,
  ExternalLink,
  Loader2,
  Package,
  ShoppingBag,
  Truck,
  Wallet,
  Star,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    image: string;
    slug: string;
  };
  variant?: {
    image: string | null;
    attributes: { value: string }[];
  } | null;
}

interface Order {
  id: string;
  status: string;
  total: number;
  createdAt: string;
  paymentStatus: string;
  paymentMethod?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  courierName?: string;
  feedbackSubmitted?: boolean;
  items: OrderItem[];
}

import ReviewModal from "@/components/profile/ReviewModal";

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Details Modal State
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [payingOrderId, setPayingOrderId] = useState<string | null>(null);
  const [reviewOrder, setReviewOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.replace("/login?redirect=/profile/orders");
      } else if (user.isGuest) {
        router.replace("/profile");
      }
    }
  }, [user, authLoading, router]);

  const fetchOrders = async () => {
    if (!user) return;

    try {
      const token =
        localStorage.getItem("femcart_access_token") ||
        localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/orders/my`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const json = await res.json();
      if (json.success) {
        setOrders(json.data);
      } else {
        setError(json.message || "Failed to fetch orders");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const handlePay = async (orderId: string) => {
    setPayingOrderId(orderId);
    try {
      const token =
        localStorage.getItem("femcart_access_token") ||
        localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/orders/${orderId}/pay`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const json = await res.json();
      if (json.success) {
        showToast.success("Payment successful! (Simulated)");
        fetchOrders(); // Refresh list
      } else {
        showToast.error(json.message || "Payment attempt failed");
      }
    } catch (err) {
      showToast.error("An error occurred during payment");
    } finally {
      setPayingOrderId(null);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status.toUpperCase()) {
      case "PENDING":
        return {
          color:
            "text-orange-600 bg-orange-50 dark:bg-orange-900/10 border-orange-100 dark:border-orange-800",
          icon: Clock,
        };
      case "CONFIRMED":
        return {
          color:
            "text-blue-600 bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-800",
          icon: CheckCircle2,
        };
      case "PROCESSING":
        return {
          color:
            "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/10 border-indigo-100 dark:border-indigo-800",
          icon: Package,
        };
      case "SHIPPED":
        return {
          color:
            "text-purple-600 bg-purple-50 dark:bg-purple-900/10 border-purple-100 dark:border-purple-800",
          icon: Truck,
        };
      case "DELIVERED":
        return {
          color:
            "text-green-600 bg-green-50 dark:bg-green-900/10 border-green-100 dark:border-green-800",
          icon: CheckCircle2,
        };
      case "CANCELLED":
        return {
          color:
            "text-pink-600 bg-pink-50 dark:bg-pink-900/10 border-pink-100 dark:border-pink-800",
          icon: AlertCircle,
        };
      default:
        return {
          color:
            "text-gray-600 bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700",
          icon: Clock,
        };
    }
  };

  if (authLoading || (loading && orders.length === 0 && !error)) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-blue-600" size={48} />
        <p className="text-gray-500 font-black uppercase tracking-widest text-xs">
          Retrieving your order history...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#f8fafc] dark:bg-gray-950 min-h-[100dvh] py-12">
      {selectedOrderId && (
        <OrderDetailsModal
          orderId={selectedOrderId}
          onClose={() => setSelectedOrderId(null)}
        />
      )}
      {reviewOrder && (
        <ReviewModal
          orderId={reviewOrder.id}
          items={reviewOrder.items}
          onClose={() => setReviewOrder(null)}
          onSuccess={() => {
            setReviewOrder(null);
            fetchOrders();
          }}
        />
      )}

      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="w-full lg:w-80 shrink-0">
            <UserSidebar />
          </aside>

          <main className="flex-grow">
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter uppercase italic">
                  Purchase History
                </h1>
                <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">
                  Manage and track your recent orders ({orders.length})
                </p>
              </div>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:underline"
              >
                Continue Shopping <ChevronRight size={16} />
              </Link>
            </div>

            {error && (
              <div className="bg-pink-50 dark:bg-pink-900/10 border border-pink-100 dark:border-pink-800 p-6 rounded-3xl flex items-center gap-4 text-pink-600 mb-8">
                <AlertCircle size={24} />
                <p className="font-bold">{error}</p>
              </div>
            )}

            {orders.length === 0 && !loading && !error ? (
              <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2.5rem] p-12 text-center shadow-xl shadow-gray-200/20 dark:shadow-none">
                <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <ShoppingBag size={40} />
                </div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2 uppercase tracking-tight italic">
                  No Orders Yet
                </h2>
                <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto mb-8 font-medium">
                  When you place your first order, it will appear here for
                  tracking and management.
                </p>
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-600/20"
                >
                  Start Shopping <ChevronRight size={18} />
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => {
                  const status = getStatusInfo(order.status);
                  const StatusIcon = status.icon;
                  const canPay =
                    order.paymentStatus === "UNPAID" &&
                    ["PENDING", "CONFIRMED", "PROCESSING"].includes(
                      order.status.toUpperCase(),
                    ) &&
                    order.paymentMethod !== "COD";

                  return (
                    <div
                      key={order.id}
                      className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2.5rem] shadow-xl shadow-gray-200/10 dark:shadow-none overflow-hidden group hover:border-blue-100 dark:hover:border-blue-900/30 transition-all duration-500"
                    >
                      <div className="p-6 md:p-8">
                        {/* Header */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-gray-50 dark:border-gray-800">
                          <div className="flex items-center gap-4">
                            <div
                              className={`p-3 rounded-2xl border ${status.color}`}
                            >
                              <StatusIcon size={24} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-black uppercase tracking-widest text-gray-400">
                                  Order ID:
                                </span>
                                <span className="text-sm font-bold text-gray-900 dark:text-white">
                                  #{order.id.slice(-8).toUpperCase()}
                                </span>
                              </div>
                              <p className="text-xs font-medium text-gray-500">
                                {new Date(order.createdAt).toLocaleDateString(
                                  "en-GB",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  },
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span
                              className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${status.color}`}
                            >
                              {order.status}
                            </span>
                            <span className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter">
                              ?{order.total}
                            </span>
                          </div>
                        </div>

                        {/* Items Preview */}
                        <div className="flex items-center gap-4 mb-6 overflow-x-auto pb-2 scrollbar-none">
                          {order.items.map((item, idx) => (
                            <Link
                              key={idx}
                              href={`/product/${item.product?.slug}`}
                              className="relative group/img shrink-0"
                            >
                              <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-800 p-2 flex items-center justify-center overflow-hidden transition-all group-hover/img:border-blue-500">
                                <img
                                  src={
                                    item.variant?.image ||
                                    item.product?.image ||
                                    "/placeholder-product.png"
                                  }
                                  alt={
                                    item.variant?.attributes?.length
                                      ? `${item.product?.name} (${item.variant.attributes.map((a) => a.value).join(" / ")})`
                                      : item.product?.name
                                  }
                                  className="w-full h-full object-contain group-hover/img:scale-110 transition-transform duration-500"
                                />
                              </div>
                              <span className="absolute -top-1 -right-1 w-6 h-6 bg-gray-900 dark:bg-white text-white dark:text-black text-[10px] font-black rounded-lg flex items-center justify-center border-2 border-white dark:border-gray-900 shadow-lg">
                                {item.quantity}
                              </span>
                            </Link>
                          ))}
                          {order.items.length > 4 && (
                            <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center text-gray-500 font-bold text-xs uppercase">
                              +{order.items.length - 4}
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row items-center justify-between pt-4 gap-4">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">
                              Payment Status:
                            </span>
                            <span
                              className={`text-[10px] font-bold uppercase tracking-tight ${order.paymentStatus === "PAID" ? "text-green-600" : "text-orange-600"}`}
                            >
                              {order.paymentStatus}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 w-full sm:w-auto">
                            {canPay && (
                              <button
                                onClick={() => handlePay(order.id)}
                                disabled={payingOrderId === order.id}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-orange-600/20 disabled:opacity-50"
                              >
                                {payingOrderId === order.id ? (
                                  <Loader2 className="animate-spin" size={14} />
                                ) : (
                                  <Wallet size={14} />
                                )}
                                Pay Now
                              </button>
                            )}

                            {order.status === "SHIPPED" &&
                              order.trackingUrl && (
                                <a
                                  href={order.trackingUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-blue-600/20"
                                >
                                  <Truck size={14} />
                                  Track Package
                                </a>
                              )}

                            {order.status === "DELIVERED" &&
                              !order.feedbackSubmitted && (
                                <button
                                  onClick={() => setReviewOrder(order)}
                                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-orange-500/20"
                                >
                                  <Star size={14} className="fill-white" />
                                  Leave Feedback
                                </button>
                              )}

                            <button
                              onClick={() => setSelectedOrderId(order.id)}
                              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 dark:bg-gray-800 hover:bg-black text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-gray-900/20"
                            >
                              Details <ExternalLink size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Support Section */}
            <div className="mt-12 p-8 bg-gray-50 dark:bg-gray-900/50 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="p-3 bg-white dark:bg-gray-800 rounded-2xl shadow-sm italic text-blue-600">
                  <AlertCircle size={32} />
                </div>
                <div>
                  <h4 className="font-black text-gray-900 dark:text-white uppercase tracking-tight">
                    Need help with an order?
                  </h4>
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                    Our customer support is available 24/7
                  </p>
                </div>
              </div>
              <button className="px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-gray-800 transition-all shadow-xl shadow-gray-900/20">
                Contact Support
              </button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
