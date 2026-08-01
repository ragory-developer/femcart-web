"use client";
import React, { useState } from "react";

import { useAuth } from "@/context/AuthContext";
import { navCategories } from "@/lib/admin-permissions";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LogOut,
  Lock,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminSidebar({
  collapsed,
  setCollapsed,
}: {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const filterItems = (items: any[]) => {
    return items.filter((item) => {
      if (!user) return false;
      if (user.role === "SUPER_ADMIN") return true;
      const perms: string[] = Array.isArray(user.permissions)
        ? user.permissions
        : typeof user.permissions === "string"
          ? (() => {
              try {
                return JSON.parse(user.permissions as unknown as string);
              } catch {
                return [];
              }
            })()
          : [];
      if (perms.includes("ALL")) return true;
      return perms.includes(item.permission);
    });
  };

  return (
    <aside
      className={`fixed top-0 left-0 h-[100dvh] bg-gray-950/80 backdrop-blur-xl text-white border-r border-white/5 flex flex-col transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] z-[100] ${
        collapsed ? "w-[80px]" : "w-[280px]"
      } shadow-2xl`}
    >
      {/* Logo */}
      <div
        className={`p-[clamp(1rem,3vw,1.5rem)] flex items-center ${collapsed ? "justify-center" : "gap-4"} border-b border-white/5`}
      >
        <div className="bg-gradient-to-tr from-emerald-500 to-teal-400 p-2.5 rounded-xl shrink-0 shadow-lg shadow-emerald-500/20">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-white"
          >
            <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path>
            <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path>
          </svg>
        </div>
        {!collapsed && (
          <span className="text-xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 whitespace-nowrap">
            Femcart
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-[clamp(1rem,3vw,1.5rem)] px-[clamp(0.5rem,1.5vw,1rem)] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="space-y-6">
          {navCategories.map((group, groupIdx) => {
            const filteredItems = filterItems(group.items);
            if (filteredItems.length === 0) return null;

            return (
              <div
                key={group.category}
                className="space-y-1.5 animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both"
                style={{ animationDelay: `${groupIdx * 50}ms` }}
              >
                {!collapsed && (
                  <h4 className="px-[clamp(0.5rem,1.5vw,1rem)] text-[clamp(0.65rem,1vw,0.75rem)] font-black uppercase tracking-widest text-gray-500 mb-2">
                    {group.category}
                  </h4>
                )}

                {filteredItems.map((item) => {
                  const isActive =
                    item.href === "/admin"
                      ? pathname === "/admin"
                      : pathname === item.href ||
                        (pathname.startsWith(item.href + "/") &&
                          !filteredItems.some(
                            (other) =>
                              other.href !== item.href &&
                              other.href.startsWith(item.href + "/") &&
                              pathname.startsWith(other.href),
                          ));

                  const hasSubItems = item.subItems && item.subItems.length > 0;
                  const isExpanded = expandedItems.includes(item.label);
                  const isAnySubActive =
                    hasSubItems &&
                    item.subItems.some(
                      (sub: any) =>
                        pathname === sub.href ||
                        pathname + window.location.search === sub.href,
                    );
                  const isParentActive = isActive || isAnySubActive;

                  const toggleExpand = (e: React.MouseEvent) => {
                    if (!hasSubItems) return;
                    e.preventDefault();
                    if (collapsed) setCollapsed(false);
                    setExpandedItems((prev) =>
                      prev.includes(item.label)
                        ? prev.filter((i) => i !== item.label)
                        : [...prev, item.label],
                    );
                  };

                  return (
                    <div key={item.label} className="relative">
                      <Link
                        href={
                          (item as any).disabled
                            ? "#"
                            : hasSubItems
                              ? "#"
                              : item.href
                        }
                        onClick={
                          (item as any).disabled
                            ? (e) => e.preventDefault()
                            : hasSubItems
                              ? toggleExpand
                              : undefined
                        }
                        className={`group flex items-center relative gap-4 rounded-xl transition-all duration-300 ${
                          (item as any).disabled
                            ? "text-gray-500 cursor-not-allowed"
                            : isParentActive
                              ? "bg-emerald-500/10 text-emerald-400 font-bold"
                              : "text-gray-400 hover:text-white hover:bg-white/5 font-medium"
                        } ${collapsed ? "p-3 min-h-[44px] justify-center" : "px-[clamp(0.5rem,1.5vw,1rem)] py-[clamp(0.5rem,1.5vw,0.75rem)] min-h-[44px]"}`}
                      >
                        {isParentActive && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-emerald-500 rounded-r-full shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-in slide-in-from-left-1 duration-200" />
                        )}

                        <item.icon
                          size={collapsed ? 20 : 18}
                          className={`shrink-0 transition-transform duration-300 ${isParentActive ? "scale-110" : "group-hover:scale-110"}`}
                        />

                        {!collapsed && (
                          <>
                            <span className="text-[clamp(0.8125rem,1.5vw,0.875rem)] tracking-wide flex-1">
                              {item.label}
                            </span>
                            {(item as any).disabled ? (
                              <Lock
                                size={14}
                                className="text-gray-500 shrink-0"
                              />
                            ) : hasSubItems ? (
                              <ChevronDown
                                size={14}
                                className={`transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
                              />
                            ) : null}
                          </>
                        )}

                        {/* Tooltip for collapsed state */}
                        {collapsed && (
                          <div className="absolute left-16 px-3 py-1.5 bg-gray-900 border border-white/10 text-white text-xs font-bold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 shadow-xl whitespace-nowrap z-50">
                            {item.label}
                          </div>
                        )}
                      </Link>

                      {/* SubItems Render */}
                      {!collapsed && hasSubItems && (
                        <div
                          className={`overflow-hidden transition-all duration-300 ${isExpanded ? "max-h-[500px] mt-1 opacity-100" : "max-h-0 opacity-0"}`}
                        >
                          <div className="flex flex-col gap-1 ml-[1.65rem] pl-4 border-l-2 border-white/5 py-1">
                            {item.subItems.map((sub: any) => {
                              return (
                                <Link
                                  key={sub.label}
                                  href={sub.href}
                                  className="text-[0.8rem] text-gray-400 hover:text-white py-1.5 transition-colors font-medium"
                                >
                                  {sub.label}
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </nav>
      {/* Toggle Button - Modern Top Right Position */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute top-10 -right-[22px] sm:-right-4 w-[44px] h-[44px] sm:w-8 sm:h-8 flex items-center justify-center bg-gray-900/90 backdrop-blur-md border border-white/10 hover:border-emerald-500/50 hover:bg-gray-800 rounded-full text-gray-400 hover:text-emerald-400 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] z-50 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.5)] hover:shadow-[0_0_15px_rgba(16,185,129,0.4)] group"
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? (
          <ChevronRight
            size={16}
            className="group-hover:translate-x-0.5 transition-transform duration-300"
          />
        ) : (
          <ChevronLeft
            size={16}
            className="group-hover:-translate-x-0.5 transition-transform duration-300"
          />
        )}
      </button>

      {/* Footer Actions */}
      <div className="border-t border-white/5 flex flex-col p-[clamp(0.5rem,1.5vw,1rem)] bg-gray-950/50">
        <button
          onClick={() => logout()}
          className={`flex items-center gap-4 rounded-xl text-gray-400 hover:bg-rose-500/10 hover:text-rose-500 transition-all duration-300 relative group ${collapsed ? "p-3 min-h-[44px] justify-center" : "px-[clamp(0.5rem,1.5vw,1rem)] py-[clamp(0.75rem,2vw,1rem)] min-h-[44px]"}`}
        >
          <LogOut
            size={20}
            className="shrink-0 group-hover:-translate-x-1 transition-transform"
          />
          {!collapsed && (
            <span className="font-bold text-[clamp(0.8125rem,1.5vw,0.875rem)] tracking-wide text-left flex-1">
              Logout
            </span>
          )}

          {collapsed && (
            <div className="absolute left-16 px-3 py-1.5 bg-gray-900 border border-white/10 text-white text-xs font-bold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 shadow-xl whitespace-nowrap z-50">
              Logout
            </div>
          )}
        </button>
      </div>
    </aside>
  );
}
