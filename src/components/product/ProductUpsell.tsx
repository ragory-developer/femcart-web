"use client";

import SectionWrapper from "../home/shared/SectionWrapper";
import { ProductCard } from "../home-ui/shared/ProductCard";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, FreeMode, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/pagination";
import { useMemo } from "react";

interface ProductUpsellProps {
  productContext?: any;
  allProducts?: any[];
  isBuilder?: boolean;
  title?: string;
  subtitle?: string;
  limit?: number;

  // Chrome props
  cols?: number; // legacy
  rows?: number; // legacy
  columnsDesktop?: number;
  columnsTablet?: number;
  columnsMobile?: number;
  rowsDesktop?: number; // legacy
  rowsTablet?: number; // legacy
  rowsMobile?: number; // legacy
  gap?: "sm" | "md" | "lg"; // legacy

  layoutType?: "grid" | "carousel"; // legacy
  cardVariant?:
    | "classic"
    | "sleek"
    | "minimal"
    | "festive"
    | "bordered"
    | "neumorphic"
    | "horizontal"; // legacy
  cardRadius?: "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "full"; // legacy
  showBadge?: boolean; // legacy
  showRating?: boolean; // legacy
  showAddToCart?: boolean; // legacy
  badgeStyle?: "pill" | "corner" | "ribbon"; // legacy

  autoplay?: boolean; // legacy
  autoplayDelay?: number; // legacy
  loop?: boolean; // legacy
  showNavigation?: boolean; // legacy
  showPagination?: boolean; // legacy
}

export default function ProductUpsell({
  productContext,
  allProducts = [],
  isBuilder = false,
  title = "You May Also Like",
  subtitle,
  limit = 8,
  cols = 6,
  columnsDesktop,
  columnsTablet = 4,
  columnsMobile = 2,
}: ProductUpsellProps) {
  const items = useMemo(() => {
    // 1. If resolvedUpsells exist on the product Context, use them directly
    let resolved = [];
    if (
      productContext?.resolvedUpsells &&
      Array.isArray(productContext.resolvedUpsells) &&
      productContext.resolvedUpsells.length > 0
    ) {
      resolved = productContext.resolvedUpsells;
    }
    // 2. Otherwise, if upsellProductIds exist on the product Context, map them to real products
    else if (
      productContext?.upsellProductIds &&
      Array.isArray(productContext.upsellProductIds) &&
      allProducts.length > 0
    ) {
      resolved = productContext.upsellProductIds
        .map((id: string) => allProducts.find((p) => p.id === id))
        .filter(Boolean);
    }

    // 3. Fallback to suggest products from same category if empty
    if (resolved.length === 0) {
      if (productContext?.related && Array.isArray(productContext.related)) {
        resolved = productContext.related;
      }
    }

    return resolved.slice(0, limit);
  }, [productContext, allProducts, limit]);

  if (items.length === 0) {
    if (!isBuilder) return null;

    return (
      <SectionWrapper
        title={title}
        subtitle={subtitle}
        bgWhite
        textAlign="center"
      >
        <div className="w-full border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-12 flex flex-col items-center justify-center text-center bg-gray-50/50 dark:bg-gray-900/50">
          <p className="text-gray-500 font-medium">
            No upsell products selected
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Configure upsell (you may also like) products in the product
            settings to display them here.
          </p>
        </div>
      </SectionWrapper>
    );
  }

  return (
    <SectionWrapper
      title={title}
      subtitle={subtitle}
      bgWhite
      textAlign="center"
    >
      <div className="mt-8 max-w-[1440px] mx-auto px-4 md:px-6">
        <Swiper
          modules={[Autoplay, FreeMode, Pagination]}
          spaceBetween={4}
          slidesPerView={2.1}
          freeMode={true}
          pagination={{ clickable: true, dynamicBullets: true }}
          autoplay={{
            delay: 4000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          breakpoints={{
            640: { slidesPerView: 3, spaceBetween: 12 },
            1024: { slidesPerView: 4, spaceBetween: 16 },
            1280: { slidesPerView: 5, spaceBetween: 16 },
          }}
          className="!pt-4 !px-1 !pb-12"
        >
          {items.map((p: any) => (
            <SwiperSlide key={p.id}>
              <ProductCard product={p} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </SectionWrapper>
  );
}
