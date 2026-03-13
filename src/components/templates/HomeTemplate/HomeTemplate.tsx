import { getLocale } from "next-intl/server";
import LanguageSwitcher from "@/components/atoms/LanguageSwitcher/LanguageSwitcher";
import type { HomeTemplateProps } from "./HomeTemplate.types";

export default async function HomeTemplate({
  title,
  actionButton,
  listTitle,
  blogList,
}: HomeTemplateProps) {
  const locale = await getLocale();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <header className="flex items-center justify-between mb-10">
          {title}
          <div className="flex items-center gap-3">
            <LanguageSwitcher currentLocale={locale} />
            {actionButton}
          </div>
        </header>
        <main>
          <div className="mb-4">{listTitle}</div>
          <div className="space-y-3">{blogList}</div>
        </main>
      </div>
    </div>
  );
}
