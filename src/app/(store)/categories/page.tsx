import { fetchWithTimeout } from "@/lib/fetchWithTimeout";
import { API_URL } from "@/lib/config";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Categories | Femcart",
  description: "Browse our wide selection of products by category.",
};

async function getCategories() {
  try {
    const res = await fetchWithTimeout(`${API_URL}/api/categories?limit=100`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch (error) {
    console.error(`Failed to fetch categories:`, error);
    return [];
  }
}

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="bg-[#FFFDFB] min-h-[100dvh] py-8">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8">
        <div className="mb-12 md:mb-16 text-center">
          <h1 className="font-serif text-[42px] md:text-[64px] font-medium leading-[1.1] text-black mb-4">
            All Categories
          </h1>
          <p className="text-[#666] max-w-xl mx-auto text-[14px] md:text-[15px] leading-relaxed">
            Browse our wide selection of products by category.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8">
          {categories.map((c: any) => (
            <Link
              key={c.id}
              href={`/categories/${c.slug}`}
              className="group block"
            >
              <div className="relative aspect-[4/5] rounded-[24px] overflow-hidden mb-4 shadow-sm group-hover:shadow-md transition-all duration-300 group-hover:ring-4 group-hover:ring-pink-500/20 group-hover:ring-offset-2 ring-offset-white">
                {c.image || c.products?.[0]?.image ? (
                  <img
                    src={c.image || c.products?.[0]?.image}
                    alt={c.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-pink-50 to-pink-100 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-pink-300">
                      <rect width="7" height="7" x="3" y="3" rx="1"/>
                      <rect width="7" height="7" x="14" y="3" rx="1"/>
                      <rect width="7" height="7" x="14" y="14" rx="1"/>
                      <rect width="7" height="7" x="3" y="14" rx="1"/>
                    </svg>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
              </div>
              <h3 className="text-center font-serif text-[15px] md:text-[18px] lg:text-[20px] text-text-pink-500 group-hover:text-pink-500 transition-colors">
                {c.name}
              </h3>
            </Link>
          ))}
        </div>
        
        {categories.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            No categories found.
          </div>
        )}
      </div>
    </div>
  );
}
