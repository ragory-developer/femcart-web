"use client";

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, FreeMode, Pagination } from "swiper/modules";
import { motion } from "framer-motion";
import Link from "next/link";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/pagination";

import { ProductCard } from "./shared/ProductCard";

export default function NewArrivals({ products = [] }: { products?: any[] }) {
  if (!products || products.length === 0) return null;

  return (
    <section className="mb-4 md:mb-16 bg-gradient-to-b from-transparent to-rose-50/30 py-6 md:py-20 border-b border-orange-200">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6 md:mb-12"
        >
          <span className="text-pink-500 font-semibold text-[13px] tracking-wider uppercase mb-2 block">
            Fresh Drops
          </span>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl mb-4">
            New This Week
          </h2>
          <p className="text-amber-700 text-[14px] md:text-[16px] leading-snug md:leading-normal max-w-2xl mx-auto">
            Discover the latest additions to our collection. Thoughtfully
            designed, perfectly fitted, and incredibly soft.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Swiper
            modules={[Autoplay, FreeMode, Pagination]}
            spaceBetween={4}
            slidesPerView={2.1}
            freeMode={true}
            pagination={{ clickable: true, dynamicBullets: true }}
            autoplay={{
              delay: 3500,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            breakpoints={{
              640: { slidesPerView: 3, spaceBetween: 12 },
              1024: { slidesPerView: 4, spaceBetween: 16 },
              1280: { slidesPerView: 5, spaceBetween: 16 },
            }}
            className="!pt-4 !px-1 !pb-12"
          >
            {products.map((p, i) => (
              <SwiperSlide key={p.id}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="h-full"
                >
                  <ProductCard product={p} />
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="text-center mt-4"
        >
          <Link
            href="/catalog"
            className="inline-flex items-center justify-center h-12 px-8 rounded-full font-sans font-semibold text-[15px] tracking-[0.3px] transition-all duration-150 cursor-pointer border-[1.5px] border-pink-500 text-pink-500 hover:bg-pink-500 hover:text-white"
          >
            Explore All New Arrivals
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
