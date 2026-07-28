"use client";
import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Search,
  X,
  Loader2,
  ArrowRight,
  Clock,
  TrendingUp,
} from "lucide-react";
import { useGlobalSearchStore } from "../../store/globalSearchStore";
import { SearchSuggestionCard } from "./SearchSuggestionCard";
import { useRouter } from "next/navigation";

export default function GlobalSearch({
  desktopOnly = false,
  mobileOnly = false,
}: { desktopOnly?: boolean; mobileOnly?: boolean } = {}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    isOpen,
    query,
    results,
    isLoading,
    selectedIndex,
    openSearch,
    closeSearch,
    setQuery,
    setResults,
    setIsLoading,
    moveSelection,
  } = useGlobalSearchStore();

  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [popularBrands, setPopularBrands] = useState<any[]>([
    { name: "Organic Valley", slug: "organic-valley" },
    { name: "Nestle", slug: "nestle" },
    { name: "Korg", slug: "korg" },
  ]);
  const [isFocused, setIsFocused] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Keyboard Shortcuts (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape") {
        setIsFocused(false);
        closeSearch(); // Also close mobile modal if open
        inputRef.current?.blur();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeSearch]);

  // Handle clicking outside to close desktop dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false);
        inputRef.current?.blur();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch popular brands on first focus or mobile open
  useEffect(() => {
    if (
      (isFocused || isOpen) &&
      popularBrands.length === 3 &&
      popularBrands[0].slug === "organic-valley"
    ) {
      fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/brands?limit=12`,
      )
        .then((res) => res.json())
        .then((data) => {
          if (
            data.success &&
            Array.isArray(data.data) &&
            data.data.length > 0
          ) {
            setPopularBrands(data.data);
          }
        })
        .catch(console.error);
    }
  }, [isFocused, isOpen, popularBrands]);

  // Debouncing Query
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Fetching Results from API
  useEffect(() => {
    const fetchResults = async () => {
      if (!debouncedQuery.trim()) {
        setResults({
          products: [],
          categories: [],
          brands: [],
          timeTakenMs: 0,
        });
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/search?q=${encodeURIComponent(debouncedQuery)}&limit=10`,
          {
            signal: abortController.signal,
          },
        );
        const json = await res.json();
        if (json.success) {
          setResults(json.data);
        }
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error("Search failed:", err);
          setIsLoading(false);
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchResults();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [debouncedQuery, setResults, setIsLoading]);

  // Keyboard Navigation
  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    const maxIndex = results.products.length - 1;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      moveSelection("down", maxIndex);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      moveSelection("up", maxIndex);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && results.products[selectedIndex]) {
        const selectedProduct = results.products[selectedIndex];
        router.push(`/${selectedProduct.slug || selectedProduct.id}`);
        setIsFocused(false);
        closeSearch();
      } else if (query.trim()) {
        router.push(`/products?search=${encodeURIComponent(query)}`);
        setIsFocused(false);
        closeSearch();
      }
    }
  };

  // Scroll active item into view
  useEffect(() => {
    if (selectedIndex >= 0 && dropdownRef.current) {
      const activeEl = dropdownRef.current.children[
        selectedIndex
      ] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }
  }, [selectedIndex]);

  const SearchContent = () => (
    <>
      {query.length === 0 ? (
        <div className="p-2 sm:p-3">
          <h3 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2.5 flex items-center gap-1.5 px-1">
            <TrendingUp className="w-3.5 h-3.5 text-pink-500" /> Popular Brands
          </h3>
          <div className="flex overflow-x-auto gap-1.5 px-1 pb-1 scrollbar-hide [-ms-overflow-style:'none'] [scrollbar-width:'none'] [&::-webkit-scrollbar]:hidden">
            {popularBrands.map((brand) => (
              <button
                key={brand.slug}
                onClick={() => {
                  router.push(`/brands/${brand.slug}`);
                  setIsFocused(false);
                  closeSearch();
                }}
                className="whitespace-nowrap px-2.5 py-1 bg-gray-50/80 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50 rounded-md text-[12px] font-medium text-gray-600 dark:text-gray-300 hover:bg-pink-50 hover:border-pink-200 hover:text-pink-700 dark:hover:bg-pink-900/20 dark:hover:border-pink-800 dark:hover:text-pink-400 transition-all duration-200 active:scale-95"
              >
                {brand.name}
              </button>
            ))}
          </div>
        </div>
      ) : results.products.length > 0 ? (
        <div
          className={`flex flex-col p-1.5 transition-opacity duration-200 ${isLoading || query !== debouncedQuery ? "opacity-40 pointer-events-none" : "opacity-100"}`}
          ref={dropdownRef}
        >
          <div className="flex items-center justify-between px-3 py-1.5 mb-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Products
            </span>
            {results.timeTakenMs > 0 && (
              <span className="text-[9px] font-medium text-gray-300 flex items-center gap-1">
                <Clock className="w-3 h-3" /> {results.timeTakenMs}ms
              </span>
            )}
          </div>
          {results.products.map((product, idx) => (
            <SearchSuggestionCard
              key={product.id}
              product={product}
              isSelected={idx === selectedIndex}
              onSelect={() => {
                setIsFocused(false);
                closeSearch();
              }}
            />
          ))}

          <button
            onClick={() => {
              router.push(`/products?search=${encodeURIComponent(query)}`);
              setIsFocused(false);
              closeSearch();
            }}
            className="w-full mt-1.5 py-2.5 flex items-center justify-center gap-1.5 text-[13px] font-bold text-pink-600 hover:text-pink-700 bg-pink-50/50 dark:bg-pink-900/10 hover:bg-pink-50 dark:hover:bg-pink-900/30 rounded-lg transition-colors"
          >
            See all results for "{query}" <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : query.length > 0 && (isLoading || query !== debouncedQuery) ? (
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <Loader2 className="w-6 h-6 text-pink-500 animate-spin mb-3" />
          <p className="text-sm font-medium text-gray-400">Searching...</p>
        </div>
      ) : !isLoading && query.length > 0 ? (
        <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
          <Search className="w-10 h-10 text-gray-200 dark:text-gray-700 mb-3" />
          <p className="text-gray-500 font-medium">
            No results found for{" "}
            <span className="text-gray-900 dark:text-white">
              &quot;{query}&quot;
            </span>
          </p>
          <p className="text-sm text-gray-400 mt-1 mb-6">
            Try checking your spelling or using more general terms
          </p>

          {/* Show popular brands as a helpful fallback */}
          <div className="w-full text-left mt-2 border-t border-gray-100 dark:border-gray-800 pt-6">
            <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 text-center">
              Popular Brands
            </h3>
            <div className="flex flex-wrap gap-2 justify-center">
              {popularBrands.map((brand) => (
                <button
                  key={brand.slug}
                  onClick={() => {
                    router.push(`/brands/${brand.slug}`);
                    setIsFocused(false);
                    closeSearch();
                  }}
                  className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-pink-50 dark:hover:bg-pink-900/30 hover:text-pink-600 dark:hover:text-pink-400 rounded-lg transition-colors flex items-center gap-1.5 active:scale-95"
                >
                  <TrendingUp className="w-3.5 h-3.5 opacity-50 text-pink-500" />
                  {brand.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Desktop Backdrop (Dimmed) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] hidden md:block bg-black/40 backdrop-blur-sm"
            onClick={closeSearch}
          />

          {/* Main Search Overlay */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 md:bottom-auto z-[100] flex flex-col bg-white dark:bg-gray-950 md:shadow-xl"
          >
            {/* Header / Input Area */}
            <div className="flex items-center justify-between px-4 py-4 md:py-5 border-b border-gray-100 dark:border-gray-800 bg-[#FCF8F8] dark:bg-gray-950 shrink-0">
              {/* Desktop Centered Input Container / Mobile Full Width */}
              <div className="flex-1 md:flex-none flex items-center justify-center md:mx-auto">
                <div className="flex items-center w-full md:w-[600px] lg:w-[700px] border border-gray-300 dark:border-gray-700 focus-within:border-gray-400 focus-within:ring-1 focus-within:ring-gray-400 px-4 md:px-5 py-2.5 bg-white dark:bg-gray-900 relative rounded-md transition-all duration-200 shadow-sm">
                  <input
                    ref={inputRef}
                    type="text"
                    autoFocus
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleInputKeyDown}
                    placeholder="Search"
                    className="w-full bg-transparent border-none outline-none text-[15px] font-normal text-gray-900 dark:text-white placeholder-gray-500"
                    autoComplete="off"
                    spellCheck="false"
                  />

                  <div className="flex items-center gap-2">
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 text-gray-400 animate-spin shrink-0" />
                    ) : (
                      <button
                        onClick={() => {}}
                        className="p-1 text-gray-500 hover:text-gray-800 transition-colors"
                      >
                        <Search
                          className="w-4 h-4 shrink-0"
                          strokeWidth={1.5}
                        />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={closeSearch}
                className="ml-4 p-1 text-gray-500 hover:text-gray-800 transition-colors"
              >
                <X className="w-6 h-6 md:w-7 md:h-7" strokeWidth={1} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 md:max-h-[60vh] overflow-y-auto overscroll-contain bg-white dark:bg-gray-900 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
              <div className="max-w-3xl mx-auto w-full md:py-4">
                {SearchContent()}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
