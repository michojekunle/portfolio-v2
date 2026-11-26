import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireSpeakingAuth } from "@/lib/speaking/auth";
import { computeAssessmentAverage } from "@/lib/speaking/analytics";

export const dynamic = "force-dynamic";

const AssessmentSchema = z.object({
  dayNumber: z.number().int().min(1).max(90),
  clarity: z.number().int().min(1).max(5),
  structure: z.number().int().min(1).max(5),
  confidence: z.number().int().min(1).max(5),
  voice: z.number().int().min(1).max(5),
  storytelling: z.number().int().min(1).max(5),
  connection: z.number().int().min(1).max(5),
  originality: z.number().int().min(1).max(5),
  notes: z.string().max(4000).optional().default(""),
});

export async function PUT(request: NextRequest): Promise<NextResponse> {
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

  const parsed = AssessmentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const d = parsed.data;
  const averageScore = computeAssessmentAverage({
    clarity: d.clarity,
    structure: d.structure,
    confidence: d.confidence,
    voice: d.voice,
    storytelling: d.storytelling,
    connection: d.connection,
    originality: d.originality,
  });

  const { data, error } = await supabase
    .from("speaking_assessments")
    .upsert(
      {
        day_number: d.dayNumber,
        clarity: d.clarity,
        structure: d.structure,
        confidence: d.confidence,
        voice: d.voice,
        storytelling: d.storytelling,
        connection: d.connection,
        originality: d.originality,
        average_score: averageScore,
        notes: d.notes,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "day_number" }
    )
    .select()
    .single();

  if (error) {
    console.error("[speaking/assessment] PUT error:", error);
    return NextResponse.json({ error: error.message || "Failed to save assessment" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, assessment: data, averageScore });
}
