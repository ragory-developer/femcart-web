"use client";

import { useSettingsStore } from "@/store/settingsStore";
import { ArrowRight, Heart, Sparkles, Star } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  const settings = useSettingsStore((state) => state.settings);

  return (
    <div className="bg-[#FFFDFB] dark:bg-[#0a0a0a] min-h-[100dvh] font-sans">
      {/* Hero Section */}
      <div className="relative overflow-hidden pt-6 md:pt-10 pb-8 md:pb-12">
        <div className="absolute inset-0 bg-gradient-to-b from-pink-500/5 to-transparent dark:from-pink-500/10" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-block py-1.5 px-4 rounded-full bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 font-bold text-[11px] tracking-widest uppercase mb-6 border border-pink-200 dark:border-pink-800">
              Our Story
            </span>
            <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight leading-[1.1] mb-4 md:mb-6 uppercase font-serif">
              Welcome to <span className="text-pink-500 italic block mt-2">Femcart</span>
            </h1>
            <p
              suppressHydrationWarning
              className="text-[10px] md:text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed font-medium mx-auto max-w-2xl"
            >
              {settings.footer_about_text ||
                "Your trusted online destination for premium intimate apparel in Bangladesh. We believe every woman deserves to feel comfortable, confident, and beautiful from the inside out."}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-6 md:py-10 bg-white dark:bg-[#0a0a0a]">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-16 items-center">
            {/* Image Block */}
            <div className="relative order-2 lg:order-1 mt-6 lg:mt-0">
              <div className="aspect-[4/5] bg-rose-50 dark:bg-gray-900 rounded-3xl md:rounded-[2.5rem] relative overflow-hidden border border-rose-100 dark:border-gray-800 shadow-xl shadow-pink-500/5">
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1440&auto=format&fit=crop"
                  alt="Femcart Women"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>

              {/* Floating Badge */}
              <div className="absolute -bottom-6 -right-4 md:-bottom-8 md:-right-8 bg-white/90 backdrop-blur-md dark:bg-gray-900/90 rounded-2xl md:rounded-[2rem] p-4 md:p-6 shadow-2xl border border-rose-100 dark:border-gray-800 flex flex-col items-center justify-center w-32 h-32 md:w-40 md:h-40">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-pink-500 text-white rounded-full flex items-center justify-center mb-2">
                  <Star size={24} className="md:w-7 md:h-7" />
                </div>
                <span className="font-bold text-gray-900 dark:text-white text-base md:text-lg tracking-tight">
                  Premium
                </span>
                <span className="font-bold text-pink-500 text-[10px] md:text-xs uppercase tracking-widest">
                  Quality
                </span>
              </div>
            </div>

            {/* Text Content */}
            <div className="flex flex-col gap-4 md:gap-6 order-1 lg:order-2">
              <h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight leading-[1.1] uppercase font-serif">
                Comfort. <br /> <span className="text-pink-500 italic">Confidence.</span> <br /> Everyday.
              </h2>

              <div className="space-y-4 md:space-y-6 text-base md:text-lg text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                <p>
                  At{" "}
                  <strong
                    suppressHydrationWarning
                    className="text-gray-900 dark:text-white"
                  >
                    {settings.store_name || "Femcart"}
                  </strong>
                  , we understand the struggle of finding comfortable, well-fitting bras and panties that don't compromise on quality or price. 
                </p>
                <p>
                  Our platform is meticulously designed to provide a stress-free, private, and empowering shopping experience. From everyday seamless essentials to supportive activewear and elegant lace sets, we curate only the best for you.
                </p>
                <p>
                  With nationwide cash on delivery, 48-hour dispatch, and a hassle-free 7-day return policy, we make sure you feel confident in every purchase and every wear.
                </p>
              </div>

              <div className="pt-6 md:pt-8 mt-2 md:mt-4 border-t border-rose-100 dark:border-gray-800">
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center gap-2 bg-pink-500 text-white px-6 md:px-8 py-3 md:py-4 rounded-full font-bold text-[12px] md:text-sm uppercase tracking-wider transition-all hover:bg-pink-600 hover:shadow-lg hover:shadow-pink-500/30 hover:-translate-y-0.5 active:scale-95"
                >
                  Shop The Collection <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Value Propositions */}
      <div className="py-8 md:py-12 bg-rose-50/30 dark:bg-[#0a0a0a]">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {/* Value 1 */}
            <div className="bg-white dark:bg-gray-900 p-4 md:p-5 rounded-3xl md:rounded-[2rem] border border-rose-100 dark:border-gray-800 shadow-xl shadow-pink-500/5 hover:-translate-y-2 hover:border-pink-300 hover:shadow-2xl hover:shadow-pink-500/10 transition-all duration-300">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-pink-100 dark:bg-pink-900/30 rounded-2xl flex items-center justify-center text-pink-500 mb-4 md:mb-6">
                <Heart size={24} className="md:w-7 md:h-7" />
              </div>
              <h3 className="text-base md:text-lg font-black text-gray-900 dark:text-white mb-3 md:mb-4 uppercase tracking-tight">
                Perfect Fit
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-[10px] md:text-[11px] font-medium">
                Thoughtfully crafted pieces designed to provide unmatched softness and support for your unique body type.
              </p>
            </div>

            {/* Value 2 */}
            <div className="bg-white dark:bg-gray-900 p-4 md:p-5 rounded-3xl md:rounded-[2rem] border border-rose-100 dark:border-gray-800 shadow-xl shadow-pink-500/5 hover:-translate-y-2 hover:border-pink-300 hover:shadow-2xl hover:shadow-pink-500/10 transition-all duration-300">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-pink-100 dark:bg-pink-900/30 rounded-2xl flex items-center justify-center text-pink-500 mb-4 md:mb-6">
                <Sparkles size={24} className="md:w-7 md:h-7" />
              </div>
              <h3 className="text-base md:text-lg font-black text-gray-900 dark:text-white mb-3 md:mb-4 uppercase tracking-tight">
                Premium Quality
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-[10px] md:text-[11px] font-medium">
                We source the finest, most durable fabrics to ensure your intimate wear stays beautiful wash after wash.
              </p>
            </div>

            {/* Value 3 */}
            <div className="bg-white dark:bg-gray-900 p-4 md:p-5 rounded-3xl md:rounded-[2rem] border border-rose-100 dark:border-gray-800 shadow-xl shadow-pink-500/5 hover:-translate-y-2 hover:border-pink-300 hover:shadow-2xl hover:shadow-pink-500/10 transition-all duration-300">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-pink-100 dark:bg-pink-900/30 rounded-2xl flex items-center justify-center text-pink-500 mb-4 md:mb-6">
                <Star size={24} className="md:w-7 md:h-7" />
              </div>
              <h3 className="text-base md:text-lg font-black text-gray-900 dark:text-white mb-3 md:mb-4 uppercase tracking-tight">
                Private & Secure
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-[10px] md:text-[11px] font-medium">
                Shop with total peace of mind. We ensure discreet packaging and completely secure transactions for every order.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
