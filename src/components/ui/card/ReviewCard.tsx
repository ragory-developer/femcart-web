import { Quote, Star, BadgeCheck } from "lucide-react";
import { useState } from "react";

export interface ReviewCardProps {
  name: string;
  avatar?: string;
  rating: number;
  content: string;
  product?: string;
  createdAt?: string;
  styles?: {
    quoteColor?: string;
    productColor?: string;
    accentStarColor?: string;
  };
  className?: string;
}

export default function ReviewCard({
  name,
  avatar,
  rating,
  content,
  product,
  createdAt,
  styles = {},
  className = "",
}: ReviewCardProps) {
  const quoteColor = styles.quoteColor || "text-rose-200 dark:text-rose-800/40";
  const productColor =
    styles.productColor || "text-rose-500 dark:text-rose-400";
  const accentStarColor =
    styles.accentStarColor || "text-amber-400 fill-amber-400";
  const [imgError, setImgError] = useState(false);

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg p-[clamp(1rem,3vw,1.5rem)] border border-transparent shadow-none hover:border-emerald-500/30 hover:shadow-[0_8px_30px_rgba(16,185,129,0.15)] hover:-translate-y-1 transition-all group h-full flex flex-col justify-between ${className}`}
    >
      <div className="flex-1 flex flex-col">
        <Quote size={24} className={`${quoteColor} mb-3 shrink-0`} />

        <p className="text-gray-600 dark:text-gray-300 text-[clamp(0.875rem,2vw,1rem)] leading-relaxed mb-4 flex-1 line-clamp-4">
          &ldquo;{content}&rdquo;
        </p>

        {product && (
          <p
            className={`text-[clamp(0.75rem,1.5vw,0.875rem)] font-bold uppercase tracking-wider mb-4 ${productColor}`}
          >
            {product}
          </p>
        )}

        <div className="flex gap-0.5 mb-4 shrink-0">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={14}
              className={
                i < rating
                  ? `${accentStarColor} w-[clamp(14px,3vw,16px)] h-[clamp(14px,3vw,16px)]`
                  : "text-gray-300 dark:text-gray-700 w-[clamp(14px,3vw,16px)] h-[clamp(14px,3vw,16px)]"
              }
            />
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-700 shrink-0">
        <div className="w-[clamp(40px,8vw,48px)] h-[clamp(40px,8vw,48px)] rounded-full overflow-hidden relative border border-gray-100 dark:border-gray-750 shrink-0 bg-gray-100 dark:bg-gray-800 flex items-center justify-center shadow-sm">
          {avatar && !imgError ? (
            <img
              src={avatar}
              alt={name}
              onError={() => setImgError(true)}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <span className="font-black text-[clamp(0.875rem,2vw,1.125rem)] uppercase text-gray-500">
              {name.charAt(0)}
            </span>
          )}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-[clamp(0.875rem,2vw,1rem)] text-gray-900 dark:text-white truncate block">
              {name}
            </span>
            <span title="Verified Buyer" className="shrink-0 flex">
              <BadgeCheck
                size={14}
                className="text-emerald-500 fill-emerald-50"
              />
            </span>
          </div>
          <span className="text-[clamp(0.625rem,1.5vw,0.75rem)] text-gray-400 font-bold uppercase tracking-wider mt-0.5 flex items-center gap-1.5">
            {createdAt
              ? new Date(createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "Verified Purchase"}
          </span>
        </div>
      </div>
    </div>
  );
}
