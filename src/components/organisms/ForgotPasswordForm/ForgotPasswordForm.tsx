"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Loader2, Send } from "lucide-react";
import { forgotPasswordSchema, type ForgotPasswordSchema } from "@/lib/schemas";
import { forgotPasswordAction } from "@/lib/actions/auth";

const INPUT_CLASS =
  "mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";

export default function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordSchema) => {
    const result = await forgotPasswordAction(data);
    if (result.success) {
      setSent(true);
    } else {
      setError("email", { message: result.error });
    }
  };

  if (sent) {
    return (
      <div className="rounded-2xl bg-white p-8 shadow-md text-center">
        <div className="mb-4 flex justify-center">
          <Send size={40} className="text-indigo-600" />
        </div>
        <h1 className="mb-2 text-2xl font-bold text-gray-900">
          Check your email
        </h1>
        <p className="text-sm text-gray-600">
          If an account exists for that email, we sent a password reset link. It
          expires in 1 hour.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block text-sm text-indigo-600 hover:underline font-medium"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-8 shadow-md">
      <h1 className="mb-2 text-2xl font-bold text-gray-900">Forgot password</h1>
      <p className="mb-6 text-sm text-gray-600">
        Enter your email and we&apos;ll send you a reset link.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="flex items-center gap-1.5 text-sm font-medium text-gray-700"
          >
            <Mail size={14} />
            Email
          </label>
          <input
            id="email"
            type="email"
            {...register("email")}
            className={INPUT_CLASS}
            placeholder="you@example.com"
            autoComplete="email"
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Send size={15} />
          )}
          {isSubmitting ? "Sending…" : "Send reset link"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-600">
        <Link
          href="/login"
          className="text-indigo-600 hover:underline font-medium"
        >
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
