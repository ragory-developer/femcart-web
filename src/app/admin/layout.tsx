"use client";

import AdminSidebar from "@/components/admin/AdminSidebar";
import GlobalWalletNotice from "@/components/admin/GlobalWalletNotice";
import { useAuth } from "@/context/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getRequiredPermissionForPath } from "@/lib/admin-permissions";
import { ShieldAlert } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";
  const isBuilderPage =
    pathname === "/admin/home-builder" ||
    pathname.startsWith("/admin/builder/");

  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        if (!isLoginPage) {
          router.replace("/admin/login");
        }
      } else if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
        router.replace("/");
      }
    }
  }, [user, loading, router, isLoginPage]);

  // Allow login page to render even if not authenticated
  if (isLoginPage) {
    if (user && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      return null; // Wait for redirect
    }
    return <>{children}</>;
  }

  if (
    !loading &&
    (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN"))
  ) {
    return null;
  }

  // --- Route Guard Logic ---
  const requiredPermission = getRequiredPermissionForPath(pathname);

  let hasPermission = false;
  if (user) {
    if (user.role === "SUPER_ADMIN") {
      hasPermission = true;
    } else {
      const perms: string[] = Array.isArray(user.permissions)
        ? user.permissions
        : typeof user.permissions === "string"
          ? (() => {
              try {
                return JSON.parse(user.permissions as unknown as string);
              } catch {
                return [];
              }
            })()
          : [];

      hasPermission =
        perms.includes("ALL") || perms.includes(requiredPermission);
    }
  }

  const renderContent = () => {
    if (!hasPermission && !isLoginPage) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <ShieldAlert size={64} className="text-rose-500 mb-4 opacity-80" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Access Denied
          </h2>
          <p className="text-gray-500 max-w-md mx-auto">
            You do not have the required permissions (
            <strong className="text-gray-300">{requiredPermission}</strong>) to
            view this page.
          </p>
        </div>
      );
    }
    return children;
  };

  return (
    <div className="min-h-[100dvh] bg-gray-50 dark:bg-gray-950 font-sans">
      <GlobalWalletNotice />
      <AdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div
        className={`${collapsed ? "ml-[80px]" : "ml-[280px]"} min-h-[100dvh] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]`}
      >
        <main className={isBuilderPage ? "p-0" : "p-6 lg:p-8"}>
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
