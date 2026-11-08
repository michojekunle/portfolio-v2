import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { extractReceipt, hasMagicBytes } from "@/lib/flowise/receipt-extractor";

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

  const arrayBuffer = await file.arrayBuffer();

  // Validate actual file contents against declared MIME type (file.type is user-controlled)
  const header = new Uint8Array(arrayBuffer.slice(0, 8));
  if (!hasMagicBytes(header, file.type)) {
    return NextResponse.json({ error: "File contents do not match declared image type" }, { status: 400 });
  }

  try {
    const extracted = await extractReceipt(arrayBuffer, file.type);
    if (!extracted) {
      return NextResponse.json(
        { error: "AI could not extract valid transaction data from this image" },
        { status: 422 }
      );
    }
    return NextResponse.json({ extracted });
  } catch (err) {
    console.error("[flowise/scan] error:", err);
    return NextResponse.json({ error: "Failed to extract data from image" }, { status: 500 });
  }
}
