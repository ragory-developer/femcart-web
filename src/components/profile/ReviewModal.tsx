"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star, Camera, Truck, ChevronRight, Loader2 } from "lucide-react";
import { API_URL } from "@/lib/config";
import { showToast } from "@/lib/toast";
import MediaLibraryModal from "@/components/admin/MediaLibraryModal";
import { resolveImageUrl } from "@/lib/utils";

interface OrderItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    image: string;
  };
  variant?: {
    image: string | null;
    attributes: { value: string }[];
  } | null;
}

interface ReviewModalProps {
  orderId: string;
  items: OrderItem[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReviewModal({
  orderId,
  items,
  onClose,
  onSuccess,
}: ReviewModalProps) {
  const [step, setStep] = useState(0); // 0 = Delivery, 1 to N = Products
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeItemIdx, setActiveItemIdx] = useState<number | null>(null);

  // Form State
  const [deliveryRating, setDeliveryRating] = useState<number>(5);
  const [deliveryFeedback, setDeliveryFeedback] = useState("");

  const [productReviews, setProductReviews] = useState(
    items.map((item) => ({
      productId: item.product.id,
      name:
        item.variant && item.variant.attributes?.length
          ? `${item.product.name} (${item.variant.attributes.map((a: any) => a.value).join(" / ")})`
          : item.product.name,
      image: item.variant?.image || item.product.image,
      rating: 5,
      content: "",
      images: [] as string[],
    })),
  );

  const totalSteps = 1 + items.length;

  const handleNext = () => {
    if (step < totalSteps - 1) {
      setStep((prev) => prev + 1);
    } else {
      submitFeedback();
    }
  };

  const submitFeedback = async () => {
    setLoading(true);
    try {
      const token =
        localStorage.getItem("femcart_access_token") ||
        localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/reviews/order/${orderId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          delivery: { rating: deliveryRating, feedback: deliveryFeedback },
          products: productReviews,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast.success("Thank you! Your feedback has been submitted.");
        onSuccess();
      } else {
        showToast.error(data.message || "Failed to submit feedback.");
      }
    } catch (err) {
      showToast.error("Network error.");
    } finally {
      setLoading(false);
    }
  };

  const handleMediaSelect = (media: any, url: string | string[]) => {
    if (activeItemIdx === null) return;
    const incoming = Array.isArray(url) ? url : [url];

    setProductReviews((prev) => {
      const clone = [...prev];
      clone[activeItemIdx].images = [
        ...clone[activeItemIdx].images,
        ...incoming,
      ];
      return clone;
    });
  };

  const removeImage = (itemIdx: number, imgIdx: number) => {
    setProductReviews((prev) => {
      const clone = [...prev];
      clone[itemIdx].images = clone[itemIdx].images.filter(
        (_, i) => i !== imgIdx,
      );
      return clone;
    });
  };

  const openMediaModal = (itemIdx: number) => {
    setActiveItemIdx(itemIdx);
    setModalOpen(true);
  };

  const StarRating = ({
    value,
    onChange,
  }: {
    value: number;
    onChange: (v: number) => void;
  }) => (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={36}
          onClick={() => onChange(star)}
          className={`cursor-pointer transition-colors ${star <= value ? "fill-orange-400 text-orange-400" : "text-gray-300 dark:text-gray-700"}`}
        />
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-[2rem] overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight text-gray-900 dark:text-white italic">
              Order Feedback
            </h2>
            <p className="text-sm font-medium text-gray-500">
              Step {step + 1} of {totalSteps}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-8 min-h-[400px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="delivery"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col items-center text-center max-w-md mx-auto w-full"
              >
                <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-3xl flex items-center justify-center mb-6">
                  <Truck size={40} />
                </div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">
                  How was your delivery?
                </h3>
                <p className="text-gray-500 font-medium mb-8">
                  Please rate your experience with the courier and packaging.
                </p>

                <div className="mb-8">
                  <StarRating
                    value={deliveryRating}
                    onChange={setDeliveryRating}
                  />
                </div>

                <div className="w-full text-left">
                  <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                    Additional Comments
                  </label>
                  <textarea
                    rows={4}
                    value={deliveryFeedback}
                    onChange={(e) => setDeliveryFeedback(e.target.value)}
                    placeholder="Did it arrive on time? Was the package intact?"
                    className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:bg-white dark:focus:bg-gray-900 outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                  />
                </div>
              </motion.div>
            )}

            {step > 0 && (
              <motion.div
                key={`product-${step}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col max-w-md mx-auto w-full"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl border border-gray-100 dark:border-gray-800 p-1 shrink-0">
                    <img
                      src={
                        resolveImageUrl(productReviews[step - 1].image) ||
                        "/placeholder.png"
                      }
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2 leading-tight">
                      {productReviews[step - 1].name}
                    </h3>
                  </div>
                </div>

                <div className="mb-6 flex justify-center">
                  <StarRating
                    value={productReviews[step - 1].rating}
                    onChange={(v) => {
                      const clone = [...productReviews];
                      clone[step - 1].rating = v;
                      setProductReviews(clone);
                    }}
                  />
                </div>

                <div className="w-full text-left mb-6">
                  <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                    Your Review
                  </label>
                  <textarea
                    rows={3}
                    value={productReviews[step - 1].content}
                    onChange={(e) => {
                      const clone = [...productReviews];
                      clone[step - 1].content = e.target.value;
                      setProductReviews(clone);
                    }}
                    placeholder="What did you like or dislike about this product?"
                    className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:bg-white dark:focus:bg-gray-900 outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                  />
                </div>

                <div className="w-full text-left">
                  <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                    Photo Evidence
                  </label>

                  <div className="flex flex-wrap gap-2">
                    {productReviews[step - 1].images.map((img, idx) => (
                      <div
                        key={idx}
                        className="relative w-16 h-16 rounded-xl border border-gray-200 dark:border-gray-700 group overflow-hidden"
                      >
                        <img
                          src={resolveImageUrl(img)}
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => removeImage(step - 1, idx)}
                          className="absolute inset-0 bg-pink-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}

                    {productReviews[step - 1].images.length < 3 && (
                      <button
                        onClick={() => openMediaModal(step - 1)}
                        className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center text-gray-400 hover:text-blue-500 hover:border-blue-500 transition-colors"
                      >
                        <Camera size={20} />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 flex justify-between items-center">
          <div className="flex gap-1">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${i === step ? "w-8 bg-blue-600" : i < step ? "w-2 bg-blue-300" : "w-2 bg-gray-200 dark:bg-gray-700"}`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            disabled={loading}
            className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-xs rounded-xl shadow-xl shadow-blue-600/20 transition-all disabled:opacity-50"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <>
                {step === totalSteps - 1 ? "Submit" : "Next"}{" "}
                {step !== totalSteps - 1 && <ChevronRight size={16} />}
              </>
            )}
          </button>
        </div>
      </motion.div>

      <MediaLibraryModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSelect={handleMediaSelect}
        preferredSize="full"
        multiple={true}
      />
    </div>
  );
}
