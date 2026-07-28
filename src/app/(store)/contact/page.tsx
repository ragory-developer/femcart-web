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
    <div className="bg-[#fcfaf8] dark:bg-[#0a0a0a] min-h-[100dvh] font-sans">
      {/* Hero Section: Modern, Soft Gradient */}
      <div className="relative overflow-hidden pt-24 pb-32">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F3A44]/5 to-transparent dark:from-[#0F3A44]/20" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-block py-1.5 px-4 rounded-full bg-[#13A048]/10 text-[#13A048] font-bold text-sm tracking-widest uppercase mb-6 border border-[#13A048]/20">
              We're Here to Help
            </span>
            <h1 className="text-5xl md:text-7xl font-black text-[#0F3A44] dark:text-white tracking-tight leading-[1.1] mb-8">
              Get in <span className="text-[#13A048]">Touch</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 leading-relaxed font-medium mx-auto max-w-2xl">
              Have a question about your order, our fresh produce, or just want
              to say hi? Send us a message.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content: Clean, Rounded Layout */}
      <div className="py-16 md:py-24 bg-white dark:bg-[#0a0a0a]">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
            {/* Contact Information (Left Column) */}
            <div className="lg:col-span-5 flex flex-col gap-8">
              <h2 className="text-4xl font-black text-[#0F3A44] dark:text-white tracking-tight mb-4">
                Reach Out <br /> To Us.
              </h2>

              <div className="flex flex-col gap-6">
                {/* Store Info */}
                <div className="p-8 bg-[#fcfaf8] dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm flex items-start gap-6 hover:-translate-y-1 hover:border-[#13A048] hover:shadow-lg hover:shadow-[#13A048]/10 transition-all duration-300">
                  <div className="w-14 h-14 bg-[#13A048]/10 rounded-2xl flex items-center justify-center shrink-0 text-[#13A048]">
                    <MapPin size={28} />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-[#0F3A44] dark:text-white mb-2">
                      Our Store
                    </h4>
                    <p
                      suppressHydrationWarning
                      className="text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line"
                    >
                      {settings.footer_address ||
                        "123 Fresh Market Ave, Suite 100\nGreen City, GC 10001"}
                    </p>
                  </div>
                </div>

                {/* Phone Info */}
                <div className="p-8 bg-[#fcfaf8] dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm flex items-start gap-6 hover:-translate-y-1 hover:border-[#13A048] hover:shadow-lg hover:shadow-[#13A048]/10 transition-all duration-300">
                  <div className="w-14 h-14 bg-[#0F3A44]/10 rounded-2xl flex items-center justify-center shrink-0 text-[#0F3A44] dark:text-[#13A048]">
                    <Phone size={28} />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-[#0F3A44] dark:text-white mb-2">
                      Call Us
                    </h4>
                    <p
                      suppressHydrationWarning
                      className="text-gray-600 dark:text-gray-400 leading-relaxed"
                    >
                      {settings.footer_phone || "+1 (800) 123-4567"}
                    </p>
                    <p className="text-sm text-[#13A048] font-semibold mt-2 uppercase tracking-wide">
                      Mon-Sun: 9am - 8pm
                    </p>
                  </div>
                </div>

                {/* Email Info */}
                <div className="p-8 bg-[#fcfaf8] dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm flex items-start gap-6 hover:-translate-y-1 hover:border-[#13A048] hover:shadow-lg hover:shadow-[#13A048]/10 transition-all duration-300">
                  <div className="w-14 h-14 bg-[#FACC15]/20 rounded-2xl flex items-center justify-center shrink-0 text-[#0F3A44] dark:text-[#FACC15]">
                    <Mail size={28} />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-[#0F3A44] dark:text-white mb-2">
                      Email Us
                    </h4>
                    <p
                      suppressHydrationWarning
                      className="text-gray-600 dark:text-gray-400 leading-relaxed"
                    >
                      {settings.footer_email || "support@femcart.com"}
                    </p>
                    <p className="text-sm text-[#13A048] font-semibold mt-2 uppercase tracking-wide">
                      We reply within 24 hours
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form (Right Column) */}
            <div className="lg:col-span-7">
              <div className="bg-white dark:bg-gray-900 p-8 lg:p-12 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-xl shadow-[#0F3A44]/5 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#0F3A44] via-[#13A048] to-[#FACC15]" />

                <h3 className="text-3xl font-black text-[#0F3A44] dark:text-white mb-8">
                  Send a Message
                </h3>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Name Field */}
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        placeholder="John Doe"
                        defaultValue={user?.name || ""}
                        readOnly={!!user}
                        className={`w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-4 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#13A048] focus:ring-4 focus:ring-[#13A048]/10 transition-all ${user ? "opacity-70 cursor-not-allowed" : ""}`}
                      />
                    </div>
                    {/* Email Field */}
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                        Email or Phone
                      </label>
                      <input
                        type="text"
                        name="email"
                        required
                        placeholder="john@example.com"
                        defaultValue={user?.email || user?.phone || ""}
                        readOnly={!!(user?.email || user?.phone)}
                        className={`w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-4 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#13A048] focus:ring-4 focus:ring-[#13A048]/10 transition-all ${user?.email || user?.phone ? "opacity-70 cursor-not-allowed" : ""}`}
                      />
                    </div>
                  </div>

                  {/* Subject Field */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                      Subject
                    </label>
                    <input
                      type="text"
                      name="subject"
                      required
                      placeholder="How can we help you?"
                      className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-4 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#13A048] focus:ring-4 focus:ring-[#13A048]/10 transition-all"
                    />
                  </div>

                  {/* Message Field */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                      Your Message
                    </label>
                    <textarea
                      name="message"
                      required
                      rows={5}
                      placeholder="Tell us everything..."
                      className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-4 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#13A048] focus:ring-4 focus:ring-[#13A048]/10 transition-all resize-none"
                    ></textarea>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-[#0F3A44] text-white py-5 rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-[#13A048] hover:shadow-lg hover:shadow-[#13A048]/20 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-3 group"
                    >
                      {isSubmitting ? (
                        "Sending..."
                      ) : (
                        <>
                          <Send
                            size={20}
                            className="group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform"
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
