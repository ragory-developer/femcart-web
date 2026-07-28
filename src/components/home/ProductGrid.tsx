"use client";

import React from "react";
import ProductCard from "./ProductCard";

interface ProductGridProps {
  products: any[];
  columnsDesktop?: number;
  columnsTablet?: number;
  columnsMobile?: number;
}

export default function ProductGrid({
  products,
  columnsDesktop = 4,
  columnsTablet = 3,
  columnsMobile = 2,
}: ProductGridProps) {
  if (!products?.length) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product, idx) => (
        <ProductCard key={product.id || idx} product={product} />
      ))}
    </div>
  );
}
