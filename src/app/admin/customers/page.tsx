"use client";

import { API_URL } from "@/lib/config";
import { Calendar, MapPin, Package, Search, Users, UserX } from "lucide-react";
import React, { useEffect, useState } from "react";

interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  isGuest: boolean;
  createdAt: string;
  rewardPoints: number;
  totalOrderAmount: number;
  totalOrderCount: number;
  area: string | null;
  city: string | null;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<"ALL" | "GUEST" | "REGISTERED">(
    "ALL",
  );
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const token =
        localStorage.getItem("femcart_access_token") ||
        localStorage.getItem("token") ||
        "";
      const res = await fetch(`${API_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (data.success) {
        setCustomers(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch customers:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter Logic
  const filteredCustomers = customers.filter((c) => {
    // 1. Guest/Registered Filter
    if (filterType === "GUEST" && !c.isGuest) return false;
    if (filterType === "REGISTERED" && c.isGuest) return false;

    // 2. Search Filter
    if (search) {
      const s = search.toLowerCase();
      if (
        !c.name?.toLowerCase().includes(s) &&
        !c.phone?.includes(s) &&
        !c.email?.toLowerCase().includes(s)
      ) {
        return false;
      }
    }

    return true;
  });

  const guestCount = filteredCustomers.filter((c) => c.isGuest).length;
  const registeredCount = filteredCustomers.length - guestCount;
  const totalSpent = filteredCustomers.reduce(
    (sum, c) => sum + (c.totalOrderAmount || 0),
    0,
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
          <Users className="text-blue-500" size={32} />
          Customer Management
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          View and manage all registered users and guest shoppers.
        </p>
      </div>

      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-[1.5rem] p-6 border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 flex items-center justify-center shrink-0">
            <Package size={28} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
              Total Spent
            </p>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white">
              ৳ {totalSpent.toFixed(2)}
            </h3>
            <p className="text-xs font-bold text-gray-400 mt-1">
              By filtered customers
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-[1.5rem] p-6 border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center shrink-0">
            <Users size={28} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
              Registered Users
            </p>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white">
              {registeredCount}
            </h3>
            <p className="text-xs font-bold text-gray-400 mt-1">
              Full account holders
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-[1.5rem] p-6 border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 flex items-center justify-center shrink-0">
            <UserX size={28} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
              Guest Shoppers
            </p>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white">
              {guestCount}
            </h3>
            <p className="text-xs font-bold text-gray-400 mt-1">
              Checked out without account
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
              All
            </button>
            <button
              onClick={() => setFilterType("REGISTERED")}
              className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${filterType === "REGISTERED" ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}
            >
              Registered
            </button>
            <button
              onClick={() => setFilterType("GUEST")}
              className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${filterType === "GUEST" ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}
            >
              Guests
            </button>
          </div>

          <div className="relative w-full md:w-80">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search by name, phone, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto overflow-hidden rounded-xl border border-gray-200 dark:border-gray-750 shadow-sm bg-white dark:bg-gray-800">
          <table className="w-full text-left border-collapse min-w-[800px] text-sm">
            <thead>
              <tr className="bg-gray-50/80 dark:bg-gray-800/80">
                <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider align-middle border border-gray-200 dark:border-gray-700 w-1/3">
                  Customer Info
                </th>
                <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider align-middle border border-gray-200 dark:border-gray-700 text-center">
                  Orders
                </th>
                <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider align-middle border border-gray-200 dark:border-gray-700 text-center">
                  Total Spent
                </th>
                <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider align-middle border border-gray-200 dark:border-gray-700 text-right">
                  Joined / Location
                </th>
                <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider align-middle border border-gray-200 dark:border-gray-700 text-center">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-8 text-center text-gray-500 font-medium"
                  >
                    Loading customers...
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8">
                    <div className="flex flex-col items-center justify-center gap-3 text-gray-400">
                      <Users
                        size={48}
                        className="text-gray-300 dark:text-gray-700"
                      />
                      <p className="font-medium text-gray-500">
                        No customers found.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <React.Fragment key={customer.id}>
                    <tr
                      className={`group transition-colors duration-200 cursor-pointer hover:bg-gray-50/80 dark:hover:bg-gray-750/30 ${expandedId === customer.id ? "bg-blue-50/40 dark:bg-blue-900/10" : ""}`}
                      onClick={() =>
                        setExpandedId(
                          expandedId === customer.id ? null : customer.id,
                        )
                      }
                    >
                      <td className="px-6 py-4 align-middle border border-gray-200 dark:border-gray-750">
                        <div className="flex items-center gap-3">
                          {customer.isGuest ? (
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
                                {customer.name || "Unknown"}
                              </p>
                            </div>
                            {(customer.email || customer.phone) && (
                              <p className="text-xs text-gray-500 mt-0.5">
                                {customer.phone || customer.email}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 align-middle border border-gray-200 dark:border-gray-750 text-center">
                        <span className="font-black text-gray-700 dark:text-gray-300 text-lg">
                          {customer.totalOrderCount || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 align-middle border border-gray-200 dark:border-gray-750 font-black text-emerald-600 dark:text-emerald-400 text-center text-lg">
                        ৳ {(customer.totalOrderAmount || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 align-middle border border-gray-200 dark:border-gray-750 text-right">
                        <div className="flex flex-col items-end gap-1">
                          <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 font-medium text-xs">
                            <Calendar size={12} />
                            {formatDate(customer.createdAt)}
                          </div>
                          {(customer.area || customer.city) && (
                            <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 font-medium text-xs">
                              <MapPin size={12} />
                              {customer.area
                                ? `${customer.area}, ${customer.city}`
                                : customer.city}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 align-middle border border-gray-200 dark:border-gray-750 text-center">
                        {customer.isGuest ? (
                          <span className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1 border border-amber-200 dark:border-amber-800">
                            <UserX size={12} /> GUEST
                          </span>
                        ) : (
                          <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1 border border-blue-200 dark:border-blue-800">
                            <Users size={12} /> REGISTERED
                          </span>
                        )}
                      </td>
                    </tr>
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
