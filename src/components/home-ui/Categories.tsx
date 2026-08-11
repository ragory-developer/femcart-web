"use client";

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, FreeMode } from "swiper/modules";
import { motion } from "framer-motion";
import "swiper/css";
import "swiper/css/free-mode";

export default function Categories({
  categories = [],
  title = "Shop by Category",
}: {
  categories?: any[];
  title?: string;
}) {
  if (!categories || categories.length === 0) return null;

  return (
    <section className="max-w-[1440px] mx-auto px-4 md:px-6 mb-4 md:mb-16">
      <h2 className="text-center text-fluid-2xl md:text-fluid-3xl mb-6 md:mb-10">
        {title}
      </h2>
      <Swiper
        modules={[Autoplay, FreeMode]}
        spaceBetween={4}
        slidesPerView={2.1}
        freeMode={true}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        breakpoints={{
          640: { slidesPerView: 3.5, spaceBetween: 12 },
          1024: { slidesPerView: 5.5, spaceBetween: 16 },
          1280: { slidesPerView: 6, spaceBetween: 16 },
        }}
        className="!pt-4 !px-1 !pb-4"
      >
        {categories.map((c, i) => (
          <SwiperSlide key={c.id}>
            <motion.a
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              href={`/categories/${c.slug}`}
              className="group block"
            >
              <div className="relative aspect-[4/5] rounded-[24px] overflow-hidden mb-4 shadow-sm group-hover:shadow-md transition-all duration-300 group-hover:ring-4 group-hover:ring-pink-500/20 group-hover:ring-offset-2 ring-offset-white">
                {c.image || c.products?.[0]?.image ? (
                  <img
                    src={c.image || c.products?.[0]?.image}
                    alt={c.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-pink-50 to-pink-100 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-pink-300">
                      <rect width="7" height="7" x="3" y="3" rx="1"/>
                      <rect width="7" height="7" x="14" y="3" rx="1"/>
                      <rect width="7" height="7" x="14" y="14" rx="1"/>
                      <rect width="7" height="7" x="3" y="14" rx="1"/>
                    </svg>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
              </div>
              <h3 className="text-center font-serif text-[15px] md:text-[18px] lg:text-[20px] text-text-pink-500 group-hover:text-pink-500 transition-colors">
                {c.name}
              </h3>
            </motion.a>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
