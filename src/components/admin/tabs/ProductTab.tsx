"use client";
import { API_URL } from "@/lib/config";

import { useEffect, useState } from "react";
import SearchableSelect from "../SearchableSelect";

interface Category {
  id: string;
  name: string;
  slug: string;
  children?: Category[];
}
interface Brand {
  id: string;
  name: string;
  slug: string;
}
export interface ProductFormData {
  name: string;
  description: string;
  price: string;
  comparePrice: string;
  stock: string;
  image: string;
  images: string;
  unit: string;
  weight: string;
  featured: boolean;
  categoryId: string;
  brandId: string;
  tags: string[];
}

interface ProductTabProps {
  formData: ProductFormData;
  onChange: (data: ProductFormData) => void;
}

export default function ProductTab({ formData, onChange }: ProductTabProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/api/categories`)
      .then((r) => r.json())
      .then((j) => j.success && setCategories(j.data || []))
      .catch(console.error);
    fetch(`${API_URL}/api/brands?limit=50`)
      .then((r) => r.json())
      .then((j) => j.success && setBrands(j.data || []))
      .catch(console.error);
  }, []);

  const update = (field: keyof ProductFormData, value: any) => {
    onChange({ ...formData, [field]: value });
  };

  // Flatten categories for select
  const flatCats: { id: string; name: string; depth: number }[] = [];
  const flatten = (cats: Category[], depth = 0) => {
    cats.forEach((c) => {
      flatCats.push({ id: c.id, name: c.name, depth });
      if (c.children?.length) flatten(c.children, depth + 1);
    });
  };
  flatten(categories);

  const categoryOptions = flatCats.map((c) => ({
    value: c.id,
    label: `${"—".repeat(c.depth)} ${c.name}`,
  }));

  const brandOptions = brands.map((b) => ({
    value: b.id,
    label: b.name,
  }));

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-5">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Product Information
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Product Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => update("name", e.target.value)}
              required
              placeholder="e.g. Vitamin C Brightening Serum"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => update("description", e.target.value)}
              rows={4}
              placeholder="Write a detailed product description..."
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none text-gray-900 dark:text-white resize-none"
            />
          </div>
        </div>
      </div>

      {/* Pricing & Stock */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-5">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Pricing & Inventory
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Price (Tk ) *
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => update("price", e.target.value)}
              placeholder="0.00"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Compare Price
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.comparePrice}
              onChange={(e) => update("comparePrice", e.target.value)}
              placeholder="Optional"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Stock *
            </label>
            <input
              type="number"
              value={formData.stock}
              onChange={(e) => update("stock", e.target.value)}
              placeholder="0"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Unit
            </label>
            <select
              value={formData.unit}
              onChange={(e) => update("unit", e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none text-gray-900 dark:text-white"
            >
              <option value="piece">Piece</option>
              <option value="kg">Kilogram</option>
              <option value="g">Gram</option>
              <option value="l">Liter</option>
              <option value="ml">Milliliter</option>
              <option value="pack">Pack</option>
              <option value="box">Box</option>
            </select>
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Weight
          </label>
          <input
            type="text"
            value={formData.weight}
            onChange={(e) => update("weight", e.target.value)}
            placeholder="e.g. 250ml, 500g"
            className="max-w-xs px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {/* Organization */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-5">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Organization
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Category *
            </label>
            <SearchableSelect
              options={categoryOptions}
              value={formData.categoryId}
              onChange={(val) => update("categoryId", val)}
              placeholder="Select category..."
              className="text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Brand
            </label>
            <SearchableSelect
              options={brandOptions}
              value={formData.brandId}
              onChange={(val) => update("brandId", val)}
              placeholder="Select brand..."
              className="text-gray-900 dark:text-white"
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="flex items-center gap-2 cursor-pointer w-fit">
            <input
              type="checkbox"
              checked={formData.featured}
              onChange={(e) => update("featured", e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Featured Product
            </span>
          </label>
        </div>
      </div>

      {/* Images */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-5">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Images
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Main Image URL
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={formData.image}
                onChange={(e) => update("image", e.target.value)}
                placeholder="https://..."
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none text-gray-900 dark:text-white"
              />
              {formData.image && (
                <img
                  src={formData.image}
                  alt="Preview"
                  className="w-11 h-11 rounded-lg object-cover border"
                />
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Gallery Images{" "}
              <span className="text-gray-400 font-normal">
                (one URL per line)
              </span>
            </label>
            <textarea
              value={formData.images}
              onChange={(e) => update("images", e.target.value)}
              rows={3}
              placeholder="https://image1.jpg&#10;https://image2.jpg"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none text-gray-900 dark:text-white resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
