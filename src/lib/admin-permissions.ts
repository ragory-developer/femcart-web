import {
  Activity,
  Download,
  FolderTree,
  ImageIcon,
  Layers,
  LayoutDashboard,
  MapPin,
  MessageSquare,
  Package,
  Percent,
  PlusCircle,
  Settings,
  Shield,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  SlidersHorizontal,
  Star,
  Tag,
  Ticket,
  Trash2,
  Users,
  Wallet,
  Presentation,
  RotateCcw,
  PackageMinus,
} from "lucide-react";

export const navCategories = [
  {
    category: "Overview",
    items: [
      {
        label: "Dashboard",
        href: "/admin",
        icon: LayoutDashboard,
        permission: "DASHBOARD",
      },
    ],
  },
  {
    category: "Catalog",
    items: [
      {
        label: "Products",
        href: "/admin/products",
        icon: ShoppingBag,
        permission: "PRODUCTS",
      },
      {
        label: "Add Product",
        href: "/admin/products/create",
        icon: PlusCircle,
        permission: "PRODUCTS",
      },
      {
        label: "Categories",
        href: "/admin/categories",
        icon: FolderTree,
        permission: "CATEGORIES",
      },
      {
        label: "Brands",
        href: "/admin/brands",
        icon: Tag,
        permission: "BRANDS",
      },
      {
        label: "Variations",
        href: "/admin/variations",
        icon: Layers,
        permission: "VARIATIONS",
      },
      {
        label: "Specifications",
        href: "/admin/specifications",
        icon: SlidersHorizontal,
        permission: "SPECIFICATIONS",
      },
    ],
  },
  {
    category: "Sales",
    items: [
      {
        label: "Orders",
        href: "/admin/orders",
        icon: Package,
        permission: "ORDERS",
      },
      {
        label: "Abandoned Carts",
        href: "/admin/abandoned-carts",
        icon: ShoppingCart,
        permission: "ORDERS",
      },
      {
        label: "Returned Products",
        href: "/admin/returned-products",
        icon: RotateCcw,
        permission: "ORDERS",
      },
      {
        label: "Damaged Products",
        href: "/admin/damaged-products",
        icon: PackageMinus,
        permission: "ORDERS",
      },
      {
        label: "Promotions",
        href: "/admin/promotions",
        icon: Percent,
        permission: "PROMOTIONS",
      },
      {
        label: "Coupons",
        href: "/admin/coupons",
        icon: Ticket,
        permission: "SETTINGS",
      },
    ],
  },
  {
    category: "Marketing & CRM",
    items: [
      {
        label: "Customers",
        href: "/admin/customers",
        icon: Users,
        permission: "USERS",
      },
      {
        label: "Reviews",
        href: "/admin/reviews",
        icon: Star,
        permission: "PRODUCTS",
      },
      {
        label: "Messages",
        href: "/admin/messages",
        icon: MessageSquare,
        permission: "SETTINGS",
      },
      {
        label: "SMS Marketing",
        href: "/admin/sms-marketing",
        icon: MessageSquare,
        permission: "USERS",
      },
      {
        label: "Global Wallet",
        href: "/admin/wallet",
        icon: Wallet,
        permission: "SETTINGS",
      },
      {
        label: "Facebook Manager",
        href: "/admin/facebook-manager",
        icon: Activity,
        permission: "SETTINGS",
      },
    ],
  },
  {
    category: "Storefront",
    items: [
      {
        label: "Home CMS",
        href: "/admin/home-builder",
        icon: LayoutDashboard,
        permission: "PAGES",
      },

      {
        label: "Navigation",
        href: "/admin/navigation",
        icon: Layers,
        permission: "SETTINGS",
      },
      {
        label: "Media",
        href: "/admin/media",
        icon: ImageIcon,
        permission: "MEDIA",
      },
    ],
  },
  {
    category: "System",
    items: [
      {
        label: "Settings",
        href: "/admin/settings",
        icon: Settings,
        permission: "SETTINGS",
      },
      {
        label: "Locations",
        href: "/admin/locations",
        icon: MapPin,
        permission: "SETTINGS",
      },
      {
        label: "Admin Users",
        href: "/admin/users",
        icon: ShieldCheck,
        permission: "USERS",
      },
      {
        label: "Roles & Admins",
        href: "/admin/roles",
        icon: Shield,
        permission: "SUPER_ADMIN",
      },
      {
        label: "Trash Bin",
        href: "/admin/trash",
        icon: Trash2,
        permission: "SUPER_ADMIN",
      },
      {
        label: "WP Import",
        href: "/admin/wp-import",
        icon: Download,
        permission: "IMPORT",
      },
      {
        label: "Shopify Import",
        href: "/admin/shopify-import",
        icon: Download,
        permission: "IMPORT",
      },
      {
        label: "Bulk Import",
        href: "/admin/bulk-import",
        icon: Download,
        permission: "IMPORT",
      },
    ],
  },
];

/**
 * Helper function to determine required permission for a given path.
 * If path is not found in navigation map, defaults to requiring SUPER_ADMIN to be safe.
 */
export const getRequiredPermissionForPath = (path: string | null): string => {
  if (!path) return "SUPER_ADMIN";

  // Exact match first
  for (const group of navCategories) {
    for (const item of group.items) {
      if (item.href === path) {
        return item.permission;
      }
    }
  }

  // Sub-path match (e.g. /admin/products/123 -> /admin/products)
  let longestMatch = null;
  for (const group of navCategories) {
    for (const item of group.items) {
      if (path.startsWith(item.href) && item.href !== "/admin") {
        if (!longestMatch || item.href.length > longestMatch.href.length) {
          longestMatch = item;
        }
      }
    }
  }

  if (longestMatch) {
    return longestMatch.permission;
  }

  // If it's literally just /admin, return DASHBOARD
  if (path === "/admin") {
    return "DASHBOARD";
  }

  // Unmapped admin routes default to requiring SUPER_ADMIN for safety
  return "SUPER_ADMIN"; // Safe default
};

/**
 * Gets the first available route for a user based on their permissions.
 */
export const getDefaultRouteForUser = (user: any): string => {
  if (!user) return "/admin/login";
  if (user.role === "SUPER_ADMIN") return "/admin";

  let perms: string[] = [];
  if (Array.isArray(user.permissions)) {
    perms = user.permissions;
  } else if (typeof user.permissions === "string") {
    try {
      perms = JSON.parse(user.permissions);
    } catch {
      return "/admin/login";
    }
  }

  if (perms.includes("ALL") || perms.includes("DASHBOARD")) return "/admin";

  for (const group of navCategories) {
    for (const item of group.items) {
      if (perms.includes(item.permission)) {
        return item.href;
      }
    }
  }

  // If no matching nav items, fallback to login
  return "/admin/login";
};
