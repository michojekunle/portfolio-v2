import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { SYSTEM_CATEGORIES } from "@/lib/flowise/types";
import { checkRateLimit } from "@/lib/rate-limit";
import { z } from "zod";

const MAGIC_BYTES: Record<string, number[][]> = {
  "image/jpeg": [[0xff, 0xd8, 0xff]],
  "image/png":  [[0x89, 0x50, 0x4e, 0x47]],
  "image/gif":  [[0x47, 0x49, 0x46, 0x38]],
  "image/webp": [[0x52, 0x49, 0x46, 0x46]], // RIFF header — 4 bytes suffice
};

function hasMagicBytes(buf: Uint8Array, mimeType: string): boolean {
  const signatures = MAGIC_BYTES[mimeType];
  if (!signatures) return false;
  return signatures.some((sig) => sig.every((byte, i) => buf[i] === byte));
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rl = await checkRateLimit(`flowise:scan:${user.id}`, { limit: 20, windowMs: 60_000 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests. Please wait a moment." }, { status: 429 });
  }

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

  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "AI scan not configured" }, { status: 503 });
  }

  const arrayBuffer = await file.arrayBuffer();

  // Validate actual file contents against declared MIME type (file.type is user-controlled)
  const header = new Uint8Array(arrayBuffer.slice(0, 8));
  if (!hasMagicBytes(header, file.type)) {
    return NextResponse.json({ error: "File contents do not match declared image type" }, { status: 400 });
  }

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
    const genAI = new GoogleGenerativeAI(apiKey);
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

    const ExtractedSchema = z.object({
      amount: z.union([z.number(), z.string().transform((v) => {
        const n = parseFloat(v.replace(/[^0-9.-]/g, ""));
        return isNaN(n) ? null : n;
      }), z.null()]).nullable().default(null),
      description: z.string().max(100).nullable().default(null),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().default(null).catch(null),
      category_id: z.string().nullable().default(null),
      is_income: z.union([z.boolean(), z.null()]).nullable().default(null),
    });

    const parseResult = ExtractedSchema.safeParse(JSON.parse(raw));
    if (!parseResult.success) {
      console.error("[flowise/scan] LLM response failed schema validation:", parseResult.error.errors);
      return NextResponse.json({ error: "AI could not extract valid transaction data from this image" }, { status: 422 });
    }
    const extracted = parseResult.data;

    // Validate category_id
    const validIds = new Set<string>(SYSTEM_CATEGORIES.map((c) => c.id));
    if (extracted.category_id && !validIds.has(extracted.category_id)) {
      extracted.category_id = null;
    }

    // Ensure sign is correct. When is_income is null (AI uncertain), infer
    // from the sign of the raw amount; default to expense if truly ambiguous.
    if (extracted.amount !== null) {
      const absAmt = Math.abs(extracted.amount);
      const isIncome = extracted.is_income !== null
        ? extracted.is_income
        : extracted.amount > 0;
      extracted.amount = isIncome ? absAmt : -absAmt;
      extracted.is_income = isIncome;
    }

    return NextResponse.json({ extracted });
  } catch (err) {
    console.error("[flowise/scan] error:", err);
    return NextResponse.json({ error: "Failed to extract data from image" }, { status: 500 });
  }
}
