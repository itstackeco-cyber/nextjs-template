export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastNotification {
  id: string;
  type: ToastType;
  message: string;
  title?: string;
}
