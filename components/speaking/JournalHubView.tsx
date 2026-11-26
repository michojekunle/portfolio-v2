"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText,
  Lightbulb,
  Loader2,
  NotebookPen,
  Save,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { CURRICULUM_DAYS, getWeekDays } from "@/lib/speaking/curriculum";
import { computeWeeklyAnalytics } from "@/lib/speaking/analytics";
import { buildWeeklyArticleDraft } from "@/lib/speaking/content-bridge";
import { formatMonthShort } from "@/lib/speaking/dates";
import {
  getWeekMetaForDay,
  WEEKLY_CHALLENGES,
  WEEKLY_REVIEW_QUESTIONS,
} from "@/lib/speaking/methodology";
import type {
  IdeaBankItem,
  SpeakingWorkspaceData,
  WeeklyReviewRecord,
} from "@/lib/speaking/types";
import { IdeaBankManager } from "./IdeaBankDrawer";
import { cn } from "@/lib/utils";

interface JournalHubViewProps {
  data: SpeakingWorkspaceData;
  initialTab?: string;
  initialWeek?: number;
}

type HubTab = "journal" | "ideas" | "reviews";

function emptyWeeklyReview(weekNumber: number): WeeklyReviewRecord {
  return {
    weekNumber,
    strongestRecording: "",
    weakestRecording: "",
    speakingHabit: "",
    whatImproved: "",
    stillStruggling: "",
    mostInterestingIdea: "",
    connectedWithSomeone: "",
    nextWeekFocus: "",
    audienceInteractions: 0,
    weeklyArticleTitle: "",
    weeklyArticleBody: "",
    weeklyArticleSlug: "",
    reflection: "",
    submittedAt: null,
    updatedAt: null,
  };
}

export function JournalHubView({
  data,
  initialTab = "journal",
  initialWeek,
}: JournalHubViewProps): React.ReactElement {
  const router = useRouter();
  const defaultTab: HubTab =
    initialTab === "ideas" || initialTab === "reviews" ? initialTab : "journal";
  const currentWeek = getWeekMetaForDay(data.activeDayNumber).weekNumber;

  const [tab, setTab] = useState<HubTab>(defaultTab);
  const [ideas, setIdeas] = useState<IdeaBankItem[]>(data.ideas);
  const [selectedWeek, setSelectedWeek] = useState<number>(
    initialWeek && initialWeek >= 1 && initialWeek <= 13 ? initialWeek : currentWeek
  );
  const [reviews, setReviews] = useState<Record<number, WeeklyReviewRecord>>(
    data.weeklyReviews
  );
  const [savingReview, setSavingReview] = useState(false);
  const [exportingArticle, setExportingArticle] = useState(false);
  const [exportedEditorUrl, setExportedEditorUrl] = useState<string | null>(null);

  const weeklyAnalytics = useMemo(
    () =>
      computeWeeklyAnalytics({
        curriculum: CURRICULUM_DAYS,
        sessions: data.sessions,
        assessments: data.assessments,
        publications: data.publications,
        weeklyChallenges: data.weeklyChallenges,
      }),
    [data]
  );

  const journalEntries = useMemo(() => {
    return CURRICULUM_DAYS.filter((day) => {
      const s = data.sessions[day.dayNumber];
      if (!s) return false;
      return Boolean(
        s.reflectionWhatWorked.trim() ||
          s.reflectionWhatLearned.trim() ||
          s.dailyLearningSummary.trim() ||
          s.premPoint.trim() ||
          s.reflectionNotes.trim()
      );
    }).reverse();
  }, [data.sessions]);

  const activeReview: WeeklyReviewRecord =
    reviews[selectedWeek] ?? emptyWeeklyReview(selectedWeek);
  const weekStats = weeklyAnalytics.find((w) => w.weekNumber === selectedWeek);
  const weekMeta = WEEKLY_CHALLENGES.find((w) => w.weekNumber === selectedWeek)!;
  const nextWeekDays =
    selectedWeek < 13 ? getWeekDays(selectedWeek + 1) : [];

  const updateActiveReview = (patch: Partial<WeeklyReviewRecord>): void => {
    setReviews((prev) => ({
      ...prev,
      [selectedWeek]: {
        ...activeReview,
        ...patch,
      },
    }));
  };

  const handleSaveWeeklyReview = async (): Promise<void> => {
    setSavingReview(true);
    try {
      const res = await fetch("/api/speaking/weekly", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "review",
          ...activeReview,
          completedDays: weekStats?.completedDays ?? 0,
          averageScore: weekStats?.averageScore ?? null,
          submit: true,
        }),
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Failed to save weekly review");
      updateActiveReview({ submittedAt: new Date().toISOString() });
      toast.success(`Week ${selectedWeek} review saved`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save review");
    } finally {
      setSavingReview(false);
    }
  };

  const handleGenerateWeeklyArticle = (): void => {
    const draft = buildWeeklyArticleDraft({
      weekNumber: selectedWeek,
      weekTitle: weekMeta.weekTitle,
      days: getWeekDays(selectedWeek),
      sessions: data.sessions,
      portfolioContext: data.portfolioContext,
    });
    updateActiveReview({
      weeklyArticleTitle: draft.title,
      weeklyArticleSlug: draft.slug,
      weeklyArticleBody: draft.content,
    });
    toast.success("Weekly short-form article draft generated");
  };

  const handleExportToBlog = async (): Promise<void> => {
    if (!activeReview.weeklyArticleTitle.trim() || !activeReview.weeklyArticleBody.trim()) {
      toast.error("Generate or write the weekly article first.");
      return;
    }
    setExportingArticle(true);
    try {
      const res = await fetch("/api/speaking/export-article", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: activeReview.weeklyArticleTitle,
          slug:
            activeReview.weeklyArticleSlug ||
            `speaking-week-${selectedWeek}`,
          excerpt: `Week ${selectedWeek} synthesis from 90 Days of Speaking: ${weekMeta.weekTitle}`,
          content: activeReview.weeklyArticleBody,
          category: "Speaking & Ideas",
        }),
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Export failed");
      setExportedEditorUrl(resData.editorUrl);
      toast.success("Saved as unpublished draft in Blog CMS");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not export draft");
    } finally {
      setExportingArticle(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <header className="space-y-2 pb-4 sm:pb-6 border-b border-(--rule)">
        <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-(--ink-2)">
          Reflections · Idea Bank · Weekly Synthesis
        </div>
        <h1 className="font-display text-[clamp(1.65rem,3.5vw,2.75rem)] font-normal text-(--ink) m-0">
          Journal & Ideas
        </h1>
      </header>

      {/* OPay-style Single-Row Segmented Tab Bar */}
      <div
        role="tablist"
        aria-label="Journal workspace sections"
        className="grid grid-cols-3 gap-1.5 rounded-[6px] border border-(--rule) bg-(--paper) p-1"
      >
        {[
          { id: "journal" as HubTab, label: `Journal (${journalEntries.length})`, icon: NotebookPen },
          { id: "ideas" as HubTab, label: `Ideas (${ideas.length})`, icon: Lightbulb },
          { id: "reviews" as HubTab, label: "Weekly", icon: FileText },
        ].map((item) => {
          const Icon = item.icon;
          const selected = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setTab(item.id)}
              className={cn(
                "inline-flex items-center justify-center gap-1.5 rounded-[4px] px-2.5 py-2.5 min-h-[40px] text-xs font-medium cursor-pointer transition-colors whitespace-nowrap",
                selected
                  ? "bg-(--ink) text-(--bg)"
                  : "text-(--ink-2) hover:text-(--ink)"
              )}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: SPEAKING JOURNAL */}
      {tab === "journal" && (
        <div role="tabpanel" className="space-y-4">
          {journalEntries.length === 0 ? (
            <div className="rounded-[6px] border border-dashed border-(--rule) p-8 sm:p-10 text-center space-y-2">
              <p className="font-display text-lg text-(--ink) m-0">
                Your speaking journal is ready for Day 1.
              </p>
              <p className="text-sm text-(--ink-2) m-0">
                As you save PREM notes, daily learnings, and reflections, they assemble here chronologically.
              </p>
            </div>
          ) : (
            journalEntries.map((day) => {
              const s = data.sessions[day.dayNumber];
              const a = data.assessments[day.dayNumber];
              return (
                <article
                  key={day.dayNumber}
                  className="rounded-[6px] border border-(--rule) bg-(--paper) p-4 sm:p-6 space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-(--ink-2) tabular-nums">
                      Day {day.dayNumber} · {formatMonthShort(day.date)} · {day.skill}
                    </div>
                    <div className="flex items-center gap-3">
                      {a && (
                        <span className="font-mono text-xs tabular-nums text-(--ink)">
                          Score: {a.averageScore.toFixed(2)} / 5
                        </span>
                      )}
                      <Link
                        href={`/speaking/day/${day.dayNumber}`}
                        className="font-mono text-xs text-(--ink) hover:underline no-underline"
                      >
                        Edit →
                      </Link>
                    </div>
                  </div>
                  <h2 className="font-display text-lg sm:text-xl font-normal text-(--ink) m-0">
                    {day.topic}
                  </h2>
                  {s.premPoint && (
                    <p className="text-sm text-(--ink) m-0 break-words">
                      <strong>Point:</strong> {s.premPoint}
                    </p>
                  )}
                  {s.dailyLearningSummary && (
                    <p className="text-sm text-(--ink-2) m-0 break-words">
                      <strong>Daily Learning:</strong> {s.dailyLearningSummary}
                    </p>
                  )}
                  {s.reflectionWhatLearned && (
                    <p className="text-sm text-(--ink-2) m-0 break-words">
                      <strong>What I learned:</strong> {s.reflectionWhatLearned}
                    </p>
                  )}
                </article>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: IDEA BANK */}
      {tab === "ideas" && (
        <div role="tabpanel">
          <IdeaBankManager ideas={ideas} onIdeasChange={setIdeas} />
        </div>
      )}

      {/* TAB 3: WEEKLY REVIEWS & SHORT-FORM ARTICLES */}
      {tab === "reviews" && (
        <div role="tabpanel" className="space-y-5">
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Select week">
            {WEEKLY_CHALLENGES.map((w) => (
              <button
                key={w.weekNumber}
                type="button"
                aria-pressed={selectedWeek === w.weekNumber}
                onClick={() => {
                  setSelectedWeek(w.weekNumber);
                  setExportedEditorUrl(null);
                }}
                className={cn(
                  "rounded-[4px] border px-3 py-2 min-h-[40px] font-mono text-xs tabular-nums cursor-pointer transition-colors",
                  selectedWeek === w.weekNumber
                    ? "border-(--ink) bg-(--ink) text-(--bg)"
                    : reviews[w.weekNumber]?.submittedAt
                    ? "border-(--good)/50 bg-(--good)/10 text-(--good)"
                    : "border-(--rule) bg-(--paper) text-(--ink-2)"
                )}
              >
                W{w.weekNumber}
              </button>
            ))}
          </div>

          <section className="rounded-[6px] border border-(--rule) bg-(--paper) p-4 sm:p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-(--rule-2)">
              <div>
                <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-(--ink-2) tabular-nums">
                  Week {selectedWeek} Review · Days {weekMeta.dayRange[0]}–{weekMeta.dayRange[1]}
                </div>
                <h2 className="font-display text-xl sm:text-2xl font-normal text-(--ink) mt-1 mb-0">
                  {weekMeta.weekTitle}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => void handleSaveWeeklyReview()}
                disabled={savingReview}
                className="inline-flex items-center justify-center gap-1.5 rounded-[4px] bg-(--ink) text-(--bg) px-4 py-2.5 min-h-[42px] text-xs font-medium cursor-pointer disabled:opacity-50"
              >
                {savingReview ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                ) : (
                  <Save className="h-3.5 w-3.5" aria-hidden="true" />
                )}
                Save Weekly Review
              </button>
            </div>

            {weekStats && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="rounded-[4px] border border-(--rule-2) bg-(--bg) p-3">
                  <div className="font-mono text-base tabular-nums text-(--ink)">
                    {weekStats.completedDays}/{weekStats.totalDays}
                  </div>
                  <div className="font-mono text-[11px] uppercase text-(--ink-2)">Completed</div>
                </div>
                <div className="rounded-[4px] border border-(--rule-2) bg-(--bg) p-3">
                  <div className="font-mono text-base tabular-nums text-(--ink)">
                    {weekStats.incompleteDays}
                  </div>
                  <div className="font-mono text-[11px] uppercase text-(--ink-2)">Incomplete</div>
                </div>
                <div className="rounded-[4px] border border-(--rule-2) bg-(--bg) p-3">
                  <div className="font-mono text-base tabular-nums text-(--ink)">
                    {weekStats.averageScore !== null ? weekStats.averageScore.toFixed(2) : "—"}
                  </div>
                  <div className="font-mono text-[11px] uppercase text-(--ink-2)">Avg Score</div>
                </div>
                <div className="rounded-[4px] border border-(--rule-2) bg-(--bg) p-3">
                  <div className="font-mono text-base tabular-nums text-(--ink)">
                    {weekStats.bestRecordingDay ? `D${weekStats.bestRecordingDay.dayNumber}` : "—"}
                  </div>
                  <div className="font-mono text-[11px] uppercase text-(--ink-2)">Best Rated</div>
                </div>
                <div className="rounded-[4px] border border-(--rule-2) bg-(--bg) p-3">
                  <div className="font-mono text-base tabular-nums text-(--ink)">
                    {weekStats.weakestRecordingDay ? `D${weekStats.weakestRecordingDay.dayNumber}` : "—"}
                  </div>
                  <div className="font-mono text-[11px] uppercase text-(--ink-2)">Weakest Rated</div>
                </div>
                <div className="rounded-[4px] border border-(--rule-2) bg-(--bg) p-3">
                  <div className="font-mono text-base tabular-nums text-(--ink)">
                    {weekStats.recordingsPublished}
                  </div>
                  <div className="font-mono text-[11px] uppercase text-(--ink-2)">Published</div>
                </div>
                <div className="rounded-[4px] border border-(--rule-2) bg-(--bg) p-3">
                  <div className="font-mono text-base tabular-nums text-(--ink)">
                    {activeReview.audienceInteractions || weekStats.audienceInteractions}
                  </div>
                  <div className="font-mono text-[11px] uppercase text-(--ink-2)">Interactions</div>
                </div>
                <div className="rounded-[4px] border border-(--rule-2) bg-(--bg) p-3">
                  <div className="font-mono text-base tabular-nums text-(--ink)">
                    {weekStats.challengeCompleted ? "Done" : "Open"}
                  </div>
                  <div className="font-mono text-[11px] uppercase text-(--ink-2)">Challenge</div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {WEEKLY_REVIEW_QUESTIONS.map((q) => {
                const inputId = `weekly-${selectedWeek}-${q.key}`;
                return (
                  <div key={q.key} className="space-y-1">
                    <label htmlFor={inputId} className="block text-xs font-medium text-(--ink)">
                      {q.label}
                    </label>
                    <textarea
                      id={inputId}
                      rows={2}
                      value={String(activeReview[q.key] ?? "")}
                      onChange={(e) =>
                        updateActiveReview({ [q.key]: e.target.value })
                      }
                      className="w-full rounded-[4px] border border-(--rule) bg-(--bg) p-2.5 text-base sm:text-sm text-(--ink)"
                    />
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label
                  htmlFor={`weekly-${selectedWeek}-interactions`}
                  className="block text-xs font-medium text-(--ink)"
                >
                  Audience interactions logged this week
                </label>
                <input
                  id={`weekly-${selectedWeek}-interactions`}
                  type="number"
                  min={0}
                  value={activeReview.audienceInteractions || 0}
                  onChange={(e) =>
                    updateActiveReview({
                      audienceInteractions: Number(e.target.value) || 0,
                    })
                  }
                  className="w-36 rounded-[4px] border border-(--rule) bg-(--bg) px-3 py-2 font-mono text-base sm:text-xs tabular-nums text-(--ink)"
                />
              </div>
              <div className="space-y-1">
                <label
                  htmlFor={`weekly-${selectedWeek}-reflection`}
                  className="block text-xs font-medium text-(--ink)"
                >
                  Overall Written Weekly Reflection
                </label>
                <textarea
                  id={`weekly-${selectedWeek}-reflection`}
                  rows={2}
                  value={activeReview.reflection}
                  onChange={(e) => updateActiveReview({ reflection: e.target.value })}
                  className="w-full rounded-[4px] border border-(--rule) bg-(--bg) p-2.5 text-base sm:text-sm text-(--ink)"
                />
              </div>
            </div>

            <div className="pt-5 border-t border-(--rule-2) space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-display text-lg font-normal text-(--ink) m-0">
                    Weekly Short-Form Article Draft
                  </h3>
                  <p className="text-xs text-(--ink-2) mt-0.5 mb-0">
                    Synthesize this week&apos;s notes and export as an unpublished draft to Field Notes.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleGenerateWeeklyArticle}
                    className="inline-flex items-center gap-1.5 rounded-[4px] border border-(--rule) bg-(--bg) px-3 py-2 min-h-[40px] text-xs font-medium text-(--ink) cursor-pointer hover:border-(--ink)"
                  >
                    <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                    Generate Draft
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleExportToBlog()}
                    disabled={exportingArticle}
                    className="inline-flex items-center gap-1.5 rounded-[4px] bg-(--ink) text-(--bg) px-3 py-2 min-h-[40px] text-xs font-medium cursor-pointer disabled:opacity-50"
                  >
                    {exportingArticle ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                    ) : (
                      <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                    )}
                    Save to Blog CMS
                  </button>
                </div>
              </div>

              {exportedEditorUrl && (
                <div className="rounded-[4px] border border-(--good)/40 bg-(--good)/10 px-4 py-2.5 flex items-center justify-between gap-3 text-xs text-(--ink)">
                  <span>Draft saved to Field Notes (unpublished).</span>
                  <Link
                    href={exportedEditorUrl}
                    className="inline-flex items-center gap-1 font-medium text-(--ink) underline shrink-0"
                  >
                    Open Editor
                    <ExternalLink className="h-3 w-3" aria-hidden="true" />
                  </Link>
                </div>
              )}

              <input
                type="text"
                aria-label="Weekly article title"
                value={activeReview.weeklyArticleTitle}
                onChange={(e) =>
                  updateActiveReview({ weeklyArticleTitle: e.target.value })
                }
                placeholder="Weekly short-form article title..."
                className="w-full rounded-[4px] border border-(--rule) bg-(--bg) px-3 py-2.5 text-base sm:text-sm text-(--ink)"
              />
              <textarea
                rows={7}
                aria-label="Weekly article markdown draft"
                value={activeReview.weeklyArticleBody}
                onChange={(e) =>
                  updateActiveReview({ weeklyArticleBody: e.target.value })
                }
                placeholder="Markdown draft combining your week's lessons, PREM insights, and links to projects/books..."
                className="w-full rounded-[4px] border border-(--rule) bg-(--bg) p-3 font-mono text-base sm:text-xs text-(--ink) leading-relaxed"
              />
            </div>

            {nextWeekDays.length > 0 && (
              <div className="pt-5 border-t border-(--rule-2) space-y-3">
                <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-(--ink-2)">
                  Preview: Week {selectedWeek + 1} Topics
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {nextWeekDays.map((d) => (
                    <Link
                      key={d.dayNumber}
                      href={`/speaking/day/${d.dayNumber}`}
                      className="rounded-[4px] border border-(--rule-2) bg-(--bg) px-3 py-2.5 min-h-[44px] text-xs text-(--ink) no-underline hover:border-(--ink) flex items-center justify-between gap-2 min-w-0"
                    >
                      <span className="truncate">
                        <span className="font-mono text-(--ink-2) mr-2 tabular-nums">
                          D{d.dayNumber}
                        </span>
                        {d.topic}
                      </span>
                      <span className="font-mono text-[11px] text-(--ink-2) shrink-0">
                        {d.skill}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
