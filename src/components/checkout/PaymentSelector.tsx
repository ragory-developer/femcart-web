"use client";
import { useEffect } from "react";

import { CreditCard, Smartphone, Wallet } from "lucide-react";

interface PaymentSelectorProps {
  selected: string;
  onSelect: (method: string) => void;
  settings?: Record<string, string>;
}

export default function PaymentSelector({
  selected,
  onSelect,
  settings = {},
}: PaymentSelectorProps) {
  const methods = [
    {
      id: "COD",
      name: "Cash on Delivery",
      desc: "Pay when you receive",
      icon: Wallet,
      color: "text-emerald-500",
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
      border: "border-emerald-500",
    },
    {
      id: "STRIPE",
      name: "Stripe (Card)",
      desc: "Pay securely via Stripe",
      icon: CreditCard,
      color: "text-indigo-600",
      bg: "bg-indigo-50 dark:bg-indigo-900/20",
      border: "border-indigo-500",
    },
    {
      id: "PAYPAL",
      name: "PayPal",
      desc: "Pay securely via PayPal",
      icon: Wallet,
      color: "text-blue-500",
      bg: "bg-blue-50 dark:bg-blue-900/20",
      border: "border-blue-500",
    },
    {
      id: "BKASH",
      name: "bKash",
      desc: "Pay via bKash gateway",
      icon: Smartphone,
      color: "text-pink-600",
      bg: "bg-pink-50 dark:bg-pink-900/20",
      border: "border-pink-500",
    },
    {
      id: "CARD",
      name: "SSL Commerz / Card",
      desc: "Pay securely via card",
      icon: CreditCard,
      color: "text-blue-600",
      bg: "bg-blue-50 dark:bg-blue-900/20",
      border: "border-blue-500",
    },
    {
      id: "NAGAD",
      name: "Nagad",
      desc: "Pay via Nagad",
      icon: Smartphone,
      color: "text-orange-600",
      bg: "bg-orange-50 dark:bg-orange-900/20",
      border: "border-orange-500",
    },
  ];

  const availableMethods = methods.filter(
    (m) => settings[`payment_enable_${m.id.toLowerCase()}`] !== "false",
  );

  // If currently selected method is not available, auto-select the first available one
  useEffect(() => {
    if (
      availableMethods.length > 0 &&
      (!selected || !availableMethods.find((m) => m.id === selected))
    ) {
      onSelect(availableMethods[0].id);
    }
  }, [availableMethods, selected, onSelect]);

  if (availableMethods.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl lg:rounded-xl p-5 lg:p-8 shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="mb-6 lg:mb-8">
        <h2 className="text-xl lg:text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic">
          Payment Method
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm lg:text-base">
          Choose how you'd like to pay for your order.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
        {availableMethods.map((m) => {
          const Icon = m.icon;
          const isSelected = selected === m.id;
          return (
            <div
              key={m.id}
              onClick={() => onSelect(m.id)}
              className={`p-4 lg:p-5 min-h-[80px] rounded-xl cursor-pointer transition-all border-2 flex items-center gap-4 ${
                isSelected
                  ? `${m.border} ${m.bg}`
                  : "border-gray-100 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              <div
                className={`w-10 h-10 lg:w-12 lg:h-12 shrink-0 rounded-xl flex items-center justify-center ${isSelected ? "bg-white dark:bg-gray-800 shadow-sm" : m.bg}`}
              >
                <Icon className={`${m.color} w-5 h-5 lg:w-6 lg:h-6`} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-sm lg:text-base">
                  {m.name}
                </h3>
                <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  {m.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
