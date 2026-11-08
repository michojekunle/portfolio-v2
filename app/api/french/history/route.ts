/**
 * GET /api/french/history
 * Returns all past challenge completion logs for the authenticated user,
 * including proof_text, proof_url (audio/video recording link), and timestamp.
 */
import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";

export async function GET(): Promise<Response> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ logs: [] });
    }

    const { data: logs, error } = await supabase
      .from("french_logs")
      .select("*, french_challenges(type, prompt_text, example_text, challenge_date)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[french/history] Error fetching logs:", error);
      return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
    }

    return NextResponse.json({ logs: logs ?? [] });
  } catch (err) {
    console.error("[french/history] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
