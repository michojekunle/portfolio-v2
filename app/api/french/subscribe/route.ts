/**
 * GET /api/french/subscribe
 * Fetches current user's push subscription settings & reminder time.
 *
 * POST /api/french/subscribe
 * Saves/updates browser's Web Push subscription & user's custom daily reminder time.
 *
 * DELETE /api/french/subscribe
 * Removes push subscription endpoint.
 */
import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

function getAdminSupabase() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);
}

export async function GET(): Promise<Response> {
  try {
    const serverClient = await createServerClient();
    const { data: { user } } = await serverClient.auth.getUser();

    if (!user) {
      return NextResponse.json({ subscription: null, reminder_time: "22:00" });
    }

    const adminDb = getAdminSupabase();
    const { data: sub } = await adminDb
      .from("french_subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle();

    return NextResponse.json({
      subscription: sub,
      reminder_time: sub?.reminder_time ?? "22:00",
    });
  } catch (err) {
    console.error("[french/subscribe] GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const serverClient = await createServerClient();
    const { data: { user } } = await serverClient.auth.getUser();

    const body = await request.json();
    const { endpoint, keys, reminder_time } = body as {
      endpoint?: string;
      keys?: { p256dh: string; auth: string };
      reminder_time?: string;
    };

    const targetEndpoint = endpoint || (user ? `user-${user.id}` : null);

    if (!targetEndpoint) {
      return NextResponse.json({ error: "Missing subscription endpoint or user session" }, { status: 400 });
    }

    const adminDb = getAdminSupabase();

    // 1. Fetch existing subscription for this endpoint or user to preserve p256dh/auth keys
    const { data: existing } = await adminDb
      .from("french_subscriptions")
      .select("*")
      .or(`endpoint.eq.${targetEndpoint}${user ? `,user_id.eq.${user.id}` : ""}`)
      .limit(1)
      .maybeSingle();

    const p256dh = keys?.p256dh || existing?.p256dh || "default_p256dh";
    const auth = keys?.auth || existing?.auth || "default_auth";
    const activeReminderTime = reminder_time || existing?.reminder_time || "22:00";

    const updatePayload = {
      user_id: user?.id ?? existing?.user_id ?? null,
      endpoint: existing?.endpoint || targetEndpoint,
      p256dh,
      auth,
      reminder_time: activeReminderTime,
    };

    const { error } = await adminDb.from("french_subscriptions").upsert(
      updatePayload,
      { onConflict: "endpoint" }
    );

    if (error) {
      console.error("[french/subscribe] DB error:", error);
      return NextResponse.json({ error: "Failed to save push subscription to database." }, { status: 500 });
    }

    return NextResponse.json({ ok: true, reminder_time: activeReminderTime });
  } catch (err) {
    console.error("[french/subscribe] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request): Promise<Response> {
  try {
    const serverClient = await createServerClient();
    const { data: { user } } = await serverClient.auth.getUser();

    const { endpoint } = (await request.json()) as { endpoint?: string };
    const adminDb = getAdminSupabase();

    if (endpoint) {
      await adminDb.from("french_subscriptions").delete().eq("endpoint", endpoint);
    } else if (user) {
      await adminDb.from("french_subscriptions").delete().eq("user_id", user.id);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[french/subscribe] DELETE error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
