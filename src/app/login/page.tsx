import LoginTabs from "@/components/auth/LoginTabs";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

export const metadata = {
  title: "Sign In — Femcart",
  description:
    "Sign in to your Femcart account with your mobile number and password.",
};

export default function LoginPage() {
  return (
    <div className="min-h-[100dvh] flex flex-col justify-center bg-slate-50 dark:bg-slate-950 py-12 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
      {/* Decorative ambient background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-pink-600/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Link href="/" className="flex justify-center mb-6 group">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-1 group-hover:scale-[1.02] transition-transform origin-center">
            Femcart
          </h1>
        </Link>
        <h2 className="mt-2 text-center text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
          Or{" "}
          <Link
            href="/register"
            className="font-medium text-pink-600 dark:text-pink-400 hover:text-pink-500 transition-colors"
          >
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white dark:bg-slate-900 py-8 px-4 shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] border border-slate-200/80 dark:border-slate-800 sm:rounded-2xl sm:px-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 to-pink-600" />
          <Suspense
            fallback={
              <div className="flex justify-center py-8">
                <Loader2 className="animate-spin text-pink-600" size={28} />
              </div>
            }
          >
            <LoginTabs />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
