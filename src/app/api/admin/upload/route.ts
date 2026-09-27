import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

const allowed = ["image/jpeg", "image/png", "image/webp"];

export async function POST(req: NextRequest) {
  const file = (await req.formData()).get("file");
  if (
    !(file instanceof File) ||
    !allowed.includes(file.type) ||
    file.size > 5 * 1024 * 1024
  ) {
    return NextResponse.json(
      { error: "Use JPG, PNG or WebP up to 5MB." },
      { status: 400 },
    );
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  const storeId = process.env.BLOB_CELEB_STORE_ID;
  if (!token && !storeId) {
    return NextResponse.json(
      { error: "Public media storage is not configured." },
      { status: 503 },
    );
  }

  const auth = token ? { token } : { storeId: storeId! };
  const blob = await put(
    `public-media/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`,
    file,
    { access: "public", addRandomSuffix: false, ...auth },
  );
  return NextResponse.json({ url: blob.url });
}
