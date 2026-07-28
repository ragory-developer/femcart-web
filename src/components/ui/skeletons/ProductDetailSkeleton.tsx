import React from "react";
import { SkeletonBase } from "./SkeletonBase";

export function ProductDetailSkeleton() {
  return (
    <div className="w-full">
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8 xl:gap-10 max-w-full">
        {/* Column 1: Image Gallery (~35%) */}
        <div className="w-full lg:w-[35%] xl:w-[35%] flex flex-col gap-[clamp(1rem,2vw,1.5rem)]">
          <div className="aspect-square w-full rounded-[clamp(1.5rem,4vw,2.5rem)] overflow-hidden relative">
            <SkeletonBase className="w-full h-full" />
          </div>

          {/* Thumbnails */}
          <div className="flex gap-[clamp(0.5rem,2vw,1rem)] overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonBase
                key={i}
                className="w-[clamp(4rem,10vw,4.5rem)] aspect-square rounded-[clamp(0.75rem,2vw,1rem)] shrink-0"
              />
            ))}
          </div>
        </div>

        {/* Column 2: Main Info (~40%) */}
        <div className="w-full lg:w-[40%] xl:w-[40%] flex flex-col">
          {/* Category/Brand */}
          <div className="flex items-center gap-3 mb-3">
            <SkeletonBase className="w-20 h-6 rounded-sm" />
            <SkeletonBase className="w-16 h-6 rounded-sm" />
          </div>

          {/* Title */}
          <div className="mb-4 space-y-2">
            <SkeletonBase className="w-full h-8 sm:h-10 lg:h-12 rounded-sm" />
            <SkeletonBase className="w-3/4 h-8 sm:h-10 lg:h-12 rounded-sm" />
          </div>

          {/* Rating & Reviews */}
          <div className="flex items-center gap-4 mb-2">
            <SkeletonBase className="w-16 h-6 rounded-sm" />
            <SkeletonBase className="w-24 h-4 rounded-sm" />
          </div>

          {/* Tags / Stock */}
          <div className="flex items-center gap-2 mb-3">
            <SkeletonBase className="w-20 h-6 rounded-sm" />
            <SkeletonBase className="w-16 h-5 rounded-sm" />
          </div>

          {/* Price */}
          <div className="mb-4 mt-2">
            <SkeletonBase className="w-32 h-10 sm:h-12 lg:h-14 rounded-sm" />
          </div>

          {/* Variants */}
          <div className="mb-6 mt-4">
            <SkeletonBase className="w-24 h-4 rounded-sm mb-5" />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonBase key={i} className="w-full h-16 rounded-sm" />
              ))}
            </div>
          </div>

          {/* Add to Cart */}
          <div className="mb-4">
            <SkeletonBase className="w-full sm:w-3/4 lg:w-full h-14 rounded-md" />
          </div>
        </div>

        {/* Column 3: Side Panel (~25%) */}
        <div className="w-full lg:w-[25%] xl:w-[25%] flex flex-col gap-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded p-5 sm:p-6 shadow-sm lg:sticky lg:top-24">
            {/* SKU */}
            <div className="flex flex-col gap-3 mb-4">
              <SkeletonBase className="w-full h-16 rounded-sm" />
              <SkeletonBase className="w-full h-16 rounded-sm" />
            </div>

            {/* Features */}
            <div className="flex flex-col gap-3 mt-4">
              <SkeletonBase className="w-full h-14 rounded-sm" />
              <SkeletonBase className="w-full h-14 rounded-sm" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Description & Specs */}
      <div className="mt-12 lg:mt-16 w-full max-w-4xl mx-auto xl:mx-0 xl:max-w-5xl">
        <div className="mb-8">
          <SkeletonBase className="w-1/3 h-8 rounded-sm mb-4" />
          <div className="space-y-3">
            <SkeletonBase className="w-full h-5 rounded-sm" />
            <SkeletonBase className="w-11/12 h-5 rounded-sm" />
            <SkeletonBase className="w-4/5 h-5 rounded-sm" />
            <SkeletonBase className="w-full h-5 rounded-sm" />
            <SkeletonBase className="w-3/4 h-5 rounded-sm" />
          </div>
        </div>
        <div className="mb-8 mt-12">
          <SkeletonBase className="w-1/4 h-6 rounded-sm mb-4" />
          <div className="space-y-3">
            <SkeletonBase className="w-full h-10 rounded-sm" />
            <SkeletonBase className="w-full h-10 rounded-sm" />
            <SkeletonBase className="w-full h-10 rounded-sm" />
          </div>
        </div>
      </div>
    </div>
  );
}
