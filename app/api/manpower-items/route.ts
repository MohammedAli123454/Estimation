import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/config/db";
import { manpowerItems } from "@/app/config/schema";
import { asc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  // Get all items ordered by category then description
  const items = await db
    .select()
    .from(manpowerItems)
    .orderBy(asc(manpowerItems.category), asc(manpowerItems.description));

  // Group by category
  const grouped: Record<string, any[]> = {};
  for (const item of items) {
    if (!grouped[item.category]) grouped[item.category] = [];
    grouped[item.category].push(item);
  }

  return NextResponse.json(grouped);
}
