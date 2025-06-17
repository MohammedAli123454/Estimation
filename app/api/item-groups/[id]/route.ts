// app/api/group-items/[itemId]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/config/db";
import { groupItems } from "@/app/config/schema";
import { eq } from "drizzle-orm";

// PATCH: Update a group item
export async function PATCH(request: NextRequest) {
  try {
    // Robust extraction of itemId from the URL
    const segments = request.nextUrl.pathname.split("/");
    const itemId = parseInt(segments.at(-1)!, 10);

    if (isNaN(itemId)) {
      return NextResponse.json({ error: "Invalid item ID" }, { status: 400 });
    }

    const { itemNo, description, unit, unitRateSar, groupId } = await request.json();

    if (!description?.trim() || !unit?.trim() || !unitRateSar) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const [item] = await db
      .update(groupItems)
      .set({ itemNo, description, unit, unitRateSar, groupId })
      .where(eq(groupItems.id, itemId))
      .returning();

    return NextResponse.json(item);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Server Error" },
      { status: 500 }
    );
  }
}

// DELETE: Remove a group item
export async function DELETE(request: NextRequest) {
  try {
    // Robust extraction of itemId from the URL
    const segments = request.nextUrl.pathname.split("/");
    const itemId = parseInt(segments.at(-1)!, 10);

    if (isNaN(itemId)) {
      return NextResponse.json({ error: "Invalid item ID" }, { status: 400 });
    }

    await db.delete(groupItems).where(eq(groupItems.id, itemId));
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Server Error" },
      { status: 500 }
    );
  }
}
