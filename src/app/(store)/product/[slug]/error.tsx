"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCw, AlertTriangle, Home } from "lucide-react";

export default function ProductSlugPageError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Product page error boundary caught error:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] bg-white dark:bg-gray-950 flex flex-col items-center justify-center px-4 py-12 text-center">
      <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/50 p-4 rounded-full mb-6">
        <AlertTriangle className="w-10 h-10 text-rose-500" />
      </div>

      <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 dark:text-white mb-2">
        Unable to Load Product
      </h1>

      <p className="text-gray-600 dark:text-gray-400 max-w-md text-sm sm:text-base mb-8">
        We ran into a temporary connection issue. Please try reloading the product page.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-xs">
        <button
          onClick={() => reset()}
          className="w-full flex items-center justify-center gap-2 bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md active:scale-95 text-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>

        <Link
          href="/"
          className="w-full flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold py-3 px-6 rounded-xl transition-all text-sm"
        >
          <Home className="w-4 h-4" />
          Go to Home
        </Link>
      </div>
    </div>
  );
}
