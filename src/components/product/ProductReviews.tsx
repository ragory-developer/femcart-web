"use client";

import ReviewCard from "@/components/ui/card/ReviewCard";
import CommerceCarousel, {
  CommerceCarouselConfig,
} from "@/components/ui/carousel/CommerceCarousel";
import { API_URL } from "@/lib/config";
import { Star } from "lucide-react";
import { useEffect, useState } from "react";

interface Testimonial {
  id?: string;
  name: string;
  avatar: string;
  rating: number;
  review: string;
  product?: string;
  createdAt?: string;
  content?: string;
  description?: string;
}

interface ProductReviewsProps {
  productContext?: any;
  testimonials?: Testimonial[];
  title?: string;
  subtitle?: string;
  themeVariant?:
    | "default"
    | "eid"
    | "puja"
    | "ramadan"
    | "boishakh"
    | "blackfriday"
    | "christmas";
  layoutType?: "grid" | "carousel";
  cols?: number;
  rows?: number;
  limit?: number;
  isLandingPage?: boolean;
  builderClassName?: string;
  builderStyle?: React.CSSProperties;
  showNavigation?: boolean;
  showPagination?: boolean;
}

const themeStyles = {
  default: {
    bg: "bg-gradient-to-b from-rose-50/50 via-pink-50/30 to-white dark:from-gray-900 dark:via-gray-900/50 dark:to-gray-950",
    badgeBg: "bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400",
    starColor: "text-rose-500 fill-rose-500",
    quoteColor: "text-rose-200 dark:text-rose-800/40",
    productColor: "text-rose-500 dark:text-rose-400",
    accentStarColor: "text-amber-400 fill-amber-400",
    btnPrimary: "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20",
  },
  eid: {
    bg: "bg-gradient-to-b from-emerald-50/50 via-teal-50/30 to-white dark:from-slate-900 dark:via-emerald-955/10 dark:to-slate-955",
    badgeBg:
      "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400",
    starColor: "text-emerald-500 fill-emerald-500",
    quoteColor: "text-emerald-200 dark:text-emerald-800/40",
    productColor: "text-emerald-600 dark:text-emerald-400",
    accentStarColor: "text-teal-500 fill-teal-500",
    btnPrimary:
      "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20",
  },
  puja: {
    bg: "bg-gradient-to-b from-pink-50/50 via-rose-50/30 to-white dark:from-slate-900 dark:via-rose-900/10 dark:to-slate-950",
    badgeBg: "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400",
    starColor: "text-rose-500 fill-rose-500",
    quoteColor: "text-rose-200 dark:text-rose-800/40",
    productColor: "text-rose-600 dark:text-rose-400",
    accentStarColor: "text-orange-500 fill-orange-500",
    btnPrimary: "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20",
  },
  ramadan: {
    bg: "bg-gradient-to-b from-slate-900/5 via-indigo-950/5 to-white dark:from-slate-950 dark:via-indigo-950/10 dark:to-slate-950",
    badgeBg:
      "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
    starColor: "text-amber-500 fill-amber-500",
    quoteColor: "text-amber-200 dark:text-indigo-800/40",
    productColor: "text-amber-600 dark:text-amber-500",
    accentStarColor: "text-amber-500 fill-amber-500",
    btnPrimary:
      "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20",
  },
  boishakh: {
    bg: "bg-gradient-to-b from-yellow-50/50 via-orange-50/30 to-white dark:from-slate-900 dark:via-orange-900/5 dark:to-slate-950",
    badgeBg:
      "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400",
    starColor: "text-orange-500 fill-orange-500",
    quoteColor: "text-orange-200 dark:text-orange-800/40",
    productColor: "text-pink-600 dark:text-pink-500",
    accentStarColor: "text-orange-500 fill-orange-500",
    btnPrimary:
      "bg-orange-600 hover:bg-orange-700 text-white shadow-orange-600/20",
  },
  blackfriday: {
    bg: "bg-gradient-to-b from-gray-200/30 via-gray-100 to-white dark:from-gray-950 dark:via-gray-900/50 dark:to-gray-950",
    badgeBg: "bg-yellow-400/20 text-yellow-600 dark:text-yellow-400",
    starColor: "text-yellow-500 fill-yellow-500",
    quoteColor: "text-gray-300/60 dark:text-gray-800/40",
    productColor: "text-yellow-600 dark:text-yellow-500",
    accentStarColor: "text-yellow-400 fill-yellow-400",
    btnPrimary:
      "bg-yellow-500 hover:bg-yellow-600 text-black shadow-yellow-500/10 font-bold",
  },
  christmas: {
    bg: "bg-gradient-to-b from-green-50/50 via-pink-50/30 to-white dark:from-slate-900 dark:via-green-900/5 dark:to-slate-950",
    badgeBg:
      "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
    starColor: "text-green-500 fill-green-500",
    quoteColor: "text-green-200 dark:text-green-800/40",
    productColor: "text-pink-600 dark:text-pink-500",
    accentStarColor: "text-pink-500 fill-pink-500",
    btnPrimary:
      "bg-green-700 hover:bg-green-800 text-white shadow-green-700/20",
  },
};

export default function ProductReviews({
  productContext,
  testimonials = [],
  title,
  subtitle,
  themeVariant = "default",
  layoutType = "carousel",
  cols = 3,
  rows = 1,
  limit = 6,
  isLandingPage = false,
  builderClassName,
  builderStyle,
  showNavigation = true,
  showPagination = true,
}: ProductReviewsProps) {
  const styles = themeStyles[themeVariant] || themeStyles.default;

  // Decide if we are in "Product Reviews" mode (specific product) or "Testimonial" mode (landing page)
  const isProductMode = !!productContext && !isLandingPage;

  // Setup defaults based on mode
  const sectionTitle =
    title || (isProductMode ? "Customer Reviews" : "Real Results, Real Beauty");
  const sectionSubtitle =
    subtitle ||
    (isProductMode
      ? `See what verified buyers are saying about ${productContext?.name || "this product"}`
      : "See what our customers are saying");

  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  const productId = productContext?.id;
  const productName = productContext?.name;
  const dbReviewsStr = productContext?.reviews
    ? JSON.stringify(productContext.reviews)
    : "";
  const testimonialsStr = testimonials ? JSON.stringify(testimonials) : "";

  // Fetch reviews or testimonials based on mode
  useEffect(() => {
    let isMounted = true;

    async function fetchReviews() {
      try {
        setLoading(true);
        if (isProductMode) {
          if (productId === "dummy-1") {
            // Provide fast dummy data for builder preview
            if (isMounted) {
              setItems(
                [
                  {
                    id: "d1",
                    name: "Sarah J.",
                    avatar: "",
                    rating: 5,
                    review:
                      "Absolutely love the freshness of these avocados! Perfect for my morning toast.",
                    createdAt: new Date().toISOString(),
                    product: "Premium Organic Avocado Box",
                  },
                  {
                    id: "d2",
                    name: "Michael T.",
                    avatar: "",
                    rating: 4,
                    review:
                      "Great quality, but one was a bit too ripe. Still delicious though.",
                    createdAt: new Date().toISOString(),
                    product: "Premium Organic Avocado Box",
                  },
                  {
                    id: "d3",
                    name: "Emma W.",
                    avatar: "",
                    rating: 5,
                    review:
                      "Best produce I've ever ordered online. Will definitely buy again.",
                    createdAt: new Date().toISOString(),
                    product: "Premium Organic Avocado Box",
                  },
                ].slice(0, limit),
              );
              setLoading(false);
            }
            return;
          }

          const dbReviews = dbReviewsStr ? JSON.parse(dbReviewsStr) : null;
          if (dbReviews && Array.isArray(dbReviews) && dbReviews.length > 0) {
            if (isMounted) {
              setItems(
                dbReviews.slice(0, limit).map((r: any, idx: number) => ({
                  id: r.id || `db-r-${idx}`,
                  name: r.reviewer || r.name || "Anonymous",
                  avatar: r.avatar || "",
                  rating: r.rating || 5,
                  review: r.content || r.review || "",
                  createdAt: r.createdAt,
                  product: productName || "",
                })),
              );
              setLoading(false);
            }
            return;
          }

          // Fallback to API if productContext doesn't have it (or it's empty)
          if (productId) {
            const res = await fetch(
              `${API_URL}/api/reviews/product/${productId}?limit=${limit}`,
            );
            if (res.ok) {
              const data = await res.json();
              if (data.success && data.data.length > 0) {
                if (isMounted) {
                  setItems(
                    data.data.map((r: any) => ({
                      id: r.id,
                      name: r.reviewer,
                      avatar: r.avatar || "",
                      rating: r.rating || 5,
                      review: r.content || "",
                      createdAt: r.createdAt,
                      product: productName || "",
                    })),
                  );
                  setLoading(false);
                }
                return;
              }
            }
          }
        } else {
          // Testimonials mode (landing page)
          const parsedTestimonials = testimonialsStr
            ? JSON.parse(testimonialsStr)
            : null;
          if (parsedTestimonials && parsedTestimonials.length > 0) {
            if (isMounted) {
              setItems(parsedTestimonials.slice(0, limit));
              setLoading(false);
            }
            return;
          }

          // Fallback to generic reviews API for landing page
          const res = await fetch(
            `${API_URL}/api/reviews?limit=${limit}&featured=true`,
          );
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.data.length > 0) {
              if (isMounted) {
                setItems(
                  data.data.map((r: any) => ({
                    id: r.id,
                    name: r.reviewer,
                    avatar: r.avatar || "",
                    rating: r.rating || 5,
                    review: r.content || "",
                    createdAt: r.createdAt,
                    product: r.product?.name || "",
                  })),
                );
                setLoading(false);
              }
              return;
            }
          }
        }

        // If everything fails and no DB data exists, set empty to not show anything
        if (isMounted) {
          setItems([]);
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to fetch reviews:", err);
        if (isMounted) setLoading(false);
      }
    }

    fetchReviews();

    return () => {
      isMounted = false;
    };
  }, [
    isProductMode,
    productId,
    productName,
    dbReviewsStr,
    testimonialsStr,
    limit,
  ]);

  const hasBuilderPadding =
    builderClassName?.includes("p-") ||
    builderClassName?.includes("py-") ||
    builderStyle?.padding;
  const hasBuilderBg =
    builderClassName?.includes("bg-") ||
    builderStyle?.backgroundColor ||
    builderStyle?.backgroundImage;
  const hasCustomColor =
    !!builderStyle?.color || builderClassName?.includes("text-");

  const titleColorClass = hasCustomColor
    ? "text-inherit"
    : "text-gray-900 dark:text-white";
  const subtitleColorClass = hasCustomColor
    ? "text-inherit opacity-80"
    : "text-gray-500 dark:text-gray-400";

  const carouselConfig: CommerceCarouselConfig = {
    columnsDesktop: cols,
    rowsDesktop: rows,
    columnsTablet: Math.min(cols, 2),
    rowsTablet: rows,
    columnsMobile: 1,
    rowsMobile: 1,
    gap: "md",
    autoplay: true,
    autoplayDelay: 3000,
    loop: true,
    showNavigation: showNavigation !== false,
    showPagination: showPagination !== false,
    layoutType: layoutType as "grid" | "carousel",
  };

  const renderCard = (item: Testimonial) => (
    <ReviewCard
      name={item.name}
      avatar={item.avatar}
      rating={item.rating}
      content={item.review || item.content || (item as any).description || ""}
      product={item.product}
      createdAt={item.createdAt}
      styles={styles}
    />
  );

  // Don't render anything if there are no reviews and we are done loading
  if (!loading && items.length === 0) {
    return null;
  }

  return (
    <section
      className={`${hasBuilderPadding ? "" : "py-[clamp(3rem,6vw,4rem)]"} ${hasBuilderBg ? "" : styles.bg} ${builderClassName || ""}`}
      style={builderStyle}
    >
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span
            className={`inline-flex items-center gap-2 px-[clamp(0.75rem,2vw,1rem)] py-[clamp(0.25rem,1vw,0.375rem)] rounded-full text-[clamp(0.75rem,1.5vw,0.875rem)] font-bold mb-4 ${styles.badgeBg}`}
          >
            <Star size={14} className={styles.starColor} />{" "}
            {isProductMode ? "Customer Reviews" : "Customer Reviews"}
          </span>
          <h2
            className={`text-[clamp(1.5rem,4vw,2.5rem)] font-black mb-[clamp(0.5rem,2vw,0.75rem)] ${titleColorClass}`}
          >
            {sectionTitle}
          </h2>
          <p
            className={`text-[clamp(0.875rem,2vw,1.125rem)] max-w-lg mx-auto ${subtitleColorClass}`}
          >
            {sectionSubtitle}
          </p>
        </div>

        {/* Dynamic Reviews/Testimonials Grid or Carousel */}
        {layoutType === "carousel" ? (
          <CommerceCarousel
            items={items}
            renderItem={renderCard}
            config={carouselConfig}
          />
        ) : (
          <div
            className="grid gap-[clamp(1rem,3vw,1.5rem)] grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-[grid-template-columns:repeat(var(--cols),minmax(0,1fr))]"
            style={
              {
                "--cols": cols,
              } as React.CSSProperties
            }
          >
            {items.map((item) => (
              <div key={item.id} className="h-full">
                {renderCard(item)}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
