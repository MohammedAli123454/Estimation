//app/api/item-groups/[id]/route.ts
import { db } from "@/app/config/db";
import { itemGroups } from "@/app/config/schema";
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

// PATCH (update group)
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const { name } = await req.json();

  if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });

  try {
    const [updated] = await db
      .update(itemGroups)
      .set({ name })
      .where(eq(itemGroups.id, id))
      .returning();
    return NextResponse.json(updated);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

// DELETE (remove group)
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  await db.delete(itemGroups).where(eq(itemGroups.id, id));
  return NextResponse.json({ success: true });
}
