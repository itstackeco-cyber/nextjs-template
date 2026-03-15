import { z } from "zod";

export const registerSchema = z
  .object({
    email: z.string().email({ message: "Invalid email address." }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters." })
      .max(100, { message: "Password must be at most 100 characters." }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type RegisterSchema = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

export type LoginSchema = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
});

export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters." })
      .max(100, { message: "Password must be at most 100 characters." }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;

export const blogSchema = z.object({
  author: z
    .string()
    .min(2, { message: "Author must be at least 2 characters." })
    .max(100, { message: "Author must be at most 100 characters." })
    .trim(),
  title: z
    .string()
    .min(2, { message: "Title must be at least 2 characters." })
    .max(200, { message: "Title must be at most 200 characters." })
    .trim(),
  content: z
    .string()
    .min(10, { message: "Content must be at least 10 characters." })
    .max(10_000, { message: "Content must be at most 10 000 characters." })
    .trim(),
});

export type BlogSchema = z.infer<typeof blogSchema>;
