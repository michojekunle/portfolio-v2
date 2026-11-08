/**
 * POST /api/french/upload
 * Uploads an audio or video proof blob to Supabase Storage and returns its public URL.
 * Supports .webm (Chrome/Android), .mp4 (Safari/iOS), .ogg, and video/webm.
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
  "video/webm",
  "video/mp4",
  "video/quicktime",
]);

export async function POST(request: Request): Promise<Response> {
  try {
    const formData = await request.formData();
    const file = (formData.get("audio") || formData.get("video") || formData.get("file")) as File | null;

    if (!file) {
      return NextResponse.json({ error: "No media file provided" }, { status: 400 });
    }

    // Validate MIME type — allow standard audio & video formats across iOS, Android, and desktop
    const baseType = file.type.split(";")[0].trim();
    const isMedia = file.type.startsWith("audio/") || file.type.startsWith("video/") || ALLOWED_TYPES.has(baseType);
    if (!isMedia) {
      return NextResponse.json(
        { error: `Unsupported file type: ${file.type}` },
        { status: 415 }
      );
    }

    // Derive extension from file name sent by the client (recording.webm / .mp4 / .ogg)
    const ext = file.name.split(".").pop() ?? (file.type.startsWith("video/") ? "webm" : "webm");
    const fileName = `recording-${Date.now()}.${ext}`;

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY!;
    const supabase = createClient(process.env.SUPABASE_URL!, serviceKey);

    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from("french-audio")
      .upload(fileName, buffer, {
        contentType: baseType || "application/octet-stream",
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
