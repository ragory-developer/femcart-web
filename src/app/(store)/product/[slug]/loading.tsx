import React from "react";
import { ProductDetailSkeleton } from "@/components/ui/skeletons/ProductDetailSkeleton";
import { SkeletonBase } from "@/components/ui/skeletons/SkeletonBase";

export default function ProductDetailLoading() {
  return (
    <div className="bg-white dark:bg-gray-950 min-h-[100dvh]">
      <div className="container mx-auto px-4 py-4 md:py-6 lg:py-8">
        {/* Breadcrumb Skeleton */}
        <div className="flex items-center gap-2 mb-6 md:mb-8 pb-2">
          <SkeletonBase className="w-12 h-4 rounded" />
          <SkeletonBase className="w-4 h-4 rounded" />
          <SkeletonBase className="w-16 h-4 rounded" />
          <SkeletonBase className="w-4 h-4 rounded" />
          <SkeletonBase className="w-20 h-4 rounded" />
          <SkeletonBase className="w-4 h-4 rounded" />
          <SkeletonBase className="w-32 h-4 rounded" />
        </div>

        {/* Product Detail Form Skeleton */}
        <ProductDetailSkeleton />
      </div>
    </div>
  );
}
