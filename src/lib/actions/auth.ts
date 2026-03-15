"use server";

import bcrypt from "bcryptjs";
import { createHash, randomBytes } from "crypto";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { serverEnv } from "@/lib/env/server";
import { createSession, deleteSession } from "@/lib/session";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  type RegisterSchema,
  type LoginSchema,
  type ForgotPasswordSchema,
  type ResetPasswordSchema,
} from "@/lib/schemas";

type ActionResult = { success: boolean; error?: string };

export async function registerAction(
  data: RegisterSchema
): Promise<ActionResult> {
  const result = registerSchema.safeParse(data);
  if (!result.success) {
    return { success: false, error: result.error.errors[0]?.message };
  }

  const { email, password } = result.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return {
      success: false,
      error: "An account with this email already exists.",
    };
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({ data: { email, passwordHash } });

  await createSession({ userId: user.id, email: user.email });
  return { success: true };
}

export async function loginAction(data: LoginSchema): Promise<ActionResult> {
  const result = loginSchema.safeParse(data);
  if (!result.success) {
    return { success: false, error: result.error.errors[0]?.message };
  }

  const { email, password } = result.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash) {
    return { success: false, error: "Invalid email or password." };
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return { success: false, error: "Invalid email or password." };
  }

  await createSession({ userId: user.id, email: user.email });
  return { success: true };
}

export async function logoutAction(): Promise<void> {
  await deleteSession();
}

export async function forgotPasswordAction(
  data: ForgotPasswordSchema
): Promise<ActionResult> {
  const result = forgotPasswordSchema.safeParse(data);
  if (!result.success) {
    return { success: false, error: result.error.errors[0]?.message };
  }

  const { email } = result.data;

  const user = await prisma.user.findUnique({ where: { email } });
  // Always return success to prevent email enumeration
  if (!user) {
    return { success: true };
  }

  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = createHash("sha256").update(rawToken).digest("hex");
  const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.user.update({
    where: { email },
    data: { resetToken: tokenHash, resetTokenExpiry: expiry },
  });

  const resetUrl = `${serverEnv.BASE_URL}/reset-password/${rawToken}`;

  try {
    const resend = new Resend(serverEnv.RESEND_API_KEY);
    await resend.emails.send({
      from: serverEnv.EMAIL_FROM,
      to: email,
      subject: "Reset your password",
      html: `
        <p>You requested a password reset.</p>
        <p>Click the link below to reset your password. This link expires in 1 hour.</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>If you did not request this, you can safely ignore this email.</p>
      `,
    });
  } catch {
    return {
      success: false,
      error: "Failed to send reset email. Please try again.",
    };
  }

  return { success: true };
}

export async function resetPasswordAction(
  token: string,
  data: ResetPasswordSchema
): Promise<ActionResult> {
  const result = resetPasswordSchema.safeParse(data);
  if (!result.success) {
    return { success: false, error: result.error.errors[0]?.message };
  }

  const tokenHash = createHash("sha256").update(token).digest("hex");

  const user = await prisma.user.findFirst({
    where: {
      resetToken: tokenHash,
      resetTokenExpiry: { gt: new Date() },
    },
  });

  if (!user) {
    return { success: false, error: "Invalid or expired reset link." };
  }

  const passwordHash = await bcrypt.hash(result.data.password, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash, resetToken: null, resetTokenExpiry: null },
  });

  return { success: true };
}
