"use client";

import UserSidebar from "@/components/dashboard/UserSidebar";
import { useAuth } from "@/context/AuthContext";
import { Mail, Phone, Calendar, Edit3, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login?redirect=/profile");
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="bg-[#f8fafc] dark:bg-gray-950 min-h-[100dvh] py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="w-full lg:w-80 shrink-0">
            <UserSidebar />
          </aside>

          <main className="flex-grow">
            {user.isGuest ? (
              <>
                <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div>
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter uppercase italic">
                      Guest Profile
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">
                      You are browsing as a guest user
                    </p>
                  </div>
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-amber-600 transition-colors shadow-lg shadow-amber-500/30"
                  >
                    Create Full Account
                  </Link>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
                  <div className="p-8 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 flex flex-col sm:flex-row items-center gap-6">
                    <div className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 shadow-xl overflow-hidden bg-gradient-to-tr from-amber-200 to-amber-100 dark:from-amber-800 dark:to-amber-700 flex items-center justify-center shrink-0">
                      <span className="text-5xl font-black text-amber-700 dark:text-amber-300 uppercase">
                        G
                      </span>
                    </div>
                    <div className="text-center sm:text-left flex-1">
                      <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                        Guest User
                      </h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-md">
                        Upgrade to a full account to access rewards, leave
                        reviews, save items to your wishlist, and get a
                        personalized shopping experience!
                      </p>
                    </div>
                  </div>

                  <div className="p-8">
                    <h3 className="text-lg font-black uppercase italic tracking-tighter mb-6 text-gray-400 dark:text-gray-500">
                      Contact Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 flex items-center justify-center shrink-0">
                          <Phone size={24} />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">
                            Phone Number
                          </p>
                          <p className="text-gray-900 dark:text-white font-medium">
                            {user.phone || "Not provided"}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 flex items-center justify-center shrink-0">
                          <Mail size={24} />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">
                            Email Address
                          </p>
                          <p className="text-gray-900 dark:text-white font-medium">
                            {user.email || "Not provided"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div>
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter uppercase italic">
                      My Profile
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">
                      View your personal information
                    </p>
                  </div>
                  <Link
                    href="/settings"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30"
                  >
                    <Edit3 size={16} /> Edit Profile
                  </Link>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
                  <div className="p-8 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 flex flex-col sm:flex-row items-center gap-6">
                    <div className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 shadow-xl overflow-hidden bg-gradient-to-tr from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/20 flex items-center justify-center shrink-0">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-5xl font-black text-blue-600 uppercase">
                          {user.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="text-center sm:text-left">
                      <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                        {user.name}
                      </h2>
                      <div className="inline-flex items-center px-3 py-1 mt-2 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 text-xs font-bold uppercase tracking-widest">
                        {user.isGuest ? "Guest User" : "Registered User"}
                      </div>
                    </div>
                  </div>

                  <div className="p-8">
                    <h3 className="text-lg font-black uppercase italic tracking-tighter mb-6 text-gray-400 dark:text-gray-500">
                      Contact Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center shrink-0">
                          <Mail size={24} />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">
                            Email Address
                          </p>
                          <p className="text-gray-900 dark:text-white font-medium">
                            {user.email || "Not provided"}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-green-50 dark:bg-green-900/20 text-green-600 flex items-center justify-center shrink-0">
                          <Phone size={24} />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">
                            Phone Number
                          </p>
                          <p className="text-gray-900 dark:text-white font-medium">
                            {user.phone || "Not provided"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="my-8 border-t border-gray-100 dark:border-gray-800"></div>

                    <h3 className="text-lg font-black uppercase italic tracking-tighter mb-6 text-gray-400 dark:text-gray-500">
                      Additional Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 flex items-center justify-center shrink-0">
                          <Calendar size={24} />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">
                            Joined Date
                          </p>
                          <p className="text-gray-900 dark:text-white font-medium">
                            {/* If createdAt doesn't exist on context, fallback to static text */}
                            {user.createdAt
                              ? new Date(user.createdAt).toLocaleDateString(
                                  "en-GB",
                                  {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                  },
                                )
                              : "Recently"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
