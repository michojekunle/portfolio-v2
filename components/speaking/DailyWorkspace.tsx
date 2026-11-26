"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  Layers,
  Loader2,
  Mic,
  Save,
  Share2,
  Sparkles,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { getCurriculumDay } from "@/lib/speaking/curriculum";
import {
  computeDayStatus,
  formatCalendarDate,
} from "@/lib/speaking/dates";
import {
  AUDIENCE_OPTIONS,
  DAY90_QUESTIONS,
  getAudienceOption,
  getFormatGuide,
  getPhaseForDay,
  PUBLISHING_PLATFORMS,
  SCORECARD_DIMENSIONS,
  SPEAKING_FORMATS,
} from "@/lib/speaking/methodology";
import {
  computeAssessmentAverage,
  computeProgressMetrics,
  getBestTalks,
} from "@/lib/speaking/analytics";
import { buildDailyCarouselSlides } from "@/lib/speaking/content-bridge";
import { createEmptySession } from "@/lib/speaking/defaults";
import { safeMediaOrExternalUrl } from "@/lib/speaking/url";
import { VIDEO_CATEGORIES } from "@/lib/videos/types";
import { isVideoEmbedPlatform, validatePlatformUrl } from "@/lib/videos/validation";
import { writeDraft } from "@/app/tools/carousel-lab/lib/draft-storage";
import type {
  AudienceTypeId,
  CarouselSlideDraft,
  CurriculumDay,
  DailySession,
  Day90ReportRecord,
  PlatformId,
  PublicationRecord,
  ScorecardDimensionKey,
  SpeakingFormatId,
  SpeakingWorkspaceData,
} from "@/lib/speaking/types";
import { StatusBadge } from "./StatusBadge";
import { cn } from "@/lib/utils";

type WorkspaceStage = "prepare" | "record" | "review" | "publish" | "all";

interface DailyWorkspaceProps {
  day: CurriculumDay;
  data: SpeakingWorkspaceData;
}

const DEFAULT_SCORES: Record<ScorecardDimensionKey, number> = {
  clarity: 3,
  structure: 3,
  confidence: 3,
  voice: 3,
  storytelling: 3,
  connection: 3,
  originality: 3,
};

function defaultDay90Report(finalUrl: string): Day90ReportRecord {
  return {
    presentationOutline: "",
    finalRecordingUrl: finalUrl,
    q1OrganiseThoughts: "",
    q2WithoutScript: "",
    q3ExplainComplicated: "",
    q4BetterStoryteller: "",
    q5HabitsOvercome: "",
    q6StillNeedsImprovement: "",
    q7ConversationsOpportunities: "",
    q8ContinueDoing: "",
    updatedAt: null,
  };
}

export function DailyWorkspace({ day, data }: DailyWorkspaceProps): React.ReactElement {
  const router = useRouter();
  const phase = getPhaseForDay(day.dayNumber);
  const isFutureDay = day.date > data.todayDateStr;

  const initialSession = data.sessions[day.dayNumber] ?? createEmptySession(day.dayNumber);
  const initialAssessment = data.assessments[day.dayNumber];
  const initialPubs = data.publications[day.dayNumber] ?? [];

  const [session, setSession] = useState<DailySession>(initialSession);
  const [scores, setScores] = useState<Record<ScorecardDimensionKey, number>>(
    initialAssessment
      ? {
          clarity: initialAssessment.clarity,
          structure: initialAssessment.structure,
          confidence: initialAssessment.confidence,
          voice: initialAssessment.voice,
          storytelling: initialAssessment.storytelling,
          connection: initialAssessment.connection,
          originality: initialAssessment.originality,
        }
      : DEFAULT_SCORES
  );
  const [assessmentNotes, setAssessmentNotes] = useState(initialAssessment?.notes ?? "");
  const [hasSavedAssessment, setHasSavedAssessment] = useState(Boolean(initialAssessment));
  const [pubs, setPubs] = useState<Record<PlatformId, PublicationRecord>>(() => {
    const map = {} as Record<PlatformId, PublicationRecord>;
    for (const p of PUBLISHING_PLATFORMS) {
      const existing = initialPubs.find((item) => item.platform === p.id);
      map[p.id] = existing ?? {
        dayNumber: day.dayNumber,
        platform: p.id,
        published: false,
        url: "",
        caption: "",
        publishedAt: null,
        notes: "",
        videoCategory: "Speaking Challenge",
        syncToVideos: isVideoEmbedPlatform(p.id),
        siteVideoId: null,
      };
    }
    return map;
  });

  const [day90Report, setDay90Report] = useState<Day90ReportRecord>(
    data.day90Report ?? defaultDay90Report(initialSession.finalRecordingUrl)
  );
  const [allowFutureComplete, setAllowFutureComplete] = useState(false);
  const [stage, setStage] = useState<WorkspaceStage>("prepare");
  const [sessionDirty, setSessionDirty] = useState(false);
  const [assessmentDirty, setAssessmentDirty] = useState(false);
  const [pubsDirty, setPubsDirty] = useState(false);
  const [day90Dirty, setDay90Dirty] = useState(false);
  const [savingSection, setSavingSection] = useState<string | null>(null);
  const [uploadingTake, setUploadingTake] = useState<"first" | "second" | null>(null);

  const dirty = sessionDirty || assessmentDirty || pubsDirty || day90Dirty;

  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent): void => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const updateSession = (patch: Partial<DailySession>): void => {
    setSession((prev) => ({ ...prev, ...patch }));
    setSessionDirty(true);
  };

  const handleUnauthorizedResponse = (res: Response): boolean => {
    if (res.status === 401) {
      toast.error("Session locked or expired. Please unlock again.");
      router.push(`/speaking/unlock?next=${encodeURIComponent(`/speaking/day/${day.dayNumber}`)}`);
      return true;
    }
    return false;
  };

  const status = computeDayStatus(day.date, data.todayDateStr, session);
  const formatGuide = getFormatGuide(session.selectedFormat);
  const audienceOption = getAudienceOption(session.selectedAudience);
  const liveAverageScore = useMemo(() => computeAssessmentAverage(scores), [scores]);

  // Day 1 comparison & 90-day summary for Day 90
  const day1Session = data.sessions[1];
  const day1Assessment = data.assessments[1];
  const day1Curriculum = getCurriculumDay(1);
  const day1RecordingHref = safeMediaOrExternalUrl(
    day1Session?.finalRecordingUrl || day1Session?.firstRecordingUrl
  );

  const overallMetrics = useMemo(
    () =>
      computeProgressMetrics({
        curriculum: Array.from({ length: 90 }, (_, i) => getCurriculumDay(i + 1)!),
        sessions: { ...data.sessions, [day.dayNumber]: session },
        assessments: data.assessments,
        publications: data.publications,
        weeklyChallenges: data.weeklyChallenges,
        weeklyReviews: data.weeklyReviews,
        todayDateStr: data.todayDateStr,
      }),
    [data, day.dayNumber, session]
  );
  const bestTalks = useMemo(
    () =>
      getBestTalks(
        Array.from({ length: 90 }, (_, i) => getCurriculumDay(i + 1)!),
        data.sessions,
        data.assessments,
        5
      ),
    [data.assessments, data.sessions]
  );

  const persistSession = async (
    overridePatch?: Partial<DailySession>,
    sectionLabel = "session",
    silent = false
  ): Promise<boolean> => {
    const merged: DailySession = { ...session, ...overridePatch };
    setSavingSection(sectionLabel);
    try {
      const res = await fetch("/api/speaking/session", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...merged,
          status:
            merged.status === "not_started" ? "in_progress" : merged.status,
        }),
      });
      if (handleUnauthorizedResponse(res)) return false;
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Failed to save session");
      setSession({
        ...merged,
        status: merged.status === "not_started" ? "in_progress" : merged.status,
        updatedAt: new Date().toISOString(),
      });
      setSessionDirty(false);
      if (!silent) {
        toast.success("Saved");
        router.refresh();
      }
      return true;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
      return false;
    } finally {
      setSavingSection(null);
    }
  };

  const persistAssessment = async (silent = false): Promise<boolean> => {
    setSavingSection("assessment");
    try {
      const res = await fetch("/api/speaking/assessment", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dayNumber: day.dayNumber,
          ...scores,
          notes: assessmentNotes,
        }),
      });
      if (handleUnauthorizedResponse(res)) return false;
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Failed to save scorecard");
      setHasSavedAssessment(true);
      setAssessmentDirty(false);
      if (!silent) {
        toast.success(`Scorecard saved (${liveAverageScore.toFixed(2)} / 5)`);
        router.refresh();
      }
      return true;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save scorecard");
      return false;
    } finally {
      setSavingSection(null);
    }
  };

  const persistPublications = async (silent = false): Promise<boolean> => {
    setSavingSection("publications");
    try {
      const res = await fetch("/api/speaking/publications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dayNumber: day.dayNumber,
          publications: Object.values(pubs),
        }),
      });
      if (handleUnauthorizedResponse(res)) return false;
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Failed to save publications");
      if (Array.isArray(resData.publications)) {
        setPubs((prev) => {
          const next = { ...prev };
          for (const saved of resData.publications as Array<Record<string, unknown>>) {
            const plat = saved.platform as PlatformId;
            if (next[plat]) {
              next[plat] = {
                ...next[plat],
                url: String(saved.url ?? next[plat].url),
                siteVideoId:
                  typeof saved.site_video_id === "string"
                    ? saved.site_video_id
                    : null,
                syncToVideos:
                  saved.sync_to_videos !== undefined
                    ? Boolean(saved.sync_to_videos)
                    : next[plat].syncToVideos,
                videoCategory:
                  typeof saved.video_category === "string"
                    ? saved.video_category
                    : next[plat].videoCategory,
              };
            }
          }
          return next;
        });
      }
      setPubsDirty(false);
      if (!silent) {
        toast.success("Publishing links & /videos sync saved");
        router.refresh();
      }
      return true;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save publications");
      return false;
    } finally {
      setSavingSection(null);
    }
  };

  const persistDay90 = async (silent = false): Promise<boolean> => {
    setSavingSection("day90");
    try {
      const res = await fetch("/api/speaking/day90", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(day90Report),
      });
      if (handleUnauthorizedResponse(res)) return false;
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Failed to save Day 90 report");
      setDay90Dirty(false);
      if (!silent) {
        toast.success("Day 90 report saved");
        router.refresh();
      }
      return true;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save Day 90 report");
      return false;
    } finally {
      setSavingSection(null);
    }
  };

  const persistAllDirtySections = async (overrideSession?: Partial<DailySession>): Promise<boolean> => {
    const tasks: Array<Promise<boolean>> = [];
    if (sessionDirty || overrideSession) {
      tasks.push(
        persistSession(
          overrideSession,
          overrideSession?.status === "completed" ? "complete" : "all",
          true
        )
      );
    }
    if (assessmentDirty) {
      tasks.push(persistAssessment(true));
    }
    if (pubsDirty) {
      tasks.push(persistPublications(true));
    }
    if (day.isFinalDay && day90Dirty) {
      tasks.push(persistDay90(true));
    }
    if (tasks.length === 0) return true;
    const results = await Promise.all(tasks);
    const allOk = results.every(Boolean);
    if (allOk) {
      router.refresh();
    }
    return allOk;
  };

  const handleUploadTake = async (
    take: "first" | "second",
    file: File | undefined
  ): Promise<void> => {
    if (!file) return;
    setUploadingTake(take);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("dayNumber", String(day.dayNumber));
      formData.append("take", take);

      const res = await fetch("/api/speaking/upload", {
        method: "POST",
        body: formData,
      });
      if (handleUnauthorizedResponse(res)) return;
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Upload failed");

      const patch: Partial<DailySession> =
        take === "first"
          ? { firstRecordingUrl: resData.url, firstTakeCompleted: true }
          : { secondRecordingUrl: resData.url, secondTakeCompleted: true };
      await persistSession(patch, take);
      toast.success("Recording uploaded privately");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingTake(null);
    }
  };

  const toggleLinkedItem = (itemId: string): void => {
    const [kind] = itemId.split(":");
    if (kind === "building") {
      const next = session.linkedBuildingIds.includes(itemId)
        ? session.linkedBuildingIds.filter((x) => x !== itemId)
        : [...session.linkedBuildingIds, itemId];
      updateSession({ linkedBuildingIds: next });
    } else if (kind === "book") {
      const next = session.linkedBookIds.includes(itemId)
        ? session.linkedBookIds.filter((x) => x !== itemId)
        : [...session.linkedBookIds, itemId];
      updateSession({ linkedBookIds: next });
    } else if (kind === "learning") {
      const next = session.linkedLearningIds.includes(itemId)
        ? session.linkedLearningIds.filter((x) => x !== itemId)
        : [...session.linkedLearningIds, itemId];
      updateSession({ linkedLearningIds: next });
    } else if (kind === "project") {
      const next = session.linkedProjectIds.includes(itemId)
        ? session.linkedProjectIds.filter((x) => x !== itemId)
        : [...session.linkedProjectIds, itemId];
      updateSession({ linkedProjectIds: next });
    }
  };

  const selectedLinkedIds = new Set([
    ...session.linkedBuildingIds,
    ...session.linkedBookIds,
    ...session.linkedLearningIds,
    ...session.linkedProjectIds,
  ]);

  const handleGenerateCarouselSlides = (): void => {
    const linked = data.portfolioContext.filter((i) => selectedLinkedIds.has(i.id));
    const slides = buildDailyCarouselSlides({
      day,
      session,
      linkedItems: linked,
    });
    updateSession({ carouselSlides: slides });
    toast.success("Generated carousel outline from today's notes");
  };

  const handleOpenInCarouselLab = (): void => {
    const linked = data.portfolioContext.filter((i) => selectedLinkedIds.has(i.id));
    const slides: CarouselSlideDraft[] =
      session.carouselSlides.length > 0
        ? session.carouselSlides
        : buildDailyCarouselSlides({ day, session, linkedItems: linked });

    writeDraft({
      savedAt: Date.now(),
      slides: slides.map((s) => ({
        title: s.title,
        content: s.content,
        layout: s.layout,
      })),
      activeSlideIndex: 0,
      topic: day.topic,
      roughNotes: session.dailyLearningSummary || session.preparationNotes,
      inputMode: "manual",
      slideCount: slides.length,
      design: {
        aesthetic: "Premium Editorial (Zamir)",
        backgroundStyle: "mesh",
        aspectRatio: "portrait",
        fontTitle: "default",
        fontBody: "default",
        titleScale: 1,
        bodyScale: 1,
        customBg: "",
        customText: "",
        customAccent: "",
        showBranding: true,
        logoMark: "mo",
        logoText: "MICHAEL",
        topRightTag: `Speaking · Day ${day.dayNumber}`,
        creatorName: "Michael Ojekunle",
        creatorHandle: "michaelojekunle.dev",
      },
    });
    router.push("/tools/carousel-lab");
  };

  const handleToggleComplete = async (): Promise<void> => {
    if (isFutureDay && !allowFutureComplete && session.status !== "completed") {
      toast.error("This is a future day. Enable the preparation override below if you really want to mark it complete early.");
      return;
    }
    const nextStatus = session.status === "completed" ? "in_progress" : "completed";
    const ok = await persistAllDirtySections({
      status: nextStatus,
      completedAt: nextStatus === "completed" ? new Date().toISOString() : null,
    });
    if (ok) {
      toast.success(
        nextStatus === "completed"
          ? `Day ${day.dayNumber} saved & marked complete`
          : `Day ${day.dayNumber} reopened`
      );
    }
  };

  const firstTakeSafeHref = safeMediaOrExternalUrl(session.firstRecordingUrl);
  const secondTakeSafeHref = safeMediaOrExternalUrl(session.secondRecordingUrl);
  const finalTakeSafeHref = safeMediaOrExternalUrl(session.finalRecordingUrl);

  const stageDone = {
    prepare: Boolean(
      session.prepCompleted ||
        session.premPoint.trim() ||
        session.preparationNotes.trim()
    ),
    record: Boolean(session.firstTakeCompleted || session.secondTakeCompleted),
    review: Boolean(
      hasSavedAssessment ||
        session.reflectionWhatWorked.trim() ||
        session.reflectionWhatLearned.trim()
    ),
    publish: Boolean(
      session.status === "completed" ||
        session.practiceOnly ||
        Object.values(pubs).some((p) => p.published)
    ),
  };

  const showPrepare = stage === "prepare" || stage === "all";
  const showRecord = stage === "record" || stage === "all";
  const showReview = stage === "review" || stage === "all";
  const showPublish = stage === "publish" || stage === "all";

  return (
    <div className="space-y-5 sm:space-y-7 pb-8">
      {/* Top Breadcrumb + Day Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/speaking"
            className="inline-flex items-center gap-1.5 font-mono text-xs text-(--ink-2) hover:text-(--ink) no-underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Home
          </Link>
          <span className="text-(--ink-4)" aria-hidden="true">/</span>
          <span className="font-mono text-xs text-(--ink-2) tabular-nums">
            Day {day.dayNumber} of 90
          </span>
        </div>

        <div className="flex items-center gap-2">
          {day.dayNumber > 1 && (
            <Link
              href={`/speaking/day/${day.dayNumber - 1}`}
              className="inline-flex items-center gap-1 rounded-[4px] border border-(--rule) bg-(--paper) px-3 py-2 min-h-[38px] text-xs text-(--ink) no-underline hover:border-(--ink)"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              D{day.dayNumber - 1}
            </Link>
          )}
          {day.dayNumber < 90 && (
            <Link
              href={`/speaking/day/${day.dayNumber + 1}`}
              className="inline-flex items-center gap-1 rounded-[4px] border border-(--rule) bg-(--paper) px-3 py-2 min-h-[38px] text-xs text-(--ink) no-underline hover:border-(--ink)"
            >
              D{day.dayNumber + 1}
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          )}
        </div>
      </div>

      {/* Future Day Guard */}
      {isFutureDay && session.status !== "completed" && (
        <div className="rounded-[6px] border border-(--rule) bg-(--bg-2) p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-(--ink-2) leading-relaxed">
            <strong className="text-(--ink) font-medium">Future Preparation Mode:</strong>{" "}
            {formatCalendarDate(day.date)} hasn&apos;t arrived yet. Draft PREM notes without marking the day complete.
          </div>
          <label className="inline-flex items-center gap-2 text-xs text-(--ink) shrink-0 cursor-pointer">
            <input
              type="checkbox"
              checked={allowFutureComplete}
              onChange={(e) => setAllowFutureComplete(e.target.checked)}
              className="accent-(--ink)"
            />
            Allow early completion
          </label>
        </div>
      )}

      {/* 1. Compact Persistent Topic Header */}
      <section className="rounded-[6px] border border-(--rule) bg-(--paper) p-4 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-(--ink-2) tabular-nums">
            <span className="text-(--ink) font-semibold">DAY {day.dayNumber} / 90</span>
            <span>·</span>
            <span>{formatCalendarDate(day.date)}</span>
            <span className="hidden sm:inline">·</span>
            <span className="hidden sm:inline">{phase.name}</span>
          </div>
          <StatusBadge status={status} />
        </div>

        <h1 className="font-display text-[clamp(1.5rem,3.4vw,2.4rem)] font-normal leading-[1.15] tracking-[-0.02em] text-(--ink) m-0">
          {day.topic}
        </h1>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-[2px] border border-(--rule) bg-(--bg-2) px-2.5 py-1 font-mono text-[11px] text-(--ink)">
            <Sparkles className="h-3 w-3" aria-hidden="true" />
            {day.skill}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-[2px] border border-(--rule) bg-(--bg) px-2.5 py-1 font-mono text-[11px] text-(--ink-2)">
            <Clock className="h-3 w-3" aria-hidden="true" />
            {day.duration}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1 border-t border-(--rule-2)">
          <div className="space-y-1">
            <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-(--ink-2)">
              Why It Matters
            </div>
            <p className="text-xs sm:text-sm text-(--ink-2) leading-relaxed m-0">
              {day.whyItMatters}
            </p>
          </div>
          <div className="space-y-1">
            <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-(--ink-2)">
              Assignment
            </div>
            <p className="text-xs sm:text-sm text-(--ink) leading-relaxed m-0">
              {day.exercise}
            </p>
          </div>
        </div>
      </section>

      {/* OPay-style Stepper Navigation */}
      <div
        role="tablist"
        aria-label="Daily session workflow steps"
        className="grid grid-cols-5 gap-1 rounded-[6px] border border-(--rule) bg-(--paper) p-1"
      >
        {(
          [
            { id: "prepare" as WorkspaceStage, label: "1. Prep", done: stageDone.prepare },
            { id: "record" as WorkspaceStage, label: "2. Record", done: stageDone.record },
            { id: "review" as WorkspaceStage, label: "3. Review", done: stageDone.review },
            { id: "publish" as WorkspaceStage, label: "4. Publish", done: stageDone.publish },
            { id: "all" as WorkspaceStage, label: "All", done: false },
          ] as const
        ).map((tab) => {
          const active = stage === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setStage(tab.id)}
              className={cn(
                "flex items-center justify-center gap-1 rounded-[4px] px-1.5 py-2.5 min-h-[40px] text-[11px] sm:text-xs font-medium cursor-pointer transition-colors whitespace-nowrap",
                active
                  ? "bg-(--ink) text-(--bg)"
                  : "text-(--ink-2) hover:text-(--ink)"
              )}
            >
              {tab.done && !active && (
                <span className="h-1.5 w-1.5 rounded-full bg-(--good) shrink-0" aria-hidden="true" />
              )}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {showPrepare && (
        <>
          {/* 2. Thinking Prompts */}
          <section className="rounded-[6px] border border-(--rule) bg-(--paper) p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-display text-xl font-normal text-(--ink) m-0">
            Thinking Prompts
          </h2>
          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-(--ink-2)">
            Stimulate Original Thought
          </span>
        </div>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 m-0 p-0 list-none">
          {day.thinkingPrompts.map((prompt, idx) => (
            <li
              key={idx}
              className="rounded-[4px] border border-(--rule-2) bg-(--bg) p-3.5 text-sm text-(--ink-2) leading-relaxed"
            >
              <span className="font-mono text-[11px] text-(--ink-2) mr-2 tabular-nums">
                0{idx + 1}
              </span>
              {prompt}
            </li>
          ))}
        </ul>
      </section>

      {/* 3. Organise My Thoughts (PREM Framework) */}
      <section className="rounded-[6px] border border-(--rule) bg-(--paper) p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-normal text-(--ink) m-0">
              Organise My Thoughts — PREM
            </h2>
            <p className="text-xs text-(--ink-2) mt-1 mb-0">
              Optional structure. Prepare ideas, not paragraphs—or leave blank for spontaneous speaking.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void persistSession(undefined, "prem")}
            disabled={savingSection === "prem"}
            className="inline-flex items-center gap-1.5 rounded-[4px] bg-(--ink) text-(--bg) px-3.5 py-2 min-h-[38px] text-xs font-medium cursor-pointer hover:opacity-90 disabled:opacity-50"
          >
            {savingSection === "prem" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <Save className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            Save Preparation Notes
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label
              htmlFor={`prem-point-${day.dayNumber}`}
              className="block font-mono text-[11px] uppercase tracking-[0.14em] text-(--ink)"
            >
              P — Point{" "}
              <span className="normal-case tracking-normal text-(--ink-2)">
                (What exactly am I trying to say?)
              </span>
            </label>
            <textarea
              id={`prem-point-${day.dayNumber}`}
              rows={3}
              value={session.premPoint}
              onChange={(e) => updateSession({ premPoint: e.target.value })}
              placeholder="One sharp central claim..."
              className="w-full rounded-[4px] border border-(--rule) bg-(--bg) p-3 text-base sm:text-sm text-(--ink) focus:border-(--ink) focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor={`prem-reason-${day.dayNumber}`}
              className="block font-mono text-[11px] uppercase tracking-[0.14em] text-(--ink)"
            >
              R — Reason{" "}
              <span className="normal-case tracking-normal text-(--ink-2)">
                (Why do I believe this?)
              </span>
            </label>
            <textarea
              id={`prem-reason-${day.dayNumber}`}
              rows={3}
              value={session.premReason}
              onChange={(e) => updateSession({ premReason: e.target.value })}
              placeholder="Supporting logic and mechanism..."
              className="w-full rounded-[4px] border border-(--rule) bg-(--bg) p-3 text-base sm:text-sm text-(--ink) focus:border-(--ink) focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor={`prem-example-${day.dayNumber}`}
              className="block font-mono text-[11px] uppercase tracking-[0.14em] text-(--ink)"
            >
              E — Example{" "}
              <span className="normal-case tracking-normal text-(--ink-2)">
                (Experience, observation, analogy, evidence)
              </span>
            </label>
            <textarea
              id={`prem-example-${day.dayNumber}`}
              rows={3}
              value={session.premExample}
              onChange={(e) => updateSession({ premExample: e.target.value })}
              placeholder="A real build moment, bug, story, or analogy..."
              className="w-full rounded-[4px] border border-(--rule) bg-(--bg) p-3 text-base sm:text-sm text-(--ink) focus:border-(--ink) focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor={`prem-meaning-${day.dayNumber}`}
              className="block font-mono text-[11px] uppercase tracking-[0.14em] text-(--ink)"
            >
              M — Meaning{" "}
              <span className="normal-case tracking-normal text-(--ink-2)">
                (Why should someone listening care?)
              </span>
            </label>
            <textarea
              id={`prem-meaning-${day.dayNumber}`}
              rows={3}
              value={session.premMeaning}
              onChange={(e) => updateSession({ premMeaning: e.target.value })}
              placeholder="What changes for the person listening..."
              className="w-full rounded-[4px] border border-(--rule) bg-(--bg) p-3 text-base sm:text-sm text-(--ink) focus:border-(--ink) focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor={`prep-notes-${day.dayNumber}`}
            className="block font-mono text-[11px] uppercase tracking-[0.14em] text-(--ink-2)"
          >
            Freeform Preparation Notes & Key Bullets
          </label>
          <textarea
            id={`prep-notes-${day.dayNumber}`}
            rows={3}
            value={session.preparationNotes}
            onChange={(e) => updateSession({ preparationNotes: e.target.value })}
            placeholder="Jot quick hooks, phrases, or questions before hitting record..."
            className="w-full rounded-[4px] border border-(--rule) bg-(--bg) p-3 text-base sm:text-sm text-(--ink) focus:border-(--ink) focus:outline-none"
          />
        </div>
      </section>

      {/* 4 & 5. Speaking Format & Audience Adaptation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="rounded-[6px] border border-(--rule) bg-(--paper) p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-xl font-normal text-(--ink) m-0">
              Speaking Format
            </h2>
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-(--ink-2)">
              Recommended: {getFormatGuide(day.recommendedFormat).label}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2" role="group" aria-label="Select speaking format">
            {SPEAKING_FORMATS.map((fmt) => (
              <button
                key={fmt.id}
                type="button"
                aria-pressed={session.selectedFormat === fmt.id}
                onClick={() => updateSession({ selectedFormat: fmt.id as SpeakingFormatId })}
                className={cn(
                  "rounded-[4px] border px-3 py-2 min-h-[40px] text-left text-xs font-medium cursor-pointer transition-colors",
                  session.selectedFormat === fmt.id
                    ? "border-(--ink) bg-(--ink) text-(--bg)"
                    : "border-(--rule) bg-(--bg) text-(--ink-2) hover:text-(--ink)"
                )}
              >
                {fmt.label}
              </button>
            ))}
          </div>

          <div className="rounded-[4px] border border-(--rule-2) bg-(--bg) p-4 space-y-1.5">
            <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-(--ink-2)">
              How to execute: {formatGuide.label}
            </div>
            <p className="text-xs text-(--ink-2) leading-relaxed m-0">
              {formatGuide.howToExecute}
            </p>
          </div>
        </section>

        <section className="rounded-[6px] border border-(--rule) bg-(--paper) p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-xl font-normal text-(--ink) m-0">
              Audience Adaptation
            </h2>
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-(--ink-2)">
              Calibrate Tone & Examples
            </span>
          </div>

          <div className="flex flex-wrap gap-2" role="group" aria-label="Select intended audience">
            {AUDIENCE_OPTIONS.map((aud) => (
              <button
                key={aud.id}
                type="button"
                aria-pressed={session.selectedAudience === aud.id}
                onClick={() => updateSession({ selectedAudience: aud.id as AudienceTypeId })}
                className={cn(
                  "rounded-[4px] border px-3 py-2 min-h-[38px] text-xs font-medium cursor-pointer transition-colors",
                  session.selectedAudience === aud.id
                    ? "border-(--ink) bg-(--ink) text-(--bg)"
                    : "border-(--rule) bg-(--bg) text-(--ink-2) hover:text-(--ink)"
                )}
              >
                {aud.label}
              </button>
            ))}
          </div>

          <div className="rounded-[4px] border border-(--rule-2) bg-(--bg) p-4 space-y-1.5">
            <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-(--ink-2)">
              Angle for {audienceOption.label}
            </div>
            <p className="text-xs text-(--ink-2) leading-relaxed m-0">
              {day.audienceAngles[session.selectedAudience] || audienceOption.defaultFocus}
            </p>
          </div>
        </section>
      </div>

          {stage === "prepare" && (
            <div className="flex items-center justify-end gap-3 pt-1">
              <button
                type="button"
                onClick={() => {
                  void persistSession(undefined, "prem", true);
                  setStage("record");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-[6px] bg-(--ink) text-(--bg) px-5 py-3 min-h-[46px] text-sm font-medium cursor-pointer hover:opacity-90"
              >
                Next: Record Session
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          )}
        </>
      )}

      {/* 6. Daily Learning, Portfolio Links & Carousel Slides */}
      {showPublish && (
      <section className="rounded-[6px] border border-(--rule) bg-(--paper) p-4 sm:p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-normal text-(--ink) m-0">
              Daily Learning & Carousel Export
            </h2>
            <p className="text-xs text-(--ink-2) mt-1 mb-0">
              Capture what you learned today, link active builds or books, and generate carousel slides for Instagram/X.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleGenerateCarouselSlides}
              className="inline-flex items-center gap-1.5 rounded-[4px] border border-(--rule) bg-(--bg) px-3 py-2 min-h-[38px] text-xs font-medium text-(--ink) cursor-pointer hover:border-(--ink)"
            >
              <Layers className="h-3.5 w-3.5" aria-hidden="true" />
              Draft Carousel Slides
            </button>
            <button
              type="button"
              onClick={handleOpenInCarouselLab}
              className="inline-flex items-center gap-1.5 rounded-[4px] bg-(--ink) text-(--bg) px-3 py-2 min-h-[38px] text-xs font-medium cursor-pointer hover:opacity-90"
            >
              Open in Carousel Lab
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label
            htmlFor={`daily-learning-${day.dayNumber}`}
            className="block font-mono text-[11px] uppercase tracking-[0.14em] text-(--ink-2)"
          >
            What I Learned Today (feeds weekly articles & carousels)
          </label>
          <textarea
            id={`daily-learning-${day.dayNumber}`}
            rows={3}
            value={session.dailyLearningSummary}
            onChange={(e) => updateSession({ dailyLearningSummary: e.target.value })}
            placeholder="Summarize today's technical, reading, or product takeaway in plain words..."
            className="w-full rounded-[4px] border border-(--rule) bg-(--bg) p-3 text-base sm:text-sm text-(--ink) focus:border-(--ink) focus:outline-none"
          />
        </div>

        {data.portfolioContext.length > 0 && (
          <div className="space-y-2">
            <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-(--ink-2)">
              Link to What You&apos;re Building, Reading & Learning
            </div>
            <div className="flex flex-wrap gap-2">
              {data.portfolioContext.map((item) => {
                const active = selectedLinkedIds.has(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => toggleLinkedItem(item.id)}
                    className={cn(
                      "rounded-[4px] border px-2.5 py-1.5 min-h-[36px] text-xs cursor-pointer transition-colors",
                      active
                        ? "border-(--ink) bg-(--ink) text-(--bg)"
                        : "border-(--rule) bg-(--bg) text-(--ink-2) hover:text-(--ink)"
                    )}
                  >
                    <span className="font-mono text-[11px] uppercase opacity-75 mr-1">
                      {item.kind}:
                    </span>
                    {item.title}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {session.carouselSlides.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
            {session.carouselSlides.map((slide, idx) => (
              <div
                key={idx}
                className="rounded-[4px] border border-(--rule) bg-(--bg) p-3.5 space-y-2"
              >
                <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.12em] text-(--ink-2)">
                  <span>Slide {idx + 1}</span>
                  <span>{slide.layout}</span>
                </div>
                <input
                  type="text"
                  aria-label={`Slide ${idx + 1} title`}
                  value={slide.title}
                  onChange={(e) => {
                    const next = [...session.carouselSlides];
                    next[idx] = { ...slide, title: e.target.value };
                    updateSession({ carouselSlides: next });
                  }}
                  className="w-full rounded-[4px] border border-(--rule) bg-(--paper) px-2.5 py-1.5 text-base sm:text-xs font-medium text-(--ink)"
                />
                <textarea
                  rows={2}
                  aria-label={`Slide ${idx + 1} content`}
                  value={slide.content}
                  onChange={(e) => {
                    const next = [...session.carouselSlides];
                    next[idx] = { ...slide, content: e.target.value };
                    updateSession({ carouselSlides: next });
                  }}
                  className="w-full rounded-[4px] border border-(--rule) bg-(--paper) px-2.5 py-1.5 text-base sm:text-xs text-(--ink-2)"
                />
              </div>
            ))}
          </div>
        )}
      </section>
      )}

      {/* 7. Recording Tracker */}
      {showRecord && (
      <>
      <section className="rounded-[6px] border border-(--rule) bg-(--paper) p-4 sm:p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Mic className="h-4 w-4 text-(--ink-2)" aria-hidden="true" />
            <h2 className="font-display text-xl font-normal text-(--ink) m-0">
              Recording Tracker
            </h2>
          </div>
          <button
            type="button"
            onClick={() => void persistSession(undefined, "recording")}
            disabled={savingSection === "recording"}
            className="inline-flex items-center gap-1.5 rounded-[4px] bg-(--ink) text-(--bg) px-3.5 py-2 min-h-[38px] text-xs font-medium cursor-pointer hover:opacity-90 disabled:opacity-50"
          >
            {savingSection === "recording" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <Save className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            Save Recording Log
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* First Take */}
          <div className="rounded-[4px] border border-(--rule) bg-(--bg) p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <label className="inline-flex items-center gap-2 text-sm font-medium text-(--ink) cursor-pointer">
                <input
                  type="checkbox"
                  checked={session.firstTakeCompleted}
                  onChange={(e) =>
                    updateSession({ firstTakeCompleted: e.target.checked })
                  }
                  className="accent-(--ink)"
                />
                First take completed (uninterrupted)
              </label>
              <label className="inline-flex items-center gap-1 text-[11px] font-mono text-(--ink-2) hover:text-(--ink) cursor-pointer">
                {uploadingTake === "first" ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                ) : (
                  <Upload className="h-3.5 w-3.5" aria-hidden="true" />
                )}
                <span>Upload</span>
                <input
                  type="file"
                  accept="video/*,audio/*"
                  className="sr-only"
                  onChange={(e) => void handleUploadTake("first", e.target.files?.[0])}
                />
              </label>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                aria-label="First take recording URL or uploaded path"
                value={session.firstRecordingUrl}
                onChange={(e) => updateSession({ firstRecordingUrl: e.target.value })}
                placeholder="First take URL or uploaded path"
                className="flex-1 min-w-0 rounded-[4px] border border-(--rule) bg-(--paper) px-3 py-2 text-base sm:text-xs text-(--ink)"
              />
              {firstTakeSafeHref && (
                <a
                  href={firstTakeSafeHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-[4px] border border-(--rule) bg-(--paper) px-2.5 py-2 font-mono text-[11px] text-(--ink) no-underline hover:border-(--ink) shrink-0"
                >
                  Open
                  <ExternalLink className="h-3 w-3" aria-hidden="true" />
                </a>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <input
                type="text"
                aria-label="First take duration"
                value={session.firstRecordingDuration}
                onChange={(e) =>
                  updateSession({ firstRecordingDuration: e.target.value })
                }
                placeholder="Duration (e.g. 4:15)"
                className="rounded-[4px] border border-(--rule) bg-(--paper) px-3 py-2 text-base sm:text-xs text-(--ink)"
              />
              <input
                type="number"
                aria-label="Minutes spoken"
                min={0}
                max={180}
                step={0.5}
                value={session.firstRecordingMinutes || ""}
                onChange={(e) =>
                  updateSession({
                    firstRecordingMinutes: Number(e.target.value) || 0,
                  })
                }
                placeholder="Minutes spoken"
                className="rounded-[4px] border border-(--rule) bg-(--paper) px-3 py-2 text-base sm:text-xs tabular-nums text-(--ink)"
              />
            </div>
          </div>

          {/* Second Take */}
          <div className="rounded-[4px] border border-(--rule) bg-(--bg) p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <label className="inline-flex items-center gap-2 text-sm font-medium text-(--ink) cursor-pointer">
                <input
                  type="checkbox"
                  checked={session.secondTakeCompleted}
                  onChange={(e) =>
                    updateSession({ secondTakeCompleted: e.target.checked })
                  }
                  className="accent-(--ink)"
                />
                Second take completed (improved)
              </label>
              <label className="inline-flex items-center gap-1 text-[11px] font-mono text-(--ink-2) hover:text-(--ink) cursor-pointer">
                {uploadingTake === "second" ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                ) : (
                  <Upload className="h-3.5 w-3.5" aria-hidden="true" />
                )}
                <span>Upload</span>
                <input
                  type="file"
                  accept="video/*,audio/*"
                  className="sr-only"
                  onChange={(e) => void handleUploadTake("second", e.target.files?.[0])}
                />
              </label>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                aria-label="Second take recording URL or uploaded path"
                value={session.secondRecordingUrl}
                onChange={(e) => updateSession({ secondRecordingUrl: e.target.value })}
                placeholder="Second take URL or uploaded path"
                className="flex-1 min-w-0 rounded-[4px] border border-(--rule) bg-(--paper) px-3 py-2 text-base sm:text-xs text-(--ink)"
              />
              {secondTakeSafeHref && (
                <a
                  href={secondTakeSafeHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-[4px] border border-(--rule) bg-(--paper) px-2.5 py-2 font-mono text-[11px] text-(--ink) no-underline hover:border-(--ink) shrink-0"
                >
                  Open
                  <ExternalLink className="h-3 w-3" aria-hidden="true" />
                </a>
              )}
            </div>
            <input
              type="text"
              aria-label="Second take duration"
              value={session.secondRecordingDuration}
              onChange={(e) =>
                updateSession({ secondRecordingDuration: e.target.value })
              }
              placeholder="Second take duration (e.g. 3:50)"
              className="w-full rounded-[4px] border border-(--rule) bg-(--paper) px-3 py-2 text-base sm:text-xs text-(--ink)"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <div className="flex flex-wrap gap-5">
            <label className="inline-flex items-center gap-2 text-xs text-(--ink) cursor-pointer">
              <input
                type="checkbox"
                checked={session.prepCompleted}
                onChange={(e) => updateSession({ prepCompleted: e.target.checked })}
                className="accent-(--ink)"
              />
              Thoughts prepared
            </label>
            <label className="inline-flex items-center gap-2 text-xs text-(--ink) cursor-pointer">
              <input
                type="checkbox"
                checked={session.reviewCompleted}
                onChange={(e) => updateSession({ reviewCompleted: e.target.checked })}
                className="accent-(--ink)"
              />
              First take reviewed
            </label>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              aria-label="Final selected recording URL"
              value={session.finalRecordingUrl}
              onChange={(e) => updateSession({ finalRecordingUrl: e.target.value })}
              placeholder="Final selected recording URL (if different)"
              className="flex-1 min-w-0 rounded-[4px] border border-(--rule) bg-(--bg) px-3 py-2 text-base sm:text-xs text-(--ink)"
            />
            {finalTakeSafeHref && (
              <a
                href={finalTakeSafeHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-[4px] border border-(--rule) bg-(--bg) px-2.5 py-2 font-mono text-[11px] text-(--ink) no-underline hover:border-(--ink) shrink-0"
              >
                Open
                <ExternalLink className="h-3 w-3" aria-hidden="true" />
              </a>
            )}
          </div>
        </div>
      </section>
      {stage === "record" && (
        <div className="flex items-center justify-between gap-3 pt-1">
          <button
            type="button"
            onClick={() => {
              setStage("prepare");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="inline-flex items-center justify-center gap-1.5 rounded-[6px] border border-(--rule) bg-(--paper) px-4 py-3 min-h-[46px] text-sm font-medium text-(--ink) cursor-pointer hover:border-(--ink)"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Prep
          </button>
          <button
            type="button"
            onClick={() => {
              void persistSession(undefined, "recording", true);
              setStage("review");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-[6px] bg-(--ink) text-(--bg) px-5 py-3 min-h-[46px] text-sm font-medium cursor-pointer hover:opacity-90"
          >
            Next: Review & Score
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      )}
      </>
      )}

      {/* 8. Self-Assessment Scorecard + Written Reflection */}
      {showReview && (
      <>
      <section className="rounded-[6px] border border-(--rule) bg-(--paper) p-4 sm:p-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-normal text-(--ink) m-0">
              Seven-Dimension Self-Assessment
            </h2>
            <p className="text-xs text-(--ink-2) mt-1 mb-0">
              Score honestly from 1 to 5 based on reviewing your recording.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="font-mono text-sm tabular-nums text-(--ink)">
              Average:{" "}
              <strong>{liveAverageScore.toFixed(2)}</strong> / 5.00
              {!hasSavedAssessment && (
                <span className="ml-2 text-[11px] text-(--ink-2)">(unsaved)</span>
              )}
            </div>
            <button
              type="button"
              onClick={() => void persistAssessment()}
              disabled={savingSection === "assessment"}
              className="inline-flex items-center gap-1.5 rounded-[4px] bg-(--ink) text-(--bg) px-3.5 py-2 min-h-[38px] text-xs font-medium cursor-pointer hover:opacity-90 disabled:opacity-50"
            >
              {savingSection === "assessment" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
              ) : (
                <Save className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              Save Scorecard
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SCORECARD_DIMENSIONS.map((dim) => (
            <div
              key={dim.key}
              className="rounded-[4px] border border-(--rule-2) bg-(--bg) p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div>
                <div className="text-sm font-medium text-(--ink)">{dim.label}</div>
                <div className="text-xs text-(--ink-2)">{dim.question}</div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0" role="group" aria-label={dim.label}>
                {[1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    type="button"
                    aria-pressed={scores[dim.key] === val}
                    aria-label={`${dim.label}: ${val} out of 5`}
                    onClick={() => {
                      setScores((prev) => ({ ...prev, [dim.key]: val }));
                      setAssessmentDirty(true);
                    }}
                    className={cn(
                      "h-10 w-10 sm:h-8 sm:w-8 rounded-[4px] border font-mono text-xs tabular-nums cursor-pointer transition-colors",
                      scores[dim.key] === val
                        ? "border-(--ink) bg-(--ink) text-(--bg)"
                        : "border-(--rule) bg-(--paper) text-(--ink-2) hover:border-(--ink)"
                    )}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-1">
          <label
            htmlFor={`scorecard-notes-${day.dayNumber}`}
            className="text-xs font-medium text-(--ink-2)"
          >
            Scorecard Notes (optional observations on delivery or pacing)
          </label>
          <textarea
            id={`scorecard-notes-${day.dayNumber}`}
            rows={2}
            value={assessmentNotes}
            onChange={(e) => {
              setAssessmentNotes(e.target.value);
              setAssessmentDirty(true);
            }}
            placeholder="Notes on clarity, pauses, energy, or phrasing..."
            className="w-full rounded-[4px] border border-(--rule) bg-(--bg) p-2.5 text-base sm:text-sm text-(--ink)"
          />
        </div>

        <div className="space-y-4 pt-2 border-t border-(--rule-2)">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-display text-lg font-normal text-(--ink) m-0">
              Written Reflection
            </h3>
            <button
              type="button"
              onClick={() => void persistSession(undefined, "reflection")}
              disabled={savingSection === "reflection"}
              className="inline-flex items-center gap-1.5 rounded-[4px] border border-(--rule) bg-(--bg) px-3 py-2 min-h-[38px] text-xs font-medium text-(--ink) cursor-pointer hover:border-(--ink)"
            >
              {savingSection === "reflection" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
              ) : (
                <Save className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              Save Reflection
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor={`ref-worked-${day.dayNumber}`} className="text-xs font-medium text-(--ink-2)">
                What worked?
              </label>
              <textarea
                id={`ref-worked-${day.dayNumber}`}
                rows={2}
                value={session.reflectionWhatWorked}
                onChange={(e) => updateSession({ reflectionWhatWorked: e.target.value })}
                className="w-full rounded-[4px] border border-(--rule) bg-(--bg) p-2.5 text-base sm:text-sm text-(--ink)"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor={`ref-weakest-${day.dayNumber}`} className="text-xs font-medium text-(--ink-2)">
                What was the weakest part?
              </label>
              <textarea
                id={`ref-weakest-${day.dayNumber}`}
                rows={2}
                value={session.reflectionWeakest}
                onChange={(e) => updateSession({ reflectionWeakest: e.target.value })}
                className="w-full rounded-[4px] border border-(--rule) bg-(--bg) p-2.5 text-base sm:text-sm text-(--ink)"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor={`ref-lost-${day.dayNumber}`} className="text-xs font-medium text-(--ink-2)">
                Where did I lose my train of thought?
              </label>
              <textarea
                id={`ref-lost-${day.dayNumber}`}
                rows={2}
                value={session.reflectionLostTrain}
                onChange={(e) => updateSession({ reflectionLostTrain: e.target.value })}
                className="w-full rounded-[4px] border border-(--rule) bg-(--bg) p-2.5 text-base sm:text-sm text-(--ink)"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor={`ref-tomorrow-${day.dayNumber}`} className="text-xs font-medium text-(--ink-2)">
                What will I improve tomorrow?
              </label>
              <textarea
                id={`ref-tomorrow-${day.dayNumber}`}
                rows={2}
                value={session.reflectionImproveTomorrow}
                onChange={(e) =>
                  updateSession({ reflectionImproveTomorrow: e.target.value })
                }
                className="w-full rounded-[4px] border border-(--rule) bg-(--bg) p-2.5 text-base sm:text-sm text-(--ink)"
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label htmlFor={`ref-learned-${day.dayNumber}`} className="text-xs font-medium text-(--ink-2)">
                What did I learn?
              </label>
              <textarea
                id={`ref-learned-${day.dayNumber}`}
                rows={2}
                value={session.reflectionWhatLearned}
                onChange={(e) =>
                  updateSession({ reflectionWhatLearned: e.target.value })
                }
                className="w-full rounded-[4px] border border-(--rule) bg-(--bg) p-2.5 text-base sm:text-sm text-(--ink)"
              />
            </div>
          </div>
        </div>
      </section>
      {stage === "review" && (
        <div className="flex items-center justify-between gap-3 pt-1">
          <button
            type="button"
            onClick={() => {
              setStage("record");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="inline-flex items-center justify-center gap-1.5 rounded-[6px] border border-(--rule) bg-(--paper) px-4 py-3 min-h-[46px] text-sm font-medium text-(--ink) cursor-pointer hover:border-(--ink)"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Record
          </button>
          <button
            type="button"
            onClick={() => {
              void persistAllDirtySections();
              setStage("publish");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-[6px] bg-(--ink) text-(--bg) px-5 py-3 min-h-[46px] text-sm font-medium cursor-pointer hover:opacity-90"
          >
            Next: Publish & Finish
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      )}
      </>
      )}

      {/* 9. Publishing Tracker & Completion */}
      {showPublish && (
      <>
      <section className="rounded-[6px] border border-(--rule) bg-(--paper) p-4 sm:p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Share2 className="h-4 w-4 text-(--ink-2)" aria-hidden="true" />
            <h2 className="font-display text-xl font-normal text-(--ink) m-0">
              Publishing Tracker
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/speaking/progress#videos-manager"
              className="inline-flex items-center gap-1 rounded-[4px] border border-(--rule) bg-(--bg) px-3 py-2 min-h-[38px] text-xs font-medium text-(--ink-2) hover:text-(--ink) no-underline"
            >
              Review /videos
            </Link>
            <button
              type="button"
              onClick={() => void persistPublications()}
              disabled={savingSection === "publications"}
              className="inline-flex items-center gap-1.5 rounded-[4px] border border-(--rule) bg-(--bg) px-3.5 py-2 min-h-[38px] text-xs font-medium text-(--ink) cursor-pointer hover:border-(--ink)"
            >
              {savingSection === "publications" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
              ) : (
                <Save className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              Save Publishing Links
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PUBLISHING_PLATFORMS.map((plat) => {
            const p = pubs[plat.id];
            const isVideo = isVideoEmbedPlatform(plat.id);
            const urlCheck = p.url.trim()
              ? validatePlatformUrl(plat.id, p.url)
              : p.published
              ? { ok: false as const, error: `Enter a valid ${plat.label} URL to publish.` }
              : { ok: true as const, normalizedUrl: "" };
            return (
              <div
                key={plat.id}
                className="rounded-[4px] border border-(--rule-2) bg-(--bg) p-4 space-y-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-(--ink)">{plat.label}</span>
                      {isVideo && p.siteVideoId && (
                        <Link
                          href="/speaking/progress#videos-manager"
                          className="rounded-full border border-(--good)/35 bg-(--good)/12 px-2 py-0.5 font-mono text-[11px] text-(--good) no-underline hover:underline"
                        >
                          On /videos
                        </Link>
                      )}
                    </div>
                    <div className="text-[11px] text-(--ink-2)">{plat.purpose}</div>
                  </div>
                  <label className="inline-flex items-center gap-1.5 text-xs font-medium text-(--ink) cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={p.published}
                      onChange={(e) => {
                        setPubs((prev) => ({
                          ...prev,
                          [plat.id]: { ...p, published: e.target.checked },
                        }));
                        setPubsDirty(true);
                      }}
                      className="accent-(--ink)"
                    />
                    Published
                  </label>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_140px] gap-2">
                  <input
                    type="url"
                    aria-label={`${plat.label} publication URL`}
                    aria-invalid={!urlCheck.ok}
                    value={p.url}
                    onChange={(e) => {
                      setPubs((prev) => ({
                        ...prev,
                        [plat.id]: { ...p, url: e.target.value },
                      }));
                      setPubsDirty(true);
                    }}
                    placeholder={plat.placeholder}
                    className={cn(
                      "w-full rounded-[4px] border bg-(--paper) px-2.5 py-2 text-base sm:text-xs text-(--ink)",
                      !urlCheck.ok ? "border-destructive" : "border-(--rule)"
                    )}
                  />
                  <input
                    type="date"
                    aria-label={`${plat.label} publication date`}
                    value={p.publishedAt ? p.publishedAt.slice(0, 10) : ""}
                    onChange={(e) => {
                      setPubs((prev) => ({
                        ...prev,
                        [plat.id]: {
                          ...p,
                          publishedAt: e.target.value
                            ? `${e.target.value}T12:00:00.000Z`
                            : null,
                        },
                      }));
                      setPubsDirty(true);
                    }}
                    className="w-full rounded-[4px] border border-(--rule) bg-(--paper) px-2 py-2 font-mono text-base sm:text-[11px] text-(--ink)"
                  />
                </div>
                {!urlCheck.ok && (
                  <p className="text-[11px] text-destructive m-0">{urlCheck.error}</p>
                )}
                {isVideo && (
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
                    <label className="inline-flex items-center gap-1.5 text-xs text-(--ink-2) cursor-pointer">
                      <input
                        type="checkbox"
                        checked={p.syncToVideos ?? true}
                        onChange={(e) => {
                          setPubs((prev) => ({
                            ...prev,
                            [plat.id]: { ...p, syncToVideos: e.target.checked },
                          }));
                          setPubsDirty(true);
                        }}
                        className="accent-(--ink)"
                      />
                      Load onto /videos
                    </label>
                    <select
                      value={p.videoCategory ?? "Speaking Challenge"}
                      aria-label={`${plat.label} /videos category`}
                      onChange={(e) => {
                        setPubs((prev) => ({
                          ...prev,
                          [plat.id]: { ...p, videoCategory: e.target.value },
                        }));
                        setPubsDirty(true);
                      }}
                      className="rounded-[4px] border border-(--rule) bg-(--paper) px-2 py-1 text-base sm:text-xs text-(--ink)"
                    >
                      {VIDEO_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <input
                  type="text"
                  aria-label={`${plat.label} caption`}
                  value={p.caption}
                  onChange={(e) => {
                    setPubs((prev) => ({
                      ...prev,
                      [plat.id]: { ...p, caption: e.target.value },
                    }));
                    setPubsDirty(true);
                  }}
                  placeholder="Caption / post text (optional)"
                  className="w-full rounded-[4px] border border-(--rule) bg-(--paper) px-2.5 py-2 text-base sm:text-xs text-(--ink)"
                />
                <input
                  type="text"
                  aria-label={`${plat.label} notes`}
                  value={p.notes}
                  onChange={(e) => {
                    setPubs((prev) => ({
                      ...prev,
                      [plat.id]: { ...p, notes: e.target.value },
                    }));
                    setPubsDirty(true);
                  }}
                  placeholder="Optional notes (e.g. feedback or conversation started)"
                  className="w-full rounded-[4px] border border-(--rule) bg-(--paper) px-2.5 py-2 text-base sm:text-xs text-(--ink)"
                />
              </div>
            );
          })}
        </div>

        {/* Practice-only, Public toggle, Audience interactions, and Complete Day CTA */}
        <div className="pt-4 border-t border-(--rule-2) flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-5">
            <label className="inline-flex items-center gap-2 text-xs text-(--ink) cursor-pointer">
              <input
                type="checkbox"
                checked={session.practiceOnly}
                onChange={(e) => updateSession({ practiceOnly: e.target.checked })}
                className="accent-(--ink)"
              />
              Mark as practice-only
            </label>
            <label className="inline-flex items-center gap-2 text-xs text-(--ink) cursor-pointer">
              <input
                type="checkbox"
                checked={session.isPublic}
                onChange={(e) => updateSession({ isPublic: e.target.checked })}
                className="accent-(--ink)"
              />
              Archive summary as public-ready
            </label>
            <label className="inline-flex items-center gap-2 text-xs text-(--ink-2)">
              Conversations logged:
              <input
                type="number"
                min={0}
                max={1000}
                value={session.audienceInteractionsCount || 0}
                onChange={(e) =>
                  updateSession({
                    audienceInteractionsCount: Number(e.target.value) || 0,
                  })
                }
                className="w-20 rounded-[4px] border border-(--rule) bg-(--bg) px-2 py-1.5 font-mono text-base sm:text-xs tabular-nums text-(--ink)"
              />
            </label>
          </div>

          <button
            type="button"
            onClick={() => void handleToggleComplete()}
            disabled={savingSection === "complete"}
            className={cn(
              "w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-[6px] px-5 py-3 min-h-[48px] text-sm font-medium cursor-pointer transition-all",
              session.status === "completed"
                ? "border border-(--good) bg-(--good)/15 text-(--good)"
                : "bg-(--ink) text-(--bg) hover:opacity-90"
            )}
          >
            {savingSection === "complete" ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : session.status === "completed" ? (
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Check className="h-4 w-4" aria-hidden="true" />
            )}
            {session.status === "completed"
              ? `Day ${day.dayNumber} Completed`
              : `Mark Day ${day.dayNumber} Complete`}
          </button>
        </div>
      </section>

      {stage === "publish" && (
        <div className="flex items-center justify-start pt-1">
          <button
            type="button"
            onClick={() => {
              setStage("review");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="inline-flex items-center justify-center gap-1.5 rounded-[6px] border border-(--rule) bg-(--paper) px-4 py-3 min-h-[46px] text-sm font-medium text-(--ink) cursor-pointer hover:border-(--ink)"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to Review
          </button>
        </div>
      )}
      </>
      )}

      {/* PART 12: DAY 90 SIGNATURE PRESENTATION & FINAL REPORT */}
      {showPublish && day.isFinalDay && (
        <section className="rounded-[6px] border border-(--ink) bg-(--paper) p-4 sm:p-7 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-(--rule-2)">
            <div>
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-(--ink-2)">
                Day 90 Capstone · 10-Minute Signature Talk
              </span>
              <h2 className="font-display text-2xl font-normal text-(--ink) mt-1 mb-0">
                Final Presentation & 90-Day Comparison
              </h2>
            </div>
            <button
              type="button"
              onClick={() => void persistDay90()}
              disabled={savingSection === "day90"}
              className="inline-flex items-center gap-1.5 rounded-[4px] bg-(--ink) text-(--bg) px-4 py-2 min-h-[38px] text-xs font-medium cursor-pointer"
            >
              {savingSection === "day90" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
              ) : (
                <Save className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              Save Day 90 Report
            </button>
          </div>

          {/* Day 1 vs Day 90 comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-[4px] border border-(--rule) bg-(--bg) p-4 space-y-2">
              <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-(--ink-2)">
                Day 1 Baseline · {day1Curriculum?.date}
              </div>
              <p className="font-display text-base text-(--ink) m-0">
                {day1Curriculum?.topic}
              </p>
              <p className="text-xs text-(--ink-2) m-0">
                Average score:{" "}
                {day1Assessment ? `${day1Assessment.averageScore.toFixed(2)} / 5` : "Not scored"}
              </p>
              {day1RecordingHref ? (
                <a
                  href={day1RecordingHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-(--ink) underline"
                >
                  Open Day 1 Recording
                  <ExternalLink className="h-3 w-3" aria-hidden="true" />
                </a>
              ) : (
                <p className="text-xs text-(--ink-2) m-0">No Day 1 recording link saved.</p>
              )}
              {day1Session?.reflectionWhatLearned && (
                <p className="text-xs text-(--ink-2) italic m-0">
                  &ldquo;{day1Session.reflectionWhatLearned}&rdquo;
                </p>
              )}
            </div>

            <div className="rounded-[4px] border border-(--rule) bg-(--bg) p-4 space-y-2">
              <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-(--ink-2)">
                Day 90 Summary (Actual Saved Data)
              </div>
              <div className="grid grid-cols-2 gap-2 font-mono text-xs tabular-nums">
                <div>Completed: {overallMetrics.daysCompleted} / 90</div>
                <div>Streak: {overallMetrics.currentStreak}d</div>
                <div>Minutes: {overallMetrics.totalSpeakingMinutes}</div>
                <div>
                  Avg score:{" "}
                  {overallMetrics.averageSpeakingScore !== null
                    ? overallMetrics.averageSpeakingScore.toFixed(2)
                    : "—"}
                </div>
              </div>
              {bestTalks.length > 0 && (
                <div className="pt-1">
                  <div className="font-mono text-[11px] uppercase text-(--ink-2) mb-1">
                    Highest-Rated Talks
                  </div>
                  <ul className="space-y-1 m-0 p-0 list-none text-xs">
                    {bestTalks.slice(0, 3).map((t) => (
                      <li key={t.day.dayNumber} className="text-(--ink-2) truncate">
                        Day {t.day.dayNumber}: {t.day.topic} ({t.averageScore.toFixed(2)})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="day90-outline"
              className="block font-mono text-[11px] uppercase tracking-[0.14em] text-(--ink)"
            >
              10-Minute Presentation Outline (Hook · Context · Main Ideas · Stories · Takeaway)
            </label>
            <textarea
              id="day90-outline"
              rows={6}
              value={day90Report.presentationOutline}
              onChange={(e) => {
                setDay90Report((prev) => ({
                  ...prev,
                  presentationOutline: e.target.value,
                }));
                setDay90Dirty(true);
              }}
              placeholder="Outline the arc of your 10-minute signature talk..."
              className="w-full rounded-[4px] border border-(--rule) bg-(--bg) p-3 text-base sm:text-sm text-(--ink)"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DAY90_QUESTIONS.map((q) => {
              const qId = `day90-${String(q.key)}`;
              return (
                <div key={q.key} className="space-y-1">
                  <label htmlFor={qId} className="block text-xs font-medium text-(--ink)">
                    {q.label}
                  </label>
                  <textarea
                    id={qId}
                    rows={2}
                    value={String(day90Report[q.key] ?? "")}
                    onChange={(e) => {
                      setDay90Report((prev) => ({ ...prev, [q.key]: e.target.value }));
                      setDay90Dirty(true);
                    }}
                    className="w-full rounded-[4px] border border-(--rule) bg-(--bg) p-2.5 text-base sm:text-sm text-(--ink)"
                  />
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Floating Unsaved Changes Action Pill */}
      {dirty && (
        <div className="sticky bottom-20 lg:bottom-4 z-30 flex items-center justify-between gap-3 rounded-[6px] border border-(--ink) bg-(--paper)/95 backdrop-blur-md px-4 py-3 shadow-lg">
          <span className="font-mono text-xs text-(--ink)">Unsaved changes</span>
          <button
            type="button"
            onClick={() =>
              void persistAllDirtySections().then(
                (ok) => ok && toast.success("All changes saved")
              )
            }
            disabled={savingSection !== null}
            className="inline-flex items-center gap-1.5 rounded-[4px] bg-(--ink) text-(--bg) px-4 py-2 min-h-[38px] text-xs font-medium cursor-pointer hover:opacity-90 disabled:opacity-50"
          >
            {savingSection === "all" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <Save className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            Save All
          </button>
        </div>
      )}
    </div>
  );
}
