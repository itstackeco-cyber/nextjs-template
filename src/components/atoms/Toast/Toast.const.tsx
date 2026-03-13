import { CheckCircle2, XCircle, AlertTriangle, Info } from "lucide-react";
import type { ToastType } from "@/lib/types";

export const TOAST_CONFIG: Record<
  ToastType,
  {
    icon: React.ReactNode;
    bg: string;
    iconColor: string;
    border: string;
    titleColor: string;
  }
> = {
  success: {
    icon: <CheckCircle2 size={18} />,
    bg: "bg-green-50",
    iconColor: "text-green-600",
    border: "border-green-200",
    titleColor: "text-green-800",
  },
  error: {
    icon: <XCircle size={18} />,
    bg: "bg-red-50",
    iconColor: "text-red-600",
    border: "border-red-200",
    titleColor: "text-red-800",
  },
  warning: {
    icon: <AlertTriangle size={18} />,
    bg: "bg-yellow-50",
    iconColor: "text-yellow-600",
    border: "border-yellow-200",
    titleColor: "text-yellow-800",
  },
  info: {
    icon: <Info size={18} />,
    bg: "bg-blue-50",
    iconColor: "text-blue-600",
    border: "border-blue-200",
    titleColor: "text-blue-800",
  },
};
