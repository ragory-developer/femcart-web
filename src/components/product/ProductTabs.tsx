"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Info,
  ListChecks,
  MessageCircleQuestion,
  Star,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";

export default function ProductTabs({ product }: { product: any }) {
  const [activeTab, setActiveTab] = useState("description");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const validSpecifications =
    product.specifications && Array.isArray(product.specifications)
      ? product.specifications.filter(
          (spec: any) =>
            spec &&
            spec.name &&
            spec.name.trim() !== "" &&
            spec.value &&
            spec.value.trim() !== "",
        )
      : [];

  const hasSpecifications =
    validSpecifications.length > 0 ||
    product.weight ||
    (product.variants &&
      product.variants.some(
        (v: any) => v.attributes && v.attributes.length > 0,
      ));

  const validFaqs =
    product.faqs && Array.isArray(product.faqs)
      ? product.faqs.filter(
          (faq: any) =>
            faq &&
            faq.question &&
            faq.question.trim() !== "" &&
            faq.answer &&
            faq.answer.trim() !== "",
        )
      : [];

  const hasFaqs = validFaqs.length > 0;

  const tabs = [
    { id: "description", label: "Description", icon: Info, show: true },
    {
      id: "specifications",
      label: "Specifications",
      icon: ListChecks,
      show: hasSpecifications,
    },
    {
      id: "questions",
      label: "Questions (Q&A)",
      icon: MessageCircleQuestion,
      show: hasFaqs,
    },
    { id: "reviews", label: "Reviews", icon: Star, show: true },
  ].filter((tab) => tab.show);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden mt-[clamp(1.5rem,4vw,3rem)]">
      {/* Tabs Header */}
      <div className="flex overflow-x-auto touch-pan-x border-b border-gray-100 dark:border-gray-800 scrollbar-hide">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-[clamp(1rem,3vw,1.5rem)] py-3 sm:py-[clamp(0.75rem,2vw,1rem)] min-h-[44px] sm:min-h-[48px] font-bold text-xs sm:text-[clamp(0.875rem,2vw,1rem)] whitespace-nowrap transition-all relative ${
                isActive
                  ? "text-pink-600 dark:text-pink-500"
                  : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              <Icon className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
              {tab.label}
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-600 dark:bg-pink-500"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Tabs Content */}
      <div className="p-4 sm:p-[clamp(1rem,4vw,2rem)] min-h-[250px] sm:min-h-[300px]">
        {/* Description Tab */}
        <div
          className={
            activeTab === "description"
              ? "block animate-in fade-in slide-in-from-bottom-2 duration-500"
              : "hidden"
          }
        >
          <div className="text-gray-600 dark:text-gray-300">
            {product.description ? (
              <article
                className="prose prose-sm sm:prose-base prose-pink dark:prose-invert max-w-none prose-p:text-gray-600 dark:prose-p:text-gray-300 prose-p:leading-relaxed sm:prose-p:leading-loose prose-p:mb-4 sm:prose-p:mb-6 prose-headings:font-black prose-headings:tracking-tight prose-headings:text-gray-900 dark:prose-headings:text-white prose-h2:text-2xl sm:prose-h2:text-3xl prose-h2:mt-8 sm:prose-h2:mt-12 prose-h2:mb-4 sm:prose-h2:mb-6 prose-h2:border-b prose-h2:border-gray-100 dark:prose-h2:border-gray-800 prose-h2:pb-3 sm:prose-h2:pb-4 prose-h3:text-xl sm:prose-h3:text-2xl prose-h3:mt-6 sm:prose-h3:mt-8 prose-h3:mb-3 sm:prose-h3:mb-4 prose-h3:text-pink-700 dark:prose-h3:text-pink-400 prose-li:marker:text-pink-500 prose-img:rounded-lg prose-img:shadow-sm"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            ) : (
              <div className="py-8 text-center bg-gray-50/50 dark:bg-gray-800/30 rounded-xl border border-gray-100 dark:border-gray-800">
                <Info className="mx-auto mb-3 text-gray-400" size={32} />
                <p className="text-gray-500 dark:text-gray-400 font-medium tracking-tight">
                  No detailed description available for this product.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Specifications Tab */}
        <div
          className={
            activeTab === "specifications"
              ? "block animate-in fade-in slide-in-from-bottom-2 duration-500"
              : "hidden"
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[clamp(0.875rem,2vw,1rem)] text-gray-600 dark:text-gray-300">
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {product.weight && (
                  <tr className="even:bg-gray-50/50 dark:even:bg-gray-800/30 hover:bg-gray-50/80 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="py-[clamp(0.75rem,2vw,1rem)] px-[clamp(0.5rem,1.5vw,1rem)] font-bold w-1/3 text-gray-900 dark:text-white capitalize">
                      Weight / Volume
                    </td>
                    <td className="py-[clamp(0.75rem,2vw,1rem)] px-[clamp(0.5rem,1.5vw,1rem)] font-medium">
                      {product.weight} {product.unit}
                    </td>
                  </tr>
                )}

                {product.categories && product.categories.length > 0 && (
                  <tr className="even:bg-gray-50/50 dark:even:bg-gray-800/30 hover:bg-gray-50/80 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="py-[clamp(0.75rem,2vw,1rem)] px-[clamp(0.5rem,1.5vw,1rem)] font-bold w-1/3 text-gray-900 dark:text-white capitalize">
                      Categories
                    </td>
                    <td className="py-[clamp(0.75rem,2vw,1rem)] px-[clamp(0.5rem,1.5vw,1rem)] font-medium">
                      {product.categories.map((c: any) => c.name).join(", ")}
                    </td>
                  </tr>
                )}

                {product.brand && (
                  <tr className="even:bg-gray-50/50 dark:even:bg-gray-800/30 hover:bg-gray-50/80 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="py-[clamp(0.75rem,2vw,1rem)] px-[clamp(0.5rem,1.5vw,1rem)] font-bold w-1/3 text-gray-900 dark:text-white capitalize">
                      Brand
                    </td>
                    <td className="py-[clamp(0.75rem,2vw,1rem)] px-[clamp(0.5rem,1.5vw,1rem)] font-medium">
                      {product.brand.name}
                    </td>
                  </tr>
                )}

                {validSpecifications.length > 0 &&
                  validSpecifications.map((s: any, i: number) => (
                    <tr
                      key={`spec-${i}`}
                      className="even:bg-gray-50/50 dark:even:bg-gray-800/30 hover:bg-gray-50/80 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="py-[clamp(0.75rem,2vw,1rem)] px-[clamp(0.5rem,1.5vw,1rem)] font-bold w-1/3 text-gray-900 dark:text-white capitalize">
                        {s.name}
                      </td>
                      <td className="py-[clamp(0.75rem,2vw,1rem)] px-[clamp(0.5rem,1.5vw,1rem)] font-medium">
                        <div className="flex flex-wrap gap-2">
                          {s.value
                            ? s.value.split(" | ").map((v: string) => (
                                <span
                                  key={v}
                                  className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-3 py-1 rounded-full text-[clamp(0.75rem,1.5vw,0.875rem)] border border-gray-200 dark:border-gray-700 shadow-sm"
                                >
                                  {v}
                                </span>
                              ))
                            : "-"}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Questions Tab (FAQs) */}
        <div
          className={
            activeTab === "questions"
              ? "block animate-in fade-in slide-in-from-bottom-2 duration-500"
              : "hidden"
          }
        >
          <div className="space-y-4">
            {hasFaqs && (
              <div
                className="grid grid-cols-1 gap-3"
                itemScope
                itemType="https://schema.org/FAQPage"
              >
                {validFaqs.map((faq: any, i: number) => {
                  const isOpen = openFaqIndex === i;
                  return (
                    <div
                      key={i}
                      className={`overflow-hidden transition-all duration-200 border ${isOpen ? "border-pink-200 dark:border-pink-900/50 bg-pink-50/50 dark:bg-pink-900/10 shadow-sm" : "border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 hover:bg-gray-50 dark:hover:bg-gray-800/50"} rounded-xl group cursor-pointer`}
                      itemProp="mainEntity"
                      itemScope
                      itemType="https://schema.org/Question"
                      onClick={() => setOpenFaqIndex(isOpen ? null : i)}
                    >
                      <div className="flex items-center justify-between p-[clamp(1rem,3vw,1.5rem)] select-none">
                        <div className="flex gap-4 items-center">
                          <div
                            className={`p-2.5 rounded-xl transition-colors ${isOpen ? "bg-pink-600 text-white shadow-md shadow-pink-600/20" : "bg-white dark:bg-gray-900 text-gray-400 group-hover:text-pink-500"}`}
                          >
                            <MessageCircleQuestion size={20} />
                          </div>
                          <h4
                            className={`font-bold text-[clamp(0.9rem,2vw,1.1rem)] tracking-tight transition-colors ${isOpen ? "text-pink-700 dark:text-pink-400" : "text-gray-900 dark:text-white"}`}
                            itemProp="name"
                          >
                            {faq.question}
                          </h4>
                        </div>
                        <div
                          className={`w-8 h-8 flex items-center justify-center rounded-full transition-all duration-300 ${isOpen ? "bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rotate-180" : "bg-white dark:bg-gray-900 text-gray-400 group-hover:bg-gray-100 dark:group-hover:bg-gray-800"}`}
                        >
                          <ChevronDown size={18} />
                        </div>
                      </div>
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                          >
                            <div className="px-[clamp(1rem,3vw,1.5rem)] pb-[clamp(1rem,3vw,1.5rem)] pt-0 ml-[52px]">
                              <div
                                className="text-gray-600 dark:text-gray-300 leading-relaxed font-medium bg-white dark:bg-gray-900 p-[clamp(1rem,2vw,1.25rem)] rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm"
                                itemProp="suggestedAnswer acceptedAnswer"
                                itemScope
                                itemType="https://schema.org/Answer"
                              >
                                <div itemProp="text">{faq.answer}</div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Reviews Tab */}
        <div
          className={
            activeTab === "reviews"
              ? "block animate-in fade-in slide-in-from-bottom-2 duration-500"
              : "hidden"
          }
        >
          {/* Reviews content stays mostly the same but rendered always */}
          <div className="flex items-center gap-[clamp(1rem,3vw,1.5rem)] mb-[clamp(1.5rem,4vw,2rem)] p-[clamp(1rem,3vw,1.5rem)] bg-pink-50 dark:bg-pink-900/20 rounded-lg">
            <div className="text-center">
              <div className="text-[clamp(2.5rem,6vw,3rem)] font-black text-pink-600">
                {product.averageRating > 0
                  ? product.averageRating.toFixed(1)
                  : "0.0"}
              </div>
              <div className="flex items-center justify-center text-amber-500 my-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={
                      i < Math.round(product.averageRating || 0)
                        ? "fill-current"
                        : "text-gray-300 dark:text-gray-600"
                    }
                  />
                ))}
              </div>
              <div className="text-[clamp(0.75rem,1.5vw,0.875rem)] text-gray-500">
                Based on {product.ratingCount || 0} reviews
              </div>
            </div>
            <div className="flex-1 hidden sm:block">
              {/* Note: Review distribution progress bars removed as they require aggregated review score data not currently in the product model. */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
