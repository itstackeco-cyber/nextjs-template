"use client";

import { createContext, useCallback, useState } from "react";
import type { ToastNotification, ToastType } from "@/lib/types";

export interface AddToastParams {
  type: ToastType;
  message: string;
  title?: string;
}

interface AppContextValue {
  notifications: ToastNotification[];
  addToast: (notification: AddToastParams) => void;
  removeToast: (id: string) => void;
}

export const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<ToastNotification[]>([]);

  const addToast = useCallback((notification: AddToastParams) => {
    const id = crypto.randomUUID();
    setNotifications((prev) => [...prev, { ...notification, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return (
    <AppContext.Provider value={{ notifications, addToast, removeToast }}>
      {children}
    </AppContext.Provider>
  );
}
