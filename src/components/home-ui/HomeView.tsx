"use client";

import React from "react";
import ComponentRegistry from "./ComponentRegistry";
import ClientInViewSection from "./ClientInViewSection";

const sectionHeights: Record<string, string> = {
  Hero: "500px",
  TrustStrip: "60px",
  Categories: "200px",
  FeaturedProducts: "750px",
  SizeBanner: "180px",
  BestSellers: "750px",
  LimitedOffers: "450px",
  NewArrivals: "750px",
  Reviews: "450px",
  WhyShop: "350px",
  Editorial: "450px",
  PreOrder: "450px",
  Social: "300px",
  Newsletter: "200px",
  SeoBlock: "250px",
};

export default function HomeView({
  categories,
  globalSettings,
  products = [],
}: {
  categories: any;
  globalSettings: any;
  products?: any[];
}) {
  let layout: any = [];
  try {
    if (globalSettings?.HOME_PAGE_LAYOUT) {
      layout = JSON.parse(globalSettings.HOME_PAGE_LAYOUT);
    }
  } catch (e) {
    console.error("Failed to parse HOME_PAGE_LAYOUT", e);
  }

  // Fallback layout if none provided
  if (!layout || layout.length === 0) {
    layout = [
      { id: "hero-1", type: "Hero", props: {} },
      { id: "trust-1", type: "TrustStrip", props: {} },
      { id: "cat-1", type: "Categories", props: {} },
      {
        id: "feat-1",
        type: "FeaturedProducts",
        props: { productSource: "FEATURED", limit: 10 },
      },
      { id: "size-1", type: "SizeBanner", props: {} },
      {
        id: "best-1",
        type: "BestSellers",
        props: { productSource: "BEST_SELLERS", limit: 10 },
      },
      { id: "lim-1", type: "LimitedOffers", props: {} },
      {
        id: "new-1",
        type: "NewArrivals",
        props: { productSource: "NEW_ARRIVALS", limit: 10 },
      },
      { id: "rev-1", type: "Reviews", props: {} },
      { id: "why-1", type: "WhyShop", props: {} },
      { id: "edit-1", type: "Editorial", props: {} },
      { id: "pre-1", type: "PreOrder", props: {} },
      { id: "soc-1", type: "Social", props: {} },
      { id: "news-1", type: "Newsletter", props: {} },
      { id: "seo-1", type: "SeoBlock", props: {} },
    ];
  }

  return (
    <div className="flex flex-col w-full">
      {layout.map((section: any, index: number) => {
        if (section.enabled === false) return null;
        const Component = ComponentRegistry[section.type];
        if (!Component) return null;

        let sectionProducts = products;
        if (section.props?.productSource === "FEATURED") {
          sectionProducts = products.filter((p: any) => p.featured);
        } else if (section.props?.productSource === "PROMOTION") {
          sectionProducts = products.filter(
            (p: any) => p.specialPrice && p.specialPrice < p.price,
          );
        } else if (section.props?.productSource === "BEST_SELLERS") {
          sectionProducts = [...products].sort(
            (a: any, b: any) => (b.averageRating || 0) - (a.averageRating || 0),
          );
        } else if (section.props?.productSource === "WEEKLY_SALE") {
          sectionProducts = products
            .filter((p: any) => p.specialPrice && p.specialPrice < p.price)
            .slice(0, section.props.limit || 10);
        } else if (section.props?.productSource === "NEW_ARRIVALS") {
          sectionProducts = [...products].sort(
            (a: any, b: any) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          );
        }

        if (section.props?.limit) {
          sectionProducts = sectionProducts.slice(0, section.props.limit);
        }

        return (
          <ClientInViewSection
            key={section.id}
            minHeight={sectionHeights[section.type] || "100px"}
            bypass={index < 3}
          >
            <Component
              {...section.props}
              categories={categories}
              products={sectionProducts}
            />
          </ClientInViewSection>
        );
      })}
    </div>
  );
}
