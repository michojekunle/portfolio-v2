import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { requireSpeakingAuth } from "@/lib/speaking/auth";

export const dynamic = "force-dynamic";

const BUCKET = "speaking-recordings";
const MAX_BYTES = 50 * 1024 * 1024; // 50MB
const MIME_TO_EXT: Record<string, string> = {
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
  "audio/mpeg": "mp3",
  "audio/mp4": "m4a",
  "audio/webm": "webm",
  "audio/wav": "wav",
  "audio/ogg": "ogg",
};
const ALLOWED_MIME_TYPES = Object.keys(MIME_TO_EXT);
const SAFE_OBJECT_PATH_RE =
  /^day-(?:[1-9]|[1-8][0-9]|90|general)\/(?:first|second|take)-\d+\.(?:mp4|webm|mov|mp3|m4a|wav|ogg)$/;

/**
 * Uploads an audio/video take to a PRIVATE Supabase Storage bucket and returns
 * an authenticated proxy URL (/api/speaking/upload?path=...) so recordings are
 * never exposed publicly by default.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const auth = await requireSpeakingAuth();
  if (auth.unauthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: "Missing Supabase credentials" }, { status: 500 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const dayRaw = String(formData.get("dayNumber") || "general");
    const takeRaw = String(formData.get("take") || "take");

    if (!file || file.size <= 0) {
      return NextResponse.json({ error: "No valid recording provided" }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "Recording exceeds 50MB limit" }, { status: 400 });
    }
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Unsupported media type. Use MP4, WebM, MOV, MP3, M4A, or WAV." },
        { status: 400 }
      );
    }

    const parsedDay = Number(dayRaw);
    const safeDay =
      Number.isInteger(parsedDay) && parsedDay >= 1 && parsedDay <= 90
        ? String(parsedDay)
        : "general";
    const safeTake =
      takeRaw === "first" || takeRaw === "second" ? takeRaw : "take";
    const safeExt = MIME_TO_EXT[file.type] ?? "webm";
    const objectPath = `day-${safeDay}/${safeTake}-${Date.now()}.${safeExt}`;

    const admin = createSupabaseAdmin(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    });

    const { data: buckets } = await admin.storage.listBuckets();
    if (!buckets?.some((b) => b.name === BUCKET)) {
      await admin.storage.createBucket(BUCKET, {
        public: false,
        allowedMimeTypes: ALLOWED_MIME_TYPES,
      });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const { error: uploadError } = await admin.storage
      .from(BUCKET)
      .upload(objectPath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      throw uploadError;
    }

    const privateProxyUrl = `/api/speaking/upload?path=${encodeURIComponent(objectPath)}`;
    return NextResponse.json({ ok: true, url: privateProxyUrl, path: objectPath });
  } catch (err) {
    console.error("[speaking/upload] POST error:", err);
    return NextResponse.json({ error: "Failed to upload recording" }, { status: 500 });
  }
}

/**
 * Generates a short-lived signed URL and redirects — strictly gated to the owner session
 * and strictly restricted to valid speaking-recordings object keys.
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const auth = await requireSpeakingAuth();
  if (auth.unauthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const path = req.nextUrl.searchParams.get("path");
  if (!path || !SAFE_OBJECT_PATH_RE.test(path)) {
    return NextResponse.json({ error: "Invalid recording path" }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: "Missing Supabase credentials" }, { status: 500 });
  }

  const admin = createSupabaseAdmin(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
  });

  const { data, error } = await admin.storage.from(BUCKET).createSignedUrl(path, 300);
  if (error || !data?.signedUrl) {
    return NextResponse.json({ error: "Recording not found" }, { status: 404 });
  }

  return NextResponse.redirect(data.signedUrl);
}
