import { API_URL } from "@/lib/config";
import { Order, OrderItem } from "@/types/order";
import {
  Clock,
  MapPin,
  Package,
  Settings,
  X,
  Printer,
  CheckCircle2,
  CircleDashed,
  Truck,
  Check,
  Copy,
  CheckCheck,
  RotateCcw,
  Leaf,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Logger } from "@/lib/logger";

interface OrderDetailsModalProps {
  selectedOrder: Order;
  setSelectedOrder: (order: Order | null) => void;
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  updatingStatus: boolean;
  updateOrderStatus: (orderId: string, status: string) => void;
  statuses: { label: string; value: string }[];
}

const STEPPER_STAGES = [
  { value: "PENDING", label: "Pending", icon: CircleDashed },
  { value: "CONFIRMED", label: "Confirmed", icon: CheckCircle2 },
  { value: "PROCESSING", label: "Processing", icon: Package },
  { value: "SHIPPED", label: "Shipped", icon: Truck },
  { value: "DELIVERED", label: "Delivered", icon: Check },
];

export function OrderDetailsModal({
  selectedOrder,
  setSelectedOrder,
  setOrders,
  updatingStatus,
  updateOrderStatus,
  statuses,
}: OrderDetailsModalProps) {
  const [returnItem, setReturnItem] = useState<OrderItem | null>(null);
  const [returnQuantity, setReturnQuantity] = useState(1);
  const [returnDamaged, setReturnDamaged] = useState(false);
  const [returnReason, setReturnReason] = useState("");
  const [refundShipping, setRefundShipping] = useState(false);
  const [refundMethod, setRefundMethod] = useState<
    "WALLET" | "ORIGINAL" | "MANUAL"
  >("WALLET");
  const [processingReturn, setProcessingReturn] = useState(false);

  const [noteContent, setNoteContent] = useState("");
  const [addingNote, setAddingNote] = useState(false);

  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);

  // Tracking State
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");
  const [courierName, setCourierName] = useState("");
  const [updatingTracking, setUpdatingTracking] = useState(false);

  useEffect(() => {
    setTrackingNumber(selectedOrder.trackingNumber || "");
    setTrackingUrl(selectedOrder.trackingUrl || "");
    setCourierName(selectedOrder.courierName || "");
    setPendingStatus(null);
  }, [selectedOrder]);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
    toast.success(`${field} copied!`);
  };

  const handleProcessReturn = async () => {
    if (!selectedOrder || !returnItem) return;
    setProcessingReturn(true);
    try {
      const token =
        localStorage.getItem("femcart_access_token") ||
        localStorage.getItem("token");
      const res = await fetch(
        `${API_URL}/api/orders/${selectedOrder.id}/return-items`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            items: [
              {
                orderItemId: returnItem.id,
                quantity: returnQuantity,
                isDamaged: returnDamaged,
                reason: returnReason,
              },
            ],
            refundShipping,
            refundMethod,
          }),
        },
      );
      const data = await res.json();
      if (data.success) {
        setSelectedOrder(data.data);
        setOrders((prev) =>
          prev.map((o) => (o.id === data.data.id ? data.data : o)),
        );
        setReturnItem(null);
        setReturnQuantity(1);
        setReturnDamaged(false);
        setReturnReason("");
        setRefundShipping(false);
        setRefundMethod("WALLET");
        toast.success("Return processed successfully");
      } else {
        toast.error(data.message || "Failed to process return");
        Logger.warn("Failed to process return", data, "OrderDetailsModal");
      }
    } catch (err) {
      toast.error("Network error while processing return");
      Logger.error("Failed to process return", err, "OrderDetailsModal");
    } finally {
      setProcessingReturn(false);
    }
  };

  const handleAddNote = async () => {
    if (!selectedOrder || !noteContent.trim()) return;
    setAddingNote(true);
    try {
      const token =
        localStorage.getItem("femcart_access_token") ||
        localStorage.getItem("token");
      const res = await fetch(
        `${API_URL}/api/orders/${selectedOrder.id}/notes`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ content: noteContent }),
        },
      );
      const data = await res.json();
      if (data.success) {
        const updatedOrder = {
          ...selectedOrder,
          orderNotes: [data.data, ...((selectedOrder as any).orderNotes || [])],
        };
        setSelectedOrder(updatedOrder as any);
        setOrders((prev) =>
          prev.map((o) =>
            o.id === selectedOrder.id ? (updatedOrder as any) : o,
          ),
        );
        setNoteContent("");
        toast.success("Note added");
      } else {
        toast.error(data.message || "Failed to add note");
      }
    } catch (err) {
      toast.error("Network error while adding note");
      Logger.error("Failed to add note", err, "OrderDetailsModal");
    } finally {
      setAddingNote(false);
    }
  };

  const handleUpdateTracking = async () => {
    if (!selectedOrder) return;
    setUpdatingTracking(true);
    try {
      const token =
        localStorage.getItem("femcart_access_token") ||
        localStorage.getItem("token");
      const res = await fetch(
        `${API_URL}/api/orders/${selectedOrder.id}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: selectedOrder.status,
            trackingNumber,
            trackingUrl,
            courierName,
          }),
        },
      );
      const data = await res.json();
      if (data.success) {
        setSelectedOrder(data.data);
        setOrders((prev) =>
          prev.map((o) => (o.id === selectedOrder.id ? data.data : o)),
        );
        toast.success("Tracking updated");
      } else {
        toast.error(data.message || "Failed to update tracking");
      }
    } catch (err) {
      toast.error("Network error");
    } finally {
      setUpdatingTracking(false);
    }
  };

  const actualStageIndex = STEPPER_STAGES.findIndex(
    (s) => s.value === selectedOrder.status,
  );
  const displayStatus = pendingStatus || selectedOrder.status;
  const currentStageIndex = STEPPER_STAGES.findIndex(
    (s) => s.value === displayStatus,
  );
  const isCancelled = selectedOrder.status === "CANCELLED";
  const isReturned =
    selectedOrder.status === "RETURNED" ||
    selectedOrder.status === "PARTIALLY_RETURNED";

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 print:p-0 print:block print:relative print:z-auto">
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-md print:hidden"
          onClick={() => setSelectedOrder(null)}
        />
        <div className="relative bg-white dark:bg-gray-900 w-full max-w-[1000px] max-h-[95vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] rounded-xl shadow-2xl border border-white/10 slide-up print:shadow-none print:border-none print:w-full print:max-w-none print:h-auto print:max-h-none print:rounded-none print:overflow-visible flex flex-col">
          <div className="print:hidden flex flex-col w-full h-full">
            {/* Header Action Bar */}
            <div className="sticky top-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 p-6 flex justify-between items-center z-20 print:hidden">
              <div className="flex items-center gap-4">
                <div>
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                    Order #{selectedOrder.id}
                  </h2>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-0.5">
                    {new Date(selectedOrder.createdAt).toLocaleString()}
                  </p>
                </div>
                {isCancelled && (
                  <span className="px-3 py-1 bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-rose-200 dark:border-rose-800">
                    Cancelled
                  </span>
                )}
                {isReturned && (
                  <span className="px-3 py-1 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-orange-200 dark:border-orange-800">
                    {selectedOrder.status.replace("_", " ")}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl text-xs font-bold transition-all"
                >
                  <Printer size={16} /> Print
                </button>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-rose-900/30 dark:hover:text-rose-400 rounded-full transition-colors ml-2"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-8 print:p-0">
              {/* Visual Stepper */}
              {!isCancelled && !isReturned && (
                <div className="mb-10 p-6 bg-gray-50/50 dark:bg-gray-800/30 rounded-xl border border-gray-100 dark:border-gray-800 print:hidden">
                  <div className="flex items-center justify-between relative">
                    {/* Connecting Line */}
                    <div className="absolute left-[5%] right-[5%] top-1/2 h-1 -translate-y-1/2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden z-0">
                      <div
                        className="h-full bg-emerald-500 transition-all duration-700 ease-in-out"
                        style={{
                          width:
                            currentStageIndex > 0
                              ? `${(currentStageIndex / (STEPPER_STAGES.length - 1)) * 100}%`
                              : "0%",
                        }}
                      />
                    </div>

                    {STEPPER_STAGES.map((stage, idx) => {
                      const isCompleted = currentStageIndex >= idx;
                      const isActive = currentStageIndex === idx;
                      const canClick =
                        !updatingStatus && idx === actualStageIndex + 1;

                      return (
                        <div
                          key={stage.value}
                          className={`relative z-10 flex flex-col items-center gap-2 ${canClick ? "cursor-pointer group" : ""}`}
                          onClick={() =>
                            canClick && setPendingStatus(stage.value)
                          }
                        >
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 border-4 ${
                              isCompleted
                                ? "bg-emerald-500 border-emerald-100 dark:border-emerald-900 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                                : canClick
                                  ? "bg-white dark:bg-gray-800 border-emerald-200 dark:border-emerald-800 text-emerald-500 group-hover:scale-110 group-hover:border-emerald-400 shadow-lg"
                                  : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-300 dark:text-gray-600"
                            }`}
                          >
                            <stage.icon
                              size={20}
                              className={isActive ? "animate-pulse" : ""}
                            />
                          </div>
                          <span
                            className={`text-[10px] font-black uppercase tracking-widest ${
                              isCompleted
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-gray-400"
                            }`}
                          >
                            {stage.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Save Status Button */}
                  {pendingStatus && pendingStatus !== selectedOrder.status && (
                    <div className="mt-8 flex justify-end items-center gap-4 animate-in fade-in slide-in-from-top-2">
                      <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">
                        Update status to{" "}
                        {
                          STEPPER_STAGES.find((s) => s.value === pendingStatus)
                            ?.label
                        }
                        ?
                      </span>
                      <button
                        onClick={() =>
                          updateOrderStatus(selectedOrder.id, pendingStatus)
                        }
                        disabled={updatingStatus}
                        className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg transition-all shadow-emerald-500/20 flex items-center gap-2"
                      >
                        {updatingStatus ? "Saving..." : "Confirm Update"}
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* --- LEFT COLUMN: DETAILS & ITEMS --- */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Customer & Shipping Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:grid-cols-2">
                    <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800/80 dark:to-gray-800/40 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm relative group">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                          Customer Profile
                        </h3>
                        {selectedOrder.user?.id && (
                          <button
                            onClick={() =>
                              window.open(
                                `/admin/customers/${selectedOrder.user.id}`,
                                "_blank",
                              )
                            }
                            className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 uppercase tracking-widest print:hidden"
                          >
                            View Profile ↗
                          </button>
                        )}
                      </div>
                      <div className="flex gap-4 items-center">
                        <div className="w-14 h-14 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-black text-2xl shadow-inner">
                          {selectedOrder.customerName
                            ? selectedOrder.customerName[0].toUpperCase()
                            : selectedOrder.user?.name
                              ? selectedOrder.user.name[0].toUpperCase()
                              : "G"}
                        </div>
                        <div className="flex-1">
                          <p className="text-lg font-black text-gray-900 dark:text-white leading-none">
                            {selectedOrder.customerName ||
                              selectedOrder.user?.name ||
                              "Guest"}
                            {selectedOrder.user?.isGuest && (
                              <span className="ml-2 text-[8px] font-black uppercase bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-md align-middle">
                                GUEST
                              </span>
                            )}
                          </p>
                          <div className="flex items-center gap-2 mt-2 group/phone">
                            <p className="text-sm text-gray-500 font-bold">
                              {selectedOrder.customerPhone ||
                                selectedOrder.user?.phone ||
                                "No phone"}
                            </p>
                            <button
                              onClick={() =>
                                handleCopy(
                                  selectedOrder.customerPhone ||
                                    selectedOrder.user?.phone ||
                                    "",
                                  "Phone",
                                )
                              }
                              className="opacity-0 group-hover/phone:opacity-100 transition-opacity p-1 text-gray-400 hover:text-emerald-500 print:hidden"
                            >
                              {copiedField === "Phone" ? (
                                <CheckCheck size={14} />
                              ) : (
                                <Copy size={14} />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800/80 dark:to-gray-800/40 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm relative group">
                      <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <MapPin size={14} /> Delivery Address
                      </h3>
                      <div className="group/address relative">
                        <p className="text-sm font-bold text-gray-900 dark:text-white leading-snug pr-8">
                          {selectedOrder.deliveryAddress}
                        </p>
                        <p className="text-xs text-gray-500 font-medium whitespace-pre-line leading-relaxed mt-1">
                          {[
                            selectedOrder.deliveryArea,
                            selectedOrder.deliveryCity,
                            selectedOrder.deliveryState,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                        <button
                          onClick={() =>
                            handleCopy(
                              `${selectedOrder.deliveryAddress}, ${[selectedOrder.deliveryArea, selectedOrder.deliveryCity, selectedOrder.deliveryState].filter(Boolean).join(", ")}`,
                              "Address",
                            )
                          }
                          className="absolute right-0 top-0 opacity-0 group-hover/address:opacity-100 transition-opacity p-1.5 text-gray-400 hover:text-emerald-500 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 print:hidden"
                        >
                          {copiedField === "Address" ? (
                            <CheckCheck size={14} />
                          ) : (
                            <Copy size={14} />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Order Items Table */}
                  <div className="bg-white dark:bg-gray-800/50 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 print:border-none print:shadow-none print:p-0">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                      <Package size={14} /> Order Items
                    </h3>
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar print:max-h-none print:overflow-visible">
                      {selectedOrder.items.map((item, idx) => {
                        const returnedQty = (item as any).returnedQuantity || 0;
                        const damagedQty = (item as any).damagedQuantity || 0;
                        const availableToReturn =
                          item.quantity - returnedQty - damagedQty;
                        const showReturnBtn =
                          availableToReturn > 0 &&
                          [
                            "DELIVERED",
                            "COMPLETED",
                            "PARTIALLY_RETURNED",
                          ].includes(selectedOrder.status);

                        return (
                          <div
                            key={idx}
                            className="pb-4 border-b border-gray-100 dark:border-gray-700 last:border-0 last:pb-0 print:border-b-2 print:border-gray-200"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex flex-col">
                                <span className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
                                  {item.product?.name || "Unknown Product"}
                                  {item.variant &&
                                    item.variant.attributes?.length > 0 && (
                                      <span className="ml-1 text-xs font-normal text-gray-500">
                                        (
                                        {item.variant.attributes
                                          .map((a: any) => a.value)
                                          .join(" / ")}
                                        )
                                      </span>
                                    )}
                                </span>
                                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
                                  Qty: {item.quantity} × ৳{" "}
                                  {item.price.toFixed(2)}
                                </span>
                              </div>
                              <div className="text-right flex flex-col items-end">
                                <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                                  ৳ {(item.quantity * item.price).toFixed(2)}
                                </span>
                                {showReturnBtn && (
                                  <button
                                    onClick={() => setReturnItem(item as any)}
                                    className="mt-3 flex items-center gap-1.5 text-[10px] font-black tracking-widest uppercase bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 hover:bg-rose-500 hover:text-white px-4 py-2 rounded-xl transition-all border-2 border-rose-200 dark:border-rose-500/30 hover:border-rose-500 shadow-sm print:hidden group/btn"
                                  >
                                    <RotateCcw
                                      size={14}
                                      className="group-hover/btn:-rotate-90 transition-transform duration-300"
                                    />
                                    Process Return
                                  </button>
                                )}
                              </div>
                            </div>

                            {(returnedQty > 0 || damagedQty > 0) && (
                              <div className="mt-3 p-3 bg-rose-50/50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/30 rounded-xl flex items-center gap-4">
                                {returnedQty > 0 && (
                                  <div className="text-[10px] text-rose-700 dark:text-rose-300">
                                    <span className="font-bold text-rose-600 dark:text-rose-400">
                                      RESTOCKED:
                                    </span>{" "}
                                    {returnedQty}
                                  </div>
                                )}
                                {damagedQty > 0 && (
                                  <div className="text-[10px] text-orange-700 dark:text-orange-300">
                                    <span className="font-bold text-orange-600 dark:text-orange-400">
                                      DAMAGED:
                                    </span>{" "}
                                    {damagedQty}
                                  </div>
                                )}
                                {(item as any).returnReason && (
                                  <div className="text-[10px] text-gray-500 italic flex-1 text-right">
                                    "{(item as any).returnReason}"
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700 space-y-3 print:border-t-4 print:border-gray-900">
                      <div className="flex justify-between text-xs text-gray-500 font-bold">
                        <span>SUBTOTAL</span>
                        <span>৳ {selectedOrder.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 font-bold">
                        <span>DELIVERY FEE</span>
                        <span>৳ {selectedOrder.deliveryFee.toFixed(2)}</span>
                      </div>
                      {selectedOrder.discount > 0 && (
                        <div className="flex justify-between text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                          <span>
                            DISCOUNT{" "}
                            {selectedOrder.couponCode &&
                              `(${selectedOrder.couponCode})`}
                          </span>
                          <span>-৳ {selectedOrder.discount.toFixed(2)}</span>
                        </div>
                      )}
                      {((selectedOrder as any).refundAmount || 0) > 0 && (
                        <div className="flex justify-between text-xs text-rose-600 dark:text-rose-400 font-bold">
                          <span>REFUND AMOUNT</span>
                          <span>
                            -৳ {(selectedOrder as any).refundAmount.toFixed(2)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between items-center pt-4 mt-2 border-t border-gray-100 dark:border-gray-700">
                        <span className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">
                          Grand Total
                        </span>
                        <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                          ৳ {selectedOrder.total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* --- RIGHT COLUMN: ACTIONS & TIMELINE --- */}
                <div className="space-y-6 print:hidden">
                  {/* Order Status & Actions */}
                  <div className="bg-white dark:bg-gray-800/50 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Settings size={14} /> Order Actions
                    </h3>

                    <div className="space-y-5">
                      <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                          Payment Status
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-[10px] font-black uppercase text-gray-700 dark:text-gray-300 shadow-sm">
                            {selectedOrder.paymentMethod}
                          </span>
                          <span
                            className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase shadow-sm ${selectedOrder.paymentStatus === "PAID" ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-orange-100 text-orange-700 border-orange-200"}`}
                          >
                            {selectedOrder.paymentStatus}
                          </span>
                        </div>
                      </div>

                      {/* Tracking Info Update */}
                      {(selectedOrder.status === "PROCESSING" ||
                        selectedOrder.status === "SHIPPED") && (
                        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800 space-y-3">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center justify-between">
                            <span>Shipment Tracking</span>
                            {selectedOrder.trackingUrl && (
                              <a
                                href={selectedOrder.trackingUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-emerald-500 hover:underline"
                              >
                                Track
                              </a>
                            )}
                          </p>
                          <div className="space-y-2">
                            <input
                              type="text"
                              placeholder="Courier Name"
                              value={courierName}
                              onChange={(e) => setCourierName(e.target.value)}
                              className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-xs font-medium outline-none focus:border-emerald-500 transition-colors"
                            />
                            <input
                              type="text"
                              placeholder="Tracking Number"
                              value={trackingNumber}
                              onChange={(e) =>
                                setTrackingNumber(e.target.value)
                              }
                              className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-xs font-medium outline-none focus:border-emerald-500 transition-colors"
                            />
                            <input
                              type="text"
                              placeholder="Tracking URL"
                              value={trackingUrl}
                              onChange={(e) => setTrackingUrl(e.target.value)}
                              className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-xs font-medium outline-none focus:border-emerald-500 transition-colors"
                            />
                            <button
                              onClick={handleUpdateTracking}
                              disabled={updatingTracking}
                              className="w-full mt-2 px-4 py-2 bg-gray-900 dark:bg-emerald-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest disabled:opacity-50 hover:bg-emerald-600 transition-colors"
                            >
                              {updatingTracking ? "Saving..." : "Save Tracking"}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Cancel action */}
                      {selectedOrder.status !== "CANCELLED" &&
                        selectedOrder.status !== "RETURNED" &&
                        selectedOrder.status !== "DELIVERED" && (
                          <button
                            onClick={() =>
                              updateOrderStatus(selectedOrder.id, "CANCELLED")
                            }
                            disabled={updatingStatus}
                            className="w-full px-4 py-3 rounded-lg text-[10px] font-black tracking-widest uppercase transition-all bg-white dark:bg-transparent text-rose-600 border-2 border-rose-100 dark:border-rose-900/50 hover:bg-rose-600 hover:text-white hover:border-rose-600 shadow-sm disabled:opacity-50"
                          >
                            Cancel Order
                          </button>
                        )}
                    </div>
                  </div>

                  {/* Order Timeline Notes */}
                  <div className="bg-white dark:bg-gray-800/50 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col h-[400px]">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Clock size={14} /> Activity Feed
                    </h3>

                    <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pr-2 relative">
                      <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-gray-100 dark:bg-gray-800 z-0" />
                      <div className="space-y-6 relative z-10">
                        {((selectedOrder as any).orderNotes || []).map(
                          (note: any, index: number) => (
                            <div key={note.id} className="flex gap-4">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm border-2 border-white dark:border-gray-900 ${note.isSystem ? "bg-gray-100 dark:bg-gray-800 text-gray-500" : "bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400"}`}
                              >
                                {note.isSystem ? (
                                  <Settings size={12} />
                                ) : (
                                  <Clock size={12} />
                                )}
                              </div>
                              <div className="pt-1 flex-1">
                                <p className="text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-widest">
                                  {new Date(note.createdAt).toLocaleString()}
                                  {!note.isSystem && (
                                    <span className="ml-2 text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded-md">
                                      Note
                                    </span>
                                  )}
                                </p>
                                <p className="text-xs text-gray-700 dark:text-gray-300 font-medium leading-relaxed bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg rounded-tl-none border border-gray-100 dark:border-gray-800 inline-block">
                                  {note.content}
                                </p>
                              </div>
                            </div>
                          ),
                        )}
                        {((selectedOrder as any).orderNotes || []).length ===
                          0 && (
                          <p className="text-xs text-gray-400 italic text-center py-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            No activity recorded yet.
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                      <div className="flex flex-col gap-2 relative">
                        <textarea
                          value={noteContent}
                          onChange={(e) => setNoteContent(e.target.value)}
                          placeholder="Type a private note..."
                          rows={2}
                          className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-3 text-xs font-medium outline-none focus:border-emerald-500 resize-none custom-scrollbar"
                        />
                        <button
                          onClick={handleAddNote}
                          disabled={addingNote || !noteContent.trim()}
                          className="absolute bottom-2 right-2 px-4 py-1.5 bg-gray-900 dark:bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase disabled:opacity-50 hover:bg-emerald-600 transition-colors shadow-sm"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>{" "}
          {/* Closing print:hidden wrapper */}
          {/* ======================= */}
          {/*      PRINT INVOICE      */}
          {/* ======================= */}
          <div className="hidden print:block bg-white text-black p-8 font-sans w-full max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-gray-900 pb-6 mb-8">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-500 p-2 rounded-lg text-white">
                  <Leaf size={24} />
                </div>
                <span className="text-2xl font-black tracking-tight text-gray-900">
                  Femcart
                </span>
              </div>
              <div className="text-right">
                <h1 className="text-4xl font-black text-gray-200 uppercase tracking-widest mb-2">
                  Invoice
                </h1>
                <p className="text-sm font-bold text-gray-800">
                  Order #{selectedOrder.id}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(selectedOrder.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Customer Details */}
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                  Customer Info
                </h3>
                <p className="text-lg font-bold text-gray-900">
                  {selectedOrder.customerName ||
                    selectedOrder.user?.name ||
                    "Guest"}
                </p>
                <p className="text-sm text-gray-600">
                  {selectedOrder.customerPhone ||
                    selectedOrder.user?.phone ||
                    "No phone provided"}
                </p>
              </div>
              <div>
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                  Delivery Address
                </h3>
                <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
                  {selectedOrder.deliveryAddress}
                </p>
              </div>
            </div>

            {/* Items Table */}
            <div className="mb-8">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-900">
                    <th className="py-3 text-xs font-black text-gray-900 uppercase tracking-widest">
                      Item Description
                    </th>
                    <th className="py-3 text-xs font-black text-gray-900 uppercase tracking-widest text-center">
                      Qty
                    </th>
                    <th className="py-3 text-xs font-black text-gray-900 uppercase tracking-widest text-right">
                      Unit Price
                    </th>
                    <th className="py-3 text-xs font-black text-gray-900 uppercase tracking-widest text-right">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items.map((item, idx) => (
                    <tr key={idx} className="border-b border-gray-200">
                      <td className="py-4 text-sm font-bold text-gray-800">
                        {item.product?.name || "Unknown Product"}
                        {item.variant &&
                          item.variant.attributes?.length > 0 && (
                            <span className="ml-1 text-xs font-normal text-gray-500">
                              (
                              {item.variant.attributes
                                .map((a: any) => a.value)
                                .join(" / ")}
                              )
                            </span>
                          )}
                      </td>
                      <td className="py-4 text-sm text-gray-600 text-center">
                        {item.quantity}
                      </td>
                      <td className="py-4 text-sm text-gray-600 text-right">
                        ৳ {item.price.toFixed(2)}
                      </td>
                      <td className="py-4 text-sm font-black text-gray-900 text-right">
                        ৳ {(item.quantity * item.price).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-1/2 space-y-3">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>৳ {selectedOrder.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Delivery Fee</span>
                  <span>৳ {selectedOrder.deliveryFee.toFixed(2)}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-sm text-emerald-600">
                    <span>
                      Discount{" "}
                      {selectedOrder.couponCode &&
                        `(${selectedOrder.couponCode})`}
                    </span>
                    <span>-৳ {selectedOrder.discount.toFixed(2)}</span>
                  </div>
                )}
                {((selectedOrder as any).refundAmount || 0) > 0 && (
                  <div className="flex justify-between text-sm text-rose-600">
                    <span>Refunded Amount</span>
                    <span>
                      -৳ {(selectedOrder as any).refundAmount.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-3 border-t-2 border-gray-900 mt-3">
                  <span className="text-base font-black text-gray-900 uppercase tracking-widest">
                    Grand Total
                  </span>
                  <span className="text-2xl font-black text-gray-900">
                    ৳ {selectedOrder.total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-16 pt-8 border-t border-gray-200 text-center">
              <p className="text-sm font-bold text-gray-800">
                Thank you for your business!
              </p>
              <p className="text-xs text-gray-500 mt-1">
                If you have any questions about this invoice, please contact
                support@femcart.com
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Return Dialog Drawer (Replaced Modal) */}
      <div
        className={`fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${returnItem ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      >
        <div
          className="absolute inset-0"
          onClick={() => !processingReturn && setReturnItem(null)}
        />
        <div
          className={`absolute right-0 top-0 bottom-0 w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl border-l border-gray-200 dark:border-gray-800 transition-transform duration-500 ease-in-out flex flex-col ${returnItem ? "translate-x-0" : "translate-x-full"}`}
        >
          {returnItem && (
            <>
              <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900">
                <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">
                  Process Return
                </h3>
                <button
                  onClick={() => setReturnItem(null)}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 flex-1 overflow-y-auto">
                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-lg mb-8">
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-widest mb-1">
                    Target Product
                  </p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    {returnItem.product?.name}
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Quantity */}
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                      Quantity to Return
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        max={
                          returnItem.quantity -
                          ((returnItem as any).returnedQuantity || 0) -
                          ((returnItem as any).damagedQuantity || 0)
                        }
                        value={returnQuantity}
                        onChange={(e) =>
                          setReturnQuantity(parseInt(e.target.value) || 1)
                        }
                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-3.5 text-sm font-black text-gray-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                        Max:{" "}
                        {returnItem.quantity -
                          ((returnItem as any).returnedQuantity || 0) -
                          ((returnItem as any).damagedQuantity || 0)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                      Internal Reason (Optional)
                    </label>
                    <textarea
                      placeholder="Why is it being returned? (Visible to admins only)"
                      value={returnReason}
                      onChange={(e) => setReturnReason(e.target.value)}
                      rows={2}
                      className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-3 text-xs font-medium text-gray-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none"
                    />
                  </div>

                  {/* Refund Options */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                        Refund Method
                      </label>
                      <select
                        value={refundMethod}
                        onChange={(e) =>
                          setRefundMethod(
                            e.target.value as "WALLET" | "ORIGINAL" | "MANUAL",
                          )
                        }
                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-3 text-xs font-bold text-gray-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-2 transition-all"
                      >
                        <option value="WALLET">Wallet (Credit)</option>
                        <option value="ORIGINAL">Original Payment</option>
                        <option value="MANUAL">Manual / Cash</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                        Shipping Fee
                      </label>
                      <button
                        onClick={() => setRefundShipping(!refundShipping)}
                        className={`w-full py-3 rounded-lg text-[10px] font-black uppercase tracking-widest border-2 transition-all ${refundShipping ? "bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400" : "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 text-gray-400 hover:border-gray-300"}`}
                      >
                        {refundShipping ? "Refunded" : "Not Refunded"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
                <div className="flex justify-between items-center mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Est. Refund
                  </span>
                  <strong className="text-rose-500 text-2xl tracking-tight">
                    ৳{" "}
                    {Math.round(
                      (returnQuantity *
                        returnItem.price *
                        (1 -
                          (selectedOrder.subtotal > 0
                            ? selectedOrder.discount / selectedOrder.subtotal
                            : 0)) +
                        (refundShipping ? selectedOrder.deliveryFee : 0)) *
                        100,
                    ) / 100}
                  </strong>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setReturnItem(null)}
                    disabled={processingReturn}
                    className="py-3.5 rounded-lg text-[10px] font-black tracking-widest uppercase bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleProcessReturn}
                    disabled={processingReturn}
                    className="py-3.5 rounded-lg text-[10px] font-black tracking-widest uppercase bg-gray-900 dark:bg-rose-600 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0"
                  >
                    {processingReturn ? "Processing..." : "Confirm Return"}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
