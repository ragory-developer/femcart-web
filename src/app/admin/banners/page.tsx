import BannerManager from "@/components/admin/banners/BannerManager";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Banner Manager | Admin Panel",
};

export default function BannersPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Banner & Promotions Manager
        </h1>
      </div>
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
        <BannerManager />
      </div>
    </div>
  );
}
