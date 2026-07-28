"use client";
import React from 'react';
import { Shield, Package, Truck, Headset } from 'lucide-react';

export default function WhyShop() {
  const features = [
    { icon: Shield, title: 'Premium Quality', desc: 'Tested for perfect fit and durability.' },
    { icon: Package, title: 'Discreet Packaging', desc: 'Your privacy is fully protected with us.' },
    { icon: Truck, title: 'Fast Delivery', desc: 'Get your products quickly and securely.' },
    { icon: Headset, title: 'Customer Support', desc: 'We are here to help you anytime.' }
  ];

  return (
    <section className="max-w-[1440px] mx-auto px-4 md:px-6 mb-4 md:mb-16 py-8 md:py-16 border-y border-orange-200">
      <div className="text-center mb-6 md:mb-10">
        <h2 className="text-[26px] md:text-[32px] font-serif">Why Femecart?</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map((f, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="w-12 h-12 shrink-0 bg-rose-50 text-pink-500 rounded-[12px] flex items-center justify-center">
              <f.icon size={24} strokeWidth={1.5} />
            </div>
            <div>
              <h4 className="font-serif text-[16px] mb-1">{f.title}</h4>
              <p className="text-[13px] md:text-[14px] leading-snug md:leading-normal text-text-amber-700">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

