"use client";
import React, { useState } from "react";
import { API_URL } from "@/lib/config";
import { showToast } from "@/lib/toast";

export default function Newsletter({
  title = "Get 10% Off Your First Order",
  description = "Join the community for early access to sales, new arrivals, and exclusive offers.",
  buttonText = "Subscribe",
}: {
  title?: string;
  description?: string;
  buttonText?: string;
}) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/newsletter/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();

      if (response.ok && data.success) {
        showToast.success(data.message || "Successfully subscribed!");
        setEmail("");
      } else {
        showToast.error(data.error || "Failed to subscribe. Please try again.");
      }
    } catch (error) {
      console.error(error);
      showToast.error("Network error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-rose-50 py-6 md:py-16 mb-4 md:mb-16">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 max-w-2xl text-center">
        <h2 className="font-serif text-[32px] md:text-[40px] mb-2 md:mb-4">
          {title}
        </h2>
        <p className="text-[13px] md:text-[15px] leading-snug md:leading-normal text-text-amber-700 mb-6 md:mb-8">
          {description}
        </p>

        <form
          className="flex flex-col md:flex-row gap-4 justify-center"
          onSubmit={handleSubmit}
        >
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 px-6 rounded-full border border-orange-200 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 bg-white flex-grow max-w-[400px] text-[15px] disabled:opacity-50"
            required
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center h-12 px-6 rounded-full font-sans font-semibold text-[15px] tracking-[0.3px] transition-all duration-150 cursor-pointer bg-pink-500 text-white hover:bg-pink-600 active:scale-[0.98] whitespace-nowrap disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              buttonText
            )}
          </button>
        </form>
        <p className="text-[12px] text-text-amber-700 mt-4">
          By subscribing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </section>
  );
}
