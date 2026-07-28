"use client";

import { useScrollProgress } from "@/hooks/useScrollProgress";
import { clsx, type ClassValue } from "clsx";
import {
  AnimatePresence,
  motion,
  useSpring,
  useTransform,
} from "framer-motion";
import { ArrowUp, Check } from "lucide-react";
import { usePathname } from "next/navigation";
import { memo } from "react";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type ScrollToTopVariant =
  "light" | "dark" | "glass" | "brand" | "minimal";

export interface ScrollToTopProps {
  /** The visual style variant of the button */
  variant?: ScrollToTopVariant;
  /** Scroll position in pixels before button appears */
  threshold?: number;
  /** Display the circular progress ring */
  showProgressRing?: boolean;
  /** Display the text percentage tooltip on hover */
  showPercentage?: boolean;
  /** Auto hide when scrolling down (only show on scroll up) */
  autoHideOnScrollDown?: boolean;
  /** Size of the button. Uses standard sizing or fluid clamp sizing for responsiveness */
  size?: "sm" | "md" | "lg" | "fluid";
  /** Position of the button on screen */
  position?: "bottom-right" | "bottom-left" | "bottom-center";
  /** Custom CSS classes */
  className?: string;
  /** Custom theme color for 'brand' variant (Tailwind class, e.g., 'bg-indigo-600 text-white') */
  themeColor?: string;
  /** Animation duration for the scroll behavior */
  scrollBehavior?: ScrollBehavior;
  /** Custom icon to use. Defaults to ArrowUp */
  icon?: React.ReactNode;
}

/**
 * A production-ready, highly configurable Floating Scroll-To-Top component.
 * Features GPU-accelerated SVG progress rings, smooth entrance/exit animations,
 * and robust responsive sizing.
 */
export const ScrollToTop = memo(function ScrollToTop({
  variant = "glass",
  threshold = 300,
  showProgressRing = true,
  showPercentage = true,
  autoHideOnScrollDown = false,
  size = "fluid",
  position = "bottom-right",
  className,
  themeColor = "bg-indigo-600 text-white",
  scrollBehavior = "smooth",
  icon,
}: ScrollToTopProps) {
  const {
    scrollYProgress,
    percentage,
    isPastThreshold,
    isBottom,
    isScrollingUp,
    scrollToTop,
  } = useScrollProgress({ threshold });

  const pathname = usePathname();
  const isAdminBuilder = pathname?.includes("/admin");

  // Smooth out the progress ring animation using Framer Motion springs
  const springProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // Calculate circumference for the responsive SVG ring
  // ViewBox is 100x100, r=46 ensures stroke width of 4 fits perfectly inside.
  const radius = 46;
  const circumference = 2 * Math.PI * radius; // ~289.026

  // Transform scroll progress to SVG stroke-dashoffset
  const strokeDashoffset = useTransform(
    springProgress,
    [0, 1],
    [circumference, 0],
  );

  // Determine actual visibility based on logic configs (always show in admin builder)
  const isVisible =
    isAdminBuilder ||
    (isPastThreshold && (!autoHideOnScrollDown || isScrollingUp || isBottom));

  // Variant Styles System
  const variantStyles = {
    light:
      "bg-white text-gray-800 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 hover:bg-gray-50 hover:shadow-[0_8px_30px_rgb(0,0,0,0.16)]",
    dark: "bg-gray-900 text-white shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-gray-800 hover:bg-gray-800 hover:shadow-[0_8px_30px_rgb(0,0,0,0.3)]",
    glass:
      "bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl text-gray-800 dark:text-white shadow-[0_8px_30px_rgb(0,0,0,0.1)] border border-white/40 dark:border-white/10 hover:bg-white/90 dark:hover:bg-gray-900/90",
    brand: `${themeColor} shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.3)] brightness-100 hover:brightness-110`,
    minimal:
      "bg-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800",
  };

  // SVGs Ring Color Context
  const ringColors = {
    light: "text-emerald-500",
    dark: "text-emerald-400",
    glass: "text-emerald-500 dark:text-emerald-400",
    brand: "text-white/90",
    minimal: "text-emerald-500 dark:text-emerald-400",
  };

  const trackColors = {
    light: "text-gray-200",
    dark: "text-gray-700",
    glass: "text-black/5 dark:text-white/10",
    brand: "text-black/10",
    minimal: "text-gray-200 dark:text-gray-700",
  };

  // Fluid & Fixed Sizing System
  const sizeStyles = {
    sm: "w-10 h-10",
    md: "w-12 h-12",
    lg: "w-14 h-14",
    fluid: "w-[clamp(48px,5vw,64px)] h-[clamp(48px,5vw,64px)]",
  };

  const iconSizeStyles = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
    fluid: "w-[clamp(16px,2vw,24px)] h-[clamp(16px,2vw,24px)]",
  };

  // Responsive Positioning System (avoids mobile bottom-nav overlaps)
  const positionStyles = {
    "bottom-right":
      "bottom-[calc(56px+env(safe-area-inset-bottom)+5.5rem)] right-4 md:bottom-5 md:right-5 lg:bottom-6 lg:right-6 xl:bottom-8 xl:right-8",
    "bottom-left":
      "bottom-[calc(56px+env(safe-area-inset-bottom)+5.5rem)] left-4 md:bottom-5 md:left-5 lg:bottom-6 lg:left-6 xl:bottom-8 xl:left-8",
    "bottom-center":
      "bottom-[calc(56px+env(safe-area-inset-bottom)+5.5rem)] md:bottom-5 lg:bottom-6 xl:bottom-8 left-1/2 -translate-x-1/2",
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 25,
            mass: 0.8,
          }}
          onClick={() => scrollToTop(scrollBehavior)}
          aria-label="Scroll to top"
          title="Scroll to top"
          style={{ marginBottom: "env(safe-area-inset-bottom)" }}
          className={cn(
            "fixed z-50 flex flex-col items-center justify-center rounded-full outline-none focus-visible:ring-4 focus-visible:ring-offset-2 focus-visible:ring-indigo-500/50 transition-colors group select-none overflow-hidden",
            variantStyles[variant],
            sizeStyles[size],
            positionStyles[position],
            className,
          )}
        >
          {showProgressRing && (
            <svg
              className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Subtle background track */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                className={cn(
                  "stroke-current transition-colors duration-300",
                  trackColors[variant],
                )}
                strokeWidth="4"
                fill="none"
              />
              {/* Dynamic animated progress ring */}
              <motion.circle
                cx="50"
                cy="50"
                r={radius}
                className={cn(
                  "stroke-current transition-colors duration-300",
                  ringColors[variant],
                )}
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
                style={{
                  strokeDasharray: circumference,
                  strokeDashoffset: strokeDashoffset,
                }}
              />
            </svg>
          )}

          {/* Icon Container */}
          <div className="relative z-10 flex items-center justify-center">
            <AnimatePresence mode="wait">
              {isBottom ? (
                <motion.div
                  key="check"
                  initial={{ scale: 0.5, opacity: 0, rotate: -45 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  exit={{ scale: 0.5, opacity: 0, rotate: 45 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Check
                    className={cn(
                      "animate-pulse duration-1000",
                      iconSizeStyles[size],
                    )}
                    strokeWidth={2.5}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="arrow"
                  initial={{ scale: 0.5, opacity: 0, y: 10 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.5, opacity: 0, y: -10 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  {icon || (
                    <ArrowUp
                      className={cn(iconSizeStyles[size])}
                      strokeWidth={2.5}
                    />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Floating Percentage Tooltip */}
          {showPercentage && (
            <span
              className={cn(
                "absolute -top-10 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[11px] font-bold px-2 py-1 rounded shadow-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-75",
                "after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-[5px] after:border-transparent after:border-t-gray-900 dark:after:border-t-white",
                "whitespace-nowrap tabular-nums",
              )}
            >
              {percentage}%
            </span>
          )}
        </motion.button>
      )}
    </AnimatePresence>
  );
});
