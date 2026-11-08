import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { z } from "zod";
import { randomBytes } from "crypto";

const PlatformSchema = z.object({ platform: z.enum(["telegram", "whatsapp"]) });

const CODE_TTL_MS = 15 * 60 * 1000; // 15 minutes

/** GET — current link status for both platforms */
export async function GET(): Promise<NextResponse> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("fw_bot_links")
    .select("platform, chat_id, link_code, code_expires_at, linked_at")
    .eq("user_id", user.id);

  if (error) {
    console.error("[flowise/bot-link] GET error:", error);
    return NextResponse.json({ error: "Failed to fetch bot links" }, { status: 500 });
  }

  return NextResponse.json({ links: data ?? [] });
}

/** POST — generate (or regenerate) a one-time link code for a platform */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rl = await checkRateLimit(`flowise:bot-link:${user.id}`, { limit: 10, windowMs: 60_000 });
  if (!rl.allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = PlatformSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  // 8 hex chars — short enough to type into a chat, random enough for a
  // 15-minute one-time code.
  const code = randomBytes(4).toString("hex");
  const expiresAt = new Date(Date.now() + CODE_TTL_MS).toISOString();

  const { error } = await supabase.from("fw_bot_links").upsert(
    {
      user_id: user.id,
      platform: parsed.data.platform,
      link_code: code,
      code_expires_at: expiresAt,
      // Regenerating a code intentionally resets any previous link
      chat_id: null,
      linked_at: null,
    },
    { onConflict: "user_id,platform" }
  );

  if (error) {
    console.error("[flowise/bot-link] POST error:", error);
    return NextResponse.json({ error: "Failed to create link code" }, { status: 500 });
  }

  return NextResponse.json({ code, expires_at: expiresAt });
}

/** DELETE — unlink a platform */
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = PlatformSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const { error } = await supabase
    .from("fw_bot_links")
    .delete()
    .eq("user_id", user.id)
    .eq("platform", parsed.data.platform);

  if (error) {
    console.error("[flowise/bot-link] DELETE error:", error);
    return NextResponse.json({ error: "Failed to unlink" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
