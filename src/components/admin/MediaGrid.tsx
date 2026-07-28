"use client";

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

interface MediaGridProps {
  items: MediaItem[];
  selectedIds?: string[];
  onSelect: (item: MediaItem) => void;
  loading?: boolean;
}

export type { MediaItem };

export default function MediaGrid({
  items,
  selectedIds = [],
  onSelect,
  loading = false,
}: MediaGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-[clamp(0.5rem,1.5vw,0.75rem)] p-[clamp(1rem,3vw,1.5rem)]">
        {Array.from({ length: 16 }).map((_, i) => (
          <div
            key={i}
            className="aspect-square rounded-[clamp(0.5rem,1.5vw,0.75rem)] bg-gray-200 dark:bg-gray-700 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-[clamp(3rem,8vw,5rem)] text-gray-400">
        <svg
          className="w-[clamp(3rem,8vw,4rem)] h-[clamp(3rem,8vw,4rem)] mb-4 opacity-40"
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
        <p className="text-[clamp(0.875rem,2vw,1rem)] font-medium">
          No media found
        </p>
        <p className="text-[clamp(0.65rem,1.5vw,0.75rem)] mt-[clamp(0.25rem,1vw,0.5rem)]">
          Upload images to get started
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-[clamp(0.5rem,1.5vw,0.75rem)] p-[clamp(1rem,3vw,1.5rem)]">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onSelect(item)}
          className={`group relative aspect-square rounded-[clamp(0.5rem,1.5vw,0.75rem)] overflow-hidden border-2 transition-all focus:outline-none ${
            selectedIds.includes(item.id)
              ? "border-pink-500 ring-2 ring-pink-500/30 scale-[0.96]"
              : "border-transparent hover:border-gray-300 dark:hover:border-gray-600"
          }`}
        >
          {}
          <img
            src={item.urlThumbnail || ""}
            alt={item.altText || item.title || ""}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          {selectedIds.includes(item.id) && (
            <div className="absolute top-[clamp(0.25rem,1vw,0.5rem)] right-[clamp(0.25rem,1vw,0.5rem)] bg-pink-500 rounded-full w-[clamp(1.25rem,3vw,1.5rem)] h-[clamp(1.25rem,3vw,1.5rem)] flex items-center justify-center">
              <svg
                className="w-3 h-3 text-white"
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
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
        </button>
      ))}
    </div>
  );
}
