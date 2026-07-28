import { Package } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface RecentOrdersProps {
  orders: any[];
}

export default function RecentOrders({ orders }: RecentOrdersProps) {
  if (!orders || orders.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-8 border border-gray-100 dark:border-gray-800 text-center shadow-sm mt-8">
        <Package
          className="mx-auto text-gray-300 dark:text-gray-700 mb-4"
          size={48}
        />
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          No recent orders
        </h3>
        <p className="text-gray-500 mb-6">
          Looks like you haven't made any purchases yet.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center justify-center bg-blue-600 text-white px-6 py-3 rounded-full font-bold uppercase tracking-widest text-sm hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm mt-8">
      <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
        <h3 className="text-xl font-black uppercase italic tracking-tighter">
          Recent Orders
        </h3>
        <Link
          href="/profile/orders"
          className="text-sm font-bold text-blue-600 hover:underline"
        >
          View All
        </Link>
      </div>
      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {orders.map((order) => (
          <div
            key={order.id}
            className="p-6 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors flex flex-col md:flex-row gap-4 justify-between items-start md:items-center"
          >
            <div className="flex gap-4 items-center">
              <div className="flex -space-x-4">
                {order.items.slice(0, 3).map((item: any, i: number) => (
                  <div
                    key={item.id}
                    className={`relative w-12 h-12 rounded-full border-2 border-white dark:border-gray-900 bg-gray-100 dark:bg-gray-800 overflow-hidden`}
                    style={{ zIndex: 3 - i }}
                  >
                    {item.variant?.image || item.product?.image ? (
                      <Image
                        src={item.variant?.image || item.product.image}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <Package className="w-6 h-6 m-auto mt-2 text-gray-400" />
                    )}
                  </div>
                ))}
                {order.items.length > 3 && (
                  <div className="relative w-12 h-12 rounded-full border-2 border-white dark:border-gray-900 bg-gray-100 dark:bg-gray-800 overflow-hidden flex items-center justify-center text-xs font-bold z-0">
                    +{order.items.length - 3}
                  </div>
                )}
              </div>
              <div>
                <p className="font-bold text-gray-900 dark:text-white">
                  Order #{order.id.slice(-6).toUpperCase()}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
              <div className="text-right">
                <p className="font-black text-lg">
                  Tk {order.total.toLocaleString()}
                </p>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider
                  ${
                    order.status === "DELIVERED"
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                      : order.status === "PENDING"
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                        : order.status === "CANCELLED"
                          ? "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400"
                          : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                  }`}
                >
                  {order.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
