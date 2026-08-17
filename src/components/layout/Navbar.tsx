"use client";

import React, { useState } from "react";
import { getFilterUrl } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { useSettingsStore } from "@/store/settingsStore";
import {
  Search,
  ShoppingCart,
  User as UserIcon,
  Menu,
  LayoutDashboard,
  LogOut,
  MapPin,
  Phone,
  Store,
  HelpCircle,
  ChevronDown,
  Mail,
  Globe,
} from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useShallow } from "zustand/react/shallow";
import { useAuth } from "@/context/AuthContext";
import {
  AnimatePresence,
  motion,
  useScroll,
  useMotionValueEvent,
} from "framer-motion";
import { Megamenu } from "@/components/layout/shared/Megamenu";
import { usePathname } from "next/navigation";
import { useNavigationStore } from "@/store/navigationStore";
import { useGlobalSearchStore } from "@/store/globalSearchStore";
import dynamic from "next/dynamic";

const LocationModal = dynamic(
  () =>
    import("@/components/layout/shared/LocationModal").then(
      (mod) => mod.LocationModal,
    ),
  { ssr: false },
);
const MobileSidebar = dynamic(
  () => import("@/components/layout/MobileSidebar"),
  { ssr: false },
);
const GlobalSearch = dynamic(() => import("@/components/search/GlobalSearch"), {
  ssr: false,
});

import "swiper/css";
import "swiper/css/free-mode";

interface NavbarProps {
  searchPlaceholder?: string;
  supportPhone?: string;
  deliveryLocation?: string;
}

export default function Navbar({
  searchPlaceholder = "Search for groceries (e.g. egg, milk, potato)",
  supportPhone = "+1 (800) 123-4567",
  deliveryLocation = "New York, 10001",
}: NavbarProps = {}) {
  const settings = useSettingsStore(useShallow((state) => state.settings));
  const cartItems = useCartStore((state) => state.items);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const { user, logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    }
    if (userMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [userMenuOpen]);

  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const { scrollY } = useScroll();

  const currentLocation = settings.deliveryLocation || deliveryLocation;
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const isHeroCategoryVisible = useNavigationStore(
    (state) => state.isHeroCategoryVisible,
  );
  const categories = useNavigationStore((state) => state.categories);
  const topNavbarItems = useNavigationStore((state) => state.topNavbarItems);
  const bottomNavbarItems = useNavigationStore(
    (state) => state.bottomNavbarItems,
  );

  React.useEffect(() => {
    if (isHeroCategoryVisible) {
      setIsMegaMenuOpen(false);
    }
  }, [isHeroCategoryVisible]);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;

    // Always show at absolute top
    if (latest <= 0) {
      setIsVisible(true);
      return;
    }

    // Threshold to avoid micro-jitters
    if (Math.abs(latest - previous) < 10) {
      return;
    }

    // Hide when scrolling down past 100px, show when scrolling up
    if (latest > previous && latest > 100) {
      setIsVisible(false);
    } else if (latest < previous) {
      setIsVisible(true);
    }
  });

  return (
    <>
      <header
        className={`sticky top-0 z-50 flex flex-col font-sans transition-transform duration-300 ${isVisible ? "translate-y-0" : "-translate-y-full"}`}
      >
        {/* Tier 1: Top Banner */}
        <div className="bg-pink-600 text-white shadow-md relative z-20 hidden md:block border-b border-pink-700">
          <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-1 flex justify-between items-center">
            <div className="flex items-center gap-5 text-white/95 text-[12px] font-semibold tracking-wide">
              <span className="hidden lg:flex items-center gap-2 hover:text-white transition-colors cursor-pointer">
                <MapPin size={15} className="text-white/70" />
                {(
                  settings.footer_address || "123 Grocery Ave, NY 10001"
                ).replace(/\n/g, ", ")}
              </span>
              <div className="hidden lg:block w-px h-4 bg-pink-700" />
              <span className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer">
                <Phone size={15} className="text-white/70" />
                {supportPhone}
              </span>
              <div className="hidden lg:block w-px h-4 bg-pink-700" />
              <span className="hidden xl:flex items-center gap-2 hover:text-white transition-colors cursor-pointer">
                <Mail size={15} className="text-white/70" />
                {settings.footer_email || "support@grocery.com"}
              </span>
            </div>
            <div className="flex items-center text-white/90 font-medium text-[12px]">
              <div className="hidden xl:flex items-center gap-6 relative">
                {topNavbarItems.map((item) => {
                  const hasDropdown = !!(
                    item.children && item.children.length > 0
                  );

                  return (
                    <div
                      key={item.id}
                      className="relative py-1 group cursor-pointer"
                      onMouseEnter={() => setHoveredCategory(item.id)}
                      onMouseLeave={() => setHoveredCategory(null)}
                      onClick={() => {
                        if (hasDropdown) {
                          setHoveredCategory(
                            hoveredCategory === item.id ? null : item.id,
                          );
                        }
                      }}
                    >
                      <Link
                        href={item.url}
                        target={item.target || "_self"}
                        className="hover:text-white transition-colors whitespace-nowrap flex items-center gap-1"
                      >
                        {item.title}
                        {hasDropdown && (
                          <ChevronDown
                            size={14}
                            className={`text-white/70 transition-transform duration-200 ${hoveredCategory === item.id ? "rotate-180 text-white" : ""}`}
                          />
                        )}
                      </Link>

                      {/* Dropdown Menu */}
                      <AnimatePresence>
                        {hasDropdown && hoveredCategory === item.id && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ duration: 0.15, ease: "easeOut" }}
                            className={`absolute top-full mt-1 min-w-[200px] w-max bg-white border border-gray-100 shadow-xl rounded-xl z-50 overflow-hidden text-gray-800 left-0`}
                          >
                            <div className="py-2 flex flex-col">
                              {item.children.map((subItem: any) => (
                                <Link
                                  key={subItem.id}
                                  href={subItem.url}
                                  target={subItem.target || "_self"}
                                  className="block px-4 py-2 text-[13px] font-medium text-gray-700 hover:text-pink-600 hover:bg-pink-50 transition-colors normal-case whitespace-nowrap"
                                >
                                  {subItem.title}
                                </Link>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Tier 2: Main Navbar */}
        <div className="bg-white text-gray-900 shadow-sm border-b border-gray-100 relative z-50">
          <div className="max-w-[1600px] mx-auto px-4 md:px-6 h-[clamp(60px,8vh,76px)] flex items-center justify-between gap-4 lg:gap-8">
            {/* Logo & Location area */}
            <div className="flex items-center gap-2 lg:gap-4 shrink-0">
              {/* Mobile Menu Toggle */}
              <button
                className="lg:hidden p-2 -ml-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100 transition-colors focus-visible:ring-2 focus-visible:ring-pink-500 outline-none"
                onClick={() => setIsMobileMenuOpen(true)}
                aria-label="Open mobile menu"
              >
                <Menu size={24} />
              </button>

              <Link
                href="/"
                className="flex items-center outline-none focus-visible:ring-2 focus-visible:ring-pink-500 rounded-xl group py-1.5"
              >
                <span className="text-2xl font-black tracking-tighter text-pink-600 flex items-center transition-transform group-hover:scale-[1.02]">
                  <Image
                    src={
                      !settings.store_logo ||
                      settings.store_logo === "null" ||
                      settings.store_logo === "undefined"
                        ? "/logo.png"
                        : settings.store_logo
                    }
                    alt={
                      !settings.store_name ||
                      settings.store_name === "null" ||
                      settings.store_name === "undefined"
                        ? "Famecart"
                        : settings.store_name
                    }
                    width={180}
                    height={50}
                    className="h-8 sm:h-10 md:h-12 w-auto object-contain shrink-0"
                    unoptimized
                  />
                </span>
              </Link>

              {/* Location Display */}
              <div className="hidden lg:flex items-center gap-2 pl-4 border-l border-gray-200">
                <div className="bg-gray-100 p-2 rounded-xl text-gray-600">
                  <MapPin size={18} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    Deliver to
                  </span>
                  <span
                    className="text-[13px] font-bold text-pink-600 cursor-pointer hover:text-pink-700 transition-colors"
                    onClick={() => setIsLocationModalOpen(true)}
                  >
                    {currentLocation}
                  </span>
                </div>
              </div>
            </div>

            {/* Search Bar - Desktop */}
            <div className="hidden md:flex flex-1 max-w-2xl relative group justify-center">
              <GlobalSearch desktopOnly />
            </div>

            {/* Right Area: Language, Cart, Profile */}
            <div className="flex items-center gap-2 lg:gap-4 shrink-0">
              {/* Mobile Search Trigger */}
              <button
                onClick={useGlobalSearchStore((state) => state.openSearch)}
                className="md:hidden w-10 h-10 flex items-center justify-center text-gray-600 hover:text-pink-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Language Dropdown */}
              <div className="relative group hidden sm:block">
                <button className="h-10 md:h-12 flex items-center gap-1.5 text-gray-600 hover:text-pink-600 font-bold text-sm px-2 transition-colors rounded-xl hover:bg-pink-50">
                  <Globe size={20} />
                  <span>EN</span>
                  <ChevronDown
                    size={14}
                    className="group-hover:rotate-180 transition-transform duration-200"
                  />
                </button>

                {/* Dropdown */}
                <div className="absolute right-0 top-full pt-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 min-w-[160px]">
                  <div className="bg-white border border-gray-100/60 rounded-2xl shadow-xl overflow-hidden py-1">
                    <button className="w-full text-left px-4 py-2.5 text-sm font-bold text-pink-600 bg-pink-50 transition-colors">
                      English (EN)
                    </button>
                    <button className="w-full text-left px-4 py-2.5 text-sm font-bold text-gray-600 hover:text-pink-600 hover:bg-pink-50 transition-colors">
                      Español (ES)
                    </button>
                    <button className="w-full text-left px-4 py-2.5 text-sm font-bold text-gray-600 hover:text-pink-600 hover:bg-pink-50 transition-colors">
                      Français (FR)
                    </button>
                    <button className="w-full text-left px-4 py-2.5 text-sm font-bold text-gray-600 hover:text-pink-600 hover:bg-pink-50 transition-colors">
                      ??????? (AR)
                    </button>
                  </div>
                </div>
              </div>

              {/* Icons */}
              <div className="flex items-center gap-1 lg:gap-2">
                <button
                  onClick={useCartStore((state) => state.openCart)}
                  className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center text-gray-600 hover:text-pink-600 hover:bg-gray-100 rounded-full transition-colors relative"
                >
                  <ShoppingCart className="w-5 h-5 md:w-6 md:h-6" />
                  <AnimatePresence>
                    {cartCount > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -top-0.5 -right-0.5 md:-top-1 md:-right-1 h-4 w-4 md:h-5 md:w-5 bg-pink-600 text-white text-[10px] md:text-[11px] font-bold flex items-center justify-center rounded-full shadow-sm"
                      >
                        {cartCount}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>

                {user ? (
                  <div className="relative" ref={userMenuRef}>
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center text-gray-600 bg-gray-100 hover:bg-gray-200 hover:text-pink-600 rounded-full transition-colors shadow-sm"
                    >
                      <UserIcon className="w-5 h-5 md:w-6 md:h-6" />
                    </button>
                    <AnimatePresence>
                      {userMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute right-0 mt-2 w-56 bg-white border border-gray-100/60 rounded-lg shadow-xl z-20 py-2 overflow-hidden"
                        >
                          <div className="px-4 py-3 border-b border-gray-50">
                            <p className="text-sm font-bold text-gray-900 truncate">
                              {user?.name}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {user?.role}
                            </p>
                          </div>
                          <Link
                            href={
                              user?.role === "ADMIN" ||
                              user?.role === "SUPER_ADMIN"
                                ? "/admin"
                                : "/dashboard"
                            }
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors font-medium"
                          >
                            <LayoutDashboard size={16} />
                            Dashboard
                          </Link>
                          <button
                            onClick={() => {
                              logout();
                              setUserMenuOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            <LogOut size={16} />
                            Sign Out
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 hidden sm:flex">
                    <Link
                      href="/login"
                      prefetch={false}
                      className="flex items-center justify-center px-4 py-2 text-sm font-bold text-gray-700 hover:text-pink-600 hover:bg-pink-50 rounded-xl transition-colors"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/register"
                      prefetch={false}
                      className="flex items-center justify-center px-4 py-2 text-sm font-bold text-white bg-pink-600 hover:bg-pink-700 rounded-xl transition-colors shadow-sm"
                    >
                      Register
                    </Link>
                  </div>
                )}
                {/* Mobile login icon fallback */}
                {!user && (
                  <Link
                    href="/login"
                    prefetch={false}
                    className="w-10 h-10 flex sm:hidden items-center justify-center text-gray-600 hover:text-pink-600 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <UserIcon className="w-5 h-5" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tier 3: Bottom Page Navigation */}
        <div className="bg-gray-50 border-b border-gray-200 relative z-40 block">
          <div className="max-w-[1600px] mx-auto px-4 md:px-6 flex justify-between items-start gap-2 md:gap-4 pt-1.5 pb-1 relative">
            {/* 1. Left: Shop By Category (Fixed width to align with hero sidebar) */}
            <div className="shrink-0 hidden md:flex items-center text-[11px] font-bold text-gray-800 uppercase tracking-tight z-50 lg:w-[22%]">
              <div
                className="flex items-center gap-2 cursor-pointer group py-1"
                onMouseEnter={() =>
                  !isHeroCategoryVisible && setIsMegaMenuOpen(true)
                }
                onMouseLeave={() => setIsMegaMenuOpen(false)}
                onClick={() =>
                  !isHeroCategoryVisible && setIsMegaMenuOpen(!isMegaMenuOpen)
                }
              >
                <Menu size={14} className="text-pink-600" />
                <span className="text-pink-600 font-black whitespace-nowrap">
                  SHOP BY CATEGORY
                </span>
                <AnimatePresence>
                  {isMegaMenuOpen && (
                    <Megamenu
                      themeColor="text-pink-600"
                      themeHover="hover:text-pink-600"
                      themeBorder="border-pink-600"
                      themeBgActive="bg-pink-50"
                      data={categories}
                    />
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* 2. Middle: Links (Scrollable if Overflowed) */}
            <div className="flex-1 flex items-start min-w-0 z-40 text-[12px] md:text-[12px] font-bold text-gray-800 uppercase tracking-tight px-0 md:px-2 justify-start xl:justify-center">
              <div className="w-full flex items-center gap-x-4 lg:gap-x-4 xl:gap-x-6 gap-y-2 overflow-x-auto scrollbar-hide pb-1 md:pb-0 flex-nowrap justify-start xl:justify-center">
                {bottomNavbarItems.map((item) => {
                  const hasDropdown = !!(
                    item.children && item.children.length > 0
                  );
                  const getUrl = (url: string) => getFilterUrl(url || "#");

                  return (
                    <div
                      key={item.id}
                      className="relative py-2.5 md:py-1.5 cursor-pointer flex items-center gap-1 hover:text-pink-600 transition-colors shrink-0 pointer-events-auto"
                      onMouseEnter={() => setHoveredCategory(item.id)}
                      onMouseLeave={() => setHoveredCategory(null)}
                      onClick={() => {
                        if (hasDropdown) {
                          setHoveredCategory(
                            hoveredCategory === item.id ? null : item.id,
                          );
                        }
                      }}
                    >
                      <Link
                        href={getUrl(item.url)}
                        target={item.target || "_self"}
                        className="whitespace-nowrap flex items-center gap-1"
                      >
                        {item.title}
                        {hasDropdown && (
                          <ChevronDown
                            size={14}
                            className={`text-gray-400 transition-transform duration-200 ${hoveredCategory === item.id ? "text-pink-600 rotate-180" : ""}`}
                          />
                        )}
                      </Link>

                      {/* Dropdown Menu (Hidden on Mobile due to horizontal scroll clipping) */}
                      <AnimatePresence>
                        {hasDropdown && hoveredCategory === item.id && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ duration: 0.15, ease: "easeOut" }}
                            className={`absolute top-full mt-1 min-w-[200px] w-max bg-white border border-gray-100 shadow-xl rounded-xl z-50 overflow-hidden text-gray-800 left-0 hidden md:block`}
                          >
                            <div className="py-2 flex flex-col">
                              {item.children.map((subItem: any) => (
                                <Link
                                  key={subItem.id}
                                  href={getUrl(subItem.url)}
                                  target={subItem.target || "_self"}
                                  className="block px-4 py-2 text-[13px] font-medium text-gray-700 hover:text-pink-600 hover:bg-pink-50 transition-colors normal-case whitespace-nowrap"
                                >
                                  {subItem.title}
                                </Link>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Support Links (Hidden on small screens to prevent squishing) */}
            <div className="hidden xl:flex items-center gap-6 text-[12px] font-medium text-gray-600 shrink-0">
              <Link
                href="/location-hours"
                className="flex items-center gap-1.5 hover:text-pink-600 transition-colors"
              >
                <Store size={14} className="text-gray-400" /> Our outlets
              </Link>
              <Link
                href="/help"
                className="flex items-center gap-1.5 hover:text-pink-600 transition-colors"
              >
                <HelpCircle size={14} className="text-gray-400" /> Help line
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Location Modal */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        themeColor="red"
      />

      {/* Mobile Sidebar */}
      <MobileSidebar
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        storeName={settings.store_name}
      />

      {/* Global Search Mobile Overlay */}
      <GlobalSearch mobileOnly />
    </>
  );
}
