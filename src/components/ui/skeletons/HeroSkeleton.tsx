import React from "react";
import { SkeletonBase } from "./SkeletonBase";

export function HeroSkeleton() {
  return (
    <div className="relative w-full overflow-hidden bg-pink-50 dark:bg-gray-900 min-h-[350px] sm:min-h-[500px] lg:min-h-[650px] flex items-center rounded-xl sm:rounded-lg mx-4 sm:mx-6 lg:mx-8 my-4 sm:my-6 lg:my-8 border border-pink-100 dark:border-gray-800">
      {/* Background Gradient Shimmer */}
      <SkeletonBase className="absolute inset-0 w-full h-full opacity-20" />

      <div className="container mx-auto px-4 sm:px-10 lg:px-16 relative z-10">
        <div className="flex flex-col md:flex-row items-center py-8 sm:py-16 md:py-0 w-full">
          {/* Left Content Area */}
          <div className="md:w-1/2 flex flex-col pb-12 sm:pb-16 md:pb-0">
            {/* Badge */}
            <SkeletonBase className="w-32 h-8 sm:h-10 rounded-full bg-pink-900/10 dark:bg-white/10 mb-4 sm:mb-6" />

            {/* Title */}
            <div className="space-y-2 sm:space-y-4 mb-3 sm:mb-4">
              <SkeletonBase className="w-full h-10 sm:h-14 lg:h-20 rounded bg-pink-900/10 dark:bg-white/20" />
              <SkeletonBase className="w-4/5 h-10 sm:h-14 lg:h-20 rounded bg-pink-900/10 dark:bg-white/20" />
            </div>

            {/* Subtitle */}
            <SkeletonBase className="w-2/3 h-6 sm:h-8 lg:h-10 rounded bg-pink-900/5 dark:bg-white/10 mb-6 sm:mb-8" />

            {/* Description */}
            <div className="space-y-2 mb-8 sm:mb-10 max-w-md">
              <SkeletonBase className="w-full h-4 sm:h-5 rounded bg-pink-900/5 dark:bg-white/10" />
              <SkeletonBase className="w-11/12 h-4 sm:h-5 rounded bg-pink-900/5 dark:bg-white/10" />
              <SkeletonBase className="w-4/5 h-4 sm:h-5 rounded bg-pink-900/5 dark:bg-white/10" />
            </div>

            {/* CTA Button */}
            <SkeletonBase className="w-40 sm:w-48 h-12 sm:h-14 rounded-full bg-pink-900/15 dark:bg-white/20" />
          </div>

          {/* Right Image Area */}
          <div className="md:w-1/2 flex justify-center mt-8 md:mt-0 relative w-full h-full hidden md:flex min-h-[300px]">
            <SkeletonBase className="w-[80%] aspect-square rounded-full bg-pink-900/10 dark:bg-white/10 blur-xl absolute" />
          </div>
        </div>
      </div>
    </div>
  );
}
