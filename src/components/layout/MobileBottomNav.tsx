"use client";

import { useCartStore } from "@/store/cartStore";
import { useAuth } from "@/context/AuthContext";
import { Home, LayoutGrid, ShoppingCart, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getFilterUrl } from "@/lib/utils";
import { useEffect, useState } from "react";

export interface MobileBottomNavProps {
  bgColor?: string;
  inactiveColor?: string;
  activeColor?: string;
  badgeBgColor?: string;
  badgeTextColor?: string;
  borderClass?: string;
  hideOnDesktop?: boolean;
}

export default function MobileBottomNav({
  bgColor = "bg-gray-200/95 dark:bg-gray-900/95",
  inactiveColor = "text-gray-500 dark:text-gray-400",
  activeColor = "text-olive dark:text-lime",
  badgeBgColor = "bg-brand-red",
  badgeTextColor = "text-white",
  borderClass = "border-t border-pink-500/50 dark:border-pink-500/50",
  hideOnDesktop = true,
}: MobileBottomNavProps = {}) {
  const pathname = usePathname();
  const { user } = useAuth();
  const cartCountRaw = useCartStore((state) =>
    state.items.reduce((acc, item) => acc + item.quantity, 0),
  );
  const openCart = useCartStore((state) => state.openCart);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const cartCount = mounted ? cartCountRaw : 0;

  const navItems = [
    {
      id: "home",
      label: "Home",
      icon: Home,
      href: "/",
      isActive: pathname === "/",
    },
    {
      id: "explore",
      label: "Explore",
      icon: LayoutGrid,
      href: "/explore",
      isActive: pathname === "/explore",
    },
    {
      id: "cart",
      label: "Cart",
      icon: ShoppingCart,
      onClick: openCart,
      isActive: false,
    },
    {
      id: "account",
      label: user ? "Account" : "Login",
      icon: User,
      href: user
        ? user.role === "ADMIN" || user.role === "SUPER_ADMIN"
          ? "/admin"
          : "/dashboard"
        : "/login",
      isActive:
        pathname?.startsWith("/dashboard") ||
        pathname?.startsWith("/admin") ||
        pathname === "/login",
    },
  ];

  return (
    <div
      className={`${hideOnDesktop ? "lg:hidden" : ""} sticky bottom-0 z-[120] pb-[env(safe-area-inset-bottom)] ${bgColor} backdrop-blur-md ${borderClass} shadow-[0_-4px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.3)] w-full`}
    >
      <nav className="flex justify-between items-center h-[56px] px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.isActive;

          const content = (
            <div className="flex flex-col items-center justify-center w-full h-full gap-1 pt-1">
              <div
                className={`relative flex items-center justify-center transition-colors duration-200 ${isActive ? activeColor : inactiveColor}`}
              >
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${isActive ? "stroke-[2.5px] scale-110" : "stroke-[1.5px]"}`}
                />
                {item.id === "cart" && cartCount > 0 && (
                  <span
                    className={`absolute -top-1 -right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full ${badgeBgColor} text-[8px] font-bold ${badgeTextColor} border-2 border-white dark:border-gray-950 shadow-sm`}
                  >
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </div>
              <span
                className={`text-[9px] font-medium transition-colors duration-200 ${isActive ? activeColor : inactiveColor}`}
              >
                {item.label}
              </span>
            </div>
          );

          if (item.onClick) {
            return (
              <button
                key={item.id}
                onClick={item.onClick}
                className="flex-1 flex flex-col items-center justify-center h-full outline-none active:scale-95 transition-transform"
                aria-label={item.label}
              >
                {content}
              </button>
            );
          }

          return (
            <Link
              key={item.id}
              href={getFilterUrl(item.href!)}
              className="flex-1 flex flex-col items-center justify-center h-full outline-none active:scale-95 transition-transform"
              aria-label={item.label}
              prefetch={false}
            >
              {content}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
