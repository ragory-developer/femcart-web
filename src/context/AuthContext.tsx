"use client";

import { API_URL } from "@/lib/config";
import { Logger } from "@/lib/logger";
import { useRouter } from "next/navigation";
import React, { createContext, useContext, useEffect, useState } from "react";

interface User {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: "ADMIN" | "USER" | "SUPER_ADMIN";
  permissions?: string[];
  isGuest?: boolean;
  gender?: string;
  dateOfBirth?: string;
  avatar?: string;
  notificationPrefs?: any;
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (accessToken: string, refreshToken: string, user: any) => void;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initializeAuth = async () => {
      // Initialize global enterprise telemetry (error trapping)
      Logger.initializeGlobalErrorHandling();

      // Check for existing auth in localStorage (support both key variants)
      const storedUser =
        localStorage.getItem("femcart_user") || localStorage.getItem("user");
      const token =
        localStorage.getItem("femcart_access_token") ||
        localStorage.getItem("token");

      if (
        storedUser &&
        token &&
        storedUser !== "undefined" &&
        storedUser !== "null"
      ) {
        try {
          const parsed = JSON.parse(storedUser);
          // Ensure permissions are parsed if they come as a JSON string from backend
          if (typeof parsed.permissions === "string") {
            try {
              parsed.permissions = JSON.parse(parsed.permissions);
            } catch (e) {
              parsed.permissions = [];
            }
          }

          // Eagerly set user from local storage to prevent layout shift/micro-stutter
          setUser(parsed);
          setLoading(false); // UI can render immediately

          // Securely verify token with backend in background
          fetch(`${API_URL}/api/users/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          })
            .then(async (res) => {
              const data = await res.json();
              if (!res.ok || !data.success) {
                // Clear both key variants if invalid
                localStorage.removeItem("femcart_access_token");
                localStorage.removeItem("femcart_refresh_token");
                localStorage.removeItem("femcart_user");
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                setUser(null);
              }
            })
            .catch((e) => {
              console.error("Failed to verify token in background", e);
              // We keep the user logged in locally if offline or network failure,
              // only log out on 401/403.
            });
        } catch (e) {
          console.error("Failed to parse user data", e);
          setUser(null);
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = (accessToken: string, refreshToken: string, userData: any) => {
    // Standardize permissions before storing
    if (typeof userData.permissions === "string") {
      try {
        userData.permissions = JSON.parse(userData.permissions);
      } catch (error) {
        Logger.warn(
          "Failed to parse user permissions JSON during login",
          error,
          "AuthContext",
        );
        userData.permissions = [];
      }
    }

    // Write to both key variants so all parts of the app can read the token
    localStorage.setItem("femcart_access_token", accessToken);
    localStorage.setItem("femcart_refresh_token", refreshToken);
    localStorage.setItem("femcart_user", JSON.stringify(userData));
    // Legacy keys used by authStore, checkout, address form, etc.
    localStorage.setItem("token", accessToken);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    // Clear both key variants
    localStorage.removeItem("femcart_access_token");
    localStorage.removeItem("femcart_refresh_token");
    localStorage.removeItem("femcart_user");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    router.replace("/login");
  };

  const refreshProfile = async () => {
    const token =
      localStorage.getItem("femcart_access_token") ||
      localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/api/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (res.ok && data.success) {
        const userData = data.data;
        if (typeof userData.permissions === "string") {
          try {
            userData.permissions = JSON.parse(userData.permissions);
          } catch (error) {
            Logger.warn(
              "Failed to parse user permissions JSON during profile refresh",
              error,
              "AuthContext",
            );
            userData.permissions = [];
          }
        }
        localStorage.setItem("femcart_user", JSON.stringify(userData));
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
      }
    } catch (e) {
      console.error("Failed to refresh profile", e);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
