"use client";

import MediaLibraryModal from "@/components/admin/MediaLibraryModal";
import { API_URL } from "@/lib/config";
import { Edit2, Image as ImageIcon, Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type Banner = {
  id: string;
  title: string | null;
  badgeText: string | null;
  description: string | null;
  imageSrc: string;
  ctaText: string | null;
  ctaUrl: string | null;
  position: string;
  sortOrder: number;
  isActive: boolean;
};

export default function BannerManager() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [mediaOpen, setMediaOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [badgeText, setBadgeText] = useState("");
  const [description, setDescription] = useState("");
  const [imageSrc, setImageSrc] = useState("");
  const [ctaText, setCtaText] = useState("");
  const [ctaUrl, setCtaUrl] = useState("");
  const [position, setPosition] = useState("hero");
  const [isActive, setIsActive] = useState(true);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("femcart_access_token") ||
            localStorage.getItem("token") ||
            ""
          : "";
      const res = await fetch(`${API_URL}/api/banners`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const json = await res.json();
      if (json.success) setBanners(json.data);
    } catch (err) {
      toast.error("Failed to load banners");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const resetForm = () => {
    setEditingBanner(null);
    setTitle("");
    setBadgeText("");
    setDescription("");
    setImageSrc("");
    setCtaText("");
    setCtaUrl("");
    setPosition("hero");
    setIsActive(true);
    setIsModalOpen(false);
  };

  const openEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setTitle(banner.title || "");
    setBadgeText(banner.badgeText || "");
    setDescription(banner.description || "");
    setImageSrc(banner.imageSrc || "");
    setCtaText(banner.ctaText || "");
    setCtaUrl(banner.ctaUrl || "");
    setPosition(banner.position || "hero");
    setIsActive(banner.isActive);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("femcart_access_token") ||
          localStorage.getItem("token") ||
          ""
        : "";

    if (!imageSrc) {
      toast.error("Image is required");
      return;
    }

    const payload = {
      title,
      badgeText,
      description,
      imageSrc,
      ctaText,
      ctaUrl,
      position,
      isActive,
    };

    try {
      const res = await fetch(
        `${API_URL}/api/banners${editingBanner ? `/${editingBanner.id}` : ""}`,
        {
          method: editingBanner ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );
      const json = await res.json();
      if (json.success) {
        toast.success(
          editingBanner ? "Updated successfully" : "Created successfully",
        );
        fetchBanners();
        resetForm();
      } else {
        toast.error(json.message || "Operation failed");
      }
    } catch (err) {
      toast.error("Failed to save banner");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this banner?")) return;
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("femcart_access_token") ||
            localStorage.getItem("token") ||
            ""
          : "";
      const res = await fetch(`${API_URL}/api/banners/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Deleted successfully");
        fetchBanners();
      } else {
        toast.error(json.message);
      }
    } catch (err) {
      toast.error("Failed to delete banner");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Promotional Banners
        </h2>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-pink-600 hover:bg-pink-700 shadow-sm shadow-pink-600/20 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
        >
          <Plus size={18} /> Add New Banner
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10">Loading...</div>
      ) : banners.length === 0 ? (
        <div className="text-center py-10 text-gray-500 border rounded-xl border-dashed">
          No banners found. Add your first banner!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banners.map((banner) => (
            <div
              key={banner.id}
              className={`group border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden bg-white dark:bg-gray-950 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${!banner.isActive ? "opacity-50 grayscale-[50%]" : ""}`}
            >
              <div className="h-48 bg-gray-100 w-full relative overflow-hidden">
                <img
                  src={banner.imageSrc}
                  alt={banner.title || "Banner"}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-gray-900 px-2.5 py-1 text-[10px] rounded-md uppercase font-bold tracking-wider shadow-sm">
                  {banner.position}
                </div>
              </div>
              <div className="p-5">
                {banner.badgeText && (
                  <span className="text-[10px] uppercase font-bold tracking-wider text-pink-600 bg-pink-50 border border-pink-100/50 px-2 py-1 rounded-md mb-3 inline-block">
                    {banner.badgeText}
                  </span>
                )}
                <h3 className="font-bold text-gray-900 dark:text-white line-clamp-1 text-lg">
                  {banner.title || "Untitled Banner"}
                </h3>
                <p className="text-sm text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">
                  {banner.description}
                </p>
                <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100 dark:border-gray-800/60">
                  <span
                    className={`text-xs px-2.5 py-1 rounded-md font-semibold flex items-center gap-1.5 ${banner.isActive ? "bg-pink-50 text-pink-600 border border-pink-100/50" : "bg-gray-100 text-gray-500"}`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${banner.isActive ? "bg-pink-500" : "bg-gray-400"}`}
                    ></span>
                    {banner.isActive ? "Active" : "Hidden"}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(banner)}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(banner.id)}
                      className="p-2 text-gray-500 hover:text-pink-600 hover:bg-pink-50 rounded-2xl transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-2xl shadow-xl my-8">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingBanner ? "Edit Banner" : "Add Banner"}
              </h3>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Banner Image *
                  </label>
                  <div
                    onClick={() => setMediaOpen(true)}
                    className="w-full h-40 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl flex items-center justify-center cursor-pointer hover:border-pink-500 hover:bg-pink-50/50 dark:hover:bg-pink-900/10 transition-all group overflow-hidden bg-gray-50 dark:bg-gray-900"
                  >
                    {imageSrc ? (
                      <img
                        src={imageSrc}
                        alt="Preview"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="text-center text-gray-400 group-hover:text-pink-500 transition-colors">
                        <ImageIcon
                          size={36}
                          className="mx-auto mb-3 opacity-50 group-hover:opacity-100"
                        />
                        <span className="text-sm font-medium">
                          Click to browse Media Library
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Position / Group
                  </label>
                  <select
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 focus:bg-white focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all outline-none"
                  >
                    <option value="hero">Hero Slider (Main)</option>
                    <option value="bento">Bento Grids</option>
                    <option value="bestbuy">Best Buy</option>
                    <option value="three-product">Three Product Banner</option>
                    <option value="two-image-grid">Two Image Grid</option>
                    <option value="wide-overflow">Wide Overflow Banner</option>
                    <option value="routine">Routine Banner</option>
                    <option value="consultation">Consultation Banner</option>
                    <option value="newsletter">Newsletter Banner</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Badge Text
                  </label>
                  <input
                    value={badgeText}
                    onChange={(e) => setBadgeText(e.target.value)}
                    className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 focus:bg-white focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all outline-none"
                    placeholder="e.g. Special Offer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Title
                  </label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 focus:bg-white focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all outline-none"
                    placeholder="Main Heading"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Description
                  </label>
                  <input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 focus:bg-white focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all outline-none"
                    placeholder="Sub-text"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Button Text
                  </label>
                  <input
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 focus:bg-white focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all outline-none"
                    placeholder="e.g. Shop Now"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Button Link URL
                  </label>
                  <input
                    value={ctaUrl}
                    onChange={(e) => setCtaUrl(e.target.value)}
                    className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 focus:bg-white focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all outline-none"
                    placeholder="/products/..."
                  />
                </div>

                <div className="col-span-2 flex items-center gap-3 mt-2 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded text-pink-600 w-5 h-5 focus:ring-pink-500 cursor-pointer"
                  />
                  <div>
                    <label
                      htmlFor="isActive"
                      className="text-sm font-semibold cursor-pointer block text-gray-900 dark:text-white"
                    >
                      Banner is Active
                    </label>
                    <p className="text-xs text-gray-500">
                      If unchecked, this banner will be hidden from the
                      storefront.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl font-semibold shadow-sm shadow-pink-600/20 transition-all"
                >
                  Save Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <MediaLibraryModal
        isOpen={mediaOpen}
        onClose={() => setMediaOpen(false)}
        preferredSize="full"
        title="Pick Banner Image"
        onSelect={(_media, sizeUrl) => {
          setImageSrc(sizeUrl);
          setMediaOpen(false);
        }}
      />
    </div>
  );
}
