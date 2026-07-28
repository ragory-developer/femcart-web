"use client";

import { API_URL } from "@/lib/config";
import { Logger } from "@/lib/logger";
import { CheckCircle2, Loader2, MapPin, Phone, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Address {
  id?: string;
  label: string;
  address: string;
  city: string;
  area: string;
  recipientName: string;
  recipientPhone: string;
  isDefault: boolean;
  stateId?: string;
  cityId?: string;
  areaId?: string;
}

interface AddressModalProps {
  address?: Address | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddressModal({
  address,
  onClose,
  onSuccess,
}: AddressModalProps) {
  const [formData, setFormData] = useState<Address>({
    label: "Home",
    address: "",
    city: "",
    area: "",
    recipientName: "",
    recipientPhone: "",
    isDefault: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (address) {
      setFormData(address);
    }
  }, [address]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validation
    if (formData.recipientPhone.length < 11) {
      setError("Phone number must be at least 11 digits.");
      toast.error("Invalid phone number");
      setLoading(false);
      return;
    }

    try {
      const token =
        localStorage.getItem("femcart_access_token") ||
        localStorage.getItem("token");
      const url = address?.id
        ? `${API_URL}/api/users/addresses/${address.id}`
        : `${API_URL}/api/users/addresses`;

      const method = address?.id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (json.success) {
        toast.success(
          address?.id
            ? "Address updated successfully"
            : "Address saved successfully",
        );
        onSuccess();
        onClose();
      } else {
        const msg = json.message || "Failed to save address";
        setError(msg);
        toast.error(msg);
        Logger.warn("Address save failed", { response: json }, "AddressModal");
      }
    } catch (err) {
      setError("An unexpected network error occurred");
      toast.error("Network error. Please try again.");
      Logger.error(
        "Failed to save address due to network error",
        err,
        "AddressModal",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-[clamp(1rem,3vw,1.5rem)] bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-gray-950 rounded-[clamp(1.5rem,4vw,2.5rem)] w-full max-w-lg shadow-2xl relative my-[clamp(1rem,3vw,2rem)] animate-in fade-in zoom-in duration-300">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-[clamp(1rem,3vw,1.5rem)] right-[clamp(1rem,3vw,1.5rem)] min-h-[44px] min-w-[44px] flex items-center justify-center p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-full z-10"
        >
          <X size={24} />
        </button>

        <form onSubmit={handleSubmit} className="p-[clamp(1.5rem,4vw,2.5rem)]">
          <div className="mb-8 text-center">
            <div className="w-[clamp(3.5rem,8vw,4rem)] h-[clamp(3.5rem,8vw,4rem)] bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-[clamp(1rem,3vw,1.5rem)] flex items-center justify-center mx-auto mb-[clamp(0.75rem,2vw,1rem)]">
              <MapPin size={32} />
            </div>
            <h2 className="text-[clamp(1.25rem,4vw,1.5rem)] font-black text-gray-900 dark:text-white uppercase tracking-tight italic">
              {address ? "Edit Address" : "Add New Address"}
            </h2>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-pink-50 dark:bg-pink-900/10 border border-pink-100 dark:border-pink-900/30 rounded-lg text-pink-600 text-sm font-bold text-center">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Label */}
            <div>
              <label className="block text-[clamp(0.65rem,1.5vw,0.75rem)] font-black text-gray-400 uppercase tracking-widest mb-[clamp(0.25rem,1vw,0.375rem)] ml-1">
                Address Label
              </label>
              <div className="flex gap-2">
                {["Home", "Office", "Other"].map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setFormData({ ...formData, label: l })}
                    className={`flex-1 py-[clamp(0.5rem,1.5vw,0.75rem)] min-h-[44px] rounded-xl border text-[clamp(0.75rem,1.5vw,0.875rem)] font-bold transition-all ${
                      formData.label === l
                        ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20"
                        : "bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 text-gray-500 hover:border-blue-200"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* Recipient info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[clamp(0.65rem,1.5vw,0.75rem)] font-black text-gray-400 uppercase tracking-widest mb-[clamp(0.25rem,1vw,0.375rem)] ml-1">
                  Contact Name
                </label>
                <div className="relative">
                  <User
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    size={16}
                  />
                  <input
                    type="text"
                    required
                    value={formData.recipientName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        recipientName: e.target.value,
                      })
                    }
                    className="w-full pl-11 pr-4 py-[clamp(0.75rem,2vw,1rem)] min-h-[44px] bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-lg outline-none focus:border-blue-500 font-medium text-[16px] sm:text-[clamp(0.875rem,2vw,1rem)] text-gray-900 dark:text-white transition-colors"
                    placeholder="E.g. John Doe"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[clamp(0.65rem,1.5vw,0.75rem)] font-black text-gray-400 uppercase tracking-widest mb-[clamp(0.25rem,1vw,0.375rem)] ml-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    size={16}
                  />
                  <input
                    type="tel"
                    required
                    value={formData.recipientPhone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        recipientPhone: e.target.value,
                      })
                    }
                    className="w-full pl-11 pr-4 py-[clamp(0.75rem,2vw,1rem)] min-h-[44px] bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-lg outline-none focus:border-blue-500 font-medium text-[16px] sm:text-[clamp(0.875rem,2vw,1rem)] text-gray-900 dark:text-white transition-colors"
                    placeholder="01XXXXXXXXX"
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-[clamp(0.65rem,1.5vw,0.75rem)] font-black text-gray-400 uppercase tracking-widest mb-[clamp(0.25rem,1vw,0.375rem)] ml-1">
                Full Address
              </label>
              <textarea
                required
                rows={3}
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                className="w-full px-4 py-[clamp(0.75rem,2vw,1rem)] min-h-[44px] bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-lg outline-none focus:border-blue-500 font-medium text-[16px] sm:text-[clamp(0.875rem,2vw,1rem)] text-gray-900 dark:text-white transition-colors resize-none"
                placeholder="House #, Road #, Flat #, Landmark..."
              />
            </div>

            {/* City & Area (Simplified text for now, could be dropdowns) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[clamp(0.65rem,1.5vw,0.75rem)] font-black text-gray-400 uppercase tracking-widest mb-[clamp(0.25rem,1vw,0.375rem)] ml-1">
                  City
                </label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  className="w-full px-4 py-[clamp(0.75rem,2vw,1rem)] min-h-[44px] bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-lg outline-none focus:border-blue-500 font-medium text-[16px] sm:text-[clamp(0.875rem,2vw,1rem)] text-gray-900 dark:text-white transition-colors"
                  placeholder="E.g. Dhaka"
                />
              </div>
              <div>
                <label className="block text-[clamp(0.65rem,1.5vw,0.75rem)] font-black text-gray-400 uppercase tracking-widest mb-[clamp(0.25rem,1vw,0.375rem)] ml-1">
                  Area
                </label>
                <input
                  type="text"
                  required
                  value={formData.area}
                  onChange={(e) =>
                    setFormData({ ...formData, area: e.target.value })
                  }
                  className="w-full px-4 py-[clamp(0.75rem,2vw,1rem)] min-h-[44px] bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-lg outline-none focus:border-blue-500 font-medium text-[16px] sm:text-[clamp(0.875rem,2vw,1rem)] text-gray-900 dark:text-white transition-colors"
                  placeholder="E.g. Dhanmondi"
                />
              </div>
            </div>

            {/* Default toggle */}
            <label className="flex items-center gap-[clamp(0.5rem,1.5vw,0.75rem)] cursor-pointer group mt-[clamp(0.5rem,1.5vw,1rem)] min-h-[44px]">
              <input
                type="checkbox"
                checked={formData.isDefault}
                onChange={(e) =>
                  setFormData({ ...formData, isDefault: e.target.checked })
                }
                className="w-5 h-5 rounded-lg border-2 border-gray-200 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-[clamp(0.875rem,2vw,1rem)] font-bold text-gray-600 dark:text-gray-400 group-hover:text-blue-600 transition-colors">
                Set as default address
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-[clamp(1.5rem,4vw,2rem)] py-[clamp(0.875rem,2vw,1rem)] min-h-[48px] bg-gray-900 dark:bg-blue-600 text-white rounded-[clamp(1rem,3vw,1.5rem)] font-black uppercase tracking-widest text-[clamp(0.875rem,2vw,1rem)] hover:bg-black dark:hover:bg-blue-700 transition-all shadow-xl shadow-gray-900/20 flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <CheckCircle2 size={20} />
                {address ? "Update Address" : "Save Address"}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
