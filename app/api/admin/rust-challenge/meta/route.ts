import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminAuth } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

export interface Quote {
  quote: string;
  author: string;
}

export interface RustChallengeMeta {
  why_started: string | null;
  quotes: Quote[];
}

const QuoteSchema = z.object({
  quote: z.string().min(1).max(500),
  author: z.string().max(200),
});

const UpdateSchema = z.object({
  why_started: z.string().max(4000).optional().nullable(),
  quotes: z.array(QuoteSchema).max(50).optional(),
});

/** GET /api/admin/rust-challenge/meta — the "why I started" note and quotes list. */
export async function GET(): Promise<NextResponse> {
  const auth = await requireAdminAuth();
  if (auth.unauthorized) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { supabase } = auth;

  const { data, error } = await supabase
    .from("rust_challenge_meta")
    .select("why_started, quotes")
    .eq("id", 1)
    .maybeSingle();

  if (error) {
    console.error("[rust-challenge/meta] GET error:", error);
    return NextResponse.json({ error: "Failed to fetch meta" }, { status: 500 });
  }

  return NextResponse.json({
    why_started: data?.why_started ?? null,
    quotes: (data?.quotes ?? []) as Quote[],
  } satisfies RustChallengeMeta);
}

/** PATCH /api/admin/rust-challenge/meta — update why_started and/or the full quotes list. */
export async function PATCH(request: NextRequest): Promise<NextResponse> {
  const auth = await requireAdminAuth();
  if (auth.unauthorized) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { supabase } = auth;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }
  const { why_started, quotes } = parsed.data;
  if (why_started === undefined && quotes === undefined) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (why_started !== undefined) update.why_started = why_started;
  if (quotes !== undefined) update.quotes = quotes;

  const { data, error } = await supabase
    .from("rust_challenge_meta")
    .upsert({ id: 1, ...update }, { onConflict: "id" })
    .select("why_started, quotes")
    .single();

  if (error) {
    console.error("[rust-challenge/meta] PATCH error:", error);
    return NextResponse.json({ error: "Failed to update meta" }, { status: 500 });
  }

  return NextResponse.json({
    why_started: data?.why_started ?? null,
    quotes: (data?.quotes ?? []) as Quote[],
  } satisfies RustChallengeMeta);
}
