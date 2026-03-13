"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { blogSchema, BlogSchema } from "@/lib/schemas";
import { createBlogAction } from "@/lib/actions/blog";
import { useFormDraft } from "@/lib/hooks/useFormDraft";
import { useToast } from "@/lib/hooks/useToast";
import { BLOG_DRAFT_KEY } from "@/lib/constants/global";
import { User, Heading, AlignLeft, Loader2, Save } from "lucide-react";
import { INPUT_CLASS } from "./BlogForm.const";
import type { BlogFormProps } from "./BlogForm.types";

export default function BlogForm({ onSuccess }: BlogFormProps) {
  const router = useRouter();
  const t = useTranslations("blogForm");
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<BlogSchema>({
    resolver: zodResolver(blogSchema),
  });

  const { clearDraft } = useFormDraft(BLOG_DRAFT_KEY, watch, reset);
  const { addToast } = useToast();

  const onSubmit = async (data: BlogSchema) => {
    const result = await createBlogAction(data);
    if (result.success) {
      clearDraft();
      reset();
      router.refresh();
      addToast({ type: "success", message: t("successMessage") });
      onSuccess?.();
    } else {
      addToast({ type: "error", message: result.error ?? t("errorMessage") });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label
          htmlFor="author"
          className="flex items-center gap-1.5 text-sm font-medium text-gray-700"
        >
          <User size={14} />
          {t("author")}
        </label>
        <input
          id="author"
          {...register("author")}
          className={INPUT_CLASS}
          placeholder={t("authorPlaceholder")}
        />
        {errors.author && (
          <p className="text-red-500 text-xs mt-1">{errors.author.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="title"
          className="flex items-center gap-1.5 text-sm font-medium text-gray-700"
        >
          <Heading size={14} />
          {t("title")}
        </label>
        <input
          id="title"
          {...register("title")}
          className={INPUT_CLASS}
          placeholder={t("titlePlaceholder")}
        />
        {errors.title && (
          <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="content"
          className="flex items-center gap-1.5 text-sm font-medium text-gray-700"
        >
          <AlignLeft size={14} />
          {t("content")}
        </label>
        <textarea
          id="content"
          {...register("content")}
          rows={4}
          className={INPUT_CLASS}
          placeholder={t("contentPlaceholder")}
        />
        {errors.content && (
          <p className="text-red-500 text-xs mt-1">{errors.content.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
      >
        {isSubmitting ? (
          <Loader2 size={15} className="animate-spin" />
        ) : (
          <Save size={15} />
        )}
        {isSubmitting ? t("saving") : t("save")}
      </button>
    </form>
  );
}
