"use client";

import React, { useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Plus, Eye, Minus } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useSettingsStore } from "@/store/settingsStore";
import { useShallow } from "zustand/react/shallow";
import { useRouter } from "next/navigation";
import {
  getActivePrice,
  getProductImage,
  PLACEHOLDER_IMAGE,
} from "@/lib/utils";
import { useWishlistStore } from "@/store/wishlistStore";

// Types
import { useQueryClient } from "@tanstack/react-query";
import { API_URL } from "@/lib/config";

export interface ProductCardProps {
  product: any;
  prefetch?: boolean;
}

// Helpers
function getPriceInfo(product: any): {
  displayPrice: string;
  originalPrice: string | null;
  discountPercent: number;
  isRange: boolean;
} {
  const now = new Date();

  const spStart = product.specialPriceStart
    ? new Date(product.specialPriceStart)
    : null;
  const spEnd = product.specialPriceEnd
    ? new Date(product.specialPriceEnd)
    : null;
  const spActive =
    product.specialPrice != null &&
    (spStart == null || spStart <= now) &&
    (spEnd == null || spEnd >= now);

  if (spActive) {
    const discount =
      product.price > 0
        ? Math.round(
            ((product.price - product.specialPrice) / product.price) * 100,
          )
        : 0;
    return {
      displayPrice: `Tk ${product.specialPrice.toFixed(2)}`,
      originalPrice: `Tk ${product.price.toFixed(2)}`,
      discountPercent: discount,
      isRange: false,
    };
  }
  if (
    typeof product.comparePrice === "number" &&
    product.comparePrice > product.price
  ) {
    const discount =
      product.comparePrice > 0
        ? Math.round(
            ((product.comparePrice - product.price) / product.comparePrice) *
              100,
          )
        : 0;
    return {
      displayPrice: `Tk ${product.price.toFixed(2)}`,
      originalPrice: `Tk ${product.comparePrice.toFixed(2)}`,
      discountPercent: discount,
      isRange: false,
    };
  }
  return {
    displayPrice: `Tk ${product.price.toFixed(2)}`,
    originalPrice: null,
    discountPercent: 0,
    isRange: false,
  };
}

function isNewProduct(product: any): boolean {
  if (!product.createdAt) return false;
  const created = new Date(product.createdAt);
  const diffDays = (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays <= 14;
}

// Component
const ProductCard: React.FC<ProductCardProps> = ({
  product,
  prefetch = true,
}) => {
  const router = useRouter();
  const settings = useSettingsStore(useShallow((state) => state.settings));
  const addToCart = useCartStore((state) => state.addToCart);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);

  const quantityInCart = useCartStore(
    (state) => state.items.find((i) => i.id === product.id)?.quantity || 0,
  );

  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
  const isWishlisted = useWishlistStore((state) =>
    state.isInWishlist(product.id),
  );
  const [added, setAdded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const queryClient = useQueryClient();

  const imageSrc = imgError ? PLACEHOLDER_IMAGE : getProductImage(product);
  const { displayPrice, originalPrice, discountPercent } =
    getPriceInfo(product);
  const showNewBadge = isNewProduct(product);
  const productUrl =
    settings.permalink_structure === "product"
      ? `/product/${product.slug}`
      : `/${product.slug}`;
  const isVariable =
    product.productType === "VARIABLE" ||
    product.productType === "variable" ||
    (product.variants && product.variants.length > 0);

  const handleAddToCart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (quantityInCart > 0) {
        removeFromCart(product.id);
        return;
      }

      addToCart({
        id: product.id,
        name: product.name,
        price: getActivePrice(product),
        slug: product.slug,
        image: imageSrc,
        quantity: 1,
      });
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    },
    [product, imageSrc, addToCart, removeFromCart, quantityInCart],
  );

  const handleWishlistToggle = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      toggleWishlist(product.id);
    },
    [product.id, toggleWishlist],
  );

  const ratingValue =
    product.averageRating != null ? Number(product.averageRating) : 5.0;

  return (
    <div
      className="group relative flex flex-col w-full h-full transition-all duration-300 hover:-translate-y-1 focus-within:ring-2 focus-within:ring-pink-500/50 bg-white"
    >
      {/* Absolute overlay link covering the entire card */}
      <Link
        href={productUrl}
        prefetch={prefetch}
        aria-label={product.name}
        className="absolute inset-0 z-[5] rounded-md focus-visible:outline-none"
      />
      {/* Badges */}
      {discountPercent > 0 && (
        <div className="absolute top-3 left-3 px-2 py-1 rounded-[8px] text-[12px] font-semibold z-10 shadow-sm bg-pink-500 text-white">
          {discountPercent}% OFF
        </div>
      )}
      {!discountPercent && showNewBadge && (
        <div className="absolute top-3 left-3 px-2 py-1 rounded-[8px] text-[12px] font-semibold z-10 shadow-sm bg-white text-pink-500">
          New
        </div>
      )}

      {/* Wishlist Button */}
      <button
        type="button"
        onClick={handleWishlistToggle}
        className="absolute top-3 right-3 z-[10] pointer-events-auto bg-white/90 backdrop-blur-sm border-none rounded-full w-8 h-8 flex items-center justify-center cursor-pointer shadow-sm transition-transform duration-300 hover:scale-110 active:scale-95"
        aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
      >
        <Heart
          size={16}
          className={`${isWishlisted ? "fill-pink-500 text-pink-500" : "text-pink-500"}`}
        />
      </button>

      <div className="aspect-[4/5] relative overflow-hidden mb-4 bg-[#F8F8F8] rounded-md">
        <Image
          src={imageSrc}
          alt={product.name || "Product"}
          fill
          onError={() => setImgError(true)}
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
          className="object-cover transition-opacity duration-300"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm p-2 md:p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-150 flex justify-center z-[10]">
          <button
            type="button"
            onClick={
              isVariable
                ? (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    router.push(productUrl);
                  }
                : handleAddToCart
            }
            className="inline-flex items-center justify-center rounded-full font-sans font-semibold tracking-[0.3px] transition-all duration-150 cursor-pointer bg-white text-pink-500 border-[1.5px] border-pink-500 w-full max-w-[200px] h-9 md:h-10 text-[12px] md:text-[14px] px-2 md:px-4 pointer-events-auto"
          >
            {isVariable ? (
              "Select Options"
            ) : quantityInCart > 0 ? (
              <>
                <Minus size={14} className="mr-2" /> Remove
              </>
            ) : added ? (
              <>
                <Plus size={14} className="mr-2" /> Added
              </>
            ) : (
              "Quick Add"
            )}
          </button>
        </div>
      </div>

      <div className="px-1 pb-2 flex flex-col flex-grow items-center text-center">
        <div className="text-gray-500 text-[10px] md:text-[11px] uppercase tracking-wider font-semibold mb-1">
          {product.brand?.name || "Brand"}
        </div>
        <div className="font-medium text-[13px] md:text-[14px] text-gray-900 mb-2 line-clamp-2 leading-snug">
          {product.name}
        </div>
        <div className="flex items-center gap-2 mb-1 md:mb-2 justify-center">
          <span className="text-gray-900 font-semibold tabular-nums text-[13px] md:text-[14px]">
            {displayPrice}
          </span>
          {originalPrice && (
            <span className="text-gray-400 line-through text-[12px] md:text-[13px]">
              {originalPrice}
            </span>
          )}
        </div>
        <div className="text-amber-700 text-[11px] md:text-[13px] flex items-center gap-1">
          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <span
                key={i}
                className={
                  i < Math.floor(ratingValue)
                    ? "text-amber-500"
                    : "text-gray-300"
                }
              >
                ★
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ProductCard);
