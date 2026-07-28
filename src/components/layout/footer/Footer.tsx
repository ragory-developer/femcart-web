"use client";

import React, { useEffect, useState } from "react";
import { useSettingsStore } from "@/store/settingsStore";
import { useShallow } from "zustand/react/shallow";
import FooterOriginal from "../original/FooterOriginal";
import FooterAlpha from "../Footer";

export default function Footer() {
  const settings = useSettingsStore(useShallow((state) => state.settings));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Prevent hydration mismatch
    return <FooterOriginal />;
  }

  switch (settings.layout_template) {
    case "alpha":
      return <FooterAlpha />;
    case "beta":
    case "gamma":
      // Fallback for now
      return <FooterOriginal />;
    case "original":
    default:
      return <FooterOriginal />;
  }
}
