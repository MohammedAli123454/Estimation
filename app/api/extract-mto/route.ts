import { NextRequest, NextResponse } from "next/server";
import pdf from "pdf-parse";
import OpenAI from "openai";

export const runtime = "nodejs";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const POST = async (req: NextRequest) => {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Invalid file type. Please upload a PDF file." },
        { status: 400 }
      );
    }

    // Parse PDF with pdf-parse
    const buffer = Buffer.from(await file.arrayBuffer());
    const data = await pdf(buffer);
    const tableText = data.text;

    // --- Extract MOC# ---
    // Matches: MOC# 12345, MOC #: 12345, MOC#-12345, etc.
    const mocMatch = tableText.match(/MOC#\s*[:\-]?\s*([A-Za-z0-9\-\/]+)/i);
    const moc = mocMatch ? mocMatch[1].trim() : "";

    // Improved OpenAI prompt
    const prompt = `
Extract all rows from the following PDF table text as a JSON array.

Each object must have the keys: "Sl No", "Item Description", "Qty", "UOM", and "Remarks".

- "Qty" must be only the numeric value (integer or decimal) for the quantity. Do not include any unit or letters. 
- "UOM" must be only the unit of measurement, which can be a single word or multiple words (e.g., "M", "Rolls Each", "Meter Box", "Nos", "Square Meter", "Linear Meter", etc.).
- If the quantity and UOM appear together (e.g., "3000M", "400 M", "2 Rolls Each", "5.5 Meter Box"), extract the numeric portion as "Qty" and the full text portion after the number as "UOM".
- There may be any range of values for Qty, including large numbers or decimal values.
- UOM can be any sequence of words after the quantity (including spaces).
- If Qty or UOM is missing, use an empty string "".
- If multiple lines exist between 'Sl No' rows, treat all those lines as part of "Item Description", except for clearly marked fields such as "Qty", "UOM", or "Remarks".
- Do NOT combine Qty and UOM in a single field. Do NOT include units in the Qty field. Do NOT add any extra explanation.
- Ignore all text outside the table and do NOT include any explanation—just return the JSON array.

Table Text:
${tableText}
`.trim();


    // OpenAI call
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0,
    });

    // Parse model output as JSON array
    let jsonString = response.choices[0]?.message?.content?.trim() ?? "[]";
    const match = jsonString.match(/\[[\s\S]*\]/);
    if (match) jsonString = match[0];

    let table = [];
    try {
      table = JSON.parse(jsonString);
    } catch (e) {
      return NextResponse.json(
        {
          error: "Failed to parse table from model response.",
          modelOutput: jsonString,
        },
        { status: 500 }
      );
    }

    // --- Send back table and moc ---
    return NextResponse.json({ table, moc });
  } catch (e: any) {
    console.error("Table extraction error:", e);
    return NextResponse.json(
      {
        error: "Table extraction failed.",
        details: e.message || e.toString(),
      },
      { status: 500 }
    );
  }
};

export const GET = async () => {
  return NextResponse.json({
    message: "API is working",
    openai: !!process.env.OPENAI_API_KEY,
  });
};
