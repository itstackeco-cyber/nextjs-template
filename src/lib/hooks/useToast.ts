"use client";

import { AppContext } from "@/lib/context/AppContext";
import { useContext } from "react";

export function useToast() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useToast must be used within AppProvider");
  return ctx;
}
