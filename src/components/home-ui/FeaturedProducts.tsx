"use client";

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, FreeMode, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/pagination";

import { ProductCard } from "./shared/ProductCard";

export default function FeaturedProducts({
  products = [],
  bannerBadge = "Curated Collection",
  bannerTitle = "The Comfort Edit",
  bannerDesc = "Discover our most loved pieces, designed to provide unmatched softness and support for your everyday routine.",
  bannerButtonText = "Shop The Edit",
  bannerImage = "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop",
}: {
  products?: any[];
  bannerBadge?: string;
  bannerTitle?: string;
  bannerDesc?: string;
  bannerButtonText?: string;
  bannerImage?: string;
}) {
  if (!products || products.length === 0) return null;

  return (
    <section className="max-w-[1440px] mx-auto px-4 md:px-6 mb-4 md:mb-16">
      {/* Promotional Banner */}
      <div className="w-full bg-pink-500/10 rounded-[24px] overflow-hidden mb-12 flex flex-col md:flex-row items-center border border-pink-500/20">
        <div className="md:w-1/2 p-4 md:p-8 text-center md:text-left">
          <span className="text-pink-500 font-semibold text-[13px] tracking-wider uppercase mb-2 block">
            {bannerBadge}
          </span>
          <h3 className="font-serif text-3xl md:text-4xl lg:text-5xl mb-2">
            {bannerTitle}
          </h3>
          <p className="text-amber-700 text-[13px] md:text-[15px] leading-snug md:leading-normal mb-4 md:mb-6">
            {bannerDesc}
          </p>
          {bannerButtonText && (
            <button className="inline-flex items-center justify-center h-10 px-6 rounded-full font-sans font-semibold text-[14px] tracking-[0.3px] transition-all duration-150 cursor-pointer bg-pink-500 text-white hover:bg-pink-600 active:scale-[0.98]">
              {bannerButtonText}
            </button>
          )}
        </div>
        <div className="md:w-1/2 h-64 md:h-[280px] self-stretch">
          <img
            src={bannerImage}
            alt={bannerTitle}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      <Swiper
        modules={[Autoplay, FreeMode, Pagination]}
        spaceBetween={4}
        slidesPerView={2.1}
        freeMode={true}
        pagination={{ clickable: true, dynamicBullets: true }}
        autoplay={{
          delay: 4000,
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
        {products.map((p) => (
          <SwiperSlide key={p.id}>
            <ProductCard product={p} />
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
