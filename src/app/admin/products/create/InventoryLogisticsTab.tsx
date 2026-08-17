import { useFormContext } from "react-hook-form";
import { ProductFormValues } from "@/lib/validations/product";
import { AlertCircle, AlertTriangle, Boxes, CheckCircle2, Layers, Package, Sparkles } from "lucide-react";

export default function InventoryLogisticsTab() {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext<ProductFormValues>();

  const variants = watch("variants") || [];
  const hasVariants = variants.length > 0;
  const totalVariantStock = hasVariants
    ? variants.reduce(
        (sum, v) => sum + (v.enabled !== false ? parseInt(v.stock) || 0 : 0),
        0,
      )
    : 0;
  const enabledVariants = variants.filter((v) => v.enabled !== false);
  const simpleStockRaw = watch("stock") || "0";
  const simpleStock = !isNaN(parseInt(simpleStockRaw)) ? parseInt(simpleStockRaw) : 0;
  const isSimpleNegative = simpleStock < 0;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* ── Inventory & Stock Card ── */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 md:p-8 shadow-sm">
        <div className="border-b border-gray-100 dark:border-gray-750 pb-4 mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Boxes className="w-5 h-5 text-emerald-500" />
              Inventory & Stock
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {hasVariants
                ? "This product has multiple variations. Stock is managed dynamically per variation."
                : "Manage stock levels and track inventory using SKU for this single product."}
            </p>
          </div>

          {hasVariants && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              <Sparkles size={13} /> Variable Product ({variants.length} Variants)
            </span>
          )}
        </div>

        {/* ── Dynamic Stock Section ── */}
        {hasVariants ? (
          <div className="space-y-6">
            {/* Live Stock Summary Card */}
            <div className="p-5 rounded-2xl border border-emerald-100 dark:border-emerald-900/40 bg-gradient-to-br from-emerald-50/60 via-white to-teal-50/40 dark:from-emerald-950/20 dark:via-gray-800 dark:to-teal-950/20 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-emerald-100 dark:border-emerald-800/40">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <Package size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                      Total Dynamic Stock
                    </p>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-3xl font-black ${totalVariantStock < 0 ? "text-amber-600 dark:text-amber-400" : "text-gray-900 dark:text-white"}`}>
                        {totalVariantStock}
                      </span>
                      <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                        {totalVariantStock < 0 ? "Units (Deficit/Backorder)" : "Units Available"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${
                      totalVariantStock > 10
                        ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300"
                        : totalVariantStock > 0
                          ? "bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300"
                          : totalVariantStock === 0
                            ? "bg-rose-100 dark:bg-rose-900/40 text-rose-800 dark:text-rose-300"
                            : "bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-700"
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        totalVariantStock > 10
                          ? "bg-emerald-500 animate-pulse"
                          : totalVariantStock > 0
                            ? "bg-amber-500 animate-pulse"
                            : totalVariantStock === 0
                              ? "bg-rose-500"
                              : "bg-amber-500"
                      }`}
                    />
                    {totalVariantStock > 10
                      ? "In Stock"
                      : totalVariantStock > 0
                        ? "Low Stock"
                        : totalVariantStock === 0
                          ? "Out of Stock"
                          : `Deficit (${totalVariantStock})`}
                  </span>
                  <span className="text-xs text-gray-400 font-medium">
                    ({enabledVariants.length} Active / {variants.length} Total)
                  </span>
                </div>
              </div>

              {/* Dynamic Variation Breakdown Preview */}
              <div className="pt-4">
                <p className="text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Layers size={14} className="text-emerald-500" />
                  Live Breakdown by Variation:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {variants.map((v, idx) => {
                    const label =
                      v.attributes?.map((a: any) => `${a.name}: ${a.value}`).join(" · ") ||
                      `Variant #${idx + 1}`;
                    const vStock = parseInt(v.stock) || 0;
                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl border transition-all text-xs ${
                          v.enabled === false
                            ? "border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/40 opacity-50"
                            : vStock > 0
                              ? "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-2xs"
                              : vStock < 0
                                ? "border-amber-200 dark:border-amber-800/50 bg-amber-50/40 dark:bg-amber-950/20"
                                : "border-rose-200 dark:border-rose-900/40 bg-rose-50/30 dark:bg-rose-950/20"
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold text-gray-800 dark:text-gray-200 mb-1">
                          <span className="truncate max-w-[140px]" title={label}>
                            {label}
                          </span>
                          <span
                            className={`font-extrabold ${
                              vStock > 0
                                ? "text-emerald-600 dark:text-emerald-400"
                                : vStock < 0
                                  ? "text-amber-600 dark:text-amber-400 flex items-center gap-0.5"
                                  : "text-rose-500"
                            }`}
                          >
                            {vStock < 0 && <AlertTriangle size={11} />}
                            {vStock} units
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-gray-400">
                          <span>SKU: {v.sku || "Auto"}</span>
                          {v.weight && <span>{v.weight}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 bg-white/70 dark:bg-gray-800/70 p-2.5 rounded-lg border border-gray-100 dark:border-gray-700">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-emerald-500" />
                    Individual stocks and prices are editable directly in the Variations tab.
                  </span>
                </div>
              </div>
            </div>

            {/* Base SKU */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Base / Parent SKU (Product Code)
                </label>
                <input
                  type="text"
                  {...register("sku")}
                  placeholder="e.g. PRD-12345"
                  className={`w-full px-4 py-2.5 rounded-lg border ${
                    errors.sku
                      ? "border-pink-500"
                      : "border-gray-200 dark:border-gray-700"
                  } bg-gray-50 dark:bg-gray-900/50 text-sm focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900 dark:text-white transition-colors`}
                />
                <p className="mt-1 text-xs text-gray-400">
                  Main barcode or product line code. Variations inherit this prefix or set their own unique SKU.
                </p>
                {errors.sku && (
                  <p className="absolute top-full left-0 mt-1 text-pink-500 text-[11px] font-medium flex items-center gap-1">
                    <AlertCircle size={14} /> {errors.sku.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Simple Product Stock Section */
          <div className="space-y-6">
            <div className={`p-4 rounded-xl border ${
              isSimpleNegative
                ? "border-amber-200 dark:border-amber-800/50 bg-amber-50/40 dark:bg-amber-950/20"
                : "border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/40"
            } flex flex-wrap items-center justify-between gap-3`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${
                  isSimpleNegative
                    ? "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400"
                    : "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                } flex items-center justify-center font-bold`}>
                  <Package size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Current Inventory Balance
                  </p>
                  <p className={`text-lg font-black ${isSimpleNegative ? "text-amber-700 dark:text-amber-300" : "text-gray-900 dark:text-white"}`}>
                    {simpleStock} Units {isSimpleNegative ? "(Backorder Deficit)" : "On-Hand"}
                  </p>
                </div>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Direct stock balance for this single product item.
              </span>
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
                  className={`w-full px-4 py-2.5 rounded-lg border ${
                    errors.sku
                      ? "border-pink-500"
                      : "border-gray-200 dark:border-gray-700"
                  } bg-gray-50 dark:bg-gray-900/50 text-sm focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900 dark:text-white transition-colors`}
                />
                <p className="mt-1 text-xs text-gray-400">
                  Unique identifier for warehouse inventory and barcodes.
                </p>
                {errors.sku && (
                  <p className="absolute top-full left-0 mt-1 text-pink-500 text-[11px] font-medium flex items-center gap-1">
                    <AlertCircle size={14} /> {errors.sku.message}
                  </p>
                )}
              </div>

              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center justify-between">
                  <span>Stock Quantity</span>
                  {isSimpleNegative && (
                    <span className="text-amber-600 dark:text-amber-400 text-xs font-bold flex items-center gap-1">
                      <AlertTriangle size={12} /> Negative Stock
                    </span>
                  )}
                </label>
                <input
                  type="number"
                  {...register("stock")}
                  placeholder="0"
                  className={`w-full px-4 py-2.5 rounded-lg border ${
                    isSimpleNegative
                      ? "border-amber-300 dark:border-amber-700 bg-amber-50/30 dark:bg-amber-950/20 text-amber-900 dark:text-amber-200"
                      : errors.stock
                        ? "border-pink-500"
                        : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white"
                  } text-sm focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors font-semibold`}
                />
                {isSimpleNegative ? (
                  <p className="mt-1 text-[11px] text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                    <AlertTriangle size={12} className="shrink-0" /> Negative balance ({simpleStock} units) indicates backorders / oversold deficit.
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-gray-400">
                    Available stock for customers to purchase.
                  </p>
                )}
                {errors.stock && (
                  <p className="absolute top-full left-0 mt-1 text-pink-500 text-[11px] font-medium flex items-center gap-1">
                    <AlertCircle size={14} /> {errors.stock.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Logistics & Shipping Card ── */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 md:p-8 shadow-sm">
        <div className="border-b border-gray-100 dark:border-gray-750 pb-4 mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Logistics & Shipping
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Configure unit types, weight, and origin for delivery logistics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              {hasVariants ? "Base / Fallback Weight" : "Weight"}
            </label>
            <input
              type="text"
              {...register("weight")}
              placeholder="e.g. 250g, 1kg..."
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-sm focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900 dark:text-white transition-colors"
            />
            {hasVariants && (
              <p className="mt-1 text-[11px] text-gray-400">
                Individual variations can set their own weights in the Variations tab.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Country of Origin
            </label>
            <input
              type="text"
              {...register("countryOfOrigin")}
              placeholder="e.g. Bangladesh, UAE, USA..."
              className={`w-full px-4 py-2.5 rounded-lg border ${
                errors.countryOfOrigin
                  ? "border-pink-500"
                  : "border-gray-200 dark:border-gray-700"
              } bg-gray-50 dark:bg-gray-900/50 text-sm focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900 dark:text-white transition-colors`}
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
