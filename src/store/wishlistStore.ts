import { API_URL } from "@/lib/config";
import { create } from "zustand";

interface WishlistState {
  items: string[]; // Array of Product IDs
  isLoading: boolean;
  fetchWishlist: () => Promise<void>;
  toggleWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],
  isLoading: false,

  fetchWishlist: async () => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("femcart_access_token") ||
          localStorage.getItem("token")
        : null;
    if (!token) return;

    set({ isLoading: true });
    try {
      const res = await fetch(`${API_URL}/api/wishlist`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && data.data) {
        const productIds = data.data.map((item: any) => item.productId);
        set({ items: productIds });
      }
    } catch (error) {
      console.error("Failed to fetch wishlist:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  toggleWishlist: async (productId: string) => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("femcart_access_token") ||
          localStorage.getItem("token")
        : null;
    const current = get().items;
    const exists = current.includes(productId);

    // Optimistic UI update
    set({
      items: exists
        ? current.filter((id) => id !== productId)
        : [...current, productId],
    });

    if (!token) {
      return; // Can't persist without token
    }

    try {
      if (exists) {
        const res = await fetch(`${API_URL}/api/wishlist/${productId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to remove from wishlist");
      } else {
        const res = await fetch(`${API_URL}/api/wishlist`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ productId }),
        });
        if (!res.ok) throw new Error("Failed to add to wishlist");
      }
    } catch (error) {
      console.error("Wishlist toggle error:", error);
      // Revert optimistic update on failure
      set({ items: current });
    }
  },

  isInWishlist: (productId: string) => {
    return get().items.includes(productId);
  },

  clearWishlist: () => {
    set({ items: [] });
  },
}));
