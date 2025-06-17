import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/config/db";
import { groupItems } from "@/app/config/schema";
import { eq } from "drizzle-orm";

// PATCH: Update a group item
export async function PATCH(req: NextRequest) {
  // Extract itemId from the path
  const segments = req.nextUrl.pathname.split("/");
  const id = parseInt(segments.at(-1)!, 10);

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

// DELETE: Remove a group item
export async function DELETE(req: NextRequest) {
  // Extract itemId from the path
  const segments = req.nextUrl.pathname.split("/");
  const id = parseInt(segments.at(-1)!, 10);

  await db.delete(groupItems).where(eq(groupItems.id, id));
  return NextResponse.json({ success: true });
}
