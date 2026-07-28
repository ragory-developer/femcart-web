import React from "react";
import { SkeletonBase } from "./SkeletonBase";

export function TableSkeleton({
  rows = 5,
  cols = 5,
}: {
  rows?: number;
  cols?: number;
}) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-6 sm:p-8 border border-gray-100 dark:border-gray-800 shadow-sm w-full">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="space-y-2">
          <SkeletonBase className="w-48 h-8 rounded-lg" />
          <SkeletonBase className="w-64 h-4 rounded" />
        </div>
        <div className="flex gap-3">
          <SkeletonBase className="w-24 h-10 rounded-xl" />
          <SkeletonBase className="w-32 h-10 rounded-xl" />
        </div>
      </div>

      {/* Toolbar / Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <SkeletonBase className="w-full sm:w-72 h-12 rounded-xl" />
        <SkeletonBase className="w-full sm:w-40 h-12 rounded-xl" />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800">
              {Array.from({ length: cols }).map((_, i) => (
                <th key={i} className="pb-4 pr-4">
                  <SkeletonBase className="w-16 h-3 rounded" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr key={rowIndex}>
                {Array.from({ length: cols }).map((_, colIndex) => (
                  <td key={colIndex} className="py-4 pr-4">
                    {colIndex === 0 ? (
                      <div className="flex items-center gap-3">
                        <SkeletonBase className="w-10 h-10 rounded-lg shrink-0" />
                        <div className="space-y-2">
                          <SkeletonBase className="w-24 h-4 rounded" />
                          <SkeletonBase className="w-16 h-3 rounded" />
                        </div>
                      </div>
                    ) : (
                      <SkeletonBase className="w-20 h-4 rounded" />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
        <SkeletonBase className="w-32 h-4 rounded" />
        <div className="flex gap-2">
          <SkeletonBase className="w-8 h-8 rounded-lg" />
          <SkeletonBase className="w-8 h-8 rounded-lg" />
          <SkeletonBase className="w-8 h-8 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
