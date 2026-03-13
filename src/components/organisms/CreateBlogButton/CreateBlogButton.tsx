"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { Plus, X, Loader2 } from "lucide-react";

const BlogForm = dynamic(() => import("../BlogForm/BlogForm"), {
  loading: () => (
    <div className="flex justify-center py-8">
      <Loader2 size={20} className="animate-spin text-indigo-500" />
    </div>
  ),
});

export default function CreateBlogButton() {
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations("blogForm");
  const openButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const handleOpen = useCallback(() => setIsOpen(true), []);
  const handleClose = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.focus();
    } else {
      openButtonRef.current?.focus();
    }
  }, [isOpen]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    },
    [handleClose]
  );

  return (
    <>
      <button
        ref={openButtonRef}
        onClick={handleOpen}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
      >
        <Plus size={16} aria-hidden="true" />
        {t("newBlog")}
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={handleClose}
          aria-hidden="true"
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="blog-modal-title"
            tabIndex={-1}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl focus:outline-none"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={handleKeyDown}
            aria-hidden="false"
          >
            <div className="mb-5 flex items-center justify-between">
              <h2
                id="blog-modal-title"
                className="text-lg font-semibold text-gray-900"
              >
                {t("modalTitle")}
              </h2>
              <button
                onClick={handleClose}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label={t("closeModal")}
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>
            <BlogForm onSuccess={handleClose} />
          </div>
        </div>
      )}
    </>
  );
}
