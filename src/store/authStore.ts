import { API_URL } from "@/lib/config";
import { Logger } from "@/lib/logger";
import { create } from "zustand";

export interface User {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  isGuest?: boolean;
  avatar?: string;
  notificationPrefs?: any;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  fetchUser: () => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  loading: true,

  fetchUser: async () => {
    try {
      const token =
        localStorage.getItem("femcart_access_token") ||
        localStorage.getItem("token");
      const userStr =
        localStorage.getItem("femcart_user") || localStorage.getItem("user");

      if (!token) {
        set({ user: null, isAuthenticated: false, loading: false });
        return;
      }

      if (userStr && userStr !== "undefined" && userStr !== "null") {
        try {
          const parsedUser = JSON.parse(userStr);
          set({ user: parsedUser, isAuthenticated: true, loading: false });
        } catch (e) {
          console.error("Failed to parse user string in authStore", e);
          localStorage.removeItem("femcart_user");
          localStorage.removeItem("user");
        }
      }

      // Try fetching active profile if endpoint exists, otherwise silently fail and rely on token/cache
      try {
        const res = await fetch(`${API_URL}/api/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success && data.data) {
          set({ user: data.data, isAuthenticated: true });
          localStorage.setItem("user", JSON.stringify(data.data));
        }
      } catch (error) {
        Logger.warn("Profile sync failed (non-critical)", error, "AuthStore");
      }
    } catch (error) {
      Logger.error(
        "Critical failure during fetchUser initialization",
        error,
        "AuthStore",
      );
      set({ loading: false });
    }
  },

  logout: () => {
    localStorage.removeItem("femcart_access_token");
    localStorage.removeItem("femcart_refresh_token");
    localStorage.removeItem("femcart_user");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({ user: null, isAuthenticated: false });
  },

  setUser: (user: User) => {
    localStorage.setItem("user", JSON.stringify(user));
    set({ user, isAuthenticated: true });
  },
}));
