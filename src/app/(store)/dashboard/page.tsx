"use client";

import DashboardStats from "@/components/dashboard/DashboardStats";
import UserGroupBadges from "@/components/dashboard/UserGroupBadges";
import UserSidebar from "@/components/dashboard/UserSidebar";
import RecentOrders from "@/components/dashboard/RecentOrders";
import { useAuth } from "@/context/AuthContext";
import { API_URL } from "@/lib/config";
import { AlertCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface DashboardData {
  orderCount: number;
  wishlistCount: number;
  rewardPoints: number;
  userGroup: string;
  recentOrders: any[];
  groups: Array<{
    name: string;
    threshold: number;
    icon: string;
    color: string;
  }>;
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login?redirect=/dashboard");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;

      try {
        const token =
          localStorage.getItem("femcart_access_token") ||
          localStorage.getItem("token");
        const res = await fetch(`${API_URL}/api/user-stats-service/stats`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        } else {
          setError(json.message || "Failed to fetch dashboard data");
        }
      } catch (err) {
        setError("An unexpected error occurred. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchStats();
    }
  }, [user]);

  if (authLoading || (loading && !error)) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <Loader2 className="animate-spin text-blue-600" size={48} />
          <div className="absolute inset-0 bg-blue-600/10 blur-xl rounded-full" />
        </div>
        <p className="text-gray-500 font-black uppercase tracking-widest text-xs animate-pulse">
          Loading your dashboard...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-md mx-auto bg-pink-50 dark:bg-pink-900/10 border border-pink-100 dark:border-pink-800 p-8 rounded-[2.5rem] text-center">
          <AlertCircle className="mx-auto text-pink-500 mb-4" size={48} />
          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">
            Oops! Something went wrong
          </h2>
          <p className="text-pink-600 dark:text-pink-400 font-medium mb-6">
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-pink-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-pink-700 transition-all shadow-xl shadow-pink-600/20"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="bg-[#f8fafc] dark:bg-gray-950 min-h-[100dvh] py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full lg:w-80 shrink-0">
            <UserSidebar />
          </aside>

          {/* Main Content */}
          <main className="flex-grow">
            <div className="mb-8">
              <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter uppercase italic">
                Dashboard
              </h1>
              <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">
                Monitoring your activity and progress
              </p>
            </div>

            {data && (
              <>
                <DashboardStats
                  rewardPoints={data.rewardPoints}
                  wishlistCount={data.wishlistCount}
                  orderCount={data.orderCount}
                />

                <UserGroupBadges
                  currentGroup={data.userGroup}
                  purchaseCount={data.orderCount}
                  groups={data.groups}
                />

                <RecentOrders orders={data.recentOrders} />
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
