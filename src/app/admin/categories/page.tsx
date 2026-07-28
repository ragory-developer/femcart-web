"use client";
import { API_URL } from "@/lib/config";

import MediaLibraryModal from "@/components/admin/MediaLibraryModal";
import SearchableSelect from "@/components/admin/SearchableSelect";
import { showToast } from "@/lib/toast";
import {
  FolderTree,
  Image as ImageIcon,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
  ChevronRight,
  GripVertical,
  Network,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import "react-quill-new/dist/quill.snow.css";
import { motion, AnimatePresence } from "framer-motion";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

interface Category {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  content: string | null;
  seoData: any | null;
  parentId: string | null;
  children?: Category[];
  _count?: { products: number };
}

const API = `${API_URL}/api/categories`;

function getToken() {
  return typeof window !== "undefined"
    ? localStorage.getItem("femcart_access_token") ||
        localStorage.getItem("token") ||
        ""
    : "";
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [imgError, setImgError] = useState<Record<string, boolean>>({});
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>(
    {},
  );

  const toggleNode = (id: string) => {
    setExpandedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const setAllExpanded = (expand: boolean) => {
    const newExpanded: Record<string, boolean> = {};
    if (expand) {
      const traverse = (cats: Category[]) => {
        cats.forEach((cat) => {
          if (cat.children && cat.children.length > 0) {
            newExpanded[cat.id] = true;
            traverse(cat.children);
          }
        });
      };
      traverse(categories);
    }
    setExpandedNodes(newExpanded);
  };

  // Form
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [content, setContent] = useState("");
  const [parentId, setParentId] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [metaKeywords, setMetaKeywords] = useState("");
  const [saving, setSaving] = useState(false);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await fetch(API);
      const json = await res.json();
      if (json.success) setCategories(json.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const resetForm = () => {
    setName("");
    setImage("");
    setParentId("");
    setContent("");
    setMetaTitle("");
    setMetaDescription("");
    setMetaKeywords("");
    setShowForm(false);
    setEditingId(null);
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setName(cat.name);
    setImage(cat.image || "");
    setParentId(cat.parentId || "");
    setContent(cat.content || "");
    setMetaTitle(cat.seoData?.title || "");
    setMetaDescription(cat.seoData?.description || "");
    setMetaKeywords(cat.seoData?.keywords || "");
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return showToast.error("Name is required");

    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        image: image || null,
        parentId: parentId || null,
        content: content || null,
        seoData: {
          title: metaTitle || null,
          description: metaDescription || null,
          keywords: metaKeywords || null,
        },
      };

      console.log("Saving Category Payload:", payload);
      const url = editingId ? `${API}/${editingId}` : API;
      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showToast.success("Category saved successfully!");
        resetForm();
        fetchCategories();
      } else {
        const err = await res.json();
        showToast.error(
          err.message || "Failed to save data. Please check all fields.",
        );
      }
    } catch (err) {
      console.error("Save Error:", err);
      showToast.error("Network error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    try {
      const res = await fetch(`${API}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      if (res.ok) fetchCategories();
      else showToast.error("Failed to delete");
    } catch {
      showToast.error("Network error");
    }
  };

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "clean"],
    ],
  };

  // Flatten tree for display
  const flatList: (Category & { depth: number })[] = [];
  const flatten = (cats: Category[], depth = 0) => {
    cats.forEach((cat) => {
      flatList.push({ ...cat, depth });
      if (cat.children?.length) flatten(cat.children, depth + 1);
    });
  };
  flatten(categories);

  const getProductCount = (cat: Category): number => {
    let count = cat._count?.products || 0;
    if (cat.children && cat.children.length > 0) {
      cat.children.forEach((child) => {
        count += getProductCount(child);
      });
    }
    return count;
  };

  const parentOptions = [
    { value: "", label: "None (Root)" },
    ...flatList.map((c) => ({
      value: c.id,
      label: `${"—".repeat(c.depth)} ${c.name}`,
    })),
  ];

  const filteredFlatList = flatList.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const renderTree = (cats: Category[], depth = 0) => {
    if (!cats || cats.length === 0) return null;
    return (
      <div className="flex flex-col gap-2 w-full">
        {cats.map((cat, index) => {
          const isExpanded = expandedNodes[cat.id];
          const hasChildren = cat.children && cat.children.length > 0;

          return (
            <div key={cat.id} className="flex flex-col">
              <div className="group flex items-center justify-between p-2.5 rounded-[1.25rem] bg-white dark:bg-gray-900 border border-transparent hover:border-emerald-100 dark:hover:border-emerald-900/40 hover:bg-emerald-50/40 dark:hover:bg-emerald-900/10 hover:shadow-sm transition-all relative z-10">
                <div className="flex items-center gap-2">
                  <div className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-emerald-500 transition-colors opacity-0 group-hover:opacity-100 hidden sm:block">
                    <GripVertical size={16} />
                  </div>

                  {/* Expand/Collapse Button */}
                  <div className="w-7 h-7 flex items-center justify-center shrink-0">
                    {hasChildren ? (
                      <button
                        onClick={() => toggleNode(cat.id)}
                        className={`w-6 h-6 flex items-center justify-center rounded-lg transition-all duration-200 ${isExpanded ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400" : "bg-gray-100 text-gray-500 dark:bg-gray-800 hover:bg-emerald-50 hover:text-emerald-500"}`}
                      >
                        <ChevronRight
                          size={14}
                          className={`transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}
                        />
                      </button>
                    ) : (
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 ml-1"></div>
                    )}
                  </div>

                  {/* Image */}
                  {cat.image && cat.image !== "null" && !imgError[cat.id] ? (
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-10 h-10 rounded-[10px] object-cover bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm"
                      onError={() =>
                        setImgError((prev) => ({ ...prev, [cat.id]: true }))
                      }
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-[10px] bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center border border-gray-200 dark:border-gray-700 shadow-sm">
                      <Network size={16} className="text-gray-400" />
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex flex-col justify-center ml-2">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-[14px] text-gray-900 dark:text-white tracking-tight">
                        {cat.name}
                      </p>
                      {cat.seoData?.title && (
                        <span className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                          SEO
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] font-medium text-gray-400">
                        /{cat.slug}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-gray-200 dark:bg-gray-700"></span>
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                        {getProductCount(cat)} ITEMS
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => startEdit(cat)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 transition-colors"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-pink-50 hover:text-pink-600 dark:hover:bg-pink-900/20 transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {/* Children recursive render */}
              <AnimatePresence>
                {hasChildren && isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="mt-1 ml-7 pl-6 border-l-[1.5px] border-gray-100 dark:border-gray-800/60 relative py-1">
                      {renderTree(cat.children!, depth + 1)}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3 tracking-tight">
            <FolderTree size={28} className="text-emerald-600" /> Category
            Management
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
            Organize and manage your product hierarchy
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-md active:scale-95 text-sm"
          >
            <Plus size={18} /> Add New Category
          </button>
        )}
      </div>

      <div className="flex flex-col lg:flex-row-reverse gap-8">
        {/* Form Section */}
        {showForm && (
          <aside className="w-full lg:w-[65%] shrink-0 animate-in slide-in-from-right duration-500">
            <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 p-8 shadow-2xl shadow-emerald-500/5 sticky top-8 max-h-[90vh] overflow-y-auto custom-scrollbar">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                  {editingId ? "Update Category" : "Add New Category"}
                </h2>
                <button
                  onClick={resetForm}
                  className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider pl-1 font-outfit">
                    Category Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Fresh Produce"
                    className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-emerald-500 transition-all font-bold text-gray-900 dark:text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider pl-1 font-outfit">
                    Parent Category (Optional)
                  </label>
                  <SearchableSelect
                    options={parentOptions}
                    value={parentId}
                    onChange={setParentId}
                    placeholder="Root Level"
                    className="category-select"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider pl-1 font-outfit">
                    Description
                  </label>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl overflow-hidden border-none text-gray-900 dark:text-white min-h-[200px]">
                    <ReactQuill
                      theme="snow"
                      value={content}
                      onChange={setContent}
                      modules={quillModules}
                      className="h-32 mb-10"
                    />
                  </div>
                </div>

                <div className="border-t border-gray-100 dark:border-gray-800 pt-6">
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                      <h4 className="text-[11px] font-bold text-gray-900 dark:text-white uppercase tracking-wider font-outfit">
                        SEO Settings
                      </h4>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest pl-1">
                        Meta Title
                      </label>
                      <input
                        type="text"
                        value={metaTitle}
                        onChange={(e) => setMetaTitle(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-1 focus:ring-emerald-500 transition-all text-xs font-bold text-gray-900 dark:text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest pl-1">
                        Meta Keywords
                      </label>
                      <input
                        type="text"
                        value={metaKeywords}
                        onChange={(e) => setMetaKeywords(e.target.value)}
                        placeholder="fresh, organic, daily"
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-1 focus:ring-emerald-500 transition-all text-xs font-bold text-gray-900 dark:text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest pl-1">
                        Meta Description
                      </label>
                      <textarea
                        value={metaDescription}
                        onChange={(e) => setMetaDescription(e.target.value)}
                        rows={2}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-1 focus:ring-emerald-500 transition-all text-xs text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider pl-1 font-outfit">
                    Category Image
                  </label>
                  <div
                    onClick={() => setShowMediaLibrary(true)}
                    className="relative w-full aspect-video rounded-3xl bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500/50 transition-all group overflow-hidden shadow-inner mb-2"
                  >
                    {image ? (
                      <>
                        <img
                          src={image}
                          className="w-full h-full object-cover"
                          alt="Category Representative"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                          <div className="flex flex-col items-center gap-1 scale-90 group-hover:scale-100 transition-transform">
                            <ImageIcon size={20} className="text-white" />
                            <span className="text-white font-black uppercase tracking-[0.2em] text-[9px]">
                              Change Asset
                            </span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="p-3 bg-white dark:bg-gray-900 rounded-2xl shadow-sm mb-2 group-hover:scale-110 transition-transform">
                          <ImageIcon
                            size={24}
                            className="text-gray-300 group-hover:text-emerald-500 transition-colors"
                          />
                        </div>
                        <span className="text-gray-400 font-black text-[9px] uppercase tracking-widest text-center px-4">
                          Click to Upload Category Media
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-3.5 bg-emerald-600 text-white rounded-xl font-bold uppercase tracking-wider shadow-md hover:bg-emerald-700 active:scale-[0.98] transition-all disabled:opacity-50 text-sm"
                >
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Update Category"
                      : "Create Category"}
                </button>
              </form>
            </div>
          </aside>
        )}

        {/* List Section */}
        <div className="flex-1 bg-white dark:bg-gray-900 rounded-[3rem] border border-gray-100 dark:border-gray-800 p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                Categories Overview
              </h3>
              <p className="text-xs text-gray-500">
                Manage your product categorization structure
              </p>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-800 p-1 rounded-xl">
                <button
                  onClick={() => setAllExpanded(true)}
                  className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 hover:text-emerald-600 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-all"
                >
                  Expand All
                </button>
                <button
                  onClick={() => setAllExpanded(false)}
                  className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 hover:text-emerald-600 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-all"
                >
                  Collapse All
                </button>
              </div>
              <div className="relative hidden md:block">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2.5 rounded-xl border-none bg-gray-50 dark:bg-gray-800 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none text-gray-900 dark:text-white w-64 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="w-full">
            {loading ? (
              <div className="py-20 text-center text-gray-400 font-medium tracking-widest uppercase">
                Fetching ecosystem...
              </div>
            ) : searchQuery ? (
              <div className="grid gap-3">
                {filteredFlatList.length === 0 ? (
                  <div className="py-20 text-center">
                    <FolderTree
                      size={48}
                      className="mx-auto text-gray-200 mb-4"
                    />
                    <p className="text-gray-400 font-medium tracking-tight uppercase tracking-widest">
                      No nodes found in this sector.
                    </p>
                  </div>
                ) : (
                  renderTree(
                    filteredFlatList.map((c) => ({ ...c, children: [] })),
                  )
                )}
              </div>
            ) : categories.length === 0 ? (
              <div className="py-20 text-center">
                <FolderTree size={48} className="mx-auto text-gray-200 mb-4" />
                <p className="text-gray-400 font-medium tracking-tight uppercase tracking-widest">
                  No nodes found in this sector.
                </p>
              </div>
            ) : (
              renderTree(categories)
            )}
          </div>
        </div>
      </div>

      <MediaLibraryModal
        isOpen={showMediaLibrary}
        onClose={() => setShowMediaLibrary(false)}
        onSelect={(media, url) => setImage(url)}
        preferredSize="medium"
        title="Select Category Image"
      />
    </div>
  );
}
