import { z } from "zod";

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
