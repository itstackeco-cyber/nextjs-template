"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { Globe } from "lucide-react";
import Cookies from "js-cookie";
import { COOKIE_EXPIRES_DAYS } from "@/lib/constants/global";
import { LANGUAGES } from "./LanguageSwitcher.const";
import type { LanguageSwitcherProps } from "./LanguageSwitcher.types";

export default function LanguageSwitcher({
  currentLocale,
}: LanguageSwitcherProps) {
  const router = useRouter();

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      Cookies.set("NEXT_LOCALE", e.target.value, {
        path: "/",
        expires: COOKIE_EXPIRES_DAYS,
        sameSite: "strict",
        secure: true,
      });
      router.refresh();
    },
    [router]
  );

  return (
    <div className="flex items-center gap-1.5 text-sm text-gray-500">
      <Globe size={14} />
      <select
        value={currentLocale}
        onChange={handleChange}
        aria-label="Select language"
        className="bg-transparent text-sm text-gray-600 focus:outline-none cursor-pointer hover:text-gray-900 transition-colors"
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.label}
          </option>
        ))}
      </select>
    </div>
  );
}
