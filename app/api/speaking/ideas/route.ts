import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireSpeakingAuth } from "@/lib/speaking/auth";

export const dynamic = "force-dynamic";

const IdeaCategoryEnum = z.enum([
  "observation",
  "question",
  "reading",
  "disagreement",
  "technical_concept",
  "business_idea",
  "personal_experience",
  "conversation",
]);

const CreateIdeaSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(240),
  category: IdeaCategoryEnum,
  body: z.string().max(8000).optional().default(""),
  sourceRef: z.string().max(500).optional().default(""),
  tags: z.array(z.string().max(40)).max(12).optional().default([]),
  linkedDayNumber: z.number().int().min(1).max(90).nullable().optional().default(null),
  status: z.enum(["raw", "developing", "used"]).optional().default("raw"),
});

const PatchIdeaSchema = z.object({
  id: z.string().uuid(),
  title: z.string().trim().min(1).max(240).optional(),
  category: IdeaCategoryEnum.optional(),
  body: z.string().max(8000).optional(),
  sourceRef: z.string().max(500).optional(),
  tags: z.array(z.string().max(40)).max(12).optional(),
  linkedDayNumber: z.number().int().min(1).max(90).nullable().optional(),
  status: z.enum(["raw", "developing", "used"]).optional(),
});

export async function GET(): Promise<NextResponse> {
  const auth = await requireSpeakingAuth();
  if (auth.unauthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { supabase } = auth;
  const { data, error } = await supabase
    .from("speaking_idea_bank")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ideas: data ?? [] });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const auth = await requireSpeakingAuth();
  if (auth.unauthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { supabase } = auth;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = CreateIdeaSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const d = parsed.data;
  const { data, error } = await supabase
    .from("speaking_idea_bank")
    .insert({
      title: d.title,
      category: d.category,
      body: d.body,
      source_ref: d.sourceRef,
      tags: d.tags,
      linked_day_number: d.linkedDayNumber,
      status: d.status,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, idea: data }, { status: 201 });
}

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  const auth = await requireSpeakingAuth();
  if (auth.unauthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { supabase } = auth;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = PatchIdeaSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const { id, ...rest } = parsed.data;
  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (rest.title !== undefined) update.title = rest.title;
  if (rest.category !== undefined) update.category = rest.category;
  if (rest.body !== undefined) update.body = rest.body;
  if (rest.sourceRef !== undefined) update.source_ref = rest.sourceRef;
  if (rest.tags !== undefined) update.tags = rest.tags;
  if (rest.linkedDayNumber !== undefined) update.linked_day_number = rest.linkedDayNumber;
  if (rest.status !== undefined) update.status = rest.status;

  const { data, error } = await supabase
    .from("speaking_idea_bank")
    .update(update)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, idea: data });
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  const auth = await requireSpeakingAuth();
  if (auth.unauthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { supabase } = auth;

  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id parameter" }, { status: 400 });
  }

  const { error } = await supabase.from("speaking_idea_bank").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
