export const dynamic = "force-dynamic";

import CreateBlogButton from "@/components/organisms/CreateBlogButton/CreateBlogButton";
import BlogCard from "@/components/molecules/BlogCard/BlogCard";
import HomeTemplate from "@/components/templates/HomeTemplate";
import { BookOpen, Newspaper } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { blogService } from "@/lib/services/blog.service";

export default async function BlogsPage() {
  const [blogs, t] = await Promise.all([
    blogService.getAll(),
    getTranslations(),
  ]);

  return (
    <HomeTemplate
      title={
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <BookOpen
              size={22}
              className="text-indigo-600"
              aria-hidden="true"
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{t("nav.title")}</h1>
        </div>
      }
      actionButton={<CreateBlogButton />}
      listTitle={
        <div className="flex items-center gap-2 text-gray-500">
          <Newspaper size={16} aria-hidden="true" />
          <h2 className="text-sm font-medium uppercase tracking-wider">
            {t("nav.recentPosts")}
          </h2>
        </div>
      }
      blogList={
        blogs.length > 0 ? (
          blogs.map((blog) => <BlogCard key={blog.id} blog={blog} />)
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <BookOpen
              size={40}
              strokeWidth={1.5}
              className="mb-3"
              aria-hidden="true"
            />
            <p className="text-sm">{t("nav.emptyState")}</p>
          </div>
        )
      }
    />
  );
}
