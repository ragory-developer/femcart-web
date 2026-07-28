import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useEffect } from "react";

export interface FilterState {
  search: string;
  category: string[];
  brand: string[];
  minPrice: string;
  maxPrice: string;
  attributes: Record<string, string[]>;
  sort: string;
  minRating: string;
}

export function useProductFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<FilterState>({
    search: searchParams.get("search") || "",
    category: searchParams.get("category")
      ? searchParams.get("category")!.split(",")
      : [],
    brand: searchParams.get("brand")
      ? searchParams.get("brand")!.split(",")
      : [],
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    attributes: {},
    sort: searchParams.get("sort") || "price_asc",
    minRating: searchParams.get("minRating") || "",
  });

  // Initialize attributes from URL
  useEffect(() => {
    const attrsStr = searchParams.get("attributes");
    if (attrsStr) {
      const parsed: Record<string, string[]> = {};
      const groups = attrsStr.split("|");
      groups.forEach((group) => {
        const [name, vals] = group.split(":");
        if (name && vals) {
          parsed[decodeURIComponent(name)] = vals
            .split(",")
            .map(decodeURIComponent);
        }
      });
      setFilters((prev) => ({ ...prev, attributes: parsed }));
    }
  }, [searchParams]);

  // Apply filters to URL
  const applyFilters = useCallback(
    (newFilters: Partial<FilterState>) => {
      const updated = { ...filters, ...newFilters };
      setFilters(updated);

      const params = new URLSearchParams();

      if (updated.search) params.set("search", updated.search);
      if (updated.category.length > 0)
        params.set("category", updated.category.join(","));
      if (updated.brand.length > 0)
        params.set("brand", updated.brand.join(","));
      if (updated.minPrice) params.set("minPrice", updated.minPrice);
      if (updated.maxPrice) params.set("maxPrice", updated.maxPrice);
      if (updated.sort) params.set("sort", updated.sort);
      if (updated.minRating) params.set("minRating", updated.minRating);

      // Format attributes: Color:Red,Blue|Size:XL
      const attrEntries = Object.entries(updated.attributes)
        .filter(([_, values]) => values.length > 0)
        .map(
          ([name, values]) =>
            `${encodeURIComponent(name)}:${values.map((v) => encodeURIComponent(v)).join(",")}`,
        );

      if (attrEntries.length > 0) {
        params.set("attributes", attrEntries.join("|"));
      }

      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [filters, pathname, router],
  );

  const clearAll = useCallback(() => {
    setFilters({
      search: "",
      category: [],
      brand: [],
      minPrice: "",
      maxPrice: "",
      attributes: {},
      sort: "price_asc",
      minRating: "",
    });
    router.push(pathname, { scroll: false });
  }, [pathname, router]);

  const toggleBrand = useCallback(
    (brandSlug: string) => {
      const isSelected = filters.brand.includes(brandSlug);
      const updatedBrand = isSelected
        ? filters.brand.filter((b) => b !== brandSlug)
        : [...filters.brand, brandSlug];
      applyFilters({ brand: updatedBrand });
    },
    [filters, applyFilters],
  );

  const toggleCategory = useCallback(
    (categorySlug: string) => {
      const isSelected = filters.category.includes(categorySlug);
      const updatedCategory = isSelected
        ? filters.category.filter((c) => c !== categorySlug)
        : [...filters.category, categorySlug];
      applyFilters({ category: updatedCategory });
    },
    [filters, applyFilters],
  );

  const toggleAttribute = useCallback(
    (attrName: string, attrValue: string) => {
      const currentValues = filters.attributes[attrName] || [];
      const isSelected = currentValues.includes(attrValue);

      const updatedValues = isSelected
        ? currentValues.filter((v) => v !== attrValue)
        : [...currentValues, attrValue];

      applyFilters({
        attributes: {
          ...filters.attributes,
          [attrName]: updatedValues,
        },
      });
    },
    [filters, applyFilters],
  );

  const setPriceRange = useCallback(
    (min: string, max: string) => {
      applyFilters({ minPrice: min, maxPrice: max });
    },
    [applyFilters],
  );

  const setCategory = useCallback(
    (slug: string) => {
      applyFilters({ category: [slug] });
    },
    [applyFilters],
  );

  const setSort = useCallback(
    (sort: string) => {
      applyFilters({ sort });
    },
    [applyFilters],
  );

  const setMinRating = useCallback(
    (rating: string) => {
      applyFilters({ minRating: rating });
    },
    [applyFilters],
  );

  return {
    filters,
    applyFilters,
    clearAll,
    toggleBrand,
    toggleCategory,
    toggleAttribute,
    setPriceRange,
    setCategory,
    setSort,
    setMinRating,
  };
}
