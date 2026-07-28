import { AlertCircle, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { toast } from "sonner";

export const showToast = {
  success: (message: string, description?: string) => {
    toast.success(message, {
      description,
      icon: <CheckCircle2 className="text-green-500 w-5 h-5" />,
      className:
        "bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border border-green-100 dark:border-green-900 shadow-xl shadow-green-900/5",
    });
  },
  error: (message: string, description?: string) => {
    toast.error(message, {
      description,
      icon: <AlertCircle className="text-pink-500 w-5 h-5" />,
      className:
        "bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border border-pink-100 dark:border-pink-900 shadow-xl shadow-pink-900/5",
    });
  },
  info: (message: string, description?: string) => {
    toast.info(message, {
      description,
      icon: <Info className="text-blue-500 w-5 h-5" />,
      className:
        "bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border border-blue-100 dark:border-blue-900 shadow-xl shadow-blue-900/5",
    });
  },
  warning: (message: string, description?: string) => {
    toast.warning(message, {
      description,
      icon: <AlertTriangle className="text-amber-500 w-5 h-5" />,
      className:
        "bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border border-amber-100 dark:border-amber-900 shadow-xl shadow-amber-900/5",
    });
  },
};
