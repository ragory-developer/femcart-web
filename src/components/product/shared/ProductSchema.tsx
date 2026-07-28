import { API_URL } from "@/lib/config";
import { Logger } from "@/lib/logger";

import React from "react";

interface ProductSchemaProps {
  product: any;
  baseUrl: string;
  permalinkStructure?: string;
}

const ProductSchema: React.FC<ProductSchemaProps> = ({
  product,
  baseUrl,
  permalinkStructure,
}) => {
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
    slug,
    averageRating,
    ratingCount,
    productType,
    priceRange,
  } = product;

  let parsedPriceRange = priceRange;
  if (typeof priceRange === "string") {
    try {
      parsedPriceRange = JSON.parse(priceRange);
    } catch (error) {
      Logger.warn("Invalid price range JSON format", error, "ProductSchema");
      parsedPriceRange = null;
    }
  }
  // Clean description: strip HTML, prioritize SEO description
  const cleanDescription = (
    product.seoData?.description ||
    shortDescription ||
    description ||
    `High quality ${name}`
  )
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Helper for absolute URLs
  const getAbsoluteUrl = (path: string) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    // For media, use backend URL if it's a relative path starting with /uploads
    if (path.startsWith("/uploads")) {
      return `${API_URL}${cleanPath}`;
    }
    return `${baseUrl}${cleanPath}`;
  };

  const productUrl =
    permalinkStructure === "product"
      ? `${baseUrl}/product/${slug}`
      : `${baseUrl}/${slug}`;

  // Prepare image array
  const allImages = [image, ...(images || [])]
    .filter(Boolean)
    .map((img) => getAbsoluteUrl(img));
  const uniqueImages = Array.from(new Set(allImages));

  const isOutOfStock = stock <= 0;
  const currentPrice = specialPrice || price || 0;

  // 1. Product Schema
  const productJsonLd: any = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "@id": `${productUrl}#product`,
    name: name,
    image: uniqueImages,
    description: cleanDescription || name,
    sku: sku || `FCR-${product.id.substring(2, 10).toUpperCase()}`,
    mpn: sku || product.id,
    brand: brand
      ? {
          "@type": "Brand",
          name: brand.name,
        }
      : {
          "@type": "Brand",
          name: "Femcart",
        },
  };

  // Breadcrumb category path
  if (categories && categories.length > 0) {
    productJsonLd.category = categories[0].name;
  }

  // Handle Offers (Single vs Aggregate)
  if (
    productType === "VARIABLE" &&
    parsedPriceRange &&
    typeof parsedPriceRange.min !== "undefined" &&
    typeof parsedPriceRange.max !== "undefined"
  ) {
    productJsonLd.offers = {
      "@type": "AggregateOffer",
      url: productUrl,
      priceCurrency: "BDT",
      lowPrice: parsedPriceRange.min.toString(),
      highPrice: parsedPriceRange.max.toString(),
      offerCount: (product.variants?.length || 1).toString(),
      availability: isOutOfStock
        ? "https://schema.org/OutOfStock"
        : "https://schema.org/InStock",
    };
  } else {
    productJsonLd.offers = {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: "BDT",
      price: currentPrice.toString(),
      availability: isOutOfStock
        ? "https://schema.org/OutOfStock"
        : "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      priceValidUntil: "2026-12-31",
    };
  }

  // 2. BreadcrumbList Schema
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: baseUrl,
      },
      ...(categories && categories.length > 0
        ? [
            {
              "@type": "ListItem",
              position: 2,
              name: categories[0].name,
              item: `${baseUrl}/categories/${categories[0].slug}`,
            },
          ]
        : []),
      {
        "@type": "ListItem",
        position: categories && categories.length > 0 ? 3 : 2,
        name: name,
        item: productUrl,
      },
    ],
  };

  // Add Specifications (additionalProperty)
  if (product.specifications && Array.isArray(product.specifications)) {
    productJsonLd.additionalProperty = product.specifications.map((s: any) => ({
      "@type": "PropertyValue",
      name: s.name,
      value: s.value,
    }));
  }

  // Add FAQ (subjectOf)
  if (product.faqs && Array.isArray(product.faqs) && product.faqs.length > 0) {
    productJsonLd.subjectOf = {
      "@type": "FAQPage",
      mainEntity: product.faqs.map((faq: any) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    };
  }

  // Add AggregateRating if exists
  if (averageRating > 0 && ratingCount > 0) {
    productJsonLd.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: averageRating.toString(),
      reviewCount: ratingCount.toString(),
      bestRating: "5",
      worstRating: "1",
    };
  }

  return (
    <>
      <script
        id={`product-schema-${product.id}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        id={`breadcrumb-schema-${product.id}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
    </>
  );
};

export default ProductSchema;
