"use client";

import { API_URL } from "@/lib/config";
import * as fpixel from "@/lib/fpixel";
import {
  ArrowRight,
  Banknote,
  CheckCircle2,
  Loader2,
  MapPin,
  Receipt,
  ShoppingBag,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [mounted, setMounted] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    if (orderId) {
      fetchOrder(orderId);
    } else {
      setLoading(false);
    }
  }, [orderId]);

  const fetchOrder = async (id: string) => {
    try {
      const token =
        localStorage.getItem("femcart_access_token") ||
        localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) {
        setOrder(json.data);
        // Trigger Purchase event
        fpixel.event(
          "Purchase",
          {
            content_ids: json.data.items.map((i: any) => i.productId || i.id),
            content_type: "product",
            value: json.data.total,
            currency: "BDT",
            num_items: json.data.items.length,
          },
          id,
          false,
        );
      }
    } catch (e) {
      console.error("Failed to fetch order for tracking:", e);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center p-4">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
        <p className="text-gray-500 font-medium">Fetching order details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-gray-50 dark:bg-gray-950 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-100 dark:bg-emerald-900/30 rounded-full animate-ping opacity-30"></div>
              <div className="relative bg-white dark:bg-gray-900 p-5 rounded-full shadow-2xl shadow-emerald-500/10 border border-emerald-100 dark:border-emerald-900">
                <CheckCircle2 className="w-16 h-16 text-emerald-600 dark:text-emerald-500" />
              </div>
            </div>
          </div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-3 tracking-tighter italic uppercase">
            Order Confirmed!
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium max-w-lg mx-auto">
            Thank you for choosing Femcart. Your order has been successfully
            placed and is now being processed.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column: Order Details & Address */}
          <div className="flex-1 space-y-6">
            {orderId && (
              <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 md:p-8 border border-gray-200 dark:border-gray-800 shadow-sm flex items-center justify-between">
                <div>
                  <div className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1">
                    Order Number
                  </div>
                  <div className="text-xl font-mono font-black text-gray-900 dark:text-white">
                    #{orderId}
                  </div>
                </div>
                {order && (
                  <div className="text-right">
                    <div className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1">
                      Date
                    </div>
                    <div className="text-sm font-bold text-gray-700 dark:text-gray-300">
                      {new Date(
                        order.createdAt || Date.now(),
                      ).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {order && (
              <>
                {/* Cash on Delivery Instructions */}
                {order.paymentMethod === "COD" && (
                  <div className="bg-amber-50 dark:bg-amber-900/10 rounded-3xl p-6 md:p-8 border border-amber-200 dark:border-amber-800 shadow-sm">
                    <div className="flex items-start gap-4">
                      <div className="bg-amber-100 dark:bg-amber-900/50 p-3 rounded-2xl text-amber-600 dark:text-amber-500 shrink-0">
                        <Banknote size={24} />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-amber-900 dark:text-amber-500 mb-2 uppercase tracking-tight">
                          Cash on Delivery
                        </h3>
                        <p className="text-amber-800/80 dark:text-amber-400/80 text-sm font-medium leading-relaxed">
                          Please keep the exact amount of{" "}
                          <strong>Tk {order.total?.toFixed(2)}</strong> ready at
                          the time of delivery. Our delivery executive will
                          contact you shortly before arriving at your address.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Delivery Address */}
                <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 md:p-8 border border-gray-200 dark:border-gray-800 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <MapPin className="text-blue-600" />
                    <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic">
                      Delivery Details
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                        Recipient
                      </div>
                      <div className="font-bold text-gray-900 dark:text-white">
                        {order.customerName || "N/A"}
                      </div>
                      <div className="text-gray-500 text-sm mt-1">
                        {order.customerPhone || "N/A"}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                        Shipping Address
                      </div>
                      <div className="font-medium text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                        {order.deliveryAddress}
                        <br />
                        {order.deliveryArea && `${order.deliveryArea}, `}{" "}
                        {order.deliveryCity}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                href="/"
                className="flex-1 flex items-center justify-center gap-3 px-8 py-4 bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 dark:text-black text-white rounded-2xl font-black uppercase tracking-wider transition-all shadow-xl hover:-translate-y-1 active:translate-y-0"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>Continue Shopping</span>
              </Link>

              <Link
                href="/profile/orders"
                className="flex-1 flex items-center justify-center gap-2 px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 hover:border-blue-500 hover:text-blue-600 rounded-2xl font-black uppercase tracking-wider transition-all shadow-sm hover:-translate-y-1 active:translate-y-0"
              >
                <span>View All Orders</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Right Column: Order Receipt */}
          {order && (
            <div className="w-full lg:w-[380px] shrink-0">
              <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 md:p-8 border border-gray-200 dark:border-gray-800 shadow-sm sticky top-8">
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100 dark:border-gray-800">
                  <Receipt className="text-blue-600" />
                  <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic">
                    Order Summary
                  </h3>
                </div>

                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar mb-6">
                  {order.items?.map((item: any, idx: number) => (
                    <div key={idx} className="flex gap-4 items-start">
                      <div className="w-16 h-16 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 overflow-hidden shrink-0 relative">
                        {item.product?.image || item.image ? (
                          <img
                            src={item.product?.image || item.image || ""}
                            alt={item.product?.name || item.name || "Product"}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%23f0fdf4'/%3E%3Crect x='18' y='16' width='28' height='22' rx='2' fill='%23e2e8f0'/%3E%3Ccircle cx='32' cy='25' r='5' fill='%23cbd5e1'/%3E%3Cpolygon points='18,38 26,28 33,34 40,26 46,38' fill='%23cbd5e1'/%3E%3C/svg%3E";
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                            No img
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                          {item.product?.name ||
                            item.name ||
                            `Product #${item.productId}`}
                        </h4>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Qty:{" "}
                          <span className="font-bold text-gray-700 dark:text-gray-300">
                            {item.quantity}
                          </span>
                        </div>
                      </div>
                      <div className="text-sm font-bold text-gray-900 dark:text-white text-right">
                        Tk {((item.price || 0) * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 pt-6 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex justify-between text-sm font-medium text-gray-600 dark:text-gray-400">
                    <span>Subtotal</span>
                    <span>Tk {(order.subtotal || 0).toFixed(2)}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-sm font-bold text-emerald-600 dark:text-emerald-500">
                      <span>Discount</span>
                      <span>-Tk {(order.discount || 0).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-medium text-gray-600 dark:text-gray-400">
                    <span>Delivery Fee</span>
                    <span>Tk {(order.deliveryFee || 0).toFixed(2)}</span>
                  </div>
                  <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                    <span className="text-lg font-black text-gray-900 dark:text-white uppercase">
                      Total
                    </span>
                    <span className="text-2xl font-black text-blue-600 dark:text-blue-500">
                      Tk {(order.total || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={null}>
      <OrderSuccessContent />
    </Suspense>
  );
}
