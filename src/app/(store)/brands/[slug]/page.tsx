import { fetchWithTimeout } from "@/lib/fetchWithTimeout";
import InfiniteProductList from "@/components/product/shared/InfiniteProductList";
import ProductFilters from "@/components/product/shared/ProductFilters";
import ProductToolbar from "@/components/product/shared/ProductToolbar";
import { API_URL } from "@/lib/config";
import { ArrowLeft, Tag } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

export const dynamicParams = true;

async function getBrand(slug: string) {
  try {
    const res = await fetchWithTimeout(`${API_URL}/api/brands/${slug}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch (error) {
    console.error(`Failed to fetch brand ${slug}:`, error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const brand = await getBrand(slug);
  if (!brand) return { title: "Brand Not Found | Femcart" };

  const { name, seoData, image } = brand;
  const seo = seoData as any;

  return {
    title: seo?.title || `${name} | Femcart`,
    description:
      seo?.description || `Explore high-quality products from ${name}.`,
    keywords: seo?.keywords,
    openGraph: {
      title: seo?.title || name,
      description: seo?.description || `Discover ${name} collection.`,
      images: image ? [image] : [],
    },
  };
}

async function getBrandProducts(slug: string, searchParams: any) {
  try {
    const query = new URLSearchParams();
    query.set("brand", slug);
    if (searchParams.minPrice) query.set("minPrice", searchParams.minPrice);
    if (searchParams.maxPrice) query.set("maxPrice", searchParams.maxPrice);
    if (searchParams.attributes)
      query.set("attributes", searchParams.attributes);
    if (searchParams.search) query.set("search", searchParams.search);
    if (searchParams.category) query.set("category", searchParams.category);
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
    console.error(`Failed to fetch products for brand ${slug}:`, error);
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

export default async function BrandPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const { slug } = await params;
  const sParams = await searchParams;
  const brand = await getBrand(slug);
  const { data: products, pagination } = await getBrandProducts(slug, sParams);
  const settings = await getGlobalSettings();

  if (!brand) return null;

  const brandName = brand.name;

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
  fetchUrl.searchParams.set("brand", slug);
  if (sParams.minPrice) fetchUrl.searchParams.set("minPrice", sParams.minPrice);
  if (sParams.maxPrice) fetchUrl.searchParams.set("maxPrice", sParams.maxPrice);
  if (sParams.attributes)
    fetchUrl.searchParams.set("attributes", sParams.attributes);
  if (sParams.search) fetchUrl.searchParams.set("search", sParams.search);

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-[100dvh] py-12">
      <div className="container mx-auto px-4">
        <div className="mb-12">
          <Link
            href="/products"
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors mb-4 uppercase tracking-widest font-bold"
          >
            <ArrowLeft size={16} className="mr-1" /> Back to Shop
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
              <Tag size={20} />
            </div>
            <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em]">
              Brand Collection
            </span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-black text-gray-900 dark:text-white tracking-tight uppercase italic">
            {brandName}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-3 font-medium max-w-2xl">
            Explore high-quality products from {brandName}. We bring you the
            best from our trusted partners.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 mb-20">
          <aside className="hidden lg:block sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto custom-scrollbar w-72 shrink-0 lg:border-r lg:border-gray-100 lg:dark:border-gray-800/60 lg:pr-8">
            <Suspense
              fallback={
                <div className="w-full h-[100dvh] animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl" />
              }
            >
              <ProductFilters />
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

        {brand.content && (
          <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 lg:p-12 border border-gray-100 dark:border-gray-800 shadow-sm">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6 uppercase italic tracking-tight border-b-2 border-indigo-500 pb-2 inline-block">
              About {brandName}
            </h2>
            <div
              className="prose prose-indigo dark:prose-invert max-w-none text-gray-600 dark:text-gray-400 leading-relaxed font-medium"
              dangerouslySetInnerHTML={{ __html: brand.content }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
