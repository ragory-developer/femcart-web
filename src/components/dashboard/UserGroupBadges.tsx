"use client";

import { CheckCircle2, Crown, Lock, Medal, Shield } from "lucide-react";

interface Group {
  name: string;
  threshold: number;
  icon: string;
  color: string;
}

interface UserGroupBadgesProps {
  currentGroup: string;
  purchaseCount: number;
  groups: Group[];
}

export default function UserGroupBadges({
  currentGroup,
  purchaseCount,
  groups,
}: UserGroupBadgesProps) {
  const getIcon = (iconName: string, colorClass: string) => {
    switch (iconName) {
      case "medal":
        return <Medal className={colorClass} size={32} />;
      case "shield":
        return <Shield className={colorClass} size={32} />;
      case "crown":
        return <Crown className={colorClass} size={32} />;
      default:
        return <Shield className={colorClass} size={32} />;
    }
  };

  const getTierMetadata = (name: string) => {
    switch (name) {
      case "Bronze Member":
        return {
          color: "from-orange-400 to-orange-600",
          iconColor: "text-orange-500",
          bg: "bg-orange-50",
          perks: "Entry Level Membership",
        };
      case "Silver Member":
        return {
          color: "from-slate-300 to-slate-500",
          iconColor: "text-slate-400",
          bg: "bg-slate-50",
          perks: "Silver Rewards Program",
        };
      case "Gold Member":
        return {
          color: "from-yellow-400 to-yellow-600",
          iconColor: "text-yellow-500",
          bg: "bg-yellow-50",
          perks: "Priority Delivery & Discounts",
        };
      case "Platinum Member":
        return {
          color: "from-blue-400 to-blue-600",
          iconColor: "text-blue-500",
          bg: "bg-blue-50",
          perks: "Free Delivery & VIP Support",
        };
      default:
        return {
          color: "from-gray-400 to-gray-600",
          iconColor: "text-gray-500",
          bg: "bg-gray-50",
          perks: "Member perks",
        };
    }
  };

  return (
    <div className="mt-[clamp(2rem,6vw,4rem)] relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-[clamp(1.5rem,4vw,2.5rem)] gap-4">
        <div>
          <h2 className="text-[clamp(1.5rem,5vw,2rem)] font-black text-gray-900 dark:text-white tracking-tight uppercase italic">
            Membership Journey
          </h2>
          <p className="text-gray-500 dark:text-gray-400 font-medium text-[clamp(0.875rem,2vw,1rem)] mt-1">
            Unlock premium benefits as you shop more
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white dark:bg-gray-900 px-[clamp(0.75rem,2vw,1rem)] py-[clamp(0.5rem,1.5vw,0.75rem)] min-h-[44px] rounded-full border border-gray-100 dark:border-gray-800 shadow-sm w-fit">
          <span className="text-[clamp(0.875rem,2vw,1rem)] font-black text-blue-600">
            {purchaseCount}
          </span>
          <span className="text-[clamp(0.65rem,1.5vw,0.75rem)] font-bold text-gray-500 uppercase tracking-widest">
            Total Purchases
          </span>
        </div>
      </div>

      {/* Journey Path */}
      <div className="relative flex flex-col gap-[clamp(1rem,3vw,1.5rem)]">
        {groups.map((group, index) => {
          const isActive = currentGroup === group.name;
          const isUnlocked = purchaseCount >= group.threshold;
          const meta = getTierMetadata(group.name);

          return (
            <div
              key={group.name}
              className={`relative flex items-center group transition-all duration-500 ${!isUnlocked ? "opacity-60" : "opacity-100"}`}
            >
              {/* Connector Line */}
              {index < groups.length - 1 && (
                <div className="absolute left-[clamp(2rem,5vw,2.5rem)] top-[clamp(4rem,10vw,5rem)] w-0.5 h-12 bg-gray-100 dark:bg-gray-800 -z-10" />
              )}

              {/* Tier Badge / Circle */}
              <div
                className={`relative w-[clamp(4rem,10vw,5rem)] h-[clamp(4rem,10vw,5rem)] shrink-0 rounded-[clamp(1rem,3vw,1.5rem)] flex items-center justify-center transition-all duration-500 shadow-xl
                ${
                  isActive
                    ? `bg-gradient-to-br ${meta.color} scale-110 rotate-3 z-10 ring-8 ring-blue-500/10`
                    : isUnlocked
                      ? `bg-white dark:bg-gray-800 border-2 border-green-500`
                      : `bg-gray-50 dark:bg-gray-900 border-2 border-dashed border-gray-200 dark:border-gray-700`
                }`}
              >
                {isActive ? (
                  <span className="text-white">
                    {getIcon(group.icon, "text-white")}
                  </span>
                ) : isUnlocked ? (
                  <CheckCircle2 className="text-green-500" size={32} />
                ) : (
                  <Lock
                    className="text-gray-300 dark:text-gray-600"
                    size={24}
                  />
                )}
              </div>

              {/* Content Card */}
              <div
                className={`ml-[clamp(1rem,3vw,2rem)] flex-grow p-[clamp(1rem,3vw,1.5rem)] rounded-[clamp(1.5rem,4vw,2rem)] border transition-all duration-500
                ${
                  isActive
                    ? "bg-white dark:bg-gray-900 border-blue-500/50 shadow-2xl shadow-blue-500/5 translate-x-2"
                    : "bg-transparent border-transparent"
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h4
                        className={`text-[clamp(1.125rem,3vw,1.25rem)] font-black tracking-tight ${isActive ? "text-gray-900 dark:text-white" : "text-gray-500"}`}
                      >
                        {group.name}
                      </h4>
                      {isActive && (
                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-full">
                          Current Tier
                        </span>
                      )}
                    </div>
                    <p
                      className={`text-[clamp(0.75rem,2vw,0.875rem)] font-bold uppercase tracking-widest mb-[clamp(0.25rem,1vw,0.5rem)] ${isActive ? "text-blue-500" : "text-gray-400"}`}
                    >
                      {group.threshold === 0
                        ? "First Step"
                        : `${group.threshold} Purchases Required`}
                    </p>
                    {isActive && (
                      <p className="text-[clamp(0.875rem,2vw,1rem)] text-gray-600 dark:text-gray-400 font-medium max-w-sm">
                        🎉 Congratulations! Enjoy **{meta.perks}** as part of
                        your membership.
                      </p>
                    )}
                  </div>

                  {!isUnlocked && (
                    <div className="md:text-right">
                      <p className="text-[clamp(0.65rem,1.5vw,0.75rem)] font-black text-gray-400 uppercase tracking-widest mb-[clamp(0.125rem,0.5vw,0.25rem)]">
                        Locked
                      </p>
                      <div className="w-[clamp(4rem,12vw,6rem)] h-[clamp(4px,0.5vw,6px)] bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 transition-all duration-1000"
                          style={{
                            width: `${Math.min(100, (purchaseCount / group.threshold) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
