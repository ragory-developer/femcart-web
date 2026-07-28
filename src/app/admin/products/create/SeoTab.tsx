import { useSettingsStore } from "@/store/settingsStore";
import { useFormContext } from "react-hook-form";
import { ProductFormValues } from "@/lib/validations/product";
import { AlertCircle } from "lucide-react";

export default function SeoTab() {
  const { settings } = useSettingsStore();
  const permalinkStructure = settings.permalink_structure || "product";

  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<ProductFormValues>();
  const slug = watch("slug");

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 md:p-8 shadow-sm">
        <div className="border-b border-gray-100 dark:border-gray-750 pb-4 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Search Engine Optimization
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Configure how this product appears in search engine results.
          </p>
        </div>

        <div className="space-y-6">
          <div className="relative">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              URL Slug
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-4 rounded-l-lg border border-r-0 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-sm">
                {permalinkStructure === "product" ? "/product/" : "/"}
              </span>
              <input
                type="text"
                value={slug || ""}
                onChange={(e) =>
                  setValue(
                    "slug",
                    e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
                  )
                }
                placeholder="custom-product-url"
                className={`flex-1 px-4 py-2.5 rounded-r-lg border ${errors.slug ? "border-pink-500" : "border-gray-200 dark:border-gray-700"} bg-gray-50 dark:bg-gray-900/50 text-sm focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900 dark:text-white transition-colors`}
              />
            </div>
            {errors.slug ? (
              <p className="absolute top-full left-0 mt-1 text-pink-500 text-[11px] font-medium flex items-center gap-1">
                <AlertCircle size={14} /> {errors.slug.message}
              </p>
            ) : (
              <p className="absolute top-full left-0 mt-1 text-[11px] text-gray-500">
                Leave blank to auto-generate from the product name.
              </p>
            )}
          </div>

          <div className="relative">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Meta Title
            </label>
            <input
              type="text"
              {...register("metaTitle")}
              placeholder="SEO optimized title..."
              className={`w-full px-4 py-2.5 rounded-lg border ${errors.metaTitle ? "border-pink-500" : "border-gray-200 dark:border-gray-700"} bg-gray-50 dark:bg-gray-900/50 text-sm focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900 dark:text-white transition-colors`}
            />
            {errors.metaTitle && (
              <p className="absolute top-full left-0 mt-1 text-pink-500 text-[11px] font-medium flex items-center gap-1">
                <AlertCircle size={14} /> {errors.metaTitle.message}
              </p>
            )}
          </div>

          <div className="relative">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Meta Keywords
            </label>
            <input
              type="text"
              {...register("metaKeywords")}
              placeholder="fresh, groceries, organic, ..."
              className={`w-full px-4 py-2.5 rounded-lg border ${errors.metaKeywords ? "border-pink-500" : "border-gray-200 dark:border-gray-700"} bg-gray-50 dark:bg-gray-900/50 text-sm focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900 dark:text-white transition-colors`}
            />
            {errors.metaKeywords && (
              <p className="absolute top-full left-0 mt-1 text-pink-500 text-[11px] font-medium flex items-center gap-1">
                <AlertCircle size={14} /> {errors.metaKeywords.message}
              </p>
            )}
          </div>

          <div className="relative">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Meta Description
            </label>
            <textarea
              {...register("metaDescription")}
              rows={4}
              placeholder="Write a highly descriptive summary for search engines..."
              className={`w-full px-4 py-3 rounded-lg border ${errors.metaDescription ? "border-pink-500" : "border-gray-200 dark:border-gray-700"} bg-gray-50 dark:bg-gray-900/50 text-sm focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900 dark:text-white resize-y transition-colors leading-relaxed`}
            />
            {errors.metaDescription && (
              <p className="absolute top-full left-0 mt-1 text-pink-500 text-[11px] font-medium flex items-center gap-1">
                <AlertCircle size={14} /> {errors.metaDescription.message}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
