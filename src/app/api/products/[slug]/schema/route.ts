import { API_URL } from "@/lib/config";
import { NextResponse } from "next/server";

async function getProduct(slug: string) {
  try {
    const res = await fetch(`${API_URL}/api/products/${slug}`, {
      next: { revalidate: 0 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch (error) {
    return null;
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return new NextResponse("{}", { status: 404 });
  }

  // Generate the same JSON-LD as in ProductSchema.tsx
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const {
    name,
    description,
    shortDescription,
    image,
    images,
    sku,
    price,
    specialPrice,
    stock,
    brand,
    categories,
    averageRating,
    ratingCount,
  } = product;

  const cleanDescription = (
    product.seoData?.description ||
    shortDescription ||
    description ||
    `High quality ${name}`
  )
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const getAbsoluteUrl = (path: string) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    if (path.startsWith("/uploads")) {
      return `${API_URL}${cleanPath}`;
    }
    return `${baseUrl}${cleanPath}`;
  };

  const productUrl = `${baseUrl}/${slug}`;
  const allImages = [image, ...(images || [])]
    .filter(Boolean)
    .map((img) => getAbsoluteUrl(img));
  const uniqueImages = Array.from(new Set(allImages));
  const isOutOfStock = stock <= 0;
  const currentPrice = specialPrice || price || 0;

  const getCategoryPath = (cat: { name: string; parent?: any }): string => {
    const path: string[] = [];
    let current = cat;
    while (current) {
      path.unshift(current.name);
      current = current.parent;
    }
    return path.join(" > ");
  };
  const categoryPath =
    categories && categories.length > 0 ? getCategoryPath(categories[0]) : "";

  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "@id": `${productUrl}#product`,
    name: name,
    image: uniqueImages,
    description: cleanDescription || name,
    sku: sku || `FCR-${product.id.substring(2, 10).toUpperCase()}`,
    brand: brand
      ? { "@type": "Brand", name: brand.name }
      : { "@type": "Brand", name: "Femcart" },
    category: categoryPath,
    offers: {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: "BDT",
      price: currentPrice.toString(),
      availability: isOutOfStock
        ? "https://schema.org/OutOfStock"
        : "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };

  if (averageRating > 0 && ratingCount > 0) {
    (jsonLd as any).aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: averageRating.toString(),
      reviewCount: ratingCount.toString(),
    };
  }

  return NextResponse.json(jsonLd);
}
