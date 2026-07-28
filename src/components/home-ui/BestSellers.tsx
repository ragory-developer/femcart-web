"use client";

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Autoplay } from "swiper/modules";
import { motion } from "framer-motion";
import Link from "next/link";

import "swiper/css";
import "swiper/css/free-mode";

import { ProductCard } from "./shared/ProductCard";

export default function BestSellers({ products = [] }: { products?: any[] }) {
  // Chunk the products into pairs to easily render them in two rows within the swiper slide
  const chunkedProducts = [];
  for (let i = 0; i < products.length; i += 2) {
    chunkedProducts.push(products.slice(i, i + 2));
  }

  return (
    <section className="mb-4 md:mb-16 bg-rose-50/30 py-6 md:py-12 border-y border-orange-200">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex justify-between items-end mb-4 md:mb-8">
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl">
              Best Sellers
            </h2>
            <Link
              href="/catalog"
              className="hidden md:inline-flex items-center justify-center h-12 px-6 rounded-full font-sans font-semibold text-[14px] tracking-[0.3px] transition-all duration-150 cursor-pointer bg-transparent text-pink-500"
            >
              Shop All &rarr;
            </Link>
          </div>

          <Swiper
            modules={[FreeMode, Autoplay]}
            spaceBetween={4}
            slidesPerView={2.1}
            freeMode={true}
            autoplay={{
              delay: 2500,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            breakpoints={{
              640: { slidesPerView: 3.2, spaceBetween: 12 },
              1024: { slidesPerView: 4.2, spaceBetween: 16 },
              1280: { slidesPerView: 5.2, spaceBetween: 16 },
            }}
            className="!pt-4 !px-1 !pb-8"
          >
            {chunkedProducts.map((chunk, i) => (
              <SwiperSlide key={i} className="h-auto">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="h-full flex flex-col gap-4"
                >
                  {chunk.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>
        </motion.div>
      </div>
    </section>
  );
}
