"use client";
import { API_URL } from "@/lib/config";
import { resolveImageUrl } from "@/lib/utils";

import MediaLibraryModal from "@/components/admin/MediaLibraryModal";
import {
  Camera,
  Check,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Layers,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
  AlertCircle,
  AlertTriangle,
  Save,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import { ProductFormValues } from "@/lib/validations/product";
import { showToast } from "@/lib/toast";

const VARIATIONS_API = `${API_URL}/api/variations`;

// ── Types ──────────────────────────────────────────────────────────────────

interface VariationValue {
  id: string;
  value: string;
  variationId: string;
}
interface Variation {
  id: string;
  name: string;
  values: VariationValue[];
}

export interface VariantRow {
  id?: string;
  attributes: { name: string; value: string }[];
  price: string;
  specialPrice: string;
  specialPriceStart: string;
  specialPriceEnd: string;
  enabled: boolean;
  isDefault: boolean;
  // kept for page.tsx submit compat
  sku: string;
  comparePrice: string;
  stock: string;
  weight?: string;
  image: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function cartesian<T>(arrays: T[][]): T[][] {
  if (arrays.length === 0) return [];
  return arrays.reduce<T[][]>(
    (acc, arr) => acc.flatMap((a) => arr.map((b) => [...a, b])),
    [[]],
  );
}

function makeRow(
  attrs: { name: string; value: string }[],
  isFirst: boolean,
): VariantRow {
  return {
    attributes: attrs,
    price: "",
    specialPrice: "",
    specialPriceStart: "",
    specialPriceEnd: "",
    enabled: true,
    isDefault: isFirst,
    sku: "",
    comparePrice: "",
    stock: "0",
    weight: "",
    image: "",
  };
}

function rowLabel(row: VariantRow) {
  return row.attributes.map((a) => a.value).join(" / ");
}

// ── Variation Selector (left-right layout with value search) ───────────────

interface VariationSelectorProps {
  catalog: Variation[];
  loading: boolean;
  usedIds: string[];
  variationId: string | null;
  selectedValues: string[];
  onVariationChange: (id: string) => void;
  onToggleValue: (val: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  onRemove: () => void;
}

function VariationSelector({
  catalog,
  loading,
  usedIds,
  variationId,
  selectedValues,
  onVariationChange,
  onToggleValue,
  onSelectAll,
  onClearAll,
  onRemove,
}: VariationSelectorProps) {
  const [typeOpen, setTypeOpen] = useState(false);
  const [valOpen, setValOpen] = useState(false);
  const [typeSearch, setTypeSearch] = useState("");
  const [valueSearch, setValueSearch] = useState("");

  const chosen = catalog.find((v) => v.id === variationId) ?? null;
  const filteredTypes = catalog.filter(
    (v) =>
      v.name.toLowerCase().includes(typeSearch.toLowerCase()) &&
      (!usedIds.includes(v.id) || v.id === variationId),
  );
  const filteredValues = chosen
    ? chosen.values.filter((v) =>
        v.value.toLowerCase().includes(valueSearch.toLowerCase()),
      )
    : [];

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setTypeOpen(false);
        setValOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 transition-all ${typeOpen || valOpen ? "relative z-50" : "relative z-10"}`}
    >
      <div className="flex items-center gap-3 px-3 py-2.5">
        {/* LEFT — variation type picker */}
        <div className="relative shrink-0" style={{ minWidth: 160 }}>
          <button
            type="button"
            onClick={() => {
              setTypeOpen((o) => !o);
              setValOpen(false);
            }}
            className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm hover:border-emerald-400 transition-colors"
          >
            <span
              className={
                chosen
                  ? "font-semibold text-gray-900 dark:text-white"
                  : "text-gray-400 text-sm"
              }
            >
              {chosen ? chosen.name : "Select type…"}
            </span>
            {loading ? (
              <Loader2
                size={13}
                className="animate-spin text-gray-400 shrink-0"
              />
            ) : (
              <ChevronDown size={13} className="text-gray-400 shrink-0" />
            )}
          </button>

          {typeOpen && (
            <div className="absolute left-0 top-full mt-1 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl z-30 overflow-hidden">
              <div className="p-2 border-b border-gray-100 dark:border-gray-700">
                <div className="relative">
                  <Search
                    size={12}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    autoFocus
                    type="text"
                    value={typeSearch}
                    onChange={(e) => setTypeSearch(e.target.value)}
                    placeholder="Search types…"
                    className="w-full pl-7 pr-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
              <div className="max-h-44 overflow-y-auto">
                {filteredTypes.length === 0 ? (
                  <p className="text-center text-xs text-gray-400 py-5">
                    No results
                  </p>
                ) : (
                  filteredTypes.map((v) => (
                    <button
                      type="button"
                      key={v.id}
                      onClick={() => {
                        onVariationChange(v.id);
                        setTypeOpen(false);
                        setTypeSearch("");
                      }}
                      className="w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                    >
                      <span>{v.name}</span>
                      {v.id === variationId && (
                        <Check size={13} className="text-emerald-500" />
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT — multi-select value field */}
        <div className="flex-1 relative">
          {/* Trigger box: shows selected tags + search input */}
          <div
            onClick={() => {
              if (chosen) {
                setValOpen((o) => !o);
                setTypeOpen(false);
              }
            }}
            className={`flex flex-wrap items-center gap-1.5 min-h-[38px] px-2.5 py-1.5 rounded-lg border cursor-pointer transition-colors ${
              chosen
                ? "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-emerald-400"
                : "border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 cursor-not-allowed"
            }`}
          >
            {/* Selected value tags */}
            {selectedValues.map((val) => (
              <span
                key={val}
                className="inline-flex items-center gap-1 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold px-2 py-0.5 rounded-md"
              >
                {val}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleValue(val);
                  }}
                  className="hover:text-emerald-900 dark:hover:text-emerald-100 ml-0.5"
                >
                  <X size={10} />
                </button>
              </span>
            ))}
            {/* Placeholder */}
            {selectedValues.length === 0 && (
              <span className="text-gray-400 text-sm">
                {chosen
                  ? `Select ${chosen.name} values…`
                  : "Select a type first"}
              </span>
            )}
            <ChevronDown size={13} className="text-gray-400 ml-auto shrink-0" />
          </div>

          {/* Dropdown */}
          {valOpen && chosen && (
            <div className="absolute left-0 top-full mt-1 w-full min-w-[220px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl z-30 overflow-hidden">
              {/* Search + select all */}
              <div className="p-2 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
                <div className="relative flex-1">
                  <Search
                    size={12}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    autoFocus
                    type="text"
                    value={valueSearch}
                    onChange={(e) => setValueSearch(e.target.value)}
                    placeholder={`Search ${chosen.name}…`}
                    className="w-full pl-7 pr-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={
                    selectedValues.length === chosen.values.length
                      ? onClearAll
                      : onSelectAll
                  }
                  className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium whitespace-nowrap"
                >
                  {selectedValues.length === chosen.values.length
                    ? "Clear"
                    : "All"}
                </button>
              </div>
              <div className="max-h-44 overflow-y-auto py-1">
                {filteredValues.length === 0 ? (
                  <p className="text-center text-xs text-gray-400 py-5">
                    {valueSearch
                      ? `No results for "${valueSearch}"`
                      : `No values yet`}
                  </p>
                ) : (
                  filteredValues.map((val) => {
                    const isOn = selectedValues.includes(val.value);
                    return (
                      <button
                        type="button"
                        key={val.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleValue(val.value);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-sm transition-colors ${
                          isOn
                            ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 font-medium"
                            : "hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
                        }`}
                      >
                        <span>{val.value}</span>
                        {isOn && (
                          <Check
                            size={14}
                            className="text-emerald-600 dark:text-emerald-400"
                          />
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Remove button */}
        <button
          type="button"
          onClick={onRemove}
          className="p-1.5 text-gray-400 hover:text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/20 rounded-md transition-colors shrink-0"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}

// ── Collapsible Variant Row ────────────────────────────────────────────────

interface VariantCardProps {
  v: VariantRow;
  idx: number;
  productId?: string;
  expanded: boolean;
  hasError?: boolean;
  onToggle: () => void;
  onRemove: (idx: number) => void;
}

function VariantCard({
  v,
  idx,
  productId,
  expanded,
  hasError,
  onToggle,
  onRemove,
}: VariantCardProps) {
  const [mediaOpen, setMediaOpen] = useState(false);
  const [savingVariant, setSavingVariant] = useState(false);
  const { register, watch, setValue, getValues } = useFormContext<ProductFormValues>();
  const watchedVariant = watch(`variants.${idx}`);

  const image = watchedVariant?.image ?? v.image ?? "";
  const enabled = watchedVariant?.enabled ?? v.enabled ?? true;
  const isDefault = watchedVariant?.isDefault ?? v.isDefault ?? false;
  const price = watchedVariant?.price ?? v.price ?? "";
  const attributes = watchedVariant?.attributes || v.attributes || [];
  const stockStr = watchedVariant?.stock ?? v.stock ?? "0";
  const stockNum = !isNaN(parseInt(stockStr)) ? parseInt(stockStr) : 0;
  const isNegativeStock = stockNum < 0;

  const handleToggleEnabled = () => {
    setValue(`variants.${idx}.enabled`, !enabled, { shouldDirty: true });
  };

  const handleSetDefault = () => {
    const all = getValues("variants") || [];
    all.forEach((_, i) => {
      setValue(`variants.${i}.isDefault`, i === idx, { shouldDirty: true });
    });
  };

  const handleSetImage = (url: string) => {
    setValue(`variants.${idx}.image`, url, { shouldDirty: true });
  };

  const handleSaveSingleVariant = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!productId) {
      showToast.info(
        "Please save the main product first before saving individual variations."
      );
      return;
    }

    setSavingVariant(true);
    try {
      const currentValues = getValues(`variants.${idx}`);
      const parentPrice = parseFloat(getValues("price") || "0") || 0;
      const effectivePrice =
        currentValues.price &&
        !isNaN(parseFloat(currentValues.price)) &&
        currentValues.price.trim() !== ""
          ? parseFloat(currentValues.price)
          : parentPrice;

      const targetVariantId = v.id || currentValues.id || "new";

      const payload = {
        sku: currentValues.sku || null,
        price: effectivePrice,
        specialPrice:
          currentValues.specialPrice &&
          !isNaN(parseFloat(currentValues.specialPrice))
            ? parseFloat(currentValues.specialPrice)
            : null,
        specialPriceStart: currentValues.specialPriceStart || null,
        specialPriceEnd: currentValues.specialPriceEnd || null,
        stock: !isNaN(parseInt(currentValues.stock))
          ? parseInt(currentValues.stock)
          : 0,
        weight: currentValues.weight || null,
        image: currentValues.image || null,
        isDefault: currentValues.isDefault ?? false,
        enabled: currentValues.enabled ?? true,
        attributes: currentValues.attributes || v.attributes || [],
      };

      const token =
        localStorage.getItem("femcart_access_token") ||
        localStorage.getItem("token") ||
        "";
      const res = await fetch(
        `${API_URL}/api/products/${productId}/variants/${targetVariantId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();
      if (data.success) {
        if (data.data?.id) {
          setValue(`variants.${idx}.id`, data.data.id);
          v.id = data.data.id;
        }
        showToast.success(
          `Variation ${currentValues.sku || `#${idx + 1}`} saved successfully!`
        );
      } else {
        showToast.error(data.message || "Failed to save variation");
      }
    } catch (err: any) {
      showToast.error(err.message || "Failed to save variation");
    } finally {
      setSavingVariant(false);
    }
  };

  return (
    <div
      className={`border rounded-xl overflow-hidden transition-all ${
        expanded
          ? "border-emerald-400 dark:border-emerald-500 shadow-md ring-1 ring-emerald-400 dark:ring-emerald-500 bg-white dark:bg-gray-800 z-10 relative"
          : hasError
            ? "border-pink-400 dark:border-pink-500 shadow-sm bg-pink-50/20 dark:bg-pink-900/10"
            : enabled
              ? "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
              : "border-gray-100 dark:border-gray-700/50 bg-gray-50 dark:bg-gray-800/50 opacity-60"
      }`}
    >
      {/* Header — fully clickable to expand/collapse */}
      <div
        onClick={onToggle}
        className={`flex items-center gap-3 px-4 py-3 cursor-pointer select-none transition-colors ${
          expanded
            ? "bg-emerald-50/80 dark:bg-emerald-900/20 border-b border-emerald-100 dark:border-emerald-800/50"
            : "hover:bg-gray-50 dark:hover:bg-gray-700/30"
        }`}
      >
        {/* Thumbnail */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            setMediaOpen(true);
          }}
          className="w-11 h-11 shrink-0 rounded-lg overflow-hidden border-2 border-dashed border-gray-200 dark:border-gray-600 hover:border-emerald-400 transition-colors flex items-center justify-center bg-gray-50 dark:bg-gray-900/50 cursor-pointer"
          title="Pick image from media library"
        >
          {image ? (
            <img
              src={resolveImageUrl(image)}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <Camera size={16} className="text-gray-300 dark:text-gray-600" />
          )}
        </div>

        {/* Attribute inline row */}
        <div className="flex-1 flex items-center gap-2 flex-wrap min-w-0">
          {isDefault && (
            <span className="shrink-0 text-[10px] bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded-full font-bold leading-none">
              Default
            </span>
          )}
          <span className="text-sm text-gray-700 dark:text-gray-200 truncate">
            {attributes.map((a: any, i: number) => (
              <span key={a.name}>
                {i > 0 && (
                  <span className="text-gray-300 dark:text-gray-600 mx-1">
                    ·
                  </span>
                )}
                <span className="text-gray-400 dark:text-gray-500 font-normal">
                  {a.name}:{" "}
                </span>
                <span className="font-semibold">{a.value}</span>
              </span>
            ))}
          </span>
        </div>

        {/* Stock status badge */}
        {isNegativeStock ? (
          <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 rounded-md flex items-center gap-1 border border-amber-200 dark:border-amber-800">
            <AlertTriangle size={11} /> Deficit ({stockNum})
          </span>
        ) : stockNum === 0 ? (
          <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-750 px-2 py-0.5 rounded-md">
            Out of stock (0)
          </span>
        ) : (
          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-md">
            {stockNum} in stock
          </span>
        )}

        {/* Quick price badge */}
        {price && (
          <span className="text-sm font-bold text-gray-700 dark:text-gray-200 shrink-0">
            ৳{price}
          </span>
        )}

        {/* Quick Save single variant icon if in edit mode */}
        {productId && (
          <button
            type="button"
            onClick={handleSaveSingleVariant}
            disabled={savingVariant}
            title="Quick save this variation"
            className="p-1.5 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-md transition-colors cursor-pointer"
          >
            {savingVariant ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Save size={14} />
            )}
          </button>
        )}

        {/* Chevron */}
        <span className="text-gray-400 shrink-0">
          {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </span>

        {/* Remove — stop propagation so it doesn't toggle expand */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(idx);
          }}
          className="p-1.5 text-gray-400 hover:text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/20 rounded-md transition-colors"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Expanded body */}
      {expanded && (
        <div className="border-t border-gray-100 dark:border-gray-700 px-4 py-4 space-y-4 bg-gray-50 dark:bg-gray-900/30">
          {/* Image picker — clickable area */}
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Variation Image
            </label>
            <div
              onClick={() => setMediaOpen(true)}
              className="flex items-center gap-4 p-3 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-600 hover:border-emerald-400 dark:hover:border-emerald-500 cursor-pointer transition-colors group bg-white dark:bg-gray-800"
            >
              <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                {image ? (
                  <img
                    src={resolveImageUrl(image)}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon
                    size={20}
                    className="text-gray-300 dark:text-gray-600"
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {image ? "Change image" : "Upload image"}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Click to open Media Library
                </p>
              </div>
              {image && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSetImage("");
                  }}
                  className="p-1.5 text-gray-400 hover:text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/20 rounded-md transition-colors shrink-0"
                  title="Remove image"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>

          {/* Enable / Disable toggle */}
          <div
            className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${
              enabled
                ? "border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/40 dark:bg-emerald-900/10"
                : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
            }`}
          >
            <div>
              <p
                className={`text-sm font-bold ${enabled ? "text-emerald-700 dark:text-emerald-400" : "text-gray-700 dark:text-gray-300"}`}
              >
                {enabled ? "Variation Enabled" : "Variation Disabled"}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {enabled
                  ? "This variation will be visible to customers."
                  : "This variation is hidden from the store."}
              </p>
            </div>
            <button
              type="button"
              onClick={handleToggleEnabled}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 shrink-0 ${
                enabled ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-600"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${enabled ? "translate-x-6" : "translate-x-1"}`}
              />
            </button>
          </div>

          {/* Prices */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                Regular Price <span className="text-gray-400 font-normal">(Optional — defaults to base price)</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                  ৳
                </span>
                <input
                  type="text"
                  {...register(`variants.${idx}.price`)}
                  placeholder="Leave empty to use base price"
                  className="w-full pl-7 pr-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                Special Price
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                  ৳
                </span>
                <input
                  type="text"
                  {...register(`variants.${idx}.specialPrice`)}
                  placeholder="—"
                  className="w-full pl-7 pr-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Special price dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                Start Date
              </label>
              <input
                type="date"
                {...register(`variants.${idx}.specialPriceStart`)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                End Date
              </label>
              <input
                type="date"
                {...register(`variants.${idx}.specialPriceEnd`)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* SKU + Stock + Weight + Set default */}
          <div className="flex flex-wrap items-start gap-3">
            <div className="flex-1 min-w-[120px]">
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                SKU
              </label>
              <input
                type="text"
                {...register(`variants.${idx}.sku`)}
                placeholder="e.g. TS-RED-M"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="flex-1 min-w-[140px]">
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Stock Quantity</span>
                {isNegativeStock && (
                  <span className="text-amber-500 text-[10px] font-bold flex items-center gap-0.5">
                    <AlertTriangle size={10} /> Backorder
                  </span>
                )}
              </label>
              <input
                type="number"
                {...register(`variants.${idx}.stock`)}
                placeholder="0"
                className={`w-full px-3 py-2 rounded-lg border ${
                  isNegativeStock
                    ? "border-amber-300 dark:border-amber-700 bg-amber-50/40 dark:bg-amber-950/20 text-amber-900 dark:text-amber-200"
                    : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                } text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold`}
              />
              {isNegativeStock && (
                <p className="mt-1 text-[11px] text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
                  <AlertTriangle size={12} className="shrink-0" /> Negative balance ({stockNum}) indicates deficit / backorders.
                </p>
              )}
            </div>
            <div className="flex-1 min-w-[120px]">
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                Weight (Optional)
              </label>
              <input
                type="text"
                {...register(`variants.${idx}.weight`)}
                placeholder="e.g. 250g, 1kg"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="flex items-center gap-2 mt-6 shrink-0 flex-wrap">
              {!isDefault && (
                <button
                  type="button"
                  onClick={handleSetDefault}
                  className="px-3 py-2 rounded-lg border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 text-xs font-semibold hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                >
                  Set as Default
                </button>
              )}
              {productId && (
                <button
                  type="button"
                  onClick={handleSaveSingleVariant}
                  disabled={savingVariant}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm hover:shadow-emerald-600/20 disabled:opacity-50 cursor-pointer"
                >
                  {savingVariant ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <Save size={13} />
                  )}
                  {savingVariant ? "Saving..." : "Save Variant"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Media Library Modal per variant */}
      <MediaLibraryModal
        isOpen={mediaOpen}
        onClose={() => setMediaOpen(false)}
        preferredSize="medium"
        title="Pick Variation Image"
        onSelect={(_media, sizeUrl) => {
          handleSetImage(sizeUrl);
          setMediaOpen(false);
        }}
      />
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

interface SelectorEntry {
  variationId: string | null;
  selectedValues: string[];
}

export default function VariationTab({
  productId,
}: {
  productId?: string;
} = {}) {
  const {
    control,
    getValues,
    setValue,
    formState: { errors },
  } = useFormContext<ProductFormValues>();
  const {
    fields,
    append,
    remove: removeField,
  } = useFieldArray({
    control,
    name: "variants",
  });

  const variants = fields as unknown as VariantRow[];

  const [catalog, setCatalog] = useState<Variation[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const [selectors, setSelectors] = useState<SelectorEntry[]>([
    { variationId: null, selectedValues: [] },
  ]);

  const fetchCatalog = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(VARIATIONS_API);
      const json = await res.json();
      if (json.success) setCatalog(json.data || []);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

  // Pre-populate variation selectors from existing variants if editing
  useEffect(() => {
    if (catalog.length === 0) return;
    const currentVariants = getValues("variants") || [];
    if (currentVariants.length === 0) return;

    const attrMap = new Map<string, Set<string>>();
    currentVariants.forEach((v) => {
      v.attributes?.forEach((a) => {
        if (!attrMap.has(a.name)) attrMap.set(a.name, new Set());
        if (a.value) attrMap.get(a.name)!.add(a.value);
      });
    });

    if (attrMap.size > 0) {
      const initialSelectors: SelectorEntry[] = [];
      attrMap.forEach((values, name) => {
        const catVar = catalog.find(
          (c) => c.name.toLowerCase() === name.toLowerCase(),
        );
        if (catVar) {
          initialSelectors.push({
            variationId: catVar.id,
            selectedValues: Array.from(values),
          });
        }
      });
      if (initialSelectors.length > 0) {
        setSelectors(initialSelectors);
      }
    }
  }, [catalog, getValues]);

  // ── Selector list management ────────────────────────────────────────────

  const usedVariationIds = selectors
    .map((s) => s.variationId)
    .filter(Boolean) as string[];

  const addSelector = () =>
    setSelectors((prev) => [
      ...prev,
      { variationId: null, selectedValues: [] },
    ]);
  const removeSelector = (idx: number) =>
    setSelectors((prev) => prev.filter((_, i) => i !== idx));
  const setVariation = (idx: number, variationId: string) =>
    setSelectors((prev) =>
      prev.map((s, i) => (i === idx ? { variationId, selectedValues: [] } : s)),
    );
  const toggleValue = (idx: number, val: string) =>
    setSelectors((prev) =>
      prev.map((s, i) => {
        if (i !== idx) return s;
        const has = s.selectedValues.includes(val);
        return {
          ...s,
          selectedValues: has
            ? s.selectedValues.filter((v) => v !== val)
            : [...s.selectedValues, val],
        };
      }),
    );
  const selectAll = (idx: number) => {
    const variation = catalog.find((v) => v.id === selectors[idx].variationId);
    if (!variation) return;
    setSelectors((prev) =>
      prev.map((s, i) =>
        i === idx
          ? { ...s, selectedValues: variation.values.map((v) => v.value) }
          : s,
      ),
    );
  };
  const clearAll = (idx: number) =>
    setSelectors((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, selectedValues: [] } : s)),
    );

  // ── Generate ────────────────────────────────────────────────────────────

  const canGenerate = selectors.some(
    (s) => s.variationId && s.selectedValues.length > 0,
  );

  const handleGenerate = () => {
    const axes = selectors
      .filter((s) => s.variationId && s.selectedValues.length > 0)
      .map((s) => {
        const variation = catalog.find((v) => v.id === s.variationId)!;
        return s.selectedValues.map((val) => ({
          name: variation.name,
          value: val,
        }));
      });
    if (axes.length === 0) return;
    const combinations = cartesian(axes);
    const currentVariants = (getValues("variants") as VariantRow[]) || [];
    const existingLabels = new Set(currentVariants.map(rowLabel));
    const newRows: VariantRow[] = [];
    combinations.forEach((combo) => {
      const label = combo.map((c) => c.value).join(" / ");
      if (!existingLabels.has(label)) {
        newRows.push(
          makeRow(combo, currentVariants.length === 0 && newRows.length === 0),
        );
        existingLabels.add(label);
      }
    });
    if (newRows.length > 0) {
      append(newRows as any);
    }
  };

  // ── Variant row actions ─────────────────────────────────────────────────

  const remove = (idx: number) => {
    removeField(idx);
    const current = (getValues("variants") as VariantRow[]) || [];
    const remaining = current.filter((_, i) => i !== idx);
    if (remaining.length > 0 && !remaining.some((v) => v.isDefault)) {
      setValue("variants.0.isDefault", true, { shouldDirty: true });
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 md:p-8 shadow-sm">
        <div className="border-b border-gray-100 dark:border-gray-750 pb-4 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Product Variations
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Select variation types and values, then generate the combination
            rows.
          </p>
        </div>

        <div className="space-y-8">
          {/* ── Step 1: Select variations & values ── */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
            <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 rounded-t-lg">
              <p className="text-sm font-bold text-gray-700 dark:text-gray-200">
                Step 1 — Select variation types &amp; values
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                Variation type on the left · Select values on the right
              </p>
            </div>

            <div className="p-5 space-y-3">
              {selectors.map((sel, idx) => (
                <div
                  key={idx}
                  style={{ zIndex: 50 - idx }}
                  className="relative"
                >
                  <VariationSelector
                    catalog={catalog}
                    loading={loading}
                    usedIds={usedVariationIds}
                    variationId={sel.variationId}
                    selectedValues={sel.selectedValues}
                    onVariationChange={(id) => setVariation(idx, id)}
                    onToggleValue={(val) => toggleValue(idx, val)}
                    onSelectAll={() => selectAll(idx)}
                    onClearAll={() => clearAll(idx)}
                    onRemove={() => removeSelector(idx)}
                  />
                </div>
              ))}

              <button
                type="button"
                onClick={addSelector}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-500 hover:border-emerald-400 hover:text-emerald-600 transition-colors"
              >
                <Plus size={15} /> Add another variation type
              </button>
            </div>

            <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 flex items-center justify-between rounded-b-lg">
              <p className="text-xs text-gray-500">
                {canGenerate
                  ? "Ready to generate combinations"
                  : "Select at least one value to enable generation"}
              </p>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={!canGenerate}
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white px-5 py-2 rounded-xl text-sm font-bold transition-colors shadow-sm"
              >
                <RefreshCw size={15} /> Generate Variations
              </button>
            </div>
          </div>

          {/* ── Step 2: Variation rows (collapsible) ── */}
          {variants.length > 0 && (
            <div
              className={`border ${errors.variants ? "border-pink-500" : "border-gray-200 dark:border-gray-700"} rounded-lg overflow-hidden bg-white dark:bg-gray-800`}
            >
              <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-200">
                    Step 2 — Configure each variation
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Click a row to expand and set price, image, SKU, and dates
                  </p>
                </div>
                <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-2.5 py-1 rounded-full font-semibold">
                  {variants.filter((v) => v.enabled).length}/{variants.length}{" "}
                  enabled
                </span>
              </div>
              {errors.variants && (
                <div className="px-5 py-2 bg-pink-50 dark:bg-pink-900/20 border-b border-pink-100 dark:border-pink-800/50">
                  <p className="text-pink-500 text-xs font-medium flex items-center gap-1">
                    <AlertCircle size={14} /> Please check the highlighted
                    variations for errors. Price is required.
                  </p>
                </div>
              )}

              <div className="p-4 space-y-2">
                {variants.map((v, idx) => {
                  const hasError = !!errors.variants?.[idx];
                  return (
                    <div key={v.id || idx}>
                      <VariantCard
                        v={v}
                        idx={idx}
                        productId={productId}
                        expanded={expandedIndex === idx || hasError}
                        hasError={hasError}
                        onToggle={() =>
                          setExpandedIndex(expandedIndex === idx ? null : idx)
                        }
                        onRemove={remove}
                      />
                      {hasError && errors.variants?.[idx]?.price && (
                        <p className="text-pink-500 text-xs mt-1.5 ml-2 font-medium flex items-center gap-1">
                          <AlertCircle size={12} />{" "}
                          {errors.variants[idx]?.price?.message}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {variants.length === 0 && (
            <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-12 flex flex-col items-center text-center text-gray-400">
              <Layers size={36} className="mb-3 opacity-30" />
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                No variations generated yet
              </p>
              <p className="text-xs mt-1">
                Select values above and click "Generate Variations"
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
