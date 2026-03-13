"use server";

import { blogSchema, BlogSchema } from "@/lib/schemas";
import { blogService } from "@/lib/services/blog.service";

export async function createBlogAction(
  data: BlogSchema
): Promise<{ success: boolean; error?: string }> {
  const result = blogSchema.safeParse(data);
  if (!result.success) {
    return { success: false, error: result.error.message };
  }

  try {
    await blogService.create(result.data);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create blog",
    };
  }
}
