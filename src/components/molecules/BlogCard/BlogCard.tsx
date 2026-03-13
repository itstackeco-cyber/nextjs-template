"use client";

import { memo, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { blogService } from "@/lib/services/blog.service";
import { useToast } from "@/lib/hooks/useToast";
import { User, Calendar, Trash2 } from "lucide-react";
import type { BlogCardProps } from "./BlogCard.types";

const BlogCard = memo(function BlogCard({ blog }: BlogCardProps) {
  const router = useRouter();
  const t = useTranslations("blogCard");
  const { addToast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = useCallback(async () => {
    setIsDeleting(true);
    try {
      await blogService.delete(blog.id);
      router.refresh();
    } catch (error) {
      addToast({
        type: "error",
        message: error instanceof Error ? error.message : t("deleteError"),
      });
      setIsDeleting(false);
    }
  }, [blog.id, router, addToast, t]);

  return (
    <div className="p-5 border border-gray-200 rounded-xl bg-white hover:shadow-md transition-all">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {blog.title}
          </h3>
          <div className="flex items-center gap-4 mt-1.5 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <User size={12} />
              {blog.author}
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              {new Date(blog.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="shrink-0 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label={t("delete")}
        >
          <Trash2 size={16} />
        </button>
      </div>
      <p className="mt-3 text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
        {blog.content}
      </p>
    </div>
  );
});

export default BlogCard;
