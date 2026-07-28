import React from "react";
import HomeView from "@/components/home-ui/HomeView";
import { fetchWithTimeout } from "@/lib/fetchWithTimeout";
import { API_URL } from "@/lib/config";

async function getGlobalSettings() {
  try {
    const res = await fetchWithTimeout(`${API_URL}/api/global-settings`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return {};
    const json = await res.json();
    return json.data || {};
  } catch (error) {
    console.error("Failed to fetch global settings:", error);
    return {};
  }
}

async function fetchCategories() {
  try {
    const res = await fetchWithTimeout(`${API_URL}/api/categories?limit=12`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch (e) {
    return [];
  }
}

async function fetchProducts() {
  try {
    const res = await fetchWithTimeout(
      `${API_URL}/api/products?limit=50&status=ACTIVE`,
      { next: { revalidate: 60 } },
    );
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch (e) {
    return [];
  }
}

export default async function Home() {
  const [categories, globalSettings, products] = await Promise.all([
    fetchCategories(),
    getGlobalSettings(),
    fetchProducts(),
  ]);

  return (
    <HomeView
      categories={categories}
      globalSettings={globalSettings}
      products={products}
    />
  );
}
