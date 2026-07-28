"use client";

import { UserCircle, UserPlus } from "lucide-react";

interface AuthSelectorProps {
  onSelect: (mode: "guest" | "login") => void;
}

export default function AuthSelector({ onSelect }: AuthSelectorProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl lg:rounded-xl p-5 lg:p-8 shadow-sm border border-gray-100 dark:border-gray-700">
      <h2 className="text-xl lg:text-2xl font-black text-gray-900 dark:text-white mb-4 lg:mb-6 uppercase tracking-tighter italic">
        Checkout Options
      </h2>
      <p className="text-gray-500 dark:text-gray-400 mb-6 lg:mb-8 text-sm lg:text-base">
        How would you like to proceed with your order?
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
        {/* Guest Option */}
        <button
          onClick={() => onSelect("guest")}
          className="flex flex-col items-center justify-center gap-3 lg:gap-4 p-4 lg:p-6 min-h-[160px] rounded-xl border-2 border-gray-100 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group"
        >
          <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
            <UserPlus className="w-6 h-6 lg:w-8 lg:h-8" />
          </div>
          <div className="text-center">
            <h3 className="font-bold text-base lg:text-lg text-gray-900 dark:text-white">
              Order as Guest
            </h3>
            <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400 mt-1">
              Quick checkout with mobile verification
            </p>
          </div>
        </button>

        {/* Login Option */}
        <button
          onClick={() => onSelect("login")}
          className="flex flex-col items-center justify-center gap-3 lg:gap-4 p-4 lg:p-6 min-h-[160px] rounded-xl border-2 border-gray-100 dark:border-gray-700 hover:border-green-500 dark:hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all group"
        >
          <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform">
            <UserCircle className="w-6 h-6 lg:w-8 lg:h-8" />
          </div>
          <div className="text-center">
            <h3 className="font-bold text-base lg:text-lg text-gray-900 dark:text-white">
              Sign In / Register
            </h3>
            <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400 mt-1">
              Access saved addresses and order history
            </p>
          </div>
        </button>
      </div>
    </div>
  );
}
