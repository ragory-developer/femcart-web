"use client";

import * as fpixel from "@/lib/fpixel";
import { getActivePrice } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";
import { useSettingsStore } from "@/store/settingsStore";
import { motion } from "framer-motion";
import { Check, Minus, Plus, ShoppingCart, Zap } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

function resolveImage(img: string | null | undefined): string {
  if (!img) return "";
  return img || "";
}

export default function AddToCartButton({
  product,
  selectedVariant,
  buttonColor = "bg-emerald-600 hover:bg-emerald-700",
}: {
  product: any;
  selectedVariant?: any;
  buttonColor?: string;
}) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const addToCart = useCartStore((state) => state.addToCart);

  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const cartItems = useCartStore((state) => state.items);
  const settings = useSettingsStore((state) => state.settings);
  const isCheckoutEnabled = settings.enable_checkout_flow !== "false";

  const currentId = selectedVariant ? selectedVariant.id : product.id;
  const currentPrice = getActivePrice(selectedVariant || product);
  const currentName = selectedVariant
    ? `${product.name} - ${selectedVariant.attributes?.map((a: any) => a.value).join(" / ")}`
    : product.name;
  const currentImage = resolveImage(selectedVariant?.image || product.image);

  // Allow adding main product when no variant is selected
  const isSelectionRequired = false;
  
  // Check stock availability
  const isOutOfStock = (() => {
    if (selectedVariant) {
      return (selectedVariant.stock ?? 0) <= 0;
    }
    if (product?.productType === "VARIABLE" && Array.isArray(product.variants)) {
      const enabledVariants = product.variants.filter(
        (v: any) => v.enabled !== false,
      );
      const totalStock = enabledVariants.reduce(
        (sum: number, v: any) => sum + (v.stock || 0),
        0,
      );
      return totalStock <= 0;
    }
    return (product?.stock ?? 0) <= 0;
  })();

  const isDisabled = isSelectionRequired || isOutOfStock;
  const isBuyNowDisabled = isDisabled || !isCheckoutEnabled;

  const isInCart = cartItems.some((item) => item.id === currentId);

  const handleBuyNow = (e: React.MouseEvent) => {
    if (isBuyNowDisabled) {
      e.preventDefault();
      return;
    }
    
    if (!isInCart) {
      addToCart({
        id: currentId,
        productId: product.id,
        variantId: selectedVariant?.id,
        variantName: selectedVariant ? currentName : undefined,
        name: currentName,
        price: currentPrice,
        slug: product.slug,
        image: currentImage,
        quantity,
      });

      fpixel.event("AddToCart", {
        content_name: currentName,
        content_ids: [currentId],
        content_type: "product",
        value: currentPrice * quantity,
        currency: "BDT",
      });
    }
  };

  const handleToggleCart = () => {
    if (isDisabled) return;
    
    if (isInCart) {
      removeFromCart(currentId);
      setAdded(false);
    } else {
      addToCart({
        id: currentId,
        productId: product.id,
        variantId: selectedVariant?.id,
        variantName: selectedVariant ? currentName : undefined,
        name: currentName,
        price: currentPrice,
        slug: product.slug,
        image: currentImage,
        quantity,
      });

      fpixel.event("AddToCart", {
        content_name: currentName,
        content_ids: [currentId],
        content_type: "product",
        value: currentPrice * quantity,
        currency: "BDT",
      });

      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  const totalPrice = currentPrice * quantity;

  return (
    <div className="flex flex-col gap-[clamp(1rem,3vw,1.5rem)] w-full">
      <div className="flex flex-col gap-[clamp(0.75rem,2vw,1rem)] sm:flex-row sm:items-center w-full">
        <div className="flex items-center justify-between border-2 border-gray-200 dark:border-gray-700 rounded-xl w-full sm:w-[clamp(8rem,20vw,10rem)] min-h-[56px] bg-white dark:bg-gray-900 px-1 shrink-0">
          <button
            type="button"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={quantity <= 1 || isDisabled}
            className={`w-[clamp(44px,12vw,48px)] h-[clamp(44px,12vw,48px)] rounded-lg flex items-center justify-center transition-colors active:scale-95 ${
              quantity <= 1 || isDisabled
                ? "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-500"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200"
            }`}
          >
            <Minus size={18} />
          </button>
          <span className="font-bold text-[clamp(1rem,2vw,1.125rem)] select-none w-8 text-center text-gray-900 dark:text-white">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity(quantity + 1)}
            disabled={isDisabled}
            className={`w-[clamp(44px,12vw,48px)] h-[clamp(44px,12vw,48px)] rounded-lg flex items-center justify-center transition-colors active:scale-95 ${
              isDisabled
                ? "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-500"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200"
            }`}
          >
            <Plus size={18} />
          </button>
        </div>

        <div className="flex flex-row gap-2 sm:gap-3 w-full">
          <motion.button
            type="button"
            whileTap={{ scale: isDisabled ? 1 : 0.95 }}
            onClick={handleToggleCart}
            disabled={isDisabled}
            className={`flex-1 min-h-[48px] sm:min-h-[56px] rounded-xl font-bold flex flex-row items-center justify-center gap-1.5 sm:gap-[clamp(0.25rem,1vw,0.5rem)] transition-all duration-300 shadow-sm text-[11px] sm:text-[clamp(0.875rem,2vw,1rem)] px-1 ${
              isInCart || added
                ? "bg-rose-50 text-rose-600 border-2 border-rose-500 hover:bg-rose-100"
                : isOutOfStock
                  ? "bg-rose-50 text-rose-500 cursor-not-allowed border-2 border-rose-200 dark:bg-rose-950/20 dark:border-rose-900/30 font-bold"
                  : isSelectionRequired
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed border-2 border-dashed border-gray-200 dark:bg-gray-900 dark:border-gray-800"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 cursor-pointer"
            }`}
          >
            {isInCart || added ? (
              <>
                <Check size={16} className="sm:w-5 sm:h-5 shrink-0" />
                <span className="whitespace-nowrap">Remove from Cart</span>
              </>
            ) : isOutOfStock ? (
              <span className="leading-tight whitespace-nowrap text-rose-500">
                {selectedVariant ? "Variant Out of Stock" : "Out of Stock"}
              </span>
            ) : (
              <>
                <ShoppingCart
                  size={16}
                  className="fill-current sm:w-5 sm:h-5 shrink-0"
                />
                <span className="leading-tight whitespace-nowrap">
                  {isSelectionRequired ? "Select Variant" : "Add to Cart"}
                </span>
              </>
            )}
          </motion.button>

          <Link
            href={isBuyNowDisabled ? "#" : "/checkout"}
            onClick={handleBuyNow}
            className={`flex-1 min-h-[48px] sm:min-h-[56px] rounded-xl font-bold flex flex-row items-center justify-center gap-1.5 sm:gap-[clamp(0.25rem,1vw,0.5rem)] transition-all duration-300 shadow-xl text-[11px] sm:text-[clamp(0.875rem,2vw,1rem)] px-1 ${
              isBuyNowDisabled
                ? "bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed border shadow-none pointer-events-none"
                : `${buttonColor} text-white shadow-lg hover:-translate-y-0.5 active:scale-95 cursor-pointer`
            }`}
          >
            <Zap size={16} className="fill-current sm:w-5 sm:h-5 shrink-0" />
            <span className="leading-tight whitespace-nowrap">
              {isOutOfStock
                ? "Unavailable"
                : !isCheckoutEnabled
                  ? "Checkout Paused"
                  : "Buy Now"}
            </span>
          </Link>
        </div>
      </div>

      {/* Dynamic Total Price Section */}
      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-[clamp(1rem,3vw,1.25rem)] border border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-gray-600 dark:text-gray-400 font-medium text-[clamp(0.875rem,2vw,1rem)]">
            Total Price
          </span>
          <span className="text-[clamp(0.75rem,1.5vw,0.875rem)] text-gray-500">
            ৳ {currentPrice.toFixed(2)} x {quantity}
          </span>
        </div>
        <motion.div
          key={quantity}
          initial={{ scale: 0.9, opacity: 0.8 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-[clamp(1.25rem,4vw,1.5rem)] font-black text-emerald-600 dark:text-emerald-500"
        >
          ৳ {totalPrice.toFixed(2)}
        </motion.div>
      </div>
    </div>
  );
}
