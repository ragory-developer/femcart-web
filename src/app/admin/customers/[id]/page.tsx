"use client";

import { API_URL } from "@/lib/config";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Mail,
  Package,
  Phone,
  ShieldAlert,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface CustomerUser {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: string;
  isGuest: boolean;
  createdAt: string;
}

interface OrderItem {
  quantity: number;
  price: number;
  product: { name: string };
}

interface Order {
  id: string;
  status: string;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  items: OrderItem[];
}

export default function CustomerDetailsPage() {
  const params = useParams();
  const id = params.id as string;

  const [customer, setCustomer] = useState<CustomerUser | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const token =
          localStorage.getItem("femcart_access_token") ||
          localStorage.getItem("token");

        // Fetch Customer
        const userRes = await fetch(`${API_URL}/api/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userData = await userRes.json();

        // Fetch Orders
        const ordersRes = await fetch(
          `${API_URL}/api/orders?userId=${id}&limit=50`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const ordersData = await ordersRes.json();

        if (userData.success) setCustomer(userData.data);
        if (ordersData.success) setOrders(ordersData.data);
      } catch (err) {
        console.error("Failed to fetch customer details", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="py-32 flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Loading customer records...</p>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="max-w-7xl mx-auto py-12 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Customer not found
        </h1>
        <Link href="/admin/customers" className="text-blue-600 hover:underline">
          Return to Customers Back
        </Link>
      </div>
    );
  }

  const totalSpent = orders.reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <Link
        href="/admin/customers"
        className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors font-semibold text-sm"
      >
        <ArrowLeft size={16} /> Back to Customers
      </Link>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              {customer.name}
            </h1>
            {customer.isGuest ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs font-bold">
                <ShieldAlert size={14} /> Guest Checkout
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold">
                <CheckCircle2 size={14} /> Registered User
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500 font-medium">
            {customer.email && (
              <div className="flex items-center gap-1.5">
                <Mail size={16} /> {customer.email}
              </div>
            )}
            {customer.phone && (
              <div className="flex items-center gap-1.5">
                <Phone size={16} /> {customer.phone}
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Calendar size={16} /> Joined{" "}
              {new Date(customer.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6 bg-white dark:bg-gray-900 p-4 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="text-right">
            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest leading-none mb-1">
              Lifetime Value
            </p>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 leading-none">
              Tk {totalSpent.toLocaleString()}
            </p>
          </div>
          <div className="w-px h-10 bg-gray-100 dark:bg-gray-800"></div>
          <div className="text-right pr-2">
            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest leading-none mb-1">
              Total Orders
            </p>
            <p className="text-2xl font-black text-blue-600 dark:text-blue-400 leading-none">
              {orders.length}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-bold flex items-center gap-2 dark:text-white">
          <Package size={20} className="text-blue-600" /> Order History
        </h2>

        {orders.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-16 text-center shadow-sm">
            <Package
              size={48}
              className="mx-auto text-gray-300 dark:text-gray-700 mb-4 tracking-tight"
            />
            <p className="text-xl font-bold text-gray-400 dark:text-gray-500">
              No orders placed yet.
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                      Order ID & Date
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                      Status
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                      Items
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                      Total
                    </th>
                    <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50 text-sm">
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-gray-50/50 dark:hover:bg-blue-500/[0.02] transition-colors"
                    >
                      <td className="px-6 py-5">
                        <div className="font-bold text-gray-900 dark:text-white truncate max-w-[150px]">
                          {order.id}
                        </div>
                        <div className="text-[10px] text-gray-500 font-bold mt-1">
                          {new Date(order.createdAt).toLocaleDateString()}{" "}
                          {new Date(order.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                            order.status === "DELIVERED"
                              ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30"
                              : order.status === "CANCELLED"
                                ? "bg-rose-50 text-rose-600 dark:bg-rose-900/30"
                                : "bg-blue-50 text-blue-600 dark:bg-blue-900/30"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-gray-900 dark:text-gray-300 font-medium">
                          {order.items.length} unique item
                          {order.items.length !== 1 && "s"}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="font-bold text-gray-900 dark:text-white">
                          Tk {order.total.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-gray-500 font-bold mt-0.5">
                          {order.paymentMethod} • {order.paymentStatus}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <Link
                          href={`/admin/orders?search=${order.id}`}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          Manage <ChevronRight size={14} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
