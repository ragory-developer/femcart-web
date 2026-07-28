"use client";

import React, { useEffect, useState } from "react";
import { useSettingsStore } from "@/store/settingsStore";
import NavbarOriginal from "../original/NavbarOriginal";
import NavbarAlpha from "../Navbar";

export default function Navbar() {
  const settings = useSettingsStore((state) => state.settings);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Prevent hydration mismatch by rendering a generic stub or returning null
    // But since layout shouldn't flash, returning Original is usually safest if the server rendered it.
    return <NavbarOriginal />;
  }

  switch (settings.layout_template) {
    case "alpha":
      return <NavbarAlpha />;
    case "beta":
    case "gamma":
      // Fallback for now until Beta/Gamma variants are created
      return <NavbarOriginal />;
    case "original":
    default:
      return <NavbarOriginal />;
  }
}
