"use client";

import { useSettingsStore } from "@/store/settingsStore";
import { ArrowRight, Heart, Sparkles, Star } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  const settings = useSettingsStore((state) => state.settings);

  return (
    <div className="bg-[#fcfaf8] dark:bg-[#0a0a0a] min-h-[100dvh] font-sans">
      {/* Hero Section: Modern, Rounded, Soft Gradient */}
      <div className="relative overflow-hidden pt-24 pb-32">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F3A44]/5 to-transparent dark:from-[#0F3A44]/20" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-block py-1.5 px-4 rounded-full bg-[#E5B5B5]/20 text-[#A05E5E] font-bold text-sm tracking-widest uppercase mb-6 border border-[#E5B5B5]/30">
              Premium Lifestyle
            </span>
            <h1 className="text-5xl md:text-7xl font-black text-[#0F3A44] dark:text-white tracking-tight leading-[1.1] mb-8">
              Welcome to <span className="text-[#A05E5E]">Femcart</span>
            </h1>
            <p
              suppressHydrationWarning
              className="text-lg md:text-xl text-gray-600 dark:text-gray-400 leading-relaxed font-medium mx-auto max-w-2xl"
            >
              {settings.footer_about_text ||
                "A premium online shopping platform dedicated to women's intimate apparel, shapewear, activewear, and essential lifestyle products."}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content: Clean, Rounded Layout */}
      <div className="py-16 md:py-24 bg-white dark:bg-[#0a0a0a]">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            {/* Image Block with Rounded Corners */}
            <div className="relative">
              <div className="aspect-[4/5] bg-gray-50 dark:bg-gray-900 rounded-[2.5rem] relative overflow-hidden border border-gray-100 dark:border-gray-800 shadow-xl shadow-[#0F3A44]/5">
                {/* Fallback pattern */}
                <div
                  className="absolute inset-0 opacity-20 bg-[url('/assets/pattern-dots.svg')] bg-repeat"
                  aria-hidden="true"
                />
                <div className="absolute inset-0 flex items-center justify-center text-[#0F3A44] dark:text-gray-600 text-3xl font-black uppercase opacity-20">
                  <span suppressHydrationWarning>
                    {settings.store_name || "Femcart"}
                  </span>
                </div>
              </div>

              {/* Floating Badge */}
              <div className="absolute -bottom-8 -right-8 bg-white dark:bg-gray-900 rounded-[2rem] p-6 shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center w-40 h-40">
                <div className="w-16 h-16 bg-[#A05E5E] text-white rounded-full flex items-center justify-center mb-2">
                  <Star size={28} />
                </div>
                <span className="font-bold text-[#0F3A44] dark:text-white text-lg tracking-tight">
                  Premium
                </span>
                <span className="font-bold text-[#A05E5E] text-xs uppercase tracking-widest">
                  Quality
                </span>
              </div>
            </div>

            {/* Text Content */}
            <div className="flex flex-col gap-8">
              <h2 className="text-4xl md:text-5xl font-black text-[#0F3A44] dark:text-white tracking-tight leading-[1.1]">
                Comfort. <br /> Elegance. Confidence.
              </h2>

              <div className="space-y-6 text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                <p>
                  At{" "}
                  <strong
                    suppressHydrationWarning
                    className="text-[#0F3A44] dark:text-white"
                  >
                    {settings.store_name || "Femcart"}
                  </strong>
                  , we believe every woman deserves to feel comfortable,
                  elegant, and confident every single day.
                </p>
                <p>
                  Our platform is meticulously designed to provide a
                  comfortable, confidence-inspiring shopping experience by
                  combining sophisticated visual design with intelligent product
                  discovery, personalized recommendations, and a seamless
                  purchasing journey.
                </p>
                <p>
                  We are your ultimate destination to discover products that
                  genuinely support your comfort, confidence, and everyday
                  lifestyle. From intimate apparel to activewear, we curate only
                  the best.
                </p>
              </div>

              <div className="pt-8 mt-4 border-t border-gray-100 dark:border-gray-800">
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center gap-2 bg-[#0F3A44] text-white px-8 py-4 rounded-2xl font-bold text-sm uppercase tracking-wider transition-all hover:bg-[#A05E5E] hover:shadow-lg hover:shadow-[#A05E5E]/20 hover:-translate-y-0.5"
                >
                  Shop Now <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Value Propositions: Modern Cards */}
      <div className="py-24 bg-[#fcfaf8] dark:bg-[#0a0a0a]">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Value 1 */}
            <div className="bg-white dark:bg-gray-900 p-10 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-lg shadow-[#0F3A44]/5 hover:-translate-y-2 hover:border-[#A05E5E] hover:shadow-xl hover:shadow-[#A05E5E]/10 transition-all duration-300">
              <div className="w-14 h-14 bg-[#E5B5B5]/20 rounded-2xl flex items-center justify-center text-[#A05E5E] mb-8">
                <Sparkles size={28} />
              </div>
              <h3 className="text-2xl font-bold text-[#0F3A44] dark:text-white mb-4">
                Sophisticated Design
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Enjoy an elegant and intuitive shopping experience tailored to
                showcase the finest intimate and lifestyle apparel.
              </p>
            </div>

            {/* Value 2 */}
            <div className="bg-white dark:bg-gray-900 p-10 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-lg shadow-[#0F3A44]/5 hover:-translate-y-2 hover:border-[#A05E5E] hover:shadow-xl hover:shadow-[#A05E5E]/10 transition-all duration-300">
              <div className="w-14 h-14 bg-[#E5B5B5]/20 rounded-2xl flex items-center justify-center text-[#A05E5E] mb-8">
                <Heart size={28} />
              </div>
              <h3 className="text-2xl font-bold text-[#0F3A44] dark:text-white mb-4">
                Confidence Inspiring
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Discover pieces that empower you, curated specifically to
                support your everyday comfort and natural beauty.
              </p>
            </div>

            {/* Value 3 */}
            <div className="bg-white dark:bg-gray-900 p-10 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-lg shadow-[#0F3A44]/5 hover:-translate-y-2 hover:border-[#A05E5E] hover:shadow-xl hover:shadow-[#A05E5E]/10 transition-all duration-300">
              <div className="w-14 h-14 bg-[#E5B5B5]/20 rounded-2xl flex items-center justify-center text-[#A05E5E] mb-8">
                <Star size={28} />
              </div>
              <h3 className="text-2xl font-bold text-[#0F3A44] dark:text-white mb-4">
                Premium Selection
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                We offer intelligent product discovery and personalized
                recommendations to find exactly what suits your lifestyle.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
