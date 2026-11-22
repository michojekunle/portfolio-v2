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

/** Browsers always send Origin on a cross-site POST; refuse one that isn't this site. */
function isCrossOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).host !== (request.headers.get("host") ?? new URL(request.url).host);
  } catch {
    return true;
  }
}

/** Guests have no auth cookie, so skip the Supabase round trip for them (most events). */
const hasAuthCookie = (request: Request): boolean => /(?:^|;\s*)sb-[^=]*-auth-token/.test(request.headers.get("cookie") ?? "");

export async function POST(request: Request): Promise<Response> {
  if (isCrossOrigin(request)) return NextResponse.json({ error: "Not allowed." }, { status: 403 });
  const limited = await rateLimited(`learn:events:${clientIp(request)}`, 60);
  if (limited) return limited;

  const parsed = EventSchema.safeParse(await readJson(request));
  if (!parsed.success) return NextResponse.json({ error: "Invalid event." }, { status: 400 });

  // Tests and previews set this so they never write into real analytics.
  const admin = process.env.LEARN_EVENTS_DISABLED === "1" ? null : adminClient();
  if (!admin) return new NextResponse(null, { status: 204 });

  try {
    let userId: string | null = null;
    if (hasAuthCookie(request)) {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      userId = user?.id ?? null;
    }
    await recordEvent(admin, parsed.data, userId);
  } catch (error) {
    console.error("[learn/events] could not record event", error instanceof Error ? error.message : error);
  }
  return new NextResponse(null, { status: 204 });
}
