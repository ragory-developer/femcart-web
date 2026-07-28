import { useFormContext } from "react-hook-form";
import { ProductFormValues } from "@/lib/validations/product";
import { AlertCircle } from "lucide-react";

export default function InventoryLogisticsTab() {
  const {
    register,
    formState: { errors },
  } = useFormContext<ProductFormValues>();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 md:p-8 shadow-sm">
        <div className="border-b border-gray-100 dark:border-gray-750 pb-4 mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Inventory & Stock
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Manage stock levels and track inventory using SKU.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              SKU (Stock Keeping Unit)
            </label>
            <input
              type="text"
              {...register("sku")}
              placeholder="e.g. PRD-12345"
              className={`w-full px-4 py-2.5 rounded-lg border ${errors.sku ? "border-pink-500" : "border-gray-200 dark:border-gray-700"} bg-gray-50 dark:bg-gray-900/50 text-sm focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900 dark:text-white transition-colors`}
            />
            {errors.sku && (
              <p className="absolute top-full left-0 mt-1 text-pink-500 text-[11px] font-medium flex items-center gap-1">
                <AlertCircle size={14} /> {errors.sku.message}
              </p>
            )}
          </div>

          <div className="relative">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Stock Quantity
            </label>
            <input
              type="text"
              {...register("stock")}
              placeholder="0"
              className={`w-full px-4 py-2.5 rounded-lg border ${errors.stock ? "border-pink-500" : "border-gray-200 dark:border-gray-700"} bg-gray-50 dark:bg-gray-900/50 text-sm focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900 dark:text-white transition-colors`}
            />
            {errors.stock && (
              <p className="absolute top-full left-0 mt-1 text-pink-500 text-[11px] font-medium flex items-center gap-1">
                <AlertCircle size={14} /> {errors.stock.message}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 md:p-8 shadow-sm">
        <div className="border-b border-gray-100 dark:border-gray-750 pb-4 mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Logistics & Shipping
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Configure unit types, weight, and origin for delivery logistics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Unit
            </label>
            <select
              {...register("unit")}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-sm focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900 dark:text-white transition-colors"
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

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Weight
            </label>
            <input
              type="text"
              {...register("weight")}
              placeholder="250g, 1kg..."
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-sm focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900 dark:text-white transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Country of Origin
            </label>
            <input
              type="text"
              {...register("countryOfOrigin")}
              placeholder="e.g. Bangladesh, UAE, USA..."
              className={`w-full px-4 py-2.5 rounded-lg border ${errors.countryOfOrigin ? "border-pink-500" : "border-gray-200 dark:border-gray-700"} bg-gray-50 dark:bg-gray-900/50 text-sm focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900 dark:text-white transition-colors`}
            />
            {errors.countryOfOrigin && (
              <p className="absolute top-full left-0 mt-1 text-pink-500 text-[11px] font-medium flex items-center gap-1">
                <AlertCircle size={14} /> {errors.countryOfOrigin.message}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
