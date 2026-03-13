import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { blogSchema } from "@/lib/schemas";
import { revalidatePath } from "next/cache";
import { rateLimit, getClientIp } from "@/lib/utils/rate-limit";
import { HTTP_STATUS } from "@/lib/constants/http";

export async function GET(request: Request) {
  const ip = getClientIp(request);
  const rl = rateLimit(`GET:/api/blogs:${ip}`, 120, 60_000);
  if (!rl.success) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: HTTP_STATUS.TOO_MANY_REQUESTS }
    );
  }

  try {
    const blogs = await prisma.blog.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(blogs);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch blogs" },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rl = rateLimit(`POST:/api/blogs:${ip}`, 20, 60_000);
  if (!rl.success) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: HTTP_STATUS.TOO_MANY_REQUESTS }
    );
  }

  try {
    const body: unknown = await request.json();
    const result = blogSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.format() },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }
    const blog = await prisma.blog.create({ data: result.data });
    revalidatePath("/");
    return NextResponse.json(blog, { status: HTTP_STATUS.CREATED });
  } catch {
    return NextResponse.json(
      { error: "Failed to create blog" },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}
