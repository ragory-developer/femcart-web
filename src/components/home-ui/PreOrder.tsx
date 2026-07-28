"use client";

import React from "react";
import { ProductCard } from "./shared/ProductCard";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, FreeMode } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";

export default function PreOrder({
  title = "Pre-order Collection",
  description = "Reserve our upcoming innovations before they sell out. Ships October 15th.",
  products = [],
}: {
  title?: string;
  description?: string;
  products?: any[];
}) {
  return (
    <section className="bg-rose-50 py-6 md:py-16 mb-4 md:mb-16">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6">
        <div className="text-center mb-6 md:mb-10 max-w-2xl mx-auto">
          <h2 className="text-[26px] md:text-[36px] mb-2 md:mb-4">{title}</h2>
          <p className="text-[13px] md:text-[16px] leading-snug md:leading-normal text-amber-700">
            {description}
          </p>
        </div>

        {products && products.length > 0 ? (
          <Swiper
            modules={[Autoplay, FreeMode]}
            spaceBetween={4}
            slidesPerView={2.2}
            freeMode={true}
            autoplay={{
              delay: 4500,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            breakpoints={{
              640: { slidesPerView: 3, spaceBetween: 12 },
              1024: { slidesPerView: 4, spaceBetween: 16 },
              1280: { slidesPerView: 5, spaceBetween: 16 },
            }}
            className="!pt-4 !px-1 !pb-4"
          >
            {products.map((p) => (
              <SwiperSlide key={p.id}>
                <ProductCard product={p} />
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <div className="text-center py-8 text-amber-800">
            No products available for pre-order at the moment.
          </div>
        )}
      </div>
    </section>
  );
}
