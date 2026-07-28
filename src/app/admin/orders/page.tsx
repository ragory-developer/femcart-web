"use client";

import { Suspense } from "react";
import { Package } from "lucide-react";
import { useAdminOrders } from "@/hooks/useAdminOrders";
import { OrderToolbar } from "@/components/admin/orders/OrderToolbar";
import { OrderTable } from "@/components/admin/orders/OrderTable";
import { OrderDetailsModal } from "@/components/admin/orders/OrderDetailsModal";

function AdminOrdersContent() {
  const {
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
  } = useAdminOrders();

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3 tracking-tight">
            <Package size={28} className="text-emerald-600" />
            {couponCode
              ? `Orders: ${couponCode}`
              : currentStatus === "ALL"
                ? "All Orders"
                : `${currentStatus} Orders`}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
            Manage and track all customer orders from one place
          </p>
        </div>
      </div>

      <OrderToolbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        limit={limit}
        setLimit={setLimit}
        statuses={statuses}
        currentStatus={currentStatus}
        handleStatusFilter={handleStatusFilter}
      />

      <div className="bg-white dark:bg-gray-900 rounded-[3rem] border border-gray-100 dark:border-gray-800 p-8 shadow-sm min-h-[60vh]">
        <OrderTable
          orders={orders}
          loading={loading}
          couponCode={couponCode}
          setSelectedOrder={setSelectedOrder}
          page={page}
          setPage={setPage}
          limit={limit}
          pagination={pagination}
        />
      </div>

      {selectedOrder && (
        <OrderDetailsModal
          selectedOrder={selectedOrder}
          setSelectedOrder={setSelectedOrder}
          setOrders={setOrders}
          updatingStatus={updatingStatus}
          updateOrderStatus={updateOrderStatus}
          statuses={statuses}
        />
      )}
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AdminOrdersContent />
    </Suspense>
  );
}
