"use client";
import React from "react";

export default function Editorial({
  img = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1440&auto=format&fit=crop",
  badgeText = "Editorial",
  title = "The Softness You Deserve",
  description = "Experience our new Cloud Cotton collection. Responsibly sourced, expertly crafted, and impossibly soft against your skin.",
  buttonText = "Explore the Edit",
  buttonLink = "/category/all",
}: {
  img?: string;
  badgeText?: string;
  title?: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
}) {
  return (
    <section className="mb-8 md:mb-16">
      <div className="relative h-[300px] md:h-[400px] w-full flex items-center justify-center">
        <img
          src={img}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover object-[center_30%]"
        />
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="relative z-10 flex flex-col items-center justify-center text-center p-6 max-w-xl">
          <span className="text-white text-[13px] font-semibold tracking-[0.2em] uppercase mb-3">
            {badgeText}
          </span>
          <h2 className="font-serif text-[32px] md:text-[48px] text-white leading-tight mb-4">
            {title}
          </h2>
          <p className="text-white/90 text-[15px] md:text-[16px] mb-8">
            {description}
          </p>
          <a
            href={buttonLink}
            className="inline-flex items-center justify-center h-12 px-6 rounded-full font-sans font-semibold text-[15px] tracking-[0.3px] transition-all duration-150 cursor-pointer bg-pink-500 text-white hover:bg-pink-600 active:scale-[0.98]"
          >
            {buttonText}
          </a>
        </div>
      </div>
    </section>
  );
}
