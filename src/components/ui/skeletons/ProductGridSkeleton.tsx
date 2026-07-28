import React from "react";
import { ProductCardSkeleton } from "./ProductCardSkeleton";
import { SkeletonBase } from "./SkeletonBase";

export function ProductGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="w-full">
      {/* Title Area Skeleton */}
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <SkeletonBase className="w-48 h-8 sm:h-10 rounded-lg" />
        <SkeletonBase className="w-24 h-6 rounded-full" />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
        {Array.from({ length: count }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
