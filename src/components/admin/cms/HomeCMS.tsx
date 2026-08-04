"use client";

import { API_URL } from "@/lib/config";
import { showToast } from "@/lib/toast";
import {
  Loader2,
  Save,
  GripVertical,
  Settings2,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Image as ImageIcon,
  X,
  ImagePlus,
  Copy,
  PlusCircle,
  Check,
} from "lucide-react";
import { ComponentSkeleton } from "./ComponentSkeletons";
import { CropImageModal } from "./CropImageModal";
import { useEffect, useState, useRef } from "react";
import { z } from "zod";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import MediaLibraryModal from "../MediaLibraryModal";

// --- Schema Definitions for the Inspector ---
type FieldType =
  | "text"
  | "textarea"
  | "image"
  | "select"
  | "category-select"
  | "tags"
  | "number"
  | "boolean"
  | "array";

interface FieldSchema {
  key: string;
  label: string;
  type: FieldType;
  options?: { label: string; value: string }[];
  placeholder?: string;
  description?: string;
  arraySchema?: FieldSchema[]; // For array types
  itemLabels?: string[]; // For overriding array item titles
}

interface ComponentDef {
  type: string;
  label: string;
  defaultProps: Record<string, any>;
  schema: FieldSchema[];
}

const productSourceSchema: FieldSchema = {
  key: "productSource",
  label: "Product Source",
  type: "select",
  options: [
    { label: "All Products", value: "ALL" },
    { label: "Weekly Sale", value: "WEEKLY_SALE" },
    { label: "Featured", value: "FEATURED" },
    { label: "New Arrivals", value: "NEW_ARRIVALS" },
    { label: "Best Sellers", value: "BEST_SELLERS" },
    { label: "Pre-order / Stock Out", value: "PRE_ORDER" },
  ],
};

const categoryFilterSchema: FieldSchema = {
  key: "categoryFilter",
  label: "Category",
  type: "category-select",
  placeholder: "All Categories",
};

const sortBySchema: FieldSchema = {
  key: "sortBy",
  label: "Sort By",
  type: "select",
  options: [
    { label: "Default (Latest)", value: "LATEST" },
    { label: "Price: Low to High", value: "PRICE_LOW" },
    { label: "Price: High to Low", value: "PRICE_HIGH" },
    { label: "Alphabetical (A-Z)", value: "ALPHABETICAL" },
  ],
};

const stockStatusSchema: FieldSchema = {
  key: "stockStatus",
  label: "Stock Status",
  type: "select",
  options: [
    { label: "Any", value: "ANY" },
    { label: "In Stock Only", value: "IN_STOCK" },
    { label: "Low Stock", value: "LOW_STOCK" },
  ],
};

const titleSchema: FieldSchema = {
  key: "title",
  label: "Section Title",
  type: "text",
};
const limitSchema: FieldSchema = {
  key: "limit",
  label: "Maximum Items",
  type: "number",
  placeholder: "e.g. 10",
};
const filterStyleSchema: FieldSchema = {
  key: "filterStyle",
  label: "Category Filter Style",
  type: "select",
  options: [
    { label: "Chips (Pills)", value: "pills" },
    { label: "Dropdown", value: "dropdown" },
  ],
};

const AVAILABLE_COMPONENTS: ComponentDef[] = [
  {
    type: "Hero",
    label: "Hero Slider",
    defaultProps: {
      slides: [
        {
          id: 1,
          title: "Comfortable Bras & Panty",
          subtitle: "For Women In Bangladesh",
          desc: "Soft, seamless & durable. Feel your very best every single day effortlessly.",
          img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1440&auto=format&fit=crop",
        },
        {
          id: 2,
          title: "The Autumn Edit",
          subtitle: "New Arrivals Are Here",
          desc: "Warmer tones, softer fabrics, and the comfortable support you need as the seasons change.",
          img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1440&auto=format&fit=crop",
        },
      ],
    },
    schema: [
      {
        key: "slides",
        label: "Slider Images & Content",
        type: "array",
        description:
          "Recommended: 1440x700px (or similar ratio) WebP/JPEG format",
        arraySchema: [
          { key: "img", label: "Slide Image", type: "image" },
          { key: "title", label: "Title", type: "text" },
          { key: "subtitle", label: "Subtitle", type: "text" },
          { key: "desc", label: "Description", type: "textarea" },
        ],
      },
    ],
  },
  {
    type: "TrustStrip",
    label: "Trust Strip",
    defaultProps: {
      items: [
        { icon: "Package", text: "Cash on Delivery" },
        { icon: "ArrowLeftRight", text: "Instant Returns" },
        { icon: "Truck", text: "Delivery within 48hrs" },
        { icon: "CheckCircle", text: "Best Price Deal" },
      ],
    },
    schema: [
      {
        key: "items",
        label: "Trust Strip Items",
        type: "array",
        arraySchema: [
          {
            key: "icon",
            label: "Icon Name (from Lucide)",
            type: "text",
            placeholder: "e.g. Package, Truck",
          },
          { key: "text", label: "Text", type: "text" },
        ],
      },
    ],
  },
  {
    type: "Categories",
    label: "Categories Carousel",
    defaultProps: {
      title: "Shop by Category",
    },
    schema: [{ key: "title", label: "Section Title", type: "text" }],
  },
  {
    type: "FeaturedProducts",
    label: "Featured Products Grid",
    defaultProps: {
      productSource: "FEATURED",
      limit: 10,
      bannerBadge: "Curated Collection",
      bannerTitle: "The Comfort Edit",
      bannerDesc:
        "Discover our most loved pieces, designed to provide unmatched softness and support for your everyday routine.",
      bannerButtonText: "Shop The Edit",
      bannerImage:
        "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop",
    },
    schema: [
      { key: "bannerBadge", label: "Banner Badge Text", type: "text" },
      { key: "bannerTitle", label: "Banner Title", type: "text" },
      { key: "bannerDesc", label: "Banner Description", type: "textarea" },
      { key: "bannerButtonText", label: "Banner Button Text", type: "text" },
      { key: "bannerImage", label: "Banner Image", type: "image" },
      productSourceSchema,
      limitSchema,
    ],
  },
  {
    type: "SizeBanner",
    label: "Size Banner",
    defaultProps: {
      img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop",
      alt: "Woman checking size",
      title: "Not Sure About Your Size?",
      description:
        "Take our quick 2-minute fit quiz. Answer a few questions and let us find your perfect fit. We promise it's worth it.",
      buttonText: "Find My Size",
    },
    schema: [
      { key: "title", label: "Title", type: "text" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "buttonText", label: "Button Text", type: "text" },
      { key: "img", label: "Banner Image", type: "image" },
      { key: "alt", label: "Image Alt Text", type: "text" },
    ],
  },
  {
    type: "BestSellers",
    label: "Best Sellers Slider",
    defaultProps: { productSource: "PROMOTION", limit: 10 },
    schema: [productSourceSchema, limitSchema],
  },
  {
    type: "NewArrivals",
    label: "New Arrivals Slider",
    defaultProps: { productSource: "ALL", limit: 10, sortBy: "LATEST" },
    schema: [productSourceSchema, sortBySchema, limitSchema],
  },
  {
    type: "LimitedOffers",
    label: "Limited Offers Banner",
    defaultProps: {
      title: "Flash Sale: 40% Off Basics",
      buttonText: "Shop The Sale",
      buttonLink: "/category/sale",
    },
    schema: [
      { key: "title", label: "Title", type: "text" },
      { key: "buttonText", label: "Button Text", type: "text" },
      { key: "buttonLink", label: "Button Link", type: "text" },
    ],
  },
  {
    type: "Reviews",
    label: "Customer Reviews",
    defaultProps: {
      bannerImage:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1440&auto=format&fit=crop",
      bannerTitle: "Over 10,000 Happy Women",
      bannerDesc:
        "Join our community and experience the comfort everyone is talking about.",
      title: "Real Conversations",
      subtitle: "What our customers are saying across the country.",
      chats: [
        {
          name: "Nadia I.",
          status: "Active now",
          initial: "N",
          msg1: "Apu, the bra I ordered is so comfortable! Thank you so much for suggesting the size.",
          msg2: "You're very welcome Nadia! We're glad it fits you perfectly ❤️",
          msg3: "I will definitely order again next week. The quality is amazing for this price.",
        },
        {
          name: "Tasnim R.",
          status: "Active 2h ago",
          initial: "T",
          msg1: "Just received my parcel! The packaging was very discreet, loved that.",
          msg2: "We always ensure your privacy! How is the product quality?",
          msg3: "The fabric feels so premium. Softest sports bra I've ever used 😍",
        },
      ],
    },
    schema: [
      { key: "bannerImage", label: "Banner Image", type: "image" },
      { key: "bannerTitle", label: "Banner Title", type: "text" },
      { key: "bannerDesc", label: "Banner Description", type: "textarea" },
      { key: "title", label: "Section Title", type: "text" },
      { key: "subtitle", label: "Section Subtitle", type: "text" },
      {
        key: "chatImage1",
        label: "Left Chat Screenshot (Optional)",
        type: "image",
      },
      {
        key: "chatImage2",
        label: "Right Chat Screenshot (Optional)",
        type: "image",
      },
      {
        key: "chats",
        label: "Chat Mockups (Fallback if no images provided)",
        type: "array",
        arraySchema: [
          { key: "name", label: "Customer Name", type: "text" },
          {
            key: "initial",
            label: "Avatar Initial",
            type: "text",
            placeholder: "e.g. N",
          },
          {
            key: "status",
            label: "Status Text",
            type: "text",
            placeholder: "e.g. Active now",
          },
          { key: "msg1", label: "Customer Message 1", type: "textarea" },
          { key: "msg2", label: "Admin Reply", type: "textarea" },
          { key: "msg3", label: "Customer Message 2", type: "textarea" },
        ],
      },
    ],
  },
  {
    type: "WhyShop",
    label: "Why Shop With Us",
    defaultProps: {
      title: "Why Femecart?",
      features: [
        {
          icon: "Shield",
          title: "Premium Quality",
          desc: "Tested for perfect fit and durability.",
        },
        {
          icon: "Package",
          title: "Discreet Packaging",
          desc: "Your privacy is fully protected with us.",
        },
        {
          icon: "Truck",
          title: "Fast Delivery",
          desc: "Get your products quickly and securely.",
        },
        {
          icon: "Headset",
          title: "Customer Support",
          desc: "We are here to help you anytime.",
        },
      ],
    },
    schema: [
      { key: "title", label: "Section Title", type: "text" },
      {
        key: "features",
        label: "Features",
        type: "array",
        arraySchema: [
          {
            key: "icon",
            label: "Icon Name (from Lucide)",
            type: "text",
            placeholder: "e.g. Shield",
          },
          { key: "title", label: "Title", type: "text" },
          { key: "desc", label: "Description", type: "text" },
        ],
      },
    ],
  },
  {
    type: "Editorial",
    label: "Editorial Block",
    defaultProps: {
      img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1440&auto=format&fit=crop",
      badgeText: "Editorial",
      title: "The Softness You Deserve",
      description:
        "Experience our new Cloud Cotton collection. Responsibly sourced, expertly crafted, and impossibly soft against your skin.",
      buttonText: "Explore the Edit",
      buttonLink: "/category/all",
    },
    schema: [
      { key: "img", label: "Background Image", type: "image" },
      { key: "badgeText", label: "Badge Text", type: "text" },
      { key: "title", label: "Title", type: "text" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "buttonText", label: "Button Text", type: "text" },
      { key: "buttonLink", label: "Button Link", type: "text" },
    ],
  },
  {
    type: "PreOrder",
    label: "Pre-Order Banner",
    defaultProps: {
      title: "Pre-order Collection",
      description:
        "Reserve our upcoming innovations before they sell out. Ships October 15th.",
      productSource: "ALL",
      limit: 10,
    },
    schema: [
      { key: "title", label: "Title", type: "text" },
      { key: "description", label: "Description", type: "textarea" },
      productSourceSchema,
      limitSchema,
    ],
  },
  {
    type: "Social",
    label: "Social Media Feed",
    defaultProps: {
      title: "Join the Community",
      instagramHandle: "@femcart.bd",
      images: [
        {
          img: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=400&auto=format&fit=crop",
          likes: "1.2k",
          link: "https://instagram.com/p/123",
        },
        {
          img: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=400&auto=format&fit=crop",
          likes: "845",
          link: "",
        },
        {
          img: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=400&auto=format&fit=crop",
          likes: "2.1k",
          link: "",
        },
        {
          img: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=400&auto=format&fit=crop",
          likes: "956",
          link: "",
        },
        {
          img: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=400&auto=format&fit=crop",
          likes: "3.4k",
          link: "",
        },
      ],
    },
    schema: [
      { key: "title", label: "Title", type: "text" },
      { key: "instagramHandle", label: "Instagram Handle", type: "text" },
      {
        key: "images",
        label: "Images",
        type: "array",
        arraySchema: [
          { key: "img", label: "Image", type: "image" },
          { key: "likes", label: "Likes (e.g. 1.2k) - Optional", type: "text" },
          { key: "link", label: "Custom Link - Optional", type: "text" },
        ],
      },
    ],
  },
  {
    type: "Newsletter",
    label: "Newsletter Signup",
    defaultProps: {
      title: "Get 10% Off Your First Order",
      description:
        "Join the community for early access to sales, new arrivals, and exclusive offers.",
      buttonText: "Subscribe",
    },
    schema: [
      { key: "title", label: "Title", type: "text" },
      { key: "description", label: "Description", type: "text" },
      { key: "buttonText", label: "Button Text", type: "text" },
    ],
  },
  {
    type: "SeoBlock",
    label: "SEO Content Block",
    defaultProps: {
      title: "Bra & Panty Price in Bangladesh",
      description:
        "Femecart is your trusted online destination for premium intimate apparel in Bangladesh. We understand the struggle of finding comfortable, well-fitting bras and panties that don't compromise on quality or price. Our curated collection offers everything from everyday seamless essentials to supportive activewear and elegant lace sets. With nationwide cash on delivery, 48-hour dispatch, and a hassle-free 7-day return policy, we make shopping for innerwear private, secure, and stress-free. Whether you're looking for the perfect T-shirt bra or comfortable maternity wear, Femecart ensures you feel confident from the inside out.",
      buttonText: "Read More & Articles",
      buttonLink: "/blog",
    },
    schema: [
      { key: "title", label: "Title", type: "text" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "buttonText", label: "Button Text", type: "text" },
      { key: "buttonLink", label: "Button Link", type: "text" },
    ],
  },
];

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

const DEFAULT_LAYOUT = AVAILABLE_COMPONENTS.map((c) => ({
  id: `${c.type.toLowerCase()}-${generateId()}`,
  type: c.type,
  enabled: true,
  props: c.defaultProps,
}));

// ----------------------------------------------------------------------
// Sortable Item Component
// ----------------------------------------------------------------------
function SortableComponentItem({
  id,
  item,
  isActive,
  onSelect,
  onToggle,
  onDuplicate,
  onDelete,
}: any) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => onSelect(item)}
      className={`group relative w-full rounded-xl overflow-hidden border mb-6 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md bg-white dark:bg-gray-900 ${isActive ? "border-pink-500 ring-2 ring-pink-500/20" : "border-gray-200 dark:border-gray-700 hover:border-gray-300"}`}
    >
      {/* Item Toolbar / Header */}
      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <div
            {...attributes}
            {...listeners}
            onClick={(e) => e.stopPropagation()}
            className="cursor-grab text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded transition-colors"
          >
            <GripVertical size={18} />
          </div>
          <p className="font-semibold text-gray-700 dark:text-gray-200 text-sm tracking-wide">
            {AVAILABLE_COMPONENTS.find((c) => c.type === item.type)?.label ||
              item.type}
            {!item.enabled && (
              <span className="ml-2 text-[10px] bg-pink-50 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 border border-pink-100 dark:border-pink-800 px-1.5 py-0.5 rounded uppercase tracking-wider">
                Hidden
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle(item.id);
            }}
            className={`p-1.5 rounded-md transition-colors ${item.enabled ? "bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 shadow-sm border border-gray-200 dark:border-gray-600" : "bg-gray-100 dark:bg-gray-800 text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"}`}
            title="Toggle Visibility"
          >
            {item.enabled ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate(item);
            }}
            className="p-1.5 rounded-md transition-colors bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 shadow-sm border border-gray-200 dark:border-gray-600"
            title="Duplicate Component"
          >
            <Copy size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(item.id);
            }}
            className="p-1.5 rounded-md transition-colors bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300 hover:bg-pink-50 dark:hover:bg-pink-900/30 hover:text-pink-600 dark:hover:text-pink-400 shadow-sm border border-gray-200 dark:border-gray-600"
            title="Delete Component"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Visual Skeleton Layout Background */}
      <div
        className={`transition-all duration-300 pointer-events-none bg-gray-50/50 dark:bg-gray-800/30 ${!item.enabled ? "hidden" : "opacity-100"}`}
      >
        <ComponentSkeleton type={item.type} />
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// Tags Input Component
// ----------------------------------------------------------------------
function TagsInput({ value, onChange, className, placeholder }: any) {
  const [inputValue, setInputValue] = useState(() =>
    Array.isArray(value) ? value.join(", ") : value || "",
  );

  useEffect(() => {
    if (Array.isArray(value)) {
      const str = value.join(", ");
      const currentParsed = inputValue
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean)
        .join(", ");
      if (str !== currentParsed) {
        setInputValue(str);
      }
    }
  }, [value]);

  return (
    <input
      type="text"
      value={inputValue}
      onChange={(e) => {
        setInputValue(e.target.value);
        const tags = e.target.value
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        onChange(tags);
      }}
      className={className}
      placeholder={placeholder}
    />
  );
}

// ----------------------------------------------------------------------
// Array Editor Components
// ----------------------------------------------------------------------
function SortableArrayItem({
  id,
  index,
  item,
  field,
  imgField,
  otherFields,
  onChangeItem,
  onRemove,
  onOpenMediaPicker,
  categories,
  isExpanded,
  onToggleExpand,
}: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm transition-all duration-300 ${isDragging ? "ring-2 ring-pink-500 shadow-2xl scale-[1.02] border-transparent" : "hover:shadow-md"} ${isExpanded ? "p-5" : "p-3 hover:bg-gray-50 dark:hover:bg-gray-800/80 cursor-pointer"}`}
      onClick={!isExpanded ? onToggleExpand : undefined}
    >
      <div
        className={`flex items-center justify-between ${isExpanded ? "mb-4 pb-3 border-b border-gray-100 dark:border-gray-750" : ""}`}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <div
            {...attributes}
            {...listeners}
            onClick={(e) => e.stopPropagation()}
            className="cursor-grab active:cursor-grabbing p-1.5 -ml-1 rounded-lg text-gray-400 hover:text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-colors shrink-0"
          >
            <GripVertical size={18} />
          </div>

          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 text-xs font-bold shrink-0">
            {index + 1}
          </span>

          {field.itemLabels?.[index] && (
            <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700 text-[10px] font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider shrink-0 hidden sm:block border border-gray-200 dark:border-gray-600">
              {field.itemLabels[index]}
            </span>
          )}

          {!isExpanded ? (
            <div className="flex items-center gap-3 overflow-hidden ml-1">
              {imgField && item[imgField.key] ? (
                <img
                  src={item[imgField.key]}
                  className="w-10 h-10 object-cover rounded-lg border border-gray-200 dark:border-gray-700 shrink-0"
                  alt="Preview"
                />
              ) : imgField ? (
                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-900 rounded-lg flex items-center justify-center border border-gray-200 dark:border-gray-700 shrink-0">
                  <ImageIcon size={14} className="text-gray-400" />
                </div>
              ) : null}
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300 truncate">
                {item.title ||
                  item.badgeText ||
                  item.description ||
                  item.subtitle ||
                  "Click to view/edit details..."}
              </span>
            </div>
          ) : (
            <span className="text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider truncate">
              {item.title || item.badgeText || "Item Details"}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0 ml-4">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand();
            }}
            className="flex items-center gap-1.5 text-gray-500 hover:text-pink-600 px-3 py-1.5 rounded-lg transition-colors bg-gray-50 hover:bg-pink-50 dark:bg-gray-900 dark:hover:bg-pink-900/20 text-xs font-bold shadow-sm"
          >
            {isExpanded ? (
              <>
                <EyeOff size={14} /> Close
              </>
            ) : (
              <>
                <Settings2 size={14} /> Edit
              </>
            )}
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="text-gray-400 hover:text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/20 p-1.5 rounded-lg transition-colors bg-gray-50 dark:bg-gray-900 shadow-sm"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left side: Image */}
          {imgField && (
            <div className="w-full md:w-1/3 shrink-0">
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-0.5 uppercase tracking-wider">
                {imgField.label}
              </label>
              {imgField.description && (
                <p className="text-[10px] text-gray-500 mb-2 leading-tight">
                  {imgField.description}
                </p>
              )}
              <FieldEditor
                field={imgField}
                value={item[imgField.key]}
                onChange={(val: any) => onChangeItem(imgField.key, val)}
                onOpenMediaPicker={onOpenMediaPicker}
                categories={categories}
              />
            </div>
          )}

          {/* Right side: Other Fields */}
          <div className={`w-full ${imgField ? "md:w-2/3" : ""} space-y-4`}>
            {otherFields.map((subField: FieldSchema) => (
              <div key={subField.key}>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-0.5 uppercase tracking-wider">
                  {subField.label}
                </label>
                {subField.description && (
                  <p className="text-[10px] text-gray-500 mb-2 leading-tight">
                    {subField.description}
                  </p>
                )}
                <FieldEditor
                  field={subField}
                  value={item[subField.key]}
                  onChange={(val: any) => onChangeItem(subField.key, val)}
                  onOpenMediaPicker={onOpenMediaPicker}
                  categories={categories}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ArrayEditorComponent({
  field,
  value,
  onChange,
  onOpenMediaPicker,
  categories,
}: any) {
  const items = Array.isArray(value) ? value : [];
  const imgField = field.arraySchema.find((f: any) => f.type === "image");
  const otherFields = field.arraySchema.filter((f: any) => f.type !== "image");

  const idMapRef = useRef(new WeakMap<any, string>());
  const counterRef = useRef(0);
  const getId = (item: any, index: number) => {
    if (item._id) return item._id;
    if (typeof item === "object" && item !== null) {
      if (!idMapRef.current.has(item)) {
        counterRef.current += 1;
        idMapRef.current.set(
          item,
          `item-${counterRef.current}`,
        );
      }
      return idMapRef.current.get(item);
    }
    return `item-${index}`;
  };

  // eslint-disable-next-line react-hooks/refs
  const ids = items.map((item: any, idx: number) => getId(item, idx));
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = ids.indexOf(active.id as string);
      const newIndex = ids.indexOf(over.id as string);
      if (oldIndex !== -1 && newIndex !== -1) {
        onChange(arrayMove(items, oldIndex, newIndex));
      }
    }
  };

  return (
    <div className="space-y-6">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          {items.map((item: any, index: number) => {
            const id = ids[index];
            return (
              <SortableArrayItem
                key={id}
                id={id}
                index={index}
                item={item}
                field={field}
                imgField={imgField}
                otherFields={otherFields}
                isExpanded={expandedIds.has(id)}
                onToggleExpand={() => toggleExpand(id)}
                onChangeItem={(key: string, val: any) => {
                  const newItems = [...items];
                  const stableId = newItems[index]._id || id;
                  newItems[index] = {
                    ...newItems[index],
                    [key]: val,
                    _id: stableId,
                  };
                  onChange(newItems);
                }}
                onRemove={() => {
                  const newItems = [...items];
                  newItems.splice(index, 1);
                  onChange(newItems);
                }}
                onOpenMediaPicker={onOpenMediaPicker}
                categories={categories}
              />
            );
          })}
        </SortableContext>
      </DndContext>

      {items.length < 10 ? (
        <button
          type="button"
          onClick={() => {
            if (imgField) {
              onOpenMediaPicker((urls: string | string[]) => {
                const urlArray = Array.isArray(urls) ? urls : [urls];
                const newItems = urlArray
                  .slice(0, 10 - items.length)
                  .map((url: string) => ({ [imgField.key]: url }));
                const updatedItems = [...items, ...newItems];
                onChange(updatedItems);
                // Expand all newly added items
                const newExpanded = new Set(expandedIds);
                updatedItems
                  .slice(items.length)
                  .forEach((i: any, idx: number) => {
                    newExpanded.add(getId(i, items.length + idx));
                  });
                setExpandedIds(newExpanded);
              }, true);
            } else {
              const newItem = {};
              const updatedItems = [...items, newItem];
              onChange(updatedItems);
            }
          }}
          className="w-full py-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-pink-600 dark:hover:text-pink-400 hover:bg-pink-50/50 dark:hover:bg-pink-900/10 hover:border-pink-300 transition-all flex items-center justify-center gap-2 shadow-sm bg-gray-50/50 dark:bg-gray-800/30"
        >
          <Plus size={18} /> Add New {field.label.replace(/s$/i, "")}
        </button>
      ) : (
        <div className="w-full py-3 text-center text-sm font-bold text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
          Maximum limit of 10 items reached
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------
// Debounced Inputs (to fix typing stutter)
// ----------------------------------------------------------------------
function DebouncedInput({ value, onChange, className, placeholder }: any) {
  const [localValue, setLocalValue] = useState(value || "");

  useEffect(() => {
    setLocalValue(value || "");
  }, [value]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (localValue !== (value || "")) {
        onChange(localValue);
      }
    }, 400);
    return () => clearTimeout(handler);
  }, [localValue, value, onChange]);

  return (
    <input
      type="text"
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      className={className}
      placeholder={placeholder}
    />
  );
}

function DebouncedTextarea({ value, onChange, className, placeholder }: any) {
  const [localValue, setLocalValue] = useState(value || "");

  useEffect(() => {
    setLocalValue(value || "");
  }, [value]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (localValue !== (value || "")) {
        onChange(localValue);
      }
    }, 400);
    return () => clearTimeout(handler);
  }, [localValue, value, onChange]);

  return (
    <textarea
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      className={className}
      placeholder={placeholder}
    />
  );
}

// ----------------------------------------------------------------------
// Field Editor Component (Recursive for arrays)
// ----------------------------------------------------------------------
function FieldEditor({
  field,
  value,
  onChange,
  onOpenMediaPicker,
  categories = [],
}: any) {
  const [activeItemIndex, setActiveItemIndex] = useState<number | null>(null);
  const [showCropModal, setShowCropModal] = useState(false);

  const isMissing =
    !value || (typeof value === "string" && value.trim() === "");
  const isOptional = field.label.toLowerCase().includes("optional");
  const hasError =
    isMissing &&
    !isOptional &&
    field.type !== "boolean" &&
    field.type !== "array";

  const baseInputClass = `w-full px-4 py-3 border rounded-xl text-sm transition-all outline-none font-medium placeholder:font-normal placeholder:text-gray-400 shadow-sm ${
    hasError
      ? "border-pink-500 bg-pink-50 dark:bg-pink-900/10 focus:ring-2 focus:ring-pink-500/20 text-pink-900 dark:text-pink-100 placeholder:text-pink-300"
      : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
  }`;

  if (field.type === "text") {
    return (
      <DebouncedInput
        value={value}
        onChange={onChange}
        className={baseInputClass}
        placeholder={field.placeholder}
      />
    );
  }
  if (field.type === "textarea") {
    return (
      <DebouncedTextarea
        value={value}
        onChange={onChange}
        className={`${baseInputClass} min-h-[100px] resize-y`}
        placeholder={field.placeholder}
      />
    );
  }
  if (field.type === "image") {
    const imageContainerClass = `w-full max-h-48 min-h-[144px] aspect-auto p-2 border-2 border-dashed rounded-2xl flex items-center justify-center cursor-pointer transition-all group overflow-hidden relative ${
      hasError
        ? "border-pink-500 bg-pink-50 dark:bg-pink-900/10 hover:border-pink-600"
        : "border-gray-300 dark:border-gray-700 hover:border-pink-500 hover:bg-pink-50/50 dark:hover:bg-pink-900/10 bg-gray-50 dark:bg-gray-900"
    }`;

    return (
      <div className="space-y-3 relative">
        <div
          onClick={() =>
            onOpenMediaPicker((res: string | string[]) =>
              onChange(Array.isArray(res) ? res[0] : res),
            )
          }
          className={imageContainerClass}
        >
          {value ? (
            <>
              <img
                src={value}
                alt="Preview"
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-2 bg-white/20 dark:bg-black/20 backdrop-blur-[3px]">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowCropModal(true);
                  }}
                  className="bg-white text-gray-900 px-5 py-2 rounded-xl font-bold text-sm hover:scale-105 hover:shadow-xl transition-all shadow-md border border-gray-100 dark:border-gray-800"
                >
                  Crop Image
                </button>
                <span className="bg-white text-gray-900 px-5 py-2 rounded-xl font-bold text-sm hover:scale-105 hover:shadow-xl transition-all shadow-md border border-gray-100 dark:border-gray-800">
                  Replace
                </span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange("");
                }}
                className="absolute top-2 right-2 p-1.5 bg-pink-600 hover:bg-pink-700 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                title="Remove image"
              >
                <Trash2 size={16} />
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center text-gray-400 dark:text-gray-500 group-hover:text-pink-500 dark:group-hover:text-pink-400 transition-colors">
              <ImagePlus size={32} strokeWidth={1.5} className="mb-2" />
              <span className="text-sm font-semibold">
                Upload or Select Image
              </span>
            </div>
          )}
        </div>

        {showCropModal && value && (
          <CropImageModal
            imageUrl={value}
            onClose={() => setShowCropModal(false)}
            onSave={(newUrl) => {
              onChange(newUrl);
              setShowCropModal(false);
            }}
          />
        )}
      </div>
    );
  }
  if (field.type === "number") {
    return (
      <input
        type="number"
        value={value || ""}
        onChange={(e) => onChange(parseInt(e.target.value) || 0)}
        className={baseInputClass}
        placeholder={field.placeholder}
      />
    );
  }
  if (field.type === "boolean") {
    return (
      <label className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 cursor-pointer hover:border-pink-300 transition-colors">
        <input
          type="checkbox"
          checked={!!value}
          onChange={(e) => onChange(e.target.checked)}
          className="rounded border-gray-300 text-pink-600 focus:ring-pink-500 w-5 h-5 cursor-pointer"
        />
        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
          Enabled
        </span>
      </label>
    );
  }
  if (field.type === "select") {
    return (
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className={baseInputClass}
      >
        {field.options?.map((opt: any) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    );
  }
  if (field.type === "category-select") {
    return (
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className={baseInputClass}
      >
        <option value="">{field.placeholder || "All Categories"}</option>
        {categories.map((cat: any) => (
          <option key={cat.slug} value={cat.slug}>
            {cat.name}
          </option>
        ))}
      </select>
    );
  }
  if (field.type === "tags") {
    return (
      <TagsInput
        value={value}
        onChange={onChange}
        className={baseInputClass}
        placeholder={field.placeholder || "tag1, tag2"}
      />
    );
  }
  if (field.type === "array" && field.arraySchema) {
    return (
      <ArrayEditorComponent
        field={field}
        value={value}
        onChange={onChange}
        onOpenMediaPicker={onOpenMediaPicker}
        categories={categories}
      />
    );
  }
  return null;
}

// ----------------------------------------------------------------------
// Main CMS Component
// ----------------------------------------------------------------------
export default function HomeCMS() {
  const [layout, setLayout] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [showAddComponent, setShowAddComponent] = useState(false);

  // Media Picker State
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [isMediaPickerMultiple, setIsMediaPickerMultiple] = useState(false);
  const [mediaPickerCallback, setMediaPickerCallback] = useState<
    ((url: any) => void) | null
  >(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token =
        localStorage.getItem("femcart_access_token") ||
        localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/global-settings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success && json.data?.HOME_PAGE_LAYOUT) {
        try {
          const parsed = JSON.parse(json.data.HOME_PAGE_LAYOUT);
          // If the user already saved an older layout, we want to make sure it includes ALL components
          // missing from the saved layout, so they can toggle them.
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Filter out deprecated components that were removed from codebase
            const validParsed = parsed.filter((p: any) =>
              AVAILABLE_COMPONENTS.some((c) => c.type === p.type),
            );

            const existingIds = new Set(validParsed.map((p: any) => p.type));
            const missing = AVAILABLE_COMPONENTS.filter(
              (c) => !existingIds.has(c.type),
            ).map((c) => ({
              id: `${c.type.toLowerCase()}-${generateId()}`,
              type: c.type,
              enabled: false,
              props: c.defaultProps,
            }));
            setLayout([...validParsed, ...missing]);
          } else {
            setLayout(DEFAULT_LAYOUT);
          }
        } catch (e) {
          console.error("Failed to parse HOME_PAGE_LAYOUT in CMS", e);
          setLayout(DEFAULT_LAYOUT);
        }
      } else {
        setLayout(DEFAULT_LAYOUT);
      }
      // Fetch categories
      try {
        const catRes = await fetch(`${API_URL}/api/categories`);
        const catJson = await catRes.json();
        if (catJson.success) {
          setCategories(catJson.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    } catch (e) {
      console.error(e);
      setLayout(DEFAULT_LAYOUT);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // Basic Zod-based validation loop for strings
    const StringSchema = z.string().max(1500, "Text is excessively long");
    let hasValidationError = false;

    const validateProps = (obj: any): void => {
      if (hasValidationError) return;
      if (typeof obj === "string") {
        const res = StringSchema.safeParse(obj);
        if (!res.success) {
          hasValidationError = true;
          showToast.error(
            "Validation Failed: A text field exceeds the maximum length of 1500 characters.",
          );
        }
      } else if (typeof obj === "object" && obj !== null) {
        Object.values(obj).forEach(validateProps);
      }
    };

    layout.forEach((item) => validateProps(item.props));

    if (hasValidationError) return;

    setSaving(true);
    try {
      const token =
        localStorage.getItem("femcart_access_token") ||
        localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/global-settings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          settings: { HOME_PAGE_LAYOUT: JSON.stringify(layout) },
        }),
      });
      const json = await res.json();
      if (json.success) {
        showToast.success("Layout saved successfully");
      } else {
        showToast.error(json.message || "Failed to save layout");
      }
    } catch (e: any) {
      showToast.error(e.message || "Server error");
    } finally {
      setSaving(false);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setLayout((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over?.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const toggleComponent = (id: string) => {
    setLayout(
      layout.map((item) =>
        item.id === id ? { ...item, enabled: !item.enabled } : item,
      ),
    );
  };

  const deleteComponent = (id: string) => {
    if (confirm("Are you sure you want to delete this component?")) {
      setLayout(layout.filter((item) => item.id !== id));
      if (selectedId === id) setSelectedId(null);
    }
  };

  const duplicateComponent = (item: any) => {
    const newItem = {
      ...item, // Deep clone props to avoid ref mutations
      props: JSON.parse(JSON.stringify(item.props)),
      id: `${item.type.toLowerCase()}-${generateId()}`,
    };
    const index = layout.findIndex((i) => i.id === item.id);
    const newLayout = [...layout];
    newLayout.splice(index + 1, 0, newItem);
    setLayout(newLayout);
    setSelectedId(newItem.id);
  };

  const addComponent = (def: ComponentDef) => {
    const newItem = {
      id: `${def.type.toLowerCase()}-${generateId()}`,
      type: def.type,
      enabled: true,
      props: JSON.parse(JSON.stringify(def.defaultProps)),
    };
    setLayout([...layout, newItem]);
    setSelectedId(newItem.id);
    setShowAddComponent(false);
    // Scroll to bottom
    setTimeout(() => {
      const canvas = document.getElementById("layout-canvas");
      if (canvas) canvas.scrollTop = canvas.scrollHeight;
    }, 100);
  };

  const updateSelectedProps = (key: string, value: any) => {
    if (!selectedId) return;
    setLayout(
      layout.map((item) => {
        if (item.id === selectedId) {
          return { ...item, props: { ...item.props, [key]: value } };
        }
        return item;
      }),
    );
  };

  const openMediaPickerFor = (
    callback: (url: any) => void,
    multiple = false,
  ) => {
    setMediaPickerCallback(() => callback);
    setIsMediaPickerMultiple(multiple);
    setIsMediaPickerOpen(true);
  };

  const selectedItem = layout.find((item) => item.id === selectedId);
  const selectedDef = selectedItem
    ? AVAILABLE_COMPONENTS.find((c) => c.type === selectedItem.type)
    : null;

  if (loading) {
    return (
      <div className="p-12 flex justify-center">
        <Loader2 className="animate-spin text-pink-500 w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] bg-gray-50/50 dark:bg-gray-900/50 rounded-2xl border border-gray-200/80 dark:border-gray-800 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-20 shadow-sm relative">
        <div>
          <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
            Home Page Builder
          </h2>
          <p className="text-sm text-gray-500 font-medium mt-0.5">
            Drag to reorder components. Configure details in the inspector.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-pink-600 text-white px-6 py-2.5 rounded-xl hover:bg-pink-700 hover:shadow-lg hover:shadow-pink-600/20 transition-all font-bold disabled:opacity-50 active:scale-95"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save Layout
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Center Canvas: Active Layout */}
        <div
          id="layout-canvas"
          className="flex-1 bg-gray-50 dark:bg-gray-900 overflow-y-auto p-6 border-r border-gray-200 dark:border-gray-700 relative scroll-smooth"
        >
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">
            Page Layout
          </h3>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={layout.map((i) => i.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="w-[95%] max-w-6xl mx-auto pb-32">
                {layout.map((item) => (
                  <SortableComponentItem
                    key={item.id}
                    id={item.id}
                    item={item}
                    isActive={selectedId === item.id}
                    onSelect={(i: any) => setSelectedId(i.id)}
                    onToggle={toggleComponent}
                    onDelete={deleteComponent}
                    onDuplicate={duplicateComponent}
                  />
                ))}

                {/* Add Component Area */}
                <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800 flex justify-center relative">
                  {!showAddComponent ? (
                    <button
                      onClick={() => setShowAddComponent(true)}
                      className="flex items-center gap-2 bg-white dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-bold px-8 py-3 rounded-xl hover:text-pink-600 hover:border-pink-400 hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-all shadow-sm"
                    >
                      <PlusCircle size={20} /> Add New Component
                    </button>
                  ) : (
                    <div className="absolute top-8 w-[400px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 p-2 overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700 mb-2">
                        <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                          Choose Component
                        </h4>
                        <button
                          onClick={() => setShowAddComponent(false)}
                          className="text-gray-400 hover:text-pink-500"
                        >
                          <X size={16} />
                        </button>
                      </div>
                      <div className="max-h-[300px] overflow-y-auto pr-1 space-y-1">
                        {AVAILABLE_COMPONENTS.map((def) => (
                          <button
                            key={def.type}
                            onClick={() => addComponent(def)}
                            className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors flex items-center justify-between group"
                          >
                            <span className="font-semibold text-gray-700 dark:text-gray-200 text-sm">
                              {def.label}
                            </span>
                            <Plus
                              size={16}
                              className="text-gray-300 group-hover:text-pink-500 transition-colors"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </SortableContext>
          </DndContext>
        </div>

        {/* Right Sidebar: Property Inspector */}
        <div className="w-[450px] lg:w-[500px] bg-white dark:bg-gray-800 overflow-y-auto p-6 flex flex-col border-l border-gray-200 dark:border-gray-700 shadow-xl z-10">
          <div className="flex items-center justify-between gap-2 mb-6 shrink-0 border-b border-gray-100 dark:border-gray-750 pb-4">
            <div className="flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-gray-900 dark:text-white" />
              <h3 className="text-base font-bold text-gray-900 dark:text-white tracking-wide">
                Property Inspector
              </h3>
            </div>

            <button
              onClick={() => setSelectedId(null)}
              className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all text-sm font-bold active:scale-95"
            >
              <Check className="w-4 h-4" />
              Done
            </button>
          </div>

          {!selectedItem || !selectedDef ? (
            <div className="text-center p-6 text-gray-500 bg-gray-50 dark:bg-gray-900 rounded-lg text-sm border border-dashed border-gray-300 dark:border-gray-700">
              Select a component from the layout to configure its properties.
            </div>
          ) : (
            <div className="space-y-6 flex-1 overflow-y-auto pb-8 pr-2">
              <div className="p-3 bg-pink-50 dark:bg-pink-900/10 rounded-lg border border-pink-100 dark:border-pink-900/20">
                <p className="text-sm font-semibold text-pink-800 dark:text-pink-400">
                  {selectedDef.label}
                </p>
                <p className="text-xs text-pink-600/80 dark:text-pink-400/80 mt-1 font-mono">
                  {selectedItem.id}
                </p>
              </div>

              {selectedDef.schema.length === 0 && (
                <p className="text-sm text-gray-500 italic">
                  This component has no configurable properties yet.
                </p>
              )}

              {/* Dynamic Property Forms based on schema */}
              <div className="space-y-6">
                {selectedDef.schema.map((field) => (
                  <div
                    key={field.key}
                    className="space-y-1.5 pb-6 border-b border-gray-100 dark:border-gray-700/50 last:border-0 last:pb-0"
                  >
                    <label className="block text-sm font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                      {field.label}
                    </label>
                    {field.description && (
                      <p className="text-xs text-gray-500 mb-3 leading-relaxed">
                        {field.description}
                      </p>
                    )}
                    <FieldEditor
                      field={field}
                      value={
                        selectedItem.props[field.key] !== undefined
                          ? selectedItem.props[field.key]
                          : selectedDef.defaultProps?.[field.key]
                      }
                      onChange={(val: any) =>
                        updateSelectedProps(field.key, val)
                      }
                      onOpenMediaPicker={openMediaPickerFor}
                      categories={categories}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <MediaLibraryModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        preferredSize="full"
        title="Pick Image"
        multiple={isMediaPickerMultiple}
        onSelect={(media, sizeUrl) => {
          if (mediaPickerCallback) mediaPickerCallback(sizeUrl);
          setIsMediaPickerOpen(false);
        }}
      />
    </div>
  );
}
