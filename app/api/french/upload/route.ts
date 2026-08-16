/**
 * POST /api/french/upload
 * Uploads an audio blob to Supabase Storage and returns its public URL.
 * Supports .webm (Chrome/Android), .mp4 (Safari/iOS), and .ogg (Firefox).
 * The /french client calls this before submitting the challenge log.
 */
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const ALLOWED_TYPES = new Set([
  "audio/webm",
  "audio/webm;codecs=opus",
  "audio/mp4",
  "audio/ogg",
  "audio/ogg;codecs=opus",
]);

export async function POST(request: Request): Promise<Response> {
  try {
    const formData = await request.formData();
    const file = formData.get("audio") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    // Validate MIME type — allow standard audio formats across iOS, Android, and desktop
    const baseType = file.type.split(";")[0].trim();
    const isAudio = file.type.startsWith("audio/") || ALLOWED_TYPES.has(baseType);
    if (!isAudio) {
      return NextResponse.json(
        { error: `Unsupported file type: ${file.type}` },
        { status: 415 }
      );
    }

    // Derive extension from file name sent by the client (recording.webm / .mp4 / .ogg)
    const ext = file.name.split(".").pop() ?? "webm";
    const fileName = `recording-${Date.now()}.${ext}`;

    const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);

    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from("french-audio")
      .upload(fileName, buffer, {
        contentType: baseType,
        upsert: false,
      });

    if (uploadError) {
      console.error("[french/upload] Storage error:", uploadError);
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }

    const { data: urlData } = supabase.storage
      .from("french-audio")
      .getPublicUrl(fileName);

    return NextResponse.json({ url: urlData.publicUrl });
  } catch (err) {
    console.error("[french/upload] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
