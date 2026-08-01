"use client";

import { event } from "@/lib/fpixel";
import { useEffect } from "react";

interface ProductViewTrackerProps {
  product: {
    id: string;
    name: string;
    price: number | string;
    categories?: { name: string }[];
  };
}

export default function ProductViewTracker({
  product,
}: ProductViewTrackerProps) {
  useEffect(() => {
    // 1. Trigger Facebook Pixel Event
    event("ViewContent", {
      content_name: product.name,
      content_category: product.categories?.[0]?.name || "Uncategorized",
      content_ids: [product.id],
      content_type: "product",
      value: Number(product.price) || 0,
      currency: "BDT",
    });

    // 2. Force scroll to top instantly with safety checks
    if (typeof window !== "undefined") {
      const resetScroll = () => {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" as any });
        const lenis = (window as any).lenis;
        if (lenis && typeof lenis.scrollTo === "function") {
          try {
            lenis.scrollTo(0, { immediate: true });
          } catch (e) {}
        }
      };

      resetScroll();
      const timer = setTimeout(resetScroll, 50);
      return () => clearTimeout(timer);
    }
  }, [product]);

  return null;
}
