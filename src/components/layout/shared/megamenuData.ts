import {
  LucideIcon,
  Info,
  Beef,
  Leaf,
  Globe,
  ShoppingBasket,
  CupSoda,
  Home,
  HeadphonesIcon,
} from "lucide-react";

export interface SubCategory {
  title: string;
  href: string;
}

export interface Category {
  id: string;
  title: string;
  icon: LucideIcon;
  subcategories: {
    title: string;
    items: SubCategory[];
  }[];
}

export const megamenuData: Category[] = [
  {
    id: "meat-seafood",
    title: "Meat & Seafood",
    icon: Beef,
    subcategories: [
      {
        title: "All Meat & Seafood",
        items: [
          { title: "Halal Meat Market", href: "/categories/halal-meat-market" },
          {
            title: "Fresh Halal Chicken",
            href: "/categories/fresh-halal-chicken",
          },
          { title: "Fresh Halal Beef", href: "/categories/fresh-halal-beef" },
          {
            title: "Halal Goat & Lamb",
            href: "/categories/fresh-halal-goat-lamb",
          },
          {
            title: "Halal Seafood & Fish",
            href: "/categories/halal-fish-seafood",
          },
        ],
      },
    ],
  },
  {
    id: "produce-fresh",
    title: "Produce & Fresh",
    icon: Leaf,
    subcategories: [
      {
        title: "Fresh Produce",
        items: [{ title: "Fresh Produce", href: "/categories/fresh-produce" }],
      },
    ],
  },
  {
    id: "ethnic-grocery",
    title: "Ethnic Grocery",
    icon: Globe,
    subcategories: [
      {
        title: "By Region",
        items: [
          {
            title: "Bangladeshi Grocery",
            href: "/categories/bangladeshi-grocery-store",
          },
          { title: "Indian Grocery", href: "/categories/indian-grocery-store" },
          {
            title: "Pakistani Grocery",
            href: "/categories/pakistani-grocery-store",
          },
          {
            title: "Middle Eastern Grocery",
            href: "/categories/middle-eastern-grocery-store",
          },
        ],
      },
    ],
  },
  {
    id: "pantry-frozen",
    title: "Pantry, Frozen & Staples",
    icon: ShoppingBasket,
    subcategories: [
      {
        title: "Pantry Essentials",
        items: [
          {
            title: "Rice, Spices & Lentils",
            href: "/categories/rice-spices-lentils",
          },
          { title: "Frozen Foods", href: "/categories/frozen-halal-foods" },
          { title: "Snacks & Sweets", href: "/categories/halal-snacks-sweets" },
        ],
      },
    ],
  },
  {
    id: "dairy-drinks",
    title: "Dairy & Drinks",
    icon: CupSoda,
    subcategories: [
      {
        title: "Beverages & Dairy",
        items: [
          { title: "Drinks & Beverages", href: "/categories/drinks-beverages" },
          { title: "Dairy & Eggs", href: "/categories/dairy-eggs" },
        ],
      },
    ],
  },
  {
    id: "household-specials",
    title: "Household & Specials",
    icon: Home,
    subcategories: [
      {
        title: "Home & Offers",
        items: [
          {
            title: "Household Essentials",
            href: "/categories/household-essentials",
          },
          { title: "Weekly Specials", href: "/categories/weekly-specials" },
        ],
      },
    ],
  },
  {
    id: "company-info",
    title: "Company & Info",
    icon: Info,
    subcategories: [
      {
        title: "About Us",
        items: [
          { title: "Homepage", href: "/" },
          { title: "About Us", href: "/about" },
          { title: "Location & Hours", href: "/location-hours" },
          { title: "Blog / Recipes", href: "/blog" },
        ],
      },
    ],
  },
  {
    id: "services-support",
    title: "Services & Support",
    icon: HeadphonesIcon,
    subcategories: [
      {
        title: "Customer Support",
        items: [
          { title: "Contact Us", href: "/contact" },
          { title: "FAQ", href: "/faq" },
          {
            title: "Online Grocery Ordering",
            href: "/order-halal-groceries-online",
          },
          { title: "Catering / Bulk Orders", href: "/catering-bulk-orders" },
        ],
      },
    ],
  },
];
