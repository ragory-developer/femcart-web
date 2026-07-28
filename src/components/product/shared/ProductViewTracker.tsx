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
    event("ViewContent", {
      content_name: product.name,
      content_category: product.categories?.[0]?.name || "Uncategorized",
      content_ids: [product.id],
      content_type: "product",
      value: Number(product.price) || 0,
      currency: "BDT",
    });
  }, [product]);

  return null;
}
