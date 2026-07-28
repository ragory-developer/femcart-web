export interface ProductBannerItem {
  id: string;
  title: string;
  price: string;
  originalPrice?: string;
  rating: string;
  ctaText: string;
  ctaHref: string;
  imageSrc: string;
  badge?: string;
  badgeIcon?: "fire" | "sparkle" | "trending" | "star";
}

export interface BestBuyBannerProps {
  title?: string;
  subtitle?: string;
  products?: ProductBannerItem[];
  builderClassName?: string;
  builderStyle?: React.CSSProperties;
}
