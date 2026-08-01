import { fetchWithTimeout } from "@/lib/fetchWithTimeout";
export const dynamic = "force-dynamic";

import PageTemplate from "@/components/page/PageTemplate";
import ProductDetailPage, {
  generateMetadata as productGenerateMetadata,
  getProduct,
  getGlobalSettings,
} from "@/components/product/shared/ProductPageTemplate";
import { API_URL } from "@/lib/config";
import { Metadata } from "next";
import { redirect } from "next/navigation";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const resolvedParams = await props.params;

  const settings = await getGlobalSettings();

  const isFlatStructure =
    settings.permalink_structure === "flat" || !settings.permalink_structure;

  // We only consider returning product metadata if it's the flat structure.
  if (isFlatStructure) {
    const productMeta = await productGenerateMetadata(props);
    if (
      productMeta?.title &&
      productMeta.title !== "Product Not Found | Femcart"
    ) {
      return productMeta;
    }
  }

  // Attempt to resolve as a Custom Page
  try {
    const res = await fetchWithTimeout(
      `${API_URL}/api/pages/${resolvedParams.slug}`,
      { next: { revalidate: 0 } },
    );
    const json = await res.json();
    if (json.success && json.data) {
      const page = json.data;
      let pTitle = page.title;
      let pDesc = "Custom page";
      try {
        if (page.seoData) {
          const seo =
            typeof page.seoData === "string"
              ? JSON.parse(page.seoData)
              : page.seoData;
          if (seo.title) pTitle = seo.title;
          if (seo.description) pDesc = seo.description;
        }
      } catch (e) {}
      return { title: pTitle, description: pDesc };
    }
  } catch (e) {}

  return { title: "Not Found" };
}

export default async function RootSlugPage(props: any) {
  const resolvedParams = await props.params;

  const settings = await getGlobalSettings();

  const isFlatStructure =
    settings.permalink_structure === "flat" || !settings.permalink_structure;

  let isProduct = false;
  let shouldRedirectToProduct = false;

  // 1. Try fetching Product using cached getProduct
  const productData = await getProduct(resolvedParams.slug);
  if (productData) {
    if (!isFlatStructure) {
      shouldRedirectToProduct = true;
    } else {
      isProduct = true;
    }
  }

  if (shouldRedirectToProduct) {
    // If structure is 'product', redirect from flat URL to product URL
    redirect(`/product/${resolvedParams.slug}`);
  }

  if (isProduct) {
    return <ProductDetailPage params={props.params} />;
  }

  let pageData = null;
  // 2. Try fetching Custom Page
  try {
    const pageRes = await fetchWithTimeout(
      `${API_URL}/api/pages/${resolvedParams.slug}`,
      { next: { revalidate: 0 } },
    );
    if (pageRes.ok) {
      const pageJson = await pageRes.json();
      if (pageJson.success && pageJson.data) {
        pageData = pageJson.data;
      }
    }
  } catch (e) {}

  if (pageData) {
    return <PageTemplate page={pageData} />;
  }

  // 4. Neither found, fallback to the generic NOT FOUND UI in ProductDetailPage
  return <ProductDetailPage params={props.params} />;
}
