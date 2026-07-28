"use client";

import UserSidebar from "@/components/dashboard/UserSidebar";
import { useAuth } from "@/context/AuthContext";
import { API_URL } from "@/lib/config";
import { Heart, Loader2, Search, ShoppingBag, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { showToast } from "@/lib/toast";
import { useCartStore } from "@/store/cartStore";

interface WishlistItem {
  id: string;
  productId: string;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    specialPrice?: number;
    image: string;
    stock: number;
  };
}

export default function WishlistPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const addToCart = useCartStore((state) => state.addToCart);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.replace("/login?redirect=/profile/wishlist");
      } else if (user.isGuest) {
        router.replace("/profile");
      }
    }
  }, [user, authLoading, router]);

  const fetchWishlist = async () => {
    try {
      const token =
        localStorage.getItem("femcart_access_token") ||
        localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/wishlist`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setItems(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch wishlist", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchWishlist();
    }
  }, [user]);

  const removeFromWishlist = async (id: string) => {
    try {
      const token =
        localStorage.getItem("femcart_access_token") ||
        localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/wishlist/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setItems(items.filter((item) => item.id !== id));
        showToast.success("Removed from wishlist");
      }
    } catch (error) {
      showToast.error("Failed to remove item");
    }
  };

  const handleAddToCart = (product: any) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.specialPrice || product.price,
      image: product.image,
      quantity: 1,
      slug: product.slug,
    });
    showToast.success("Added to cart");
  };

  const filteredItems = items.filter((item) =>
    item.product.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (authLoading || (loading && items.length === 0)) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="bg-[#f8fafc] dark:bg-gray-950 min-h-[100dvh] py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="w-full lg:w-80 shrink-0">
            <UserSidebar />
          </aside>

          <main className="flex-grow">
            <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <div>
                <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter uppercase italic flex items-center gap-3">
                  <Heart className="text-pink-500 fill-pink-500" size={32} /> My
                  Wishlist
                </h1>
                <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">
                  Products you've saved for later ({items.length})
                </p>
              </div>

              {items.length > 0 && (
                <div className="relative w-full md:w-64">
                  <input
                    type="text"
                    placeholder="Search wishlist..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-full focus:outline-none focus:border-pink-500 dark:focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                  />
                  <Search
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    size={16}
                  />
                </div>
              )}
            </div>

            {items.length === 0 ? (
              <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2.5rem] p-12 text-center shadow-xl shadow-gray-200/20 dark:shadow-none">
                <div className="w-20 h-20 bg-pink-50 dark:bg-pink-900/30 text-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <Heart size={40} />
                </div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2 uppercase tracking-tight italic">
                  Your wishlist is empty
                </h2>
                <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto mb-8 font-medium">
                  Save items you love and buy them when you're ready!
                </p>
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 px-10 py-4 bg-pink-600 hover:bg-pink-700 text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-pink-600/20"
                >
                  Explore Products
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-4 flex flex-col sm:flex-row gap-4 shadow-sm hover:shadow-md transition-shadow group relative"
                  >
                    <Link
                      href={`/product/${item.product.slug}`}
                      className="w-full sm:w-32 h-32 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center relative overflow-hidden shrink-0"
                    >
                      {item.product.image ? (
                        <Image
                          src={item.product.image}
                          alt={item.product.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <ShoppingBag className="text-gray-300" size={32} />
                      )}
                    </Link>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <Link
                          href={`/product/${item.product.slug}`}
                          className="font-bold text-gray-900 dark:text-white line-clamp-2 hover:text-pink-600 dark:hover:text-pink-500 transition-colors"
                        >
                          {item.product.name}
                        </Link>
                        <div className="mt-2 flex items-baseline gap-2">
                          <span className="font-black text-lg text-gray-900 dark:text-white">
                            ?{item.product.specialPrice || item.product.price}
                          </span>
                          {item.product.specialPrice && (
                            <span className="text-sm font-bold text-gray-400 line-through">
                              ?{item.product.price}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-4 sm:mt-0">
                        <button
                          onClick={() => handleAddToCart(item.product)}
                          disabled={item.product.stock <= 0}
                          className="flex-1 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {item.product.stock > 0
                            ? "Add to Cart"
                            : "Out of Stock"}
                        </button>
                        <button
                          onClick={() => removeFromWishlist(item.id)}
                          className="p-2 text-gray-400 hover:text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/20 rounded-xl transition-colors"
                          title="Remove from wishlist"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
