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
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import { ProductFormValues } from "@/lib/validations/product";

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
  expanded: boolean;
  hasError?: boolean;
  onToggle: () => void;
  onUpdate: (idx: number, field: keyof VariantRow, value: any) => void;
  onRemove: (idx: number) => void;
}

function VariantCard({
  v,
  idx,
  expanded,
  hasError,
  onToggle,
  onUpdate,
  onRemove,
}: VariantCardProps) {
  const [mediaOpen, setMediaOpen] = useState(false);
  const { register } = useFormContext<ProductFormValues>();

  return (
    <div
      className={`border rounded-xl overflow-hidden transition-all ${
        expanded
          ? "border-emerald-400 dark:border-emerald-500 shadow-md ring-1 ring-emerald-400 dark:ring-emerald-500 bg-white dark:bg-gray-800 z-10 relative"
          : hasError
            ? "border-pink-400 dark:border-pink-500 shadow-sm bg-pink-50/20 dark:bg-pink-900/10"
            : v.enabled
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
          {v.image ? (
            <img
              src={resolveImageUrl(v.image)}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <Camera size={16} className="text-gray-300 dark:text-gray-600" />
          )}
        </div>

        {/* Attribute inline row */}
        <div className="flex-1 flex items-center gap-2 flex-wrap min-w-0">
          {v.isDefault && (
            <span className="shrink-0 text-[10px] bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded-full font-bold leading-none">
              Default
            </span>
          )}
          <span className="text-sm text-gray-700 dark:text-gray-200 truncate">
            {v.attributes.map((a, i) => (
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

        {/* Quick price badge */}
        {v.price && (
          <span className="text-sm font-bold text-gray-700 dark:text-gray-200 shrink-0">
            ${v.price}
          </span>
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
                {v.image ? (
                  <img
                    src={resolveImageUrl(v.image)}
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
                  {v.image ? "Change image" : "Upload image"}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Click to open Media Library
                </p>
              </div>
              {v.image && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdate(idx, "image", "");
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
              v.enabled
                ? "border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/40 dark:bg-emerald-900/10"
                : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
            }`}
          >
            <div>
              <p
                className={`text-sm font-bold ${v.enabled ? "text-emerald-700 dark:text-emerald-400" : "text-gray-700 dark:text-gray-300"}`}
              >
                {v.enabled ? "Variation Enabled" : "Variation Disabled"}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {v.enabled
                  ? "This variation will be visible to customers."
                  : "This variation is hidden from the store."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onUpdate(idx, "enabled", !v.enabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 shrink-0 ${
                v.enabled ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-600"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${v.enabled ? "translate-x-6" : "translate-x-1"}`}
              />
            </button>
          </div>

          {/* Prices */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                Regular Price <span className="text-pink-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                  $
                </span>
                <input
                  type="text"
                  {...register(`variants.${idx}.price`)}
                  placeholder="0.00"
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
                  $
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

          {/* SKU + Set default */}
          <div className="flex items-center gap-3">
            <div className="flex-1">
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
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                Stock
              </label>
              <input
                type="number"
                {...register(`variants.${idx}.stock`)}
                placeholder="0"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            {!v.isDefault && (
              <button
                type="button"
                onClick={() => onUpdate(idx, "isDefault", true)}
                className="mt-5 px-3 py-2 rounded-lg border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 text-xs font-semibold hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
              >
                Set as Default
              </button>
            )}
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
          onUpdate(idx, "image", sizeUrl);
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

export default function VariationTab() {
  const {
    control,
    formState: { errors },
  } = useFormContext<ProductFormValues>();
  const {
    fields,
    append,
    remove: removeField,
    update: updateField,
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
    const existingLabels = new Set(variants.map(rowLabel));
    const newRows: VariantRow[] = [];
    combinations.forEach((combo) => {
      const label = combo.map((c) => c.value).join(" / ");
      if (!existingLabels.has(label)) {
        newRows.push(
          makeRow(combo, variants.length === 0 && newRows.length === 0),
        );
        existingLabels.add(label);
      }
    });
    if (newRows.length > 0) {
      append(newRows as any);
    }
  };

  // ── Variant row actions ─────────────────────────────────────────────────

  const update = (idx: number, field: keyof VariantRow, value: any) => {
    const target = { ...variants[idx] };
    if (field === "isDefault") {
      variants.forEach((v, i) => {
        if (i === idx) {
          updateField(i, { ...v, isDefault: true } as any);
        } else if (v.isDefault) {
          updateField(i, { ...v, isDefault: false } as any);
        }
      });
    } else {
      (target as any)[field] = value;
      updateField(idx, target as any);
    }
  };

  const remove = (idx: number) => {
    removeField(idx);
    const next = variants.filter((_, i) => i !== idx);
    if (next.length > 0 && !next.some((v) => v.isDefault)) {
      updateField(0, { ...next[0], isDefault: true } as any);
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
                        expanded={expandedIndex === idx || hasError}
                        hasError={hasError}
                        onToggle={() =>
                          setExpandedIndex(expandedIndex === idx ? null : idx)
                        }
                        onUpdate={update}
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
