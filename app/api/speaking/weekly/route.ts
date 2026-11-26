import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireSpeakingAuth } from "@/lib/speaking/auth";
import { WEEKLY_CHALLENGES } from "@/lib/speaking/methodology";

export const dynamic = "force-dynamic";

const ChallengeSchema = z.object({
  kind: z.literal("challenge"),
  weekNumber: z.number().int().min(1).max(13),
  completed: z.boolean(),
  reflection: z.string().max(4000).optional().default(""),
});

const ReviewSchema = z.object({
  kind: z.literal("review"),
  weekNumber: z.number().int().min(1).max(13),
  completedDays: z.number().int().min(0).max(9).optional().default(0),
  averageScore: z.number().min(0).max(5).nullable().optional().default(null),
  strongestRecording: z.string().max(2000).default(""),
  weakestRecording: z.string().max(2000).default(""),
  speakingHabit: z.string().max(2000).default(""),
  whatImproved: z.string().max(2000).default(""),
  stillStruggling: z.string().max(2000).default(""),
  mostInterestingIdea: z.string().max(2000).default(""),
  connectedWithSomeone: z.string().max(2000).default(""),
  nextWeekFocus: z.string().max(2000).default(""),
  audienceInteractions: z.number().int().min(0).max(100000).default(0),
  weeklyArticleTitle: z.string().max(300).default(""),
  weeklyArticleBody: z.string().max(20000).default(""),
  weeklyArticleSlug: z.string().max(200).default(""),
  reflection: z.string().max(8000).default(""),
  submit: z.boolean().optional().default(true),
});

const WeeklyPutSchema = z.discriminatedUnion("kind", [ChallengeSchema, ReviewSchema]);

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

  const parsed = WeeklyPutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const nowIso = new Date().toISOString();

  if (parsed.data.kind === "challenge") {
    const { weekNumber, completed, reflection } = parsed.data;
    const meta = WEEKLY_CHALLENGES.find((w) => w.weekNumber === weekNumber);
    const { data, error } = await supabase
      .from("speaking_weekly_challenges")
      .upsert(
        {
          week_number: weekNumber,
          title: meta?.challengeTitle ?? `Week ${weekNumber} Challenge`,
          description: meta?.challengeDescription ?? "",
          completed,
          completed_at: completed ? nowIso : null,
          reflection,
        },
        { onConflict: "week_number" }
      )
      .select()
      .single();

    if (error) {
      console.error("[speaking/weekly] challenge error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true, challenge: data });
  }

  const d = parsed.data;
  const { data, error } = await supabase
    .from("speaking_weekly_reviews")
    .upsert(
      {
        week_number: d.weekNumber,
        completed_days: d.completedDays,
        average_score: d.averageScore,
        strongest_recording: d.strongestRecording,
        weakest_recording: d.weakestRecording,
        speaking_habit: d.speakingHabit,
        what_improved: d.whatImproved,
        still_struggling: d.stillStruggling,
        most_interesting_idea: d.mostInterestingIdea,
        connected_someone: d.connectedWithSomeone,
        next_week_focus: d.nextWeekFocus,
        audience_interactions: d.audienceInteractions,
        weekly_article_title: d.weeklyArticleTitle,
        weekly_article_body: d.weeklyArticleBody,
        weekly_article_slug: d.weeklyArticleSlug,
        reflection: d.reflection,
        submitted_at: d.submit ? nowIso : null,
        updated_at: nowIso,
      },
      { onConflict: "week_number" }
    )
    .select()
    .single();

  if (error) {
    console.error("[speaking/weekly] review error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, review: data });
}
