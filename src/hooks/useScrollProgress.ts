"use client";

import { useMotionValueEvent, useScroll } from "framer-motion";
import { useCallback, useRef, useState } from "react";

export interface UseScrollProgressOptions {
  /** The threshold in pixels before isPastThreshold becomes true */
  threshold?: number;
}

/**
 * A highly optimized hook for tracking scroll progress using Framer Motion.
 * It avoids unnecessary re-renders while providing accurate scroll metrics.
 */
export function useScrollProgress({
  threshold = 300,
}: UseScrollProgressOptions = {}) {
  const { scrollY, scrollYProgress } = useScroll();

  const [isPastThreshold, setIsPastThreshold] = useState(false);
  const [percentage, setPercentage] = useState(0);
  const [isBottom, setIsBottom] = useState(false);
  const [isScrollingUp, setIsScrollingUp] = useState(false);

  const lastScrollY = useRef(0);

  // Track percentage and bottom state
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const percent = Math.round(latest * 100);
    setPercentage(percent);
    // Add a tiny buffer (0.99) for precision issues across browsers
    setIsBottom(latest >= 0.99);
  });

  // Track threshold and scroll direction
  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsPastThreshold(latest > threshold);

    if (latest < lastScrollY.current) {
      setIsScrollingUp(true);
    } else if (latest > lastScrollY.current) {
      setIsScrollingUp(false);
    }

    lastScrollY.current = latest;
  });

  const scrollToTop = useCallback((behavior: ScrollBehavior = "smooth") => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior });
    }
  }, []);

  return {
    /** Raw framer-motion scrollY MotionValue for GPU animations */
    scrollY,
    /** Raw framer-motion scrollYProgress MotionValue for GPU animations */
    scrollYProgress,
    /** Current scroll percentage (0-100) */
    percentage,
    /** True if user scrolled past the defined threshold */
    isPastThreshold,
    /** True if user reached the bottom of the page */
    isBottom,
    /** True if user is currently scrolling upwards */
    isScrollingUp,
    /** Function to scroll back to top */
    scrollToTop,
  };
}
