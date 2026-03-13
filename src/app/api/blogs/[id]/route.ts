import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { rateLimit, getClientIp } from "@/lib/utils/rate-limit";
import { HTTP_STATUS } from "@/lib/constants/http";
import { UUID_REGEX } from "@/lib/constants/global";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const ip = getClientIp(request);
  const rl = rateLimit(`DELETE:/api/blogs:${ip}`, 30, 60_000);
  if (!rl.success) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: HTTP_STATUS.TOO_MANY_REQUESTS }
    );
  }

  try {
    const { id } = await params;

    if (!UUID_REGEX.test(id)) {
      return NextResponse.json(
        { error: "Invalid ID format" },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    const existing = await prisma.blog.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Blog not found" },
        { status: HTTP_STATUS.NOT_FOUND }
      );
    }

    await prisma.blog.delete({ where: { id } });
    revalidatePath("/");
    return new NextResponse(null, { status: HTTP_STATUS.NO_CONTENT });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete blog" },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}
