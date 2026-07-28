"use client";
import { API_URL } from "@/lib/config";

import { AnimatePresence, motion } from "framer-motion";
import {
  ImagePlus,
  Loader2,
  Save,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";
import { UndoToast } from "@/components/ui/UndoToast";
import { useSettingsStore } from "@/store/settingsStore";
import { showToast } from "@/lib/toast";
import { useDropzone } from "react-dropzone";

const API = `${API_URL}/api/media`;

function getToken() {
  return typeof window !== "undefined"
    ? localStorage.getItem("femcart_access_token") ||
        localStorage.getItem("token") ||
        ""
    : "";
}

interface MediaItem {
  id: string;
  fileName: string;
  originalName: string;
  fileType: string;
  fileSize: number;
  altText: string | null;
  title: string | null;
  caption: string | null;
  description: string | null;
  width: number | null;
  height: number | null;
  urlThumbnail: string;
  urlMedium: string;
  urlFull: string;
  createdAt: string;
}

export default function AdminMediaPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItems, setSelectedItems] = useState<MediaItem[]>([]);
  const [pendingDeletions, setPendingDeletions] = useState<string[]>([]);
  const [showUndo, setShowUndo] = useState(false);
  const { settings } = useSettingsStore();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Detail editing
  const [editAlt, setEditAlt] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editCaption, setEditCaption] = useState("");
  const [saving, setSaving] = useState(false);

  const LIMIT = 24;

  // Fetch media (initial or search)
  const fetchMedia = useCallback(
    async (pageNum: number, append = false) => {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);

      try {
        const params = new URLSearchParams({
          limit: String(LIMIT),
          page: String(pageNum),
        });
        if (searchQuery) params.set("search", searchQuery);

        const res = await fetch(`${API}?${params}`);
        const json = await res.json();

        if (json.success) {
          const newItems = json.data || [];
          setItems((prev) => {
            const combined = append ? [...prev, ...newItems] : newItems;
            const uniqueItems = Array.from(
              new Map(
                combined.map((item: MediaItem) => [item.id, item]),
              ).values(),
            );
            return uniqueItems as MediaItem[];
          });
          setHasMore(
            json.pagination
              ? pageNum < json.pagination.totalPages
              : newItems.length === LIMIT,
          );
        }
      } catch (e) {
        console.error("Failed to fetch media:", e);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [searchQuery],
  );

  // Initial load + search reset
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchMedia(1, false);
  }, [fetchMedia]);

  // Infinite scroll observer
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          setPage((prev) => {
            const next = prev + 1;
            fetchMedia(next, true);
            return next;
          });
        }
      },
      { threshold: 0.1 },
    );

    if (sentinelRef.current) {
      observerRef.current.observe(sentinelRef.current);
    }

    return () => observerRef.current?.disconnect();
  }, [hasMore, loadingMore, loading, fetchMedia]);

  // Select handler
  const handleSelect = (item: MediaItem) => {
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
  };

  // Upload handler
  const handleUpload = async (files: File[]) => {
    setUploading(true);
    setUploadProgress(0);

    let completed = 0;
    for (const file of files) {
      const formData = new FormData();
      formData.append("image", file);

      try {
        await fetch(`${API}/upload`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
          body: formData,
        });
        completed++;
        setUploadProgress(Math.round((completed / files.length) * 100));
      } catch (e) {
        console.error("Upload failed:", e);
      }
    }

    setUploading(false);
    setUploadProgress(0);
    // Reload all
    setPage(1);
    fetchMedia(1, false);
  };

  // Dropzone
  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"] },
    maxSize: 10 * 1024 * 1024,
    noClick: true,
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
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  // Delete Flow
  const executeDeletions = async (idsToDrop: string[]) => {
    try {
      let deletedCount = 0;
      for (const id of idsToDrop) {
        const res = await fetch(`${API}/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        });
        if (res.ok) deletedCount++;
      }
      if (deletedCount > 0) {
        setPage(1);
        fetchMedia(1, false);
      }
    } catch (e) {
      console.error(e);
      showToast.error("Network error while deleting");
    }
  };

  const initiateDeleteFlow = async () => {
    if (selectedItems.length === 0) return;
    const ids = selectedItems.map((i) => i.id);

    const result = await Swal.fire({
      title:
        '<span class="text-pink-600 dark:text-pink-500 font-bold text-2xl flex items-center gap-2 justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg> Critical Action</span>',
      html: `
        <div class="text-left space-y-4 mt-2">
          <p class="text-gray-700 dark:text-gray-300 text-base">
            You are about to permanently delete <b class="text-gray-900 dark:text-white font-bold">${ids.length} image(s)</b> from your media library.
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
      background: settings.theme === "dark" ? "#1f2937" : "#ffffff",
      color: settings.theme === "dark" ? "#f9fafb" : "#111827",
      customClass: {
        popup:
          "rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800",
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

    setPendingDeletions((prev) => [...new Set([...prev, ...ids])]);
    setSelectedItems([]);
    setShowUndo(true);
  };

  const handleUndoComplete = () => {
    executeDeletions(pendingDeletions);
    setShowUndo(false);
    setPendingDeletions([]);
  };

  const handleUndoCancel = () => {
    setShowUndo(false);
    setPendingDeletions([]);
    showToast.success("Deletion cancelled");
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div {...getRootProps()} className="min-h-[100dvh] relative">
      <input {...getInputProps()} />

      {/* Drag overlay */}
      <AnimatePresence>
        {isDragActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-blue-500/10 backdrop-blur-sm z-40 flex items-center justify-center"
          >
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-12 shadow-2xl text-center border-2 border-dashed border-blue-400">
              <Upload size={48} className="mx-auto text-blue-500 mb-4" />
              <p className="text-xl font-bold text-gray-800 dark:text-white">
                Drop to upload
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload progress banner */}
      <AnimatePresence>
        {uploading && (
          <motion.div
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-50 bg-blue-600 text-white px-6 py-3 flex items-center gap-4 shadow-lg"
          >
            <Loader2 size={20} className="animate-spin" />
            <span className="font-medium">Uploading... {uploadProgress}%</span>
            <div className="flex-1 bg-blue-400/30 rounded-full h-2">
              <div
                className="bg-white h-2 rounded-full transition-all"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">
            Media Library
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {items.length} image{items.length !== 1 ? "s" : ""} · Drag &amp;
            drop anywhere to upload
          </p>
        </div>
        <button
          onClick={open}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-sm"
        >
          <ImagePlus size={18} /> Upload Images
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search by title, alt text, filename..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white shadow-sm"
          />
        </div>
      </div>

      {/* Content row */}
      <div className="flex gap-6">
        {/* Grid */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
              {Array.from({ length: 18 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse"
                />
              ))}
            </div>
          ) : items.filter((i) => !pendingDeletions.includes(i.id)).length ===
            0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-gray-400">
              <svg
                className="w-20 h-20 mb-4 opacity-30"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="text-lg font-bold">No images yet</p>
              <p className="text-sm mt-1">
                Drag &amp; drop images here or click Upload
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                {items
                  .filter((i) => !pendingDeletions.includes(i.id))
                  .map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item)}
                      className={`group relative aspect-square rounded-xl overflow-hidden transition-all duration-200 focus:outline-none
                      shadow-md hover:shadow-xl border-2
                      ${
                        selectedItems.some((s) => s.id === item.id)
                          ? "border-blue-500 ring-2 ring-blue-500/30 scale-[0.97]"
                          : "border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500"
                      }`}
                    >
                      {}
                      <img
                        src={item.urlThumbnail || ""}
                        alt={item.altText || item.title || ""}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      {/* Selected badge */}
                      {selectedItems.some((s) => s.id === item.id) && (
                        <div className="absolute top-2 right-2 bg-blue-500 rounded-full w-6 h-6 flex items-center justify-center shadow-md">
                          <svg
                            className="w-3.5 h-3.5 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                      {/* Hover info */}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-white text-xs font-medium truncate">
                          {item.title || item.originalName}
                        </p>
                      </div>
                    </button>
                  ))}
              </div>

              {/* Infinite scroll sentinel */}
              <div ref={sentinelRef} className="py-8 flex justify-center">
                {loadingMore && (
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <Loader2 size={16} className="animate-spin" />
                    Loading more...
                  </div>
                )}
                {!hasMore && items.length > 0 && (
                  <p className="text-gray-400 text-sm">All images loaded</p>
                )}
              </div>
            </>
          )}
        </div>

        {/* Detail Sidebar (slides in when image selected) */}
        <AnimatePresence>
          {selectedItems.length === 1 && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="shrink-0 overflow-hidden"
            >
              <div className="w-[320px] bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg sticky top-4">
                {/* Sidebar Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="font-bold text-sm text-gray-900 dark:text-white uppercase tracking-wide">
                    Image Details
                  </h3>
                  <button
                    onClick={() => setSelectedItems([])}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="p-4 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                  {(() => {
                    const selected = selectedItems[0];

                    return (
                      <>
                        {/* Preview */}
                        <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center border border-gray-200 dark:border-gray-600">
                          {}
                          <img
                            src={selected.urlMedium || ""}
                            alt={selected.altText || ""}
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>

                        {/* File info */}
                        <div className="text-xs space-y-1.5 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl">
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
                              <span className="font-medium">Original:</span>
                              <span className="text-gray-700 dark:text-gray-300">
                                {selected.width} × {selected.height}px
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
                              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900 dark:text-white"
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
                              placeholder="Describe this image"
                              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900 dark:text-white"
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
                              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900 dark:text-white resize-none"
                            />
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <button
                            onClick={handleSaveAttributes}
                            disabled={saving}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
                          >
                            <Save size={14} /> {saving ? "Saving..." : "Save"}
                          </button>
                          <button
                            onClick={initiateDeleteFlow}
                            className="px-3 py-2 rounded-lg text-sm font-medium text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/20 border border-pink-200 dark:border-pink-800 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        {/* URL copy */}
                        <div className="text-xs space-y-2 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl">
                          <p className="font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide text-[11px]">
                            Copy URLs
                          </p>
                          {(["thumbnail", "medium", "full"] as const).map(
                            (size) => {
                              const urlMap = {
                                thumbnail: selected.urlThumbnail,
                                medium: selected.urlMedium,
                                full: selected.urlFull,
                              };
                              return (
                                <div
                                  key={size}
                                  className="flex items-center justify-between gap-2"
                                >
                                  <span className="capitalize font-medium text-gray-500">
                                    {size}
                                  </span>
                                  <button
                                    onClick={() =>
                                      navigator.clipboard.writeText(
                                        `${API_URL}${urlMap[size]}`,
                                      )
                                    }
                                    className="text-blue-500 hover:text-blue-700 hover:underline"
                                  >
                                    Copy
                                  </button>
                                </div>
                              );
                            },
                          )}
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Floating Pill for Multi-Select */}
        <AnimatePresence>
          {selectedItems.length > 1 && (
            <motion.div
              initial={{ y: 50, opacity: 0, x: "-50%", scale: 0.95 }}
              animate={{ y: 0, opacity: 1, x: "-50%", scale: 1 }}
              exit={{ y: 50, opacity: 0, x: "-50%", scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="fixed bottom-8 left-1/2 z-[10010] bg-white dark:bg-gray-800 shadow-2xl rounded-full pl-6 pr-2 py-2 flex items-center gap-6 border border-gray-200 dark:border-gray-700"
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
                  onClick={initiateDeleteFlow}
                  className="px-6 py-2.5 bg-pink-600 text-white hover:bg-pink-700 shadow-lg shadow-pink-600/20 rounded-full text-sm font-bold flex items-center gap-2 transition-transform hover:scale-105 active:scale-95"
                >
                  <Trash2 size={18} /> Delete Selected
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
        </AnimatePresence>
      </div>

      <UndoToast
        isOpen={showUndo}
        message={`Deleting ${pendingDeletions.length} image(s)`}
        duration={10}
        onUndo={handleUndoCancel}
        onComplete={handleUndoComplete}
        onDismiss={handleUndoCancel}
      />
    </div>
  );
}
