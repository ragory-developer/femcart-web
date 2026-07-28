"use client";
import { API_URL } from "@/lib/config";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  LayoutGrid,
  Loader2,
  Star,
  Tag,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const DEFAULT_CATEGORY_IMAGES = [
  "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=80&w=400",
  "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=400",
  "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=400",
  "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&q=80&w=400",
  "https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&q=80&w=400",
  "https://images.unsplash.com/photo-1556228720-192a6af4e865?auto=format&fit=crop&q=80&w=400",
  "https://images.unsplash.com/photo-1512496015851-a1fbaf692887?auto=format&fit=crop&q=80&w=400",
  "https://images.unsplash.com/photo-1599305090598-fe179d501227?auto=format&fit=crop&q=80&w=400",
];

const DEFAULT_BRAND_IMAGES = [
  "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400",
  "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&q=80&w=400",
  "https://images.unsplash.com/photo-1607349913338-fca6f7fc42d0?auto=format&fit=crop&q=80&w=400",
  "https://images.unsplash.com/photo-1628102491629-778571d893a3?auto=format&fit=crop&q=80&w=400",
  "https://images.unsplash.com/photo-1588611910114-23ca3760e1d0?auto=format&fit=crop&q=80&w=400",
  "https://images.unsplash.com/photo-1518133501741-94943f5f3e3e?auto=format&fit=crop&q=80&w=400",
];

export default function ExplorePage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, brandRes] = await Promise.all([
          fetch(`${API_URL}/api/categories`),
          fetch(`${API_URL}/api/brands`),
        ]);
        const catJson = await catRes.json();
        const brandJson = await brandRes.json();
        if (catJson.success) setCategories(catJson.data);
        if (brandJson.success) setBrands(brandJson.data);
      } catch (e) {
        console.error("Failed to fetch explore data:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#13A048] animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-[100dvh]">
      {/* Hero Header */}
      <div className="relative bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-900 pb-12 pt-8 overflow-hidden">
        {/* Subtle Background Mesh */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-[var(--color-lime)]/10 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-[#13A048]/10 blur-3xl pointer-events-none"></div>

        <div className="container relative mx-auto px-4">
          <Link
            href="/"
            className="inline-flex items-center text-[13px] font-bold font-body text-gray-400 hover:text-[var(--color-olive)] dark:hover:text-[var(--color-lime)] transition-colors mb-10 group"
          >
            <ArrowLeft
              size={16}
              className="mr-2 group-hover:-translate-x-1.5 transition-transform"
            />
            Back to Home
          </Link>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="bg-[var(--color-lime)]/10 p-2.5 rounded-xl text-[var(--color-olive)] dark:text-[var(--color-lime)]">
                  <LayoutGrid size={20} />
                </div>
                <span className="text-[var(--color-olive)] dark:text-[var(--color-lime)] font-black font-display uppercase tracking-[0.25em] text-[11px]">
                  Everything you need
                </span>
              </div>
              <h1 className="text-5xl md:text-7xl font-black font-display text-gray-900 dark:text-white tracking-tighter uppercase leading-[0.9]">
                Explore Our{" "}
                <span className="text-[var(--color-lime)] italic block mt-2">
                  Market
                </span>
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-6 max-w-xl text-[15px] leading-relaxed font-medium font-body">
                Browse our premium selection of fresh groceries, organic
                produce, household essentials, and trusted premium brands.
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-md dark:bg-gray-900/80 p-5 rounded-[1.5rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-none border border-gray-100 dark:border-gray-800 flex flex-col gap-4">
              <div className="flex items-center gap-5">
                <div className="text-right">
                  <p className="text-xs font-black font-display text-gray-400 uppercase tracking-widest">
                    Categories
                  </p>
                  <p className="text-xl font-black font-display text-[var(--color-olive)] dark:text-[var(--color-lime)] line-none">
                    {categories.length}
                  </p>
                </div>
                <div className="h-8 w-px bg-gray-100 dark:bg-gray-700"></div>
                <div className="text-left">
                  <p className="text-xs font-black font-display text-gray-400 uppercase tracking-widest">
                    Brands
                  </p>
                  <p className="text-xl font-black font-display text-[#13A048] dark:text-[#13A048] line-none">
                    {brands.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* Categories Section */}
        <div className="mb-10 flex items-center gap-4">
          <LayoutGrid className="text-[#13A048]" size={36} />
          <h2 className="text-4xl md:text-5xl font-black font-display text-gray-900 dark:text-white uppercase tracking-tight">
            Categories
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 mb-20">
          {categories.map((category, idx) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="group relative h-[220px] md:h-[320px] lg:h-[420px] rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden shadow-lg shadow-gray-200/30 dark:shadow-none border border-white/60 dark:border-gray-800"
            >
              {/* Overlay Link for entire card */}
              <Link
                href={`/categories/${category.slug}`}
                className="absolute inset-0 z-20"
                aria-label={category.name}
              ></Link>

              <img
                src={
                  category.image ||
                  DEFAULT_CATEGORY_IMAGES[idx % DEFAULT_CATEGORY_IMAGES.length]
                }
                alt={category.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110 ease-out"
                loading={idx < 3 ? "eager" : "lazy"}
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-80 md:opacity-60"></div>

              <div className="absolute top-3 left-3 right-3 md:top-6 md:left-6 md:right-6 flex justify-between items-start">
                <div className="bg-white/90 dark:bg-black/60 backdrop-blur-md text-gray-900 dark:text-gray-100 text-[9px] md:text-[10px] font-bold px-2 py-1 md:px-4 md:py-2 rounded-full uppercase tracking-widest border border-white/50 dark:border-white/10 shadow-sm">
                  {category._count?.products || 0}{" "}
                  <span className="hidden md:inline">Products</span>
                  <span className="md:hidden">Items</span>
                </div>
                <div className="hidden md:flex w-10 h-10 rounded-full bg-white/80 dark:bg-black/40 backdrop-blur-md items-center justify-center text-gray-800 dark:text-white border border-white/50 dark:border-white/10 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500 translate-x-4 group-hover:translate-x-0">
                  <ChevronRight size={18} className="-mr-0.5" />
                </div>
              </div>

              <div className="absolute inset-x-2 bottom-2 md:inset-x-4 md:bottom-4 p-3 md:p-6 rounded-[1rem] md:rounded-[2rem] bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/50 dark:border-white/10 transition-all duration-500 group-hover:bg-white/95 dark:group-hover:bg-gray-900/95 shadow-xl shadow-black/5 flex flex-col justify-end">
                <h2 className="text-sm md:text-[22px] font-bold font-display text-gray-900 dark:text-white tracking-tight md:mb-1 transition-colors leading-tight truncate">
                  {category.name}
                </h2>

                <Link
                  href={`/categories/${category.slug}`}
                  className="hidden md:inline-flex items-center gap-2 text-sm font-bold font-body text-[#13A048] dark:text-[var(--color-lime)] group/link mt-2"
                >
                  Explore Collection
                  <ArrowRight
                    size={16}
                    className="transition-transform group-hover/link:translate-x-1"
                  />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="w-full h-px bg-gray-200 dark:bg-gray-800 my-16"></div>

        {/* Brands Section */}
        <div className="mb-10 flex items-center gap-4">
          <Star className="text-[var(--color-olive)]" size={36} />
          <h2 className="text-4xl md:text-5xl font-black font-display text-gray-900 dark:text-white uppercase tracking-tight">
            Premium Brands
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 mb-24">
          {brands.map((brand, idx) => (
            <motion.div
              key={brand.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="group relative h-[220px] md:h-[320px] lg:h-[420px] rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden shadow-lg shadow-gray-200/30 dark:shadow-none border border-white/60 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-center"
            >
              {/* Overlay Link for entire card */}
              <Link
                href={`/brands/${brand.slug}`}
                className="absolute inset-0 z-20"
                aria-label={brand.name}
              ></Link>

              <img
                src={
                  brand.logo ||
                  DEFAULT_BRAND_IMAGES[idx % DEFAULT_BRAND_IMAGES.length]
                }
                alt={brand.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110 ease-out"
                loading="lazy"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-80 md:opacity-70"></div>

              <div className="absolute top-3 left-3 right-3 md:top-6 md:left-6 md:right-6 flex justify-between items-start">
                <div className="bg-white/90 dark:bg-black/60 backdrop-blur-md text-gray-900 dark:text-gray-100 text-[9px] md:text-[10px] font-bold font-body px-2 py-1 md:px-4 md:py-2 rounded-full uppercase tracking-widest border border-white/50 dark:border-white/10 shadow-sm">
                  {brand._count?.products || 0}{" "}
                  <span className="hidden md:inline">Products</span>
                  <span className="md:hidden">Items</span>
                </div>
              </div>

              <div className="absolute inset-x-2 bottom-2 md:inset-x-4 md:bottom-4 p-3 md:p-6 rounded-[1rem] md:rounded-[2rem] bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/50 dark:border-white/10 transition-all duration-500 group-hover:bg-white/95 dark:group-hover:bg-gray-900/95 shadow-xl shadow-black/5 flex flex-col justify-end">
                <h2 className="text-lg md:text-[24px] font-black font-display text-gray-900 dark:text-white tracking-tight md:mb-1 transition-colors leading-tight truncate">
                  {brand.name}
                </h2>

                <Link
                  href={`/brands/${brand.slug}`}
                  className="hidden md:inline-flex items-center gap-2 text-sm font-bold font-body text-[#13A048] dark:text-[var(--color-lime)] group/link mt-2"
                >
                  View Brand Products
                  <ArrowRight
                    size={16}
                    className="transition-transform group-hover/link:translate-x-1"
                  />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Links A-Z Grid */}
        <div className="mt-24">
          <div className="flex items-center gap-4 mb-12">
            <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800"></div>
            <h3 className="text-xs font-black font-display text-gray-400 uppercase tracking-[0.5em] text-center">
              Directory A-Z
            </h3>
            <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800"></div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-5">
            {/* Mixed Directory of Categories and Brands */}
            {[
              ...categories.map((c) => ({ ...c, type: "category" })),
              ...brands.map((b) => ({ ...b, type: "brand" })),
            ]
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((item) => (
                <Link
                  key={`${item.type}-${item.id}`}
                  href={`/${item.type === "category" ? "categories" : "brands"}/${item.slug}`}
                  className="group relative bg-white dark:bg-gray-900 p-6 rounded-[2rem] border border-gray-100/80 dark:border-gray-800 hover:border-[#13A048]/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(15,58,68,0.08)] text-center overflow-hidden flex flex-col items-center justify-center"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#13A048]/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10 w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:bg-[#13A048]/10 transition-all duration-500 overflow-hidden border border-gray-100 dark:border-gray-700">
                    {item.type === "brand" && item.logo ? (
                      <img
                        src={item.logo}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : item.type === "category" ? (
                      <LayoutGrid
                        size={20}
                        className="text-gray-400 group-hover:text-[var(--color-olive)] dark:group-hover:text-[var(--color-lime)] transition-colors duration-300"
                      />
                    ) : (
                      <Tag
                        size={20}
                        className="text-gray-400 group-hover:text-[var(--color-olive)] dark:group-hover:text-[var(--color-lime)] transition-colors duration-300"
                      />
                    )}
                  </div>
                  <span className="relative z-10 text-[12px] font-black font-display text-gray-800 dark:text-gray-200 uppercase tracking-tight block truncate w-full transition-colors group-hover:text-[var(--color-olive)] dark:group-hover:text-[var(--color-lime)]">
                    {item.name}
                  </span>
                  <span className="relative z-10 text-[9px] font-bold font-body text-gray-400 block mt-1.5 uppercase tracking-widest transition-colors group-hover:text-[#13A048]">
                    {item._count?.products || 0} ITEMS
                  </span>
                </Link>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
