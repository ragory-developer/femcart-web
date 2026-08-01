import { fetchWithTimeout } from "@/lib/fetchWithTimeout";
import { API_URL } from "@/lib/config";
import parse, { attributesToProps, Element, Text } from "html-react-parser";
import type { Metadata } from "next";
import { Outfit, Manrope } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  weight: ["400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
  preload: true,
});
const manrope = Manrope({
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title:
    "Femcart — Premium Women's Intimate Apparel & Lifestyle E-commerce Platform",
  description:
    "Femcart is a premium online shopping platform dedicated to women's intimate apparel, shapewear, activewear, and essential lifestyle products.",
};

import NavigationProvider from "@/components/providers/NavigationProvider";
import SettingsProvider from "@/components/providers/SettingsProvider";
import { ReactQueryProvider } from "@/components/providers/ReactQueryProvider";
import Tracking from "@/components/Tracking";
import { AuthProvider } from "@/context/AuthContext";
import { Suspense } from "react";

import { Toaster } from "sonner";
import NextTopLoader from "nextjs-toploader";
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let headerCode = "";
  let bodyCode = "";
  let footerCode = "";
  let globalSettings = null;

  try {
    const res = await fetchWithTimeout(`${API_URL}/api/global-settings`, {
      next: { revalidate: 60 },
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        globalSettings = json.data;
        headerCode = json.data.header_code || "";
        bodyCode = json.data.body_code || "";
        footerCode = json.data.footer_code || "";
      }
    }
  } catch (err: any) {
    if (err?.cause?.code !== "ECONNREFUSED" && err?.name !== "AbortError") {
      console.error("Failed to fetch global settings in layout:", err);
    } else {
      console.warn("Backend API unreachable at /api/global-settings (using fallback layout settings)");
    }
  }

  const getParseOptions = (isHead: boolean = false) => ({
    replace: (domNode: any) => {
      // Discard pure text nodes in the <head> to prevent the browser from closing it prematurely
      if (isHead && domNode.type === "text") {
        const text = (domNode as Text).data?.trim();
        if (text) return <></>;
      }

      if (domNode instanceof Element && domNode.name === "script") {
        const props = attributesToProps(domNode.attribs);
        const scriptContent =
          domNode.children?.[0]?.type === "text"
            ? (domNode.children[0] as Text).data
            : "";
        if (scriptContent) {
          return (
            <script
              {...props}
              dangerouslySetInnerHTML={{ __html: scriptContent }}
            />
          );
        }
        return <script {...props} />;
      }

      if (domNode instanceof Element && domNode.name === "style") {
        const props = attributesToProps(domNode.attribs);
        const styleContent =
          domNode.children?.[0]?.type === "text"
            ? (domNode.children[0] as Text).data
            : "";
        if (styleContent) {
          return (
            <style
              {...props}
              dangerouslySetInnerHTML={{ __html: styleContent }}
            />
          );
        }
        return <style {...props} />;
      }
    },
  });

  return (
    <html lang="en">
      <head>
        {headerCode ? parse(headerCode, getParseOptions(true)) : null}
      </head>
      <body
        className={`${manrope.variable} ${outfit.variable} antialiased selection:bg-pink-500/30 min-h-[100dvh] flex flex-col font-sans overflow-x-clip pt-[env(safe-area-inset-top)]`}
      >
        <NextTopLoader color="#ff0798ff" showSpinner={false} />
        <ReactQueryProvider>
          <AuthProvider>
            <SettingsProvider initialSettings={globalSettings}>
              <NavigationProvider>
                {bodyCode ? (
                  <div dangerouslySetInnerHTML={{ __html: bodyCode }} />
                ) : null}
                {children}
                <Toaster position="top-center" />
                <Suspense fallback={null}>
                  <Tracking />
                </Suspense>
                {footerCode ? (
                  <div dangerouslySetInnerHTML={{ __html: footerCode }} />
                ) : null}
              </NavigationProvider>
            </SettingsProvider>
          </AuthProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
