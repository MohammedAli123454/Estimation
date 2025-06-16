import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/config/db";
import { groupItems } from "@/app/config/schema";
import { eq, asc} from "drizzle-orm";


export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const groupId = searchParams.get("groupId");
  if (!groupId) return NextResponse.json([], { status: 200 });
  const items = await db
    .select()
    .from(groupItems)
    .where(eq(groupItems.groupId, Number(groupId)))
    .orderBy(asc(groupItems.id));
  return NextResponse.json(items);
}



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
