import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { SYSTEM_CATEGORIES } from "@/lib/flowise/types";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("image") as File | null;
  if (!file) return NextResponse.json({ error: "No image provided" }, { status: 400 });

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "Image must be under 5MB" }, { status: 400 });
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: "Image must be JPEG, PNG, WebP, or GIF" }, { status: 400 });
  }

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: "AI scan not configured" }, { status: 503 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");

  const catList = SYSTEM_CATEGORIES.map((c) => `${c.id}: ${c.name}`).join(", ");

  const prompt = `You are a Nigerian finance assistant. Extract transaction details from this bank alert, receipt, transfer confirmation, or mobile money screenshot.

Return ONLY valid JSON with these fields (null if not found):
{
  "amount": number (positive for credit/income, negative for debit/expense),
  "description": string (merchant or transaction description, max 100 chars),
  "date": string (YYYY-MM-DD format, null if unclear),
  "category_id": string (one of these IDs: ${catList}, or null if unclear),
  "is_income": boolean
}

No markdown, no explanation — just the JSON object.`;

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: file.type as "image/jpeg" | "image/png" | "image/webp" | "image/gif",
          data: base64,
        },
      },
      prompt,
    ]);

    const raw = result.response.text().trim()
      .replace(/^```json?\s*/i, "")
      .replace(/```\s*$/, "")
      .trim();

    const extracted = JSON.parse(raw) as {
      amount: number | null;
      description: string | null;
      date: string | null;
      category_id: string | null;
      is_income: boolean | null;
    };

    // Validate category_id
    const validIds = new Set<string>(SYSTEM_CATEGORIES.map((c) => c.id));
    if (extracted.category_id && !validIds.has(extracted.category_id)) {
      extracted.category_id = null;
    }

    // Ensure sign is correct
    if (extracted.amount !== null) {
      const absAmt = Math.abs(extracted.amount);
      extracted.amount = extracted.is_income ? absAmt : -absAmt;
    }

    return NextResponse.json({ extracted });
  } catch (err) {
    console.error("[flowise/scan] error:", err);
    return NextResponse.json({ error: "Failed to extract data from image" }, { status: 500 });
  }
}
