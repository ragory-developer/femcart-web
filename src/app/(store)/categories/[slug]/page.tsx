import { fetchWithTimeout } from "@/lib/fetchWithTimeout";
import InfiniteProductList from "@/components/product/shared/InfiniteProductList";
import ProductFilters from "@/components/product/shared/ProductFilters";
import ProductToolbar from "@/components/product/shared/ProductToolbar";
import { API_URL } from "@/lib/config";
import { ArrowLeft, LayoutGrid } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

export const dynamicParams = true;

async function getCategory(slug: string) {
  try {
    const res = await fetchWithTimeout(`${API_URL}/api/categories/${slug}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch (error) {
    console.error(`Failed to fetch category ${slug}:`, error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) return { title: "Category Not Found | Femcart" };

  const { name, seoData, image } = category;
  const seo = seoData as any;

  return {
    title: seo?.title || `${name} | Femcart`,
    description:
      seo?.description ||
      `Browse our collection of ${name.toLowerCase()} products.`,
    keywords: seo?.keywords,
    openGraph: {
      title: seo?.title || name,
      description: seo?.description || `Explore ${name} products.`,
      images: image ? [image] : [],
    },
  };
}

async function getCategoryProducts(slug: string, searchParams: any) {
  try {
    const query = new URLSearchParams();
    query.set("category", slug);
    if (searchParams.minPrice) query.set("minPrice", searchParams.minPrice);
    if (searchParams.maxPrice) query.set("maxPrice", searchParams.maxPrice);
    if (searchParams.attributes)
      query.set("attributes", searchParams.attributes);
    if (searchParams.search) query.set("search", searchParams.search);
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
    console.error(`Failed to fetch products for category ${slug}:`, error);
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

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const { slug } = await params;
  const sParams = await searchParams;
  const category = await getCategory(slug);
  const { data: products, pagination } = await getCategoryProducts(
    slug,
    sParams,
  );
  const settings = await getGlobalSettings();

  if (!category) return null;

  const categoryName = category.name;

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
  fetchUrl.searchParams.set("category", slug);
  if (sParams.minPrice) fetchUrl.searchParams.set("minPrice", sParams.minPrice);
  if (sParams.maxPrice) fetchUrl.searchParams.set("maxPrice", sParams.maxPrice);
  if (sParams.attributes)
    fetchUrl.searchParams.set("attributes", sParams.attributes);
  if (sParams.search) fetchUrl.searchParams.set("search", sParams.search);

  return (
    <div className="bg-[#FFFDFB] dark:bg-[#0a0a0a] min-h-[100dvh] py-4 lg:py-8">
      <div className="container mx-auto px-2 sm:px-6 max-w-[1600px]">
        <div className="relative hidden sm:flex items-center justify-center mb-4 lg:mb-8 border-b border-gray-100 dark:border-gray-900 pb-4 lg:pb-6">
          <div className="absolute left-0">
            <Link
              href="/products"
              className="inline-flex items-center text-[11px] font-black text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 px-3 sm:px-4 py-2 rounded-full transition-colors uppercase tracking-[0.2em]"
            >
              <ArrowLeft size={14} className="sm:mr-2" /> <span className="hidden sm:inline">Back to Shop</span>
            </Link>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight uppercase text-gray-900 dark:text-white text-center px-10 sm:px-32">
            {categoryName}
          </h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-10 lg:gap-14">
          <aside className="hidden lg:block sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto w-72 shrink-0 lg:border-r lg:border-gray-100 lg:dark:border-gray-800/60 lg:pr-8 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 dark:[&::-webkit-scrollbar-thumb]:bg-gray-800 [&::-webkit-scrollbar-thumb]:rounded-full">
            <Suspense
              fallback={
                <div className="w-full h-[100dvh] animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl" />
              }
            >
              <ProductFilters hideCategoryFilter={true} />
            </Suspense>
          </aside>

          <div className="flex-1">
            <Suspense
              fallback={
                <div className="h-20 w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-2xl mb-8" />
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

        {category.content && (
          <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 lg:p-12 border border-gray-100 dark:border-gray-800 shadow-sm">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6 uppercase italic tracking-tight border-b-2 border-indigo-500 pb-2 inline-block">
              About {categoryName}
            </h2>
            <div
              className="prose prose-indigo dark:prose-invert max-w-none text-gray-600 dark:text-gray-400 leading-relaxed font-medium"
              dangerouslySetInnerHTML={{ __html: category.content }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
