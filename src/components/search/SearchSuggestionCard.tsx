"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Star, Package, ChevronRight } from "lucide-react";
import parse from "html-react-parser";

interface SearchSuggestionCardProps {
  product: any;
  isSelected: boolean;
  onSelect: () => void;
}

export const SearchSuggestionCard = React.memo(
  ({ product, isSelected, onSelect }: SearchSuggestionCardProps) => {
    // Use highlighted name if available, otherwise fallback to standard name
    const displayName = product.highlights?.name?.[0] || product.name;
    const displayBrand =
      product.highlights?.brandName?.[0] || product.brandName;

    return (
      <Link
        href={`/${product.slug || product.id}`}
        onClick={onSelect}
        className={`group relative flex items-center gap-3 p-2 rounded-lg transition-all duration-200 cursor-pointer overflow-hidden ${
          isSelected
            ? "bg-gray-50 dark:bg-gray-800/80 shadow-sm border-transparent z-10"
            : "bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800/50 border-transparent"
        } border`}
      >
        {/* Selected Indicator Line */}
        <div
          className={`absolute left-0 top-0 bottom-0 w-1 bg-pink-500 transition-opacity duration-300 ${
            isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
        />

        {/* Product Image */}
        <div className="relative w-10 h-10 sm:w-12 sm:h-12 shrink-0 bg-white dark:bg-gray-900 rounded-md border border-gray-100 dark:border-gray-800 overflow-hidden flex items-center justify-center">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-contain p-1 group-hover:scale-105 transition-transform duration-500"
              sizes="64px"
            />
          ) : (
            <Package className="w-5 h-5 text-gray-300" />
          )}

          {/* Badges */}
          {product.specialPrice && (
            <div className="absolute top-0 right-0 bg-rose-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-bl-lg z-10 shadow-sm">
              SALE
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-[13px] sm:text-[14px] font-medium text-gray-800 dark:text-gray-200 truncate leading-tight group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
              {parse(displayName)}
            </h4>

            <div className="flex items-center gap-1.5 shrink-0 pl-2">
              {product.specialPrice ? (
                <div className="flex flex-col items-end leading-tight">
                  <span className="text-sm font-black text-rose-600 dark:text-rose-400">
                    Tk {Number(product.specialPrice).toFixed(2)}
                  </span>
                  <span className="text-[10px] font-medium text-gray-400 line-through">
                    Tk {Number(product.price).toFixed(2)}
                  </span>
                </div>
              ) : (
                <span className="text-sm font-black text-gray-900 dark:text-white">
                  Tk {Number(product.price).toFixed(2)}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-500 dark:text-gray-400 truncate">
            {displayBrand && (
              <span className="font-medium text-gray-700 dark:text-gray-300 truncate max-w-[100px]">
                {parse(displayBrand)}
              </span>
            )}
            {displayBrand && product.categoryNames && (
              <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600 shrink-0" />
            )}
            {product.categoryNames && (
              <span className="truncate">{product.categoryNames}</span>
            )}

            {/* Mock Rating if applicable */}
            {product.score > 0 && (
              <>
                <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600 shrink-0 ml-auto" />
                <div className="flex items-center shrink-0">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400 mr-1" />
                  <span className="font-semibold text-gray-700 dark:text-gray-300">
                    4.8
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Arrow Indicator */}
        <div
          className={`shrink-0 ml-2 text-gray-300 dark:text-gray-600 transition-transform duration-300 ${isSelected ? "translate-x-0 opacity-100 text-pink-500" : "-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 group-hover:text-pink-500"}`}
        >
          <ChevronRight className="w-5 h-5" />
        </div>
      </Link>
    );
  },
);

SearchSuggestionCard.displayName = "SearchSuggestionCard";
