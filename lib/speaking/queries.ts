import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { requireSpeakingAuth } from "@/lib/speaking/auth";
import { createClient } from "@/lib/supabase/server";
import { CURRICULUM_DAYS, getCurriculumDay } from "./curriculum";
import { createEmptySession } from "./defaults";
import { getProgrammeTimelineState } from "./dates";
import { WEEKLY_CHALLENGES } from "./methodology";
import type {
  AudienceTypeId,
  CarouselSlideDraft,
  DailySession,
  Day90ReportRecord,
  IdeaBankItem,
  IdeaCategory,
  IdeaStatus,
  PlatformId,
  PortfolioContextItem,
  PublicPublishedEntry,
  PublicationRecord,
  SpeakingAssessment,
  SpeakingFormatId,
  SpeakingWorkspaceData,
  WeeklyChallengeRecord,
  WeeklyReviewRecord,
} from "./types";

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
  if (!url || !key) return null;
  return createSupabaseAdmin(url, key, {
    auth: { persistSession: false },
  });
}

function isMissingTableError(err: { code?: string; message?: string } | null): boolean {
  if (!err) return false;
  return (
    err.code === "42P01" ||
    err.code === "PGRST205" ||
    Boolean(err.message?.includes("does not exist")) ||
    Boolean(err.message?.includes("Could not find the table"))
  );
}

export { createEmptySession };

function mapSessionRow(row: Record<string, unknown>): DailySession {
  const dayNumber = Number(row.day_number);
  const base = createEmptySession(dayNumber);
  return {
    ...base,
    id: String(row.id ?? ""),
    dayNumber,
    status: (row.status as DailySession["status"]) || "not_started",
    prepCompleted: Boolean(row.prep_completed),
    firstTakeCompleted: Boolean(row.first_take_completed),
    firstRecordingUrl: String(row.first_recording_url ?? ""),
    firstRecordingDuration: String(row.first_recording_duration ?? ""),
    firstRecordingMinutes: Number(row.first_recording_minutes ?? 0),
    reviewCompleted: Boolean(row.review_completed),
    secondTakeCompleted: Boolean(row.second_take_completed),
    secondRecordingUrl: String(row.second_recording_url ?? ""),
    secondRecordingDuration: String(row.second_recording_duration ?? ""),
    finalRecordingUrl: String(row.final_recording_url ?? ""),
    preparationNotes: String(row.preparation_notes ?? ""),
    premPoint: String(row.prem_point ?? ""),
    premReason: String(row.prem_reason ?? ""),
    premExample: String(row.prem_example ?? ""),
    premMeaning: String(row.prem_meaning ?? ""),
    selectedAudience: (row.selected_audience as AudienceTypeId) || base.selectedAudience,
    selectedFormat: (row.selected_format as SpeakingFormatId) || base.selectedFormat,
    dailyLearningSummary: String(row.daily_learning_summary ?? ""),
    linkedBuildingIds: Array.isArray(row.linked_building_ids) ? (row.linked_building_ids as string[]) : [],
    linkedBookIds: Array.isArray(row.linked_book_ids) ? (row.linked_book_ids as string[]) : [],
    linkedLearningIds: Array.isArray(row.linked_learning_ids) ? (row.linked_learning_ids as string[]) : [],
    linkedProjectIds: Array.isArray(row.linked_project_ids) ? (row.linked_project_ids as string[]) : [],
    carouselSlides: Array.isArray(row.carousel_slides) ? (row.carousel_slides as CarouselSlideDraft[]) : [],
    practiceOnly: Boolean(row.practice_only),
    isPublic: Boolean(row.is_public),
    audienceInteractionsCount: Number(row.audience_interactions_count ?? 0),
    reflectionWhatWorked: String(row.reflection_what_worked ?? ""),
    reflectionWeakest: String(row.reflection_weakest ?? ""),
    reflectionLostTrain: String(row.reflection_lost_train ?? ""),
    reflectionImproveTomorrow: String(row.reflection_improve_tomorrow ?? ""),
    reflectionWhatLearned: String(row.reflection_what_learned ?? ""),
    reflectionNotes: String(row.reflection_notes ?? ""),
    completedAt: (row.completed_at as string | null) ?? null,
    updatedAt: (row.updated_at as string | null) ?? null,
  };
}

function mapAssessmentRow(row: Record<string, unknown>): SpeakingAssessment {
  return {
    id: String(row.id ?? ""),
    dayNumber: Number(row.day_number),
    clarity: Number(row.clarity),
    structure: Number(row.structure),
    confidence: Number(row.confidence),
    voice: Number(row.voice),
    storytelling: Number(row.storytelling),
    connection: Number(row.connection),
    originality: Number(row.originality),
    averageScore: Number(row.average_score),
    notes: String(row.notes ?? ""),
    updatedAt: (row.updated_at as string | null) ?? null,
  };
}

function mapPublicationRow(row: Record<string, unknown>): PublicationRecord {
  return {
    id: String(row.id ?? ""),
    dayNumber: Number(row.day_number),
    platform: row.platform as PlatformId,
    published: Boolean(row.published),
    url: String(row.url ?? ""),
    caption: String(row.caption ?? ""),
    publishedAt: (row.published_at as string | null) ?? null,
    notes: String(row.notes ?? ""),
    videoCategory: typeof row.video_category === "string" && row.video_category.trim()
      ? row.video_category
      : "Speaking Challenge",
    syncToVideos: row.sync_to_videos !== undefined ? Boolean(row.sync_to_videos) : true,
    siteVideoId: typeof row.site_video_id === "string" ? row.site_video_id : null,
  };
}

function mapWeeklyReviewRow(row: Record<string, unknown>): WeeklyReviewRecord {
  return {
    id: String(row.id ?? ""),
    weekNumber: Number(row.week_number),
    strongestRecording: String(row.strongest_recording ?? ""),
    weakestRecording: String(row.weakest_recording ?? ""),
    speakingHabit: String(row.speaking_habit ?? ""),
    whatImproved: String(row.what_improved ?? ""),
    stillStruggling: String(row.still_struggling ?? ""),
    mostInterestingIdea: String(row.most_interesting_idea ?? ""),
    connectedWithSomeone: String(row.connected_someone ?? ""),
    nextWeekFocus: String(row.next_week_focus ?? ""),
    audienceInteractions: Number(row.audience_interactions ?? 0),
    weeklyArticleTitle: String(row.weekly_article_title ?? ""),
    weeklyArticleBody: String(row.weekly_article_body ?? ""),
    weeklyArticleSlug: String(row.weekly_article_slug ?? ""),
    reflection: String(row.reflection ?? ""),
    submittedAt: (row.submitted_at as string | null) ?? null,
    updatedAt: (row.updated_at as string | null) ?? null,
  };
}

function mapIdeaRow(row: Record<string, unknown>): IdeaBankItem {
  return {
    id: String(row.id ?? ""),
    title: String(row.title ?? ""),
    category: row.category as IdeaCategory,
    body: String(row.body ?? ""),
    sourceRef: String(row.source_ref ?? ""),
    tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
    linkedDayNumber: row.linked_day_number != null ? Number(row.linked_day_number) : null,
    status: (row.status as IdeaStatus) || "raw",
    createdAt: String(row.created_at ?? ""),
    updatedAt: String(row.updated_at ?? ""),
  };
}

function mapDay90Row(row: Record<string, unknown>): Day90ReportRecord {
  return {
    presentationOutline: String(row.presentation_outline ?? ""),
    finalRecordingUrl: String(row.final_recording_url ?? ""),
    q1OrganiseThoughts: String(row.q1_organise_thoughts ?? ""),
    q2WithoutScript: String(row.q2_without_script ?? ""),
    q3ExplainComplicated: String(row.q3_explain_complicated ?? ""),
    q4BetterStoryteller: String(row.q4_better_storyteller ?? ""),
    q5HabitsOvercome: String(row.q5_habits_overcome ?? ""),
    q6StillNeedsImprovement: String(row.q6_still_needs_improvement ?? ""),
    q7ConversationsOpportunities: String(row.q7_conversations_opportunities ?? ""),
    q8ContinueDoing: String(row.q8_continue_doing ?? ""),
    updatedAt: (row.updated_at as string | null) ?? null,
  };
}

export async function getPortfolioContextItems(): Promise<PortfolioContextItem[]> {
  try {
    const supabase = await createClient();
    const [buildingRes, booksRes, learningRes, projectsRes] = await Promise.all([
      supabase.from("building_projects").select("id, name, status, github_url").order("sort_order"),
      supabase.from("books").select("id, title, author, status").in("status", ["reading", "completed"]).order("sort_order"),
      supabase.from("learning_items").select("id, name, progress").order("sort_order"),
      supabase.from("projects").select("id, title, category, live_url, github_url").eq("is_hidden", false).order("sort_order"),
    ]);

    const items: PortfolioContextItem[] = [];
    for (const b of buildingRes.data ?? []) {
      items.push({
        id: `building:${b.id}`,
        kind: "building",
        title: b.name,
        subtitle: b.status || "In Progress",
        url: b.github_url || undefined,
      });
    }
    for (const bk of booksRes.data ?? []) {
      items.push({
        id: `book:${bk.id}`,
        kind: "book",
        title: bk.title,
        subtitle: `${bk.author} (${bk.status})`,
        url: `/reading/${bk.id}`,
      });
    }
    for (const l of learningRes.data ?? []) {
      items.push({
        id: `learning:${l.id}`,
        kind: "learning",
        title: l.name,
        subtitle: `${l.progress ?? 0}% progress`,
      });
    }
    for (const p of projectsRes.data ?? []) {
      items.push({
        id: `project:${p.id}`,
        kind: "project",
        title: p.title,
        subtitle: p.category || "Project",
        url: p.live_url || p.github_url || undefined,
      });
    }
    return items;
  } catch {
    return [];
  }
}

/**
 * Fetches ONLY explicitly public sessions + their published social URLs.
 * Never returns private notes, private recordings, scores, or Idea Bank entries.
 */
async function getPublicPublishedEntries(): Promise<PublicPublishedEntry[]> {
  const admin = getServiceClient();
  if (!admin) return [];

  try {
    const [pubSessionsRes, pubsRes] = await Promise.all([
      admin
        .from("speaking_sessions")
        .select("day_number, daily_learning_summary")
        .eq("is_public", true)
        .eq("status", "completed"),
      admin
        .from("speaking_publications")
        .select("day_number, platform, url, caption, published_at")
        .eq("published", true),
    ]);

    if (pubSessionsRes.error || pubsRes.error) return [];

    const publicDays = new Map<number, string>();
    for (const s of pubSessionsRes.data ?? []) {
      publicDays.set(Number(s.day_number), String(s.daily_learning_summary ?? ""));
    }

    const pubsByDay = new Map<number, PublicPublishedEntry["publications"]>();
    for (const p of pubsRes.data ?? []) {
      const dn = Number(p.day_number);
      if (!publicDays.has(dn)) continue;
      const list = pubsByDay.get(dn) ?? [];
      list.push({
        platform: p.platform as PlatformId,
        url: String(p.url ?? ""),
        caption: String(p.caption ?? ""),
        publishedAt: (p.published_at as string | null) ?? null,
      });
      pubsByDay.set(dn, list);
    }

    const entries: PublicPublishedEntry[] = [];
    for (const [dayNumber, summary] of publicDays.entries()) {
      const day = getCurriculumDay(dayNumber);
      if (!day) continue;
      entries.push({
        dayNumber,
        date: day.date,
        topic: day.topic,
        skill: day.skill,
        phase: day.phase,
        dailyLearningSummary: summary.trim() || null,
        publications: pubsByDay.get(dayNumber) ?? [],
      });
    }

    return entries.sort((a, b) => b.dayNumber - a.dayNumber);
  } catch {
    return [];
  }
}

/**
 * Primary server-side data loader for all /speaking routes.
 * Strictly gates private workspace data behind `requireSpeakingAuth()`.
 */
export async function getSpeakingWorkspaceData(): Promise<SpeakingWorkspaceData> {
  const timeline = getProgrammeTimelineState();
  const auth = await requireSpeakingAuth();

  const defaultChallenges: Record<number, WeeklyChallengeRecord> = {};
  for (const w of WEEKLY_CHALLENGES) {
    defaultChallenges[w.weekNumber] = {
      weekNumber: w.weekNumber,
      title: w.challengeTitle,
      description: w.challengeDescription,
      completed: false,
      completedAt: null,
      reflection: "",
    };
  }

  if (auth.unauthorized) {
    return {
      isOwner: false,
      schemaReady: true,
      todayDateStr: timeline.todayDateStr,
      currentDayNumber: timeline.currentDayNumber,
      activeDayNumber: timeline.activeDayNumber,
      programmeState: timeline.programmeState,
      sessions: {},
      assessments: {},
      publications: {},
      weeklyChallenges: defaultChallenges,
      weeklyReviews: {},
      ideas: [],
      day90Report: null,
      portfolioContext: [],
      publicPublishedEntries: [],
      siteVideos: [],
    };
  }

  const publicPublishedEntries = await getPublicPublishedEntries();

  const { supabase } = auth;
  const [
    sessionsRes,
    assessmentsRes,
    publicationsRes,
    challengesRes,
    reviewsRes,
    ideasRes,
    day90Res,
    portfolioContext,
    siteVideosRes,
  ] = await Promise.all([
    supabase.from("speaking_sessions").select("*"),
    supabase.from("speaking_assessments").select("*"),
    supabase.from("speaking_publications").select("*"),
    supabase.from("speaking_weekly_challenges").select("*"),
    supabase.from("speaking_weekly_reviews").select("*"),
    supabase.from("speaking_idea_bank").select("*").order("created_at", { ascending: false }),
    supabase.from("speaking_day90_report").select("*").eq("id", 1).maybeSingle(),
    getPortfolioContextItems(),
    supabase
      .from("site_videos")
      .select("*")
      .order("created_at", { ascending: false }),
  ]);

  const schemaMissing =
    isMissingTableError(sessionsRes.error) ||
    isMissingTableError(assessmentsRes.error) ||
    isMissingTableError(publicationsRes.error);

  const sessions: Record<number, DailySession> = {};
  for (const row of sessionsRes.data ?? []) {
    const mapped = mapSessionRow(row as Record<string, unknown>);
    sessions[mapped.dayNumber] = mapped;
  }

  const assessments: Record<number, SpeakingAssessment> = {};
  for (const row of assessmentsRes.data ?? []) {
    const mapped = mapAssessmentRow(row as Record<string, unknown>);
    assessments[mapped.dayNumber] = mapped;
  }

  const publications: Record<number, PublicationRecord[]> = {};
  for (const row of publicationsRes.data ?? []) {
    const mapped = mapPublicationRow(row as Record<string, unknown>);
    const list = publications[mapped.dayNumber] ?? [];
    list.push(mapped);
    publications[mapped.dayNumber] = list;
  }

  const weeklyChallenges: Record<number, WeeklyChallengeRecord> = { ...defaultChallenges };
  for (const row of challengesRes.data ?? []) {
    const wn = Number((row as Record<string, unknown>).week_number);
    if (weeklyChallenges[wn]) {
      weeklyChallenges[wn] = {
        weekNumber: wn,
        title: String((row as Record<string, unknown>).title ?? weeklyChallenges[wn].title),
        description: String((row as Record<string, unknown>).description ?? weeklyChallenges[wn].description),
        completed: Boolean((row as Record<string, unknown>).completed),
        completedAt: ((row as Record<string, unknown>).completed_at as string | null) ?? null,
        reflection: String((row as Record<string, unknown>).reflection ?? ""),
      };
    }
  }

  const weeklyReviews: Record<number, WeeklyReviewRecord> = {};
  for (const row of reviewsRes.data ?? []) {
    const mapped = mapWeeklyReviewRow(row as Record<string, unknown>);
    weeklyReviews[mapped.weekNumber] = mapped;
  }

  const ideas: IdeaBankItem[] = (ideasRes.data ?? []).map((row) =>
    mapIdeaRow(row as Record<string, unknown>)
  );

  const day90Report = day90Res.data
    ? mapDay90Row(day90Res.data as Record<string, unknown>)
    : null;

  const siteVideos = ((siteVideosRes.data ?? []) as Array<Record<string, unknown>>).map(
    (v) => ({
      id: String(v.id ?? ""),
      platform: v.platform as import("@/lib/videos/types").VideoPlatform,
      url: String(v.url ?? ""),
      title: String(v.title ?? ""),
      description: (v.description as string | null) ?? null,
      section: (v.section as import("@/lib/videos/types").VideoSection) || "highlight",
      category:
        typeof v.category === "string" && v.category.trim()
          ? v.category
          : "General",
      speaking_day_number:
        v.speaking_day_number != null ? Number(v.speaking_day_number) : null,
      display_order: Number(v.display_order ?? 0),
      is_published: v.is_published !== undefined ? Boolean(v.is_published) : true,
      created_at: String(v.created_at ?? ""),
      updated_at: String(v.updated_at ?? ""),
    })
  );

  return {
    isOwner: true,
    schemaReady: !schemaMissing,
    todayDateStr: timeline.todayDateStr,
    currentDayNumber: timeline.currentDayNumber,
    activeDayNumber: timeline.activeDayNumber,
    programmeState: timeline.programmeState,
    sessions,
    assessments,
    publications,
    weeklyChallenges,
    weeklyReviews,
    ideas,
    day90Report,
    portfolioContext,
    publicPublishedEntries,
    siteVideos,
  };
}

/** Ensures canonical 90 curriculum rows exist if the owner triggers a sync or seed. */
export async function syncCurriculumDaysToDb(): Promise<void> {
  const admin = getServiceClient();
  if (!admin) return;
  const rows = CURRICULUM_DAYS.map((d) => ({
    day_number: d.dayNumber,
    date: d.date,
    phase: d.phase,
    week_number: d.weekNumber,
    topic: d.topic,
    description: d.description,
    skill: d.skill,
    duration: d.duration,
    thinking_prompts: d.thinkingPrompts,
    recommended_format: d.recommendedFormat,
    weekly_challenge_reference: d.weeklyChallengeReference,
  }));
  await admin.from("speaking_curriculum_days").upsert(rows, { onConflict: "day_number" });
}
