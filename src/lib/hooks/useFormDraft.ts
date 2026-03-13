import { useCallback, useEffect, useRef } from "react";
import { UseFormReset, UseFormWatch, FieldValues } from "react-hook-form";

export function useFormDraft<T extends FieldValues>(
  key: string,
  watch: UseFormWatch<T>,
  reset: UseFormReset<T>
) {
  useEffect(() => {
    const saved = localStorage.getItem(key);
    if (!saved) return;
    try {
      reset(JSON.parse(saved) as T);
    } catch {
      localStorage.removeItem(key);
    }
  }, [key, reset]);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const subscription = watch((values) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        localStorage.setItem(key, JSON.stringify(values));
      }, 500);
    });
    return () => {
      subscription.unsubscribe();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [key, watch]);

  const clearDraft = useCallback(() => localStorage.removeItem(key), [key]);

  return { clearDraft };
}
