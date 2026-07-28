"use client";
import React from "react";
import { SkeletonBase } from "./SkeletonBase";

import { useSettingsStore } from "@/store/settingsStore";

export function ProductCardSkeleton({
  variant: propVariant,
  radius: propRadius,
}: {
  variant?:
    | "classic"
    | "sleek"
    | "minimal"
    | "festive"
    | "bordered"
    | "neumorphic"
    | "horizontal";
  radius?: "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "full";
}) {
  const { settings } = useSettingsStore();
  const variant =
    propVariant ?? (settings.productCardVariant as any) ?? "classic";
  const radius = propRadius ?? (settings.productCardRadius as any) ?? "3xl";
  const showAddToCart = settings.productCardShowAddToCart ?? true;

  const radiusClasses: Record<string, string> = {
    none: "rounded-none",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    "2xl": "rounded-sm",
    "3xl": "rounded-md",
    full: "rounded-xl",
  };
  const cardRadiusClass = radiusClasses[radius] || "rounded-md";

  const imageRadiusClasses: Record<string, string> = {
    none: "rounded-none",
    sm: "rounded-t-sm",
    md: "rounded-t-md",
    lg: "rounded-t-lg",
    xl: "rounded-t-xl",
    "2xl": "rounded-t-2xl",
    "3xl": "rounded-t-3xl",
    full: "rounded-t-[2rem]",
  };
  const imageRadiusClass = imageRadiusClasses[radius] || "rounded-t-3xl";

  const isHorizontal = variant === "horizontal";

  return (
    <div
      className={`group h-full flex overflow-hidden relative ${cardRadiusClass} ${
        isHorizontal ? "flex-row items-center h-auto min-h-[140px]" : "flex-col"
      } ${
        variant === "classic" || isHorizontal
          ? "bg-white dark:bg-gray-900 border border-gray-100/70 dark:border-gray-800 shadow-[0_4px_24px_-6px_rgba(0,0,0,0.05)]"
          : variant === "bordered"
            ? "bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700"
            : "bg-gray-50 dark:bg-gray-800"
      }`}
    >
      {/* Image Area */}
      <div
        className={`relative block overflow-hidden ${
          isHorizontal ? "w-[120px] shrink-0" : ""
        } ${imageRadiusClass}`}
      >
        {/* Badge Skeleton */}
        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
          <SkeletonBase className="w-10 h-4 rounded-full bg-black/10 dark:bg-white/10" />
        </div>

        <SkeletonBase
          className={`aspect-square w-full ${isHorizontal ? "w-[120px]" : ""}`}
        />
      </div>

      {/* Body Content */}
      <div
        className={`flex flex-col flex-1 gap-2 ${
          isHorizontal ? "p-2 sm:p-3 pl-1" : "p-3 sm:p-4"
        }`}
      >
        {/* Category */}
        <SkeletonBase className="w-16 h-3 rounded bg-pink-500/10 dark:bg-pink-500/20" />

        {/* Title (2 lines) */}
        <div className="space-y-1.5 mt-1">
          <SkeletonBase className="w-full h-4 rounded" />
          <SkeletonBase className="w-2/3 h-4 rounded" />
        </div>

        {/* Rating */}
        <SkeletonBase className="w-20 h-3 mt-1 rounded" />

        <div className="flex-1" />

        {/* Price & Cart button for sleek/minimal/festive */}
        <div className="flex items-center justify-between mt-2">
          <SkeletonBase className="w-16 h-5 rounded" />
          {variant !== "horizontal" && showAddToCart && (
            <SkeletonBase className="w-8 h-8 rounded-full" />
          )}
        </div>
      </div>
    </div>
  );
}
