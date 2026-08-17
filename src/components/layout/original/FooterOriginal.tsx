"use client";

import { useNavigationStore } from "@/store/navigationStore";
import {
  Facebook,
  Instagram,
  Leaf,
  Mail,
  MapPin,
  Phone,
  Twitter,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

import { useSettingsStore } from "@/store/settingsStore";

interface FooterOriginalProps {
  newsletterTitle?: string;
  newsletterSubtitle?: string;
  contactAddress?: string;
  contactPhone?: string;
  contactEmail?: string;
}

export default function Footer({
  newsletterTitle = "Join our Newsletter",
  newsletterSubtitle = "Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals delivered right to your inbox.",
  contactAddress,
  contactPhone,
  contactEmail,
}: FooterOriginalProps = {}) {
  const footerSections = useNavigationStore((state) => state.footerSections);
  const settings = useSettingsStore((state) => state.settings);

  return (
    <footer
      className="pt-[clamp(3rem,8vw,5rem)] pb-[clamp(6rem,12vh,8rem)] md:pb-[clamp(1.5rem,4vw,2.5rem)] border-t-[6px] border-[#FACC15] mt-auto relative z-10"
      style={
        {
          backgroundColor: settings.footer_bg_color || "#0F3A44",
          color: settings.footer_text_color || "#FFFFFF",
        } as React.CSSProperties
      }
    >
      <div className="container mx-auto px-[clamp(1rem,4vw,2rem)]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[clamp(2rem,5vw,3rem)] mb-[clamp(2rem,6vw,4rem)]">
          {/* Brand & About */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2 group z-50">
              {settings.store_logo ? (
                <Image
                  unoptimized
                  src={settings.store_logo}
                  alt={settings.store_name || "Logo"}
                  width={150}
                  height={40}
                  className="h-[clamp(2rem,5vw,2.5rem)] w-auto group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <>
                  <div className="bg-lime text-white p-[clamp(0.5rem,1.5vw,0.75rem)] rounded-xl">
                    <Leaf className="w-[clamp(20px,5vw,28px)] h-[clamp(20px,5vw,28px)]" />
                  </div>
                  <span className="text-[clamp(1.25rem,4vw,1.5rem)] font-black text-white tracking-tight whitespace-nowrap font-display">
                    {settings.store_name || "Femcart"}
                  </span>
                </>
              )}
            </Link>
            <p className="text-white/80 leading-relaxed font-medium text-[clamp(0.875rem,1.5vw,1rem)]">
              {settings.footer_about_text ||
                "We deliver the freshest groceries, organic vegetables, and daily essentials straight from farms to your home in just 30 minutes. Quality and freshness guaranteed."}
            </p>
            <div className="flex gap-[clamp(0.5rem,2vw,1rem)]">
              {settings.footer_facebook && (
                <a
                  href={settings.footer_facebook}
                  target="_blank"
                  rel="noreferrer"
                  className="w-[clamp(44px,10vw,48px)] h-[clamp(44px,10vw,48px)] min-w-[44px] min-h-[44px] rounded-full bg-white/10 flex items-center justify-center hover:bg-[#FACC15] hover:text-[#0F3A44] transition-colors"
                >
                  <Facebook className="w-[clamp(18px,4vw,20px)] h-[clamp(18px,4vw,20px)]" />
                </a>
              )}
              {settings.footer_twitter && (
                <a
                  href={settings.footer_twitter}
                  target="_blank"
                  rel="noreferrer"
                  className="w-[clamp(44px,10vw,48px)] h-[clamp(44px,10vw,48px)] min-w-[44px] min-h-[44px] rounded-full bg-white/10 flex items-center justify-center hover:bg-[#FACC15] hover:text-[#0F3A44] transition-colors"
                >
                  <Twitter className="w-[clamp(18px,4vw,20px)] h-[clamp(18px,4vw,20px)]" />
                </a>
              )}
              {settings.footer_instagram && (
                <a
                  href={settings.footer_instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="w-[clamp(44px,10vw,48px)] h-[clamp(44px,10vw,48px)] min-w-[44px] min-h-[44px] rounded-full bg-white/10 flex items-center justify-center hover:bg-[#FACC15] hover:text-[#0F3A44] transition-colors"
                >
                  <Instagram className="w-[clamp(18px,4vw,20px)] h-[clamp(18px,4vw,20px)]" />
                </a>
              )}
            </div>
          </div>

          {/* Dynamic Footer Sections */}
          {footerSections
            .filter((sec: any) => sec.isActive)
            .map((sec: any) => (
              <div key={sec.id}>
                <h4 className="text-white font-bold font-display tracking-widest uppercase text-[clamp(1.125rem,2vw,1.25rem)] mb-[clamp(1rem,3vw,1.5rem)]">
                  {sec.title}
                </h4>
                <ul className="space-y-[clamp(0.5rem,1.5vw,1rem)] font-medium text-white/70">
                  {sec.links
                    ?.filter((link: any) => link.isActive)
                    .map((link: any) => (
                      <li key={link.id}>
                        <Link
                          href={
                            link.url
                              ? link.url.startsWith("http") ||
                                link.url.startsWith("#") ||
                                link.url.startsWith("/")
                                ? link.url
                                : `/${link.url}`
                              : "#"
                          }
                          target={link.target || "_self"}
                          prefetch={false}
                          className="hover:text-[#FACC15] transition-colors inline-block py-1"
                        >
                          {link.title}
                        </Link>
                      </li>
                    ))}
                </ul>
              </div>
            ))}

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-bold font-display tracking-widest uppercase text-[clamp(1.125rem,2vw,1.25rem)] mb-[clamp(1rem,3vw,1.5rem)]">
              Contact Us
            </h4>
            <ul className="space-y-[clamp(1rem,2vw,1.25rem)] text-[clamp(0.875rem,1.5vw,1rem)]">
              <li className="flex gap-3 text-white/80">
                <MapPin className="text-[#FACC15] shrink-0 mt-1 w-[clamp(18px,4vw,20px)] h-[clamp(18px,4vw,20px)]" />
                <span className="font-medium leading-relaxed whitespace-pre-line">
                  {contactAddress ||
                    settings.footer_address ||
                    "123 Famecart Avenue, Suite 400\nNew York, NY 10001"}
                </span>
              </li>
              <li className="flex gap-3 text-white/80 items-center">
                <Phone className="text-[#FACC15] shrink-0 w-[clamp(18px,4vw,20px)] h-[clamp(18px,4vw,20px)]" />
                <span className="font-medium">
                  {contactPhone || settings.footer_phone || "+1 (800) 123-4567"}
                </span>
              </li>
              <li className="flex gap-3 text-white/80 items-center">
                <Mail className="text-[#FACC15] shrink-0 w-[clamp(18px,4vw,20px)] h-[clamp(18px,4vw,20px)]" />
                <span className="font-medium truncate">
                  {contactEmail ||
                    settings.footer_email ||
                    "support@famecart.com"}
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-800 text-center md:flex md:justify-between md:text-left text-gray-500 text-[clamp(0.75rem,1.5vw,0.875rem)] font-medium flex flex-col md:flex-row gap-4 items-center">
          <p>
            &copy; {new Date().getFullYear()}{" "}
            {settings.footer_copyright || "Famecart. All rights reserved."}
          </p>
          <div className="mt-4 md:mt-0 space-x-4">
            <Link
              href="#"
              prefetch={false}
              className="hover:text-emerald-400 transition-colors"
            >
              Privacy Policy
            </Link>
            <span>|</span>
            <Link
              href="#"
              prefetch={false}
              className="hover:text-emerald-400 transition-colors"
            >
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
