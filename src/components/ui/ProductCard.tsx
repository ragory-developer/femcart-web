"use client";

import {
  getActivePrice,
  getProductImage,
  PLACEHOLDER_IMAGE,
} from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";
import { useSettingsStore } from "@/store/settingsStore";
import { Eye, Heart, ShoppingCart, Star } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { useWishlistStore } from "@/store/wishlistStore";

import { useQueryClient } from "@tanstack/react-query";
import { API_URL } from "@/lib/config";

function getPriceInfo(product: any): {
  displayPrice: string;
  originalPrice: string | null;
  discountPercent: number;
  isRange: boolean;
} {
  const now = new Date();

  // Variable product: show price range from variants
  if (product.productType === "VARIABLE" && product.variants?.length > 0) {
    const enabledVariants = product.variants.filter(
      (v: any) => v.enabled !== false,
    );
    if (enabledVariants.length > 0) {
      const effectivePrices = enabledVariants.map((v: any) => {
        const spStart = v.specialPriceStart
          ? new Date(v.specialPriceStart)
          : null;
        const spEnd = v.specialPriceEnd ? new Date(v.specialPriceEnd) : null;
        const spActive =
          v.specialPrice != null &&
          (spStart == null || spStart <= now) &&
          (spEnd == null || spEnd >= now);
        return spActive ? v.specialPrice : v.price;
      });
      const min = Math.min(...effectivePrices);
      const max = Math.max(...effectivePrices);
      if (min === max) {
        return {
          displayPrice: `Tk ${min.toFixed(2)}`,
          originalPrice: null,
          discountPercent: 0,
          isRange: false,
        };
      }
      return {
        displayPrice: `Tk ${min.toFixed(2)} – Tk ${max.toFixed(2)}`,
        originalPrice: null,
        discountPercent: 0,
        isRange: true,
      };
    }
  }

  // Simple product with special price
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

function ProductCard({
  product,
  prefetch = true,
  variant: propVariant,
  radius: propRadius,
  showBadge: propShowBadge,
  showRating: propShowRating,
  showAddToCart: propShowAddToCart,
  badgeStyle: propBadgeStyle,
}: {
  product: any;
  prefetch?: boolean;
  variant?:
    | "classic"
    | "sleek"
    | "minimal"
    | "festive"
    | "bordered"
    | "neumorphic"
    | "horizontal"
    | "elegant";
  radius?: "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "full";
  showBadge?: boolean;
  showRating?: boolean;
  showAddToCart?: boolean;
  badgeStyle?: "pill" | "corner" | "ribbon";
}) {
  const addToCart = useCartStore((state) => state.addToCart);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const quantityInCart = useCartStore(
    (state) => state.items.find((i) => i.id === product.id)?.quantity || 0,
  );
  const router = useRouter();
  const [added, setAdded] = useState(false);
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
  const isWishlisted = useWishlistStore((state) =>
    state.isInWishlist(product.id),
  );
  const [imgError, setImgError] = useState(false);
  const [mounted, setMounted] = useState(false);
  const settings = useSettingsStore(useShallow((state) => state.settings));
  const queryClient = useQueryClient();

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  // Resolve active props with global settings as fallback (guarantees matching HTML on initial client render)
  const variant = mounted
    ? (propVariant ?? (settings.productCardVariant as any) ?? "classic")
    : (propVariant ?? "classic");
  const radius = mounted
    ? (propRadius ?? (settings.productCardRadius as any) ?? "sm")
    : (propRadius ?? "sm");
  const showBadge = mounted
    ? (propShowBadge ?? settings.productCardShowBadge ?? true)
    : (propShowBadge ?? true);
  const showRating = mounted
    ? (propShowRating ?? settings.productCardShowRating ?? true)
    : (propShowRating ?? true);
  const showAddToCart = mounted
    ? (propShowAddToCart ?? settings.productCardShowAddToCart ?? true)
    : (propShowAddToCart ?? true);
  const badgeStyle = mounted
    ? (propBadgeStyle ?? (settings.productCardBadgeStyle as any) ?? "pill")
    : (propBadgeStyle ?? "pill");

  const imageSrc = imgError ? PLACEHOLDER_IMAGE : getProductImage(product);
  const { displayPrice, originalPrice, discountPercent } =
    getPriceInfo(product);
  const showNewBadge = mounted ? isNewProduct(product) : false;
  const productUrl =
    settings.permalink_structure === "product"
      ? `/product/${product.slug}`
      : `/${product.slug}`;

  const isVariable =
    product.productType === "VARIABLE" ||
    product.productType === "variable" ||
    (product.variants && product.variants.length > 0);

  const handleAddToCart = (e: React.MouseEvent) => {
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
  };

  // Radius Class Mappings
  const radiusClasses: Record<string, string> = {
    none: "rounded-none",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    "2xl": "rounded-lg",
    "3xl": "rounded-xl",
    full: "rounded-xl",
  };
  const cardRadiusClass = radiusClasses[radius as string] || "rounded-sm";

  const imageRadiusClasses: Record<string, string> = {
    none: "rounded-none",
    sm: "rounded-t-sm",
    md: "rounded-t-md",
    lg: "rounded-t-lg",
    xl: "rounded-t-xl",
    "2xl": "rounded-t-2xl",
    "3xl": "rounded-t-3xl",
    full: "rounded-t-[2rem]",
  };
  const imageRadiusClass =
    imageRadiusClasses[radius as string] || "rounded-t-sm";

  // Badges Renderer
  const renderBadges = () => {
    if (!showBadge) return null;
    if (badgeStyle === "ribbon") {
      const hasDiscount = discountPercent > 0;
      if (!hasDiscount && !showNewBadge) return null;
      return (
        <div className="absolute top-0 left-0 z-10 w-16 h-16 overflow-hidden pointer-events-none">
          <div
            className={`absolute top-[12px] left-[-22px] w-[80px] text-center text-white text-[8px] font-black uppercase py-0.5 leading-none shadow-sm -rotate-45 ${hasDiscount ? "bg-rose-500" : "bg-emerald-500"}`}
          >
            {hasDiscount ? `-${discountPercent}%` : "NEW"}
          </div>
        </div>
      );
    }
    if (badgeStyle === "corner") {
      return (
        <div className="absolute top-0 left-0 z-10 flex flex-col gap-0">
          {showNewBadge && (
            <span className="bg-emerald-500 text-white text-[9px] font-black px-2 py-1 uppercase leading-none rounded-br-md shadow-sm">
              NEW
            </span>
          )}
          {discountPercent > 0 && (
            <span className="bg-rose-500 text-white text-[9px] font-black px-2 py-1 uppercase leading-none rounded-br-md shadow-sm">
              -{discountPercent}%
            </span>
          )}
        </div>
      );
    }
    // Default: pill
    return (
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
        {showNewBadge && (
          <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full leading-tight shadow">
            NEW
          </span>
        )}
        {discountPercent > 0 && (
          <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full leading-tight shadow">
            -{discountPercent}%
          </span>
        )}
      </div>
    );
  };

  // Rating Stars Renderer
  const renderRatingStars = () => {
    if (!showRating) return null;
    const ratingValue =
      product.averageRating != null ? Number(product.averageRating) : 0.0;
    return (
      <div
        className="flex items-center gap-0.5 mt-0.5"
        title={`${ratingValue} out of 5 stars`}
      >
        {Array.from({ length: 5 }).map((_, i) => {
          const isFilled = i < Math.round(ratingValue);
          return (
            <Star
              key={i}
              size={12}
              className={
                isFilled
                  ? "fill-amber-400 text-amber-400"
                  : "text-gray-300 dark:text-gray-600"
              }
            />
          );
        })}
        <span className="text-[10px] text-gray-500 dark:text-gray-400 ml-1 font-semibold">
          {ratingValue.toFixed(1)}
        </span>
      </div>
    );
  };

  return (
    <div
      className="group relative h-full flex flex-col"
    >
      {/* Absolute overlay link covering the entire card */}
      <Link
        href={productUrl}
        prefetch={prefetch}
        aria-label={product.name}
        className="absolute inset-0 z-[1] rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
      />

      <div
        className={`transition-[transform,border-color,box-shadow] duration-500 will-change-transform overflow-hidden flex ${variant === "horizontal" ? "flex-row items-center h-auto min-h-[140px]" : "flex-col h-full"} relative ${cardRadiusClass} ${variant === "elegant" ? "bg-gradient-to-b from-emerald-50/50 to-white dark:from-emerald-950/20 dark:to-gray-900 border border-emerald-100 dark:border-emerald-900/30 shadow-sm" : "bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm"} hover:border-emerald-500/30 hover:shadow-[0_8px_30px_rgba(16,185,129,0.12)] hover:-translate-y-1`}
      >
        {/* Shimmer/glass hover effect */}
        {variant !== "minimal" && (
          <div
            className={`absolute inset-0 bg-gradient-to-tr opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none ${
              variant === "festive"
                ? "from-amber-500/0 via-amber-500/0 to-amber-500/10"
                : "from-emerald-500/0 via-emerald-500/0 to-emerald-500/5"
            }`}
          />
        )}

        {/* Image area */}
        <div
          className={`relative block overflow-hidden ${variant === "horizontal" ? "w-[120px] shrink-0" : ""} ${
            variant === "classic"
              ? `bg-[#f8f9fa] dark:bg-gray-800/60 ${imageRadiusClass}`
              : variant === "festive"
                ? `bg-amber-50/20 dark:bg-amber-950/5 ${imageRadiusClass}`
                : variant === "elegant"
                  ? `bg-transparent ${imageRadiusClass}`
                  : "bg-transparent"
          }`}
        >
          {/* Render Badges */}
          {renderBadges()}

          {/* Out of Stock Overlay */}
          {((product.productType === "VARIABLE" &&
            (!product.variants ||
              product.variants
                .filter((v: any) => v.enabled !== false)
                .every((v: any) => v.stock === 0))) ||
            (product.productType !== "VARIABLE" &&
              (product.stock === 0 || product.inStock === false))) && (
            <div className="absolute inset-0 z-20 bg-white/60 dark:bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
              <span className="bg-rose-500 text-white font-black text-xs px-3 py-1.5 rounded-full shadow-lg uppercase tracking-wider">
                Out of Stock
              </span>
            </div>
          )}

          {/* Product image wrapper */}
          <div
            className={`aspect-[3/4] sm:aspect-square relative overflow-hidden ${variant === "horizontal" ? "w-[120px]" : "w-full"} ${variant === "minimal" ? "bg-gray-50 dark:bg-gray-800 rounded-sm" : "bg-white dark:bg-transparent"}`}
          >
            <Image
              src={imageSrc}
              alt={product.name || "Product"}
              fill
              quality={75}
              onError={() => setImgError(true)}
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              className={`object-cover group-hover:scale-105 transition-transform duration-500 will-change-transform mix-blend-multiply dark:mix-blend-normal`}
            />

            {/* Wishlist Button */}
            <button
              type="button"
              onClick={handleWishlistToggle}
              aria-label={
                isWishlisted ? "Remove from wishlist" : "Add to wishlist"
              }
              className={`absolute top-1.5 right-1.5 sm:top-2 sm:right-2 z-[10] relative pointer-events-auto min-w-[32px] min-h-[32px] sm:min-w-[44px] sm:min-h-[44px] rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-md shadow-sm flex items-center justify-center text-gray-400 hover:text-rose-500 hover:bg-white transition-all focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none ${isWishlisted ? "text-rose-500" : ""}`}
            >
              <Heart
                size={14}
                className={`sm:w-4 sm:h-4 ${isWishlisted ? "fill-rose-500" : ""}`}
              />
            </button>
          </div>
        </div>

        {/* Add to Cart floating icon (Classic/Festive/Elegant variant) */}
        {showAddToCart &&
          (variant === "classic" ||
            variant === "festive" ||
            variant === "elegant") && (
            <button
              type="button"
              aria-label={isVariable ? "Select Options" : "Add to Cart"}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (isVariable) {
                  // Let navigation bubble up and happen
                  router.push(productUrl);
                } else {
                  handleAddToCart(e);
                }
              }}
              title={isVariable ? "Select Options" : "Add to Cart"}
              className={`absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2 z-[10] relative pointer-events-auto min-w-[36px] min-h-[36px] sm:min-w-[44px] sm:min-h-[44px] rounded-full flex items-center justify-center shadow-md transition-all duration-200 active:scale-90 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none
              ${
                added || quantityInCart > 0
                  ? "bg-emerald-500 text-white opacity-100"
                  : isVariable
                    ? "bg-white dark:bg-gray-700 text-amber-600 dark:text-amber-400 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 hover:bg-amber-500 hover:text-white"
                    : variant === "festive"
                      ? "bg-white dark:bg-gray-700 text-amber-500 dark:text-amber-400 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 hover:bg-amber-500 hover:text-white"
                      : variant === "elegant"
                        ? "bg-emerald-600 text-white opacity-100 lg:opacity-0 lg:group-hover:opacity-100 hover:bg-emerald-700 hover:scale-110 shadow-emerald-500/20"
                        : "bg-white/95 backdrop-blur-sm dark:bg-gray-800 text-gray-700 dark:text-gray-200 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 shadow-sm hover:bg-olive hover:text-white hover:scale-110"
              }`}
            >
              {isVariable ? (
                <Eye size={16} />
              ) : variant === "elegant" ? (
                <span className="text-xl leading-none -mt-0.5">
                  {quantityInCart > 0 ? "-" : "+"}
                </span>
              ) : (
                <ShoppingCart size={16} />
              )}
            </button>
          )}

        {/* Body content */}
        <div
          className={`flex flex-col flex-1 gap-0.5 sm:gap-1.5 ${variant === "minimal" ? "pt-1.5 sm:pt-3 px-1.5 sm:px-2 pb-1.5 sm:pb-2" : variant === "horizontal" ? "p-1.5 sm:p-3 pl-1" : "p-1.5 sm:p-3"}`}
        >
          {/* Category */}
          {(product.categories?.[0]?.name || product.category?.name) && (
            <span
              className={`text-[8px] sm:text-[clamp(10px,1.5vw,11px)] font-bold uppercase tracking-[0.05em] truncate ${
                variant === "festive"
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-emerald-600/80"
              }`}
            >
              {product.categories?.[0]?.name ?? product.category?.name}
            </span>
          )}

          {/* Name */}
          <div className="w-full relative z-[2]">
            <h3 className="text-[11px] sm:text-[clamp(12px,1.5vw,15px)] font-bold font-display text-gray-800 dark:text-gray-100 line-clamp-2 leading-[1.2] sm:leading-snug hover:text-olive dark:hover:text-lime transition-colors min-h-[28px] sm:min-h-[2.2rem] tracking-tight">
              {product.name}
            </h3>
          </div>

          {/* Rating */}
          {renderRatingStars()}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Subtle Divider */}
          <div className="w-full h-px bg-gray-100 dark:bg-gray-800 my-1" />

          {/* Price */}
          <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap mt-0.5 sm:mt-1">
            <span
              className={`font-extrabold ${
                variant === "festive"
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-forest dark:text-lime"
              } text-[12px] sm:text-[clamp(13px,2vw,16px)]`}
            >
              {displayPrice}
            </span>
            {originalPrice && (
              <span className="text-[clamp(11px,1.5vw,13px)] text-rose-400 line-through">
                {originalPrice}
              </span>
            )}
          </div>

          {/* Sleek Variant Add to Cart Button */}
          {variant === "sleek" && showAddToCart && (
            <button
              type="button"
              aria-label={isVariable ? "Select Options" : "Add to Cart"}
              onClick={(e) => {
                if (isVariable) {
                  // Let navigation happen
                } else {
                  handleAddToCart(e);
                }
              }}
              className={`w-full relative z-[10] pointer-events-auto py-[clamp(0.4rem,1.5vw,0.6rem)] px-3 rounded-md flex items-center justify-center gap-[clamp(0.25rem,1vw,0.5rem)] text-[clamp(11px,1.5vw,13px)] font-bold min-h-[32px] sm:min-h-[44px] whitespace-nowrap transition-all mt-1 sm:mt-2 active:scale-95 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none
                ${
                  added || quantityInCart > 0
                    ? "bg-emerald-500 text-white"
                    : isVariable
                      ? "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 hover:bg-amber-500 hover:text-white"
                      : "bg-lime/10 text-forest hover:bg-olive hover:text-white rounded-full"
                }`}
            >
              {isVariable ? (
                <>
                  <Eye size={13} /> Select Options
                </>
              ) : (
                <>
                  <ShoppingCart size={13} />{" "}
                  {quantityInCart > 0
                    ? "Remove"
                    : added
                      ? "Added!"
                      : "Add to Cart"}
                </>
              )}
            </button>
          )}

          {/* Minimal Variant Add to Cart Button */}
          {variant === "minimal" && showAddToCart && (
            <button
              type="button"
              aria-label={isVariable ? "Select Options" : "Add to Cart"}
              onClick={(e) => {
                if (isVariable) {
                  // Let navigation happen
                } else {
                  handleAddToCart(e);
                }
              }}
              className={`w-full relative z-[10] pointer-events-auto py-[clamp(0.375rem,1.5vw,0.5rem)] text-[clamp(11px,1.5vw,13px)] font-bold text-center min-h-[32px] sm:min-h-[44px] whitespace-nowrap border border-gray-100 dark:border-gray-800 rounded-sm hover:border-emerald-500 hover:text-emerald-500 transition-colors mt-1 sm:mt-2 active:scale-95 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none
                ${
                  added || quantityInCart > 0
                    ? "text-emerald-500 border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/10"
                    : isVariable
                      ? "text-amber-600 dark:text-amber-400 hover:border-amber-500 hover:text-amber-500"
                      : "text-gray-500 dark:text-gray-400"
                }`}
            >
              {isVariable
                ? "Select Options"
                : quantityInCart > 0
                  ? "− Remove"
                  : added
                    ? "✓ Added"
                    : "+ Add to Cart"}
            </button>
          )}

          {/* Festive Variant Add to Cart Button */}
          {variant === "festive" && showAddToCart && (
            <button
              type="button"
              aria-label={isVariable ? "Select Options" : "Add to Cart"}
              onClick={(e) => {
                if (isVariable) {
                  // Let navigation happen
                } else {
                  handleAddToCart(e);
                }
              }}
              className={`w-full relative z-[10] pointer-events-auto py-[clamp(0.4rem,1.5vw,0.6rem)] px-3 rounded-md flex items-center justify-center gap-[clamp(0.25rem,1vw,0.5rem)] text-[clamp(11px,1.5vw,13px)] font-bold min-h-[32px] sm:min-h-[44px] whitespace-nowrap transition-all mt-1 sm:mt-2 active:scale-95 shadow-sm focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none
                ${
                  added || quantityInCart > 0
                    ? "bg-emerald-500 text-white"
                    : isVariable
                      ? "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 hover:bg-amber-500 hover:text-white"
                      : "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/10"
                }`}
            >
              {isVariable ? (
                <>
                  <Eye size={13} /> Select Options
                </>
              ) : (
                <>
                  <ShoppingCart size={13} />{" "}
                  {quantityInCart > 0
                    ? "Remove"
                    : added
                      ? "Added!"
                      : "Add to Cart"}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default React.memo(ProductCard);
