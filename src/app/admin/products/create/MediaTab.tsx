"use client";
import MediaLibraryModal from "@/components/admin/MediaLibraryModal";
import {
  Image as ImageIcon,
  ImagePlus,
  Link as LinkIcon,
  X,
} from "lucide-react";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { ProductFormValues } from "@/lib/validations/product";
import { resolveImageUrl } from "@/lib/utils";

export default function MediaTab() {
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<ProductFormValues>();
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTarget, setActiveTarget] = useState<"main" | "gallery" | null>(
    null,
  );

  const image = watch("image");
  const images = watch("images");

  // Parse gallery images from newline-separated string
  const galleryImages: string[] = images
    ? images
        .split("\n")
        .map((u: string) => u.trim())
        .filter(Boolean)
    : [];

  const handleMediaSelect = (media: any, url: string | string[]) => {
    if (activeTarget === "main") {
      setValue("image", Array.isArray(url) ? url[0] : url, {
        shouldValidate: true,
      });
    } else if (activeTarget === "gallery") {
      const incoming = Array.isArray(url) ? url : [url];
      const combined = [...galleryImages, ...incoming];
      setValue("images", combined.join("\n"), { shouldValidate: true });
    }
  };

  const removeGalleryImage = (indexToRemove: number) => {
    const updated = galleryImages.filter((_, i) => i !== indexToRemove);
    setValue("images", updated.join("\n"), { shouldValidate: true });
  };

  const openModal = (target: "main" | "gallery") => {
    setActiveTarget(target);
    setModalOpen(true);
  };

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-300">
      {/* ── Main Image ── */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 md:p-8 shadow-sm">
        <div className="border-b border-gray-100 dark:border-gray-750 pb-4 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Main Product Image
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            This is the primary image displayed on the product page.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div
            onClick={() => openModal("main")}
            className="w-32 h-32 shrink-0 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800/50 overflow-hidden relative cursor-pointer hover:border-emerald-500/60 transition-colors"
            title="Select from Media Library"
          >
            {image ? (
              <img
                src={resolveImageUrl(image)}
                alt="Main"
                className="w-full h-full object-cover pointer-events-none"
              />
            ) : (
              <>
                <ImageIcon
                  className="text-gray-450 dark:text-gray-500 mb-2"
                  size={24}
                />
                <span className="text-xs text-gray-500 font-semibold">
                  No Image
                </span>
              </>
            )}
          </div>
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <LinkIcon
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  value={image || ""}
                  onChange={(e) =>
                    setValue("image", e.target.value, { shouldValidate: true })
                  }
                  placeholder="Paste external URL here..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-55 dark:bg-gray-900/50 text-sm focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-gray-900 dark:text-white transition-colors"
                />
              </div>
              <button
                type="button"
                onClick={() => openModal("main")}
                className="shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-lg shadow-emerald-600/10 active:scale-95 cursor-pointer"
              >
                <ImagePlus size={16} /> Library
              </button>
            </div>
            <p className="text-xs text-gray-500">
              Provide a high quality image URL or select one from your library
              for the primary display.
            </p>
          </div>
        </div>
      </div>

      {/* ── Gallery Images ── */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 md:p-8 shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-750 pb-4 mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Gallery Images
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {galleryImages.length > 0
                ? `${galleryImages.length} image${galleryImages.length > 1 ? "s" : ""} selected`
                : "Add additional images to the product gallery."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => openModal("gallery")}
            className="shrink-0 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
          >
            <ImagePlus size={16} /> Add from Library
          </button>
        </div>

        {galleryImages.length === 0 ? (
          <button
            type="button"
            onClick={() => openModal("gallery")}
            className="w-full border-2 border-dashed border-gray-350 dark:border-gray-650 rounded-xl py-10 flex flex-col items-center justify-center gap-2 text-gray-450 hover:border-emerald-450 hover:text-emerald-600 transition-colors cursor-pointer"
          >
            <ImagePlus size={28} />
            <span className="text-sm font-bold">
              Click to add gallery images
            </span>
          </button>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {galleryImages.map((url, idx) => (
              <div
                key={idx}
                onClick={() => openModal("gallery")}
                className="group relative aspect-square rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 cursor-pointer hover:border-emerald-500/60 transition-colors"
              >
                <img
                  src={resolveImageUrl(url)}
                  alt={`Gallery ${idx + 1}`}
                  className="w-full h-full object-cover pointer-events-none"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeGalleryImage(idx);
                  }}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-pink-500 hover:bg-pink-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-10"
                  title="Remove image"
                >
                  <X size={12} />
                </button>
                <div className="absolute bottom-1.5 left-1.5 bg-black/50 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md leading-none">
                  {idx + 1}
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => openModal("gallery")}
              className="aspect-square rounded-xl border-2 border-dashed border-gray-350 dark:border-gray-650 flex flex-col items-center justify-center gap-1.5 text-gray-450 hover:border-emerald-450 hover:text-emerald-600 transition-colors cursor-pointer"
            >
              <ImagePlus size={20} />
              <span className="text-[10px] font-bold">Add More</span>
            </button>
          </div>
        )}
      </div>

      <MediaLibraryModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSelect={handleMediaSelect}
        preferredSize="full"
        multiple={activeTarget === "gallery"}
      />
    </div>
  );
}
