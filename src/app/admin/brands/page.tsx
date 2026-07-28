"use client";
import { API_URL } from "@/lib/config";

import MediaLibraryModal from "@/components/admin/MediaLibraryModal";
import { showToast } from "@/lib/toast";
import {
  Image as ImageIcon,
  Pencil,
  Plus,
  Search,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

interface Brand {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  content: string | null;
  seoData: any | null;
  _count?: { products: number };
}

const API = `${API_URL}/api/brands`;

function getToken() {
  return typeof window !== "undefined"
    ? localStorage.getItem("femcart_access_token") ||
        localStorage.getItem("token") ||
        ""
    : "";
}

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [imgError, setImgError] = useState<Record<string, boolean>>({});

  const [name, setName] = useState("");
  const [logo, setLogo] = useState("");
  const [content, setContent] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [metaKeywords, setMetaKeywords] = useState("");
  const [saving, setSaving] = useState(false);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);

  const fetchBrands = async () => {
    try {
      const res = await fetch(`${API}?limit=1000`);
      const json = await res.json();
      if (json.success) setBrands(json.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const resetForm = () => {
    setName("");
    setLogo("");
    setContent("");
    setMetaTitle("");
    setMetaDescription("");
    setMetaKeywords("");
    setShowForm(false);
    setEditingId(null);
  };

  const startEdit = (brand: any) => {
    setEditingId(brand.id);
    setName(brand.name);
    setLogo(brand.logo || "");
    setContent(brand.content || "");
    setMetaTitle(brand.seoData?.title || "");
    setMetaDescription(brand.seoData?.description || "");
    setMetaKeywords(brand.seoData?.keywords || "");
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return showToast.error("Brand name is required");

    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        logo: logo || null,
        content: content || null,
        seoData: {
          title: metaTitle || null,
          description: metaDescription || null,
          keywords: metaKeywords || null,
        },
      };

      console.log("Saving Brand Payload:", payload);
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
        showToast.success("Brand saved successfully!");
        resetForm();
        fetchBrands();
      } else {
        const err = await res.json();
        showToast.error(err.message || "Failed to save brand data.");
      }
    } catch (err) {
      console.error("Brand Save Error:", err);
      showToast.error("Network error occurred while saving brand.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this brand?")) return;
    try {
      const res = await fetch(`${API}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      if (res.ok) fetchBrands();
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

  const filteredBrands = brands.filter((b) =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3 tracking-tight">
            <Tag size={28} className="text-emerald-600" /> Brand Management
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
            Manage and organize your product brands
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-md active:scale-95 text-sm"
          >
            <Plus size={18} /> Add New Brand
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
                  {editingId ? "Update Brand" : "Add New Brand"}
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
                    Brand Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Organic Roots"
                    className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-emerald-500 transition-all font-bold text-gray-900 dark:text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider pl-1 font-outfit">
                    Brand Story
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
                        placeholder="organic, healthy, premium"
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
                    Brand Logo
                  </label>
                  <div
                    onClick={() => setShowMediaLibrary(true)}
                    className="relative w-full aspect-video rounded-3xl bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500/50 transition-all group overflow-hidden shadow-inner mb-2"
                  >
                    {logo ? (
                      <>
                        <img
                          src={logo}
                          className="w-full h-full object-contain bg-white dark:bg-gray-900 p-4"
                          alt="Brand Representative"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                          <div className="flex flex-col items-center gap-1 scale-90 group-hover:scale-100 transition-transform">
                            <ImageIcon size={20} className="text-white" />
                            <span className="text-white font-black uppercase tracking-[0.2em] text-[9px]">
                              Change Identity
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
                          Click to Upload Brand Visual
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
                      ? "Update Brand"
                      : "Create Brand"}
                </button>
              </form>
            </div>
          </aside>
        )}

        {/* List Section */}
        <div className="flex-1 bg-white dark:bg-gray-900 rounded-[3rem] border border-gray-100 dark:border-gray-800 p-8 shadow-sm">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                Brands Overview
              </h3>
              <p className="text-xs text-gray-500">
                Manage your brand portfolio
              </p>
            </div>
            <div className="relative hidden md:block">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="text"
                placeholder="Search brands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-3 rounded-2xl border-none bg-gray-50 dark:bg-gray-800 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none text-gray-900 dark:text-white w-64 transition-all"
              />
            </div>
          </div>

          <div className="grid gap-4">
            {loading ? (
              <div className="py-20 text-center text-gray-400 font-medium">
                Summoning brands...
              </div>
            ) : filteredBrands.length === 0 ? (
              <div className="py-20 text-center">
                <Tag size={48} className="mx-auto text-gray-200 mb-4" />
                <p className="text-gray-400 font-medium tracking-tight">
                  No brands found.
                </p>
              </div>
            ) : (
              filteredBrands.map((brand) => (
                <div
                  key={brand.id}
                  className="group flex items-center justify-between p-4 rounded-3xl border border-gray-50 dark:border-gray-800 hover:border-emerald-100 dark:hover:border-emerald-900/30 hover:bg-emerald-50/20 dark:hover:bg-emerald-900/5 transition-all"
                >
                  <div className="flex items-center gap-4">
                    {brand.logo &&
                    brand.logo !== "null" &&
                    !imgError[brand.id] ? (
                      <img
                        src={brand.logo}
                        alt={brand.name}
                        className="w-14 h-14 rounded-2xl object-contain bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 p-1"
                        onError={() =>
                          setImgError((prev) => ({ ...prev, [brand.id]: true }))
                        }
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center border border-emerald-100 dark:border-emerald-900/20">
                        <Tag size={20} className="text-emerald-500" />
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        {brand.name}
                        {brand.seoData?.title && (
                          <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter">
                            SEO
                          </span>
                        )}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                          /{brand.slug}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                          {brand._count?.products ?? 0} ITEMS
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startEdit(brand)}
                      className="p-3 rounded-2xl hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-400 hover:text-blue-500 transition-colors"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(brand.id)}
                      className="p-3 rounded-2xl hover:bg-pink-50 dark:hover:bg-pink-900/20 text-gray-400 hover:text-pink-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <MediaLibraryModal
        isOpen={showMediaLibrary}
        onClose={() => setShowMediaLibrary(false)}
        onSelect={(media, url) => setLogo(url)}
        preferredSize="medium"
        title="Select Brand Logo"
      />
    </div>
  );
}
