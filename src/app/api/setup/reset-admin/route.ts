import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { findAdmin, saveAdmin, usingPersistentDb } from "@/lib/db";
import { createSession, hashPassword, rateLimit } from "@/lib/security";

const schema = z
  .object({
    email: z.string().trim().email(),
    recoveryKey: z.string().min(1).max(500),
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

function secretsMatch(candidate: string, expected: string) {
  const left = Buffer.from(candidate);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "local";
  if (!(await rateLimit(`admin-recovery:${ip}`, 3, 3600))) {
    return NextResponse.json(
      { error: "Too many recovery attempts. Try again later." },
      { status: 429 },
    );
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Check the recovery details." },
      { status: 400 },
    );
  }

  const setupKey = process.env.ADMIN_SETUP_KEY;
  if (!setupKey) {
    return NextResponse.json(
      { error: "Admin recovery is not enabled. Add ADMIN_SETUP_KEY in Vercel and redeploy." },
      { status: 503 },
    );
  }
  if (!secretsMatch(parsed.data.recoveryKey, setupKey)) {
    return NextResponse.json({ error: "The recovery details are incorrect." }, { status: 401 });
  }
  if (process.env.NODE_ENV === "production" && !usingPersistentDb()) {
    return NextResponse.json(
      { error: "Firebase Admin is not configured in this deployment." },
      { status: 503 },
    );
  }

  const admin = await findAdmin(parsed.data.email.toLowerCase());
  if (!admin) {
    return NextResponse.json({ error: "The recovery details are incorrect." }, { status: 401 });
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
