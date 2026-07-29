"use client";

import ConnectionTab from "@/components/admin/shopify-import/ConnectionTab";
import ImportProcessTab from "@/components/admin/shopify-import/ImportProcessTab";
import PreviewTab from "@/components/admin/shopify-import/PreviewTab";
import { useState } from "react";
import { motion } from "framer-motion";
import { Link2, LayoutGrid, Terminal } from "lucide-react";

export default function ShopifyImportPage() {
  const [activeTab, setActiveTab] = useState("connection");

  const tabs = [
    { id: "connection", label: "Connection Settings", icon: Link2 },
    { id: "preview", label: "Preview Products", icon: LayoutGrid },
    { id: "import", label: "Import Status & Logs", icon: Terminal },
  ];

  return (
    <div className="p-6 md:p-10 max-w-[1400px] mx-auto space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-gray-900 flex items-center gap-3">
          Shopify Import Center
        </h1>
        <p className="text-gray-500 mt-2 text-sm md:text-base font-medium">
          Connect your Shopify store using an Admin API Token to seamlessly synchronize products and orders.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200/60 shadow-xl shadow-gray-200/20 overflow-hidden">
        {/* Animated Tabs */}
        <div className="flex overflow-x-auto border-b border-gray-100 p-2 gap-2 bg-gray-50/50">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-5 py-3 text-sm font-semibold rounded-xl flex items-center gap-2 transition-colors whitespace-nowrap outline-none ${
                  isActive ? "text-emerald-700" : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="shopify-active-tab"
                    className="absolute inset-0 bg-white rounded-xl shadow-sm border border-gray-200/50"
                    initial={false}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <Icon size={16} className={isActive ? "text-emerald-600" : "text-gray-400"} />
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="p-6 md:p-8 bg-gray-50/30">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "connection" && <ConnectionTab />}
            {activeTab === "preview" && <PreviewTab />}
            {activeTab === "import" && <ImportProcessTab />}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
