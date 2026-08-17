/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
"use client";

import { useCartStore } from "@/store/cartStore";
import { useNavigationStore } from "@/store/navigationStore";
import { AnimatePresence, motion } from "framer-motion";
import { Leaf, Menu, Search, ShoppingCart, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

import { useAuth } from "@/context/AuthContext";
import { LayoutDashboard, LogOut, User as UserIcon } from "lucide-react";
import GlobalSearch from "@/components/search/GlobalSearch";

import { useSettingsStore } from "@/store/settingsStore";
import { API_URL } from "@/lib/config";

interface NavbarOriginalProps {
  searchPlaceholder?: string;
  supportPhone?: string;
  deliveryLocation?: string;
}

export default function NavbarOriginal({
  searchPlaceholder = "Search categories or brands...",
  supportPhone = "+1 (800) 123-4567",
  deliveryLocation = "New York, 10001",
}: NavbarOriginalProps = {}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const cartItems = useCartStore((state) => state.items);
  const navbarItems = useNavigationStore((state) => state.navbarItems);
  const settings = useSettingsStore((state) => state.settings);
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const categories = useNavigationStore((state) => state.categories);
  const fetchCategories = useNavigationStore((state) => state.fetchCategories);
  const [brands, setBrands] = useState<any[]>([]);
  const [drawerSearch, setDrawerSearch] = useState("");
  const [hoveredNavId, setHoveredNavId] = useState<string | null>(null);

  // Reset drawer search when menu is toggled/closed
  useEffect(() => {
    if (!mobileMenuOpen) {
      setDrawerSearch("");
    }
  }, [mobileMenuOpen]);

  // Fetch Categories for Mobile Menu
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Fetch Brands for Mobile Menu
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await fetch(`${API_URL}/api/brands?limit=15`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
            setBrands(json.data);
          }
        }
      } catch (e) {
        console.error("Failed to fetch brands in navbar:", e);
      }
    };
    if (mobileMenuOpen) {
      fetchBrands();
    }
  }, [mobileMenuOpen]);

  // Prevent hydration mismatch for Zustand
  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const cartCount = mounted
    ? cartItems.reduce((acc, item) => acc + item.quantity, 0)
    : 0;

  const filteredCategories = categories.filter((cat: any) =>
    cat.name.toLowerCase().includes(drawerSearch.toLowerCase()),
  );

  const filteredBrands = brands.filter((brand: any) =>
    brand.name.toLowerCase().includes(drawerSearch.toLowerCase()),
  );

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-300 bg-white border-b border-gray-100 ${isScrolled ? "backdrop-blur-md shadow-md bg-white/95" : ""}`}
      >
        <div className="container mx-auto px-4 md:px-6 flex items-center h-16 md:h-20 gap-4 lg:gap-8">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 sm:gap-3 group z-50 outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-xl shrink-0"
          >
            {settings.store_logo ? (
              <Image
                src={settings.store_logo}
                alt={settings.store_name || "Logo"}
                width={150}
                height={40}
                unoptimized
                priority
                className="h-8 sm:h-10 w-auto object-contain shrink-0 group-hover:scale-105 transition-transform duration-300 drop-shadow-sm rounded-none mix-blend-multiply"
              />
            ) : (
              <div className="bg-lime text-forest p-1.5 sm:p-2 rounded-none sm:rounded-none shadow-sm shrink-0 group-hover:shadow-md group-hover:-translate-y-0.5 transition-all duration-300">
                <Leaf className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            )}
            <span className="text-lg sm:text-xl md:text-2xl font-black tracking-tight text-gray-900 truncate max-w-[120px] sm:max-w-[180px] md:max-w-[220px] font-display">
              {settings.store_name || "Famecart"}
            </span>
          </Link>

          {/* Desktop Search */}
          <div className="hidden md:flex flex-1 justify-start ml-2 lg:ml-6">
            <GlobalSearch desktopOnly />
          </div>

          {/* Right Side: Nav Links & Actions Wrapper */}
          <div className="flex items-center justify-end min-w-0 shrink ml-auto">
            {/* Desktop Navigation - wrapped for clipping door effect */}
            <div className="hidden lg:flex items-center justify-start min-w-0 [clip-path:inset(-100vh_0_-100vh_0)] transition-all duration-300 ease-in-out">
              <nav
                className="flex items-center gap-1 xl:gap-2 font-medium shrink-0 pr-4 lg:pr-8"
                onMouseLeave={() => setHoveredNavId(null)}
              >
                {navbarItems
                  .filter((item: any) => item.isActive)
                  .sort((a: any, b: any) => a.sortOrder - b.sortOrder)
                  .map((item: any) => {
                    const itemUrl = item.url
                      ? item.url.startsWith("http") ||
                        item.url.startsWith("#") ||
                        item.url.startsWith("/")
                        ? item.url
                        : `/${item.url}`
                      : "#";
                    const isActive = pathname === itemUrl;
                    const isHovered = hoveredNavId === item.id;
                    const showSlider = hoveredNavId ? isHovered : isActive;

                    return (
                      <div
                        key={item.id}
                        className="relative group"
                        onMouseEnter={() => setHoveredNavId(item.id)}
                      >
                        <Link
                          href={itemUrl}
                          target={item.target || "_self"}
                          className={cn(
                            "relative z-10 text-[12px] lg:text-[13px] font-semibold transition-colors duration-300 px-4 py-2 inline-flex items-center gap-1.5",
                            isActive
                              ? "text-forest"
                              : isHovered
                                ? "text-forest"
                                : "text-gray-600 hover:text-gray-900",
                          )}
                        >
                          {item.title}
                          {item.children?.length > 0 && (
                            <span className="text-[10px] opacity-50 ml-0.5">
                              ▼
                            </span>
                          )}
                        </Link>

                        {/* Elegant Background Pill */}
                        {showSlider && (
                          <motion.div
                            layoutId="desktop-nav-slider"
                            className="absolute inset-0 bg-emerald-50 dark:bg-emerald-900/20 rounded-full pointer-events-none"
                            initial={false}
                            transition={{
                              type: "spring",
                              stiffness: 350,
                              damping: 30,
                              mass: 1,
                            }}
                          />
                        )}

                        {item.children?.length > 0 && (
                          <div className="absolute top-full left-0 mt-4 w-48 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all py-2 z-50">
                            {item.children
                              .filter((child: any) => child.isActive)
                              .map((child: any) => (
                                <Link
                                  key={child.id}
                                  href={
                                    child.url
                                      ? child.url.startsWith("http") ||
                                        child.url.startsWith("#") ||
                                        child.url.startsWith("/")
                                        ? child.url
                                        : `/${child.url}`
                                      : "#"
                                  }
                                  target={child.target || "_self"}
                                  className={`block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-gray-800 hover:text-emerald-600 transition-colors ${child.cssClass || ""}`}
                                >
                                  {child.title}
                                </Link>
                              ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </nav>
            </div>

            {/* Actions Container - Fixed position, never shrinks */}
            <div className="flex items-center gap-4 lg:gap-8 shrink-0">
              {/* Vertical Divider (Desktop only) */}
              <div className="hidden lg:block w-px h-8 bg-gray-200 dark:bg-gray-800 shrink-0" />

              {/* Actions */}
              <div className="flex items-center gap-1.5 sm:gap-3 desktop-actions shrink-0">
                <div className="md:hidden">
                  <GlobalSearch mobileOnly />
                </div>

                <button
                  onClick={useCartStore((state) => state.openCart)}
                  className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center text-gray-600 hover:text-forest hover:bg-emerald-50 rounded-full transition-colors relative"
                >
                  <ShoppingCart className="w-5 h-5 md:w-6 md:h-6" />
                  <AnimatePresence>
                    {cartCount > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -top-0.5 -right-0.5 md:-top-1 md:-right-1 h-4 w-4 md:h-5 md:w-5 bg-brand-red text-white text-[10px] md:text-[11px] font-bold flex items-center justify-center rounded-full border-2 border-white dark:border-gray-950 shadow-sm"
                      >
                        {cartCount}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>

                {user ? (
                  <div className="relative">
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center text-forest bg-emerald-50 hover:bg-emerald-100 rounded-full transition-colors"
                    >
                      <UserIcon className="w-5 h-5 md:w-6 md:h-6" />
                    </button>
                    <AnimatePresence>
                      {userMenuOpen && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setUserMenuOpen(false)}
                          ></div>
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-lg shadow-xl z-20 py-2 overflow-hidden"
                          >
                            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                              <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
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
                              className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
                            >
                              <LayoutDashboard size={16} />
                              Dashboard
                            </Link>
                            <button
                              onClick={() => {
                                logout();
                                setUserMenuOpen(false);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                            >
                              <LogOut size={16} />
                              Logout
                            </button>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    prefetch={false}
                    className="w-10 h-10 md:w-12 md:h-12 flex flex-col items-center justify-center text-gray-600 hover:text-forest hover:bg-emerald-50 rounded-full transition-colors hidden sm:flex"
                  >
                    <UserIcon className="w-5 h-5 md:w-6 md:h-6" />
                  </Link>
                )}

                {/* Mobile menu trigger */}
                <button
                  className="md:hidden w-10 h-10 flex items-center justify-center text-gray-600 rounded-full bg-gray-50 hover:bg-emerald-50 hover:text-forest z-50 transition-colors active:bg-gray-200 ml-1"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  aria-label="Toggle mobile menu"
                >
                  {mobileMenuOpen ? (
                    <X className="w-5 h-5" />
                  ) : (
                    <Menu className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[100] bg-gray-900/40 backdrop-blur-sm md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />

            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-[110] w-[85vw] max-w-sm bg-white dark:bg-gray-950 flex flex-col pt-6 px-6 pb-[env(safe-area-inset-bottom)] md:hidden overflow-y-auto shadow-2xl border-r border-gray-100 dark:border-gray-800"
            >
              <div className="flex items-center justify-between mb-8">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 shrink-0 min-w-0 pr-2"
                >
                  {settings.store_logo ? (
                    <Image
                      unoptimized
                      src={settings.store_logo}
                      alt={settings.store_name || "Logo"}
                      width={150}
                      height={36}
                      className="h-9 w-auto object-contain shrink-0 drop-shadow-sm rounded-md mix-blend-multiply"
                    />
                  ) : (
                    <div className="bg-lime text-forest p-1.5 rounded-lg shadow-sm shrink-0">
                      <Leaf className="w-5 h-5" />
                    </div>
                  )}
                  <span className="text-xl font-black tracking-tight text-forest truncate font-display">
                    {settings.store_name || "Femcart"}
                  </span>
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 -mr-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors active:bg-gray-200"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex flex-col gap-5 flex-grow overflow-hidden">
                {/* Search Bar */}
                <div className="relative group pt-1 shrink-0">
                  <input
                    type="text"
                    placeholder={searchPlaceholder}
                    value={drawerSearch}
                    onChange={(e) => setDrawerSearch(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-lg text-xs font-semibold text-gray-900 dark:text-white outline-none focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 hover:border-gray-250 dark:hover:border-gray-700 transition-all duration-300 placeholder:text-gray-400"
                  />
                  <Search
                    size={14}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors"
                  />
                  {drawerSearch && (
                    <button
                      onClick={() => setDrawerSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors active:scale-95"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Main Navigation Links */}
                <div className="flex flex-col gap-2 shrink-0 border-b border-gray-100 dark:border-gray-900 pb-4">
                  {navbarItems
                    .filter((item: any) => item.isActive)
                    .sort((a: any, b: any) => a.sortOrder - b.sortOrder)
                    .map((item: any) => {
                      const itemUrl = item.url
                        ? item.url.startsWith("http") ||
                          item.url.startsWith("#") ||
                          item.url.startsWith("/")
                          ? item.url
                          : `/${item.url}`
                        : "#";
                      return (
                        <Link
                          key={item.id}
                          href={itemUrl}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-bold transition-all"
                        >
                          {item.title}
                        </Link>
                      );
                    })}
                </div>

                {/* Categories Section */}
                <div className="flex-[3] flex flex-col min-h-0">
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100 dark:border-gray-900">
                    <h3 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-[0.2em]">
                      Categories
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400">
                      {drawerSearch
                        ? `${filteredCategories.length} Found`
                        : `${categories.length} Total`}
                    </span>
                  </div>
                  <div className="flex-1 overflow-y-auto pr-1 space-y-1.5 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-gray-200 dark:[&::-webkit-scrollbar-thumb]:bg-gray-800 [&::-webkit-scrollbar-thumb]:rounded-full">
                    {filteredCategories.length > 0 ? (
                      filteredCategories.map((cat: any) => (
                        <Link
                          key={cat.id}
                          href={`/categories/${cat.slug}`}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center justify-between py-2 px-3 rounded-[15px] border border-transparent hover:border-gray-100 dark:hover:border-gray-900 hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition-all duration-300 group"
                        >
                          <div className="flex items-center gap-3">
                            {cat.image ? (
                              <Image
                                unoptimized
                                src={cat.image}
                                alt={cat.name}
                                width={32}
                                height={32}
                                className="w-8 h-8 rounded-xl object-cover bg-gray-100 dark:bg-gray-800 transition-transform duration-300 group-hover:scale-105 shrink-0"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 flex items-center justify-center transition-transform duration-300 group-hover:scale-105 shrink-0">
                                <Leaf size={14} />
                              </div>
                            )}
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:font-bold transition-colors">
                              {cat.name}
                            </span>
                          </div>
                          {cat.count !== undefined && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-50 dark:bg-gray-900/40 text-gray-400 dark:text-gray-500 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/30 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors shrink-0">
                              {cat.count}
                            </span>
                          )}
                        </Link>
                      ))
                    ) : categories.length > 0 ? (
                      <div className="text-center py-8">
                        <span className="text-xs text-gray-400 font-medium">
                          No categories matching &ldquo;{drawerSearch}&rdquo;
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 py-4 px-3">
                        <span className="text-xs text-gray-400">
                          Loading categories...
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <hr className="border-gray-100 dark:border-gray-900 my-0.5" />

                {/* Brands Section */}
                <div className="flex-[2] flex flex-col min-h-0">
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100 dark:border-gray-900">
                    <h3 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-[0.2em]">
                      Popular Brands
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400">
                      {drawerSearch
                        ? `${filteredBrands.length} Found`
                        : `${brands.length} Total`}
                    </span>
                  </div>
                  <div className="flex-1 overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-gray-200 dark:[&::-webkit-scrollbar-thumb]:bg-gray-800 [&::-webkit-scrollbar-thumb]:rounded-full">
                    <div className="flex flex-wrap gap-2 pb-4">
                      {filteredBrands.length > 0 ? (
                        filteredBrands.map((brand: any) => (
                          <Link
                            key={brand.id}
                            href={`/brands/${brand.slug}`}
                            onClick={() => setMobileMenuOpen(false)}
                            className="text-xs font-bold px-3 py-1.5 rounded-[12px] border border-gray-100 dark:border-gray-900 text-gray-600 dark:text-gray-400 hover:border-emerald-500/30 dark:hover:border-emerald-500/30 hover:text-emerald-600 dark:hover:text-emerald-400 bg-white dark:bg-gray-950/30 hover:bg-emerald-50/10 dark:hover:bg-emerald-950/10 transition-all hover:scale-[1.02] shadow-[0_1px_4px_rgba(0,0,0,0.01)]"
                          >
                            {brand.name}
                          </Link>
                        ))
                      ) : brands.length > 0 ? (
                        <div className="w-full text-center py-6">
                          <span className="text-xs text-gray-400 font-medium">
                            No brands matching &ldquo;{drawerSearch}&rdquo;
                          </span>
                        </div>
                      ) : (
                        <div className="px-3 py-2">
                          <span className="text-xs text-gray-400">
                            Loading brands...
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {user ? (
                  <div className="flex flex-col gap-4 mt-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                        <UserIcon size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                          {user.name}
                        </p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 font-bold hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                    >
                      <LogOut size={18} />
                      Log Out
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 mt-4">
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full text-center py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      Log In
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full text-center py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>

              <div className="mt-8 pb-8">
                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex items-start gap-4 border border-emerald-100 dark:border-emerald-800/30">
                  <div className="bg-emerald-100 dark:bg-emerald-800/50 p-2.5 rounded-full text-emerald-600 dark:text-emerald-400 mt-0.5">
                    <Leaf size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white text-sm">
                      Fresh Promise
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
                      100% Organic & Fresh delivery to your door in 30 minutes.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
