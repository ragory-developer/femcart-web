"use client";
import { API_URL } from "@/lib/config";
import { useEffect, useState } from "react";
import Select from "react-select";
import { useFormContext, Controller } from "react-hook-form";
import { ProductFormValues } from "@/lib/validations/product";

export default function UpsellDownsellTab() {
  const { control, watch } = useFormContext<ProductFormValues>();

  const upsellProducts = watch("upsellProducts") || [];
  const upsellCategoryIds = watch("upsellCategoryIds") || [];
  const downsellProducts = watch("downsellProducts") || [];
  const downsellCategoryIds = watch("downsellCategoryIds") || [];

  const [categories, setCategories] = useState<
    { value: string; label: string }[]
  >([]);
  const [products, setProducts] = useState<
    { value: string; label: string; image: string }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/api/categories`).then((r) => r.json()),
      fetch(`${API_URL}/api/products?limit=1000`).then((r) => r.json()),
    ])
      .then(([catData, prodData]) => {
        if (catData?.data) {
          setCategories(
            catData.data.map((c: any) => ({ value: c.id, label: c.name })),
          );
        }
        if (prodData?.data) {
          setProducts(
            prodData.data.map((p: any) => ({
              value: p.id,
              label: p.name,
              image: p.image,
            })),
          );
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 md:p-8 shadow-sm">
        <div className="border-b border-gray-100 dark:border-gray-750 pb-4 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Upsell Products
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Recommend products instead of the currently viewed product, for
            example, products that are more profitable or better quality.
            <b className="ml-1 text-gray-700 dark:text-gray-300">
              You can choose specific products OR a category, not both.
            </b>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Specific Products
            </label>
            <div
              className={`transition-opacity ${upsellCategoryIds.length > 0 ? "opacity-50 pointer-events-none" : "opacity-100"}`}
            >
              <Controller
                name="upsellProducts"
                control={control}
                render={({ field }) => (
                  <Select
                    isMulti
                    options={products}
                    isLoading={loading}
                    isDisabled={upsellCategoryIds.length > 0}
                    value={products.filter((p) =>
                      (field.value || []).includes(p.value),
                    )}
                    onChange={(selected) =>
                      field.onChange(selected.map((s: any) => s.value))
                    }
                    className="react-select-container text-gray-900"
                    classNamePrefix="react-select"
                    placeholder="Search products..."
                    menuPosition="fixed"
                  />
                )}
              />
            </div>
            {upsellCategoryIds.length > 0 && (
              <p className="text-xs text-orange-500 mt-1">
                Disabled because categories are currently selected.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Full Category
            </label>
            <div
              className={`transition-opacity ${upsellProducts.length > 0 ? "opacity-50 pointer-events-none" : "opacity-100"}`}
            >
              <Controller
                name="upsellCategoryIds"
                control={control}
                render={({ field }) => (
                  <Select
                    isMulti
                    options={categories}
                    isLoading={loading}
                    isDisabled={upsellProducts.length > 0}
                    value={categories.filter((c) =>
                      (field.value || []).includes(c.value),
                    )}
                    onChange={(selected) =>
                      field.onChange(selected.map((s: any) => s.value))
                    }
                    className="react-select-container text-gray-900"
                    classNamePrefix="react-select"
                    placeholder="Select category..."
                    menuPosition="fixed"
                  />
                )}
              />
            </div>
            {upsellProducts.length > 0 && (
              <p className="text-xs text-orange-500 mt-1">
                Disabled because specific products are selected.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 md:p-8 shadow-sm">
        <div className="border-b border-gray-100 dark:border-gray-750 pb-4 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Downsell (Cross-sells) Products
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Promote items in the cart or product page based on the current
            product (e.g., related accessories).
            <b className="ml-1 text-gray-700 dark:text-gray-300">
              You can choose specific products OR a category, not both.
            </b>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Specific Products
            </label>
            <div
              className={`transition-opacity ${downsellCategoryIds.length > 0 ? "opacity-50 pointer-events-none" : "opacity-100"}`}
            >
              <Controller
                name="downsellProducts"
                control={control}
                render={({ field }) => (
                  <Select
                    isMulti
                    options={products}
                    isLoading={loading}
                    isDisabled={downsellCategoryIds.length > 0}
                    value={products.filter((p) =>
                      (field.value || []).includes(p.value),
                    )}
                    onChange={(selected) =>
                      field.onChange(selected.map((s: any) => s.value))
                    }
                    className="react-select-container text-gray-900"
                    classNamePrefix="react-select"
                    placeholder="Search products..."
                    menuPosition="fixed"
                  />
                )}
              />
            </div>
            {downsellCategoryIds.length > 0 && (
              <p className="text-xs text-orange-500 mt-1">
                Disabled because categories are currently selected.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Full Category
            </label>
            <div
              className={`transition-opacity ${downsellProducts.length > 0 ? "opacity-50 pointer-events-none" : "opacity-100"}`}
            >
              <Controller
                name="downsellCategoryIds"
                control={control}
                render={({ field }) => (
                  <Select
                    isMulti
                    options={categories}
                    isLoading={loading}
                    isDisabled={downsellProducts.length > 0}
                    value={categories.filter((c) =>
                      (field.value || []).includes(c.value),
                    )}
                    onChange={(selected) =>
                      field.onChange(selected.map((s: any) => s.value))
                    }
                    className="react-select-container text-gray-900"
                    classNamePrefix="react-select"
                    placeholder="Select category..."
                    menuPosition="fixed"
                  />
                )}
              />
            </div>
            {downsellProducts.length > 0 && (
              <p className="text-xs text-orange-500 mt-1">
                Disabled because specific products are selected.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
