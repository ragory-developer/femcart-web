"use client";

import { API_URL } from "@/lib/config";
import { MessageSquare, Search, Ticket, Users, UserX } from "lucide-react";
import { useEffect, useState } from "react";
import { SmsCouponModal } from "../../../components/admin/SmsCouponModal";

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

export default function SmsMarketingPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<"ALL" | "GUEST" | "REGISTERED">(
    "ALL",
  );
  const [search, setSearch] = useState("");

  // Bulk action states
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>([]);
  const [isSmsModalOpen, setIsSmsModalOpen] = useState(false);
  const [smsType, setSmsType] = useState<"SMS" | "COUPON">("SMS");
  const [smsMessage, setSmsMessage] = useState("");

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
        // Filter out those without valid phone/email for SMS, or just show them all
        // Usually SMS requires phone, but we display all here and mock send
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
    if (filterType === "GUEST" && !c.isGuest) return false;
    if (filterType === "REGISTERED" && c.isGuest) return false;

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

  const toggleSelectAll = () => {
    if (
      selectedCustomerIds.length === filteredCustomers.length &&
      filteredCustomers.length > 0
    ) {
      setSelectedCustomerIds([]);
    } else {
      setSelectedCustomerIds(filteredCustomers.map((c) => c.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedCustomerIds.includes(id)) {
      setSelectedCustomerIds(selectedCustomerIds.filter((i) => i !== id));
    } else {
      setSelectedCustomerIds([...selectedCustomerIds, id]);
    }
  };

  const insertPlaceholder = (placeholder: string) => {
    setSmsMessage(
      (prev) =>
        prev +
        (prev.endsWith(" ") || prev.length === 0 ? "" : " ") +
        placeholder,
    );
  };

  const getParsedMessage = (
    customer: Customer | undefined,
    template: string,
  ) => {
    if (!customer) return "";
    let msg =
      template ||
      (smsType === "COUPON"
        ? "Hi [Name], check out our latest offers: [StoreLink]"
        : "Hi [Name], we have an important update: [StoreLink]");

    // Parse placeholders
    msg = msg.replace(/\[Name\]/g, customer.name || "Customer");

    const domain =
      typeof window !== "undefined"
        ? window.location.origin
        : "https://femcart.com";
    msg = msg.replace(/\[StoreLink\]/g, domain);
    msg = msg.replace(/\[PromoCode\]/g, "SPECIAL20");

    return msg;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <MessageSquare className="text-blue-500" size={24} />
          SMS Marketing
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Target and engage your customers with SMS campaigns.
        </p>
      </div>

      {/* Top Stats Cards - Minimalist */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-0.5">
              Total Audience
            </p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {customers.length}
            </h3>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <MessageSquare size={24} />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-0.5">
              Registered Users
            </p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {customers.filter((c) => !c.isGuest).length}
            </h3>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <UserX size={24} />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-0.5">
              Guest Shoppers
            </p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {customers.filter((c) => c.isGuest).length}
            </h3>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        {/* Filters Bar */}
        <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30">
          <div className="flex items-center gap-1 bg-gray-200/50 dark:bg-gray-800 p-1 rounded-lg w-full md:w-auto">
            <button
              onClick={() => setFilterType("ALL")}
              className={`flex-1 md:flex-none px-4 py-1.5 text-sm font-medium rounded-md transition-all ${filterType === "ALL" ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType("REGISTERED")}
              className={`flex-1 md:flex-none px-4 py-1.5 text-sm font-medium rounded-md transition-all ${filterType === "REGISTERED" ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}
            >
              Registered
            </button>
            <button
              onClick={() => setFilterType("GUEST")}
              className={`flex-1 md:flex-none px-4 py-1.5 text-sm font-medium rounded-md transition-all ${filterType === "GUEST" ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}
            >
              Guests
            </button>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search audience..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-gray-900">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={
                filteredCustomers.length > 0 &&
                selectedCustomerIds.length === filteredCustomers.length
              }
              onChange={toggleSelectAll}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <span className="text-sm text-gray-500 font-medium">
              Select All
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={selectedCustomerIds.length === 0}
              onClick={() => {
                setSmsType("SMS");
                setIsSmsModalOpen(true);
              }}
              className="text-sm font-medium bg-white hover:bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 disabled:opacity-50 px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors"
            >
              <MessageSquare size={14} /> Send SMS
            </button>
            <button
              disabled={selectedCustomerIds.length === 0}
              onClick={() => {
                setSmsType("COUPON");
                setIsSmsModalOpen(true);
              }}
              className="text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors"
            >
              <Ticket size={14} /> Send Promo
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px] text-sm">
            <thead>
              <tr className="bg-gray-50/80 dark:bg-gray-800/80">
                <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider align-middle border border-gray-200 dark:border-gray-700 w-12 text-center"></th>
                <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider align-middle border border-gray-200 dark:border-gray-700 w-1/3">
                  Customer
                </th>
                <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider align-middle border border-gray-200 dark:border-gray-700 text-center">
                  Orders
                </th>
                <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider align-middle border border-gray-200 dark:border-gray-700 text-center">
                  Spent
                </th>
                <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider align-middle border border-gray-200 dark:border-gray-700 text-center">
                  Type
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
                  <tr
                    key={customer.id}
                    className="group transition-colors duration-200 hover:bg-gray-50/80 dark:hover:bg-gray-750/30"
                  >
                    <td className="px-6 py-4 align-middle border border-gray-200 dark:border-gray-750">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedCustomerIds.includes(customer.id)}
                          onChange={() => toggleSelect(customer.id)}
                          className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500 cursor-pointer"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 align-middle border border-gray-200 dark:border-gray-750">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 dark:bg-gray-800 flex items-center justify-center shrink-0">
                          {customer.isGuest ? (
                            <UserX size={14} />
                          ) : (
                            <Users size={14} />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white text-sm">
                            {customer.name || "Unknown"}
                          </p>
                          {(customer.email || customer.phone) && (
                            <p className="text-xs text-gray-500">
                              {customer.phone || customer.email}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 align-middle border border-gray-200 dark:border-gray-750 text-center">
                      <span className="text-gray-700 dark:text-gray-300 text-sm">
                        {customer.totalOrderCount || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 align-middle border border-gray-200 dark:border-gray-750 text-gray-900 dark:text-white text-center text-sm font-medium">
                      ${(customer.totalOrderAmount || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 align-middle border border-gray-200 dark:border-gray-750 text-center">
                      {customer.isGuest ? (
                        <span className="text-gray-500 dark:text-gray-400 text-xs inline-flex items-center gap-1">
                          Guest
                        </span>
                      ) : (
                        <span className="text-blue-600 dark:text-blue-400 text-xs font-medium inline-flex items-center gap-1">
                          Registered
                        </span>
                      )}
                    </td>
                  </tr>
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
        context="GENERAL"
        selectedCount={selectedCustomerIds.length}
        smsMessage={smsMessage}
        setSmsMessage={setSmsMessage}
        insertPlaceholder={insertPlaceholder}
        previewMessage={getParsedMessage(
          filteredCustomers.find((c) => c.id === selectedCustomerIds[0]),
          smsMessage,
        )}
        onSend={async () => {
          const selected = filteredCustomers.filter((c) =>
            selectedCustomerIds.includes(c.id),
          );
          const payloads = selected
            .map((customer) => ({
              phone: customer.phone || "No Phone",
              message: getParsedMessage(customer, smsMessage),
            }))
            .filter((p) => p.phone !== "No Phone");

          if (payloads.length === 0) {
            alert("No valid phone numbers found in selected customers.");
            return;
          }

          try {
            const token =
              localStorage.getItem("femcart_access_token") ||
              localStorage.getItem("token");
            const res = await fetch(`${API_URL}/api/sms/bulk`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ payloads }),
            });

            const data = await res.json();
            if (res.ok && data.success) {
              alert(`Success: ${data.message}`);
              setIsSmsModalOpen(false);
              setSelectedCustomerIds([]);
              setSmsMessage("");
            } else {
              alert(`Error: ${data.message || "Failed to send bulk SMS"}`);
            }
          } catch (error) {
            console.error("Bulk SMS Error:", error);
            alert("Failed to reach server to dispatch SMS.");
          }
        }}
      />
    </div>
  );
}
