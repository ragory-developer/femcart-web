"use client";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";
import { motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

const defaultSlides = [
  {
    id: 1,
    img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1440&auto=format&fit=crop",
    title: "Comfortable Bras & Panty",
    subtitle: "For Women In Bangladesh",
    desc: "Soft, seamless & durable. Feel your very best every single day effortlessly.",
  },
  {
    id: 2,
    img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1440&auto=format&fit=crop",
    title: "The Autumn Edit",
    subtitle: "New Arrivals Are Here",
    desc: "Warmer tones, softer fabrics, and the comfortable support you need as the seasons change.",
  },
  {
    id: 3,
    img: "https://images.unsplash.com/photo-1542204165-65bf26472b9b?q=80&w=1440&auto=format&fit=crop",
    title: "Perfect Fit Guarantee",
    subtitle: "Confidence In Every Size",
    desc: "Take our fit quiz and find the perfect match for your body.",
  },
];

export default function Hero({
  slides = defaultSlides,
}: {
  slides?: typeof defaultSlides;
}) {
  return (
    <section className="relative w-full h-[50dvh] md:h-[70dvh] overflow-hidden mb-4 md:mb-12 bg-rose-50">
      <Swiper
        modules={[Autoplay, Pagination, EffectFade]}
        effect="fade"
        speed={1000}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        pagination={{
          clickable: true,
          bulletClass: "swiper-pagination-bullet !w-3 !h-3 !bg-white/50",
          bulletActiveClass:
            "swiper-pagination-bullet-active !bg-pink-500 !w-8 !rounded-full transition-all",
        }}
        className="w-full h-full"
      >
        {slides.map((slide, index) => (
          <SwiperSlide
            key={slide.id || index}
            className="relative w-full h-full"
          >
            <img
              src={slide.img}
              alt={slide.title}
              className="absolute inset-0 w-full h-full object-cover opacity-80 mix-blend-multiply"
            />

            <div className="absolute inset-0 bg-white/30 flex flex-col items-center justify-center text-center px-4">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="max-w-3xl backdrop-blur-sm bg-white/70 p-4 md:p-fluid-lg rounded-[20px] md:rounded-[24px] shadow-sm w-[90%] md:w-auto mx-auto"
              >
                <h1 className="font-serif text-[22px] sm:text-fluid-3xl md:text-fluid-4xl leading-[1.15] text-text-pink-500 mb-1 md:mb-2 tracking-[-0.02em]">
                  {slide.title}
                  <br />
                  <span className="text-pink-500">{slide.subtitle}</span>
                </h1>
                <p className="text-[12px] sm:text-[15px] md:text-fluid-base text-text-amber-700 mb-4 mt-2 md:mb-8 md:mt-4 max-w-xl mx-auto leading-snug">
                  {slide.desc}
                </p>
                <div className="flex flex-row justify-center gap-2 sm:gap-4 w-full px-2">
                  <button className="inline-flex items-center justify-center h-10 w-full sm:w-auto px-2 sm:px-6 rounded-full font-sans font-semibold text-[12px] sm:text-[15px] tracking-[0.3px] transition-all duration-150 cursor-pointer bg-pink-500 text-white hover:bg-pink-600 active:scale-[0.98] shadow-xl md:h-12 gap-2">
                    <ShoppingBag size={14} className="md:w-4 md:h-4" /> Shop
                    Bras
                  </button>
                  <button className="inline-flex items-center justify-center h-10 w-full sm:w-auto px-2 sm:px-6 rounded-full font-sans font-semibold text-[12px] sm:text-[15px] tracking-[0.3px] transition-all duration-150 cursor-pointer bg-white text-pink-500 border border-transparent shadow-sm hover:border-pink-500 md:h-12 gap-2">
                    <ShoppingBag size={14} className="md:w-4 md:h-4" /> Shop
                    Panties
                  </button>
                </div>
              </motion.div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
