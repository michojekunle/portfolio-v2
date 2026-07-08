import { NextRequest, NextResponse } from "next/server";
import { requireJournalAuth } from "@/lib/journal/auth";
import { checkRateLimit } from "@/lib/rate-limit";

/** GET /api/journal/chats?limit=100 — recent Vela Guide conversation history, oldest first */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth = await requireJournalAuth();
  if (auth.unauthorized) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { supabase, user } = auth;

  const rl = await checkRateLimit(`journal:chats:get:${user.id}`, { limit: 60, windowMs: 60_000 });
  if (!rl.allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const limitParam = Number(request.nextUrl.searchParams.get("limit") ?? "100");
  const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 300) : 100;

  // Fetch newest-first (so LIMIT keeps the most recent turns), then reverse
  // to chronological order for display.
  const { data, error } = await supabase
    .from("jo_chats")
    .select("id, role, content, executed, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[journal/chats] GET error:", error);
    return NextResponse.json({ error: "Failed to fetch chat history" }, { status: 500 });
  }

  return NextResponse.json({ messages: (data ?? []).reverse() });
}
