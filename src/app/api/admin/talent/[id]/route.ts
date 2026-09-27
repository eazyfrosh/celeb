import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { listTalents, removeTalent, saveTalent } from "@/lib/db";
import { talentSchema, talentValidationError } from "@/lib/talent-validation";

function refreshPublicTalentPages() {
  revalidatePath("/");
  revalidatePath("/talent");
  revalidatePath("/book");
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const parsed = talentSchema.safeParse({ ...(await req.json()), id });
  if (!parsed.success) {
    return NextResponse.json(
      { error: talentValidationError(parsed.error), details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const duplicate = (await listTalents(true)).some(
    (talent) => talent.slug === parsed.data.slug && talent.id !== id,
  );
  if (duplicate) {
    return NextResponse.json(
      { error: "Another profile already uses this slug." },
      { status: 409 },
    );
  }

  const talent = await saveTalent({ ...parsed.data, id });
  refreshPublicTalentPages();
  revalidatePath(`/talent/${talent.slug}`);
  return NextResponse.json(talent);
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  await removeTalent(id);
  refreshPublicTalentPages();
  return NextResponse.json({ ok: true });
}
