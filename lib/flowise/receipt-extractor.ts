import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import { SYSTEM_CATEGORIES } from "./types";

export interface ExtractedReceipt {
  amount: number | null;
  description: string | null;
  date: string | null;
  category_id: string | null;
  is_income: boolean | null;
}

const MAGIC_BYTES: Record<string, number[][]> = {
  "image/jpeg": [[0xff, 0xd8, 0xff]],
  "image/png": [[0x89, 0x50, 0x4e, 0x47]],
  "image/gif": [[0x47, 0x49, 0x46, 0x38]],
  "image/webp": [[0x52, 0x49, 0x46, 0x46]], // RIFF header — 4 bytes suffice
};

export function hasMagicBytes(buf: Uint8Array, mimeType: string): boolean {
  const signatures = MAGIC_BYTES[mimeType];
  if (!signatures) return false;
  return signatures.some((sig) => sig.every((byte, i) => buf[i] === byte));
}

const ExtractedSchema = z.object({
  amount: z
    .union([
      z.number(),
      z.string().transform((v) => {
        const n = parseFloat(v.replace(/[^0-9.-]/g, ""));
        return isNaN(n) ? null : n;
      }),
      z.null(),
    ])
    .nullable()
    .default(null),
  description: z.string().max(100).nullable().default(null),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().default(null).catch(null),
  category_id: z.string().nullable().default(null),
  is_income: z.union([z.boolean(), z.null()]).nullable().default(null),
});

/**
 * Runs Gemini vision over a receipt/bank-alert image and returns normalized
 * transaction fields. Shared by the in-app scanner and the chat-bot webhooks.
 * Throws on model/config failure; returns null when the model output can't be
 * validated into usable fields.
 */
export async function extractReceipt(
  imageBuffer: ArrayBuffer,
  mimeType: string
): Promise<ExtractedReceipt | null> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");

  const base64 = Buffer.from(imageBuffer).toString("base64");
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

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const result = await model.generateContent([
    {
      inlineData: {
        mimeType: mimeType as "image/jpeg" | "image/png" | "image/webp" | "image/gif",
        data: base64,
      },
    },
    prompt,
  ]);

  const raw = result.response
    .text()
    .trim()
    .replace(/^```json?\s*/i, "")
    .replace(/```\s*$/, "")
    .trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  const parseResult = ExtractedSchema.safeParse(parsed);
  if (!parseResult.success) {
    console.error("[flowise/receipt-extractor] schema validation failed:", parseResult.error.errors);
    return null;
  }
  const extracted = parseResult.data;

  // Only allow known category ids
  const validIds = new Set<string>(SYSTEM_CATEGORIES.map((c) => c.id));
  if (extracted.category_id && !validIds.has(extracted.category_id)) {
    extracted.category_id = null;
  }

  // Normalize sign. When is_income is null (model uncertain), infer from the
  // raw amount's sign; default to expense if truly ambiguous.
  if (extracted.amount !== null) {
    const absAmt = Math.abs(extracted.amount);
    const isIncome = extracted.is_income !== null ? extracted.is_income : extracted.amount > 0;
    extracted.amount = isIncome ? absAmt : -absAmt;
    extracted.is_income = isIncome;
  }

  return extracted;
}
