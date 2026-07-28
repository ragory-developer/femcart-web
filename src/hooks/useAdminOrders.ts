import { API_URL } from "@/lib/config";
import { Order } from "@/types/order";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Logger } from "@/lib/logger";

export function useAdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // DataTable States
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
  });

  const searchParams = useSearchParams();
  const router = useRouter();

  const couponCode = searchParams.get("couponCode");
  const currentStatus = searchParams.get("status") || "ALL";

  const statuses = [
    { label: "All Orders", value: "ALL" },
    { label: "Pending", value: "PENDING" },
    { label: "Processing", value: "PROCESSING" },
    { label: "Shipped", value: "SHIPPED" },
    { label: "Delivered", value: "DELIVERED" },
    { label: "Completed", value: "COMPLETED" },
    { label: "Returned", value: "RETURNED" },
    { label: "Cancelled", value: "CANCELLED" },
  ];

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // Reset to page 1 on search
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const token =
          localStorage.getItem("femcart_access_token") ||
          localStorage.getItem("token");
        const url = new URL(`${API_URL}/api/orders`);
        url.searchParams.append("page", page.toString());
        url.searchParams.append("limit", limit.toString());

        if (couponCode) url.searchParams.append("couponCode", couponCode);
        if (currentStatus !== "ALL")
          url.searchParams.append("status", currentStatus);
        if (debouncedSearch) url.searchParams.append("search", debouncedSearch);

        const res = await fetch(url.toString(), {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();

        if (json.success) {
          setOrders(json.data);
          if (json.pagination) {
            setPagination({
              total: json.pagination.total,
              totalPages: json.pagination.totalPages,
            });
          }
        } else {
          toast.error("Failed to load orders");
          Logger.warn("Failed to fetch orders", json, "useAdminOrders");
        }
      } catch (err) {
        toast.error("Network error while loading orders");
        Logger.error("Failed to fetch orders", err, "useAdminOrders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [couponCode, currentStatus, debouncedSearch, page, limit]);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdatingStatus(true);
    try {
      const token =
        localStorage.getItem("femcart_access_token") ||
        localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)),
        );
        if (selectedOrder?.id === orderId) {
          setSelectedOrder((prev) =>
            prev ? { ...prev, status: newStatus } : null,
          );
        }
        toast.success(`Order status updated to ${newStatus}`);
      } else {
        toast.error(data.message || "Failed to update order status");
      }
    } catch (err) {
      toast.error("Network error while updating status");
      Logger.error("Failed to update status", err, "useAdminOrders");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleStatusFilter = (status: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (status === "ALL") params.delete("status");
    else params.set("status", status);
    router.push(`/admin/orders?${params.toString()}`);
  };

  return {
    orders,
    setOrders,
    loading,
    selectedOrder,
    setSelectedOrder,
    updatingStatus,
    searchQuery,
    setSearchQuery,
    page,
    setPage,
    limit,
    setLimit,
    pagination,
    couponCode,
    currentStatus,
    statuses,
    updateOrderStatus,
    handleStatusFilter,
  };
}
