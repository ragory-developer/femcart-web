import type { NextConfig } from "next";

// Parse the backend URL from env to dynamically set allowed image hostnames
const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5006";
const parsedApiUrl = new URL(apiUrl);

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    dangerouslyAllowSVG: true,
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      {
        protocol: parsedApiUrl.protocol.replace(":", "") as "http" | "https",
        hostname: parsedApiUrl.hostname,
        port: parsedApiUrl.port || "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "loremflickr.com",
      },
      {
        protocol: "https",
        hostname: "t3.gstatic.com",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "https",
        hostname: "chaldn.com",
      },
      {
        protocol: "https",
        hostname: "images.othoba.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "othoba.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cityfemcart.ragory.tech",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.amazonaws.com",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "**.amazonaws.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.amazonaws.com",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "*.amazonaws.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "agorastorageacount.blob.core.windows.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.blob.core.windows.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "pngimg.com",
      },
      {
        protocol: "https",
        hostname: "logo.clearbit.com",
      },
      {
        protocol: "https",
        hostname: "ui-avatars.com",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "femecart.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
