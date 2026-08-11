"use client";

import { useAuth } from "@/context/AuthContext";
import { useSettingsStore } from "@/store/settingsStore";
import { Mail, MapPin, Phone, Send, ArrowRight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function ContactPage() {
  const settings = useSettingsStore((state) => state.settings);
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      const data = {
        name: formData.get("name"),
        email: formData.get("email"),
        subject: formData.get("subject"),
        message: formData.get("message"),
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/contact`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        },
      );

      if (!res.ok) throw new Error("Failed to send message");

      toast.success("Message sent successfully! We'll get back to you soon.");
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#FAFAFA] dark:bg-[#111111] min-h-[100dvh] font-sans selection:bg-rose-200 dark:selection:bg-rose-900/40">
      
      {/* 
        HEADER SECTION - STARK & BOLD
      */}
      <section className="pt-32 md:pt-48 pb-16 md:pb-24 container mx-auto px-6 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-end gap-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <p className="font-sans text-xs md:text-sm font-bold tracking-[0.2em] text-rose-500 uppercase mb-8">
              Client Services
            </p>
            <h1 className="text-5xl md:text-7xl lg:text-[100px] font-serif font-black text-gray-900 dark:text-white leading-[0.9] tracking-tighter">
              Get In <br />
              <span className="italic font-light text-gray-400 dark:text-gray-500">Touch.</span>
            </h1>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="md:max-w-xs"
          >
            <p className="font-sans text-base md:text-lg text-gray-500 dark:text-gray-400 font-medium">
              Have a question about sizing, fits, an existing order, or a private consultation? We are here.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 
        MAIN CONTENT - ASYMMETRICAL SPLIT
      */}
      <section className="py-24 md:py-32 container mx-auto px-6">
        <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-16 lg:gap-32">
          
          {/* Left: Contact Information (Editorial Block) */}
          <div className="w-full lg:w-1/3 flex flex-col gap-12">
            <div>
              <p className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-6">
                Direct Inquiry
              </p>
              
              <div className="flex flex-col gap-8 border-l border-gray-200 dark:border-gray-800 pl-6">
                <div>
                  <h4 className="font-serif text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Studio & HQ
                  </h4>
                  <p className="font-sans text-gray-500 dark:text-gray-400 leading-relaxed whitespace-pre-line font-medium">
                    {settings.footer_address || "123 Fashion Market Ave, Suite 100\nDhaka, Bangladesh 1212"}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-serif text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Concierge
                  </h4>
                  <a href={`tel:${settings.footer_phone || "+880 123 456 7890"}`} className="font-sans text-gray-500 dark:text-gray-400 hover:text-rose-500 transition-colors block mb-1">
                    {settings.footer_phone || "+880 123 456 7890"}
                  </a>
                  <a href={`mailto:${settings.footer_email || "hello@femcart.com"}`} className="font-sans text-gray-500 dark:text-gray-400 hover:text-rose-500 transition-colors block">
                    {settings.footer_email || "hello@femcart.com"}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right: The Minimalist Form */}
          <div className="w-full lg:w-2/3">
            <form onSubmit={handleSubmit} className="flex flex-col gap-10">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Minimal Input Fields */}
                <div className="relative group">
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    defaultValue={user?.name || ""}
                    placeholder="Full Name"
                    className="w-full bg-transparent border-b-2 border-gray-300 dark:border-gray-700 py-4 px-0 text-gray-900 dark:text-white font-serif text-xl placeholder-transparent focus:outline-none focus:border-gray-900 dark:focus:border-white transition-colors peer"
                  />
                  <label htmlFor="name" className="absolute left-0 -top-5 text-xs font-bold tracking-widest uppercase text-gray-400 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-4 peer-placeholder-shown:font-serif peer-placeholder-shown:normal-case peer-focus:-top-5 peer-focus:text-xs peer-focus:font-bold peer-focus:tracking-widest peer-focus:uppercase peer-focus:text-gray-900 dark:peer-focus:text-white transition-all duration-300">
                    Full Name
                  </label>
                </div>

                <div className="relative group">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    defaultValue={user?.email || ""}
                    placeholder="Email Address"
                    className="w-full bg-transparent border-b-2 border-gray-300 dark:border-gray-700 py-4 px-0 text-gray-900 dark:text-white font-serif text-xl placeholder-transparent focus:outline-none focus:border-gray-900 dark:focus:border-white transition-colors peer"
                  />
                  <label htmlFor="email" className="absolute left-0 -top-5 text-xs font-bold tracking-widest uppercase text-gray-400 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-4 peer-placeholder-shown:font-serif peer-placeholder-shown:normal-case peer-focus:-top-5 peer-focus:text-xs peer-focus:font-bold peer-focus:tracking-widest peer-focus:uppercase peer-focus:text-gray-900 dark:peer-focus:text-white transition-all duration-300">
                    Email Address
                  </label>
                </div>
              </div>

              <div className="relative group mt-4">
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  required
                  placeholder="Subject"
                  className="w-full bg-transparent border-b-2 border-gray-300 dark:border-gray-700 py-4 px-0 text-gray-900 dark:text-white font-serif text-xl placeholder-transparent focus:outline-none focus:border-gray-900 dark:focus:border-white transition-colors peer"
                />
                <label htmlFor="subject" className="absolute left-0 -top-5 text-xs font-bold tracking-widest uppercase text-gray-400 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-4 peer-placeholder-shown:font-serif peer-placeholder-shown:normal-case peer-focus:-top-5 peer-focus:text-xs peer-focus:font-bold peer-focus:tracking-widest peer-focus:uppercase peer-focus:text-gray-900 dark:peer-focus:text-white transition-all duration-300">
                  Subject / Inquiry Type
                </label>
              </div>

              <div className="relative group mt-4">
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={4}
                  placeholder="Your Message"
                  className="w-full bg-transparent border-b-2 border-gray-300 dark:border-gray-700 py-4 px-0 text-gray-900 dark:text-white font-serif text-xl placeholder-transparent focus:outline-none focus:border-gray-900 dark:focus:border-white transition-colors peer resize-none"
                />
                <label htmlFor="message" className="absolute left-0 -top-5 text-xs font-bold tracking-widest uppercase text-gray-400 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-4 peer-placeholder-shown:font-serif peer-placeholder-shown:normal-case peer-focus:-top-5 peer-focus:text-xs peer-focus:font-bold peer-focus:tracking-widest peer-focus:uppercase peer-focus:text-gray-900 dark:peer-focus:text-white transition-all duration-300">
                  Your Message
                </label>
              </div>

              <div className="mt-8">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full md:w-auto inline-flex items-center justify-center gap-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-10 py-5 rounded-none font-bold text-sm uppercase tracking-[0.2em] transition-all hover:bg-rose-500 dark:hover:bg-rose-500 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed group/btn"
                >
                  {isSubmitting ? (
                    "Sending..."
                  ) : (
                    <>
                      Send Message
                      <ArrowRight size={20} className="transition-transform group-hover/btn:translate-x-2" />
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>

        </div>
      </section>
    </div>
  );
}
