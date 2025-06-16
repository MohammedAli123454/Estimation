import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/config/db";
import { groupItems } from "@/app/config/schema";
import { eq } from "drizzle-orm";

export async function PATCH(req: NextRequest, { params }: { params: { itemId: string } }) {
  const id = Number(params.itemId);
  const { itemNo, description, unit, unitRateSar, groupId } = await req.json();
  if (!description?.trim() || !unit?.trim() || !unitRateSar)
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const [item] = await db
    .update(groupItems)
    .set({ itemNo, description, unit, unitRateSar, groupId })
    .where(eq(groupItems.id, id))
    .returning();
  return NextResponse.json(item);
}

export async function DELETE(req: NextRequest, { params }: { params: { itemId: string } }) {
  const id = Number(params.itemId);
  await db.delete(groupItems).where(eq(groupItems.id, id));
  return NextResponse.json({ success: true });
}
