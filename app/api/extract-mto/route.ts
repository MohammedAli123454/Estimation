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
      return NextResponse.json({ error: "Invalid file type. Please upload a PDF file." }, { status: 400 });
    }

    // Parse PDF with pdf-parse
    const buffer = Buffer.from(await file.arrayBuffer());
    const data = await pdf(buffer);
    const tableText = data.text;

    // Compose OpenAI prompt
    const prompt = `
    Extract all rows from the following PDF table text as a JSON array.
    Each object must have: "Sl No", "Item Description", "Qty", "UOM", "Remarks".
    - "Qty" is always numeric only.
    - "UOM" is the unit of measurement, and can be one or more words (like "Rolls Each" or "M").
    - If you see a pattern like "2 Rolls Each" or "3 Sets", extract "2" as Qty and "Rolls Each" as UOM.
    - Do NOT place "2Rolls Each" or similar patterns under "Remarks".
    - If Qty or UOM is missing, use an empty string "".
    If there are multiple lines between the 'Sl No' of a row and the next 'Sl No', treat all those lines as part of 'Item Description', except for clearly marked fields such as "Qty", "UOM", or "Remarks".
    Ignore all text outside the table. Do NOT include any explanation—just return the JSON array.
    
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
      return NextResponse.json({
        error: "Failed to parse table from model response.",
        modelOutput: jsonString,
      }, { status: 500 });
    }

    return NextResponse.json({ table });
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
  return NextResponse.json({ message: "API is working", openai: !!process.env.OPENAI_API_KEY });
};
