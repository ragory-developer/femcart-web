"use client";

import FooterManager from "@/components/admin/navigation/FooterManager";
import NavbarManager from "@/components/admin/navigation/NavbarManager";
import { useState } from "react";

export default function NavigationPage() {
  const [activeTab, setActiveTab] = useState<"navbar" | "footer">("navbar");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Navigation Management
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={() => setActiveTab("navbar")}
          className={`pb-4 px-2 font-medium text-sm transition-colors border-b-2 ${
            activeTab === "navbar"
              ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          Navbar Items
        </button>
        <button
          onClick={() => setActiveTab("footer")}
          className={`pb-4 px-2 font-medium text-sm transition-colors border-b-2 ${
            activeTab === "footer"
              ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          Footer Sections
        </button>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
        {activeTab === "navbar" && <NavbarManager />}
        {activeTab === "footer" && <FooterManager />}
      </div>
    </div>
  );
}
