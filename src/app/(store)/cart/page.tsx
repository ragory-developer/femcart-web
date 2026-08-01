"use client";

import { useCartStore } from "@/store/cartStore";
import { useSettingsStore } from "@/store/settingsStore";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CreditCard,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import Link from "next/link";

import { useShallow } from "zustand/react/shallow";

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, getCartTotal } = useCartStore(
    useShallow((state) => ({
      items: state.items,
      removeFromCart: state.removeFromCart,
      updateQuantity: state.updateQuantity,
      getCartTotal: state.getCartTotal,
    })),
  );
  const { settings } = useSettingsStore();

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 text-center min-h-[70vh] flex flex-col justify-center items-center">
        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-full text-emerald-500 mb-6">
          <ShoppingBag size={64} strokeWidth={1} />
        </div>
        <h1 className="text-4xl font-extrabold mb-4">Your Cart is Empty</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
          Looks like you haven't added anything to your cart yet. Discover fresh
          organic groceries and start shopping.
        </p>
        <Link
          href="/products"
          className="bg-primary hover:bg-primary-hover text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl shadow-primary/20 transition-all hover:-translate-y-1"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  const subtotal = getCartTotal();
  const shipping = subtotal > 50 ? 0 : 5.99;
  const total = subtotal + shipping;

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-[100dvh] py-12">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link
              href="/products"
              className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-primary transition-colors mb-2"
            >
              <ArrowLeft size={16} className="mr-1" /> Continue Shopping
            </Link>
            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
              Shopping Cart
            </h1>
          </div>
          <div className="text-gray-800 dark:text-gray-200 font-semibold bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
            {items.length} {items.length === 1 ? "Item" : "Items"}
          </div>
        </div>

        <div className="flex flex-col xl:flex-row gap-8">
          {/* Cart Items List */}
          <div className="flex-1 space-y-4">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-6 shadow-sm"
                >
                  <Link
                    href={
                      settings.permalink_structure === "product"
                        ? `/product/${item.slug}`
                        : `/${item.slug}`
                    }
                    className="block w-24 h-24 shrink-0 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden relative"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </Link>

                  <div className="flex-1 w-full flex flex-col sm:flex-row justify-between items-center sm:items-start gap-4">
                    <div className="text-center sm:text-left">
                      <Link
                        href={
                          settings.permalink_structure === "product"
                            ? `/product/${item.slug}`
                            : `/${item.slug}`
                        }
                        className="font-semibold text-lg text-gray-800 dark:text-gray-200 hover:text-emerald-600 transition-colors block mb-1"
                      >
                        {item.name}
                      </Link>
                      <div className="text-emerald-600 dark:text-emerald-500 font-bold text-lg mb-4 sm:mb-0">
                        ৳ {item.price.toFixed(2)}
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.id,
                              Math.max(1, (item.quantity || 1) - 1),
                            )
                          }
                          disabled={(item.quantity || 1) <= 1}
                          className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors ${
                            (item.quantity || 1) <= 1
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-500"
                              : "bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200"
                          }`}
                        >
                          <Minus size={16} />
                        </button>

                        <span className="font-semibold text-lg text-gray-800 dark:text-gray-100 min-w-[2rem] text-center">
                          {item.quantity || 1}
                        </span>

                        <button
                          onClick={() =>
                            updateQuantity(item.id, (item.quantity || 1) + 1)
                          }
                          className="w-8 h-8 bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 rounded-md flex items-center justify-center transition-colors"
                        >
                          <Plus size={16} />
                        </button>
                      </div>

                      <div className="font-bold text-lg w-24 text-right hidden lg:block">
                        ৳ {(item.price * (item.quantity || 1)).toFixed(2)}
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="w-10 h-10 bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/30 dark:hover:bg-rose-900/50 text-rose-500 rounded-full flex items-center justify-center transition-colors shrink-0"
                        title="Remove Item"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Order Summary */}
          <div className="w-full xl:w-[400px]">
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm xl:sticky xl:top-24">
              <h2 className="text-2xl font-bold mb-6">Order Summary</h2>

              <div className="space-y-4 text-gray-800 dark:text-gray-200 mb-6 pb-6 border-b border-gray-100 dark:border-gray-800">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-700 dark:text-gray-300">
                    Subtotal
                  </span>
                  <span className="text-gray-800 dark:text-gray-200 font-semibold">
                    ৳ {subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-700 dark:text-gray-300">
                    Shipping Estimate
                  </span>
                  <span
                    className={
                      shipping === 0
                        ? "text-emerald-600 font-semibold"
                        : "text-gray-800 dark:text-gray-200 font-semibold"
                    }
                  >
                    {shipping === 0 ? "Free" : `৳ ${shipping.toFixed(2)}`}
                  </span>
                </div>
                {shipping > 0 && (
                  <div className="text-xs text-center text-emerald-600 bg-emerald-50 p-2 rounded-lg mt-2">
                    Add ৳ {(50 - subtotal).toFixed(2)} more to your cart to get{" "}
                    <strong>Free Shipping!</strong>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center mb-8">
                <span className="font-bold text-lg text-gray-800 dark:text-gray-200">
                  Total
                </span>
                <span className="font-extrabold text-3xl text-emerald-600 dark:text-emerald-500">
                  ৳ {total.toFixed(2)}
                </span>
              </div>

              <Link
                href="/checkout"
                className="w-full bg-primary hover:bg-primary-hover text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-xl shadow-primary/20 hover:-translate-y-0.5 mt-auto"
              >
                Proceed to Checkout <ArrowRight size={20} />
              </Link>

              <div className="mt-6 flex flex-col items-center gap-4 text-gray-400">
                <div className="flex items-center gap-2 justify-center w-full">
                  <CreditCard size={20} />
                  <span className="text-xs font-semibold tracking-wider uppercase">
                    Secure Checkout
                  </span>
                </div>
                <div className="flex gap-2">
                  <div className="w-10 h-6 bg-gray-200 dark:bg-gray-800 rounded"></div>
                  <div className="w-10 h-6 bg-gray-200 dark:bg-gray-800 rounded"></div>
                  <div className="w-10 h-6 bg-gray-200 dark:bg-gray-800 rounded"></div>
                  <div className="w-10 h-6 bg-gray-200 dark:bg-gray-800 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
