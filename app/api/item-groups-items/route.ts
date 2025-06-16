// app/api/item-groups-items/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/config/db";
import { groupItems } from "@/app/config/schema";

// (Optional) Handle GET all items (across all groups)
export async function GET() {
  const items = await db.select().from(groupItems);
  return NextResponse.json(items);
}

// Handle POST to add a new item (for any group)
export async function POST(req: NextRequest) {
  const { itemNo, description, unit, unitRateSar, groupId } = await req.json();
  if (!description?.trim() || !unit?.trim() || !unitRateSar || !groupId)
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const [item] = await db
    .insert(groupItems)
    .values({ itemNo, description, unit, unitRateSar, groupId })
    .returning();
  return NextResponse.json(item);
}
