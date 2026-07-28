"use client";

import MediaLibraryModal from "@/components/admin/MediaLibraryModal";
import { API_URL } from "@/lib/config";
import {
  ChevronRight,
  Edit2,
  Image as ImageIcon,
  Plus,
  Settings,
  Trash2,
  X,
  Link as LinkIcon,
} from "lucide-react";
import React, { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { useSettingsStore } from "@/store/settingsStore";

type NavbarItem = {
  id: string;
  parentId: string | null;
  title: string;
  url: string;
  icon?: string;
  target: string;
  sortOrder: number;
  isActive: boolean;
  position: string;
  isSystem?: boolean;
  children: NavbarItem[];
};

function getToken() {
  return typeof window !== "undefined"
    ? localStorage.getItem("femcart_access_token") ||
        localStorage.getItem("token") ||
        ""
    : "";
}

export default function NavbarManager() {
  const [items, setItems] = useState<NavbarItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NavbarItem | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [icon, setIcon] = useState("");
  const [target, setTarget] = useState("_self");
  const [parentId, setParentId] = useState<string>("");
  const [isActive, setIsActive] = useState(true);
  const [position, setPosition] = useState<"top" | "bottom">("top");

  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>(
    {},
  );

  const toggleNode = (id: string) => {
    setExpandedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const setAllExpanded = (expand: boolean) => {
    const newExpanded: Record<string, boolean> = {};
    if (expand) {
      const traverse = (itemsList: NavbarItem[]) => {
        itemsList.forEach((item) => {
          if (item.children && item.children.length > 0) {
            newExpanded[item.id] = true;
            traverse(item.children);
          }
        });
      };
      traverse(items);
    }
    setExpandedNodes(newExpanded);
  };

  const [activeNavbarTab, setActiveNavbarTab] = useState<"top" | "bottom">(
    "top",
  );

  // Global Settings State
  const [globalSettings, setGlobalSettings] = useState({
    store_name: "",
    store_logo: "",
  });
  const { setSettings: updateStore } = useSettingsStore();
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [mediaOpen, setMediaOpen] = useState(false);
  const [mediaTarget, setMediaTarget] = useState<"logo" | "icon">("logo");

  const [availablePages, setAvailablePages] = useState<any[]>([]);
  const [urlType, setUrlType] = useState<"page" | "custom">("custom");

  const fetchItems = async () => {
    setLoading(true);
    try {
      const [res, settingsRes, pagesRes] = await Promise.all([
        fetch(`${API_URL}/api/navigation/navbar`, {
          headers: { Authorization: `Bearer ${getToken()}` },
          cache: "no-store",
        }),
        fetch(`${API_URL}/api/global-settings`, {
          headers: { Authorization: `Bearer ${getToken()}` },
          cache: "no-store",
        }),
        fetch(`${API_URL}/api/pages`, {
          cache: "no-store",
        }),
      ]);
      const json = await res.json();
      const settingsJson = await settingsRes.json();
      const pagesJson = await pagesRes.json();

      if (json.success) setItems(json.data);
      if (settingsJson.success) {
        setGlobalSettings({
          store_name: settingsJson.data.store_name || "Femcart",
          store_logo: settingsJson.data.store_logo || "",
        });
      }
      if (pagesJson.success) {
        setAvailablePages(pagesJson.data || []);
      }
    } catch (err) {
      toast.error("Failed to load navbar items");
    } finally {
      setLoading(false);
    }
  };

  // Image compression and base64 generation
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        const MAX_WIDTH = 400;
        const MAX_HEIGHT = 120;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;

        ctx?.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL("image/webp", 0.8);
        setGlobalSettings({ ...globalSettings, store_logo: dataUrl });
        toast.success("Logo processed and compressed successfully!");
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const resetForm = () => {
    setEditingItem(null);
    setTitle("");
    setUrl("");
    setIcon("");
    setTarget("_self");
    setParentId("");
    setIsActive(true);
    setPosition(activeNavbarTab); // Default to current tab
    setUrlType("custom");
    setIsModalOpen(false);
  };

  const handleGlobalSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      const res = await fetch(`${API_URL}/api/global-settings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ settings: globalSettings }),
      });
      const json = await res.json();
      if (json.success) {
        updateStore(globalSettings);
        toast.success("Global site settings updated");
      } else {
        toast.error("Failed to update settings");
      }
    } catch (err) {
      toast.error("Network error saving settings");
    } finally {
      setIsSavingSettings(false);
    }
  };

  const openEdit = (item: NavbarItem) => {
    setEditingItem(item);
    setTitle(item.title);
    setUrl(item.url);
    setIcon(item.icon || "");
    setTarget(item.target || "_self");
    setParentId(item.parentId || "");
    setIsActive(item.isActive);
    setPosition((item.position as "top" | "bottom") || "top");

    const isPage = availablePages.some((p) => `/${p.slug}` === item.url);
    setUrlType(isPage ? "page" : "custom");

    setIsModalOpen(true);
  };

  const openAdd = (parent?: string) => {
    resetForm();
    if (parent) setParentId(parent);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title,
      url,
      icon,
      target,
      parentId: parentId || null,
      isActive,
      position,
    };

    try {
      const res = await fetch(
        `${API_URL}/api/navigation/navbar${editingItem ? `/${editingItem.id}` : ""}`,
        {
          method: editingItem ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify(payload),
        },
      );
      const json = await res.json();
      if (json.success) {
        toast.success(
          editingItem ? "Updated successfully" : "Created successfully",
        );
        fetchItems();
        resetForm();
      } else {
        toast.error(json.message || "Operation failed");
      }
    } catch (err) {
      toast.error("Failed to save item");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This will also delete all nested children."))
      return;
    try {
      const res = await fetch(`${API_URL}/api/navigation/navbar/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Deleted successfully");
        fetchItems();
      } else {
        toast.error(json.message);
      }
    } catch (err) {
      toast.error("Failed to delete item");
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await fetch(`${API_URL}/api/navigation/navbar/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      fetchItems();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  // Flatten items for parent dropdown selection
  const getFlatOptions = (
    itemsList: NavbarItem[],
    level = 0,
    excludeId?: string,
  ): { id: string; title: string }[] => {
    let options: { id: string; title: string }[] = [];
    for (const item of itemsList) {
      if (item.id === excludeId) continue;
      options.push({
        id: item.id,
        title: `${"  ".repeat(level)} ${level > 0 ? "+ " : ""}${item.title}`,
      });
      if (item.children) {
        options = [
          ...options,
          ...getFlatOptions(item.children, level + 1, excludeId),
        ];
      }
    }
    return options;
  };

  const renderTableTree = (navItems: NavbarItem[], depth = 0) => {
    if (!navItems || navItems.length === 0) return null;
    return (
      <>
        {navItems
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((item) => {
            const isExpanded = expandedNodes[item.id];
            const hasChildren = item.children && item.children.length > 0;

            return (
              <React.Fragment key={item.id}>
                <tr
                  className={`border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors ${!item.isActive ? "opacity-60" : ""}`}
                >
                  <td className="px-6 py-4">
                    <div
                      className="flex items-center gap-3"
                      style={{ paddingLeft: `${depth * 28}px` }}
                    >
                      <div className="w-5 h-5 flex items-center justify-center shrink-0">
                        {hasChildren ? (
                          <button
                            onClick={() => toggleNode(item.id)}
                            className="w-5 h-5 flex items-center justify-center rounded transition-all hover:bg-gray-200 dark:hover:bg-gray-700"
                          >
                            <ChevronRight
                              size={14}
                              className={`transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}
                            />
                          </button>
                        ) : (
                          <div className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700 mx-auto" />
                        )}
                      </div>
                      <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center overflow-hidden shrink-0">
                        {item.icon ? (
                          <img
                            src={item.icon}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <LinkIcon size={14} className="text-gray-400" />
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white text-sm flex items-center gap-2">
                          {item.title}
                          {item.isSystem && (
                            <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                              System
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                          {item.url}
                          {item.target === "_blank" && (
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1 bg-gray-100 dark:bg-gray-800 rounded">
                              New Tab
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleStatus(item.id, item.isActive)}
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${item.isActive ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"}`}
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full mr-1.5 ${item.isActive ? "bg-emerald-500" : "bg-gray-400"}`}
                      ></div>
                      {item.isActive ? "Active" : "Hidden"}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-60 hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openAdd(item.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
                        title="Add Sub-link"
                      >
                        <Plus size={16} />
                      </button>
                      <button
                        onClick={() => openEdit(item)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-blue-100 hover:text-blue-700 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 text-gray-600 dark:text-gray-300 transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      {!item.isSystem && (
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-pink-100 hover:text-pink-700 dark:hover:bg-pink-900/30 dark:hover:text-pink-400 text-gray-600 dark:text-gray-300 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
                {isExpanded &&
                  hasChildren &&
                  renderTableTree(item.children, depth + 1)}
              </React.Fragment>
            );
          })}
      </>
    );
  };

  return (
    <div>
      {/* Global Settings Block with Large Logo Preview */}
      <div className="mb-8 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden bg-white dark:bg-gray-950">
        <div
          className="flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/30 hover:bg-gray-50 dark:hover:bg-gray-900 px-6 py-5 cursor-pointer transition-colors border-b border-gray-100 dark:border-gray-800/60"
          onClick={() => setIsSettingsOpen(!isSettingsOpen)}
        >
          <div className="flex items-center gap-4">
            <div className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 p-3 rounded-xl">
              <Settings size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Store Branding & Settings
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Configure global store name and large logo preview
              </p>
            </div>
          </div>
          <button
            type="button"
            className="text-gray-500 hover:text-emerald-600 transition-colors text-sm font-medium flex items-center gap-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-lg shadow-sm"
          >
            {isSettingsOpen ? "Collapse" : "Expand settings"}
          </button>
        </div>

        {isSettingsOpen && (
          <form onSubmit={handleGlobalSettingsSubmit} className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Logo Upload Section - Improved Preview */}
              <div className="flex flex-col">
                <label className="block text-sm font-semibold mb-3 text-gray-900 dark:text-white">
                  Store Logo / Brand Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const file = e.dataTransfer.files?.[0];
                    if (file) processFile(file);
                  }}
                  className="w-full h-48 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 transition-all group bg-gray-50 dark:bg-gray-900/30 overflow-hidden relative"
                >
                  {globalSettings.store_logo ? (
                    <>
                      <img
                        src={globalSettings.store_logo}
                        alt="Store Logo Preview"
                        className="h-full w-full object-contain p-4 transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="bg-white text-gray-900 px-4 py-2 rounded-lg font-medium text-sm shadow-lg flex items-center gap-2">
                          <ImageIcon size={16} /> Change Logo
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setGlobalSettings({
                            ...globalSettings,
                            store_logo: "",
                          });
                        }}
                        className="absolute top-3 right-3 bg-pink-500 hover:bg-pink-600 text-white p-1.5 rounded-lg shadow-sm"
                      >
                        <X size={14} />
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-3 text-gray-400 group-hover:text-emerald-500 transition-colors">
                      <div className="w-14 h-14 bg-white dark:bg-gray-800 rounded-full shadow-sm flex items-center justify-center">
                        <ImageIcon size={24} />
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <span className="font-semibold text-sm text-gray-700 dark:text-gray-300 group-hover:text-emerald-500 transition-colors">
                          Click or drag image to upload
                        </span>
                        <span className="text-xs text-gray-500">
                          Supports PNG, JPG, WEBP (Max 400x120px)
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Recommended size: 400x120px. Used in navbar and email
                  templates.
                </p>
              </div>

              {/* Store Name */}
              <div>
                <label className="block text-sm font-semibold mb-3 text-gray-900 dark:text-white">
                  Store Name
                </label>
                <input
                  value={globalSettings.store_name}
                  onChange={(e) =>
                    setGlobalSettings({
                      ...globalSettings,
                      store_name: e.target.value,
                    })
                  }
                  className="w-full p-3 border rounded-xl dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all shadow-sm"
                  placeholder="e.g. Femcart Superstore"
                />
              </div>
            </div>
            <div className="flex justify-end pt-6 border-t border-gray-100 dark:border-gray-800">
              <button
                disabled={isSavingSettings}
                type="submit"
                className="px-8 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-sm transition-colors"
              >
                {isSavingSettings ? "Saving..." : "Save Branding Settings"}
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Navigation Links
          </h2>
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setActiveNavbarTab("top")}
              className={`text-sm px-4 py-1.5 rounded-md font-medium transition-colors ${activeNavbarTab === "top" ? "bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white" : "text-gray-500 hover:text-gray-700 dark:text-gray-400"}`}
            >
              Top Navbar
            </button>
            <button
              type="button"
              onClick={() => setActiveNavbarTab("bottom")}
              className={`text-sm px-4 py-1.5 rounded-md font-medium transition-colors ${activeNavbarTab === "bottom" ? "bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white" : "text-gray-500 hover:text-gray-700 dark:text-gray-400"}`}
            >
              Mega Menu (Bottom)
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-900 p-1 rounded-xl border border-gray-200 dark:border-gray-800">
            <button
              onClick={() => setAllExpanded(true)}
              className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 hover:text-emerald-600 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-all"
            >
              Expand All
            </button>
            <button
              onClick={() => setAllExpanded(false)}
              className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 hover:text-emerald-600 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-all"
            >
              Collapse All
            </button>
          </div>
          <button
            onClick={() => openAdd()}
            className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 dark:text-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm"
          >
            <Plus size={16} /> Add Root Link
          </button>
        </div>
      </div>

      {/* Proper Table Design */}
      <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 font-semibold">
                <th className="px-6 py-4 w-1/2">Link Title & Details</th>
                <th className="px-6 py-4 w-1/4">Status</th>
                <th className="px-6 py-4 w-1/4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-6 py-10 text-center text-gray-500"
                  >
                    Loading navigation links...
                  </td>
                </tr>
              ) : items.filter(
                  (item) => (item.position || "top") === activeNavbarTab,
                ).length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-6 py-10 text-center text-gray-500"
                  >
                    No links configured in this section.
                  </td>
                </tr>
              ) : (
                renderTableTree(
                  items.filter(
                    (item) => (item.position || "top") === activeNavbarTab,
                  ),
                )
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form with Link Preview Image */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">
              {editingItem ? "Edit Navigation Link" : "Add Navigation Link"}
            </h3>
            <form
              onSubmit={handleSubmit}
              className="space-y-5 text-gray-900 dark:text-white"
            >
              <div className="flex gap-4 items-end">
                {/* Image Preview Field for the Link */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    Link Image / Icon
                  </label>
                  <div
                    onClick={() => {
                      setMediaTarget("icon");
                      setMediaOpen(true);
                    }}
                    className="w-20 h-20 border border-gray-200 dark:border-gray-700 rounded-xl flex items-center justify-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 bg-gray-50 dark:bg-gray-800 transition-colors overflow-hidden group relative"
                  >
                    {icon ? (
                      <>
                        <img
                          src={icon}
                          alt="Link Preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Edit2 size={14} className="text-white" />
                        </div>
                      </>
                    ) : (
                      <ImageIcon
                        size={20}
                        className="text-gray-400 group-hover:text-emerald-500"
                      />
                    )}
                  </div>
                </div>

                <div className="flex-1">
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    Title
                  </label>
                  <input
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-2.5 border rounded-xl dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="e.g. Halal Meat Market"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  URL / Route Destination
                </label>
                <div className="flex bg-gray-100 p-1 rounded-lg dark:bg-gray-800 border dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => setUrlType("page")}
                    className={`flex-1 text-xs py-1.5 rounded-md font-medium transition-colors ${urlType === "page" ? "bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white" : "text-gray-500 hover:text-gray-700 dark:text-gray-400"}`}
                  >
                    Custom Page
                  </button>
                  <button
                    type="button"
                    onClick={() => setUrlType("custom")}
                    className={`flex-1 text-xs py-1.5 rounded-md font-medium transition-colors ${urlType === "custom" ? "bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white" : "text-gray-500 hover:text-gray-700 dark:text-gray-400"}`}
                  >
                    Custom URL
                  </button>
                </div>

                {urlType === "page" && (
                  <select
                    value={url}
                    onChange={(e) => {
                      setUrl(e.target.value);
                      if (!title) {
                        const page = availablePages.find(
                          (p) => `/${p.slug}` === e.target.value,
                        );
                        if (page) setTitle(page.title);
                      }
                    }}
                    className="w-full p-2.5 border rounded-xl dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white outline-none"
                  >
                    <option value="">-- Select a Custom Page --</option>
                    {availablePages.map((p) => (
                      <option key={p.slug} value={`/${p.slug}`}>
                        {p.title} (/{p.slug})
                      </option>
                    ))}
                  </select>
                )}
                {urlType === "custom" && (
                  <input
                    required={urlType === "custom"}
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full p-2.5 border rounded-xl dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white outline-none"
                    placeholder="e.g. /products/new, https://..."
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    Parent Category
                  </label>
                  <select
                    value={parentId}
                    onChange={(e) => setParentId(e.target.value)}
                    className="w-full p-2.5 border rounded-xl dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white outline-none"
                  >
                    <option value="">-- Root Level --</option>
                    {getFlatOptions(
                      items.filter(
                        (item) => (item.position || "top") === position,
                      ),
                      0,
                      editingItem?.id,
                    ).map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    Open Behavior
                  </label>
                  <select
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    className="w-full p-2.5 border rounded-xl dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white outline-none"
                  >
                    <option value="_self">Same Tab</option>
                    <option value="_blank">New Tab</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                  Display Location
                </label>
                <select
                  value={position}
                  onChange={(e) => {
                    setPosition(e.target.value as "top" | "bottom");
                    setParentId("");
                  }}
                  className="w-full p-2.5 border rounded-xl dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white outline-none"
                >
                  <option value="top">Top Navbar</option>
                  <option value="bottom">Bottom Navbar (Mega Menu)</option>
                </select>
              </div>

              <div className="flex items-center gap-3 mt-4 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <label
                  htmlFor="isActive"
                  className="text-sm font-semibold text-gray-700 dark:text-gray-300"
                >
                  Enable this link
                </label>
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-6 border-t dark:border-gray-800">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-5 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-sm transition-colors"
                >
                  {editingItem ? "Update Link" : "Add Link"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <MediaLibraryModal
        isOpen={mediaOpen}
        onClose={() => setMediaOpen(false)}
        preferredSize={mediaTarget === "logo" ? "medium" : "thumbnail"}
        title={
          mediaTarget === "logo" ? "Select Store Logo" : "Select Link Image"
        }
        onSelect={(_media, sizeUrl) => {
          if (mediaTarget === "logo") {
            setGlobalSettings({ ...globalSettings, store_logo: sizeUrl });
          } else {
            setIcon(sizeUrl);
          }
          setMediaOpen(false);
        }}
      />
    </div>
  );
}
