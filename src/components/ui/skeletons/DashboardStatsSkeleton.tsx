import React from "react";
import { SkeletonBase } from "./SkeletonBase";

export function DashboardStatsSkeleton() {
  return (
    <div className="space-y-8 pb-10 w-full">
      {/* Header */}
      <div>
        <SkeletonBase className="w-64 h-10 rounded-lg mb-2" />
        <SkeletonBase className="w-96 h-5 rounded" />
      </div>

      {/* TOP TIER: Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {/* Core Financials */}
        <div className="xl:col-span-2 bg-white dark:bg-gray-900 rounded-[1.5rem] p-6 border border-gray-100 dark:border-gray-800 flex items-center gap-4">
          <SkeletonBase className="w-14 h-14 rounded-md shrink-0" />
          <div className="space-y-2 flex-1">
            <SkeletonBase className="w-24 h-3 rounded" />
            <SkeletonBase className="w-32 h-8 rounded" />
            <SkeletonBase className="w-40 h-3 rounded" />
          </div>
        </div>

        {/* Other 4 Metrics */}
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-900 rounded-[1.5rem] p-6 border border-gray-100 dark:border-gray-800"
          >
            <div className="flex items-center gap-2 mb-3">
              <SkeletonBase className="w-4 h-4 rounded-full" />
              <SkeletonBase className="w-20 h-3 rounded" />
            </div>
            <SkeletonBase className="w-16 h-7 rounded" />
          </div>
        ))}
      </div>

      {/* MIDDLE TIER: Advanced Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main Chart */}
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-100 dark:border-gray-800">
          <SkeletonBase className="w-48 h-6 rounded mb-6" />
          <SkeletonBase className="w-full h-[300px] rounded-xl" />
        </div>

        {/* Funnel */}
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-100 dark:border-gray-800">
          <SkeletonBase className="w-56 h-6 rounded mb-2" />
          <SkeletonBase className="w-40 h-4 rounded mb-6" />
          <div className="h-[276px] w-full flex flex-col justify-around">
            <SkeletonBase className="w-full h-8 rounded-r" />
            <SkeletonBase className="w-4/5 h-8 rounded-r" />
            <SkeletonBase className="w-3/5 h-8 rounded-r" />
            <SkeletonBase className="w-1/3 h-8 rounded-r" />
          </div>
        </div>

        {/* Retention Area Chart */}
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-100 dark:border-gray-800">
          <SkeletonBase className="w-48 h-6 rounded mb-2" />
          <SkeletonBase className="w-40 h-4 rounded mb-6" />
          <SkeletonBase className="w-full h-[276px] rounded-xl" />
        </div>

        {/* Split Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Donut Chart */}
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-100 dark:border-gray-800 flex flex-col items-center">
            <SkeletonBase className="w-32 h-5 rounded mb-4" />
            <SkeletonBase className="w-32 h-32 rounded-full" />
            <SkeletonBase className="w-24 h-3 rounded mt-4" />
          </div>
          {/* Top Traffic */}
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-100 dark:border-gray-800 flex flex-col">
            <SkeletonBase className="w-32 h-5 rounded mb-4" />
            <div className="space-y-4 flex-1 mt-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex justify-between items-center">
                  <div className="space-y-1">
                    <SkeletonBase className="w-24 h-3 rounded" />
                    <SkeletonBase className="w-16 h-2 rounded" />
                  </div>
                  <div className="space-y-1 flex flex-col items-end">
                    <SkeletonBase className="w-10 h-3 rounded" />
                    <SkeletonBase className="w-8 h-2 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* LOWER TIER: Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-100 dark:border-gray-800"
          >
            <div className="flex justify-between items-center mb-6">
              <SkeletonBase className="w-40 h-6 rounded" />
              <SkeletonBase className="w-16 h-4 rounded" />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between border-b border-gray-100 dark:border-gray-800 pb-2">
                <SkeletonBase className="w-16 h-3 rounded" />
                <SkeletonBase className="w-16 h-3 rounded" />
                <SkeletonBase className="w-16 h-3 rounded" />
              </div>

              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex justify-between py-2">
                  <SkeletonBase className="w-24 h-4 rounded" />
                  <SkeletonBase className="w-16 h-4 rounded" />
                  <SkeletonBase className="w-16 h-4 rounded" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
