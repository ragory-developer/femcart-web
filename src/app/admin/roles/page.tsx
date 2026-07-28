"use client";

import { useAuth } from "@/context/AuthContext";
import { API_URL } from "@/lib/config";
import {
  Check,
  Loader2,
  Lock,
  Plus,
  Shield,
  ShieldCheck,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const ALL_PERMISSIONS = [
  "DASHBOARD",
  "PRODUCTS",
  "MEDIA",
  "CATEGORIES",
  "BRANDS",
  "SPECIFICATIONS",
  "VARIATIONS",
  "ORDERS",
  "IMPORT",
  "PAGES",
  "SETTINGS",
  "USERS",
  "PROMOTIONS",
];

interface Role {
  id: string;
  name: string;
  description: string;
  isSystem: boolean;
  userCount: number;
  permissions: string[];
}

export default function AdminRolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeRole, setActiveRole] = useState<Role | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [saving, setSaving] = useState(false);

  const { logout } = useAuth();

  const getToken = () =>
    typeof window !== "undefined"
      ? localStorage.getItem("femcart_access_token") || ""
      : "";

  const handleForceLogout = () => {
    logout();
  };

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/admin-roles`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.status === 401) return handleForceLogout();
      const data = await res.json();
      if (data?.success) {
        setRoles(data.data);
        if (data.data.length > 0 && !activeRole) {
          setActiveRole(data.data[0]);
        }
      } else {
        throw new Error(data.message || "Failed to fetch roles");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch roles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSavePermissions = async () => {
    if (!activeRole) return;
    try {
      setSaving(true);
      const res = await fetch(`${API_URL}/api/admin-roles/${activeRole.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ permissions: activeRole.permissions }),
      });
      if (res.status === 401) return handleForceLogout();
      const data = await res.json();

      if (data?.success) {
        toast.success("Permissions updated successfully");
        setRoles(roles.map((r) => (r.id === activeRole.id ? data.data : r)));
      } else {
        throw new Error(data.message || "Failed to update permissions");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update permissions");
    } finally {
      setSaving(false);
    }
  };

  const togglePermission = (perm: string) => {
    if (!activeRole) return;
    if (activeRole.isSystem)
      return toast.error("System role permissions cannot be changed.");

    let newPerms = [...activeRole.permissions];
    if (newPerms.includes(perm)) {
      newPerms = newPerms.filter((p) => p !== perm);
    } else {
      newPerms.push(perm);
    }
    setActiveRole({ ...activeRole, permissions: newPerms });
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this role?")) return;
    try {
      const res = await fetch(`${API_URL}/api/admin-roles/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.status === 401) return handleForceLogout();
      const data = await res.json();

      if (data?.success) {
        toast.success("Role deleted");
        setRoles(roles.filter((r) => r.id !== id));
        if (activeRole?.id === id)
          setActiveRole(roles.find((r) => r.id !== id) || null);
      } else {
        throw new Error(data.message || "Failed to delete role");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to delete role");
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return toast.error("Name is required");
    try {
      setSaving(true);
      const res = await fetch(`${API_URL}/api/admin-roles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          permissions: [],
        }),
      });
      if (res.status === 401) return handleForceLogout();
      const data = await res.json();

      if (data?.success) {
        toast.success("Role created successfully");
        setRoles([...roles, data.data]);
        setActiveRole(data.data);
        setIsModalOpen(false);
        setFormData({ name: "", description: "" });
      } else {
        throw new Error(data.message || "Failed to create role");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to create role");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-emerald-500" size={32} />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
            Roles & Permissions
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Define custom roles and assign specific module permissions.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-600/20"
        >
          <Plus size={18} /> Create New Role
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Roles List */}
        <div className="lg:col-span-1 space-y-4">
          {roles.length === 0 && (
            <div className="text-gray-500 text-sm p-4 border rounded-xl text-center">
              No custom roles defined yet.
            </div>
          )}

          {roles.map((role) => (
            <div
              key={role.id}
              onClick={() => setActiveRole(role)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                activeRole?.id === role.id
                  ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/50 shadow-sm"
                  : "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:border-emerald-200 dark:hover:border-gray-700 shadow-sm"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${role.isSystem ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50" : "bg-blue-100 text-blue-600 dark:bg-blue-900/50"}`}
                  >
                    {role.isSystem ? (
                      <ShieldCheck size={20} />
                    ) : (
                      <Shield size={20} />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">
                      {role.name}
                    </h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <Users size={12} /> {role.userCount} Users
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                {role.description || "No description provided."}
              </p>
              <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-4">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  {role.permissions.includes("ALL")
                    ? "Full Access"
                    : `${role.permissions.length} Permissions`}
                </span>
                {!role.isSystem && (
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => handleDelete(role.id, e)}
                      className="text-gray-400 hover:text-pink-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Permission Details Panel */}
        <div className="lg:col-span-2">
          {activeRole ? (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 lg:p-8 sticky top-24">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                  <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                    <Lock size={20} className="text-emerald-500" />
                    {activeRole.name} Permissions
                  </h2>
                  <p className="text-gray-500 text-sm mt-1">
                    Configure what users with this role can access.
                  </p>
                </div>
                {!activeRole.isSystem && (
                  <button
                    onClick={handleSavePermissions}
                    disabled={saving}
                    className="px-4 py-2 bg-emerald-100 dark:bg-emerald-900/50 hover:bg-emerald-200 dark:hover:bg-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-xl font-bold transition-colors text-sm disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                )}
              </div>

              {activeRole.isSystem && (
                <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800/50 rounded-xl text-yellow-800 dark:text-yellow-500 text-sm font-medium">
                  This is a system role. Its permissions cannot be modified.
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {ALL_PERMISSIONS.map((perm) => {
                  const isGranted =
                    activeRole.permissions.includes(perm) ||
                    activeRole.permissions.includes("ALL");
                  return (
                    <button
                      key={perm}
                      type="button"
                      disabled={activeRole.isSystem}
                      onClick={() => togglePermission(perm)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold border-2 transition-all text-left ${
                        isGranted
                          ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-400"
                          : "border-gray-100 dark:border-gray-800 text-gray-500 hover:border-gray-300 dark:hover:border-gray-700"
                      } ${activeRole.isSystem ? "opacity-70 cursor-not-allowed" : ""}`}
                    >
                      <div
                        className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-colors ${
                          isGranted
                            ? "bg-emerald-500 text-white"
                            : "bg-gray-200 dark:bg-gray-800 text-transparent"
                        }`}
                      >
                        <Check size={14} />
                      </div>
                      {perm}
                    </button>
                  );
                })}
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 flex items-start gap-4 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl">
                <ShieldCheck size={24} className="text-blue-500 shrink-0" />
                <div>
                  <h4 className="font-bold text-blue-900 dark:text-blue-400 text-sm">
                    Role Based Access Control
                  </h4>
                  <p className="text-blue-700 dark:text-blue-300/70 text-xs mt-1 leading-relaxed">
                    Assigning a role to a user will automatically grant them all
                    selected permissions. Super Administrators bypass these
                    restrictions and have absolute access.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-8 text-center text-gray-500">
              Select a role from the left to view and edit its permissions.
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Create New Role
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Role Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g. Content Editor"
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-transparent dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Optional description of this role's duties"
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-transparent dark:text-white resize-none"
                  />
                </div>
              </div>
              <div className="mt-8 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50"
                >
                  {saving ? "Creating..." : "Create Role"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
