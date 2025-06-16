import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/config/db";
import { itemGroups } from "@/app/config/schema";
import { asc } from "drizzle-orm"; // <-- Add this line

export async function GET() {
  const groups = await db.select().from(itemGroups).orderBy(asc(itemGroups.name)); // or just itemGroups.name
  return NextResponse.json(groups);
}

export async function POST(req: NextRequest) {
  const { name } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 400 });
  const [group] = await db
    .insert(itemGroups)
    .values({ name })
    .returning();
  return NextResponse.json(group);
}
