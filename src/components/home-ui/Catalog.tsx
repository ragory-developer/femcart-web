"use client";

import React, { useState, useRef, useCallback } from "react";
import { ChevronDown, Sparkles, Loader2 } from "lucide-react";
import { ProductCard } from "./shared/ProductCard";
import { homeMockProducts } from "@/constants/mockData";

export default function Catalog() {
  const [items, setItems] = useState(homeMockProducts);
  const [loading, setLoading] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  const fetchMoreData = useCallback(() => {
    if (loadingRef.current) return;

    loadingRef.current = true;
    setLoading(true);

    // Simulate network delay
    setTimeout(() => {
      setItems((prev) => [...prev, ...homeMockProducts]);
      setLoading(false);
      loadingRef.current = false;
    }, 1500);
  }, []);

  return (
    <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-8">
      {/* Header & Controls */}
      <div className="mb-12 md:mb-16 text-center">
        <h1 className="font-sans text-[36px] md:text-[46px] font-medium leading-[1.1] text-black">
          Products
        </h1>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 text-[13px] text-[#666] font-sans gap-4 md:gap-0">
        <div className="flex items-center gap-4 md:gap-8 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          <span className="text-[#888] whitespace-nowrap">Filter:</span>
          <button className="flex items-center gap-1.5 hover:text-black transition-colors whitespace-nowrap">
            Availability <ChevronDown size={14} strokeWidth={2} />
          </button>
          <button className="flex items-center gap-1.5 hover:text-black transition-colors whitespace-nowrap">
            Price <ChevronDown size={14} strokeWidth={2} />
          </button>
        </div>

        <div className="flex items-center gap-4 md:gap-8 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center gap-2 md:gap-3">
            <span className="text-[#888]">Sort by:</span>
            <button className="flex items-center gap-1.5 hover:text-black transition-colors whitespace-nowrap">
              Alphabetically, A-Z <ChevronDown size={14} strokeWidth={2} />
            </button>
          </div>
          <span className="text-[#888] whitespace-nowrap">
            {items.length} products
          </span>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {items.map((product, idx) => (
          <ProductCard key={`${product.id}-${idx}`} product={product} />
        ))}
      </div>

      {/* Infinite Scroll Observer Target */}
      <div
        ref={observerTarget}
        className="flex justify-center items-center py-12"
      >
        {loading ? (
          <Loader2 className="animate-spin text-pink-500" size={32} />
        ) : (
          <button
            onClick={fetchMoreData}
            className="border-[1.5px] border-pink-500 text-pink-500 hover:bg-pink-500 hover:text-white px-8 py-3 rounded-full font-medium transition-all"
          >
            Load More
          </button>
        )}
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-50">
        <button className="flex items-center gap-2.5 bg-white text-[#111] px-5 py-2.5 rounded-full shadow-[0_4px_24px_rgba(0,0,0,0.12)] hover:shadow-[0_6px_32px_rgba(0,0,0,0.18)] transition-all duration-300 border border-gray-100/50 font-medium text-[13px] hover:-translate-y-0.5">
          <div className="bg-[#1A1A1A] text-white rounded-full p-[5px]">
            <Sparkles size={14} strokeWidth={2} />
          </div>
          Shop with AI
        </button>
      </div>
    </div>
  );
}
