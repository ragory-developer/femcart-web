import { API_URL } from "@/lib/config";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string; // product id or variant id
  productId?: string;
  variantId?: string;
  variantName?: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  slug: string;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  syncLocalCartToBackend: () => Promise<void>;
  fetchBackendCart: () => Promise<void>;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => {
      let syncTimeout: NodeJS.Timeout | null = null;

      return {
        items: [],
        isOpen: false,
        openCart: () => set({ isOpen: true }),
        closeCart: () => set({ isOpen: false }),
        toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
        syncLocalCartToBackend: async () => {
          if (syncTimeout) clearTimeout(syncTimeout);

          syncTimeout = setTimeout(async () => {
            const token =
              typeof window !== "undefined"
                ? localStorage.getItem("femcart_access_token") ||
                  localStorage.getItem("token")
                : null;
            if (!token) return;

            try {
              const items = get().items.map((i) => ({
                productId: i.productId || i.id,
                variantId: i.variantId,
                quantity: i.quantity,
              }));
              await fetch(`${API_URL}/api/cart/sync`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ items }),
              });
            } catch (error) {
              console.error("Failed to sync cart:", error);
            }
          }, 1500); // 1.5s debounce
        },
        fetchBackendCart: async () => {
          const token =
            typeof window !== "undefined"
              ? localStorage.getItem("femcart_access_token") ||
                localStorage.getItem("token")
              : null;
          if (!token) return;

          try {
            const res = await fetch(`${API_URL}/api/cart`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success && data.data && data.data.items) {
              // Transform backend items to local format
              const backendItems = data.data.items.map((i: any) => ({
                id: i.variantId || i.productId,
                productId: i.productId,
                variantId: i.variantId,
                name:
                  i.variantId && i.variant?.attributes
                    ? `${i.product?.name} - ${i.variant.attributes.map((a: any) => a.value).join(" / ")}`
                    : i.product?.name || "Unknown",
                price: i.variantId
                  ? i.variant?.specialPrice || i.variant?.price || 0
                  : i.product?.specialPrice || i.product?.price || 0,
                image: i.variantId
                  ? i.variant?.image || i.product?.image || ""
                  : i.product?.image || "",
                quantity: i.quantity,
                slug: i.product?.slug || "",
              }));

              // Only overwrite if backend has items (otherwise we might overwrite a local cart they just built before logging in)
              if (backendItems.length > 0) {
                set({ items: backendItems });
              }
            }
          } catch (error) {
            console.error("Failed to fetch backend cart:", error);
          }
        },
        addToCart: (item) => {
          set((state) => {
            const existing = state.items.find((i) => i.id === item.id);
            let newItems;
            if (existing) {
              newItems = state.items.map((i) =>
                i.id === item.id
                  ? { ...i, quantity: (i.quantity || 1) + (item.quantity || 1) }
                  : i,
              );
            } else {
              newItems = [
                ...state.items,
                { ...item, quantity: item.quantity || 1 },
              ];
            }
            return { items: newItems };
          });
          get().syncLocalCartToBackend();
        },
        removeFromCart: (id) => {
          set((state) => ({ items: state.items.filter((i) => i.id !== id) }));
          get().syncLocalCartToBackend();
        },
        updateQuantity: (id, quantity) => {
          set((state) => ({
            items: state.items.map((i) =>
              i.id === id ? { ...i, quantity } : i,
            ),
          }));
          get().syncLocalCartToBackend();
        },
        clearCart: () => {
          set({ items: [] });
          get().syncLocalCartToBackend();
        },
        getCartTotal: () => {
          return get().items.reduce(
            (total, item) => total + item.price * (item.quantity || 1),
            0,
          );
        },
        getCartCount: () => {
          return get().items.reduce(
            (count, item) => count + (item.quantity || 1),
            0,
          );
        },
      };
    },
    {
      name: "femcart-storage",
    },
  ),
);
