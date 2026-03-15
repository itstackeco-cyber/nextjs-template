"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, Loader2, LogIn } from "lucide-react";
import { loginSchema, type LoginSchema } from "@/lib/schemas";
import { loginAction } from "@/lib/actions/auth";
import { useToast } from "@/lib/hooks/useToast";

const INPUT_CLASS =
  "mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";

export default function LoginForm() {
  const router = useRouter();
  const { addToast } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginSchema>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginSchema) => {
    const result = await loginAction(data);
    if (result.success) {
      router.push("/");
      router.refresh();
    } else {
      addToast({ type: "error", message: result.error ?? "Login failed." });
    }
  };

  return (
    <div className="rounded-2xl bg-white p-8 shadow-md">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Sign in</h1>

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

        <div>
          <label
            htmlFor="password"
            className="flex items-center gap-1.5 text-sm font-medium text-gray-700"
          >
            <Lock size={14} />
            Password
          </label>
          <input
            id="password"
            type="password"
            {...register("password")}
            className={INPUT_CLASS}
            placeholder="••••••••"
            autoComplete="current-password"
          />
          {errors.password && (
            <p className="mt-1 text-xs text-red-500">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-xs text-indigo-600 hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <LogIn size={15} />
          )}
          {isSubmitting ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-600">
        No account?{" "}
        <Link
          href="/register"
          className="text-indigo-600 hover:underline font-medium"
        >
          Register
        </Link>
      </p>
    </div>
  );
}
