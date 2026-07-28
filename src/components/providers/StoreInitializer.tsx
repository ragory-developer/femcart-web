"use client";

import { useRef } from "react";
import { useNavigationStore } from "@/store/navigationStore";

export default function StoreInitializer({
  navbarItems,
  topNavbarItems,
  bottomNavbarItems,
  footerSections,
  categories,
}: {
  navbarItems?: any[];
  topNavbarItems?: any[];
  bottomNavbarItems?: any[];
  footerSections?: any[];
  categories?: any[];
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
    initialized.current = true;
  }

  return null;
}
