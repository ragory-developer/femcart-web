import { Info } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function ProductBuilderPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 pt-12">
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-8 text-center flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-6">
          <Info size={32} />
        </div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-4">
          Product Builder Deprecated
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto font-medium">
          The drag-and-drop Product Template builder has been permanently
          retired. The storefront is now secured to use the high-performance,
          premium Alpha design system directly via code.
        </p>
        <div className="flex gap-4">
          <Link
            href="/admin/settings"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-sm transition-colors"
          >
            Go to Global Settings
          </Link>
          <Link
            href="/admin"
            className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white px-6 py-2.5 rounded-xl font-bold shadow-sm border border-gray-200 dark:border-gray-700 transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
