import { get } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { getAdmin } from "@/lib/security";

export async function GET(req: NextRequest) {
  if (!(await getAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = req.nextUrl.searchParams.get("url");
  const token = process.env.BLOB_PRIVATE_READ_WRITE_TOKEN;
  const storeId = process.env.BLOB_PRIVATE_STORE_ID;
  if (!url || (!token && !storeId)) {
    return NextResponse.json({ error: "Proof unavailable" }, { status: 404 });
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return NextResponse.json({ error: "Invalid proof URL" }, { status: 400 });
  }
  if (
    parsed.protocol !== "https:" ||
    !parsed.hostname.endsWith(".private.blob.vercel-storage.com")
  ) {
    return NextResponse.json({ error: "Untrusted proof URL" }, { status: 400 });
  }

  const auth = token ? { token } : { storeId: storeId! };
  const result = await get(url, {
    access: "private",
    ...auth,
    ifNoneMatch: req.headers.get("if-none-match") || undefined,
  });
  if (!result) return new NextResponse("Not found", { status: 404 });
  if (result.statusCode === 304) {
    return new NextResponse(null, {
      status: 304,
      headers: { ETag: result.blob.etag, "Cache-Control": "private, no-cache" },
    });
  }
  return new NextResponse(result.stream, {
    headers: {
      "Content-Type": result.blob.contentType || "application/octet-stream",
      "Content-Disposition": "inline",
      "X-Content-Type-Options": "nosniff",
      ETag: result.blob.etag,
      "Cache-Control": "private, no-cache",
    },
  });
}
