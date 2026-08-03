"use client";
import { API_URL } from "@/lib/config";

import FaqTab from "@/components/admin/tabs/FaqTab";
import SpecificationTabWrapper from "@/components/admin/tabs/SpecificationTabWrapper";
import UpsellDownsellTab from "@/components/admin/tabs/UpsellDownsellTab";
import VariationTab from "@/components/admin/tabs/VariationTab";
import { showToast } from "@/lib/toast";
import {
  ArrowLeft,
  BarChart,
  Check,
  Image as ImageIcon,
  Layers,
  Loader2,
  Settings,
  SlidersHorizontal,
  TrendingUp,
  AlertCircle,
  Package,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema, ProductFormValues } from "@/lib/validations/product";

import GeneralTab from "../../create/GeneralTab";
import InventoryLogisticsTab from "../../create/InventoryLogisticsTab";
import MediaTab from "../../create/MediaTab";
import SeoTab from "../../create/SeoTab";

function getToken() {
  return typeof window !== "undefined"
    ? localStorage.getItem("femcart_access_token") ||
        localStorage.getItem("token") ||
        ""
    : "";
}

const tabs = [
  { id: "general", label: "General", icon: Settings },
  { id: "inventory", label: "Inventory", icon: Package },
  { id: "media", label: "Media", icon: ImageIcon },
  { id: "specifications", label: "Specifications", icon: SlidersHorizontal },
  { id: "variations", label: "Variations", icon: Layers },
  { id: "faqs", label: "FAQs", icon: Settings },
  { id: "seo", label: "SEO", icon: BarChart },
  { id: "upsell", label: "Upsell/Downsell", icon: TrendingUp },
];

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [productId, setProductId] = useState<string | null>(null);

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
      isFemcart: true,
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
    reset,
  } = methods;

  useEffect(() => {
    if (!slug) return;

    const fetchProduct = async () => {
      try {
        const res = await fetch(`${API_URL}/api/products/${slug}`);
        const json = await res.json();
        if (json.success && json.data) {
          const p = json.data;
          setProductId(p.id);

          let parsedImages: string[] = [];
          if (Array.isArray(p.images)) {
            parsedImages = p.images;
          } else if (typeof p.images === "string") {
            try {
              const parsed = JSON.parse(p.images);
              parsedImages = Array.isArray(parsed) ? parsed : [p.images];
            } catch (e) {
              parsedImages = p.images ? [p.images] : [];
            }
          }

          reset({
            name: p.name || "",
            description: p.description || "",
            shortDescription: p.shortDescription || "",
            price: p.price?.toString() || "",
            specialPrice: p.specialPrice?.toString() || "",
            specialPriceStart: p.specialPriceStart
              ? new Date(p.specialPriceStart).toISOString().split("T")[0]
              : "",
            specialPriceEnd: p.specialPriceEnd
              ? new Date(p.specialPriceEnd).toISOString().split("T")[0]
              : "",
            stock: p.stock?.toString() || "0",
            image: p.image || "",
            images: parsedImages.join("\n"),
            unit: p.unit || "piece",
            weight: p.weight || "",
            sku: p.sku || "",
            countryOfOrigin: p.countryOfOrigin || "",
            isFemcart: p.isFemcart ?? true,
            featured: p.featured || false,
            categoryIds: p.categories?.map((c: any) => c.id) || [],
            brandId: p.brandId || "",
            tags: p.tags?.map((t: any) => t.id) || [],
            metaTitle: p.seoData?.title || "",
            metaDescription: p.seoData?.description || "",
            metaKeywords: p.seoData?.keywords || "",
            slug: p.slug || "",
            upsellProducts: p.upsellProducts || [],
            upsellCategoryIds: p.upsellCategoryIds || [],
            downsellProducts: p.downsellProducts || [],
            downsellCategoryIds: p.downsellCategoryIds || [],
            specifications: Array.isArray(p.specifications)
              ? p.specifications
              : [],
            faqs: Array.isArray(p.faqs) ? p.faqs : [],
            variants: Array.isArray(p.variants)
              ? p.variants.map((v: any) => ({
                  id: v.id,
                  isDefault: v.isDefault,
                  enabled: v.enabled,
                  image: v.image || "",
                  price: v.price?.toString() || "",
                  specialPrice: v.specialPrice?.toString() || "",
                  specialPriceStart: v.specialPriceStart
                    ? new Date(v.specialPriceStart).toISOString().split("T")[0]
                    : "",
                  specialPriceEnd: v.specialPriceEnd
                    ? new Date(v.specialPriceEnd).toISOString().split("T")[0]
                    : "",
                  stock: v.stock?.toString() || "0",
                  sku: v.sku || "",
                  attributes:
                    v.attributes?.map((a: any) => ({
                      name: a.name,
                      value: a.value,
                    })) || [],
                }))
              : [],
          });
        }
      } catch (e) {
        console.error("Failed to fetch product", e);
        showToast.error("Failed to load product details.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug, reset]);

  const onSubmit = async (data: ProductFormValues) => {
    if (!productId) return;
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
        isFemcart: data.isFemcart,
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
          id: v.id || null,
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
      } else {
        body.productType = "SIMPLE";
        body.variants = [];
      }

      const res = await fetch(`${API_URL}/api/products/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        showToast.success("Product updated successfully!");
        router.push("/admin/products");
      } else {
        const err = await res.json();
        const errorMessage = Array.isArray(err.errors)
          ? err.errors.map((e: any) => e.message || e).join(", ")
          : err.message || "Failed to update product. Please try again.";
        showToast.error(errorMessage);
      }
    } catch (error) {
      showToast.error(
        "Network error or server is unreachable. Please check your connection.",
      );
    } finally {
      setSaving(false);
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-gray-500">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-500 mb-4" />
        <p className="font-medium text-lg text-gray-900 dark:text-white">
          Loading product details...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit, handleInvalid)}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <Link
                href="/admin/products"
                className="inline-flex items-center text-sm font-semibold text-gray-500 hover:text-emerald-650 mb-2 transition-colors"
              >
                <ArrowLeft size={16} className="mr-1" /> Back to Products
              </Link>
              <h1 className="text-3xl font-black text-gray-900 dark:text-white">
                Update Product
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Update the product details and configuration.
              </p>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg font-bold text-sm transition-colors shadow-lg shadow-emerald-600/20 disabled:opacity-50"
            >
              <Check size={18} /> {saving ? "Saving..." : "Update Product"}
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
                    className={`transition-colors duration-200 ${activeTab === tab.id ? "text-emerald-650 dark:text-emerald-555" : tabHasError(tab.id, errors) ? "text-red-500 dark:text-red-400" : "text-gray-400 dark:text-gray-500"}`}
                  />
                  <span
                    className={
                      tabHasError(tab.id, errors)
                        ? "text-red-600 dark:text-red-400"
                        : ""
                    }
                  >
                    {tab.label}
                  </span>
                  {tabHasError(tab.id, errors) && (
                    <span className="ml-auto flex items-center justify-center w-5 h-5 rounded-full bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400">
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
                  {activeTab === "general" && (
                    <GeneralTab excludeId={productId || undefined} />
                  )}
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
