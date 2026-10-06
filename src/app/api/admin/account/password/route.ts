import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { findAdmin, saveAdmin } from "@/lib/db";
import {
  createSession,
  getAdmin,
  hashPassword,
  rateLimit,
  verifyPassword,
} from "@/lib/security";

const schema = z
  .object({
    currentPassword: z.string().min(1).max(200),
    newPassword: z
      .string()
      .min(12, "Use at least 12 characters.")
      .max(200)
      .regex(/[A-Z]/, "Include an uppercase letter.")
      .regex(/[a-z]/, "Include a lowercase letter.")
      .regex(/[0-9]/, "Include a number."),
    confirmPassword: z.string().min(1).max(200),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    message: "The new passwords do not match.",
    path: ["confirmPassword"],
  });

export async function POST(req: NextRequest) {
  const email = await getAdmin();
  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "local";
  if (!(await rateLimit(`password-change:${email}:${ip}`, 5, 900))) {
    return NextResponse.json(
      { error: "Too many attempts. Try again later." },
      { status: 429 },
    );
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Check the password details." },
      { status: 400 },
    );
  }

  const admin = await findAdmin(email.toLowerCase());
  if (!admin || !verifyPassword(parsed.data.currentPassword, admin.passwordHash)) {
    return NextResponse.json(
      { error: "The current password is incorrect." },
      { status: 401 },
    );
  }
  if (verifyPassword(parsed.data.newPassword, admin.passwordHash)) {
    return NextResponse.json(
      { error: "Choose a password different from your current password." },
      { status: 400 },
    );
  }

  await saveAdmin(admin.email, hashPassword(parsed.data.newPassword));
  const response = NextResponse.json({ ok: true });
  response.cookies.set("velaire_admin", await createSession(admin.email), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 43_200,
  });
  return response;
}
