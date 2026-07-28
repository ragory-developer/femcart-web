"use client";

import { motion } from "framer-motion";
import { ReactNode, useState } from "react";

export interface Tab {
  id: string;
  label: string;
  icon: ReactNode;
  content: ReactNode;
}

interface AdminTabsProps {
  tabs: Tab[];
  defaultTab?: string;
}

export default function AdminTabs({ tabs, defaultTab }: AdminTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  return (
    <div className="flex flex-col lg:flex-row gap-[clamp(1rem,3vw,1.5rem)] min-h-[600px]">
      {/* Vertical Tab Nav (sidebar style) */}
      <div className="lg:w-[clamp(200px,20vw,250px)] shrink-0">
        <nav className="bg-white dark:bg-gray-800 rounded-[clamp(1rem,3vw,1.5rem)] border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
          {tabs.map((tab, idx) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-[clamp(1rem,3vw,1.5rem)] py-[clamp(0.75rem,2vw,1rem)] min-h-[44px] text-left text-[clamp(0.875rem,2vw,1rem)] font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-l-4 border-emerald-500"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-750 border-l-4 border-transparent"
              } ${idx > 0 ? "border-t border-gray-100 dark:border-gray-700" : ""}`}
            >
              <span className="shrink-0">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="flex-1 min-w-0">
        {tabs.map((tab) =>
          activeTab === tab.id ? (
            <motion.div
              key={tab.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
            >
              {tab.content}
            </motion.div>
          ) : null,
        )}
      </div>
    </div>
  );
}
