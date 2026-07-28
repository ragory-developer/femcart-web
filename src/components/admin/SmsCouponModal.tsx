import { API_URL } from "@/lib/config";
import { AlertTriangle, MessageSquare, Send, Ticket, X } from "lucide-react";
import { useEffect, useState } from "react";

interface SmsCouponModalProps {
  isOpen: boolean;
  onClose: () => void;
  smsType: "SMS" | "COUPON";
  selectedCount: number;
  smsMessage: string;
  setSmsMessage: (msg: string) => void;
  onSend: () => void;
  insertPlaceholder: (placeholder: string) => void;
  previewMessage: string;
  context?: "CART" | "GENERAL";
}

const CART_SMS_TEMPLATES = [
  {
    name: "Reminder",
    content:
      "Hi [Name], you left [CartItems] in your cart. Checkout now: [CartLink]",
  },
  {
    name: "Urgency",
    content:
      "Hey [Name], still thinking about it? Secure your items before they sell out! [CartLink]",
  },
  {
    name: "Selling Fast",
    content:
      "[Name], your items are selling fast! Secure them here: [CartLink]",
  },
];

const CART_COUPON_TEMPLATES = [
  {
    name: "10% Off",
    content:
      "Hi [Name], finish buying [CartItems] today with 10% off! Use code SAVE10: [CartLink]",
  },
  {
    name: "Free Shipping",
    content:
      "Hey [Name], use code FREESHIP for free shipping on your abandoned items! [CartLink]",
  },
  {
    name: "15% Flash",
    content:
      "Special offer for [Name]: Get 15% off your cart if you checkout in the next hour! [CartLink]",
  },
];

const GENERAL_SMS_TEMPLATES = [
  {
    name: "Welcome Back",
    content:
      "Hi [Name], it's been a while! Come back and check out our new arrivals: [StoreLink]",
  },
  {
    name: "New Collection",
    content:
      "Hey [Name], our newest collection just dropped! Shop now before it's gone: [StoreLink]",
  },
  {
    name: "Store Update",
    content:
      "[Name], big news! We've expanded our delivery zones. Order your groceries today: [StoreLink]",
  },
  {
    name: "Win-back Offer",
    content:
      "We miss you [Name]! Come back and shop today. Check out our trending items here: [StoreLink]",
  },
];

const GENERAL_COUPON_TEMPLATES = [
  {
    name: "Holiday Sale",
    content:
      "Happy Holidays [Name]! Enjoy 20% off your entire order with code HOLIDAY20: [StoreLink]",
  },
  {
    name: "VIP Flash",
    content:
      "Hey [Name], our VIP 24-hour flash sale is live! Use code VIPFLASH: [StoreLink]",
  },
  {
    name: "Special Event",
    content:
      "Special Event for [Name]: Celebrate with us and get a free gift on orders over $50! [StoreLink]",
  },
  {
    name: "Weekend Special",
    content:
      "Weekend deals are here [Name]! Grab your essentials with our special weekend discount code WEEKEND10. [StoreLink]",
  },
  {
    name: "Appreciation Gift",
    content:
      "Thank you for being a valued customer [Name]. Here is a special coupon just for you: [PromoCode]. Shop now: [StoreLink]",
  },
];

export function SmsCouponModal({
  isOpen,
  onClose,
  smsType,
  selectedCount,
  smsMessage,
  setSmsMessage,
  onSend,
  insertPlaceholder,
  previewMessage,
  context = "CART",
}: SmsCouponModalProps) {
  const currentTemplates =
    context === "CART"
      ? smsType === "COUPON"
        ? CART_COUPON_TEMPLATES
        : CART_SMS_TEMPLATES
      : smsType === "COUPON"
        ? GENERAL_COUPON_TEMPLATES
        : GENERAL_SMS_TEMPLATES;

  const defaultPlaceholderText =
    context === "CART"
      ? smsType === "COUPON"
        ? "Hi [Name], we noticed you left [CartItems] in your cart! Use code SAVE10 for 10% off. [CartLink]"
        : "Hi [Name], you left [CartItems] in your Femcart. Come back and checkout: [CartLink]"
      : smsType === "COUPON"
        ? "Hi [Name], big sale today! Use code PROMO20 for 20% off your next order: [StoreLink]"
        : "Hi [Name], check out our new arrivals: [StoreLink]";

  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [coupons, setCoupons] = useState<any[]>([]);
  const costPerSms = 0.4; // Default, can be dynamic
  const totalCost = selectedCount * costPerSms;

  useEffect(() => {
    if (isOpen) {
      const fetchBalance = async () => {
        try {
          const token =
            localStorage.getItem("femcart_access_token") ||
            localStorage.getItem("token");
          const res = await fetch(`${API_URL}/api/wallet/balance`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const json = await res.json();
          if (json.success)
            setWalletBalance(json.data !== null ? json.data : 0);
        } catch (e) {}
      };
      const fetchCoupons = async () => {
        try {
          const token =
            localStorage.getItem("femcart_access_token") ||
            localStorage.getItem("token");
          const res = await fetch(`${API_URL}/api/coupons`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const json = await res.json();
          if (json.success) setCoupons(json.data.filter((c: any) => c.active));
        } catch (e) {}
      };

      fetchBalance();
      if (smsType === "COUPON") {
        fetchCoupons();
      }
    }
  }, [isOpen, smsType]);

  const isInsufficient = walletBalance !== null && walletBalance < totalCost;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-950/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-800 animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-gray-900">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${smsType === "COUPON" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400" : "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"}`}
            >
              {smsType === "COUPON" ? (
                <Ticket size={20} />
              ) : (
                <MessageSquare size={20} />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                {smsType === "COUPON"
                  ? "Promo Coupon Campaign"
                  : "SMS Blast Campaign"}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Targeting {selectedCount} selected customer(s)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors shadow-sm"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Editor */}
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Template Gallery
              </label>
              <div className="flex flex-wrap gap-2">
                {currentTemplates.map((tmpl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSmsMessage(tmpl.content)}
                    className="px-3 py-1.5 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 transition-colors"
                  >
                    {tmpl.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Message Composer
              </label>
              <textarea
                rows={5}
                value={smsMessage}
                onChange={(e) => setSmsMessage(e.target.value)}
                placeholder={defaultPlaceholderText}
                className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none resize-none text-sm"
              />

              {smsType === "COUPON" && coupons.length > 0 && (
                <div className="mt-3">
                  <select
                    onChange={(e) => {
                      if (e.target.value) insertPlaceholder(e.target.value);
                      e.target.value = ""; // Reset to default
                    }}
                    className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 focus:ring-1 focus:ring-blue-500 outline-none"
                  >
                    <option value="">-- Choose Coupon to Insert --</option>
                    {coupons.map((c) => (
                      <option key={c.id} value={c.code}>
                        {c.code} — {c.discount}
                        {c.type === "PERCENT" ? "%" : "?"} Off
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2 mt-3">
                <span className="text-xs text-gray-500 mr-1">Variables:</span>
                <button
                  onClick={() => insertPlaceholder("[Name]")}
                  className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300 px-2 py-1 rounded transition-colors"
                >
                  [Name]
                </button>
                {context === "CART" ? (
                  <>
                    <button
                      onClick={() => insertPlaceholder("[CartItems]")}
                      className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300 px-2 py-1 rounded transition-colors"
                    >
                      [CartItems]
                    </button>
                    <button
                      onClick={() => insertPlaceholder("[CartLink]")}
                      className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300 px-2 py-1 rounded transition-colors"
                    >
                      [CartLink]
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => insertPlaceholder("[StoreLink]")}
                      className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300 px-2 py-1 rounded transition-colors"
                    >
                      [StoreLink]
                    </button>
                    {smsType === "COUPON" && (
                      <button
                        onClick={() => insertPlaceholder("[PromoCode]")}
                        className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300 px-2 py-1 rounded transition-colors"
                      >
                        [PromoCode]
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Preview & Status */}
          <div className="space-y-5 flex flex-col">
            <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-6 flex flex-col relative overflow-hidden">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 text-center">
                Preview
              </p>

              {selectedCount > 0 ? (
                <div className="bg-[#E9E9EB] dark:bg-[#262628] text-black dark:text-white p-3.5 rounded-lg rounded-tr-md max-w-[90%] self-end">
                  <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
                    {previewMessage}
                  </p>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-sm text-gray-500">
                    Select customers to preview.
                  </p>
                </div>
              )}
            </div>

            {/* Wallet Status Area */}
            {isInsufficient ? (
              <div className="bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800 p-4 rounded-lg flex gap-3 items-start">
                <AlertTriangle
                  className="text-pink-600 dark:text-pink-400 shrink-0 mt-0.5"
                  size={16}
                />
                <div>
                  <p className="text-sm font-semibold text-pink-800 dark:text-pink-300 mb-1">
                    Insufficient Funds
                  </p>
                  <p className="text-xs text-pink-700 dark:text-pink-400">
                    Cost: Tk {totalCost.toFixed(2)} / Balance: ?
                    {walletBalance?.toFixed(2)}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Campaign Cost</p>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">
                    Tk {totalCost.toFixed(2)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 mb-0.5">Wallet Balance</p>
                  <p className="text-base font-semibold text-emerald-600 dark:text-emerald-400">
                    Tk {walletBalance?.toFixed(2)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/30 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSend}
            disabled={isInsufficient || selectedCount === 0}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md transition-colors flex items-center gap-2 ${isInsufficient ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
          >
            <Send size={14} /> Send Now
          </button>
        </div>
      </div>
    </div>
  );
}
