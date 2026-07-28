"use client";

import ConnectionTab from "@/components/admin/wp-import/ConnectionTab";
import ImportProcessTab from "@/components/admin/wp-import/ImportProcessTab";
import PreviewTab from "@/components/admin/wp-import/PreviewTab";
import { useState } from "react";

export default function WpImportPage() {
  const [activeTab, setActiveTab] = useState("connection");

  const tabs = [
    { id: "connection", label: "Connection Settings" },
    { id: "preview", label: "Preview Products" },
    { id: "import", label: "Import Status & Logs" },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-500">
          WordPress Import
        </h1>
        <p className="text-gray-500 mt-1">
          Connect your WooCommerce store and import products directly.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-100 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? "text-emerald-600 border-b-2 border-emerald-500 bg-emerald-50/50"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === "connection" && <ConnectionTab />}
          {activeTab === "preview" && <PreviewTab />}
          {activeTab === "import" && <ImportProcessTab />}
        </div>
      </div>
    </div>
  );
}
