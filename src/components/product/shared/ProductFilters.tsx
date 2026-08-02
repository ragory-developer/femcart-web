"use client";
import { API_URL } from "@/lib/config";
import { ChevronDown, Search, Check, Star } from "lucide-react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { useEffect, useState } from "react";
import { useProductFilters } from "@/hooks/useProductFilters";
import { motion, AnimatePresence } from "framer-motion";

export default function ProductFilters({
  onClose,
  hideCategoryFilter = false,
}: {
  onClose?: () => void;
  hideCategoryFilter?: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const {
    filters,
    applyFilters,
    toggleBrand,
    toggleCategory,
    toggleAttribute,
    setPriceRange,
    setMinRating,
  } = useProductFilters();

  const scrollableClass =
    "pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 dark:[&::-webkit-scrollbar-thumb]:bg-gray-800 [&::-webkit-scrollbar-thumb]:rounded-full";

  const sectionWindowClass = "mb-8";

  const [filterData, setFilterData] = useState<any>({
    priceRange: { min: 0, max: 50000 },
    brands: [],
    categories: [],
    specifications: [],
  });
  const [loading, setLoading] = useState(true);

  const [localMinPrice, setLocalMinPrice] = useState(filters.minPrice);
  const [localMaxPrice, setLocalMaxPrice] = useState(filters.maxPrice);
  const [localSearch, setLocalSearch] = useState(filters.search);

  console.log(
    "DEBUG ProductFilters: filters.minPrice =",
    filters.minPrice,
    "localMinPrice =",
    localMinPrice,
  );

  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    price: true,
    categories: true,
    brands: true,
    rating: true,
  });

  useEffect(() => {
    setLocalMinPrice(filters.minPrice);
    setLocalMaxPrice(filters.maxPrice);
    setLocalSearch(filters.search);
  }, [filters.minPrice, filters.maxPrice, filters.search]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // Only apply if the values make sense (min <= max) and have actually changed
      const numMin = Number(localMinPrice) || 0;
      const numMax = Number(localMaxPrice) || 0;

      if (numMin <= numMax) {
        if (
          localMinPrice !== filters.minPrice ||
          localMaxPrice !== filters.maxPrice
        ) {
          setPriceRange(localMinPrice, localMaxPrice);
        }
      }
    }, 600);
    return () => clearTimeout(timeoutId);
  }, [
    localMinPrice,
    localMaxPrice,
    filters.minPrice,
    filters.maxPrice,
    setPriceRange,
  ]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (localSearch !== filters.search) {
        applyFilters({ search: localSearch });
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [localSearch, filters.search, applyFilters]);

  // Negative guards and parsing logic for price inputs
  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === "") {
      setLocalMinPrice("");
      return;
    }
    const val = Math.max(0, parseInt(raw) || 0);
    setLocalMinPrice(val.toString());
  };

  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === "") {
      setLocalMaxPrice("");
      return;
    }
    const val = Math.max(0, parseInt(raw) || 0);
    setLocalMaxPrice(val.toString());
  };

  const handlePriceBlur = () => {
    const numMin = Number(localMinPrice) || 0;
    const numMax = Number(localMaxPrice) || 0;
    if (numMin > numMax && localMaxPrice !== "") {
      setLocalMinPrice(localMaxPrice);
    }
  };

  useEffect(() => {
    const fetchDynamicFilters = async () => {
      try {
        const queryParams = new URLSearchParams(searchParams.toString());

        // Scope filters to the current category page if on one
        if (pathname.startsWith("/categories/")) {
          const catSlug = pathname.split("/")[2];
          if (catSlug && catSlug !== "page") {
            queryParams.set("category", catSlug);
          }
        }

        // Scope filters to the current brand page if on one
        if (pathname.startsWith("/brands/")) {
          const brandSlug = pathname.split("/")[2];
          if (brandSlug && brandSlug !== "page") {
            queryParams.set("brand", brandSlug);
          }
        }

        const query = queryParams.toString();
        const res = await fetch(
          `${API_URL}/api/products/filters${query ? `?${query}` : ""}`,
        );
        const json = await res.json();
        if (json.success) {
          setFilterData(json.data);
          const specsToExpand: Record<string, boolean> = {};
          json.data.specifications.forEach((s: any) => {
            specsToExpand[s.name] = true;
          });
          setExpandedSections((prev) => ({ ...prev, ...specsToExpand }));
        }
      } catch (error) {
        console.error("Failed to fetch dynamic filters:", error);
      } finally {
        setLoading(false);
      }
    };

    const timeout = setTimeout(() => {
      fetchDynamicFilters();
    }, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, filters.search]);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  if (loading && !filterData.categories.length) {
    return (
      <div className="animate-pulse space-y-4 pr-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-16 bg-gray-100 dark:bg-gray-800 w-full rounded-lg"
          />
        ))}
      </div>
    );
  }

  const { priceRange, categories, brands, specifications } = filterData;

  const isColor = (name: string) => name.toLowerCase() === "color";
  const isSize = (name: string) => name.toLowerCase() === "size";

  // Section Header Sub-component
  const SectionHeader = ({
    title,
    section,
    isExpanded,
  }: {
    title: string;
    section: string;
    isExpanded: boolean;
  }) => (
    <button
      onClick={() => toggleSection(section)}
      className="w-full flex items-center justify-between text-xs font-black uppercase tracking-widest text-gray-900 dark:text-white hover:text-pink-500 transition-colors group text-left outline-none"
    >
      <span className="group-hover:translate-x-0.5 transition-transform duration-200">
        {title}
      </span>
      <ChevronDown
        size={14}
        className={`transform transition-transform duration-300 ${
          isExpanded
            ? "rotate-180 text-pink-500"
            : "text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300"
        }`}
      />
    </button>
  );

  return (
    <div className="flex flex-col w-full shrink-0 pb-12 lg:pb-0 font-sans">
      {/* Search Input Window */}
      <div className={sectionWindowClass}>
        <div className="relative flex items-center gap-4">
          <div className="relative flex-1 group">
            <input
              type="text"
              placeholder="Search products..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm font-medium text-gray-900 dark:text-white outline-none focus:border-pink-500 dark:focus:border-pink-400 focus:ring-4 focus:ring-pink-500/10 hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-300 placeholder:text-gray-400"
            />
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-pink-500 transition-colors"
            />
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-pink-100 hover:text-pink-600 transition-colors"
            >
              <ChevronDown size={18} className="rotate-90" />
            </button>
          )}
        </div>
      </div>

      {/* Categories Window */}
      {!hideCategoryFilter && categories.length > 0 && (
        <div className={sectionWindowClass}>
          <SectionHeader
            title="Categories"
            section="categories"
            isExpanded={expandedSections.categories}
          />
          <AnimatePresence initial={false}>
            {expandedSections.categories && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className={`pt-4 pb-1 space-y-3.5 ${scrollableClass}`}>
                  {categories.map((cat: any) => {
                    const selected = filters.category.includes(cat.slug);
                    return (
                      <label
                        key={cat.id}
                        className="flex items-center justify-between cursor-pointer group"
                        onClick={() => toggleCategory(cat.slug)}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-[18px] h-[18px] rounded-md border flex items-center justify-center shrink-0 transition-all duration-200 ${
                              selected
                                ? "border-pink-500 bg-pink-500 text-white shadow-sm shadow-pink-500/10"
                                : "border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 group-hover:border-pink-500"
                            }`}
                          >
                            {selected && (
                              <Check size={12} className="stroke-[3]" />
                            )}
                          </div>
                          <span
                            className={`text-[13px] font-medium transition-colors duration-200 ${
                              selected
                                ? "text-pink-600 dark:text-pink-400 font-bold"
                                : "text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                            }`}
                          >
                            {cat.name}
                          </span>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors duration-200 ${
                            selected
                              ? "bg-pink-50 text-pink-600 dark:bg-pink-950/40 dark:text-pink-400"
                              : "bg-gray-50 text-gray-400 dark:bg-gray-900/60 group-hover:bg-pink-50 dark:group-hover:bg-pink-950/20 group-hover:text-pink-600 dark:group-hover:text-pink-400"
                          }`}
                        >
                          {cat.count}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Brands Window */}
      {brands.length > 0 && (
        <div className={sectionWindowClass}>
          <SectionHeader
            title="Brands"
            section="brands"
            isExpanded={expandedSections.brands}
          />
          <AnimatePresence initial={false}>
            {expandedSections.brands && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className={`pt-4 pb-1 space-y-3.5 ${scrollableClass}`}>
                  {brands.map((brand: any) => {
                    const selected = filters.brand.includes(brand.slug);
                    return (
                      <label
                        key={brand.id}
                        className="flex items-center justify-between cursor-pointer group"
                        onClick={() => toggleBrand(brand.slug)}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-[18px] h-[18px] rounded-md border flex items-center justify-center shrink-0 transition-all duration-200 ${
                              selected
                                ? "border-pink-500 bg-pink-500 text-white shadow-sm shadow-pink-500/10"
                                : "border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 group-hover:border-pink-500"
                            }`}
                          >
                            {selected && (
                              <Check size={12} className="stroke-[3]" />
                            )}
                          </div>
                          <span
                            className={`text-[13px] font-medium transition-colors duration-200 ${
                              selected
                                ? "text-pink-600 dark:text-pink-400 font-bold"
                                : "text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                            }`}
                          >
                            {brand.name}
                          </span>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors duration-200 ${
                            selected
                              ? "bg-pink-50 text-pink-600 dark:bg-pink-950/40 dark:text-pink-400"
                              : "bg-gray-50 text-gray-400 dark:bg-gray-900/60 group-hover:bg-pink-50 dark:group-hover:bg-pink-950/20 group-hover:text-pink-600 dark:group-hover:text-pink-400"
                          }`}
                        >
                          {brand.count}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Dynamic Attributes Windows */}
      {specifications.map((spec: any) => {
        const _isColor = isColor(spec.name);
        const _isSize = isSize(spec.name);

        return (
          <div key={spec.name} className={sectionWindowClass}>
            <SectionHeader
              title={spec.name}
              section={spec.name}
              isExpanded={expandedSections[spec.name]}
            />
            <AnimatePresence initial={false}>
              {expandedSections[spec.name] && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div
                    className={`pt-4 pb-1 ${_isColor ? `flex flex-wrap gap-3 ${scrollableClass}` : _isSize ? `flex flex-wrap gap-2.5 ${scrollableClass}` : `space-y-3.5 ${scrollableClass}`}`}
                  >
                    {[...spec.values]
                      .sort((a, b) =>
                        a.value.localeCompare(b.value, undefined, {
                          numeric: true,
                          sensitivity: "base",
                        }),
                      )
                      .map((v: any) => {
                        const selected = (
                        filters.attributes[spec.name] || []
                      ).includes(v.value);

                      if (_isColor) {
                        return (
                          <button
                            key={v.value}
                            onClick={() => toggleAttribute(spec.name, v.value)}
                            className={`px-3 py-1.5 min-w-[2.5rem] rounded-xl text-xs font-bold border transition-all duration-300 hover:scale-[1.02] ${
                              selected
                                ? "border-pink-500 bg-pink-50 text-pink-700 dark:bg-pink-950/40 dark:text-pink-400 shadow-sm shadow-pink-500/10"
                                : "border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-pink-500 dark:hover:border-pink-500 hover:text-pink-600 dark:hover:text-pink-400 bg-white dark:bg-gray-900"
                            }`}
                            title={`${v.value} (${v.count})`}
                          >
                            {v.value}
                          </button>
                        );
                      }

                      if (_isSize) {
                        return (
                          <button
                            key={v.value}
                            onClick={() => toggleAttribute(spec.name, v.value)}
                            className={`px-3 py-1.5 min-w-[2.5rem] rounded-xl text-xs font-bold border transition-all duration-300 hover:scale-[1.02] ${
                              selected
                                ? "border-pink-500 bg-pink-50 text-pink-700 dark:bg-pink-950/40 dark:text-pink-400 shadow-sm shadow-pink-500/10"
                                : "border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-pink-500 dark:hover:border-pink-500 hover:text-pink-600 dark:hover:text-pink-400 bg-white dark:bg-gray-900"
                            }`}
                          >
                            {v.value}
                          </button>
                        );
                      }

                      return (
                        <label
                          key={v.value}
                          className="flex items-center justify-between cursor-pointer group"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-[18px] h-[18px] rounded-md border flex items-center justify-center shrink-0 transition-all duration-200 ${
                                selected
                                  ? "border-pink-500 bg-pink-500 text-white shadow-sm shadow-pink-500/10"
                                  : "border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 group-hover:border-pink-500"
                              }`}
                            >
                              {selected && (
                                <Check size={12} className="stroke-[3]" />
                              )}
                            </div>
                            <span
                              className={`text-[13px] font-medium transition-colors duration-200 ${
                                selected
                                  ? "text-pink-600 dark:text-pink-400 font-bold"
                                  : "text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                              }`}
                            >
                              {v.value}
                            </span>
                          </div>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors duration-200 ${
                              selected
                                ? "bg-pink-50 text-pink-600 dark:bg-pink-950/40 dark:text-pink-400"
                                : "bg-gray-50 text-gray-400 dark:bg-gray-900/60 group-hover:bg-pink-50 dark:group-hover:bg-pink-950/20 group-hover:text-pink-600 dark:group-hover:text-pink-400"
                            }`}
                          >
                            {v.count}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}

      {/* Price Range Window */}
      <div className={sectionWindowClass}>
        <SectionHeader
          title="Price"
          section="price"
          isExpanded={expandedSections.price}
        />
        <AnimatePresence initial={false}>
          {expandedSections.price && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="pt-6 pb-1 space-y-6">
                <div className="px-3">
                  <Slider
                    range
                    min={priceRange.min}
                    max={
                      priceRange.max > priceRange.min ? priceRange.max : 50000
                    }
                    step={10}
                    value={[
                      Number(localMinPrice) || priceRange.min,
                      Number(localMaxPrice) || priceRange.max,
                    ]}
                    onChange={(val: any) => {
                      setLocalMinPrice(val[0].toString());
                      setLocalMaxPrice(val[1].toString());
                    }}
                    trackStyle={[{ backgroundColor: "#ec4899" }]}
                    handleStyle={[
                      {
                        borderColor: "#ec4899",
                        backgroundColor: "#fff",
                        opacity: 1,
                        boxShadow: "0 0 0 4px rgba(16,185,129,0.1)",
                      },
                      {
                        borderColor: "#ec4899",
                        backgroundColor: "#fff",
                        opacity: 1,
                        boxShadow: "0 0 0 4px rgba(16,185,129,0.1)",
                      },
                    ]}
                    railStyle={{ backgroundColor: "#e5e7eb" }}
                  />
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400">
                      Tk{" "}
                    </span>
                    <input
                      type="number"
                      min="0"
                      placeholder="Min"
                      value={localMinPrice}
                      onChange={handleMinPriceChange}
                      onBlur={handlePriceBlur}
                      className="w-full pl-6 pr-2 py-2.5 bg-transparent border-b-2 border-gray-200 dark:border-gray-800 rounded-none text-xs text-center font-bold text-gray-800 dark:text-gray-200 focus:border-pink-500 dark:focus:border-pink-400 focus:ring-2 focus:ring-pink-500/10 outline-none transition-all"
                    />
                  </div>
                  <span className="text-gray-300 dark:text-gray-700 font-bold">
                    —
                  </span>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400">
                      Tk{" "}
                    </span>
                    <input
                      type="number"
                      min="0"
                      placeholder="Max"
                      value={localMaxPrice}
                      onChange={handleMaxPriceChange}
                      onBlur={handlePriceBlur}
                      className="w-full pl-6 pr-2 py-2.5 bg-transparent border-b-2 border-gray-200 dark:border-gray-800 rounded-none text-xs text-center font-bold text-gray-800 dark:text-gray-200 focus:border-pink-500 dark:focus:border-pink-400 focus:ring-2 focus:ring-pink-500/10 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Rating Filter Window */}
      <div className={sectionWindowClass}>
        <SectionHeader
          title="Rating"
          section="rating"
          isExpanded={expandedSections.rating}
        />
        <AnimatePresence initial={false}>
          {expandedSections.rating && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="pt-4 pb-1 space-y-3.5">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const selected = filters.minRating === rating.toString();
                  return (
                    <label
                      key={rating}
                      className="flex items-center justify-between cursor-pointer group"
                      onClick={(e) => {
                        e.preventDefault();
                        setMinRating(selected ? "" : rating.toString());
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-[18px] h-[18px] rounded-full flex items-center justify-center shrink-0 transition-all duration-200 border ${
                            selected
                              ? "border-pink-500 p-1 bg-pink-500 text-white shadow-sm shadow-pink-500/10"
                              : "border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 group-hover:border-pink-500"
                          }`}
                        >
                          {selected && (
                            <div className="w-1.5 h-1.5 rounded-full bg-white" />
                          )}
                        </div>
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={13}
                              className={
                                i < rating
                                  ? "fill-amber-400 text-amber-400 animate-pulse-subtle"
                                  : "fill-gray-100 text-gray-100 dark:fill-gray-800 dark:text-gray-800"
                              }
                            />
                          ))}
                          <span
                            className={`ml-2 text-[13px] font-medium transition-colors duration-200 ${
                              selected
                                ? "text-pink-600 dark:text-pink-400 font-bold"
                                : "text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                            }`}
                          >
                            & Up
                          </span>
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
