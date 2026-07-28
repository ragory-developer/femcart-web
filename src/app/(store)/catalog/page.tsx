import { fetchWithTimeout } from "@/lib/fetchWithTimeout";
import InfiniteProductList from "@/components/product/shared/InfiniteProductList";
import ProductFilters from "@/components/product/shared/ProductFilters";
import ProductToolbar from "@/components/product/shared/ProductToolbar";
import { API_URL } from "@/lib/config";
import { Metadata } from "next";
import { Suspense } from "react";

export const dynamicParams = true;

export const metadata: Metadata = {
  title: "Catalog | Femcart",
  description: "Explore our complete collection of essential intimates.",
};

async function getGlobalSettings() {
  try {
    const res = await fetchWithTimeout(`${API_URL}/api/global-settings`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return {};
    const json = await res.json();
    return json.data || {};
  } catch (error) {
    return {};
  }
}

async function getProducts(searchParams: any) {
  try {
    const query = new URLSearchParams();
    if (searchParams.minPrice) query.set("minPrice", searchParams.minPrice);
    if (searchParams.maxPrice) query.set("maxPrice", searchParams.maxPrice);
    if (searchParams.attributes)
      query.set("attributes", searchParams.attributes);
    if (searchParams.search) query.set("search", searchParams.search);
    if (searchParams.category) query.set("category", searchParams.category);
    if (searchParams.brand) query.set("brand", searchParams.brand);
    if (searchParams.sort) query.set("sort", searchParams.sort);
    query.set("limit", "20");

    const res = await fetchWithTimeout(
      `${API_URL}/api/products?${query.toString()}`,
      { next: { revalidate: 60 } },
    );
    if (!res.ok)
      return {
        data: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 1 },
      };
    const json = await res.json();
    return {
      data: json.data || [],
      pagination: json.pagination || {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 1,
      },
    };
  } catch (error) {
    console.error(`Failed to fetch catalog products:`, error);
    return {
      data: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 1 },
    };
  }
}

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const sParams = await searchParams;
  const { data: products, pagination } = await getProducts(sParams);
  const settings = await getGlobalSettings();

  const perRow = parseInt(settings.products_per_row || "4");
  const isInfinite = settings.enable_infinite_scroll === "true";

  const gridCols =
    {
      2: "xl:grid-cols-2",
      3: "xl:grid-cols-3",
      4: "xl:grid-cols-4",
      5: "xl:grid-cols-5",
      6: "xl:grid-cols-6",
    }[perRow as 2 | 3 | 4 | 5 | 6] || "xl:grid-cols-4";

  const fetchUrl = new URL(`${API_URL}/api/products`);
  if (sParams.minPrice) fetchUrl.searchParams.set("minPrice", sParams.minPrice);
  if (sParams.maxPrice) fetchUrl.searchParams.set("maxPrice", sParams.maxPrice);
  if (sParams.attributes)
    fetchUrl.searchParams.set("attributes", sParams.attributes);
  if (sParams.search) fetchUrl.searchParams.set("search", sParams.search);
  if (sParams.category) fetchUrl.searchParams.set("category", sParams.category);
  if (sParams.brand) fetchUrl.searchParams.set("brand", sParams.brand);
  if (sParams.sort) fetchUrl.searchParams.set("sort", sParams.sort);

  return (
    <div className="bg-[#FFFDFB] min-h-[100dvh] py-8">
      <div className="max-w-[1600px] mx-auto px-4 md:px-8">
        {/* Header & Controls */}
        <div className="mb-12 md:mb-16">
          <h1 className="font-serif text-[42px] md:text-[64px] font-medium leading-[1.1] text-black mb-4">
            All Products
          </h1>
          <p className="text-[#666] max-w-xl text-[14px] md:text-[15px] leading-relaxed">
            Explore our complete collection of essential intimates, thoughtfully
            designed for every body and every day.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 mb-20">
          <aside className="hidden lg:block sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto custom-scrollbar w-72 shrink-0 lg:pr-8">
            <Suspense
              fallback={
                <div className="w-full h-[100dvh] animate-pulse bg-gray-100 rounded-3xl" />
              }
            >
              <ProductFilters hideCategoryFilter={false} />
            </Suspense>
          </aside>

          <div className="flex-1">
            <Suspense
              fallback={
                <div className="h-20 w-full animate-pulse bg-gray-100 rounded-2xl mb-8" />
              }
            >
              <ProductToolbar totalProducts={pagination.total} />
            </Suspense>

            <InfiniteProductList
              initialProducts={products}
              initialPagination={pagination}
              fetchUrl={fetchUrl.toString()}
              gridCols={gridCols}
              enabled={isInfinite}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
