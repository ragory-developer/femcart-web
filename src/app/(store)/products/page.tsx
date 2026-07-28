import { fetchWithTimeout } from "@/lib/fetchWithTimeout";
import InfiniteProductList from "@/components/product/shared/InfiniteProductList";
import ProductFilters from "@/components/product/shared/ProductFilters";
import ActiveFilters from "@/components/product/shared/ActiveFilters";
import ProductToolbar from "@/components/product/shared/ProductToolbar";
import { API_URL } from "@/lib/config";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

async function getProducts(searchParams: any) {
  try {
    const query = new URLSearchParams();
    if (searchParams.category) query.set("category", searchParams.category);
    if (searchParams.brand) query.set("brand", searchParams.brand);
    if (searchParams.minPrice) query.set("minPrice", searchParams.minPrice);
    if (searchParams.maxPrice) query.set("maxPrice", searchParams.maxPrice);
    if (searchParams.attributes)
      query.set("attributes", searchParams.attributes);
    if (searchParams.search) query.set("search", searchParams.search);
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
    console.error("Failed to fetch products:", error);
    return {
      data: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 1 },
    };
  }
}

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

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;
  const { data: products, pagination } = await getProducts(params);
  const settings = await getGlobalSettings();

  const perRow = parseInt(settings.products_per_row || "4");
  const isInfinite = settings.enable_infinite_scroll === "true";

  // Map perRow to Tailwind grid classes
  const gridCols =
    {
      2: "xl:grid-cols-2",
      3: "xl:grid-cols-3",
      4: "xl:grid-cols-4",
      5: "xl:grid-cols-5",
      6: "xl:grid-cols-6",
    }[perRow as 2 | 3 | 4 | 5 | 6] || "xl:grid-cols-4";

  // Construct base fetch URL for infinite scroll
  const fetchUrl = new URL(`${API_URL}/api/products`);
  if (params.category) fetchUrl.searchParams.set("category", params.category);
  if (params.brand) fetchUrl.searchParams.set("brand", params.brand);
  if (params.minPrice) fetchUrl.searchParams.set("minPrice", params.minPrice);
  if (params.maxPrice) fetchUrl.searchParams.set("maxPrice", params.maxPrice);
  if (params.attributes)
    fetchUrl.searchParams.set("attributes", params.attributes);
  if (params.search) fetchUrl.searchParams.set("search", params.search);
  if (params.sort) fetchUrl.searchParams.set("sort", params.sort);

  return (
    <div className="bg-[#FFFDFB] dark:bg-[#0a0a0a] min-h-[100dvh] py-16">
      <div className="container mx-auto px-2 sm:px-6 max-w-[1600px]">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-20 border-b border-gray-100 dark:border-gray-900 pb-12">
          <div>
            <Link
              href="/"
              className="inline-flex items-center text-[10px] font-black text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-6 uppercase tracking-[0.3em]"
            >
              <ArrowLeft size={14} className="mr-2" /> Back to Home
            </Link>
            <h1 className="text-5xl lg:text-[5rem] leading-[1] font-black tracking-tighter uppercase text-gray-900 dark:text-white">
              Shop All
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-6 font-medium max-w-md text-sm leading-relaxed">
              Discover our curated selection of premium organic products,
              sourced directly from sustainable farms for your healthy
              lifestyle.
            </p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-10 lg:gap-14">
          {/* Sidebar - Desktop */}
          <aside className="hidden lg:block sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto w-72 shrink-0 lg:border-r lg:border-gray-100 lg:dark:border-gray-800/60 lg:pr-8">
            <Suspense
              fallback={
                <div className="w-full h-[100dvh] animate-pulse bg-gray-50 dark:bg-gray-900" />
              }
            >
              <ProductFilters />
            </Suspense>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            <Suspense fallback={null}>
              <ActiveFilters />
            </Suspense>

            {/* Toolbar */}
            <Suspense
              fallback={
                <div className="h-20 w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-2xl mb-8" />
              }
            >
              <ProductToolbar totalProducts={pagination.total} />
            </Suspense>

            {/* Infinite Product List Wrapper */}
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
