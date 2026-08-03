"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  User,
  ShoppingBag,
  X,
  Menu,
  ChevronDown,
  Phone,
  Mail,
} from "lucide-react";
import Lenis from "lenis";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import "lenis/dist/lenis.css";
import { useGlobalSearchStore } from "@/store/globalSearchStore";
import { useCartStore } from "@/store/cartStore";
import GlobalSearch from "@/components/search/GlobalSearch";
import MobileSidebar from "@/components/layout/MobileSidebar";
import { useNavigationStore } from "@/store/navigationStore";
import { useSettingsStore } from "@/store/settingsStore";
import { getFilterUrl } from "@/lib/utils";

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const openSearch = useGlobalSearchStore((state) => state.openSearch);
  const openCart = useCartStore((state) => state.openCart);
  const { topNavbarItems, footerSections } = useNavigationStore();
  const settings = useSettingsStore((state) => state.settings);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll);

    return () => {
      lenis.destroy();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDFB]">
      {/* Top Bar */}
      {settings?.top_bar_text && settings.top_bar_text.trim() !== "" && (
        <div className="bg-[#E32857] text-white h-9 flex items-center justify-center text-[13px] font-medium tracking-wide">
          {settings.top_bar_text}
        </div>
      )}

      {/* Navigation */}
      <nav
        className={`sticky top-0 bg-white/95 backdrop-blur-md border-b z-[90] transition-shadow duration-300 flex items-center h-[72px] ${scrolled ? "border-pink-100 shadow-sm" : "border-pink-50"}`}
      >
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 w-full flex justify-between items-center">
          {/* Logo (Left) */}
          <div className="flex items-center justify-start flex-shrink-0">
            <button
              className="lg:hidden p-2 mr-2 text-text-pink-500 hover:text-pink-500 transition-colors"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} strokeWidth={1.5} />
            </button>
            <Link
              href="/"
              className="relative flex flex-col items-center justify-center font-bold text-[26px] text-[#E32857]"
              style={{ letterSpacing: "-0.5px" }}
            >
              {settings?.store_logo &&
              settings.store_logo !== "null" &&
              settings.store_logo !== "undefined" &&
              !logoError ? (
                <img
                  src={settings.store_logo}
                  alt={settings.store_name || "Femecart"}
                  className="h-8 md:h-10 w-auto object-contain"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <>
                  <svg
                    className="absolute -top-[6px]"
                    width="30"
                    height="18"
                    viewBox="0 0 32 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M5 15L3 7L10 10L16 2L22 10L29 7L27 15H5Z"
                      fill="#E32857"
                    />
                    <circle cx="3" cy="5" r="2" fill="#E32857" />
                    <circle cx="10" cy="8" r="2" fill="#E32857" />
                    <circle cx="16" cy="0" r="2" fill="#E32857" />
                    <circle cx="22" cy="8" r="2" fill="#E32857" />
                    <circle cx="29" cy="5" r="2" fill="#E32857" />
                  </svg>
                  <span className="leading-none mt-1">
                    {settings?.store_name || "Femcart"}
                  </span>
                </>
              )}
            </Link>
          </div>

          {/* Navigation Links (Center) */}
          <ul className="hidden lg:flex flex-1 justify-center gap-8 xl:gap-10 list-none items-center text-gray-800 text-[14px] font-medium whitespace-nowrap px-4">
            {topNavbarItems?.map((item: any) => {
              const hasDropdown = !!(item.children && item.children.length > 0);
              const isActive =
                pathname === item.url ||
                pathname === getFilterUrl(item.url || "#");

              if (hasDropdown) {
                return (
                  <li
                    key={item.id}
                    className="relative group flex items-center gap-1 cursor-pointer transition-colors py-4"
                  >
                    <span
                      className={`hover:text-[#E32857] transition-colors ${isActive ? "text-[#E32857]" : ""}`}
                    >
                      {item.title}
                    </span>
                    <ChevronDown size={14} strokeWidth={2.5} />
                    <div className="absolute top-full left-0 hidden group-hover:block z-50 -mt-2 pt-2">
                      <ul className="bg-white border border-gray-100 shadow-xl py-3 min-w-[220px] flex flex-col font-normal text-[14.5px] text-gray-800">
                        {item.children.map((child: any) => (
                          <li key={child.id}>
                            <Link
                              href={getFilterUrl(child.url || "#")}
                              className="block px-6 py-2.5 hover:bg-rose-50 hover:text-[#E32857] transition-colors"
                            >
                              {child.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </li>
                );
              }

              return (
                <li key={item.id}>
                  <Link
                    href={getFilterUrl(item.url || "#")}
                    className={`relative transition-colors py-2 block ${isActive ? "text-[#E32857]" : "hover:text-[#E32857]"}`}
                  >
                    {item.title}
                    {isActive && (
                      <span className="absolute -bottom-[2px] left-0 w-full h-[1.5px] bg-[#E32857]"></span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Icons (Right) */}
          <div className="flex gap-5 items-center justify-end flex-shrink-0 ml-auto">
            <button
              onClick={openSearch}
              className="text-[#333333] hover:text-[#E32857] transition-colors"
            >
              <Search size={21} strokeWidth={1.25} />
            </button>
            <Link
              href="/profile"
              className="text-[#333333] hover:text-[#E32857] transition-colors"
            >
              <User size={21} strokeWidth={1.25} />
            </Link>
            <button
              onClick={openCart}
              className="relative text-[#333333] hover:text-[#E32857] transition-colors"
            >
              <ShoppingBag size={21} strokeWidth={1.25} />
            </button>
          </div>
        </div>
      </nav>

      <GlobalSearch />

      {/* Mobile Menu Drawer */}
      <MobileSidebar
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        storeName={settings?.store_name || "Femecart"}
      />

      {/* Main Content */}
      <main className="flex-grow">{children}</main>

      {/* Footer */}
      <footer className="bg-white pt-10 md:pt-16 pb-8 border-t border-orange-200 mt-8 md:mt-20">
        <div className="max-w-[1440px] mx-auto px-4 md:px-6 flex flex-col md:flex-row gap-y-10 gap-x-4 md:gap-12 justify-between text-center md:text-left">
          <div className="w-full md:w-1/3 flex flex-col items-center md:items-start">
            <Link
              href="/"
              className="font-serif font-semibold text-pink-500 text-[32px] inline-block mb-4"
            >
              {settings?.store_logo &&
              settings.store_logo !== "null" &&
              settings.store_logo !== "undefined" &&
              !logoError ? (
                <img
                  src={settings.store_logo}
                  alt={settings.store_name || "Femecart"}
                  className="h-10 w-auto object-contain"
                  onError={() => setLogoError(true)}
                />
              ) : (
                settings?.store_name || "Femecart"
              )}
            </Link>
            <p className="text-text-amber-700 text-[14px] mb-4 max-w-sm md:max-w-none">
              {settings?.footer_about_text ||
                "Providing comfortable bras and panties to women across Bangladesh."}
            </p>
            <p className="text-text-pink-500 text-[14px] font-medium flex items-center justify-center md:justify-start gap-2">
              <Phone size={16} className="text-pink-500" strokeWidth={2} />{" "}
              {settings?.footer_phone || "+880 1812 345678"}
            </p>
            <p className="text-text-pink-500 text-[14px] font-medium flex items-center justify-center md:justify-start gap-2 mt-2">
              <Mail size={16} className="text-pink-500" strokeWidth={2} />{" "}
              {settings?.footer_email || "support@femecart.com"}
            </p>
          </div>

          <div className="w-full md:w-2/3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-10 gap-x-4">
            {footerSections?.map((section: any) => (
              <div key={section.id} className="flex flex-col items-center md:items-start">
                <h4 className="font-serif text-[16px] md:text-[18px] mb-3 md:mb-4">
                  {section.title}
                </h4>
                <ul className="flex flex-col gap-2 md:gap-3 text-text-amber-700 text-[13px] md:text-[14px] items-center md:items-start">
                  {section.links?.map((link: any) => (
                    <li key={link.id}>
                      <Link
                        href={link.url || "#"}
                        className="hover:text-pink-500 transition-colors"
                      >
                        {link.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        
        <div className="max-w-[1440px] mx-auto px-4 md:px-6 border-t border-orange-200 mt-10 md:mt-12 pt-6 flex flex-col items-center justify-center text-text-amber-700 text-[13px] gap-4 md:gap-2 text-center">
          <div className="flex flex-col md:flex-row gap-2 md:gap-4 items-center">
            <span className="font-semibold text-text-pink-500">We Accept:</span>
            <div className="flex flex-wrap justify-center gap-2">
              {[
                settings?.payment_enable_bkash !== "false" && "bKash",
                settings?.payment_enable_nagad !== "false" && "Nagad",
                settings?.payment_enable_cod !== "false" && "COD",
                settings?.payment_enable_card !== "false" && "Cards",
                settings?.payment_enable_stripe !== "false" && "Stripe",
                settings?.payment_enable_paypal !== "false" && "PayPal",
              ]
                .filter(Boolean)
                .join(" • ") || "No payment methods configured"}
            </div>
          </div>
          <p>
            &copy; {new Date().getFullYear()}{" "}
            {settings?.store_name || "Femecart"}. {settings?.footer_copyright || "All rights reserved."}
          </p>
        </div>
      </footer>
    </div>
  );
}
