"use client";

import ProductReviews from "@/components/product/ProductReviews";
import ProductTabs from "@/components/product/ProductTabs";
import AddToCartButton from "@/components/ui/AddToCartButton";
import {
  getProductImage,
  PLACEHOLDER_IMAGE,
  resolveImageUrl,
} from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Check,
  ChevronDown,
  ShieldCheck,
  Star,
  Truck,
  Zap,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useMemo, useCallback } from "react";

const FlashSaleBanner = ({
  endTime,
  stock,
}: {
  endTime: string;
  stock: number;
}) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    min: number;
    sec: number;
  } | null>(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const target = new Date(endTime).getTime();
      const now = new Date().getTime();
      const diff = target - now;

      if (diff <= 0) {
        return null;
      }

      return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        min: Math.floor((diff / 1000 / 60) % 60),
        sec: Math.floor((diff / 1000) % 60),
      };
    };

    // Initial calculation

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const updated = calculateTimeLeft();
      if (!updated) {
        clearInterval(timer);
      }
      setTimeLeft(updated);
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  if (!timeLeft) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: 1,
        y: 0,
        backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
      }}
      transition={{
        backgroundPosition: {
          duration: 12,
          repeat: Infinity,
          ease: "linear",
        },
        opacity: { duration: 0.5 },
        y: { duration: 0.5 },
      }}
      style={{
        backgroundSize: "200% 200%",
        backgroundImage: "linear-gradient(to right, #f472b6, #fbbf24, #f472b6)",
      }}
      className="w-full rounded p-4 mb-0 text-white overflow-hidden relative shadow-xl border border-white/10"
    >
      <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24 blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-yellow-400/10 rounded-full -ml-16 -mb-16 blur-2xl"></div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-6 relative z-10 font-sans">
        <div className="flex items-center gap-4">
          <div className="bg-yellow-400 p-3 rounded text-black shadow-lg animate-bounce">
            <Zap size={24} fill="currentColor" />
          </div>
          <div>
            <h3 className="text-2xl sm:text-3xl font-black italic tracking-tighter uppercase leading-none drop-shadow-md">
              FLASH SALE
            </h3>
            <p className="text-sm font-bold opacity-90 mt-1 flex items-center gap-2">
              Only{" "}
              <span className="text-yellow-300 underline decoration-2">
                {stock > 0 ? stock : "Limited items"}
              </span>{" "}
              left at this price!
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          {[
            { label: "DAYS", value: timeLeft.days },
            { label: "HOURS", value: timeLeft.hours },
            { label: "MIN", value: timeLeft.min },
            { label: "SEC", value: timeLeft.sec },
          ].map((unit, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="bg-white text-indigo-900 w-12 sm:w-14 h-12 sm:h-14 rounded flex items-center justify-center font-black text-xl sm:text-2xl shadow-lg ring-4 ring-black/5">
                {unit.value.toString().padStart(2, "0")}
              </div>
              <span className="text-[10px] font-black mt-2 opacity-90 uppercase tracking-[0.2em] drop-shadow-sm">
                {unit.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

// --- Extracted Styling Helpers ---
const isTailwindColor = (str?: string) =>
  str && (str.includes(" ") || str.startsWith("text-"));

const getTextColorClass = (
  color?: string,
  defaultClass = "text-gray-900 dark:text-white",
) => {
  if (!color) return defaultClass;
  return isTailwindColor(color) ? color : "";
};

const getTextColorStyle = (color?: string) => {
  if (color && !isTailwindColor(color)) return { color };
  return undefined;
};

const getAlignClass = (align?: string, defaultAlign = "left") => {
  if (!align) return `text-${defaultAlign}`;
  return align.startsWith("text-") ? align : `text-${align}`;
};

const getButtonColorClass = (color?: string) => {
  switch (color) {
    case "indigo":
      return "bg-indigo-600 hover:bg-indigo-700 text-white";
    case "rose":
      return "bg-rose-600 hover:bg-rose-700 text-white";
    case "gray":
      return "bg-gray-800 hover:bg-gray-900 text-white";
    case "pink":
      return "bg-pink-500 hover:bg-pink-600 text-white";
    case "primary":
    case "emerald":
    case "red":
    default:
      return "bg-pink-500 hover:bg-pink-600 text-white";
  }
};

const getPillColorClass = (color?: string) => {
  switch (color) {
    case "pink":
      return "bg-pink-50 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 hover:bg-pink-100 dark:hover:bg-pink-900/50 border-pink-100 dark:border-pink-900/20";
    case "primary":
    case "emerald":
    case "red":
      return "bg-pink-50 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 hover:bg-pink-100 dark:hover:bg-pink-900/50 border-pink-100 dark:border-pink-900/20";
    case "gray":
      return "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border-gray-100 dark:border-gray-800";
    case "indigo":
    default:
      return "bg-gray-50 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900/50 border-gray-100 dark:border-gray-900/20";
  }
};
// ---------------------------------

export default function ProductOverview({
  product,
  showFlashSale = true,
  showTrustBadges = true,
  showSku = true,
  showCategory = true,
  showRating = true,
  showDescription = true,
  imageRadius = "rounded-sm",
  imagePosition = "left",
  titleSize = "text-[clamp(1.75rem,4vw,3rem)]",
  titleColor,
  titleAlign = "left",
  priceSize = "text-[clamp(2rem,5vw,3rem)]",
  priceColor,
  priceAlign = "left",
  descriptionSize = "text-[clamp(0.875rem,1.5vw,1.125rem)]",
  descriptionColor,
  descriptionAlign = "left",
  elementsOrder = [
    "category_brand",
    "title",
    "rating",
    "tags",
    "flash_sale",
    "price",
    "description",
    "variants",
    "add_to_cart",
    "features",
    "sku",
  ],
  buttonColor = "pink",
  buttonSize = "md",
  buttonAlign = "left",
  pillColor = "pink",
  pillSize = "xs",
  pillAlign = "left",
  bannerColor = "rose",
  bannerStyle = "solid",
  featureStyle = "cards",
  skuAlertStyle = "cards",
  forceShowElements = false,
}: {
  product: any;
  showFlashSale?: boolean;
  showTrustBadges?: boolean;
  showSku?: boolean;
  showCategory?: boolean;
  showRating?: boolean;
  showDescription?: boolean;
  imageRadius?: string;
  imagePosition?: string;
  titleSize?: string;
  titleColor?: string;
  titleAlign?: string;
  priceSize?: string;
  priceColor?: string;
  priceAlign?: string;
  descriptionSize?: string;
  descriptionColor?: string;
  descriptionAlign?: string;
  elementsOrder?: string[];
  buttonColor?: string;
  buttonSize?: string;
  buttonAlign?: string;
  pillColor?: string;
  pillSize?: string;
  pillAlign?: string;
  bannerColor?: string;
  bannerStyle?: string;
  featureStyle?: string;
  skuAlertStyle?: string;
  forceShowElements?: boolean;
}) {
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const [activeGalleryImage, setActiveGalleryImage] = useState<string | null>(
    null,
  );
  const [isExpanded, setIsExpanded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [mounted, setMounted] = useState(false);

  const enabledVariants =
    product?.variants?.filter((v: any) => v.enabled) || [];

  // Initialize selected variant and attributes on mount if none is selected
  useEffect(() => {
    if (product?.productType === "VARIABLE" && enabledVariants.length > 0 && !selectedVariant) {
      const firstVariant = enabledVariants[0];
      const initialAttrs: Record<string, string> = {};
      firstVariant.attributes?.forEach((a: any) => {
        initialAttrs[a.name] = a.value;
      });
      setSelectedAttributes(initialAttrs);
      setSelectedVariant(firstVariant);
    }
  }, [product?.productType, enabledVariants, selectedVariant]);

  // Group attributes for the UI
  const groupedAttributes = useMemo(() => {
    if (product?.productType !== "VARIABLE" || !enabledVariants.length) return {};
    const groups: Record<string, string[]> = {};
    enabledVariants.forEach((v: any) => {
      v.attributes?.forEach((a: any) => {
        if (!groups[a.name]) groups[a.name] = [];
        if (!groups[a.name].includes(a.value)) {
          groups[a.name].push(a.value);
        }
      });
    });
    return groups;
  }, [product?.productType, enabledVariants]);

  const handleAttributeSelect = useCallback(
    (name: string, value: string) => {
      const newAttrs = { ...selectedAttributes, [name]: value };

      // Find an exact match for the new combination
      const exactMatch = enabledVariants.find((v: any) => {
        return Object.entries(newAttrs).every(([k, val]) =>
          v.attributes?.some((a: any) => a.name === k && a.value === val),
        );
      });

      if (exactMatch) {
        setSelectedAttributes(newAttrs);
        setSelectedVariant(exactMatch);
      } else {
        // Fallback: pivot to the first variant that has the newly selected value
        const fallbackVariant = enabledVariants.find((v: any) =>
          v.attributes?.some((a: any) => a.name === name && a.value === value),
        );
        if (fallbackVariant) {
          const fallbackAttrs: Record<string, string> = {};
          fallbackVariant.attributes?.forEach((a: any) => {
            fallbackAttrs[a.name] = a.value;
          });
          setSelectedAttributes(fallbackAttrs);
          setSelectedVariant(fallbackVariant);
        }
      }
    },
    [selectedAttributes, enabledVariants],
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  // Clear active gallery image when a new variant is selected
  useEffect(() => {
    setActiveGalleryImage(null);
    setImgError(false);
  }, [selectedVariant]);

  if (!product) return null;
  const {
    name,
    description,
    shortDescription,
    price,
    specialPrice,
    specialPriceStart,
    specialPriceEnd,
    comparePrice,
    stock,
    unit,
    weight,
    category: singleCategory,
    categories,
    productType,
    priceRange,
    variants,
    brand,
    averageRating,
    ratingCount,
  } = product;
  const category = singleCategory || categories?.[0];

  // Special price logic with date check
  const now = new Date();

  // Helper to check if special price is active
  const isSpecialActive = (sp: number | null, start: any, end: any) => {
    if (forceShowElements && sp !== null && sp !== undefined && sp !== 0)
      return true;
    if (sp === null || sp === undefined || sp === 0) return false;

    const startDate = start ? new Date(start) : null;
    const endDate = end ? new Date(end) : null;

    const isStarted = !startDate || startDate <= now;
    // Add a 1-hour buffer to the end date to be safe
    const isNotEnded = !endDate || new Date(endDate.getTime() + 3600000) >= now;

    return isStarted && isNotEnded;
  };

  const hasSpecialPrice = selectedVariant
    ? isSpecialActive(
        selectedVariant.specialPrice,
        selectedVariant.specialPriceStart,
        selectedVariant.specialPriceEnd,
      )
    : isSpecialActive(specialPrice, specialPriceStart, specialPriceEnd);

  const hasComparePrice =
    !selectedVariant &&
    typeof comparePrice === "number" &&
    comparePrice > (price || 0);
  const isDiscounted = hasSpecialPrice || hasComparePrice;

  const currentPrice = selectedVariant
    ? hasSpecialPrice
      ? selectedVariant.specialPrice
      : selectedVariant.price
    : hasSpecialPrice
      ? specialPrice
      : price || 0;

  const originalPrice = selectedVariant
    ? selectedVariant.price || price || 0
    : hasComparePrice && !hasSpecialPrice
      ? comparePrice
      : price || 0;

  const flashSaleEndTime = selectedVariant?.specialPriceEnd || specialPriceEnd;
  const effectiveFlashSaleEndTime =
    mounted && forceShowElements && !flashSaleEndTime
      ? new Date(now.getTime() + 86400000 * 3).toISOString()
      : forceShowElements && !flashSaleEndTime
        ? null
        : flashSaleEndTime;
  const isActiveFlashSale =
    (hasSpecialPrice && flashSaleEndTime) || forceShowElements;

  const displayImage = imgError
    ? PLACEHOLDER_IMAGE
    : activeGalleryImage
      ? resolveImageUrl(activeGalleryImage)
      : selectedVariant && selectedVariant.image
        ? resolveImageUrl(selectedVariant.image)
        : getProductImage(product);

  // Ensure we have a flat array of unique image URLs
  const rawImages = Array.isArray(product.images)
    ? product.images
    : typeof product.images === "string"
      ? JSON.parse(product.images || "[]")
      : [];
  
  const variantImages = enabledVariants
    .map((v: any) => v.image)
    .filter(Boolean);

  const allImages = [product.image, ...rawImages, ...variantImages].filter(Boolean);
  const uniqueImages = Array.from(
    new Set(
      allImages.map((img) => (typeof img === "string" ? img.trim() : "")),
    ),
  );

  const renderPrice = () => {
    return (
      <div
        className={`flex flex-col mb-2 sm:mb-3 ${getAlignClass(priceAlign)} min-h-[40px] justify-center`}
      >
        <div
          className={`flex items-center gap-2 sm:gap-3 flex-wrap ${priceAlign === "center" || priceAlign === "text-center" ? "justify-center" : priceAlign === "right" || priceAlign === "text-right" ? "justify-end" : ""}`}
        >
          <span
            className={`text-3xl sm:text-4xl font-medium tracking-tight ${getTextColorClass(priceColor, "text-gray-900 dark:text-white")}`}
            style={getTextColorStyle(priceColor)}
          >
            ৳ {currentPrice.toFixed(2)}
          </span>
          {!selectedVariant && productType === "VARIABLE" && priceRange && (
            <span className="text-[clamp(1rem,1.5vw,1.25rem)] text-gray-500 font-medium whitespace-nowrap">
              (৳ {priceRange.min.toFixed(2)} - ৳ {priceRange.max.toFixed(2)})
            </span>
          )}
          {isDiscounted && (
            <div
              className={`flex items-center gap-3 ${priceAlign === "center" ? "justify-center" : priceAlign === "right" ? "justify-end" : ""}`}
            >
              <span className="text-xl sm:text-2xl text-gray-400 line-through font-medium">
                ৳ {originalPrice.toFixed(2)}
              </span>
              <span className="bg-pink-50 text-pink-600 border border-pink-100 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap">
                Save ৳ {(originalPrice - currentPrice).toFixed(2)}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderElement = (elementId: string) => {
    switch (elementId) {
      case "category_brand":
        return showCategory && (category || brand) ? (
          <div
            key={elementId}
            className={`flex flex-wrap items-center gap-2 mb-2 sm:mb-3 justify-${pillAlign}`}
          >
            {category && (
              <Link
                href={`/categories/${category.slug}`}
                className={`${getPillColorClass(pillColor)} px-3 min-h-[44px] flex items-center justify-center rounded-sm ${pillSize === "xs" ? "text-xs" : "text-sm"} font-black uppercase tracking-widest transition-all border`}
              >
                {category.name}
              </Link>
            )}
            {brand && (
              <Link
                href={`/brands/${brand.slug}`}
                className="bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-3 min-h-[44px] flex items-center justify-center rounded-sm text-xs font-black uppercase tracking-widest hover:bg-gray-100 dark:hover:bg-gray-700 transition-all border border-gray-100 dark:border-gray-800"
              >
                {brand.name}
              </Link>
            )}
          </div>
        ) : null;

      case "title":
        return (
          <h1
            key={elementId}
            onClick={(e) => {
              if (forceShowElements && typeof window !== "undefined") {
                e.preventDefault();
                window.dispatchEvent(
                  new CustomEvent("builder:highlightElement", {
                    detail: { elementId },
                  }),
                );
              }
            }}
            className={`font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-gray-900 dark:text-white leading-[1.1] mb-2 break-words ${getAlignClass(titleAlign)} ${forceShowElements ? "cursor-pointer hover:outline-dashed hover:outline-2 hover:outline-pink-500/50 hover:bg-pink-50/10 p-1 -m-1 rounded-sm transition-all" : ""}`}
            style={getTextColorStyle(titleColor)}
          >
            {name}
          </h1>
        );

      case "rating":
        return showRating ? (
          <div
            key={elementId}
            className={`flex items-center gap-3 sm:gap-4 mb-2 sm:mb-3 justify-${pillAlign}`}
          >
            <div className="flex items-center gap-1 text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-2 sm:px-3 py-1 sm:py-1.5 rounded-sm border border-amber-100 dark:border-amber-900/30">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  className={
                    i < Math.round(averageRating)
                      ? "fill-current"
                      : "text-gray-300 dark:text-gray-600"
                  }
                />
              ))}
              <span className="text-amber-700 dark:text-amber-400 font-black text-xs sm:text-sm ml-1">
                {averageRating > 0 ? averageRating.toFixed(1) : "0.0"}
              </span>
            </div>
            <span className="text-gray-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
              ({ratingCount || 0} {ratingCount === 1 ? "Review" : "Reviews"})
            </span>
          </div>
        ) : null;

      case "reviews":
        return (
          <div key={elementId} className="mb-8">
            <ProductReviews
              productContext={product}
              limit={3}
              isLandingPage={false}
              showPagination={false}
              title="Recent Reviews"
              subtitle=""
            />
          </div>
        );

      case "tags":
        return (
          <div
            key={elementId}
            className={`flex flex-wrap items-center gap-2 mb-2 sm:mb-3 justify-${pillAlign}`}
          >
            {(() => {
              const currentStockForDisplay = selectedVariant
                ? selectedVariant.stock
                : product.productType === "VARIABLE"
                  ? enabledVariants.reduce(
                      (acc: number, v: any) => acc + (v.stock || 0),
                      0,
                    )
                  : stock;

              if (currentStockForDisplay > 10) {
                return (
                  <span className="text-emerald-600 font-black bg-emerald-50 dark:bg-emerald-900/40 px-3 sm:px-4 py-1 sm:py-1.5 rounded-sm text-[10px] sm:text-xs flex items-center gap-2 uppercase tracking-widest border border-emerald-100 dark:border-emerald-900/30">
                    <div className="w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>{" "}
                    In Stock
                  </span>
                );
              } else if (currentStockForDisplay > 0) {
                return (
                  <span className="text-amber-600 font-black bg-amber-50 dark:bg-amber-900/40 px-3 sm:px-4 py-1 sm:py-1.5 rounded-sm text-[10px] sm:text-xs flex items-center gap-2 uppercase tracking-widest border border-amber-100 dark:border-amber-900/30">
                    <div className="w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-amber-500 animate-pulse"></div>{" "}
                    Low Stock ({currentStockForDisplay})
                  </span>
                );
              } else {
                return (
                  <span className="text-rose-500 font-black bg-rose-50 dark:bg-rose-900/40 px-3 sm:px-4 py-1 sm:py-1.5 rounded-sm text-[10px] sm:text-xs uppercase tracking-widest border border-rose-100 dark:border-rose-900/30">
                    Out of Stock
                  </span>
                );
              }
            })()}
            {product.tags &&
              product.tags.length > 0 &&
              product.tags.map((tag: any) => (
                <span
                  key={tag.id}
                  className="text-[10px] sm:text-[11px] font-bold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-sm uppercase tracking-tight"
                >
                  #{tag.name}
                </span>
              ))}
          </div>
        );

      case "flash_sale":
        return showFlashSale &&
          isActiveFlashSale &&
          effectiveFlashSaleEndTime ? (
          <div
            key={elementId}
            className={`mb-3 sm:mb-4 ${bannerStyle === "minimal" ? "opacity-90" : ""}`}
          >
            {/* Assuming FlashSaleBanner receives bannerColor as an enhancement, but we'll use a wrapper style for now */}
            <div
              className={`rounded-lg ${bannerColor === "rose" ? "bg-rose-500" : bannerColor === "amber" ? "bg-amber-500" : bannerColor === "gradient" ? "bg-gradient-to-r from-rose-500 to-indigo-500" : ""}`}
            >
              <FlashSaleBanner
                endTime={effectiveFlashSaleEndTime as string}
                stock={stock || 10}
              />
            </div>
          </div>
        ) : null;

      case "price":
        return (
          <div
            key={elementId}
            onClick={(e) => {
              if (forceShowElements && typeof window !== "undefined") {
                e.preventDefault();
                window.dispatchEvent(
                  new CustomEvent("builder:highlightElement", {
                    detail: { elementId },
                  }),
                );
              }
            }}
            className={`flex flex-col gap-1 mb-3 sm:mb-4 overflow-hidden ${forceShowElements ? "cursor-pointer hover:outline-dashed hover:outline-2 hover:outline-pink-500/50 hover:bg-pink-50/10 p-1 -m-1 rounded-sm transition-all" : ""}`}
          >
            {renderPrice()}
            {productType !== "VARIABLE" && !isDiscounted && (
              <span
                className={`text-gray-500 font-bold uppercase tracking-widest text-[10px] sm:text-xs mt-2 text-${priceAlign}`}
              >
                Per {weight || unit || "Piece"}
              </span>
            )}
          </div>
        );

      case "description":
        return showDescription ? (
          <div
            key={elementId}
            onClick={(e) => {
              if (forceShowElements && typeof window !== "undefined") {
                e.preventDefault();
                window.dispatchEvent(
                  new CustomEvent("builder:highlightElement", {
                    detail: { elementId },
                  }),
                );
              }
            }}
            className={`w-full max-w-full relative mb-8 ${forceShowElements ? "cursor-pointer hover:outline-dashed hover:outline-2 hover:outline-pink-500/50 hover:bg-pink-50/10 p-1 -m-1 rounded-sm transition-all" : ""}`}
          >
            <div
              className={`w-full ${descriptionSize} ${!descriptionColor ? "text-gray-800 dark:text-gray-200" : ""} leading-relaxed transition-all duration-500 overflow-hidden relative text-${descriptionAlign} ${
                !isExpanded ? "max-h-[140px]" : "max-h-[4000px]"
              }`}
              style={descriptionColor ? { color: descriptionColor } : undefined}
            >
              {shortDescription ? (
                <div
                  className={`prose prose-indigo dark:prose-invert max-w-none prose-p:my-2 prose-img:rounded-sm prose-img:max-w-full break-words [word-break:normal] hyphens-none ${getAlignClass(descriptionAlign)} [&_table]:w-full [&_table]:mt-3 [&_table]:text-sm [&_th]:text-left [&_th]:font-bold [&_th]:text-gray-900 dark:[&_th]:text-white [&_th]:py-1.5 [&_th]:pr-4 [&_th]:w-1/3 sm:[&_th]:w-1/4 [&_td]:py-1.5 [&_tr]:border-b [&_tr]:border-gray-100 dark:[&_tr]:border-gray-800 last:[&_tr]:border-0`}
                  dangerouslySetInnerHTML={{ __html: shortDescription }}
                />
              ) : (
                <p className={`font-medium ${getAlignClass(descriptionAlign)}`}>
                  {description
                    ? description.replace(/<[^>]*>/g, "")
                    : "No description available."}
                </p>
              )}
              {!isExpanded &&
                ((shortDescription && shortDescription.length > 200) ||
                  (description && description.length > 200)) && (
                  <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white dark:from-gray-950 to-transparent pointer-events-none z-10"></div>
                )}
            </div>
            {((shortDescription && shortDescription.length > 200) ||
              (description && description.length > 200)) && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`text-indigo-600 dark:text-indigo-400 font-black text-sm uppercase tracking-widest hover:text-indigo-700 dark:hover:text-indigo-300 transition-all flex items-center gap-2 mt-2 group min-h-[44px] justify-${descriptionAlign}`}
              >
                {isExpanded ? "Show Less" : "Read Full Description"}
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  className="group-hover:translate-y-0.5 transition-transform"
                >
                  <ChevronDown size={16} strokeWidth={3} />
                </motion.div>
              </button>
            )}
          </div>
        ) : null;

      case "specifications":
        const validOverviewSpecs =
          product.specifications && Array.isArray(product.specifications)
            ? product.specifications.filter(
                (spec: any) =>
                  spec &&
                  spec.name &&
                  spec.name.trim() !== "" &&
                  spec.value &&
                  spec.value.trim() !== "",
              )
            : [];
        return validOverviewSpecs.length > 0 ? (
          <div
            key={elementId}
            className="mb-8 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded p-5 shadow-sm"
          >
            <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest mb-4">
              Specifications
            </h3>
            <div className="space-y-3">
              {validOverviewSpecs.map((spec: any, idx: number) => (
                <div
                  key={idx}
                  className="flex justify-between items-center pb-3 border-b border-gray-50 dark:border-gray-800 last:border-0 last:pb-0"
                >
                  <span className="text-sm text-gray-500">{spec.name}</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {spec.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : null;

      case "variants":
        return productType === "VARIABLE" && enabledVariants.length > 0 ? (
          <div
            key={elementId}
            className="mb-3 sm:mb-4 bg-gray-50 dark:bg-gray-900/50 p-3 sm:p-5 rounded border border-gray-100 dark:border-gray-800"
          >
            {Object.entries(groupedAttributes).map(([attrName, values]: [string, any]) => (
              <div key={attrName} className="mb-4 sm:mb-5 last:mb-0">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2.5 sm:mb-3 px-1">
                  Select {attrName}
                </h3>
                <div className="flex flex-wrap gap-2 sm:gap-2.5">
                  {values.map((val: string) => {
                    const isSelected = selectedAttributes[attrName] === val;
                    // Check if this specific value is available in combination with OTHER currently selected attributes
                    const isAvailable = enabledVariants.some((v: any) => {
                      const hasThisValue = v.attributes?.some((a: any) => a.name === attrName && a.value === val);
                      if (!hasThisValue) return false;
                      
                      // Check other attributes (excluding the current one we are evaluating)
                      return Object.entries(selectedAttributes).every(([k, vVal]) => {
                        if (k === attrName) return true;
                        return v.attributes?.some((a: any) => a.name === k && a.value === vVal);
                      });
                    });

                    return (
                      <button
                        key={val}
                        onClick={() => handleAttributeSelect(attrName, val)}
                        className={`px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all border-2 relative overflow-hidden group ${
                          isSelected
                            ? "border-gray-900 bg-gray-900 text-white dark:border-white dark:bg-white dark:text-gray-900 shadow-md scale-[1.02] ring-2 ring-gray-900/10 dark:ring-white/10"
                            : isAvailable 
                              ? "border-gray-200 text-gray-600 bg-white hover:border-gray-900 hover:text-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:border-white dark:hover:text-white hover:shadow-sm"
                              : "border-gray-100 text-gray-300 bg-gray-50/50 cursor-not-allowed dark:bg-gray-900/30 dark:border-gray-800 dark:text-gray-600 line-through decoration-1"
                        }`}
                      >
                        {val}
                        {isSelected && (
                          <div className="absolute inset-0 bg-white/10 dark:bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
            
            {selectedVariant && (
              <div className="mt-4 pt-4 sm:mt-5 sm:pt-5 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2.5 sm:mb-3 px-1">
                  Selected Variant
                </h3>
                <div className="flex items-center gap-3 sm:gap-4 bg-white dark:bg-gray-800 p-2 sm:p-3 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm">
                  {selectedVariant.image ? (
                    <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded overflow-hidden shrink-0 border border-gray-100 dark:border-gray-700 bg-white">
                      <Image
                        src={resolveImageUrl(selectedVariant.image)}
                        alt={selectedVariant.attributes?.map((a: any) => a.value).join(" / ")}
                        fill
                        sizes="(max-width: 640px) 3rem, 3.5rem"
                        className="object-contain p-1"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded bg-gray-50 dark:bg-gray-900/50 flex items-center justify-center text-gray-300">
                      <Zap size={18} className="sm:w-5 sm:h-5" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-black truncate uppercase tracking-tight text-gray-900 dark:text-white">
                      {selectedVariant.attributes?.map((a: any) => a.value).join(" / ") || "Standard"}
                    </p>
                    {(() => {
                      const vHasSpecial = isSpecialActive(
                        selectedVariant.specialPrice,
                        selectedVariant.specialPriceStart,
                        selectedVariant.specialPriceEnd,
                      );
                      if (vHasSpecial) {
                        return (
                          <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 sm:mt-1 flex-wrap">
                            <span className="text-sm sm:text-base font-black text-rose-600 dark:text-rose-400">
                              ৳ {selectedVariant.specialPrice?.toFixed(0)}
                            </span>
                            <span className="text-[10px] sm:text-xs font-medium line-through text-gray-400">
                              ৳ {selectedVariant.price?.toFixed(0)}
                            </span>
                          </div>
                        );
                      }
                      return (
                        <p className="text-sm sm:text-base font-black mt-0.5 sm:mt-1 text-gray-900 dark:text-white">
                          ৳ {selectedVariant.price?.toFixed(0)}
                        </p>
                      );
                    })()}
                  </div>
                  <div className="shrink-0 flex items-center justify-center text-green-500 bg-green-50 dark:bg-green-500/10 w-6 h-6 sm:w-8 sm:h-8 rounded-full">
                    <Check size={14} strokeWidth={3} />
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : null;

      case "add_to_cart":
        return (
          <div
            key={elementId}
            className={`mb-3 sm:mb-4 flex justify-${buttonAlign} ${forceShowElements ? "cursor-pointer hover:outline-dashed hover:outline-2 hover:outline-pink-500/50 hover:bg-pink-50/10 p-1 -m-1 rounded-sm transition-all" : ""}`}
            onClickCapture={(e) => {
              if (forceShowElements && typeof window !== "undefined") {
                e.preventDefault();
                e.stopPropagation();
                window.dispatchEvent(
                  new CustomEvent("builder:highlightElement", {
                    detail: { elementId },
                  }),
                );
              }
            }}
          >
            <div
              className={`pointer-events-${forceShowElements ? "none" : "auto"} w-full sm:w-3/4 lg:w-full`}
            >
              <AddToCartButton
                product={product}
                selectedVariant={selectedVariant}
                buttonColor={getButtonColorClass(buttonColor)}
              />
            </div>
          </div>
        );

      case "features":
        return null; // Trust badges removed as per request for no static dummy data

      case "sku":
        if (!showSku) return null;

        const currentStock = selectedVariant ? selectedVariant.stock : stock;
        let stockColor = "red";
        if (currentStock > 10) stockColor = "emerald";
        else if (currentStock > 0) stockColor = "amber";

        const stockBg =
          stockColor === "emerald"
            ? "bg-emerald-50/50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800"
            : stockColor === "amber"
              ? "bg-amber-50/50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800"
              : "bg-pink-50/50 dark:bg-pink-900/20 border-pink-100 dark:border-pink-800";

        const stockIconBorder =
          stockColor === "emerald"
            ? "border-emerald-100 dark:border-emerald-700"
            : stockColor === "amber"
              ? "border-amber-100 dark:border-amber-700"
              : "border-pink-100 dark:border-pink-700";

        const stockIconText =
          stockColor === "emerald"
            ? "text-emerald-600"
            : stockColor === "amber"
              ? "text-amber-600"
              : "text-pink-600";

        const stockSubtext =
          stockColor === "emerald"
            ? "text-emerald-600/80 dark:text-emerald-400/80"
            : stockColor === "amber"
              ? "text-amber-600/80 dark:text-amber-400/80"
              : "text-pink-600/80 dark:text-pink-400/80";

        const stockText =
          stockColor === "emerald"
            ? "text-emerald-700 dark:text-emerald-400"
            : stockColor === "amber"
              ? "text-amber-700 dark:text-amber-400"
              : "text-pink-700 dark:text-pink-400";

        return (
          <div
            key={elementId}
            className={`grid grid-cols-2 lg:grid-cols-1 gap-2 sm:gap-3 ${skuAlertStyle === "cards" ? "border-t border-gray-100 dark:border-gray-800 pt-3 sm:pt-5 mt-1 sm:mt-2" : "opacity-80 mt-2 sm:mt-4"}`}
          >
            <div
              className={`flex items-center gap-3 ${skuAlertStyle === "cards" ? "p-3 rounded-sm bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 shadow-sm" : ""}`}
            >
              {skuAlertStyle === "cards" && (
                <div className="bg-gray-50 dark:bg-gray-800 p-1.5 rounded-sm border border-gray-100 dark:border-gray-700 shrink-0">
                  <Zap size={16} className="text-gray-600 dark:text-gray-300" />
                </div>
              )}
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest truncate">
                  SKU Code
                </p>
                <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 mt-0.5 truncate">
                  {selectedVariant?.sku || product?.sku || "N/A"}
                </p>
              </div>
            </div>
            <div
              className={`flex items-center gap-3 ${skuAlertStyle === "cards" ? `p-3 rounded-sm border shadow-sm ${stockBg}` : ""}`}
            >
              {skuAlertStyle === "cards" && (
                <div
                  className={`bg-white dark:bg-gray-800 p-1.5 rounded-sm border shrink-0 ${stockIconBorder}`}
                >
                  <Check size={16} className={stockIconText} />
                </div>
              )}
              <div className="min-w-0">
                <p
                  className={`text-[10px] font-bold uppercase tracking-widest truncate ${stockSubtext}`}
                >
                  Stock Status
                </p>
                <p
                  className={`text-xs font-semibold mt-0.5 tracking-tight truncate ${stockText}`}
                >
                  {currentStock > 0
                    ? `${currentStock} Available`
                    : "Out of Stock"}
                </p>
              </div>
            </div>
            <div
              className={`flex items-center gap-3 ${skuAlertStyle === "cards" ? "p-3 rounded-sm bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 shadow-sm" : ""}`}
            >
              {skuAlertStyle === "cards" && (
                <div className="bg-gray-50 dark:bg-gray-800 p-1.5 rounded-sm border border-gray-100 dark:border-gray-700 shrink-0">
                  <Truck
                    size={16}
                    className="text-gray-600 dark:text-gray-300"
                  />
                </div>
              )}
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest truncate">
                  Unit & Weight
                </p>
                <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 mt-0.5 truncate">
                  {unit || "Piece"} {weight ? `(${weight})` : ""}
                </p>
              </div>
            </div>
            <div
              className={`flex items-center gap-3 ${skuAlertStyle === "cards" ? "p-3 rounded-sm bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 shadow-sm" : ""}`}
            >
              {skuAlertStyle === "cards" && (
                <div className="bg-emerald-50 dark:bg-emerald-900/20 p-1.5 rounded-sm border border-emerald-100 dark:border-emerald-800 shrink-0">
                  <ShieldCheck
                    size={16}
                    className="text-emerald-600 dark:text-emerald-400"
                  />
                </div>
              )}
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest truncate">
                  Origin & Status
                </p>
                <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 mt-0.5 truncate">
                  {product.countryOfOrigin || "Local"} •{" "}
                  {product.isFemcart !== false ? "100% Original" : "Standard"}
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Desktop 3-Column Layout Mapping
  const middleColumnIds = [
    "category_brand",
    "title",
    "rating",
    "tags",
    "flash_sale",
    "price",
    "variants",
    "add_to_cart",
  ];
  const rightColumnIds = ["sku", "features"];
  const bottomColumnIds = ["description", "specifications"];

  const middleElements = elementsOrder.filter((id) =>
    middleColumnIds.includes(id),
  );
  const rightElements = elementsOrder.filter((id) =>
    rightColumnIds.includes(id),
  );
  const bottomElements = elementsOrder.filter((id) =>
    bottomColumnIds.includes(id),
  );

  return (
    <div className="w-full">
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8 xl:gap-10 max-w-full">
        {/* Column 1: Image Gallery (~35%) */}
        <div className="w-full lg:w-[35%] xl:w-[35%] flex flex-col gap-3 sm:gap-[clamp(1rem,2vw,1.5rem)]">
          <div
            className={`aspect-[4/3] sm:aspect-square md:max-h-[600px] w-full bg-gray-50 dark:bg-gray-900 ${imageRadius} overflow-hidden relative shadow-inner group flex items-center justify-center`}
          >
            <Image
              src={resolveImageUrl(displayImage)}
              alt={name || "Product"}
              fill
              onError={() => setImgError(true)}
              priority
              sizes="(max-width: 1024px) 100vw, 35vw"
              className={`object-contain p-4 sm:p-10 transition-all duration-500 group-hover:scale-105`}
            />
            <div className="absolute top-4 left-4 sm:top-8 sm:left-8 z-10 flex flex-col gap-2">
              {hasSpecialPrice && (
                <div className="font-black px-[clamp(0.5rem,2vw,1.25rem)] py-[clamp(0.125rem,1vw,0.5rem)] rounded-sm sm:rounded transform -rotate-3 uppercase tracking-wider text-[clamp(0.625rem,1.5vw,0.875rem)] bg-pink-600 text-white shadow-xl">
                  Flash Deal
                </div>
              )}
              {(() => {
                if (!mounted) return null;
                const created = new Date(product.createdAt);
                const diffDays =
                  (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
                if (diffDays <= 14) {
                  return (
                    <div className="font-black px-3 py-1 sm:px-4 sm:py-1.5 rounded-sm uppercase tracking-wider text-[10px] sm:text-xs w-fit bg-pink-600 text-white shadow-lg">
                      NEW
                    </div>
                  );
                }
                return null;
              })()}
              {isDiscounted && originalPrice > 0 && (
                <div className="font-black px-3 py-1 sm:px-4 sm:py-1.5 rounded-sm uppercase tracking-wider text-[10px] sm:text-xs w-fit bg-amber-500 text-white shadow-lg">
                  -
                  {Math.round(
                    ((originalPrice - currentPrice) / originalPrice) * 100,
                  )}
                  % OFF
                </div>
              )}
            </div>
          </div>

          {/* Gallery Thumbnails */}
          {uniqueImages.length > 1 && (
            <div className="flex gap-[clamp(0.5rem,2vw,1rem)] overflow-x-auto pb-2 scrollbar-hide snap-x px-1">
              {uniqueImages.map((imgUrl: any, idx: number) => {
                const isActive =
                  (activeGalleryImage ||
                    (selectedVariant && selectedVariant.image
                      ? selectedVariant.image
                      : product.image)) === imgUrl;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setActiveGalleryImage(imgUrl);
                      setImgError(false);
                    }}
                    className={`relative w-[clamp(4rem,10vw,4.5rem)] aspect-square rounded-sm overflow-hidden shrink-0 border-2 transition-all snap-start ${
                      isActive
                        ? "border-indigo-500 ring-4 ring-indigo-500/20 bg-indigo-50 dark:bg-indigo-900/20 shadow-md"
                        : "border-gray-200 dark:border-gray-800 hover:border-indigo-300 dark:hover:border-indigo-700 bg-white dark:bg-gray-900 hover:shadow-sm"
                    }`}
                  >
                    <Image
                      src={resolveImageUrl(imgUrl)}
                      alt={`${name} gallery ${idx + 1}`}
                      fill
                      sizes="(max-width: 768px) 4rem, 4.5rem"
                      className="object-contain p-1 sm:p-2"
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Column 2: Main Info (~40%) */}
        <div className="w-full lg:w-[40%] xl:w-[40%] flex flex-col">
          {middleElements.map(renderElement)}
        </div>

        {/* Column 3: Side Panel (~25%) */}
        <div className="w-full lg:w-[25%] xl:w-[25%] flex flex-col gap-4 sm:gap-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded p-4 sm:p-5 shadow-sm lg:sticky lg:top-24">
            {rightElements.map(renderElement)}
          </div>
        </div>
      </div>

      {/* Bottom Section: Description & Specs */}
      <div className="mt-12 lg:mt-16 w-full max-w-4xl mx-auto xl:mx-0 xl:max-w-5xl">
        {bottomElements.map(renderElement)}
      </div>

      {/* Product Tabs Section inside Overview (Reviews) */}
      <div className="mt-12 w-full max-w-4xl mx-auto xl:mx-0 xl:max-w-5xl">
        <ProductTabs product={product} />
      </div>
    </div>
  );
}
