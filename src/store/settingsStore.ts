import { API_URL } from "@/lib/config";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SettingsState {
  settings: {
    permalink_structure?: "flat" | "product";
    store_name?: string;
    productCardVariant?: string;
    productCardRadius?: string;
    productCardShowBadge?: boolean;
    productCardShowRating?: boolean;
    productCardShowAddToCart?: boolean;
    productCardBadgeStyle?: string;
    theme_preset?: "original" | "clean-green" | "custom";
    theme_color_primary?: string;
    layout_template?: "original" | "alpha" | "beta" | "gamma";
    deliveryLocation?: string;
    deliveryLat?: number;
    deliveryLng?: number;
    [key: string]: any;
  };
  loading: boolean;
  setSettings: (settings: any) => void;
  fetchSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      settings: {
        permalink_structure: "flat", // Default
        products_per_row: "4",
        store_name: "",
        productCardVariant: "classic",
        productCardRadius: "3xl",
        productCardShowBadge: true,
        productCardShowRating: true,
        productCardShowAddToCart: true,
        productCardBadgeStyle: "pill",
        theme_preset: "original",
        theme_color_primary: "#00B207",
        layout_template: "original",
      },
      loading: true,
      setSettings: async (settingsToUpdate) => {
        const currentSettings = get().settings;
        const newSettings = { ...currentSettings, ...settingsToUpdate };
        set({ settings: newSettings });

        try {
          const token =
            typeof window !== "undefined"
              ? localStorage.getItem("femcart_access_token") ||
                localStorage.getItem("token")
              : null;
          if (token) {
            await fetch(`${API_URL}/api/global-settings`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ settings: settingsToUpdate }),
            });
          }
        } catch (e) {
          console.error("Failed to save settings to database:", e);
        }
      },
      fetchSettings: async () => {
        set({ loading: true });
        try {
          const res = await fetch(`${API_URL}/api/global-settings`, {
            cache: "no-store",
          });
          const json = await res.json();
          if (json.success) {
            // Convert string booleans to actual booleans for specific keys
            const parsedSettings = { ...json.data };
            const booleanKeys = [
              "productCardShowBadge",
              "productCardShowRating",
              "productCardShowAddToCart",
            ];
            booleanKeys.forEach((key) => {
              if (parsedSettings[key] !== undefined) {
                parsedSettings[key] =
                  parsedSettings[key] === "true" ||
                  parsedSettings[key] === true;
              }
            });
            set({ settings: { ...get().settings, ...parsedSettings } });
          }
        } catch (e) {
          console.error("Failed to fetch settings:", e);
        } finally {
          set({ loading: false });
        }
      },
    }),
    {
      name: "femcart-settings",
      partialize: (state) => ({ settings: state.settings }),
    },
  ),
);
