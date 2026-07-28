import React from "react";
import { Image as ImageIcon } from "lucide-react";

interface Props {
  type: string;
  className?: string;
}

export function ComponentSkeleton({ type, className = "" }: Props) {
  switch (type) {
    case "Hero":
      return (
        <div
          className={`w-full flex gap-3 p-3 bg-gray-50 dark:bg-gray-900 pointer-events-none rounded-b-lg border-x border-b border-gray-200 dark:border-gray-800 ${className}`}
        >
          {/* Main Slider Area */}
          <div className="flex-1 aspect-[21/9] bg-gray-200 dark:bg-gray-700 rounded-xl relative overflow-hidden flex items-center shadow-inner border border-gray-300 dark:border-gray-600">
            <div className="absolute left-8 w-1/2 space-y-2">
              <div className="h-2 w-24 bg-gray-400 dark:bg-gray-500 rounded"></div>
              <div className="h-5 w-full bg-gray-400 dark:bg-gray-500 rounded"></div>
              <div className="h-3 w-3/4 bg-gray-300 dark:bg-gray-600 rounded"></div>
              <div className="h-6 w-24 bg-gray-500 dark:bg-gray-400 rounded-md mt-4"></div>
            </div>
            <div className="absolute right-8 bottom-4 flex gap-1">
              <div className="w-4 h-1 bg-gray-400 rounded-full"></div>
              <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
              <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
            </div>
          </div>
        </div>
      );
    case "TrustStrip":
      return (
        <div className={`w-full px-4 py-2 pointer-events-none ${className}`}>
          <div className="bg-white dark:bg-gray-800 rounded-[16px] shadow-sm border border-gray-200 dark:border-gray-700 py-4 px-4 flex justify-around items-center">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-pink-50 dark:bg-pink-900/20 flex items-center justify-center border border-pink-100 dark:border-pink-800/30">
                  <div className="w-3 h-3 bg-pink-300 dark:bg-pink-500/50 rounded-sm"></div>
                </div>
                <div className="h-1.5 w-16 bg-gray-200 dark:bg-gray-700 rounded hidden sm:block"></div>
              </div>
            ))}
          </div>
        </div>
      );
    case "Categories":
      return (
        <div
          className={`w-full p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 dark:bg-gray-900 pointer-events-none border-y border-gray-200 dark:border-gray-800 ${className}`}
        >
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 rounded-xl p-3 flex items-start gap-3 border border-gray-200 dark:border-gray-700 shadow-sm"
            >
              <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 shrink-0 border border-gray-200 dark:border-gray-600"></div>
              <div className="flex flex-col gap-1 w-full mt-1">
                <div className="h-2 w-3/4 bg-gray-400 dark:bg-gray-500 rounded"></div>
                <div className="h-1.5 w-1/2 bg-gray-300 dark:bg-gray-600 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      );
    case "FeaturedProducts":
    case "BestSellers":
    case "NewArrivals":
      return (
        <div
          className={`w-full p-4 bg-white dark:bg-gray-900 space-y-4 pointer-events-none border-y border-gray-200 dark:border-gray-800 ${className}`}
        >
          <div className="flex flex-col gap-1 border-b border-gray-100 dark:border-gray-800 pb-2">
            <div className="h-2 w-16 bg-gray-300 dark:bg-gray-700 rounded"></div>
            <div className="flex justify-between items-center">
              <div className="h-4 w-40 bg-gray-400 dark:bg-gray-500 rounded"></div>
              <div className="h-2 w-12 bg-gray-300 dark:bg-gray-700 rounded hidden sm:block"></div>
            </div>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="aspect-[3/4] bg-white dark:bg-gray-800 rounded-lg p-2 flex flex-col border border-gray-200 dark:border-gray-700 shadow-sm"
              >
                <div className="w-full aspect-square bg-gray-100 dark:bg-gray-700 rounded mb-2 border border-gray-200 dark:border-gray-600"></div>
                <div className="h-1.5 w-full bg-gray-300 dark:bg-gray-600 rounded mb-1"></div>
                <div className="h-1.5 w-2/3 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                <div className="mt-auto h-2 w-1/3 bg-gray-400 dark:bg-gray-500 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      );
    case "SizeBanner":
    case "LimitedOffers":
    case "PreOrder":
      return (
        <div
          className={`w-full p-4 pointer-events-none bg-gray-50 dark:bg-gray-900 border-y border-gray-200 dark:border-gray-800 flex flex-col gap-4 ${className}`}
        >
          <div className="w-full aspect-[5/1] bg-gray-200 dark:bg-gray-800 rounded-2xl flex items-center px-8 justify-between overflow-hidden relative shadow-sm border border-gray-300 dark:border-gray-700">
            <div className="space-y-2 relative z-10">
              <div className="h-2 w-16 bg-gray-400 rounded"></div>
              <div className="h-5 w-48 bg-gray-500 rounded"></div>
              <div className="h-2 w-32 bg-gray-400 rounded"></div>
            </div>
            <div className="w-32 h-32 bg-white/20 dark:bg-gray-600/50 rounded-full absolute right-12 scale-150"></div>
          </div>
        </div>
      );
    case "Reviews":
      return (
        <div
          className={`w-full p-6 bg-gray-50 dark:bg-gray-900 space-y-6 pointer-events-none border-y border-gray-200 dark:border-gray-800 ${className}`}
        >
          <div className="flex flex-col items-center gap-1">
            <div className="h-2 w-16 bg-gray-300 dark:bg-gray-600 rounded"></div>
            <div className="h-5 w-48 bg-gray-400 dark:bg-gray-500 rounded"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 rounded-2xl p-4 flex flex-col border border-gray-200 dark:border-gray-700 shadow-sm"
              >
                <div className="flex gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <div
                      key={s}
                      className="w-2.5 h-2.5 rounded-full bg-gray-300 dark:bg-gray-600"
                    ></div>
                  ))}
                </div>
                <div className="space-y-1.5 mb-4">
                  <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-1.5 w-3/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
                <div className="flex items-center gap-2 mt-auto">
                  <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                  <div className="space-y-1">
                    <div className="h-1.5 w-16 bg-gray-300 dark:bg-gray-600 rounded"></div>
                    <div className="h-1 w-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    default:
      return (
        <div
          className={`w-full h-20 flex flex-col items-center justify-center bg-white dark:bg-gray-800 space-y-2 pointer-events-none rounded-b-lg border-x border-b border-gray-200 dark:border-gray-700 ${className}`}
        >
          <ImageIcon size={20} className="text-gray-300" />
          <span className="text-[10px] text-gray-400 font-mono uppercase tracking-wider">
            {type}
          </span>
        </div>
      );
  }
}
