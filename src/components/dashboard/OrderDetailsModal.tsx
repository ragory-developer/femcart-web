"use client";

import { API_URL } from "@/lib/config";
import {
  AlertCircle,
  Calendar,
  Clock,
  CreditCard,
  MapPin,
  ShoppingBag,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

interface Product {
  id: string;
  name: string;
  image: string;
  slug: string;
}

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: Product;
  variant?: {
    image: string | null;
    attributes: { value: string }[];
  } | null;
}

interface Order {
  id: string;
  status: string;
  total: number;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  createdAt: string;
  paymentMethod: string;
  paymentStatus: string;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryArea: string;
  deliverySlot?: string;
  notes?: string;
  items: OrderItem[];
}

interface OrderDetailsModalProps {
  orderId: string;
  onClose: () => void;
}

export default function OrderDetailsModal({
  orderId,
  onClose,
}: OrderDetailsModalProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const token =
          localStorage.getItem("femcart_access_token") ||
          localStorage.getItem("token");
        const res = await fetch(`${API_URL}/api/orders/${orderId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const json = await res.json();
        if (json.success) {
          setOrder(json.data);
        } else {
          setError(json.message || "Failed to fetch order details");
        }
      } catch (err) {
        setError("An error occurred while loading order details");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-[clamp(1rem,3vw,1.5rem)] bg-black/60 backdrop-blur-sm">
        <div className="bg-white dark:bg-gray-900 rounded-[clamp(1.5rem,4vw,2.5rem)] w-full max-w-2xl p-[clamp(2rem,5vw,3rem)] text-center">
          <div className="animate-spin text-blue-600 mb-4 flex justify-center">
            <ShoppingBag size={48} />
          </div>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">
            Loading order details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-[clamp(1rem,3vw,1.5rem)] bg-black/60 backdrop-blur-sm">
        <div className="bg-white dark:bg-gray-900 rounded-[clamp(1.5rem,4vw,2.5rem)] w-full max-w-lg p-[clamp(1.5rem,4vw,2rem)] text-center">
          <AlertCircle className="text-pink-500 mx-auto mb-4" size={48} />
          <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase mb-4">
            Error
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 font-medium">
            {error || "Order not found"}
          </p>
          <button
            onClick={onClose}
            className="w-full py-[clamp(0.75rem,2vw,1rem)] min-h-[44px] bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-black uppercase tracking-widest text-[clamp(0.75rem,1.5vw,0.875rem)]"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-[clamp(1rem,3vw,1.5rem)] bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#f8fafc] dark:bg-gray-950 rounded-[clamp(1.5rem,4vw,3rem)] w-full max-w-3xl shadow-2xl relative my-[clamp(1rem,3vw,2rem)]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-[clamp(1rem,3vw,1.5rem)] right-[clamp(1rem,3vw,1.5rem)] p-2 min-h-[44px] min-w-[44px] flex items-center justify-center bg-white dark:bg-gray-950 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-full shadow-sm z-10"
        >
          <X size={24} />
        </button>

        {/* Modal Content */}
        <div className="p-[clamp(1.5rem,4vw,3rem)]">
          {/* Header */}
          <div className="mb-10">
            <div className="flex items-center gap-2 text-blue-600 font-black uppercase tracking-widest text-xs mb-2 italic">
              <ShoppingBag size={14} /> Order Tracking
            </div>
            <h2 className="text-[clamp(1.5rem,5vw,2rem)] font-black text-gray-900 dark:text-white tracking-tighter uppercase italic">
              Order Details
            </h2>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
              <span className="text-sm font-bold text-gray-500">
                ID: #{order.id.toUpperCase()}
              </span>
              <span className="text-gray-300">|</span>
              <span className="text-sm font-bold text-gray-500 flex items-center gap-1">
                <Calendar size={14} />{" "}
                {new Date(order.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-[clamp(1.5rem,4vw,2rem)]">
            {/* Left Column: Items */}
            <div className="space-y-6">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4">
                Items Summary
              </h3>
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 items-center bg-white dark:bg-gray-900 p-[clamp(0.75rem,2vw,1rem)] rounded-[clamp(1rem,3vw,1.5rem)] border border-gray-100 dark:border-gray-800 shadow-sm"
                  >
                    <div className="w-16 h-16 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center p-2">
                      <img
                        src={item.variant?.image || item.product.image}
                        alt={item.product.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                        {item.product.name}
                        {item.variant &&
                          item.variant.attributes?.length > 0 && (
                            <span className="ml-2 text-xs text-gray-500 font-normal">
                              (
                              {item.variant.attributes
                                .map((a) => a.value)
                                .join(" / ")}
                              )
                            </span>
                          )}
                      </h4>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs font-medium text-gray-500 italic">
                          Qty: {item.quantity}
                        </span>
                        <span className="text-sm font-black text-blue-600">
                          ?{item.price * item.quantity}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Delivery Info */}
              <div className="bg-blue-50 dark:bg-blue-900/10 p-[clamp(1rem,3vw,1.5rem)] rounded-[clamp(1rem,3vw,1.5rem)] border border-blue-100 dark:border-blue-900/30">
                <div className="flex items-center gap-3 mb-3 text-blue-700 dark:text-blue-400">
                  <MapPin size={20} />
                  <span className="text-xs font-black uppercase tracking-widest">
                    Delivery Address
                  </span>
                </div>
                <p className="text-sm font-bold text-gray-800 dark:text-gray-300 leading-relaxed">
                  {order.deliveryAddress}, {order.deliveryArea},{" "}
                  {order.deliveryCity}
                </p>
                {order.deliverySlot && (
                  <p className="text-xs font-medium text-blue-600 mt-2 italic flex items-center gap-1">
                    <Clock size={12} /> Scheduled: {order.deliverySlot}
                  </p>
                )}
              </div>
            </div>

            {/* Right Column: Calculations & Payment */}
            <div className="space-y-8">
              {/* Payment Section */}
              <div className="bg-white dark:bg-gray-900 p-[clamp(1.5rem,4vw,2rem)] rounded-[clamp(1.5rem,4vw,2.5rem)] border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/20 dark:shadow-none">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6">
                  Payment Overview
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">
                      Method
                    </span>
                    <span className="text-sm font-black text-gray-900 dark:text-white uppercase flex items-center gap-2 italic">
                      <CreditCard size={14} /> {order.paymentMethod}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">
                      Payment Status
                    </span>
                    <span
                      className={`text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
                        order.paymentStatus === "PAID"
                          ? "text-green-600 border-green-100 bg-green-50 dark:bg-green-900/10"
                          : "text-orange-600 border-orange-100 bg-orange-50 dark:bg-orange-900/10"
                      }`}
                    >
                      {order.paymentStatus}
                    </span>
                  </div>

                  <div className="pt-6 border-t border-gray-50 dark:border-gray-800 space-y-3">
                    <div className="flex justify-between text-sm font-medium text-gray-600">
                      <span>Subtotal</span>
                      <span className="font-bold">?{order.subtotal}</span>
                    </div>
                    <div className="flex justify-between text-sm font-medium text-gray-600">
                      <span>Delivery</span>
                      <span className="font-bold">?{order.deliveryFee}</span>
                    </div>
                    {order.discount > 0 && (
                      <div className="flex justify-between text-sm font-bold text-green-600">
                        <span>Discount</span>
                        <span>-?{order.discount}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-4 border-t border-gray-50 dark:border-gray-800">
                      <span className="text-[clamp(1rem,2.5vw,1.125rem)] font-black text-gray-900 dark:text-white uppercase italic tracking-tighter">
                        Total
                      </span>
                      <span className="text-[clamp(1.5rem,5vw,2rem)] font-black text-blue-600 tracking-tighter italic">
                        ?{order.total}
                      </span>
                    </div>
                  </div>
                </div>

                {order.notes && (
                  <div className="mt-[clamp(1.5rem,4vw,2rem)] p-[clamp(0.75rem,2vw,1rem)] bg-gray-50 dark:bg-gray-800 rounded-[clamp(1rem,3vw,1.5rem)] border border-dashed border-gray-200 dark:border-gray-700">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1 underline">
                      Order Note
                    </span>
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 leading-relaxed italic">
                      "{order.notes}"
                    </p>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={onClose}
                  className="w-full py-[clamp(0.875rem,2vw,1rem)] min-h-[48px] bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-[clamp(1rem,3vw,1.5rem)] font-black uppercase tracking-widest text-[clamp(0.875rem,2vw,1rem)] hover:bg-black transition-all shadow-xl shadow-gray-900/20"
                >
                  Close View
                </button>
                <button className="w-full py-[clamp(0.875rem,2vw,1rem)] min-h-[48px] bg-blue-600 hover:bg-blue-700 text-white rounded-[clamp(1rem,3vw,1.5rem)] font-black uppercase tracking-widest text-[clamp(0.875rem,2vw,1rem)] transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2">
                  <X size={16} /> Cancel Order
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
