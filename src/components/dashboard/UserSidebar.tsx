"use client";

import { useAuth } from "@/context/AuthContext";
import {
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Settings,
  ShoppingBag,
  User as UserIcon,
  Heart,
  Wallet,
  Star,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function UserSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const menuItems = user?.isGuest
    ? [{ label: "Guest Profile", href: "/profile", icon: UserIcon }]
    : [
        { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { label: "My Profile", href: "/profile", icon: UserIcon },
        {
          label: "Purchase History",
          href: "/profile/orders",
          icon: ShoppingBag,
        },
        { label: "Wishlist", href: "/profile/wishlist", icon: Heart },
        { label: "Wallet & Rewards", href: "/profile/wallet", icon: Wallet },
        { label: "My Reviews", href: "/profile/reviews", icon: Star },
        { label: "Settings", href: "/settings", icon: Settings },
      ];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-[clamp(1.5rem,4vw,2rem)] shadow-sm border border-gray-100 dark:border-gray-800 p-[clamp(1rem,3vw,1.5rem)] flex flex-col gap-[clamp(1.5rem,4vw,2rem)] h-fit lg:sticky lg:top-[clamp(4rem,10vw,6rem)]">
      {/* Profile Header */}
      <div className="flex flex-col items-center text-center px-2">
        <div className="w-[clamp(4rem,10vw,5rem)] h-[clamp(4rem,10vw,5rem)] rounded-full bg-gradient-to-tr from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/20 flex items-center justify-center mb-4 border-[clamp(2px,0.5vw,4px)] border-white dark:border-gray-800 shadow-xl overflow-hidden relative">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-full h-full object-cover"
            />
          ) : user?.name ? (
            <span className="text-[clamp(1.25rem,4vw,1.5rem)] font-black text-blue-600 uppercase">
              {user.name.charAt(0)}
            </span>
          ) : (
            <UserIcon className="text-blue-500" size={32} />
          )}
        </div>
        <div>
          <h3 className="text-[clamp(1rem,2.5vw,1.125rem)] font-black text-gray-900 dark:text-white truncate max-w-[180px]">
            {user?.name || "User Name"}
          </h3>
          <p className="text-[clamp(0.875rem,2vw,1rem)] text-gray-500 dark:text-gray-400 truncate max-w-[180px]">
            {user?.email || user?.phone || "user@example.com"}
          </p>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex flex-col gap-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-[clamp(1rem,3vw,1.5rem)] py-[clamp(0.75rem,2vw,1rem)] min-h-[44px] rounded-lg transition-all duration-300 group ${
                isActive
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 translate-x-1"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  size={20}
                  className={
                    isActive
                      ? "text-white"
                      : "text-gray-400 group-hover:text-blue-500"
                  }
                />
                <span className="font-bold text-[clamp(0.875rem,2vw,1rem)] tracking-tight">
                  {item.label}
                </span>
              </div>
              {isActive && <ChevronRight size={16} />}
            </Link>
          );
        })}

        <button
          onClick={logout}
          className="flex items-center justify-between px-[clamp(1rem,3vw,1.5rem)] py-[clamp(0.75rem,2vw,1rem)] min-h-[44px] rounded-lg text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-all duration-300 mt-[clamp(0.5rem,1.5vw,1rem)] group w-full"
        >
          <div className="flex items-center gap-3">
            <LogOut
              size={20}
              className="group-hover:-translate-x-0.5 transition-transform"
            />
            <span className="font-bold text-[clamp(0.875rem,2vw,1rem)] tracking-tight">
              Logout
            </span>
          </div>
        </button>
      </nav>
    </div>
  );
}
