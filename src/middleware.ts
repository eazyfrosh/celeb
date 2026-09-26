import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (path === "/admin/login" || path === "/api/admin/login") return NextResponse.next();
  const token = request.cookies.get("velaire_admin")?.value;
  try {
    if (!token) throw new Error("missing");
    if (!process.env.SESSION_SECRET && process.env.NODE_ENV === "production") throw new Error("SESSION_SECRET missing");
    const secret = new TextEncoder().encode(process.env.SESSION_SECRET || "development-secret-change-me-32-bytes");
    const { payload } = await jwtVerify(token, secret);
    if (payload.role !== "admin") throw new Error("forbidden");
    return NextResponse.next();
  } catch {
    if (path.startsWith("/api/admin")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.redirect(new URL(`/admin/login?next=${encodeURIComponent(path)}`, request.url));
  }
}
export const config = { matcher: ["/admin/:path*", "/api/admin/:path*"] };
