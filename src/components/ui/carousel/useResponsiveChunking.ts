"use client";

import { useEffect, useMemo, useState } from "react";

export interface ResponsiveConfig {
  columnsDesktop: number;
  columnsTablet: number;
  columnsMobile: number;
  rowsDesktop: number;
  rowsTablet: number;
  rowsMobile: number;
}

export function useResponsiveChunking<T>(items: T[], config: ResponsiveConfig) {
  const [width, setWidth] = useState<number>(1024); // Default to desktop for SSR
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const handleResize = () => setWidth(window.innerWidth);
    handleResize(); // Set initial width

    // Debounce resize
    let timeoutId: NodeJS.Timeout;
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, 150);
    };

    window.addEventListener("resize", debouncedResize);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", debouncedResize);
    };
  }, []);

  return useMemo(() => {
    // If not mounted, return desktop config to prevent hydration mismatch
    let cols = config.columnsDesktop;
    let rows = config.rowsDesktop;
    let isMobile = false;

    if (isMounted) {
      if (width < 768) {
        cols = config.columnsMobile;
        rows = config.rowsMobile;
        isMobile = true;
      } else if (width < 1024) {
        cols = config.columnsTablet;
        rows = config.rowsTablet;
      }
    }

    // Single Row Logic: No chunking, Swiper handles individual items
    if (rows === 1) {
      return {
        chunks: items.map((item) => [item]), // Each chunk is 1 item
        slidesPerView: cols,
        cols,
        rows,
        isMobile,
        isMounted,
      };
    }

    // Multi Row Logic: Chunk the items into grid pages
    const pageSize = Math.floor(cols) * Math.floor(rows);
    const chunks: T[][] = [];

    if (pageSize > 0) {
      for (let i = 0; i < items.length; i += pageSize) {
        chunks.push(items.slice(i, i + pageSize));
      }
    } else {
      chunks.push(items);
    }

    return {
      chunks,
      slidesPerView: 1, // Swiper slides by whole pages
      cols,
      rows,
      isMobile,
      isMounted,
    };
  }, [items, config, width, isMounted]);
}
