import { notFound } from "next/navigation";
import { cache } from "react";
import ProductOverview from "@/components/product/ProductOverview";
import ProductSchema from "@/components/product/shared/ProductSchema";
import ProductViewTracker from "@/components/product/shared/ProductViewTracker";
import ProductUpsell from "@/components/product/ProductUpsell";
import ProductCrossSell from "@/components/product/ProductCrossSell";
import { API_URL } from "@/lib/config";
import { Metadata } from "next";
import Link from "next/link";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  if (!product) return { title: "Product Not Found | Femcart" };

  const {
    name,
    shortDescription,
    description,
    seoData,
    image,
    categories,
    price,
    specialPrice,
  } = product;
  const seo = seoData as any;
  const absoluteImageUrl = image || "";
  const settings = await getGlobalSettings();
  const productUrl =
    settings.permalink_structure === "product"
      ? `${baseUrl}/product/${slug}`
      : `${baseUrl}/${slug}`;

  const cleanDescription = (
    seo?.description ||
    shortDescription ||
    description ||
    `Buy ${name} online at Femcart. Best quality guaranteed.`
  )
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .substring(0, 160);

  const metaTitle = seo?.title || name;
  const keywords =
    seo?.keywords ||
    (categories?.[0]?.name
      ? `${name}, ${categories[0].name}, Femcart`
      : `${name}, Femcart`);

  return {
    title: `Femcart | ${metaTitle}`,
    description: cleanDescription,
    keywords: keywords,
    alternates: { canonical: productUrl },
    openGraph: {
      title: metaTitle,
      description: cleanDescription,
      url: productUrl,
      siteName: "Femcart",
      images: absoluteImageUrl
        ? [{ url: absoluteImageUrl, width: 800, height: 800, alt: name }]
        : [],
      type: "website",
    },
    other: {
      "og:type": "og:product",
      "product:price:amount": (specialPrice || price || 0).toString(),
      "product:price:currency": "BDT",
    },
    twitter: {
      card: "summary_large_image",
      title: metaTitle,
      description: cleanDescription,
      images: absoluteImageUrl ? [absoluteImageUrl] : [],
    },
  };
}

export const getProduct = cache(async (slug: string) => {
  try {
    const res = await fetch(`${API_URL}/api/products/${slug}`, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch (error) {
    console.error("Failed to fetch product:", error);
    return null;
  }
});

export const getGlobalSettings = cache(async () => {
  try {
    const res = await fetch(`${API_URL}/api/global-settings`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return {};
    const json = await res.json();
    return json.data || {};
  } catch {
    return {};
  }
});

// Function getAllProducts removed to optimize payload

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug: paramSlug } = await params;

  // Fetch product and settings in parallel
  const [data, settings] = await Promise.all([
    getProduct(paramSlug),
    getGlobalSettings(),
  ]);

  if (!data) {
    notFound();
  }

  const { name, image } = data;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const absoluteImageUrl = image || "";

  return (
    <div className="bg-white dark:bg-gray-950 min-h-[100dvh]">
      <ProductViewTracker product={data} />
      <ProductSchema
        product={data}
        baseUrl={baseUrl}
        permalinkStructure={settings.permalink_structure}
      />
      {absoluteImageUrl && (
        <link
          rel="preload"
          as="image"
          href={absoluteImageUrl}
          fetchPriority="high"
        />
      )}

      <div className="container mx-auto px-4 py-4 md:py-6 lg:py-8">
        <nav className="hidden md:flex items-center mb-6 md:mb-8 overflow-x-auto whitespace-nowrap scrollbar-hide text-xs font-bold text-gray-700">
          {[
            { label: "Home", href: "/" },
            { label: "Products", href: "/products" },
            ...(data.categories?.[0]
              ? [
                  {
                    label: data.categories[0].name,
                    href: `/categories/${data.categories[0].slug}`,
                  },
                ]
              : []),
            { label: name, href: null },
          ].map((item, index) => (
            <div
              key={index}
              className={`flex relative ${["z-40", "z-30", "z-20", "z-10"][index] || "z-0"} ${index !== 0 ? "-ml-2" : ""}`}
            >
              {item.href ? (
                <Link
                  href={item.href}
                  className="flex items-center bg-gray-200 hover:bg-pink-600 hover:text-white transition-colors h-8"
                  style={{
                    clipPath:
                      index === 0
                        ? "polygon(0 0, calc(100% - 10px) 0, 100% 50%, calc(100% - 10px) 100%, 0 100%)"
                        : "polygon(0 0, calc(100% - 10px) 0, 100% 50%, calc(100% - 10px) 100%, 0 100%, 10px 50%)",
                    paddingLeft: index === 0 ? "16px" : "22px",
                    paddingRight: "16px",
                  }}
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className="flex items-center bg-gray-100 text-gray-500 h-8 max-w-[200px] md:max-w-xs overflow-hidden"
                  style={{
                    clipPath:
                      "polygon(0 0, 100% 0, 100% 100%, 0 100%, 10px 50%)",
                    paddingLeft: "22px",
                    paddingRight: "16px",
                  }}
                >
                  <span className="truncate block w-full">{item.label}</span>
                </span>
              )}
            </div>
          ))}
        </nav>

        {/* Product Overview Alpha */}
        <div className="py-4">
          <ProductOverview product={data} />
        </div>
      </div>

      {/* Upsell and CrossSell (They have their own SectionWrapper containers) */}
      <div className="pb-8">
        <ProductUpsell productContext={data} />
        <ProductCrossSell productContext={data} />
      </div>
    </div>
  );
}
