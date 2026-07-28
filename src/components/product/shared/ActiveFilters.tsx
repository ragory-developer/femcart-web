"use client";
import { useProductFilters } from "@/hooks/useProductFilters";
import { X, RotateCcw } from "lucide-react";

export default function ActiveFilters() {
  const {
    filters,
    applyFilters,
    clearAll,
    toggleBrand,
    toggleCategory,
    toggleAttribute,
    setMinRating,
  } = useProductFilters();

  const activeChips: { id: string; label: string; onRemove: () => void }[] = [];

  if (filters.search) {
    activeChips.push({
      id: "search",
      label: `Search: "${filters.search}"`,
      onRemove: () => applyFilters({ search: "" }),
    });
  }

  if (filters.category && filters.category.length > 0) {
    filters.category.forEach((c) => {
      if (c) {
        activeChips.push({
          id: `cat-${c}`,
          label: c,
          onRemove: () => toggleCategory(c),
        });
      }
    });
  }

  filters.brand.forEach((b) => {
    activeChips.push({
      id: `brand-${b}`,
      label: b,
      onRemove: () => toggleBrand(b),
    });
  });

  if (filters.minPrice || filters.maxPrice) {
    activeChips.push({
      id: "price",
      label: `Tk ${filters.minPrice || 0} - Tk ${filters.maxPrice || "Any"}`,
      onRemove: () => applyFilters({ minPrice: "", maxPrice: "" }),
    });
  }

  Object.entries(filters.attributes).forEach(([key, values]) => {
    values.forEach((val) => {
      activeChips.push({
        id: `attr-${key}-${val}`,
        label: val,
        onRemove: () => toggleAttribute(key, val),
      });
    });
  });

  if (filters.minRating) {
    activeChips.push({
      id: "rating",
      label: `${filters.minRating} Stars & Up`,
      onRemove: () => setMinRating(""),
    });
  }

  if (activeChips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-3 mb-10 pb-4 border-b border-gray-100 dark:border-gray-800">
      <span className="text-xs font-semibold text-gray-500 mr-2">
        Active Filters:
      </span>
      {activeChips.map((chip) => (
        <span
          key={chip.id}
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-full text-xs font-semibold text-emerald-700 dark:text-emerald-400 shadow-sm"
        >
          {chip.label}
          <button
            onClick={chip.onRemove}
            className="p-0.5 hover:bg-emerald-200 dark:hover:bg-emerald-500/30 rounded-full transition-colors"
          >
            <X size={12} className="text-emerald-700 dark:text-emerald-400" />
          </button>
        </span>
      ))}
      <button
        onClick={clearAll}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors ml-2"
      >
        <RotateCcw size={12} /> Clear Filter
      </button>
    </div>
  );
}
