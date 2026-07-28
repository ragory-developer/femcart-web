"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { ReactNode, useEffect } from "react";

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  submitLabel?: string;
  loading?: boolean;
  width?: string;
}

export default function FormModal({
  isOpen,
  onClose,
  title,
  children,
  onSubmit,
  submitLabel = "Save",
  loading = false,
  width = "max-w-lg",
}: FormModalProps) {
  // Prevent page scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.3 }}
            className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${width} w-[95%] bg-white dark:bg-gray-800 rounded-[clamp(1.25rem,3vw,1.5rem)] shadow-2xl z-50 overflow-hidden`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-[clamp(1.25rem,3vw,1.5rem)] border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-[clamp(1.125rem,3vw,1.25rem)] font-bold text-gray-900 dark:text-white">
                {title}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="w-[44px] h-[44px] rounded-[clamp(0.5rem,1.5vw,0.75rem)] flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={onSubmit}>
              <div className="p-[clamp(1.25rem,3vw,1.5rem)] space-y-4 max-h-[60vh] overflow-y-auto">
                {children}
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 p-[clamp(1.25rem,3vw,1.5rem)] border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-[clamp(1rem,3vw,1.5rem)] py-[clamp(0.5rem,1.5vw,0.75rem)] min-h-[44px] rounded-[clamp(0.75rem,2vw,1rem)] text-[clamp(0.875rem,2vw,1rem)] font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-[clamp(1rem,3vw,1.5rem)] py-[clamp(0.5rem,1.5vw,0.75rem)] min-h-[44px] rounded-[clamp(0.75rem,2vw,1rem)] text-[clamp(0.875rem,2vw,1rem)] font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {loading ? "Saving..." : submitLabel}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
