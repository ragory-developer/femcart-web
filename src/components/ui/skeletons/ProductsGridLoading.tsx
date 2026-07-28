import React from "react";
import { ProductCardSkeleton } from "./ProductCardSkeleton";
import { SkeletonBase } from "./SkeletonBase";

interface Props {
  isSection?: boolean;
}

export function ProductsGridLoading({ isSection = false }: Props = {}) {
  if (isSection) {
    return (
      <div className="container mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col items-center mb-8">
          <SkeletonBase className="w-64 h-8 rounded mb-2" />
          <SkeletonBase className="w-40 h-4 rounded" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-[100dvh] py-12">
      <div className="container mx-auto px-4">
        {/* Header Skeleton */}
        <div className="mb-12">
          <SkeletonBase className="w-32 h-4 rounded mb-4" />
          <SkeletonBase className="w-64 sm:w-96 h-10 sm:h-14 lg:h-16 rounded mt-2 mb-3" />
          <SkeletonBase className="w-full max-w-xl h-5 rounded" />
          <SkeletonBase className="w-4/5 max-w-lg h-5 rounded mt-2" />
        </div>

        <div className="flex flex-col lg:flex-row gap-12 mb-20">
          {/* Sidebar Filters Skeleton - Desktop only */}
          <aside className="hidden lg:block sticky top-8 h-fit">
            <SkeletonBase className="w-72 h-[600px] rounded-lg" />
          </aside>

          {/* Main Content Skeleton */}
          <div className="flex-1">
            {/* Toolbar Skeleton */}
            <SkeletonBase className="h-16 w-full rounded-md mb-8" />

            {/* Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
