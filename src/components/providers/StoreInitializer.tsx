"use client";

import { useRef } from "react";
import { useNavigationStore } from "@/store/navigationStore";

export default function StoreInitializer({
  navbarItems,
  topNavbarItems,
  bottomNavbarItems,
  footerSections,
  categories,
  brands,
}: {
  navbarItems?: any[];
  topNavbarItems?: any[];
  bottomNavbarItems?: any[];
  footerSections?: any[];
  categories?: any[];
  brands?: any[];
}) {
  const initialized = useRef(false);

  if (!initialized.current) {
    if (navbarItems) {
      useNavigationStore.setState({
        navbarItems,
        topNavbarItems,
        bottomNavbarItems,
      });
    }
    if (footerSections) {
      useNavigationStore.setState({ footerSections });
    }
    if (categories) {
      useNavigationStore.setState({ categories });
    }
    if (brands) {
      useNavigationStore.setState({ brands });
    }
    initialized.current = true;
  }

  return null;
}
