import { fetchWithTimeout } from "@/lib/fetchWithTimeout";
import ProductDetailPage, {
  generateMetadata as templateGenerateMetadata,
} from "@/components/product/shared/ProductPageTemplate";
import { API_URL } from "@/lib/config";
import { redirect } from "next/navigation";

import { Metadata } from "next";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  return templateGenerateMetadata(props);
}

export default async function ProductSlugPage(props: any) {
  let settings: any = {};
  try {
    const settingsRes = await fetchWithTimeout(
      `${API_URL}/api/global-settings`,
      { next: { revalidate: 3600 } },
    );
    if (settingsRes.ok) {
      const json = await settingsRes.json();
      settings = json.data || {};
    }
  } catch (e) {}

  if (
    settings.permalink_structure === "flat" ||
    !settings.permalink_structure
  ) {
    const resolvedParams = await props.params;
    redirect(`/${resolvedParams.slug}`);
  }

  return <ProductDetailPage params={props.params} />;
}
