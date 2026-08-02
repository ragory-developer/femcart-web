"use client";

import { Filter, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import ProductFilters from "./ProductFilters";
import { AnimatePresence, motion } from "framer-motion";

export default function ProductToolbar({
  totalProducts,
}: {
  totalProducts: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const currentSort = searchParams.get("sort") || "featured";

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const newParams = new URLSearchParams(searchParams.toString());
    if (value === "featured") {
      newParams.delete("sort");
    } else {
      newParams.set("sort", value);
    }
    router.push(`${pathname}?${newParams.toString()}`);
  };

  return (
    <>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center justify-between w-full sm:w-auto gap-4">
          <button
            className="lg:hidden flex flex-1 justify-center items-center gap-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-4 py-2.5 rounded-xl text-sm font-bold tracking-wide border border-emerald-100 dark:border-emerald-800"
            onClick={() => setIsMobileFilterOpen(true)}
          >
            <Filter size={16} /> Filters
          </button>

          <span className="hidden sm:inline-block text-sm font-bold text-gray-500 uppercase tracking-widest bg-gray-50 dark:bg-gray-800 px-3 py-1 rounded-lg">
            {totalProducts} Products
          </span>
        </div>

        <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3 p-2 sm:p-0 bg-gray-50 dark:bg-transparent rounded-xl sm:rounded-none">
          <span className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest sm:ml-0 ml-2">
            Sort by:
          </span>
          <select
            value={currentSort}
            onChange={handleSortChange}
            className="bg-white dark:bg-gray-800 font-bold text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-700 rounded-lg outline-none cursor-pointer text-sm px-3 py-1.5 focus:border-emerald-500 transition-colors"
          >
            <option value="featured">Featured First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="newest">Latest Arrivals</option>
          </select>
        </div>
      </div>

      {/* Mobile Filter Drawer (Native Bottom Sheet Style) */}
      <AnimatePresence>
        {isMobileFilterOpen && (
          <div className="fixed inset-0 z-[130] flex flex-col justify-end lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsMobileFilterOpen(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full h-[85vh] bg-white dark:bg-gray-900 shadow-2xl flex flex-col overflow-hidden rounded-t-3xl"
            >
              <div className="flex justify-center pt-3 pb-1 bg-white dark:bg-gray-900">
                <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full" />
              </div>
              <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Filters & Sort
                </h2>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <X size={20} className="text-gray-900 dark:text-white" />
                </button>
              </div>
              <div className="p-4 flex-1 overflow-y-auto">
                <ProductFilters onClose={() => setIsMobileFilterOpen(false)} />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Filter Pull Tab */}
      <button
        className="lg:hidden fixed bottom-[56px] md:bottom-0 left-1/2 -translate-x-1/2 z-[90] flex flex-col items-center justify-center gap-1 bg-pink-600 text-white px-8 pt-1.5 pb-2 rounded-t-xl shadow-[0_-8px_15px_-3px_rgba(219,39,119,0.3)] transition-transform hover:-translate-y-1"
        onClick={() => setIsMobileFilterOpen(true)}
      >
        <div className="w-8 h-1 bg-white/50 rounded-full" />
        <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
          <Filter size={12} /> Filters
        </span>
      </button>
    </>
  );
}
