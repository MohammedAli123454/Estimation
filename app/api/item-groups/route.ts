//app/api/item-groups/route.ts
import { db } from "@/app/config/db";
import { itemGroups } from "@/app/config/schema";
import { NextRequest, NextResponse } from "next/server";

// GET all item groups
export async function GET() {
  const groups = await db.select().from(itemGroups).orderBy(itemGroups.id);
  return NextResponse.json(groups);
}

// Add a new group
export async function POST(req: NextRequest) {
  const { name } = await req.json();
  if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });

  try {
    const [created] = await db.insert(itemGroups).values({ name }).returning();
    return NextResponse.json(created);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
