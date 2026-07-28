import {
  LucideIcon,
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
} from "lucide-react";

export interface SubCategory {
  title: string;
  href: string;
}

export interface Category {
  id: string;
  title: string;
  image?: string;
  slug?: string;
  icon: LucideIcon;
  subcategories: {
    title: string;
    href?: string;
    items: SubCategory[];
  }[];
}

export const categoriesData: Category[] = [
  {
    id: "food",
    title: "Food",
    icon: Apple,
    subcategories: [
      {
        title: "Fruits & Vegetables",
        items: [
          { title: "Fresh Fruits", href: "/category/fresh-fruits" },
          { title: "Fresh Vegetables", href: "/category/fresh-vegetables" },
          { title: "Organic Produce", href: "/category/organic-produce" },
        ],
      },
      {
        title: "Meat & Fish",
        items: [
          { title: "Fresh Fish", href: "/category/fresh-fish" },
          { title: "Chicken & Poultry", href: "/category/chicken-poultry" },
          { title: "Premium Beef", href: "/category/premium-beef" },
        ],
      },
      {
        title: "Dairy",
        items: [
          { title: "Milk & Cream", href: "/category/milk-cream" },
          { title: "Cheese", href: "/category/cheese" },
          { title: "Butter & Margarine", href: "/category/butter-margarine" },
        ],
      },
    ],
  },
  {
    id: "baby",
    title: "Baby Food & Care",
    icon: Baby,
    subcategories: [
      {
        title: "Baby Food",
        items: [
          { title: "Formula", href: "/category/formula" },
          { title: "Baby Snacks", href: "/category/baby-snacks" },
        ],
      },
      {
        title: "Baby Care",
        items: [
          { title: "Diapers", href: "/category/diapers" },
          { title: "Baby Wipes", href: "/category/baby-wipes" },
        ],
      },
    ],
  },
  {
    id: "diapers",
    title: "Diapers",
    icon: ShieldAlert,
    subcategories: [],
  },
  {
    id: "cleaning",
    title: "Home Cleaning",
    icon: Sparkles,
    subcategories: [],
  },
  {
    id: "pets",
    title: "Pet Care",
    icon: Dog,
    subcategories: [],
  },
  {
    id: "beauty",
    title: "Beauty & Health",
    icon: HeartPulse,
    subcategories: [],
  },
  {
    id: "fashion",
    title: "Fashion & Lifestyle",
    icon: ShoppingBag,
    subcategories: [],
  },
  {
    id: "kitchen",
    title: "Home & Kitchen",
    icon: Utensils,
    subcategories: [],
  },
  {
    id: "stationery",
    title: "Stationeries",
    icon: PenTool,
    subcategories: [],
  },
  {
    id: "gadget",
    title: "Gadget",
    icon: Smartphone,
    subcategories: [],
  },
];

export const bannerSlidesData = [
  {
    id: 1,
    imageSrc:
      "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80",
    badgeText: "World Cup Bonanza",
    title: "Win Tk 1000",
    description: "Bazar Voucher On 1,000 Taka Purchase Every Week",
    ctaText: "Shop Now",
    ctaHref: "/offers/world-cup",
  },
  {
    id: 2,
    imageSrc:
      "https://images.unsplash.com/photo-1608686207856-001b95cf60ca?auto=format&fit=crop&q=80",
    badgeText: "Fresh Arrival",
    title: "Organic Fruits",
    description:
      "Get the freshest organic fruits delivered directly from farm to your door.",
    ctaText: "Explore More",
    ctaHref: "/category/organic",
  },
  {
    id: 3,
    imageSrc:
      "https://images.unsplash.com/photo-1574316071802-0d684efa7ba5?auto=format&fit=crop&q=80",
    badgeText: "Special Offer",
    title: "Daily Essentials",
    description:
      "Stock up your pantry with everyday essentials at unbeatable prices.",
    ctaText: "View Deals",
    ctaHref: "/offers/essentials",
  },
];

export const categoryCardsData = [
  {
    id: 1,
    title: "Fish",
    imageSrc:
      "https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?auto=format&fit=crop&w=400&q=80",
    href: "/category/fish",
  },
  {
    id: 2,
    title: "Fresh Vegetables",
    imageSrc:
      "https://images.unsplash.com/photo-1597362925123-77861d3fbac7?auto=format&fit=crop&w=400&q=80",
    href: "/category/fresh-vegetables",
  },
  {
    id: 3,
    title: "Oil",
    imageSrc:
      "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=400&q=80",
    href: "/category/oil",
  },
  {
    id: 4,
    title: "Spices",
    imageSrc:
      "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=400&q=80",
    href: "/category/spices",
  },
  {
    id: 5,
    title: "Fresh Fruits",
    imageSrc:
      "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=400&q=80",
    href: "/category/fresh-fruits",
  },
  {
    id: 6,
    title: "Meat",
    imageSrc:
      "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=400&q=80",
    href: "/category/meat",
  },
];
