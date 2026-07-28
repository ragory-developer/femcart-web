"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function LimitedOffers({
  title = "Flash Sale: 40% Off Basics",
  buttonText = "Shop The Sale",
  buttonLink = "/category/sale",
}: {
  title?: string;
  buttonText?: string;
  buttonLink?: string;
}) {
  const [timeLeft, setTimeLeft] = useState({ hours: 12, minutes: 45 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.minutes === 0) {
          return { hours: prev.hours - 1, minutes: 59 };
        }
        return { ...prev, minutes: prev.minutes - 1 };
      });
    }, 60000); // update every minute per spec
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="bg-pink-500 text-white py-6 md:py-12 mb-4 md:mb-16 text-center">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6">
        <h2 className="text-[26px] md:text-[36px] text-white mb-4 md:mb-6">
          {title}
        </h2>
        <div className="flex justify-center items-center gap-4 text-champagne font-serif text-[32px] tabular-nums mb-6 md:mb-8">
          <div className="flex flex-col items-center">
            <span className="font-semibold">
              {String(timeLeft.hours).padStart(2, "0")}
            </span>
            <span className="text-[12px] uppercase tracking-wider font-sans font-normal text-white">
              Hours
            </span>
          </div>
          <span className="pb-4">:</span>
          <div className="flex flex-col items-center">
            <span className="font-semibold">
              {String(timeLeft.minutes).padStart(2, "0")}
            </span>
            <span className="text-[12px] uppercase tracking-wider font-sans font-normal text-white">
              Minutes
            </span>
          </div>
        </div>
        {buttonText && (
          <Link
            href={buttonLink || "#"}
            className="inline-flex items-center justify-center h-12 px-6 rounded-full font-sans font-semibold text-[15px] tracking-[0.3px] transition-all duration-150 cursor-pointer bg-white text-pink-500 hover:bg-white/90 border-none"
          >
            {buttonText}
          </Link>
        )}
      </div>
    </section>
  );
}
