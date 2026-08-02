"use client";

import { useAuth } from "@/context/AuthContext";
import { useSettingsStore } from "@/store/settingsStore";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

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
    <div className="bg-[#FFFDFB] dark:bg-[#0a0a0a] min-h-[100dvh] font-sans">
      {/* Hero Section */}
      <div className="relative overflow-hidden pt-6 md:pt-10 pb-8 md:pb-12">
        <div className="absolute inset-0 bg-gradient-to-b from-pink-500/5 to-transparent dark:from-pink-500/10" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-block py-1.5 px-4 rounded-full bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 font-bold text-[11px] tracking-widest uppercase mb-6 border border-pink-200 dark:border-pink-800">
              We're Here to Help
            </span>
            <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight leading-[1.1] mb-4 md:mb-6 uppercase font-serif">
              Get in <span className="text-pink-500 italic">Touch</span>
            </h1>
            <p className="text-[10px] md:text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed font-medium mx-auto max-w-2xl">
              Have a question about sizing, fits, an existing order, or just want
              to say hi? Send us a message.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-6 md:py-10 bg-white dark:bg-[#0a0a0a]">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-16">
            {/* Contact Information (Left Column) */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <h2 className="text-base md:text-lg font-black text-gray-900 dark:text-white tracking-tight mb-4 uppercase font-serif">
                Reach Out <br /> <span className="text-pink-500 italic">To Us.</span>
              </h2>

              <div className="flex flex-col gap-4 md:gap-6">
                {/* Store Info */}
                <div className="p-4 md:p-5 bg-[#FFFDFB] dark:bg-gray-900 rounded-3xl md:rounded-[2rem] border border-rose-100 dark:border-gray-800 shadow-sm flex items-start gap-4 md:gap-6 hover:-translate-y-1 hover:border-pink-300 hover:shadow-lg hover:shadow-pink-500/10 transition-all duration-300">
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-pink-100 dark:bg-pink-900/30 rounded-2xl flex items-center justify-center shrink-0 text-pink-500">
                    <MapPin size={24} className="md:w-7 md:h-7" />
                  </div>
                  <div>
                    <h4 className="text-base md:text-lg font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-tight">
                      Headquarters
                    </h4>
                    <p
                      suppressHydrationWarning
                      className="text-[10px] md:text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line font-medium"
                    >
                      {settings.footer_address ||
                        "123 Fashion Market Ave, Suite 100\nDhaka, Bangladesh 1212"}
                    </p>
                  </div>
                </div>

                {/* Phone Info */}
                <div className="p-4 md:p-5 bg-[#FFFDFB] dark:bg-gray-900 rounded-3xl md:rounded-[2rem] border border-rose-100 dark:border-gray-800 shadow-sm flex items-start gap-4 md:gap-6 hover:-translate-y-1 hover:border-pink-300 hover:shadow-lg hover:shadow-pink-500/10 transition-all duration-300">
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-pink-100 dark:bg-pink-900/30 rounded-2xl flex items-center justify-center shrink-0 text-pink-500">
                    <Phone size={24} className="md:w-7 md:h-7" />
                  </div>
                  <div>
                    <h4 className="text-base md:text-lg font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-tight">
                      Call Us
                    </h4>
                    <p
                      suppressHydrationWarning
                      className="text-[10px] md:text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed font-medium"
                    >
                      {settings.footer_phone || "+880 123-4567890"}
                    </p>
                    <p className="text-[10px] md:text-[11px] text-pink-500 font-bold mt-2 uppercase tracking-widest">
                      Mon-Sun: 9am - 8pm
                    </p>
                  </div>
                </div>

                {/* Email Info */}
                <div className="p-4 md:p-5 bg-[#FFFDFB] dark:bg-gray-900 rounded-3xl md:rounded-[2rem] border border-rose-100 dark:border-gray-800 shadow-sm flex items-start gap-4 md:gap-6 hover:-translate-y-1 hover:border-pink-300 hover:shadow-lg hover:shadow-pink-500/10 transition-all duration-300">
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-pink-100 dark:bg-pink-900/30 rounded-2xl flex items-center justify-center shrink-0 text-pink-500">
                    <Mail size={24} className="md:w-7 md:h-7" />
                  </div>
                  <div>
                    <h4 className="text-base md:text-lg font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-tight">
                      Email Us
                    </h4>
                    <p
                      suppressHydrationWarning
                      className="text-[10px] md:text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed font-medium"
                    >
                      {settings.footer_email || "support@femcart.com"}
                    </p>
                    <p className="text-[10px] md:text-[11px] text-pink-500 font-bold mt-2 uppercase tracking-widest">
                      We reply within 24 hours
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form (Right Column) */}
            <div className="lg:col-span-7">
              <div className="bg-white dark:bg-gray-900 p-4 md:p-5 lg:p-12 rounded-[2rem] lg:rounded-[2.5rem] border border-rose-100 dark:border-gray-800 shadow-xl shadow-pink-500/5 relative overflow-hidden mt-6 lg:mt-0">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-pink-300 via-pink-500 to-rose-400" />

                <h3 className="text-base md:text-lg font-black text-gray-900 dark:text-white mb-4 md:mb-6 font-serif uppercase">
                  Send a Message
                </h3>

                <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    {/* Name Field */}
                    <div className="space-y-1.5 md:space-y-2">
                      <label className="text-[10px] md:text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        placeholder="John Doe"
                        defaultValue={user?.name || ""}
                        readOnly={!!user}
                        className={`w-full bg-rose-50/50 dark:bg-gray-800 border border-rose-100 dark:border-gray-700 rounded-xl md:rounded-2xl px-4 md:px-5 py-3 md:py-4 text-[10px] md:text-[11px] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 transition-all ${user ? "opacity-70 cursor-not-allowed" : ""}`}
                      />
                    </div>
                    {/* Email Field */}
                    <div className="space-y-1.5 md:space-y-2">
                      <label className="text-[10px] md:text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest">
                        Email or Phone
                      </label>
                      <input
                        type="text"
                        name="email"
                        required
                        placeholder="john@example.com"
                        defaultValue={user?.email || user?.phone || ""}
                        readOnly={!!(user?.email || user?.phone)}
                        className={`w-full bg-rose-50/50 dark:bg-gray-800 border border-rose-100 dark:border-gray-700 rounded-xl md:rounded-2xl px-4 md:px-5 py-3 md:py-4 text-[10px] md:text-[11px] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 transition-all ${user?.email || user?.phone ? "opacity-70 cursor-not-allowed" : ""}`}
                      />
                    </div>
                  </div>

                  {/* Subject Field */}
                  <div className="space-y-1.5 md:space-y-2">
                    <label className="text-[10px] md:text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest">
                      Subject
                    </label>
                    <input
                      type="text"
                      name="subject"
                      required
                      placeholder="How can we help you?"
                      className="w-full bg-rose-50/50 dark:bg-gray-800 border border-rose-100 dark:border-gray-700 rounded-xl md:rounded-2xl px-4 md:px-5 py-3 md:py-4 text-[10px] md:text-[11px] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 transition-all"
                    />
                  </div>

                  {/* Message Field */}
                  <div className="space-y-1.5 md:space-y-2">
                    <label className="text-[10px] md:text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest">
                      Your Message
                    </label>
                    <textarea
                      name="message"
                      required
                      rows={5}
                      placeholder="Tell us everything..."
                      className="w-full bg-rose-50/50 dark:bg-gray-800 border border-rose-100 dark:border-gray-700 rounded-xl md:rounded-2xl px-4 md:px-5 py-3 md:py-4 text-[10px] md:text-[11px] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 transition-all resize-none"
                    ></textarea>
                  </div>

                  <div className="pt-2 md:pt-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-pink-500 text-white py-4 md:py-5 rounded-xl md:rounded-2xl font-bold text-[10px] md:text-[11px] uppercase tracking-widest hover:bg-pink-600 hover:shadow-lg hover:shadow-pink-500/30 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-3 group active:scale-95"
                    >
                      {isSubmitting ? (
                        "Sending..."
                      ) : (
                        <>
                          <Send
                            size={18}
                            className="group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform md:w-5 md:h-5"
                          />{" "}
                          Send Message
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
