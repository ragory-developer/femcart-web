"use client";

import { API_URL } from "@/lib/config";
import { resolveImageUrl } from "@/lib/utils";
import { Check, Loader2, MessageSquare, Star, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { showToast } from "@/lib/toast";

interface Review {
  id: string;
  rating: number;
  content: string | null;
  images: string[] | string | null;
  isApproved: boolean;
  showInHome: boolean;
  createdAt: string;
  product?: {
    name: string;
    image: string;
  };
  user?: {
    name: string;
    email: string;
  };
  reviewer?: string;
  reviewerEmail?: string;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [filter, setFilter] = useState<"ALL" | "PENDING" | "APPROVED">(
    "PENDING",
  );

  const getToken = () =>
    typeof window !== "undefined"
      ? localStorage.getItem("femcart_access_token") ||
        localStorage.getItem("token") ||
        ""
      : "";

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const tokenStr = getToken();
      let url = `${API_URL}/api/reviews/admin?limit=50`;
      if (filter === "PENDING") url += `&isApproved=false`;
      if (filter === "APPROVED") url += `&isApproved=true`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${tokenStr}` },
      });
      const data = await res.json();

      if (data.success) {
        setReviews(data.data);
      } else {
        showToast.error(data.message || "Failed to load reviews");
      }
    } catch (error) {
      console.error("Failed to fetch reviews", error);
      showToast.error("Network error while loading reviews");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleUpdateStatus = async (id: string, isApproved: boolean) => {
    setActionLoading(id);
    try {
      const tokenStr = getToken();
      const res = await fetch(`${API_URL}/api/reviews/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenStr}`,
        },
        body: JSON.stringify({ isApproved }),
      });
      const data = await res.json();
      if (data.success) {
        showToast.success(
          `Review ${isApproved ? "approved" : "rejected"} successfully`,
        );
        fetchReviews(); // Refresh list
      } else {
        showToast.error(data.message || "Failed to update review status");
      }
    } catch (error) {
      showToast.error("Network error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateShowInHome = async (id: string, showInHome: boolean) => {
    setActionLoading(`home-${id}`);
    try {
      const tokenStr = getToken();
      const res = await fetch(`${API_URL}/api/reviews/${id}/home-status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenStr}`,
        },
        body: JSON.stringify({ showInHome }),
      });
      const data = await res.json();
      if (data.success) {
        showToast.success(
          `Review ${showInHome ? "featured on home" : "removed from home"} successfully`,
        );
        fetchReviews(); // Refresh list
      } else {
        showToast.error(data.message || "Failed to update review home status");
      }
    } catch (error) {
      showToast.error("Network error");
    } finally {
      setActionLoading(null);
    }
  };

  const parseImages = (imgData: any): string[] => {
    if (!imgData) return [];
    if (Array.isArray(imgData)) return imgData;
    if (typeof imgData === "string") {
      try {
        return JSON.parse(imgData);
      } catch (e) {
        return [imgData];
      }
    }
    return [];
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <MessageSquare size={24} className="text-blue-500" /> Reviews &
            Feedback
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Moderate product reviews submitted by customers.
          </p>
        </div>

        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
          <button
            onClick={() => setFilter("ALL")}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${filter === "ALL" ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 hover:text-gray-900 dark:hover:text-white"}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("PENDING")}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${filter === "PENDING" ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 hover:text-gray-900 dark:hover:text-white"}`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter("APPROVED")}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${filter === "APPROVED" ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 hover:text-gray-900 dark:hover:text-white"}`}
          >
            Approved
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-blue-500" size={32} />
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <MessageSquare size={48} className="mx-auto mb-4 opacity-30" />
            <p className="font-medium">No reviews found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px] text-sm">
              <thead>
                <tr className="bg-gray-50/80 dark:bg-gray-800/50">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-800">
                    Product
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-800">
                    Reviewer
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-800">
                    Rating
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-800 w-1/3">
                    Review
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-800 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {reviews.map((review) => {
                  const images = parseImages(review.images);
                  return (
                    <tr
                      key={review.id}
                      className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-1 flex shrink-0 items-center justify-center">
                            <img
                              src={
                                resolveImageUrl(review.product?.image) ||
                                "/placeholder.png"
                              }
                              className="max-w-full max-h-full object-contain"
                            />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white line-clamp-2 leading-tight text-sm">
                              {review.product?.name || "Unknown Product"}
                            </p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-900 dark:text-white">
                          {review.reviewer || review.user?.name || "Customer"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {review.reviewerEmail || review.user?.email}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={14}
                              className={
                                star <= review.rating
                                  ? "fill-orange-400 text-orange-400"
                                  : "fill-gray-200 text-gray-200 dark:fill-gray-700 dark:text-gray-700"
                              }
                            />
                          ))}
                        </div>
                        <div className="flex flex-col gap-1 mt-2">
                          {review.isApproved ? (
                            <span className="inline-block px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded text-[10px] font-black uppercase tracking-widest border border-green-200 dark:border-green-800 self-start">
                              Approved
                            </span>
                          ) : (
                            <span className="inline-block px-2 py-0.5 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 rounded text-[10px] font-black uppercase tracking-widest border border-orange-200 dark:border-orange-800 self-start">
                              Pending
                            </span>
                          )}
                          {review.showInHome && (
                            <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded text-[10px] font-black uppercase tracking-widest border border-blue-200 dark:border-blue-800 self-start">
                              Featured (Home)
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {review.content ? (
                          <p className="text-sm text-gray-600 dark:text-gray-300 italic">
                            "{review.content}"
                          </p>
                        ) : (
                          <p className="text-sm text-gray-400 italic">
                            No text content
                          </p>
                        )}

                        {images.length > 0 && (
                          <div className="flex gap-2 mt-3">
                            {images.map((img, i) => (
                              <a
                                href={resolveImageUrl(img)}
                                target="_blank"
                                rel="noreferrer"
                                key={i}
                              >
                                <div className="w-12 h-12 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:border-blue-500 transition-colors">
                                  <img
                                    src={resolveImageUrl(img)}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              </a>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {!review.isApproved ? (
                            <button
                              onClick={() =>
                                handleUpdateStatus(review.id, true)
                              }
                              disabled={actionLoading === review.id}
                              className="p-2 bg-green-50 text-green-600 hover:bg-green-500 hover:text-white dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-600 dark:hover:text-white rounded-xl transition-colors border border-green-200 dark:border-green-800/50"
                              title="Approve"
                            >
                              {actionLoading === review.id ? (
                                <Loader2 size={18} className="animate-spin" />
                              ) : (
                                <Check size={18} />
                              )}
                            </button>
                          ) : (
                            <button
                              onClick={() =>
                                handleUpdateStatus(review.id, false)
                              }
                              disabled={actionLoading === review.id}
                              className="p-2 bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 rounded-xl transition-colors"
                              title="Unpublish (Pending)"
                            >
                              {actionLoading === review.id ? (
                                <Loader2 size={18} className="animate-spin" />
                              ) : (
                                <X size={18} />
                              )}
                            </button>
                          )}
                          <button
                            onClick={() =>
                              handleUpdateShowInHome(
                                review.id,
                                !review.showInHome,
                              )
                            }
                            disabled={
                              actionLoading === `home-${review.id}` ||
                              !review.isApproved
                            }
                            className={`p-2 rounded-xl transition-colors border ${
                              review.showInHome
                                ? "bg-blue-50 text-blue-600 hover:bg-blue-500 hover:text-white border-blue-200"
                                : "bg-gray-50 text-gray-400 hover:bg-blue-50 hover:text-blue-500 border-gray-200"
                            } ${!review.isApproved && "opacity-50 cursor-not-allowed"}`}
                            title={
                              review.showInHome
                                ? "Remove from Home Page"
                                : "Feature on Home Page"
                            }
                          >
                            {actionLoading === `home-${review.id}` ? (
                              <Loader2 size={18} className="animate-spin" />
                            ) : (
                              <Star
                                size={18}
                                className={
                                  review.showInHome ? "fill-current" : ""
                                }
                              />
                            )}
                          </button>
                          <button
                            onClick={() => {
                              /* Implement Delete if needed */
                            }}
                            className="p-2 bg-pink-50 text-pink-600 hover:bg-pink-500 hover:text-white dark:bg-pink-900/20 dark:text-pink-400 dark:hover:bg-pink-600 dark:hover:text-white rounded-xl transition-colors border border-pink-200 dark:border-pink-800/50"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
