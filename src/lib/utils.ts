import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  Apple,
  Baby,
  ShieldAlert,
  Sparkles,
  Dog,
  HeartPulse,
  ShoppingBag,
  Utensils,
  PenTool,
  Smartphone,
  Beef,
  Carrot,
  Milk,
  Package,
} from "lucide-react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number) {
  // Use BDT format with Taka symbol Tk
  return `Tk ${amount.toFixed(2)}`;
}

/**
 * Calculates the active price for a product or variant,
 * taking into account special prices and active date ranges.
 */
export function getActivePrice(item: any): number {
  if (!item) return 0;

  const now = new Date();
  const price = item.price || 0;
  const specialPrice = item.specialPrice;
  const start = item.specialPriceStart
    ? new Date(item.specialPriceStart)
    : null;
  const end = item.specialPriceEnd ? new Date(item.specialPriceEnd) : null;

  const isActive =
    specialPrice !== undefined &&
    specialPrice !== null &&
    (start === null || start <= now) &&
    (end === null || end >= now);

  return isActive ? specialPrice : price;
}

export const PLACEHOLDER_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23f0fdf4'/%3E%3Crect x='140' y='120' width='120' height='100' rx='8' fill='%23e2e8f0'/%3E%3Ccircle cx='200' cy='158' r='22' fill='%23cbd5e1'/%3E%3Cpolygon points='140,220 175,168 205,195 230,172 260,220' fill='%23cbd5e1'/%3E%3Ctext x='200' y='265' font-family='sans-serif' font-size='18' fill='%2394a3b8' text-anchor='middle'%3ENo Image%3C/text%3E%3C/svg%3E";

export function resolveImageUrl(imgUrl: string | null | undefined): string {
  if (!imgUrl) return PLACEHOLDER_IMAGE;

  imgUrl = imgUrl.replace(/^["']|["']$/g, "").trim();

  // Normalize Windows backslashes to forward slashes for Linux server compatibility
  imgUrl = imgUrl.replace(/\\/g, "/");

  if (!imgUrl) return PLACEHOLDER_IMAGE;

  // If already absolute (http://, https://, or data:)
  if (
    imgUrl.startsWith("http://") ||
    imgUrl.startsWith("https://") ||
    imgUrl.startsWith("data:")
  ) {
    return imgUrl;
  }

  // Handle protocol-relative URLs
  if (imgUrl.startsWith("//")) {
    return `https:${imgUrl}`;
  }

  // If the image URL does not start with http or / and is from an external domain, prepend https://
  // Check if it looks like a domain name (e.g. images.othoba.com)
  if (imgUrl.includes(".") && !imgUrl.startsWith("/")) {
    return `https://${imgUrl}`;
  }

  // Fallback for internal relative paths (returns exactly as is, so Next.js loads it from /public)
  return imgUrl.startsWith("/") ? imgUrl : `/${imgUrl}`;
}

export function getProductImage(product: any): string {
  if (!product) return PLACEHOLDER_IMAGE;

  // Fast path: if the primary image exists, use it immediately to avoid expensive JSON parsing
  if (product.image) {
    return resolveImageUrl(product.image);
  }

  let imagesArray: string[] = [];
  if (Array.isArray(product.images)) {
    imagesArray = product.images;
  } else if (typeof product.images === "string" && product.images.length > 2) {
    try {
      imagesArray = JSON.parse(product.images);
      if (!Array.isArray(imagesArray)) imagesArray = [];
    } catch (error) {
      // Silently fail to avoid console spam in production
      imagesArray = [];
    }
  }

  const imgUrl =
    (imagesArray.length > 0 ? imagesArray[0] : null) || product.featuredImage;
  return resolveImageUrl(imgUrl);
}

// Helper to assign a Lucide icon based on category title
export function getCategoryIcon(title: string) {
  const t = (title || "").toLowerCase();
  if (t.includes("meat") || t.includes("beef") || t.includes("chicken"))
    return Beef;
  if (t.includes("fruit") || t.includes("veg") || t.includes("produce"))
    return Carrot;
  if (t.includes("food") || t.includes("grocery")) return Apple;
  if (t.includes("baby")) return Baby;
  if (t.includes("diaper")) return ShieldAlert;
  if (t.includes("clean") || t.includes("wash")) return Sparkles;
  if (t.includes("pet") || t.includes("dog") || t.includes("cat")) return Dog;
  if (t.includes("beaut") || t.includes("health")) return HeartPulse;
  if (t.includes("fashion") || t.includes("cloth")) return ShoppingBag;
  if (t.includes("kitchen") || t.includes("home")) return Utensils;
  if (t.includes("station")) return PenTool;
  if (t.includes("gadget") || t.includes("tech") || t.includes("phone"))
    return Smartphone;
  if (t.includes("dairy") || t.includes("milk") || t.includes("cheese"))
    return Milk;
  return Package; // default icon
}
export function getFilterUrl(url: string) {
  if (!url) return "#";
  if (url.startsWith("/category/")) {
    return "/catalog?category=" + url.replace("/category/", "");
  }
  if (url.startsWith("/categories/")) {
    return "/catalog?category=" + url.replace("/categories/", "");
  }
  if (url.startsWith("/brands/")) {
    return "/catalog?brand=" + url.replace("/brands/", "");
  }
  return url;
}
