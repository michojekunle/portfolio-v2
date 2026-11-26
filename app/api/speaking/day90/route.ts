import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireSpeakingAuth } from "@/lib/speaking/auth";
import { safeMediaOrExternalUrl } from "@/lib/speaking/url";

export const dynamic = "force-dynamic";

const Day90Schema = z.object({
  presentationOutline: z.string().max(20000).default(""),
  finalRecordingUrl: z.string().max(2000).default(""),
  q1OrganiseThoughts: z.string().max(5000).default(""),
  q2WithoutScript: z.string().max(5000).default(""),
  q3ExplainComplicated: z.string().max(5000).default(""),
  q4BetterStoryteller: z.string().max(5000).default(""),
  q5HabitsOvercome: z.string().max(5000).default(""),
  q6StillNeedsImprovement: z.string().max(5000).default(""),
  q7ConversationsOpportunities: z.string().max(5000).default(""),
  q8ContinueDoing: z.string().max(5000).default(""),
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

  const parsed = Day90Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const d = parsed.data;
  if (d.finalRecordingUrl.trim() && !safeMediaOrExternalUrl(d.finalRecordingUrl)) {
    return NextResponse.json(
      { error: "Invalid final recording URL. Use https://, http://, or an uploaded recording link." },
      { status: 400 }
    );
  }
  const cleanRecordingUrl = d.finalRecordingUrl.trim()
    ? safeMediaOrExternalUrl(d.finalRecordingUrl) ?? ""
    : "";

  const { data, error } = await supabase
    .from("speaking_day90_report")
    .upsert(
      {
        id: 1,
        presentation_outline: d.presentationOutline,
        final_recording_url: cleanRecordingUrl,
        q1_organise_thoughts: d.q1OrganiseThoughts,
        q2_without_script: d.q2WithoutScript,
        q3_explain_complicated: d.q3ExplainComplicated,
        q4_better_storyteller: d.q4BetterStoryteller,
        q5_habits_overcome: d.q5HabitsOvercome,
        q6_still_needs_improvement: d.q6StillNeedsImprovement,
        q7_conversations_opportunities: d.q7ConversationsOpportunities,
        q8_continue_doing: d.q8ContinueDoing,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, report: data });
}
