"use client";

import UserSidebar from "@/components/dashboard/UserSidebar";
import { useAuth } from "@/context/AuthContext";
import { API_URL } from "@/lib/config";
import { Loader2, Star, ShieldAlert } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Review {
  id: string;
  rating: number;
  content: string;
  isApproved: boolean;
  createdAt: string;
  product: {
    name: string;
    slug: string;
    image: string;
  };
}

export default function ReviewsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.replace("/login?redirect=/profile/reviews");
      } else if (user.isGuest) {
        router.replace("/profile");
      }
    }
  }, [user, authLoading, router]);

  const fetchReviews = async () => {
    try {
      const token =
        localStorage.getItem("femcart_access_token") ||
        localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/users/reviews`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setReviews(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch reviews", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchReviews();
    }
  }, [user]);

  if (authLoading || (loading && reviews.length === 0)) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="bg-[#f8fafc] dark:bg-gray-950 min-h-[100dvh] py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="w-full lg:w-80 shrink-0">
            <UserSidebar />
          </aside>

          <main className="flex-grow">
            <div className="mb-8">
              <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter uppercase italic flex items-center gap-3">
                <Star className="text-yellow-500 fill-yellow-500" size={32} />{" "}
                My Reviews
              </h1>
              <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">
                Your feedback on products ({reviews.length})
              </p>
            </div>

            {reviews.length === 0 ? (
              <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2.5rem] p-12 text-center shadow-xl shadow-gray-200/20 dark:shadow-none">
                <div className="w-20 h-20 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <Star size={40} className="fill-yellow-500" />
                </div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2 uppercase tracking-tight italic">
                  No reviews yet
                </h2>
                <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto mb-8 font-medium">
                  Share your experience with products you've purchased!
                </p>
                <Link
                  href="/profile/orders"
                  className="inline-flex items-center gap-2 px-10 py-4 bg-yellow-500 hover:bg-yellow-600 text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-yellow-500/20"
                >
                  Write a Review
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 flex flex-col sm:flex-row gap-6 shadow-sm"
                  >
                    <Link
                      href={`/product/${review.product.slug}`}
                      className="w-24 h-24 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center relative overflow-hidden shrink-0 border border-gray-100 dark:border-gray-700"
                    >
                      {review.product.image ? (
                        <Image
                          src={review.product.image}
                          alt={review.product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <Star className="text-gray-300" size={24} />
                      )}
                    </Link>
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
                        <div>
                          <Link
                            href={`/product/${review.product.slug}`}
                            className="font-bold text-gray-900 dark:text-white hover:text-blue-600 transition-colors"
                          >
                            {review.product.name}
                          </Link>
                          <div className="flex gap-1 mt-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                size={14}
                                className={
                                  star <= review.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "fill-gray-200 text-gray-200 dark:fill-gray-700 dark:text-gray-700"
                                }
                              />
                            ))}
                          </div>
                        </div>
                        <div className="flex flex-col sm:items-end gap-1">
                          <span className="text-xs text-gray-500 font-medium">
                            {new Date(review.createdAt).toLocaleDateString(
                              "en-GB",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </span>
                          {!review.isApproved && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-orange-600 bg-orange-50 dark:bg-orange-900/20 px-2 py-0.5 rounded-full">
                              <ShieldAlert size={10} /> Pending Approval
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                        {review.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
