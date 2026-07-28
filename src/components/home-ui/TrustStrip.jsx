"use client";
import React from 'react';
import { Package, Truck, ArrowLeftRight, CheckCircle } from 'lucide-react';

export default function TrustStrip() {
  const items = [
    { icon: Package, text: 'Cash on Delivery' },
    { icon: ArrowLeftRight, text: 'Instant Returns' },
    { icon: Truck, text: 'Delivery within 48hrs' },
    { icon: CheckCircle, text: 'Best Price Deal' }
  ];

  return (
    <section className="max-w-[1440px] mx-auto px-4 md:px-6 mb-4 md:mb-12 -mt-12 md:-mt-16 relative z-20">
      <div className="bg-white rounded-[16px] shadow-md border border-orange-200/50 py-6 px-4 md:px-8 grid grid-cols-2 md:flex md:flex-wrap md:justify-around items-center gap-4">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-pink-500">
              <item.icon size={20} strokeWidth={2} />
            </div>
            <span className="text-[12px] sm:text-[14px] text-text-pink-500 font-medium leading-tight">{item.text}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

