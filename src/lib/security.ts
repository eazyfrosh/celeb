import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secret = () => { if (!process.env.SESSION_SECRET && process.env.NODE_ENV === "production") throw new Error("SESSION_SECRET is required"); return new TextEncoder().encode(process.env.SESSION_SECRET || "development-secret-change-me-32-bytes"); };
export function hashPassword(password: string, salt = randomBytes(16).toString("hex")) { return `${salt}:${scryptSync(password, salt, 64).toString("hex")}`; }
export function verifyPassword(password: string, stored: string) { const [salt, key] = stored.split(":"); if (!salt || !key) return false; return timingSafeEqual(Buffer.from(key, "hex"), scryptSync(password, salt, 64)); }
export async function createSession(email: string, role = "admin") { return new SignJWT({ email, role }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("12h").sign(secret()); }
export async function getAdmin() { const token = (await cookies()).get("velaire_admin")?.value; if (!token) return null; try { const { payload } = await jwtVerify(token, secret()); return payload.role === "admin" ? String(payload.email) : null; } catch { return null; } }
export function reference(prefix: string) { return `${prefix}-${new Date().getFullYear()}-${randomBytes(3).toString("hex").toUpperCase()}`; }
export function fingerprint(value: string) { return createHash("sha256").update(value.trim().toLowerCase()).digest("hex"); }

const localLimits = new Map<string, { count: number; reset: number }>();
export async function rateLimit(key: string, limit = 8, windowSeconds = 60) {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL, token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (redisUrl && token) {
    const bucket = Math.floor(Date.now() / (windowSeconds * 1000));
    const res = await fetch(`${redisUrl}/pipeline`, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify([["INCR", `rl:${key}:${bucket}`], ["EXPIRE", `rl:${key}:${bucket}`, windowSeconds]]) });
    const data = await res.json(); return Number(data?.[0]?.result || 0) <= limit;
  }
  const now = Date.now(), current = localLimits.get(key); if (!current || current.reset < now) { localLimits.set(key, { count: 1, reset: now + windowSeconds * 1000 }); return true; }
  current.count++; return current.count <= limit;
}
