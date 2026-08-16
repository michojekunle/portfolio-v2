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
import { createClient } from "@/lib/supabase/server";

export async function GET(): Promise<Response> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ subscription: null, reminder_time: "22:00" });
    }

    const { data: sub } = await supabase
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
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const body = await request.json();
    const { endpoint, keys, reminder_time } = body as {
      endpoint: string;
      keys?: { p256dh: string; auth: string };
      reminder_time?: string;
    };

    if (!endpoint) {
      return NextResponse.json({ error: "Missing subscription endpoint" }, { status: 400 });
    }

    const updatePayload: {
      user_id: string | null;
      endpoint: string;
      p256dh?: string;
      auth?: string;
      reminder_time?: string;
    } = {
      user_id: user?.id ?? null,
      endpoint,
    };

    if (keys?.p256dh && keys?.auth) {
      updatePayload.p256dh = keys.p256dh;
      updatePayload.auth = keys.auth;
    }

    if (reminder_time) {
      updatePayload.reminder_time = reminder_time;
    }

    const { error } = await supabase.from("french_subscriptions").upsert(
      updatePayload,
      { onConflict: "endpoint" }
    );

    if (error) {
      console.error("[french/subscribe] DB error:", error);
      return NextResponse.json({ error: "Failed to save subscription" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, reminder_time: reminder_time ?? "22:00" });
  } catch (err) {
    console.error("[french/subscribe] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request): Promise<Response> {
  try {
    const supabase = await createClient();
    const { endpoint } = (await request.json()) as { endpoint: string };
    if (!endpoint) {
      return NextResponse.json({ error: "Missing endpoint" }, { status: 400 });
    }

    await supabase.from("french_subscriptions").delete().eq("endpoint", endpoint);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[french/subscribe] DELETE error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
