"use client";

import { API_URL } from "@/lib/config";
import * as fpixel from "@/lib/fpixel";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { ChevronRight, Loader2, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useRef, Suspense } from "react";

import AddressForm from "@/components/checkout/AddressForm";
import AuthSelector from "@/components/checkout/AuthSelector";
import PhoneVerification from "@/components/checkout/PhoneVerification";
import PaymentSelector from "@/components/checkout/PaymentSelector";
import { showToast } from "@/lib/toast";
import { useSettingsStore } from "@/store/settingsStore";
import { useShallow } from "zustand/react/shallow";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import PayPalIntegration from "@/components/checkout/PayPalIntegration";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { items, getCartTotal, clearCart } = useCartStore(
    useShallow((state) => ({
      items: state.items,
      getCartTotal: state.getCartTotal,
      clearCart: state.clearCart,
    })),
  );

  const { user, isAuthenticated, fetchUser } = useAuthStore(
    useShallow((state) => ({
      user: state.user,
      isAuthenticated: state.isAuthenticated,
      fetchUser: state.fetchUser,
    })),
  );

  const {
    settings,
    fetchSettings,
    loading: settingsLoading,
  } = useSettingsStore(
    useShallow((state) => ({
      settings: state.settings,
      fetchSettings: state.fetchSettings,
      loading: state.loading,
    })),
  );

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [orderTotals, setOrderTotals] = useState({
    subtotal: getCartTotal(),
    deliveryFee: 0,
    discount: 0,
    total: getCartTotal(),
  });
  const [calculatingTotals, setCalculatingTotals] = useState(false);

  // Checkout Steps State
  const [guestMode, setGuestMode] = useState(false);
  const [verifiedGuestUser, setVerifiedGuestUser] = useState<any>(null);
  const [guestEmail, setGuestEmail] = useState("");

  // Order Formulation State
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>("COD");
  const [deliveryNote, setDeliveryNote] = useState("");
  const [loading, setLoading] = useState(false);
  const isSubmitting = useRef(false);

  useEffect(() => {
    fetchUser();
    fetchSettings();
    if (items.length > 0) {
      fpixel.event("InitiateCheckout", {
        content_ids: items.map((i) => i.id),
        content_type: "product",
        value: getCartTotal(),
        currency: "BDT",
        num_items: items.length,
      });
    }

    // Handle canceled payment redirect
    const canceled = searchParams.get("canceled");
    if (canceled) {
      showToast.error("Payment was canceled. Please try again.");
      // Clean up URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, "", newUrl);
    }
  }, [searchParams, items, getCartTotal]);

  const activeUser = isAuthenticated ? user : verifiedGuestUser;

  const calculateTotals = async (addrToUse: any, couponToUse: string) => {
    if (!activeUser || items.length === 0) return;
    setCalculatingTotals(true);
    try {
      const token =
        localStorage.getItem("femcart_access_token") ||
        localStorage.getItem("token");
      const payload = {
        items: items.map((i) => ({
          productId: i.productId || i.id,
          variantId: i.variantId,
          quantity: i.quantity,
          price: i.price,
        })),
        deliveryAreaId: addrToUse?.areaId,
        deliveryCityId: addrToUse?.cityId,
        couponCode: couponToUse,
      };
      const res = await fetch(`${API_URL}/api/orders/calculate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res
        .json()
        .catch(() => ({ success: false, message: "Server error" }));
      if (data.success) {
        setOrderTotals(data.data);
        if (
          couponToUse &&
          data.data.discount > 0 &&
          couponToUse !== appliedCoupon
        ) {
          setAppliedCoupon(couponToUse);
        }
      } else {
        if (couponToUse) {
          showToast.error(data.message || "Invalid or expired coupon");
          if (couponToUse === couponCode) {
            setCouponCode("");
            setAppliedCoupon("");
            calculateTotals(addrToUse, "");
          }
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCalculatingTotals(false);
    }
  };

  useEffect(() => {
    if (activeUser && items.length > 0) {
      calculateTotals(selectedAddress, appliedCoupon);
    }
  }, [items, selectedAddress, activeUser]);

  useEffect(() => {
    if (activeUser?.email && !guestEmail) {
      setGuestEmail(activeUser.email);
    }
  }, [activeUser, guestEmail]);

  const handleAuthSelect = (mode: "guest" | "login") => {
    if (mode === "guest") {
      if (settings.verify_number_before_order !== "false") {
        setGuestMode(true);
      } else {
        setVerifiedGuestUser({ isGuest: true });
      }
    } else {
      router.push("/login?redirect=/checkout");
    }
  };

  const getOrderPayload = () => {
    return {
      deliveryAddress: selectedAddress?.address,
      deliveryCity: selectedAddress?.city,
      deliveryCityId: selectedAddress?.cityId,
      deliveryArea: selectedAddress?.area,
      deliveryAreaId: selectedAddress?.areaId,
      deliveryStateId: selectedAddress?.stateId,
      paymentMethod,
      couponCode: appliedCoupon,
      notes: deliveryNote || undefined,
      customerName: selectedAddress?.recipientName || activeUser?.name,
      customerPhone: selectedAddress?.recipientPhone || activeUser?.phone,
      customerEmail: guestEmail,
      items: items.map((i) => ({
        productId: i.productId || i.id,
        variantId: i.variantId,
        quantity: i.quantity,
        price: i.price,
      })),
    };
  };

  const submitOrder = async () => {
    if (isSubmitting.current) return;
    if (!activeUser)
      return showToast.error("Please verify your account first.");
    if (!selectedAddress)
      return showToast.error("Please provide a delivery address.");

    if (paymentMethod === "COD") {
      if (!selectedAddress.recipientName)
        return showToast.error("Recipient Name is missing from the address.");
      if (!selectedAddress.recipientPhone)
        return showToast.error("Recipient Phone is missing from the address.");
      if (!selectedAddress.address)
        return showToast.error("Street Address is missing.");
      if (!selectedAddress.stateId)
        return showToast.error("State is missing from the address.");
      if (!selectedAddress.cityId)
        return showToast.error("City is missing from the address.");
      if (!selectedAddress.areaId)
        return showToast.error("ZIP / Area is missing from the address.");
    }

    if (guestEmail && !guestEmail.includes("@")) {
      return showToast.error("Please provide a valid email address.");
    }

    isSubmitting.current = true;
    setLoading(true);
    try {
      const token =
        localStorage.getItem("femcart_access_token") ||
        localStorage.getItem("token");
      const payload = getOrderPayload();

      const res = await fetch(`${API_URL}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        if (
          paymentMethod === "STRIPE" ||
          paymentMethod === "BKASH" ||
          paymentMethod === "CARD" ||
          paymentMethod === "NAGAD"
        ) {
          // Redirect for gateways that return a paymentUrl (Stripe Checkout Session, SSL, bKash)
          if (data.paymentUrl) window.location.href = data.paymentUrl;
        } else {
          // COD Success
          clearCart();
          showToast.success("Order placed successfully!");
          if (isAuthenticated) {
            router.push(`/profile/orders`);
          } else {
            router.push(`/order-success?orderId=${data.data.id}`);
          }
        }
      } else {
        showToast.error(data.message || "Failed to submit order");
      }
    } catch (e) {
      showToast.error("Network Error. Please try again.");
    } finally {
      isSubmitting.current = false;
      setLoading(false);
    }
  };

  const handlePayPalSuccess = (orderId: string) => {
    clearCart();
    showToast.success("PayPal Payment successful!");
    if (isAuthenticated) {
      router.push(`/profile/orders`);
    } else {
      router.push(`/order-success?orderId=${orderId}`); // Or our backend ID if we returned it
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 text-center min-h-[60vh] flex flex-col justify-center items-center">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-4">
          Your Cart is Empty
        </h1>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          Looks like you haven't added anything to your cart yet. Let's find
          some amazing products!
        </p>
        <Link
          href="/"
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  if (settingsLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <p className="text-gray-500 font-medium">Initializing checkout...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50/50 dark:bg-gray-950 min-h-[100dvh] pb-24 relative">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 py-3 lg:py-5">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-4">
          <Link
            href="/"
            className="text-2xl font-black text-blue-600 tracking-tighter italic"
          >
            FEMCART
          </Link>
          <div className="flex items-center flex-wrap justify-center gap-1 sm:gap-2 text-xs sm:text-sm font-bold text-gray-500 dark:text-gray-400">
            <span className="text-blue-600 dark:text-blue-400">Account</span>
            <ChevronRight size={14} className="sm:w-4 sm:h-4" />
            <span
              className={activeUser ? "text-blue-600 dark:text-blue-400" : ""}
            >
              Shipping
            </span>
            <ChevronRight size={14} className="sm:w-4 sm:h-4" />
            <span
              className={activeUser ? "text-blue-600 dark:text-blue-400" : ""}
            >
              Payment
            </span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 lg:py-6">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-8 items-start">
          {/* Main Checkout Flow (Left Column) */}
          <div className="flex-1 w-full space-y-6">
            {!activeUser &&
              (!guestMode ? (
                <AuthSelector onSelect={handleAuthSelect} />
              ) : (
                <PhoneVerification
                  onVerified={(u) => {
                    setVerifiedGuestUser(u);
                  }}
                  onCancel={() => setGuestMode(false)}
                />
              ))}

            {activeUser && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <AddressForm
                  user={activeUser}
                  onAddressSelect={setSelectedAddress}
                />

                <PaymentSelector
                  selected={paymentMethod}
                  onSelect={setPaymentMethod}
                  settings={settings}
                />

                <div className="bg-white dark:bg-gray-800 rounded-2xl lg:rounded-3xl p-5 lg:p-8 border border-gray-100 dark:border-gray-700 shadow-sm">
                  <h2 className="text-xl lg:text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic mb-6">
                    Contact & Instructions
                  </h2>
                  <div className="mb-6">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                      Email Address for Receipt{" "}
                      <span className="font-normal text-gray-400 font-sans italic">
                        (Optional)
                      </span>
                    </label>
                    <input
                      type="email"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      placeholder="Enter your email to receive order confirmation"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:border-blue-500 text-sm transition-colors"
                    />
                  </div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Order Note{" "}
                    <span className="font-normal text-gray-400 font-sans italic">
                      (Optional)
                    </span>
                  </label>
                  <textarea
                    rows={3}
                    value={deliveryNote}
                    onChange={(e) => setDeliveryNote(e.target.value)}
                    placeholder="Any special instructions, gate code, landmark, preferred delivery time..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:border-blue-500 text-sm resize-none transition-colors"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar (Right Column) */}
          <div className="w-full lg:w-[450px] sticky top-8 mb-8 lg:mb-0">
            <div className="bg-white dark:bg-gray-800 rounded-2xl lg:rounded-3xl p-5 lg:p-8 shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic mb-6">
                Order Summary
              </h3>

              <div className="space-y-4 mb-6 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                {items.map((item) => {
                  const productUrl =
                    settings.permalink_structure === "product"
                      ? `/product/${item.slug}`
                      : `/${item.slug}`;
                  return (
                    <div key={item.id} className="flex gap-4 items-start">
                      <Link
                        href={productUrl}
                        className="w-16 h-16 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 overflow-hidden flex-shrink-0 relative cursor-pointer hover:opacity-80 transition-opacity"
                      >
                        {item.image ? (
                          <img
                            src={item.image || ""}
                            alt={item.name || "Product"}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                            <span className="text-gray-300 text-xs">
                              No img
                            </span>
                          </div>
                        )}
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link href={productUrl}>
                          <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate hover:text-blue-600 transition-colors">
                            {item.name}
                          </h4>
                        </Link>
                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">
                          Qty:{" "}
                          <span className="text-gray-900 dark:text-white">
                            {item.quantity}
                          </span>
                        </div>
                        <div className="text-sm font-bold text-blue-600 dark:text-blue-400 mt-1">
                          ৳ {(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-4 pt-6 border-t border-gray-100 dark:border-gray-700">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Coupon code"
                    value={couponCode}
                    onChange={(e) =>
                      setCouponCode(e.target.value.toUpperCase())
                    }
                    className="flex-1 px-4 py-3 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 font-medium"
                  />
                  <button
                    onClick={() => calculateTotals(selectedAddress, couponCode)}
                    disabled={calculatingTotals || !couponCode}
                    className="px-6 py-3 bg-gray-900 hover:bg-black dark:bg-gray-700 dark:hover:bg-gray-600 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-50"
                  >
                    Apply
                  </button>
                </div>

                <div className="flex justify-between text-sm font-medium text-gray-600 dark:text-gray-400 pt-2">
                  <span>Subtotal</span>
                  <span className="text-gray-900 dark:text-white font-bold">
                    {calculatingTotals ? (
                      <Loader2 className="animate-spin w-4 h-4 inline" />
                    ) : (
                      `৳ ${orderTotals.subtotal.toFixed(2)}`
                    )}
                  </span>
                </div>
                {orderTotals.discount > 0 && (
                  <div className="flex justify-between text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    <span>
                      Discount {appliedCoupon && `(${appliedCoupon})`}
                    </span>
                    <span>-৳ {orderTotals.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-medium text-gray-600 dark:text-gray-400">
                  <span>Delivery Fee</span>
                  <span className="text-gray-900 dark:text-white font-bold">
                    {calculatingTotals ? (
                      <Loader2 className="animate-spin w-4 h-4 inline" />
                    ) : orderTotals.deliveryFee > 0 ? (
                      `৳ ${orderTotals.deliveryFee.toFixed(2)}`
                    ) : (
                      "Calculated next step"
                    )}
                  </span>
                </div>
                <div className="pt-6 mt-2 border-t border-gray-100 dark:border-gray-700 flex justify-between items-end">
                  <div>
                    <span className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tighter italic block leading-none">
                      Total
                    </span>
                    <span className="text-xs text-gray-500 font-medium mt-1 block">
                      Including Taxes
                    </span>
                  </div>
                  <span className="text-3xl font-black text-blue-600 dark:text-blue-400 tracking-tighter">
                    {calculatingTotals ? (
                      <Loader2 className="animate-spin w-8 h-8 inline" />
                    ) : (
                      `৳ ${orderTotals.total.toFixed(2)}`
                    )}
                  </span>
                </div>
              </div>

              {/* Dynamic Payment Action Area */}
              {activeUser && (
                <div className="mt-8">
                  {paymentMethod === "PAYPAL" ? (
                    <div className="p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/50">
                      <PayPalScriptProvider
                        options={{
                          clientId:
                            settings.paypal_client_id ||
                            process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ||
                            "test",
                          currency: "USD",
                        }}
                      >
                        <PayPalIntegration
                          orderDataPayload={getOrderPayload()}
                          onSuccess={handlePayPalSuccess}
                          onError={(err) => showToast.error(err)}
                        />
                      </PayPalScriptProvider>
                    </div>
                  ) : (
                    <button
                      onClick={submitOrder}
                      disabled={loading || !selectedAddress}
                      className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-xl hover:shadow-blue-600/20 hover:-translate-y-1"
                    >
                      {loading ? (
                        <Loader2 className="animate-spin" size={24} />
                      ) : (
                        <>
                          <ShieldCheck size={22} />
                          <span>
                            {["STRIPE", "CARD", "NAGAD", "BKASH"].includes(
                              paymentMethod,
                            )
                              ? "Pay Securely"
                              : "Place Order Now"}
                          </span>
                        </>
                      )}
                    </button>
                  )}

                  {paymentMethod === "STRIPE" && (
                    <p className="text-xs text-center text-gray-500 mt-4 font-medium flex items-center justify-center gap-1">
                      <ShieldCheck size={14} className="text-green-500" />
                      Payments are secure and encrypted by Stripe
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
          <Loader2 className="animate-spin text-blue-600" size={40} />
          <p className="text-gray-500 font-medium">Loading checkout...</p>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
