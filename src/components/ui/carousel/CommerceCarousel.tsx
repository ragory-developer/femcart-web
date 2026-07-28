"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import React, { useState } from "react";
import type { Swiper as SwiperType } from "swiper";
import {
  A11y,
  Autoplay,
  Keyboard,
  Navigation,
  Pagination,
} from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  ResponsiveConfig,
  useResponsiveChunking,
} from "./useResponsiveChunking";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export interface CommerceCarouselConfig extends ResponsiveConfig {
  gap: "sm" | "md" | "lg";
  autoplay: boolean;
  autoplayDelay: number;
  loop: boolean;
  showNavigation: boolean;
  showPagination: boolean;
  layoutType: "grid" | "carousel";
}

interface CommerceCarouselProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  config: CommerceCarouselConfig;
  isLoading?: boolean;
}

// Map logical gaps to CSS tailwind classes
const gapClasses = {
  sm: "gap-[clamp(0.75rem,2vw,1rem)]",
  md: "gap-[clamp(1rem,3vw,1.5rem)]",
  lg: "gap-[clamp(1.5rem,4vw,2rem)]",
};

const gapValues = {
  sm: 12,
  md: 16,
  lg: 24,
};

const gridColsClass: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
  6: "grid-cols-6",
};

export default function CommerceCarousel<T>({
  items,
  renderItem,
  config,
  isLoading,
}: CommerceCarouselProps<T>) {
  const { chunks, slidesPerView, cols, rows, isMounted } =
    useResponsiveChunking(items, config);
  const [swiperInstance, setSwiperInstance] = useState<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  if (isLoading || !isMounted) {
    return (
      <div className="w-full min-h-[300px] flex items-center justify-center bg-gray-50 rounded-lg animate-pulse">
        <span className="text-gray-400 font-medium">Loading...</span>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400 dark:text-gray-500 font-medium">
        No items found matching the criteria.
      </div>
    );
  }

  // If layoutType is grid, just render standard grid without Swiper
  if (config.layoutType === "grid") {
    // For grid layout, we slice to exactly the first chunk size to prevent unlimited scrolling
    const limit = Math.floor(cols) * Math.floor(rows);
    const displayItems = items.slice(0, limit);

    return (
      <div
        className={`grid ${gridColsClass[Math.floor(cols)] || "grid-cols-2 md:grid-cols-4"} ${gapClasses[config.gap]} pb-4`}
      >
        {displayItems.map((item, idx) => (
          <React.Fragment key={idx}>{renderItem(item)}</React.Fragment>
        ))}
      </div>
    );
  }

  // Carousel Layout
  const isSingleRow = rows === 1;
  const colClass =
    gridColsClass[Math.floor(cols)] || "grid-cols-2 lg:grid-cols-4";
  const gapClass = gapClasses[config.gap];
  const spaceBetween = gapValues[config.gap] || 16;

  return (
    <div className="relative group/carousel">
      <Swiper
        modules={[Navigation, Pagination, Autoplay, A11y, Keyboard]}
        slidesPerView={slidesPerView}
        spaceBetween={isSingleRow ? spaceBetween : 0}
        loop={config.loop && chunks.length > slidesPerView}
        autoplay={
          config.autoplay
            ? {
                delay: config.autoplayDelay,
                disableOnInteraction: true,
                pauseOnMouseEnter: true,
              }
            : false
        }
        keyboard={{ enabled: true }}
        watchOverflow={true}
        grabCursor={true}
        passiveListeners={true}
        touchEventsTarget="container"
        onSwiper={setSwiperInstance}
        onSlideChange={(swiper: any) => setActiveIndex(swiper.realIndex)}
        className="pb-12 px-2 -mx-2 sm:px-4 sm:-mx-4" // Space for pagination and prevent edge clipping for shadows/hover
      >
        {chunks.map((chunk, chunkIdx) => (
          <SwiperSlide key={chunkIdx} className="h-auto">
            {isSingleRow ? (
              // If single row, chunk contains exactly 1 item, so we render it directly
              renderItem(chunk[0])
            ) : (
              // If multi-row, chunk contains a grid page of items
              <div className={`grid ${colClass} ${gapClass} h-full`}>
                {chunk.map((item, itemIdx) => (
                  <React.Fragment key={`${chunkIdx}-${itemIdx}`}>
                    {renderItem(item)}
                  </React.Fragment>
                ))}
              </div>
            )}
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom Navigation */}
      {config.showNavigation && swiperInstance && (
        <>
          <button
            aria-label="Previous slide"
            onClick={() => swiperInstance.slidePrev()}
            className="absolute left-[-16px] top-[calc(50%-24px)] z-40 flex w-[clamp(44px,5vw,48px)] h-[clamp(44px,5vw,48px)] -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-lg text-gray-700 hover:text-emerald-600 transition-all opacity-0 group-hover/carousel:opacity-100 disabled:opacity-0 hidden md:flex hover:scale-110"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            aria-label="Next slide"
            onClick={() => swiperInstance.slideNext()}
            className="absolute right-[-16px] top-[calc(50%-24px)] z-40 flex w-[clamp(44px,5vw,48px)] h-[clamp(44px,5vw,48px)] -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-lg text-gray-700 hover:text-emerald-600 transition-all opacity-0 group-hover/carousel:opacity-100 disabled:opacity-0 hidden md:flex hover:scale-110"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}

      {/* Pagination removed as requested */}
    </div>
  );
}
