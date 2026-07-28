"use client";

import { Undo, X } from "lucide-react";
import { useEffect, useState } from "react";

interface UndoToastProps {
  isOpen: boolean;
  message: string;
  duration?: number; // in seconds
  onUndo: () => void;
  onComplete: () => void;
  onDismiss?: () => void;
}

export function UndoToast({
  isOpen,
  message,
  duration = 10,
  onUndo,
  onComplete,
  onDismiss,
}: UndoToastProps) {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (!isOpen) {
      setTimeLeft(duration);
      return;
    }

    if (timeLeft <= 0) {
      onComplete();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, timeLeft, duration, onComplete]);

  if (!isOpen) return null;

  const progress = (timeLeft / duration) * 100;
  const circumference = 2 * Math.PI * 16; // radius 16

  return (
    <div className="fixed bottom-8 right-8 z-[100] animate-in slide-in-from-right-8 fade-in duration-300">
      <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-2xl border border-gray-200/50 dark:border-gray-700/50 rounded-full pl-2 pr-4 py-2 flex items-center gap-4">
        {/* Circular Progress Timer */}
        <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
          <svg className="w-8 h-8 -rotate-90 transform" viewBox="0 0 36 36">
            <circle
              cx="18"
              cy="18"
              r="16"
              fill="none"
              className="stroke-gray-200 dark:stroke-gray-800"
              strokeWidth="3"
            />
            <circle
              cx="18"
              cy="18"
              r="16"
              fill="none"
              className="stroke-blue-600 dark:stroke-blue-500 transition-all duration-1000 ease-linear"
              strokeWidth="3"
              strokeDasharray={circumference}
              strokeDashoffset={
                circumference - (progress / 100) * circumference
              }
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute text-[10px] font-bold text-gray-700 dark:text-gray-300">
            {timeLeft}
          </span>
        </div>

        <div className="text-sm font-semibold text-gray-800 dark:text-gray-200 whitespace-nowrap">
          {message}
        </div>

        <div className="w-[1px] h-6 bg-gray-200 dark:bg-gray-700 mx-1"></div>

        <button
          onClick={onUndo}
          className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-full text-sm font-bold transition-colors active:scale-95"
        >
          <Undo size={14} /> Undo
        </button>

        {onDismiss && (
          <button
            onClick={onDismiss}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
