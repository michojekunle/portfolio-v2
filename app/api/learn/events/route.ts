/**
 * POST /api/learn/events — first-party product events (no cookies, no third party).
 * Body: { name, language?, props? }. Valid events always get a quick 204:
 * analytics must never slow down or break the app, so storage failures are
 * logged here, not surfaced to the learner.
 */
import { NextResponse } from "next/server";
import { EventSchema } from "@/features/learn/domain/events";
import { adminClient } from "@/features/learn/server/admin";
import { clientIp, rateLimited, readJson } from "@/features/learn/server/context";
import { recordEvent } from "@/features/learn/server/events";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<Response> {
  const limited = await rateLimited(`learn:events:${clientIp(request)}`, 60);
  if (limited) return limited;

  const parsed = EventSchema.safeParse(await readJson(request));
  if (!parsed.success) return NextResponse.json({ error: "Invalid event." }, { status: 400 });

  const admin = adminClient();
  if (!admin) return new NextResponse(null, { status: 204 });

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    await recordEvent(admin, parsed.data, user?.id ?? null);
  } catch (error) {
    console.error("[learn/events] could not record event", error instanceof Error ? error.message : error);
  }
  return new NextResponse(null, { status: 204 });
}
