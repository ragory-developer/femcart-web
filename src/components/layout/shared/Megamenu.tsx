"use client";

import React, { useState } from "react";

import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { categoriesData } from "@/components/home/data";
import { cn, getCategoryIcon, getFilterUrl } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

interface MegamenuProps {
  themeColor?: string;
  themeHover?: string;
  themeBorder?: string;
  themeBgActive?: string;
  data?: any[];
}

export function Megamenu({
  themeColor = "text-emerald-600",
  themeHover = "hover:text-emerald-600",
  themeBorder = "border-emerald-600",
  themeBgActive = "bg-white",
  data = categoriesData,
}: MegamenuProps = {}) {
  const [activeCategoryId, setActiveCategoryId] = useState<string>(
    data?.[0]?.id || "",
  );
  const activeCategory = data?.find((c) => c.id === activeCategoryId) ||
    data?.[0] || { title: "", subcategories: [] };

  return (
    <div className="absolute top-full left-0 w-full pt-1 z-50">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="w-full bg-white border border-gray-200 shadow-2xl rounded-b-xl overflow-hidden flex"
      >
        {/* Left Column: Categories List */}
        <div className="w-[280px] bg-gray-50 border-r border-gray-200 flex flex-col py-3">
          {data.map((category) => {
            const isActive = activeCategoryId === category.id;
            const Icon = category.icon || getCategoryIcon(category.title);
            return (
              <button
                key={category.id}
                onMouseEnter={() => setActiveCategoryId(category.id)}
                className={cn(
                  "flex items-center justify-between w-full px-6 py-3 transition-colors text-left group",
                  isActive
                    ? `${themeBgActive} ${themeColor} font-bold border-l-4 ${themeBorder}`
                    : `text-gray-700 hover:bg-white ${themeHover} font-medium border-l-4 border-transparent`,
                )}
              >
                <div className="flex items-center gap-3">
                  {category.image ? (
                    <Image
                      src={category.image}
                      alt={category.title}
                      width={20}
                      height={20}
                      className="w-5 h-5 object-cover rounded shadow-sm"
                    />
                  ) : Icon ? (
                    <Icon
                      size={18}
                      className={cn(
                        "transition-colors",
                        isActive
                          ? themeColor
                          : `text-gray-400 group-hover:${themeColor.replace("text-", "")}`,
                      )}
                    />
                  ) : (
                    <div className="w-5 h-5 bg-gray-100 rounded" />
                  )}
                  <span className="text-[14px]">{category.title}</span>
                </div>
                <ChevronRight
                  size={16}
                  className={cn(
                    "transition-colors",
                    isActive
                      ? themeColor
                      : `text-gray-300 group-hover:${themeColor.replace("text-", "")}`,
                  )}
                />
              </button>
            );
          })}
        </div>

        {/* Right Column: Cascading Subcategories */}
        <div className="flex-1 p-8 bg-white min-h-[400px]">
          <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
            {activeCategory.title}
          </h3>

          <div className="grid grid-cols-3 gap-8">
            {activeCategory.subcategories?.map((sub: any, idx: number) => (
              <div key={idx} className="flex flex-col gap-3">
                <Link
                  href={getFilterUrl(sub.href || "#")}
                  className="text-[13px] font-bold text-gray-900 uppercase tracking-wide hover:text-pink-600 transition-colors"
                >
                  {sub.title}
                </Link>
                <div className="flex flex-col gap-2 mt-1">
                  {sub.items.map((item: any, itemIdx: number) => (
                    <Link
                      key={itemIdx}
                      href={getFilterUrl(item.href)}
                      className={cn(
                        "text-[14px] font-medium text-gray-500 transition-colors",
                        themeHover,
                      )}
                    >
                      {item.title}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
