"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Loader2, CheckCircle } from "lucide-react";
import { resetPasswordSchema, type ResetPasswordSchema } from "@/lib/schemas";
import { resetPasswordAction } from "@/lib/actions/auth";

const INPUT_CLASS =
  "mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";

export default function ResetPasswordForm({ token }: { token: string }) {
  const [done, setDone] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordSchema) => {
    const result = await resetPasswordAction(token, data);
    if (result.success) {
      setDone(true);
    } else {
      setError("password", { message: result.error });
    }
  };

  if (done) {
    return (
      <div className="rounded-2xl bg-white p-8 shadow-md text-center">
        <div className="mb-4 flex justify-center">
          <CheckCircle size={40} className="text-green-500" />
        </div>
        <h1 className="mb-2 text-2xl font-bold text-gray-900">
          Password reset
        </h1>
        <p className="text-sm text-gray-600">
          Your password has been updated successfully.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block text-sm text-indigo-600 hover:underline font-medium"
        >
          Sign in with new password
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-8 shadow-md">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Reset password</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label
            htmlFor="password"
            className="flex items-center gap-1.5 text-sm font-medium text-gray-700"
          >
            <Lock size={14} />
            New password
          </label>
          <input
            id="password"
            type="password"
            {...register("password")}
            className={INPUT_CLASS}
            placeholder="••••••••"
            autoComplete="new-password"
          />
          {errors.password && (
            <p className="mt-1 text-xs text-red-500">
              {errors.password.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="flex items-center gap-1.5 text-sm font-medium text-gray-700"
          >
            <Lock size={14} />
            Confirm new password
          </label>
          <input
            id="confirmPassword"
            type="password"
            {...register("confirmPassword")}
            className={INPUT_CLASS}
            placeholder="••••••••"
            autoComplete="new-password"
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-red-500">
              {errors.confirmPassword.message}
            </p>
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
            <Lock size={15} />
          )}
          {isSubmitting ? "Resetting…" : "Reset password"}
        </button>
      </form>
    </div>
  );
}
