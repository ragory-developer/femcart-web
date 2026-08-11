"use client";

import { useSettingsStore } from "@/store/settingsStore";
import { ArrowRight, Star, Heart, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function AboutPage() {
  const settings = useSettingsStore((state) => state.settings);

  return (
    <div className="bg-[#FAFAFA] dark:bg-[#111111] min-h-[100dvh] font-sans selection:bg-rose-200 dark:selection:bg-rose-900/40">
      {/* 
        HERO SECTION - EDITORIAL SPLIT
      */}
      <section className="relative w-full min-h-[85vh] flex flex-col md:flex-row border-b border-gray-200 dark:border-gray-800">
        
        {/* Left: Oversized Typography */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-16 relative z-10 bg-[#FAFAFA] dark:bg-[#111111]">
          <div className="max-w-xl w-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <p className="font-sans text-xs md:text-sm font-bold tracking-[0.2em] text-rose-500 uppercase mb-8">
                The Brand Story
              </p>
              <h1 className="text-5xl md:text-7xl lg:text-[100px] font-serif font-black text-gray-900 dark:text-white leading-[0.9] tracking-tighter mb-8">
                Femcart. <br />
                <span className="italic font-light text-gray-400 dark:text-gray-500">Unveiled</span>
              </h1>
              <p className="font-sans text-lg md:text-xl text-gray-600 dark:text-gray-400 leading-relaxed font-medium max-w-md border-l-2 border-rose-500 pl-6">
                {settings.footer_about_text ||
                  "Your trusted online destination for premium intimate apparel in Bangladesh. We believe every woman deserves to feel comfortable, confident, and beautiful."}
              </p>
            </motion.div>
          </div>
        </div>

        {/* Right: Edge-to-Edge Image */}
        <div className="w-full md:w-1/2 h-[50vh] md:h-auto relative overflow-hidden">
          <motion.div
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute inset-0"
          >
            <img
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1440&auto=format&fit=crop"
              alt="Femcart Women"
              className="absolute inset-0 w-full h-full object-cover filter brightness-95"
            />
            {/* Minimalist Overlay */}
            <div className="absolute inset-0 bg-black/10 dark:bg-black/30"></div>
          </motion.div>
        </div>
      </section>

      {/* 
        THE MANIFESTO - MAGAZINE SPREAD
      */}
      <section className="py-24 md:py-40 container mx-auto px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-16 md:gap-24">
          
          <div className="w-full md:w-1/3">
            <h2 className="text-4xl md:text-6xl font-serif font-black tracking-tight text-gray-900 dark:text-white leading-[1.1] uppercase">
              Comfort. <br />
              <span className="italic text-rose-500">Confidence.</span>
            </h2>
          </div>

          <div className="w-full md:w-2/3 columns-1 md:columns-2 gap-12 font-sans text-base md:text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
            <p className="mb-6">
              At <strong className="text-gray-900 dark:text-white font-bold">{settings.store_name || "Femcart"}</strong>, we understand the struggle of finding comfortable, well-fitting bras and panties that don't compromise on quality or price. 
            </p>
            <p className="mb-6">
              Our platform is meticulously designed to provide a stress-free, private, and empowering shopping experience. From everyday seamless essentials to supportive activewear and elegant lace sets, we curate only the best for you.
            </p>
            <p>
              With nationwide cash on delivery, 48-hour dispatch, and a hassle-free 7-day return policy, we make sure you feel confident in every purchase and every wear.
            </p>
          </div>
        </div>
      </section>

      {/* 
        VALUE PROPOSITIONS - ASYMMETRICAL ACCORDION / LIST
      */}
      <section className="bg-white dark:bg-[#1a1a1a] py-24 md:py-32 border-y border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            
            <div className="flex flex-col md:flex-row justify-between items-end border-b border-gray-200 dark:border-gray-800 pb-8 mb-16 gap-6">
              <h3 className="text-3xl md:text-5xl font-serif font-bold text-gray-900 dark:text-white tracking-tight">
                Our Promise
              </h3>
              <p className="text-xs font-bold tracking-widest uppercase text-gray-400">
                03 Tenets of Quality
              </p>
            </div>

            <div className="flex flex-col gap-8">
              {[
                { title: "Premium Fabrics", desc: "Sourced globally, tailored for longevity and breathability.", icon: Star, color: "text-rose-500" },
                { title: "Inclusive Sizing", desc: "Designed for every body, ensuring support without restriction.", icon: Heart, color: "text-emerald-500" },
                { title: "Discreet Delivery", desc: "Packaged securely and privately, arriving directly to your door.", icon: CheckCircle2, color: "text-blue-500" },
              ].map((item, idx) => (
                <div key={idx} className="group relative p-8 md:p-12 bg-[#FAFAFA] dark:bg-[#111111] border border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-colors duration-500 flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
                  
                  <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                    <span className="font-serif text-3xl md:text-5xl font-light text-gray-300 dark:text-gray-700 italic">
                      0{idx + 1}
                    </span>
                    <div>
                      <h4 className="font-sans text-xl md:text-2xl font-bold text-gray-900 dark:text-white uppercase tracking-tight mb-2">
                        {item.title}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium max-w-sm">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                  
                  <div className={`p-4 rounded-full bg-white dark:bg-[#1a1a1a] shadow-sm border border-gray-100 dark:border-gray-800 ${item.color} transition-transform duration-500 group-hover:scale-110`}>
                    <item.icon size={24} />
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* 
        FINAL CTA - STARK & CONFIDENT
      */}
      <section className="py-24 md:py-40 bg-[#FAFAFA] dark:bg-[#111111] text-center">
        <h2 className="text-4xl md:text-7xl font-serif font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-12">
          Experience <br className="md:hidden"/> <span className="italic text-rose-500">The Difference</span>
        </h2>
        <Link
          href="/products"
          className="inline-flex items-center gap-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-10 py-5 rounded-none font-bold text-sm md:text-base uppercase tracking-[0.2em] transition-all hover:bg-rose-500 dark:hover:bg-rose-500 hover:text-white"
        >
          Explore Collection <ArrowRight size={20} />
        </Link>
      </section>
    </div>
  );
}
