import { Order } from "@/types/order";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Package,
  MapPin,
  MessageSquare,
  CreditCard,
  Banknote,
} from "lucide-react";

interface OrderTableProps {
  orders: Order[];
  loading: boolean;
  couponCode: string | null;
  setSelectedOrder: (order: Order) => void;
  page: number;
  setPage: (page: number | ((p: number) => number)) => void;
  limit: number;
  pagination: { total: number; totalPages: number };
}

export function OrderTable({
  orders,
  loading,
  couponCode,
  setSelectedOrder,
  page,
  setPage,
  limit,
  pagination,
}: OrderTableProps) {
  if (loading) {
    return (
      <div className="py-32 flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Loading orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="py-32 text-center flex flex-col items-center justify-center">
        <Package size={64} className="text-gray-200 dark:text-gray-800 mb-6" />
        <p className="text-xl font-bold text-gray-400 dark:text-gray-500 tracking-tight">
          No orders found.
        </p>
        {couponCode && (
          <p className="text-sm mt-2 text-gray-400">
            Try a different coupon or check again later.
          </p>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto overflow-hidden rounded-xl border border-gray-200 dark:border-gray-750 shadow-sm bg-white dark:bg-gray-800">
        <table className="w-full text-left border-collapse min-w-[1000px] text-sm">
          <thead>
            <tr className="bg-gray-50/80 dark:bg-gray-800/80">
              <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider align-middle border border-gray-200 dark:border-gray-700">
                Order ID & Date
              </th>
              <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider align-middle border border-gray-200 dark:border-gray-700">
                Customer Details
              </th>
              <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider align-middle border border-gray-200 dark:border-gray-700">
                Products
              </th>
              <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider align-middle border border-gray-200 dark:border-gray-700">
                Total & Payment
              </th>
              <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider align-middle border border-gray-200 dark:border-gray-700">
                Status
              </th>
              <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider align-middle border border-gray-200 dark:border-gray-700">
                Details
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr
                key={order.id}
                className="group transition-colors duration-200 hover:bg-gray-50/80 dark:hover:bg-gray-750/30"
              >
                <td className="px-6 py-4 align-middle border border-gray-200 dark:border-gray-750">
                  <div className="font-bold text-gray-900 dark:text-white break-all max-w-[120px] uppercase flex items-center gap-2">
                    {order.id}
                    {order.notes && (
                      <MessageSquare
                        size={14}
                        className="text-emerald-500 shrink-0"
                      />
                    )}
                  </div>
                  <div className="text-[10px] text-gray-500 font-bold mt-1 flex items-center gap-1">
                    <Calendar size={12} className="shrink-0" />
                    {new Date(order.createdAt).toLocaleDateString()}
                    <span className="opacity-50">•</span>
                    {new Date(order.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </td>
                <td className="px-6 py-4 align-middle border border-gray-200 dark:border-gray-750">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-black text-xs">
                      {order.user?.name
                        ? order.user.name[0].toUpperCase()
                        : "G"}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        {order.customerName || order.user?.name || "Guest"}
                        {order.user?.isGuest && (
                          <span className="text-[8px] font-black uppercase bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-md">
                            GUEST
                          </span>
                        )}
                      </p>
                      <p className="text-[10px] text-gray-500 font-bold mt-0.5">
                        {order.customerPhone || order.user?.phone || "No phone"}
                      </p>
                      {(order.deliveryArea || order.deliveryCity) && (
                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1 flex items-center gap-1">
                          <MapPin size={10} />
                          {[order.deliveryArea, order.deliveryCity]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 align-middle border border-gray-200 dark:border-gray-750">
                  <div className="flex flex-col gap-1 max-w-[200px]">
                    {order.items?.slice(0, 2).map((item, idx) => (
                      <p
                        key={idx}
                        className="text-xs font-bold text-gray-900 dark:text-white truncate"
                        title={
                          item.variant?.attributes?.length
                            ? `${item.product?.name} (${item.variant.attributes.map((a: any) => a.value).join(" / ")})`
                            : item.product?.name
                        }
                      >
                        <span className="text-emerald-600 dark:text-emerald-400 mr-1">
                          {item.quantity}x
                        </span>
                        {item.product?.name || "Unknown"}
                        {item.variant &&
                          item.variant.attributes?.length > 0 && (
                            <span className="ml-1 text-[10px] text-gray-500 font-normal">
                              (
                              {item.variant.attributes
                                .map((a: any) => a.value)
                                .join(" / ")}
                              )
                            </span>
                          )}
                      </p>
                    ))}
                    {(order.items?.length || 0) > 2 && (
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
                        + {(order.items?.length || 0) - 2} more item(s)
                      </p>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 align-middle border border-gray-200 dark:border-gray-750">
                  <p className="text-lg font-black text-gray-900 dark:text-white">
                    ৳ {order.total.toFixed(2)}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-gray-500 bg-gray-100 dark:bg-gray-700/50 px-2 py-0.5 rounded-md">
                      {order.paymentMethod === "COD" ? (
                        <Banknote size={10} />
                      ) : (
                        <CreditCard size={10} />
                      )}
                      {order.paymentMethod}
                    </span>
                    <span
                      className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${
                        order.paymentStatus === "PAID"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                      }`}
                    >
                      {order.paymentStatus}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 align-middle border border-gray-200 dark:border-gray-750">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      order.status === "DELIVERED"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                        : order.status === "CANCELLED"
                          ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                          : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                    }`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 align-middle border border-gray-200 dark:border-gray-750 text-right">
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 transition-all flex items-center gap-2 group-hover:scale-105"
                  >
                    <ChevronRight size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">
          Showing{" "}
          <span className="text-gray-900 dark:text-white">
            {Math.min((page - 1) * limit + 1, pagination.total)}
          </span>{" "}
          to{" "}
          <span className="text-gray-900 dark:text-white">
            {Math.min(page * limit, pagination.total)}
          </span>{" "}
          of{" "}
          <span className="text-gray-900 dark:text-white">
            {pagination.total}
          </span>{" "}
          orders
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage(1)}
            disabled={page === 1}
            className="p-2.5 rounded-xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-30 transition-all"
          >
            <ChevronsLeft size={16} />
          </button>
          <button
            onClick={() => setPage((p: number) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2.5 rounded-xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-30 transition-all font-bold text-xs flex items-center gap-2"
          >
            <ChevronLeft size={16} /> Previous
          </button>

          <div className="flex items-center px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-xl font-black text-xs uppercase tracking-widest border border-emerald-100 dark:border-emerald-800">
            Page {page} of {pagination.totalPages}
          </div>

          <button
            onClick={() =>
              setPage((p: number) => Math.min(pagination.totalPages, p + 1))
            }
            disabled={page === pagination.totalPages}
            className="p-2.5 rounded-xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-30 transition-all font-bold text-xs flex items-center gap-2"
          >
            Next <ChevronRight size={16} />
          </button>
          <button
            onClick={() => setPage(pagination.totalPages)}
            disabled={page === pagination.totalPages}
            className="p-2.5 rounded-xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-30 transition-all"
          >
            <ChevronsRight size={16} />
          </button>
        </div>
      </div>
    </>
  );
}
