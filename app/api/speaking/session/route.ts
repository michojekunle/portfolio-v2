import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireSpeakingAuth } from "@/lib/speaking/auth";
import { safeMediaOrExternalUrl } from "@/lib/speaking/url";

export const dynamic = "force-dynamic";

const SlideSchema = z.object({
  title: z.string().max(160),
  content: z.string().max(600),
  layout: z.enum(["hook", "default", "quote", "split", "cta"]),
});

const SessionPatchSchema = z.object({
  dayNumber: z.number().int().min(1).max(90),
  status: z.enum(["not_started", "in_progress", "completed"]).optional(),
  prepCompleted: z.boolean().optional(),
  firstTakeCompleted: z.boolean().optional(),
  firstRecordingUrl: z.string().max(2000).optional(),
  firstRecordingDuration: z.string().max(40).optional(),
  firstRecordingMinutes: z.number().min(0).max(180).optional(),
  reviewCompleted: z.boolean().optional(),
  secondTakeCompleted: z.boolean().optional(),
  secondRecordingUrl: z.string().max(2000).optional(),
  secondRecordingDuration: z.string().max(40).optional(),
  finalRecordingUrl: z.string().max(2000).optional(),
  preparationNotes: z.string().max(15000).optional(),
  premPoint: z.string().max(4000).optional(),
  premReason: z.string().max(4000).optional(),
  premExample: z.string().max(4000).optional(),
  premMeaning: z.string().max(4000).optional(),
  selectedAudience: z
    .enum(["developers", "entrepreneurs", "students", "business_owners", "general", "leaders", "mixed"])
    .optional(),
  selectedFormat: z
    .enum([
      "conversational_talk",
      "mini_keynote",
      "educational_video",
      "opinion_piece",
      "personal_story",
      "spontaneous_response",
    ])
    .optional(),
  dailyLearningSummary: z.string().max(8000).optional(),
  linkedBuildingIds: z.array(z.string().max(120)).max(20).optional(),
  linkedBookIds: z.array(z.string().max(120)).max(20).optional(),
  linkedLearningIds: z.array(z.string().max(120)).max(20).optional(),
  linkedProjectIds: z.array(z.string().max(120)).max(20).optional(),
  carouselSlides: z.array(SlideSchema).max(12).optional(),
  practiceOnly: z.boolean().optional(),
  isPublic: z.boolean().optional(),
  audienceInteractionsCount: z.number().int().min(0).max(100000).optional(),
  reflectionWhatWorked: z.string().max(5000).optional(),
  reflectionWeakest: z.string().max(5000).optional(),
  reflectionLostTrain: z.string().max(5000).optional(),
  reflectionImproveTomorrow: z.string().max(5000).optional(),
  reflectionWhatLearned: z.string().max(5000).optional(),
  reflectionNotes: z.string().max(10000).optional(),
  completedAt: z.string().nullable().optional(),
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

  const parsed = SessionPatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const d = parsed.data;
  const nowIso = new Date().toISOString();

  const payload: Record<string, unknown> = {
    day_number: d.dayNumber,
    updated_at: nowIso,
  };

  if (d.status !== undefined) {
    payload.status = d.status;
    if (d.status === "completed") {
      payload.completed_at = d.completedAt ?? nowIso;
    } else if (d.completedAt === null) {
      payload.completed_at = null;
    }
  }
  if (d.prepCompleted !== undefined) payload.prep_completed = d.prepCompleted;
  if (d.firstTakeCompleted !== undefined) payload.first_take_completed = d.firstTakeCompleted;
  const sanitizeRecordingUrl = (raw: string | undefined): string | undefined => {
    if (raw === undefined) return undefined;
    if (!raw.trim()) return "";
    return safeMediaOrExternalUrl(raw) ?? undefined;
  };

  for (const field of ["firstRecordingUrl", "secondRecordingUrl", "finalRecordingUrl"] as const) {
    const val = d[field];
    if (val && val.trim() && !safeMediaOrExternalUrl(val)) {
      return NextResponse.json(
        { error: `Invalid recording URL in ${field}. Use https://, http://, or a private upload link.` },
        { status: 400 }
      );
    }
  }

  if (d.firstRecordingUrl !== undefined) payload.first_recording_url = sanitizeRecordingUrl(d.firstRecordingUrl) ?? "";
  if (d.firstRecordingDuration !== undefined) payload.first_recording_duration = d.firstRecordingDuration;
  if (d.firstRecordingMinutes !== undefined) payload.first_recording_minutes = d.firstRecordingMinutes;
  if (d.reviewCompleted !== undefined) payload.review_completed = d.reviewCompleted;
  if (d.secondTakeCompleted !== undefined) payload.second_take_completed = d.secondTakeCompleted;
  if (d.secondRecordingUrl !== undefined) payload.second_recording_url = sanitizeRecordingUrl(d.secondRecordingUrl) ?? "";
  if (d.secondRecordingDuration !== undefined) payload.second_recording_duration = d.secondRecordingDuration;
  if (d.finalRecordingUrl !== undefined) payload.final_recording_url = sanitizeRecordingUrl(d.finalRecordingUrl) ?? "";
  if (d.preparationNotes !== undefined) payload.preparation_notes = d.preparationNotes;
  if (d.premPoint !== undefined) payload.prem_point = d.premPoint;
  if (d.premReason !== undefined) payload.prem_reason = d.premReason;
  if (d.premExample !== undefined) payload.prem_example = d.premExample;
  if (d.premMeaning !== undefined) payload.prem_meaning = d.premMeaning;
  if (d.selectedAudience !== undefined) payload.selected_audience = d.selectedAudience;
  if (d.selectedFormat !== undefined) payload.selected_format = d.selectedFormat;
  if (d.dailyLearningSummary !== undefined) payload.daily_learning_summary = d.dailyLearningSummary;
  if (d.linkedBuildingIds !== undefined) payload.linked_building_ids = d.linkedBuildingIds;
  if (d.linkedBookIds !== undefined) payload.linked_book_ids = d.linkedBookIds;
  if (d.linkedLearningIds !== undefined) payload.linked_learning_ids = d.linkedLearningIds;
  if (d.linkedProjectIds !== undefined) payload.linked_project_ids = d.linkedProjectIds;
  if (d.carouselSlides !== undefined) payload.carousel_slides = d.carouselSlides;
  if (d.practiceOnly !== undefined) payload.practice_only = d.practiceOnly;
  if (d.isPublic !== undefined) payload.is_public = d.isPublic;
  if (d.audienceInteractionsCount !== undefined) payload.audience_interactions_count = d.audienceInteractionsCount;
  if (d.reflectionWhatWorked !== undefined) payload.reflection_what_worked = d.reflectionWhatWorked;
  if (d.reflectionWeakest !== undefined) payload.reflection_weakest = d.reflectionWeakest;
  if (d.reflectionLostTrain !== undefined) payload.reflection_lost_train = d.reflectionLostTrain;
  if (d.reflectionImproveTomorrow !== undefined) payload.reflection_improve_tomorrow = d.reflectionImproveTomorrow;
  if (d.reflectionWhatLearned !== undefined) payload.reflection_what_learned = d.reflectionWhatLearned;
  if (d.reflectionNotes !== undefined) payload.reflection_notes = d.reflectionNotes;

  const { data, error } = await supabase
    .from("speaking_sessions")
    .upsert(payload, { onConflict: "day_number" })
    .select()
    .single();

  if (error) {
    console.error("[speaking/session] PUT error:", error);
    return NextResponse.json({ error: "Failed to save session" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, row: data });
}
