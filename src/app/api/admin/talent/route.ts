import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { listTalents, saveTalent } from "@/lib/db";
import { talentSchema, talentValidationError } from "@/lib/talent-validation";

export async function GET() {
  return NextResponse.json(await listTalents(true));
}

export async function POST(req: NextRequest) {
  const parsed = talentSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: talentValidationError(parsed.error), details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const duplicate = (await listTalents(true)).some(
    (talent) => talent.slug === parsed.data.slug,
  );
  if (duplicate) {
    return NextResponse.json(
      { error: "Another profile already uses this slug." },
      { status: 409 },
    );
  }

  const talent = await saveTalent({ ...parsed.data, id: crypto.randomUUID() });
  revalidatePath("/");
  revalidatePath("/talent");
  revalidatePath("/book");
  return NextResponse.json(talent, { status: 201 });
}
