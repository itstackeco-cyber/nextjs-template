"use client";

import { memo, useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import { useToast } from "@/lib/hooks/useToast";
import type { ToastNotification } from "@/lib/types";
import { TOAST_AUTO_DISMISS_MS } from "@/lib/constants/global";
import { TOAST_CONFIG } from "./Toast.const";

const ToastItem = memo(function ToastItem({
  notification,
  onRemove,
}: {
  notification: ToastNotification;
  onRemove: (id: string) => void;
}) {
  const t = useTranslations("toast");
  const [visible, setVisible] = useState(false);
  const { icon, bg, iconColor, border, titleColor } =
    TOAST_CONFIG[notification.type];

  useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const dismiss = useCallback(() => {
    setVisible(false);
    setTimeout(() => onRemove(notification.id), 300);
  }, [onRemove, notification.id]);

  useEffect(() => {
    const timer = setTimeout(dismiss, TOAST_AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [dismiss]);

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`flex items-start gap-3 w-80 p-4 rounded-xl border shadow-lg transition-all duration-300 ${bg} ${border} ${
        visible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      }`}
    >
      <span className={`mt-0.5 shrink-0 ${iconColor}`}>{icon}</span>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${titleColor}`}>
          {notification.title ?? t(notification.type)}
        </p>
        <p className="text-sm text-gray-600 mt-0.5">{notification.message}</p>
      </div>
      <button
        type="button"
        onClick={dismiss}
        className="shrink-0 p-0.5 text-gray-400 hover:text-gray-600 rounded transition-colors"
        aria-label="Close notification"
      >
        <X size={15} />
      </button>
    </div>
  );
});

export default function Toast() {
  const { notifications, removeToast } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {notifications.map((notification) => (
        <ToastItem
          key={notification.id}
          notification={notification}
          onRemove={removeToast}
        />
      ))}
    </div>
  );
}
