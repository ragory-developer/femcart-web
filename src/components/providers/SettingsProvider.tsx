"use client";

import { useSettingsStore } from "@/store/settingsStore";
import { useEffect, useRef } from "react";

export default function SettingsProvider({
  children,
  initialSettings,
}: {
  children: React.ReactNode;
  initialSettings?: any;
}) {
  const initialized = useRef(false);
  const fetchSettings = useSettingsStore((state) => state.fetchSettings);

  if (!initialized.current && initialSettings) {
    const currentSettings = useSettingsStore.getState().settings;
    useSettingsStore.setState({
      settings: { ...currentSettings, ...initialSettings },
      loading: false,
    });
    initialized.current = true;
  }

  const settings = useSettingsStore((state) => state.settings);

  useEffect(() => {
    // Always fetch fresh settings on the client to ensure we have the latest (e.g. store_logo)
    // This bypasses the Next.js 60s SSR cache in layout.tsx.
    fetchSettings();
  }, [fetchSettings]);

  // Compute dynamic theme CSS variables
  let themeStyles = "";
  if (settings.theme_preset === "clean-green") {
    themeStyles = `
      :root {
        --color-brand-green: #00B207;
        --color-brand-green-hover: #009906;
        --color-brand-green-light: #E6F7E6;
        --color-brand-green-dark: #008005;
        --color-background: #FFFFFF;
        --color-surface: #FFFFFF;
        --color-olive: var(--color-brand-green);
        --color-forest: var(--color-brand-green);
        --color-lime: var(--color-brand-green);
        --color-apple: var(--color-brand-green);
      }
    `;
  } else if (
    settings.theme_preset === "custom" &&
    settings.theme_color_primary
  ) {
    const primary = settings.theme_color_primary;
    themeStyles = `
      :root {
        --color-olive: ${primary};
        --color-forest: ${primary};
        --color-lime: ${primary};
        --color-apple: ${primary};
      }
    `;
  }

  return (
    <>
      {themeStyles && (
        <style dangerouslySetInnerHTML={{ __html: themeStyles }} />
      )}
      {children}
    </>
  );
}
