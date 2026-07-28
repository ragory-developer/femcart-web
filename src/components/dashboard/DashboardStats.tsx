"use client";

import { motion } from "framer-motion";
import { Heart, ShoppingBag, Sparkles } from "lucide-react";

interface StatsProps {
  rewardPoints: number;
  wishlistCount: number;
  orderCount: number;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 24 },
  },
};

export default function DashboardStats({
  rewardPoints,
  wishlistCount,
  orderCount,
}: StatsProps) {
  const stats = [
    {
      id: "rewards",
      label: "Reward Points",
      value: rewardPoints,
      sublabel: "Available to redeem",
      icon: Sparkles,
      gradient: "from-amber-400 to-orange-500",
      bgSubtle: "bg-orange-50 dark:bg-orange-500/10",
      accent: "text-orange-600 dark:text-orange-400",
    },
    {
      id: "wishlist",
      label: "Wishlist Items",
      value: wishlistCount,
      sublabel: "Saved for later",
      icon: Heart,
      gradient: "from-rose-400 to-pink-500",
      bgSubtle: "bg-pink-50 dark:bg-pink-500/10",
      accent: "text-pink-600 dark:text-pink-400",
    },
    {
      id: "orders",
      label: "Total Orders",
      value: orderCount,
      sublabel: "Lifetime purchases",
      icon: ShoppingBag,
      gradient: "from-emerald-400 to-teal-500",
      bgSubtle: "bg-teal-50 dark:bg-teal-500/10",
      accent: "text-teal-600 dark:text-teal-400",
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-3 gap-[clamp(1rem,3vw,1.5rem)]"
    >
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.id}
            variants={itemVariants}
            whileHover={{ y: -4, scale: 1.01 }}
            className="group relative bg-white dark:bg-gray-900/60 backdrop-blur-xl p-[clamp(1.25rem,3vw,1.75rem)] rounded-[clamp(1.25rem,3vw,1.5rem)] border border-gray-200/60 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
          >
            {/* Top ambient glow */}
            <div
              className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.gradient} opacity-70`}
            />

            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-start justify-between mb-6">
                <div
                  className={`w-[clamp(3rem,8vw,3.5rem)] h-[clamp(3rem,8vw,3.5rem)] rounded-[clamp(0.75rem,2vw,1rem)] flex items-center justify-center ${stat.bgSubtle} border border-white/50 dark:border-white/5 shadow-inner transition-transform duration-500 group-hover:scale-110`}
                >
                  <Icon size={26} className={stat.accent} strokeWidth={2} />
                </div>
                <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800/80 px-2.5 py-1 rounded-full border border-gray-100 dark:border-gray-700/50">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Live
                  </span>
                </div>
              </div>

              <div className="mt-auto">
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="flex items-baseline gap-2 mb-1"
                >
                  <h3 className="text-[clamp(2rem,6vw,3rem)] font-black text-gray-900 dark:text-white tracking-tight">
                    {stat.value.toLocaleString()}
                  </h3>
                </motion.div>
                <p className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-1">
                  {stat.label}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {stat.sublabel}
                </p>
              </div>
            </div>

            {/* Dynamic abstract background shapes */}
            <div
              className={`absolute -right-8 -bottom-8 w-40 h-40 bg-gradient-to-br ${stat.gradient} rounded-full blur-[3rem] opacity-0 group-hover:opacity-10 dark:group-hover:opacity-20 transition-opacity duration-500 pointer-events-none`}
            />
            <div className="absolute right-[-5%] top-[-5%] opacity-[0.02] dark:opacity-[0.03] pointer-events-none transform group-hover:rotate-12 transition-transform duration-700">
              <Icon size={120} />
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
