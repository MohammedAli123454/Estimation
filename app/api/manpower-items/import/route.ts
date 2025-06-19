import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/config/db"; // Adjust path as per your project
import { manpowerItems } from "@/app/config/schema";

export async function POST(request: NextRequest) {
  try {
    const items = await request.json();
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    // Prepare data for insert
    const values = items.map(item => ({
      code: item.Code,
      description: item.Description,
      category: item.Category,
      rate: item.Rate,
    }));

    // Bulk insert (drizzle supports array insert)
    await db.insert(manpowerItems).values(values);

    return NextResponse.json({ message: "Data imported successfully", count: values.length });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
