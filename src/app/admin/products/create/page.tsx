"use client";
import { API_URL } from "@/lib/config";

import FaqTab from "@/components/admin/tabs/FaqTab";
import SpecificationTabWrapper from "@/components/admin/tabs/SpecificationTabWrapper";
import UpsellDownsellTab from "@/components/admin/tabs/UpsellDownsellTab";
import VariationTab from "@/components/admin/tabs/VariationTab";
import { showToast } from "@/lib/toast";
import {
  BarChart,
  Check,
  Image as ImageIcon,
  Layers,
  Settings,
  SlidersHorizontal,
  TrendingUp,
  AlertCircle,
  Package,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema, ProductFormValues } from "@/lib/validations/product";

import GeneralTab from "./GeneralTab";
import InventoryLogisticsTab from "./InventoryLogisticsTab";
import MediaTab from "./MediaTab";
import SeoTab from "./SeoTab";

function getToken() {
  return typeof window !== "undefined"
    ? localStorage.getItem("femcart_access_token") ||
        localStorage.getItem("token") ||
        ""
    : "";
}

export interface ProductFormData {
  name: string;
  description: string;
  shortDescription: string;
  price: string;
  specialPrice: string;
  specialPriceStart: string;
  specialPriceEnd: string;
  stock: string;
  image: string;
  images: string;
  unit: string;
  weight: string;
  featured: boolean;
  categoryIds: string[];
  brandId: string;
  tags: string[];

  // SEO
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  slug: string;

  // Upsell / Downsell
  upsellProducts: string[];
  upsellCategoryIds: string[];
  downsellProducts: string[];
  downsellCategoryIds: string[];

  // New Inventory Fields
  sku: string;
  countryOfOrigin: string;
  isHalal: boolean;
}

const tabs = [
  { id: "general", label: "General Information", icon: Settings },
  { id: "inventory", label: "Inventory & Logistics", icon: Package },
  { id: "media", label: "Media Gallery", icon: ImageIcon },
  { id: "specifications", label: "Specifications", icon: SlidersHorizontal },
  { id: "variations", label: "Variations & Stock", icon: Layers },
  { id: "upsell", label: "Upsells & Downsells", icon: TrendingUp },
  { id: "seo", label: "SEO & Search", icon: BarChart },
  { id: "faqs", label: "Product FAQs", icon: AlertCircle },
];

export default function CreateProductPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  const methods = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: {
      name: "",
      description: "",
      shortDescription: "",
      price: "",
      specialPrice: "",
      specialPriceStart: "",
      specialPriceEnd: "",
      stock: "0",
      image: "",
      images: "",
      unit: "piece",
      weight: "",
      sku: "",
      countryOfOrigin: "",
      isHalal: true,
      featured: false,
      categoryIds: [],
      brandId: "",
      tags: [],
      metaTitle: "",
      metaDescription: "",
      metaKeywords: "",
      slug: "",
      upsellProducts: [],
      upsellCategoryIds: [],
      downsellProducts: [],
      downsellCategoryIds: [],
      variants: [],
      specifications: [],
      faqs: [],
    },
  });

  const {
    handleSubmit,
    formState: { errors },
  } = methods;

  const onSubmit = async (data: ProductFormValues) => {
    setSaving(true);
    try {
      const galleryImages = data.images
        ? data.images
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean)
        : [];

      const body: any = {
        name: data.name,
        description: data.description || null,
        shortDescription: data.shortDescription || null,
        price: parseFloat(data.price),
        specialPrice: data.specialPrice ? parseFloat(data.specialPrice) : null,
        specialPriceStart: data.specialPriceStart || null,
        specialPriceEnd: data.specialPriceEnd || null,
        stock: parseInt(data.stock) || 0,
        image: data.image || null,
        images: galleryImages,
        unit: data.unit,
        weight: data.weight || null,
        sku: data.sku || null,
        countryOfOrigin: data.countryOfOrigin || null,
        isHalal: data.isHalal,
        featured: data.featured,
        categoryIds: data.categoryIds,
        brandId: data.brandId || null,
        tags: data.tags || [],
        seoData: {
          title: data.metaTitle || null,
          description: data.metaDescription || null,
          keywords: data.metaKeywords || null,
        },
        slug: data.slug || null,
        specifications:
          data.specifications.length > 0 ? data.specifications : null,
        faqs: data.faqs.length > 0 ? data.faqs : null,
        upsellProducts:
          data.upsellProducts.length > 0 ? data.upsellProducts : null,
        upsellCategoryIds:
          data.upsellCategoryIds.length > 0 ? data.upsellCategoryIds : null,
        downsellProducts:
          data.downsellProducts.length > 0 ? data.downsellProducts : null,
        downsellCategoryIds:
          data.downsellCategoryIds.length > 0 ? data.downsellCategoryIds : null,
      };

      if (data.variants.length > 0) {
        body.productType = "VARIABLE";
        body.variants = data.variants.map((v, idx) => ({
          sku: v.sku || null,
          price: parseFloat(v.price) || body.price,
          specialPrice: v.specialPrice ? parseFloat(v.specialPrice) : null,
          specialPriceStart: v.specialPriceStart || null,
          specialPriceEnd: v.specialPriceEnd || null,
          stock: parseInt(v.stock) || 0,
          image: v.image || null,
          isDefault: v.isDefault,
          enabled: v.enabled,
          attributes: v.attributes.filter((a: any) => a.value.trim()),
        }));
      }

      const res = await fetch(`${API_URL}/api/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        showToast.success("Product created successfully!");
        router.push("/admin/products");
      } else {
        const err = await res.json();
        const errorMessage = Array.isArray(err.errors)
          ? err.errors.map((e: any) => e.message || e).join(", ")
          : err.message || "Failed to create product. Please try again.";
        showToast.error(errorMessage);
      }
    } catch (error) {
      showToast.error(
        "Network error or server is unreachable. Please check your connection.",
      );
    }
  };

  const tabHasError = (tabId: string, errors: any) => {
    switch (tabId) {
      case "general":
        return !!(
          errors.name ||
          errors.price ||
          errors.specialPrice ||
          errors.stock ||
          errors.categoryIds ||
          errors.slug
        );
      case "media":
        return !!(errors.image || errors.images);
      case "specifications":
        return !!errors.specifications;
      case "variations":
        return !!errors.variants;
      case "faqs":
        return !!errors.faqs;
      case "seo":
        return !!(
          errors.metaTitle ||
          errors.metaDescription ||
          errors.metaKeywords
        );
      case "upsell":
        return !!(
          errors.upsellProducts ||
          errors.upsellCategoryIds ||
          errors.downsellProducts ||
          errors.downsellCategoryIds
        );
      default:
        return false;
    }
  };

  const handleInvalid = (errors: any) => {
    console.error("Validation Errors:", errors);
  };

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit, handleInvalid)}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-black text-gray-900 dark:text-white">
                Create Product
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Build out your product utilizing the WordPress-style creation
                tabs.
              </p>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg font-bold text-sm transition-colors shadow-lg shadow-emerald-600/20 disabled:opacity-50"
            >
              <Check size={18} /> {saving ? "Saving..." : "Create Product"}
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row min-h-[600px]">
            {/* Left Sidebar Tabs */}
            <div className="w-full md:w-64 bg-gray-55 dark:bg-gray-900/40 border-r border-gray-200 dark:border-gray-750 p-4 shrink-0 flex flex-col gap-1.5">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition-all duration-200 text-left border relative ${
                    activeTab === tab.id
                      ? "bg-white dark:bg-gray-800 text-emerald-600 dark:text-emerald-400 shadow-sm border-gray-200 dark:border-gray-700 pl-5 before:absolute before:left-0 before:top-3 before:bottom-3 before:w-1 before:bg-emerald-650 dark:before:bg-emerald-500 before:rounded-r"
                      : "text-gray-550 dark:text-gray-400 hover:bg-gray-150/40 dark:hover:bg-gray-850/30 hover:text-gray-950 dark:hover:text-white border-transparent hover:translate-x-1"
                  }`}
                >
                  <tab.icon
                    size={18}
                    className={`transition-colors duration-200 ${activeTab === tab.id ? "text-emerald-650 dark:text-emerald-555" : tabHasError(tab.id, errors) ? "text-pink-500 dark:text-pink-400" : "text-gray-400 dark:text-gray-500"}`}
                  />
                  <span
                    className={
                      tabHasError(tab.id, errors)
                        ? "text-pink-600 dark:text-pink-400"
                        : ""
                    }
                  >
                    {tab.label}
                  </span>
                  {tabHasError(tab.id, errors) && (
                    <span className="ml-auto flex items-center justify-center w-5 h-5 rounded-full bg-pink-100 dark:bg-pink-900/40 text-pink-600 dark:text-pink-400">
                      <AlertCircle size={12} />
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Right Content Area */}
            <div className="flex-1 p-6 lg:p-10 bg-white dark:bg-gray-800 overflow-y-auto min-h-[500px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                  className="h-full"
                >
                  {activeTab === "general" && <GeneralTab />}
                  {activeTab === "inventory" && <InventoryLogisticsTab />}
                  {activeTab === "media" && <MediaTab />}
                  {activeTab === "specifications" && (
                    <SpecificationTabWrapper />
                  )}
                  {activeTab === "variations" && <VariationTab />}
                  {activeTab === "faqs" && <FaqTab />}
                  {activeTab === "seo" && <SeoTab />}
                  {activeTab === "upsell" && <UpsellDownsellTab />}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
