import { fetchWithTimeout } from "@/lib/fetchWithTimeout";
import CartDrawer from "@/components/layout/CartDrawer";
import FloatingMiniBasket from "@/components/layout/FloatingMiniBasket";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import { ScrollToTop } from "@/components/ui/ScrollToTop";
import Layout from "@/components/home-ui/Layout";
import { API_URL } from "@/lib/config";
import StoreInitializer from "@/components/providers/StoreInitializer";

async function getNavigationData() {
  try {
    const [navRes, footerRes, catRes] = await Promise.all([
      fetchWithTimeout(`${API_URL}/api/navigation/navbar`, {
        next: { revalidate: 60 },
      }),
      fetchWithTimeout(`${API_URL}/api/navigation/footer/sections`, {
        next: { revalidate: 60 },
      }),
      fetchWithTimeout(`${API_URL}/api/categories`, {
        next: { revalidate: 60 },
      }),
    ]);

    const navJson = await navRes.json();
    const footerJson = await footerRes.json();
    const catJson = await catRes.json();

    const fetchedNav =
      navJson.success && Array.isArray(navJson.data) ? navJson.data : [];
    const topItems = fetchedNav.filter(
      (item: any) => item.position === "top" || !item.position,
    );
    const bottomItems = fetchedNav.filter(
      (item: any) => item.position === "bottom",
    );
    const footerSections =
      footerJson.success && Array.isArray(footerJson.data)
        ? footerJson.data
        : [];

    let categories = [];
    if (
      catJson.success &&
      Array.isArray(catJson.data) &&
      catJson.data.length > 0
    ) {
      categories = catJson.data.map((cat: any) => ({
        id: cat.id,
        title: cat.name,
        image: cat.image,
        slug: cat.slug,
        subcategories:
          cat.children && cat.children.length > 0
            ? cat.children.map((child: any) => ({
                title: child.name,
                href: `/categories/${child.slug}`,
                items:
                  child.children && child.children.length > 0
                    ? child.children.map((grandchild: any) => ({
                        title: grandchild.name,
                        href: `/categories/${grandchild.slug}`,
                      }))
                    : [],
              }))
            : [],
      }));
    } else {
      const { megamenuData } =
        await import("@/components/layout/shared/megamenuData");
      // Strip 'icon' function from fallback data to prevent serialization errors in Next.js
      categories = megamenuData.map(({ icon, ...rest }) => rest);
    }

    return {
      navbarItems: fetchedNav,
      topNavbarItems: topItems,
      bottomNavbarItems: bottomItems,
      footerSections,
      categories,
    };
  } catch (error) {
    console.error("Failed to fetch navigation layout data", error);
    const { megamenuData } =
      await import("@/components/layout/shared/megamenuData");
    const safeCategories = megamenuData.map(({ icon, ...rest }) => rest);
    return {
      navbarItems: [],
      topNavbarItems: [],
      bottomNavbarItems: [],
      footerSections: [],
      categories: safeCategories,
    };
  }
}

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navData = await getNavigationData();

  return (
    <div className="flex flex-col min-h-[100dvh]">
      <StoreInitializer {...navData} />

      {/* Global Modals */}
      {/* Slide-over Cart */}
      <CartDrawer />

      {/* Floating Mini Basket */}
      <FloatingMiniBasket />

      {/* New Femcart Layout */}
      <Layout>{children}</Layout>

      {/* Mobile App-like Bottom Navigation */}
      <MobileBottomNav />

      {/* Global Scroll to Top Button */}
      <ScrollToTop variant="glass" size="fluid" />
    </div>
  );
}
