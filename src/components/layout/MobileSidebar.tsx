"use client";

import React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, Phone, Info, ShoppingBag } from "lucide-react";
import { useNavigationStore } from "@/store/navigationStore";
import { getCategoryIcon, getFilterUrl } from "@/lib/utils";

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  storeName?: string;
}

export default function MobileSidebar({
  isOpen,
  onClose,
  storeName = "Femcart",
}: MobileSidebarProps) {
  const categories = useNavigationStore((state) => state.categories);

  const [expandedCategory, setExpandedCategory] = React.useState<string | null>(
    null,
  );

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.overscrollBehavior = "none";
    } else {
      document.body.style.overflow = "";
      document.body.style.overscrollBehavior = "";
      setExpandedCategory(null); // Reset expansion when closing
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.overscrollBehavior = "";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Sidebar Drawer */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", bounce: 0, duration: 0.3 }}
            className="fixed top-0 left-0 h-[100dvh] w-[85vw] max-w-[320px] bg-white shadow-2xl z-[101] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <span className="text-xl font-black text-gray-900 tracking-tight font-display">
                {storeName}
              </span>
              <button
                onClick={onClose}
                className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-500 hover:text-pink-600 hover:bg-pink-50 rounded-full transition-colors"
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto pb-24">
              {/* Categories */}
              <div className="p-4">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 px-3">
                  Categories
                </h3>
                <div className="flex flex-col gap-1">
                  {categories.map((category) => {
                    const IconComponent =
                      category.icon || getCategoryIcon(category.title);

                    const hasDropdown = !!(
                      category.subcategories &&
                      category.subcategories.length > 0
                    );
                    const isExpanded = expandedCategory === category.id;
                    const url = `/products?category=${category.slug || category.id}`;

                    return (
                      <div key={category.id} className="flex flex-col">
                        {hasDropdown ? (
                          <button
                            onClick={() =>
                              setExpandedCategory(
                                isExpanded ? null : category.id,
                              )
                            }
                            className="flex items-center justify-between p-3 text-sm font-bold text-gray-700 hover:text-pink-600 hover:bg-pink-50 rounded-xl transition-colors group"
                          >
                            <div className="flex items-center gap-3">
                              {category.image ? (
                                <img
                                  src={category.image}
                                  alt={category.title}
                                  className="w-5 h-5 object-cover rounded shadow-sm"
                                />
                              ) : IconComponent ? (
                                <IconComponent
                                  size={20}
                                  className="text-gray-500 group-hover:text-pink-600 transition-colors"
                                />
                              ) : (
                                <div className="w-5 h-5 bg-gray-100 rounded" />
                              )}
                              <span>{category.title}</span>
                            </div>
                            <ChevronRight
                              size={16}
                              className={`text-gray-400 group-hover:text-pink-600 transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}
                            />
                          </button>
                        ) : (
                          <Link
                            href={url}
                            onClick={onClose}
                            className="flex items-center justify-between p-3 text-sm font-bold text-gray-700 hover:text-pink-600 hover:bg-pink-50 rounded-xl transition-colors group"
                          >
                            <div className="flex items-center gap-3">
                              {category.image ? (
                                <img
                                  src={category.image}
                                  alt={category.title}
                                  className="w-5 h-5 object-cover rounded shadow-sm"
                                />
                              ) : IconComponent ? (
                                <IconComponent
                                  size={20}
                                  className="text-gray-500 group-hover:text-pink-600 transition-colors"
                                />
                              ) : (
                                <div className="w-5 h-5 bg-gray-100 rounded" />
                              )}
                              <span>{category.title}</span>
                            </div>
                          </Link>
                        )}

                        {/* Subcategories Dropdown */}
                        <AnimatePresence>
                          {hasDropdown && isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden ml-9 border-l-2 border-gray-100 pl-3 flex flex-col gap-1 mt-1"
                            >
                              <Link
                                href={url}
                                onClick={onClose}
                                className="block py-2 text-sm font-bold text-pink-600 hover:text-pink-700 transition-colors"
                              >
                                Shop All {category.title}
                              </Link>
                              {category.subcategories.map(
                                (subItem: any, idx: number) => (
                                  <Link
                                    key={idx}
                                    href={getFilterUrl(subItem.href || "#")}
                                    onClick={onClose}
                                    className="block py-2 text-sm font-medium text-gray-600 hover:text-pink-600 transition-colors"
                                  >
                                    {subItem.title}
                                  </Link>
                                ),
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Footer Links */}
              <div className="p-6 border-t border-gray-100 bg-gray-50 flex items-center justify-center gap-6 mt-auto">
                <Link
                  href="/products"
                  onClick={onClose}
                  className="p-3 text-gray-400 hover:text-pink-600 hover:bg-pink-100 bg-white shadow-sm rounded-full transition-colors"
                  aria-label="Shop All"
                >
                  <ShoppingBag size={20} />
                </Link>
                <Link
                  href="/contact"
                  onClick={onClose}
                  className="p-3 text-gray-400 hover:text-pink-600 hover:bg-pink-100 bg-white shadow-sm rounded-full transition-colors"
                  aria-label="Contact Support"
                >
                  <Phone size={20} />
                </Link>
                <Link
                  href="/about"
                  onClick={onClose}
                  className="p-3 text-gray-400 hover:text-pink-600 hover:bg-pink-100 bg-white shadow-sm rounded-full transition-colors"
                  aria-label="About Us"
                >
                  <Info size={20} />
                </Link>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
