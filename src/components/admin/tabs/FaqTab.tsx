"use client";

import { MessageCircleQuestion, Plus, X, AlertCircle } from "lucide-react";
import { useFormContext, useFieldArray } from "react-hook-form";
import { ProductFormValues } from "@/lib/validations/product";

export default function FaqTab() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<ProductFormValues>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "faqs",
  });

  const faqsErrors = errors.faqs;

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 md:p-8 shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-750 pb-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Product FAQs
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Add frequently asked questions and answers for this product.
            </p>
          </div>
          <button
            type="button"
            onClick={() => append({ question: "", answer: "" })}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
          >
            <Plus size={16} /> Add FAQ
          </button>
        </div>

        <div className="space-y-4">
          {fields.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-900/40 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-800">
              <MessageCircleQuestion className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                No FAQs yet
              </h3>
              <p className="text-sm text-gray-500">
                Click the button above to add your first question.
              </p>
            </div>
          ) : (
            fields.map((field, index) => {
              const faqError = faqsErrors?.[index];

              return (
                <div
                  key={field.id}
                  className="group relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 transition-all hover:border-blue-200 dark:hover:border-blue-900/50 hover:shadow-md"
                >
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="absolute top-4 right-4 p-1 rounded-lg text-gray-400 hover:text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-colors"
                  >
                    <X size={18} />
                  </button>

                  <div className="space-y-4 pr-8">
                    <div className="relative">
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                        Question {index + 1}
                      </label>
                      <input
                        type="text"
                        {...register(`faqs.${index}.question`)}
                        placeholder="e.g. Is this product organic?"
                        className={`w-full px-4 py-2.5 rounded-lg border ${faqError?.question ? "border-pink-500" : "border-gray-200 dark:border-gray-700"} bg-gray-50 dark:bg-gray-900/50 text-sm focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900 dark:text-white font-medium transition-colors`}
                      />
                      {faqError?.question && (
                        <p className="absolute top-full left-0 mt-1 text-pink-500 text-[11px] font-medium flex items-center gap-1">
                          <AlertCircle size={14} /> {faqError.question.message}
                        </p>
                      )}
                    </div>
                    <div className="relative">
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                        Answer
                      </label>
                      <textarea
                        {...register(`faqs.${index}.answer`)}
                        placeholder="e.g. Yes, all our products are 100% certified organic."
                        rows={3}
                        className={`w-full px-4 py-2.5 rounded-lg border ${faqError?.answer ? "border-pink-500" : "border-gray-200 dark:border-gray-700"} bg-gray-50 dark:bg-gray-900/50 text-sm focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900 dark:text-white font-medium transition-colors resize-none`}
                      />
                      {faqError?.answer && (
                        <p className="absolute top-full left-0 mt-1 text-pink-500 text-[11px] font-medium flex items-center gap-1">
                          <AlertCircle size={14} /> {faqError.answer.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
