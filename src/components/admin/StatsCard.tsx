"use client";

import { TrendingDown, TrendingUp } from "lucide-react";
import { ReactNode } from "react";

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  trend?: { value: string; positive: boolean };
  color?: string; // e.g. "emerald", "blue", "purple", "rose"
}

const colorMap: Record<string, { bg: string; text: string; iconBg: string }> = {
  emerald: {
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    text: "text-emerald-600 dark:text-emerald-400",
    iconBg: "bg-emerald-100 dark:bg-emerald-900/40",
  },
  blue: {
    bg: "bg-blue-50 dark:bg-blue-900/20",
    text: "text-blue-600 dark:text-blue-400",
    iconBg: "bg-blue-100 dark:bg-blue-900/40",
  },
  purple: {
    bg: "bg-purple-50 dark:bg-purple-900/20",
    text: "text-purple-600 dark:text-purple-400",
    iconBg: "bg-purple-100 dark:bg-purple-900/40",
  },
  rose: {
    bg: "bg-rose-50 dark:bg-rose-900/20",
    text: "text-rose-600 dark:text-rose-400",
    iconBg: "bg-rose-100 dark:bg-rose-900/40",
  },
  amber: {
    bg: "bg-amber-50 dark:bg-amber-900/20",
    text: "text-amber-600 dark:text-amber-400",
    iconBg: "bg-amber-100 dark:bg-amber-900/40",
  },
};

export default function StatsCard({
  label,
  value,
  icon,
  trend,
  color = "emerald",
}: StatsCardProps) {
  const colors = colorMap[color] || colorMap.emerald;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-[clamp(1rem,3vw,1.5rem)] p-[clamp(1rem,3vw,1.5rem)] shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-[clamp(2.5rem,6vw,3rem)] h-[clamp(2.5rem,6vw,3rem)] rounded-[clamp(0.75rem,2vw,1rem)] flex items-center justify-center ${colors.iconBg} ${colors.text}`}
        >
          {icon}
        </div>
        {trend && (
          <div
            className={`flex items-center gap-1 text-[clamp(0.65rem,1.5vw,0.75rem)] font-bold px-2 py-1 rounded-full ${
              trend.positive
                ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                : "bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400"
            }`}
          >
            {trend.positive ? (
              <TrendingUp size={12} />
            ) : (
              <TrendingDown size={12} />
            )}
            {trend.value}
          </div>
        )}
      </div>
      <p className="text-[clamp(1.5rem,5vw,2rem)] font-black text-gray-900 dark:text-white mb-1">
        {value}
      </p>
      <p className="text-[clamp(0.875rem,2vw,1rem)] text-gray-500 dark:text-gray-400 font-medium">
        {label}
      </p>
    </div>
  );
}
