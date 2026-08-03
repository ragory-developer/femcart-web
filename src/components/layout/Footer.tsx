"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSettingsStore } from "@/store/settingsStore";
import {
  Facebook,
  Instagram,
  Twitter,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { API_URL } from "@/lib/config";

interface FooterProps {
  newsletterTitle?: string;
  newsletterSubtitle?: string;
  contactAddress?: string;
  contactPhone?: string;
  contactEmail?: string;
}

export default function Footer({
  newsletterTitle = "Join our Newsletter",
  newsletterSubtitle = "Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals delivered right to your inbox.",
  contactAddress = "123 Market St, San Francisco, CA",
  contactPhone = "+1 (800) 123-4567",
  contactEmail = "support@femcart.com",
}: FooterProps = {}) {
  const settings = useSettingsStore((state) => state.settings);

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    try {
      const res = await fetch(`${API_URL}/api/newsletter/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage(data.message || "Thanks for subscribing!");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error || "Failed to subscribe");
      }

      setTimeout(() => setStatus("idle"), 4000);
    } catch (error) {
      setStatus("error");
      setMessage("An error occurred. Please try again.");
      setTimeout(() => setStatus("idle"), 4000);
    }
  };

  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8 md:pb-12 mt-auto relative z-10 font-body">
      <div className="max-w-[1600px] mx-auto px-4 md:px-6">
        {/* Newsletter Banner - Alpha Style (Clean & Bold) */}
        <div className="bg-pink-50 rounded-sm p-8 md:p-12 mb-12 flex flex-col lg:flex-row items-center justify-between gap-8 border border-pink-100">
          <div className="lg:max-w-xl text-center lg:text-left">
            <h3 className="text-3xl font-black text-gray-900 tracking-tight mb-3 font-display">
              {newsletterTitle}
            </h3>
            <p className="text-gray-600 text-[16px] font-medium">
              {newsletterSubtitle}
            </p>
          </div>

          <div className="w-full lg:w-auto relative">
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-3 w-full sm:w-[450px]"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={status === "loading" || status === "success"}
                placeholder="Enter your email address"
                className="w-full bg-white border border-gray-200 text-gray-900 rounded-sm px-5 py-4 focus:outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-400/10 placeholder:text-gray-400 transition-all font-medium shadow-sm"
              />
              <button
                type="submit"
                disabled={
                  status === "loading" || status === "success" || !email
                }
                className="bg-pink-600 hover:bg-pink-700 text-white font-bold px-8 py-4 rounded-sm transition-all shadow-md shadow-pink-600/20 flex items-center justify-center gap-2 whitespace-nowrap active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {status === "loading" ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : status === "success" ? (
                  <CheckCircle2 size={18} />
                ) : (
                  <>
                    Subscribe <Send size={18} />
                  </>
                )}
              </button>
            </form>

            {(status === "success" || status === "error") && (
              <p
                className={`text-sm font-bold mt-3 absolute -bottom-6 w-full flex items-center gap-1.5 ${
                  status === "success" ? "text-emerald-600" : "text-pink-500"
                }`}
              >
                {status === "success" ? (
                  <CheckCircle2 size={14} />
                ) : (
                  <AlertCircle size={14} />
                )}
                {message}
              </p>
            )}
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10 mb-12 text-center md:text-left">
          {/* Brand Col */}
          <div className="col-span-2 md:col-span-1 lg:col-span-1 space-y-6 lg:pr-8 flex flex-col items-center md:items-start">
            <Link href="/" className="inline-block mb-6">
              <Image
                unoptimized
                src={
                  !settings.store_logo ||
                  settings.store_logo === "null" ||
                  settings.store_logo === "undefined"
                    ? "/logo.png"
                    : settings.store_logo
                }
                alt={
                  !settings.store_name ||
                  settings.store_name === "null" ||
                  settings.store_name === "undefined"
                    ? "Femcart"
                    : settings.store_name
                }
                width={180}
                height={50}
                className="h-10 w-auto object-contain"
              />
            </Link>
            <p className="text-gray-500 text-[14px] md:text-[15px] leading-relaxed font-medium">
              {settings.footer_about_text ||
                "The fastest premium grocery delivery service. Fresh produce, organic items, and halal meats delivered straight to your door."}
            </p>

            {/* Socials */}
            <div className="flex gap-3 justify-center md:justify-start">
              <a
                href="#"
                className="w-11 h-11 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-[#1877F2] hover:text-white transition-all shadow-sm"
              >
                <Facebook size={18} />
              </a>
              <a
                href="#"
                className="w-11 h-11 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-[#1DA1F2] hover:text-white transition-all shadow-sm"
              >
                <Twitter size={18} />
              </a>
              <a
                href="#"
                className="w-11 h-11 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-[#E4405F] hover:text-white transition-all shadow-sm"
              >
                <Instagram size={18} />
              </a>
            </div>
          </div>

          {/* Links 1 */}
          <div className="col-span-1">
            <h4 className="text-gray-900 font-black text-[15px] md:text-[16px] mb-4 md:mb-6 font-display tracking-tight">
              Customer Service
            </h4>
            <ul className="space-y-3 md:space-y-4 text-[14px] md:text-[15px] font-medium text-gray-600">
              <li>
                <Link
                  href="/help"
                  className="hover:text-pink-600 transition-colors"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  href="/profile/orders"
                  className="hover:text-pink-600 transition-colors"
                >
                  Track your order
                </Link>
              </li>
              <li>
                <Link
                  href="/return-policy"
                  className="hover:text-pink-600 transition-colors"
                >
                  Return Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/delivery-info"
                  className="hover:text-pink-600 transition-colors"
                >
                  Delivery Info
                </Link>
              </li>
            </ul>
          </div>

          {/* Links 2 */}
          <div className="col-span-1">
            <h4 className="text-gray-900 font-black text-[15px] md:text-[16px] mb-4 md:mb-6 font-display tracking-tight">
              Quick Links
            </h4>
            <ul className="space-y-3 md:space-y-4 text-[14px] md:text-[15px] font-medium text-gray-600">
              <li>
                <Link
                  href="/about"
                  className="hover:text-pink-600 transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/careers"
                  className="hover:text-pink-600 transition-colors"
                >
                  Careers
                </Link>
              </li>
              <li>
                <Link
                  href="/partner"
                  className="hover:text-pink-600 transition-colors"
                >
                  Partner
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy-policy"
                  className="hover:text-pink-600 transition-colors"
                >
                  Privacy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-2 md:col-span-1 lg:col-span-1">
            <h4 className="text-gray-900 font-black text-[16px] mb-6 font-display tracking-tight text-center md:text-left">
              Contact Us
            </h4>
            <ul className="space-y-4 text-[14px] md:text-[15px] font-medium text-gray-600 flex flex-col items-center md:items-start">
              <li className="flex flex-col md:flex-row gap-2 md:gap-3 items-center md:items-start text-center md:text-left">
                <MapPin
                  size={20}
                  className="text-pink-600 shrink-0"
                />
                <span>{settings.footer_address || contactAddress}</span>
              </li>
              <li className="flex flex-col md:flex-row gap-2 md:gap-3 items-center md:items-start text-center md:text-left">
                <Phone size={20} className="text-pink-600 shrink-0" />
                <span>{settings.footer_phone || contactPhone}</span>
              </li>
              <li className="flex flex-col md:flex-row gap-2 md:gap-3 items-center md:items-start text-center md:text-left">
                <Mail size={20} className="text-pink-600 shrink-0" />
                <span>{settings.footer_email || contactEmail}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6 text-[14px] text-gray-500 font-medium">
          <p>
            &copy; {new Date().getFullYear()} {settings.store_name || "Femcart"}
            . All rights reserved.
          </p>

          {/* Payment Icons */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-6 bg-white rounded flex items-center justify-center border border-gray-200 shadow-sm">
              <span className="text-[10px] font-black text-blue-900 italic">
                VISA
              </span>
            </div>
            <div className="w-10 h-6 bg-white rounded flex items-center justify-center border border-gray-200 shadow-sm">
              <div className="flex -space-x-1">
                <div className="w-3 h-3 rounded-full bg-pink-500/80 mix-blend-multiply"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/80 mix-blend-multiply"></div>
              </div>
            </div>
            <div className="w-10 h-6 bg-white rounded flex items-center justify-center border border-gray-200 shadow-sm">
              <span className="text-[10px] font-bold text-blue-600">AMEX</span>
            </div>
            <div className="w-10 h-6 bg-white rounded flex items-center justify-center border border-gray-200 shadow-sm">
              <CreditCard size={14} className="text-gray-400" />
            </div>
          </div>

          <div className="flex gap-2 items-center">
            <span className="px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg font-bold text-gray-400 text-[11px] uppercase tracking-wider">
              Alpha Template
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
