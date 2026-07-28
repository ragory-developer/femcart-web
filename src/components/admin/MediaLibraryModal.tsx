"use client";

import { API_URL } from "@/lib/config";
import { Logger } from "@/lib/logger";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Save, Search, Trash2, Upload, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import Swal from "sweetalert2";
import MediaGrid, { MediaItem } from "./MediaGrid";

const API = `${API_URL}/api/media`;

function getToken() {
  return typeof window !== "undefined"
    ? localStorage.getItem("femcart_access_token") ||
        localStorage.getItem("token") ||
        ""
    : "";
}

interface MediaLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (media: any, sizeUrl: any) => void;
  /** Which size URL to return on select: 'thumbnail' | 'medium' | 'full' */
  preferredSize?: "thumbnail" | "medium" | "full";
  title?: string;
  multiple?: boolean;
}

export default function MediaLibraryModal({
  isOpen,
  onClose,
  onSelect,
  preferredSize = "medium",
  title = "Media Library",
  multiple = false,
}: MediaLibraryModalProps) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<MediaItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [tab, setTab] = useState<"library" | "upload">("library");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Detail editing
  const [editAlt, setEditAlt] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editCaption, setEditCaption] = useState("");
  const [saving, setSaving] = useState(false);

  // Fetch media
  const fetchMedia = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "500" });
      if (searchQuery) params.set("search", searchQuery);
      const res = await fetch(`${API}?${params}`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
        cache: "no-store",
      });
      const json = await res.json();
      if (json.success) {
        const rawData = json.data || [];
        const uniqueItems = Array.from(
          new Map(rawData.map((item: MediaItem) => [item.id, item])).values(),
        );
        setItems(uniqueItems as MediaItem[]);
      } else {
        toast.error(json.message || "Failed to fetch media");
        Logger.warn("Media fetch failed", json, "MediaLibraryModal");
      }
    } catch (e) {
      toast.error("Network error while fetching media");
      Logger.error("Failed to fetch media", e, "MediaLibraryModal");
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
      setSelectedItems([]);
    }
  }, [isOpen, fetchMedia]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Handle selection
  const handleSelect = (item: MediaItem) => {
    if (multiple) {
      setSelectedItems((prev) => {
        const isSelected = prev.find((i) => i.id === item.id);
        const newItems = isSelected
          ? prev.filter((i) => i.id !== item.id)
          : [...prev, item];

        if (newItems.length === 1) {
          setEditAlt(newItems[0].altText || "");
          setEditTitle(newItems[0].title || "");
          setEditCaption(newItems[0].caption || "");
        } else {
          setEditAlt("");
          setEditTitle("");
          setEditCaption("");
        }
        return newItems;
      });
    } else {
      setSelectedItems([item]);
      setEditAlt(item.altText || "");
      setEditTitle(item.title || "");
      setEditCaption(item.caption || "");
    }
    setTab("library");
  };

  // Upload handler
  const handleUpload = async (files: File[]) => {
    setUploading(true);
    setUploadProgress(0);

    let completed = 0;
    const newlyUploaded: MediaItem[] = [];
    for (const file of files) {
      const formData = new FormData();
      formData.append("image", file);

      try {
        const res = await fetch(`${API}/upload`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
          body: formData,
        });
        if (!res.ok) {
          const err = await res.json();
          toast.error(err.message || `Failed to upload ${file.name}`);
          Logger.warn("Upload failed", err, "MediaLibraryModal");
        } else {
          const successData = await res.json();
          if (successData.data) {
            newlyUploaded.push(successData.data);
          }
          completed++;
          setUploadProgress(Math.round((completed / files.length) * 100));
        }
      } catch (e) {
        toast.error(`Network error uploading ${file.name}`);
        Logger.error("Upload failed", e, "MediaLibraryModal");
      }
    }

    setUploading(false);
    setUploadProgress(0);

    if (completed > 0) {
      toast.success(`Successfully uploaded ${completed} file(s)`);
    }

    setTab("library");
    await fetchMedia();

    if (newlyUploaded.length > 0) {
      if (multiple) {
        setSelectedItems((prev) => [...prev, ...newlyUploaded]);
      } else {
        const lastItem = newlyUploaded[newlyUploaded.length - 1];
        setSelectedItems([lastItem]);
        setEditAlt(lastItem.altText || "");
        setEditTitle(lastItem.title || "");
        setEditCaption(lastItem.caption || "");
      }
    }
  };

  // Dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"] },
    maxSize: 10 * 1024 * 1024,
    onDrop: handleUpload,
  });

  // Save attributes
  const handleSaveAttributes = async () => {
    if (selectedItems.length !== 1) return;
    const selected = selectedItems[0];
    setSaving(true);
    try {
      const res = await fetch(`${API}/${selected.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          altText: editAlt,
          title: editTitle,
          caption: editCaption,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        setSelectedItems([json.data]);
        setItems((prev) =>
          prev.map((i) => (i.id === json.data.id ? json.data : i)),
        );
        toast.success("Attributes saved");
      } else {
        const err = await res.json();
        toast.error(err.message || "Failed to save attributes");
        Logger.warn("Save attributes failed", err, "MediaLibraryModal");
      }
    } catch (e) {
      toast.error("Network error while saving attributes");
      Logger.error("Save attributes failed", e, "MediaLibraryModal");
    } finally {
      setSaving(false);
    }
  };

  // Delete
  const handleDelete = async () => {
    if (selectedItems.length === 0) return;

    const isDark = document.documentElement.classList.contains("dark");
    const result = await Swal.fire({
      title:
        '<span class="text-pink-600 dark:text-pink-500 font-bold text-2xl flex items-center gap-2 justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg> Critical Action</span>',
      html: `
        <div class="text-left space-y-4 mt-2">
          <p class="text-gray-700 dark:text-gray-300 text-base">
            You are about to permanently delete <b class="text-gray-900 dark:text-white font-bold">${selectedItems.length} image(s)</b> from your media library.
          </p>
          <div class="p-4 bg-pink-50 dark:bg-pink-900/20 text-pink-800 dark:text-pink-300 rounded-xl border border-pink-200 dark:border-pink-800/50 text-sm leading-relaxed shadow-inner">
            <strong class="font-black flex items-center gap-1.5 mb-2 uppercase tracking-wide">
              Danger: Breaking Change Possible
            </strong>
            If these images are currently being used in any <b>Products</b>, <b>Pages</b>, or <b>Categories</b>, they will immediately disappear from the live website and break those layouts!
          </div>
          <p class="text-sm text-gray-500 dark:text-gray-400 font-medium">
            This action completely bypasses the trash and cannot be undone. Are you absolutely sure?
          </p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText:
        '<div class="flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg> Yes, delete permanently</div>',
      cancelButtonText: "Cancel",
      background: isDark ? "#1f2937" : "#ffffff",
      color: isDark ? "#f9fafb" : "#111827",
      customClass: {
        popup:
          "rounded-xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.3)] shadow-pink-500/10 border border-gray-100 dark:border-gray-800",
        confirmButton:
          "rounded-xl font-bold px-6 py-3 shadow-lg shadow-pink-600/20 hover:scale-105 transition-transform",
        cancelButton:
          "rounded-xl font-bold px-6 py-3 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors",
      },
      didOpen: () => {
        const container = Swal.getContainer();
        if (container) container.style.zIndex = "99999";
      },
    });

    if (!result.isConfirmed) return;

    try {
      let deletedCount = 0;
      for (const item of selectedItems) {
        const res = await fetch(`${API}/${item.id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        });
        if (res.ok) deletedCount++;
      }

      if (deletedCount > 0) {
        toast.success(`Deleted ${deletedCount} file(s)`);
      }

      setSelectedItems([]);
      fetchMedia();
    } catch (e) {
      toast.error("Network error while deleting media");
      Logger.error("Failed to delete media", e, "MediaLibraryModal");
    }
  };

  // Insert selected
  const handleInsert = () => {
    if (selectedItems.length === 0) return;
    if (multiple) {
      const urls = selectedItems.map((item) => {
        const urlMap = {
          thumbnail: item.urlThumbnail,
          medium: item.urlMedium,
          full: item.urlFull,
        };
        const rawUrl = urlMap[preferredSize] || item.urlFull;
        return rawUrl;
      });
      onSelect(selectedItems, urls);
    } else {
      const selected = selectedItems[0];
      const urlMap = {
        thumbnail: selected.urlThumbnail,
        medium: selected.urlMedium,
        full: selected.urlFull,
      };
      const rawUrl = urlMap[preferredSize] || selected.urlFull;
      onSelect(selected, rawUrl);
    }
    onClose();
  };

  // Format file size
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="fixed inset-4 md:inset-8 bg-white dark:bg-gray-800 rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.3)] shadow-pink-500/10 z-[10000] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-black text-gray-900 dark:text-white">
                  {title}
                </h2>
                <div className="flex bg-gray-100 dark:bg-gray-700 rounded-xl p-0.5">
                  <button
                    onClick={() => setTab("library")}
                    className={`px-4 py-1.5 rounded-2xl text-sm font-medium transition-colors ${
                      tab === "library"
                        ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Media Library
                  </button>
                  <button
                    onClick={() => setTab("upload")}
                    className={`px-4 py-1.5 rounded-2xl text-sm font-medium transition-colors ${
                      tab === "upload"
                        ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Upload
                  </button>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="flex flex-1 min-h-0">
              {/* Main Content */}
              <div className="flex-1 flex flex-col min-w-0">
                {tab === "library" ? (
                  <>
                    {/* Search bar */}
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
                      <div className="relative max-w-md">
                        <Search
                          size={18}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                          type="text"
                          placeholder="Search media..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>

                    {/* Grid */}
                    <div className="flex-1 overflow-y-auto">
                      <MediaGrid
                        items={items}
                        selectedIds={selectedItems.map((i) => i.id)}
                        onSelect={handleSelect}
                        loading={loading}
                      />
                    </div>
                  </>
                ) : (
                  /* Upload Tab */
                  <div className="flex-1 flex items-center justify-center p-8">
                    <div
                      {...getRootProps()}
                      className={`w-full max-w-2xl border-2 border-dashed rounded-2xl p-20 text-center cursor-pointer transition-all bg-white dark:bg-gray-800 shadow-sm border-gray-200 dark:border-gray-700 hover:border-pink-500 hover:shadow-pink-500/10 ${
                        isDragActive
                          ? "border-pink-500 bg-pink-50 dark:bg-pink-900/20"
                          : "border-gray-300 dark:border-gray-650 hover:border-pink-400 hover:bg-gray-50 dark:hover:bg-gray-750"
                      }`}
                    >
                      <input {...getInputProps()} />
                      {uploading ? (
                        <div className="space-y-4">
                          <Loader2
                            size={48}
                            className="mx-auto text-pink-500 animate-spin"
                          />
                          <p className="text-lg font-bold text-gray-700 dark:text-gray-300">
                            Uploading... {uploadProgress}%
                          </p>
                          <div className="w-64 mx-auto bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-pink-500 h-2 rounded-full transition-all"
                              style={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="w-20 h-20 mx-auto rounded-2xl bg-pink-50 dark:bg-pink-900/20 flex items-center justify-center">
                            <Upload size={32} className="text-pink-500" />
                          </div>
                          <div>
                            <p className="text-lg font-bold text-gray-700 dark:text-gray-300">
                              Drag & Drop your media files here
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              or click to browse from your computer
                            </p>
                          </div>
                          <p className="text-xs text-gray-400">
                            PNG, JPG, GIF, WebP up to 10MB
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Detail Sidebar */}
              {selectedItems.length === 1 &&
                tab === "library" &&
                (() => {
                  const selected = selectedItems[0];
                  return (
                    <div className="w-[320px] border-l border-gray-200 dark:border-gray-700 flex flex-col shrink-0 bg-gray-50 dark:bg-gray-900/50">
                      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="font-bold text-sm text-gray-900 dark:text-white uppercase tracking-wide">
                          Attachment Details
                        </h3>
                      </div>

                      <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        <>
                          {/* Preview */}
                          <div className="relative aspect-video rounded-2xl overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            {}
                            <img
                              src={selected.urlMedium || ""}
                              alt={selected.altText || ""}
                              className="max-w-full max-h-full object-contain"
                            />
                          </div>

                          {/* File info */}
                          <div className="text-xs space-y-1.5 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700">
                            <p className="flex justify-between">
                              <span className="font-medium">File:</span>
                              <span className="truncate ml-2 text-gray-700 dark:text-gray-300 max-w-[180px]">
                                {selected.originalName}
                              </span>
                            </p>
                            <p className="flex justify-between">
                              <span className="font-medium">Type:</span>
                              <span className="text-gray-700 dark:text-gray-300">
                                {selected.fileType}
                              </span>
                            </p>
                            <p className="flex justify-between">
                              <span className="font-medium">Size:</span>
                              <span className="text-gray-700 dark:text-gray-300">
                                {formatSize(selected.fileSize)}
                              </span>
                            </p>
                            {selected.width && selected.height && (
                              <p className="flex justify-between">
                                <span className="font-medium">Dimensions:</span>
                                <span className="text-gray-700 dark:text-gray-300">
                                  {selected.width} × {selected.height}
                                </span>
                              </p>
                            )}
                            <p className="flex justify-between">
                              <span className="font-medium">Uploaded:</span>
                              <span className="text-gray-700 dark:text-gray-300">
                                {new Date(
                                  selected.createdAt,
                                ).toLocaleDateString()}
                              </span>
                            </p>
                          </div>

                          {/* Attribute Editing */}
                          <div className="space-y-3">
                            <div>
                              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">
                                Title
                              </label>
                              <input
                                type="text"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                className="w-full px-3 py-2 rounded-2xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none text-gray-900 dark:text-white"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">
                                Alt Text{" "}
                                <span className="text-gray-400 font-normal">
                                  (SEO)
                                </span>
                              </label>
                              <input
                                type="text"
                                value={editAlt}
                                onChange={(e) => setEditAlt(e.target.value)}
                                placeholder="Describe this image for accessibility"
                                className="w-full px-3 py-2 rounded-2xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none text-gray-900 dark:text-white"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">
                                Caption
                              </label>
                              <textarea
                                value={editCaption}
                                onChange={(e) => setEditCaption(e.target.value)}
                                rows={2}
                                className="w-full px-3 py-2 rounded-2xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none text-gray-900 dark:text-white resize-none"
                              />
                            </div>
                          </div>

                          {/* Insert by Size */}
                          <div className="text-xs space-y-2 bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700">
                            <p className="font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
                              Insert Image
                            </p>
                            {(["thumbnail", "medium", "full"] as const).map(
                              (size) => {
                                const urlMap = {
                                  thumbnail: selected.urlThumbnail,
                                  medium: selected.urlMedium,
                                  full: selected.urlFull,
                                };
                                const labels: Record<string, string> = {
                                  thumbnail: "150px",
                                  medium: "300px",
                                  full: "Original",
                                };
                                const isPreferred = size === preferredSize;
                                return (
                                  <button
                                    key={size}
                                    onClick={() => {
                                      const rawUrl =
                                        urlMap[size as keyof typeof urlMap] ||
                                        selected.urlFull;
                                      onSelect(selected, rawUrl);
                                      onClose();
                                    }}
                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-2xl border transition-colors ${
                                      isPreferred
                                        ? "border-pink-500 bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-300 font-semibold"
                                        : "border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                                    }`}
                                  >
                                    <span className="capitalize font-medium">
                                      {size}
                                    </span>
                                    <span className="text-gray-400 dark:text-gray-500 text-[11px]">
                                      {labels[size]}
                                    </span>
                                  </button>
                                );
                              },
                            )}
                          </div>
                        </>

                        {/* Common Actions (Save & Delete) */}
                        <div className="flex gap-2 mt-4">
                          <button
                            onClick={handleSaveAttributes}
                            disabled={saving}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 bg-pink-600 hover:bg-pink-600 text-white px-3 py-2 rounded-2xl text-sm font-bold transition-colors disabled:opacity-50"
                          >
                            <Save size={14} /> {saving ? "Saving..." : "Save"}
                          </button>
                          <button
                            onClick={handleDelete}
                            className="px-3 py-2 rounded-2xl text-sm font-medium text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Footer: Insert */}
                      <div className="p-4 border-t border-gray-200 dark:border-gray-700 shrink-0">
                        <button
                          onClick={handleInsert}
                          className="w-full bg-pink-600 hover:bg-pink-600 text-white py-2.5 rounded-xl text-sm font-bold transition-colors shadow-sm"
                        >
                          Insert Image
                        </button>
                      </div>
                    </div>
                  );
                })()}
            </div>
          </motion.div>

          {/* Floating Pill for Multi-Select */}
          {selectedItems.length > 1 && tab === "library" && (
            <motion.div
              initial={{ y: 50, opacity: 0, x: "-50%", scale: 0.95 }}
              animate={{ y: 0, opacity: 1, x: "-50%", scale: 1 }}
              exit={{ y: 50, opacity: 0, x: "-50%", scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="fixed bottom-8 left-1/2 z-[10010] bg-white dark:bg-gray-800 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.3)] shadow-pink-500/10 rounded-full pl-6 pr-2 py-2 flex items-center gap-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center gap-3">
                <div className="bg-pink-100 dark:bg-pink-900/50 text-pink-600 dark:text-pink-400 w-8 h-8 rounded-full flex items-center justify-center font-bold">
                  {selectedItems.length}
                </div>
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  Selected
                </span>
              </div>

              <div className="w-px h-6 bg-gray-200 dark:bg-gray-700" />

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDelete}
                  className="p-2 text-gray-400 hover:text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/20 rounded-full transition-colors group relative"
                  title="Delete Selected"
                >
                  <Trash2 size={20} />
                </button>
                <button
                  onClick={handleInsert}
                  className="px-6 py-2.5 bg-pink-600 text-white hover:bg-pink-600 shadow-lg shadow-pink-600/20 rounded-full text-sm font-bold flex items-center gap-2 transition-transform hover:scale-105 active:scale-95"
                >
                  Insert {selectedItems.length} Images
                </button>
                <button
                  onClick={() => setSelectedItems([])}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ml-1"
                  title="Clear Selection"
                >
                  <X size={20} />
                </button>
              </div>
            </motion.div>
          )}
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
