"use client";
import React from 'react';
import { Ruler } from 'lucide-react';

export default function SizeBanner() {
  return (
    <section className="max-w-[1440px] mx-auto px-4 md:px-6 mb-4 md:mb-16">
      <div className="relative rounded-[20px] overflow-hidden shadow-xl min-h-[240px] md:min-h-[320px] flex items-center group bg-pink-500">
        
        {/* Background Image */}
        <img 
          src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop" 
          alt="Woman checking size"
          className="absolute inset-0 w-full h-full object-cover object-[center_20%] transition-transform duration-1000 group-hover:scale-105"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-pink-600/95 via-pink-500/80 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-pink-600/80 to-transparent md:hidden"></div> {/* Extra legibility on mobile */}
        
        <div className="relative z-10 w-full max-w-lg p-6 md:p-12 text-white">
          <div className="inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/20 backdrop-blur-md mb-4">
            <Ruler size={20} className="text-white md:w-6 md:h-6" />
          </div>
          <h2 className="font-serif text-[28px] md:text-fluid-3xl text-white mb-2 md:mb-3 leading-[1.15]">
            Not Sure About Your Size?
          </h2>
          <p className="text-white/95 text-[13.5px] md:text-[15px] mb-6 md:mb-8 leading-snug md:leading-relaxed max-w-[280px] md:max-w-sm">
            Take our quick 2-minute fit quiz. Answer a few questions and let us find your perfect fit. We promise it's worth it.
          </p>
          <button className="inline-flex items-center justify-center h-11 md:h-12 px-6 md:px-8 rounded-full font-sans font-semibold text-[13.5px] md:text-[15px] tracking-[0.3px] transition-all duration-150 cursor-pointer bg-white text-pink-500 hover:bg-white/90 border-none shadow-sm">
            Find My Size
          </button>
        </div>
      </div>
    </section>
  );
}

