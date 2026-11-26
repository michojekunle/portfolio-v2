"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ExternalLink, Search } from "lucide-react";
import { CURRICULUM_DAYS } from "@/lib/speaking/curriculum";
import {
  buildArchiveEntries,
  computeDimensionAverages,
  computeFirstVsLast30Days,
  computeProgressMetrics,
  computeWeeklyAnalytics,
  getBestTalks,
} from "@/lib/speaking/analytics";
import {
  AUDIENCE_OPTIONS,
  SCORECARD_DIMENSIONS,
} from "@/lib/speaking/methodology";
import { safeMediaOrExternalUrl } from "@/lib/speaking/url";
import type { SpeakingWorkspaceData } from "@/lib/speaking/types";
import { StatusBadge } from "./StatusBadge";
import { VideoReviewPanel } from "./VideoReviewPanel";

interface ProgressAnalyticsViewProps {
  data: SpeakingWorkspaceData;
}

export function ProgressAnalyticsView({
  data,
}: ProgressAnalyticsViewProps): React.ReactElement {
  const [search, setSearch] = useState("");
  const [phaseFilter, setPhaseFilter] = useState<string>("all");
  const [weekFilter, setWeekFilter] = useState<string>("all");
  const [recordingFilter, setRecordingFilter] = useState<string>("all");
  const [pubFilter, setPubFilter] = useState<string>("all");
  const [audienceFilter, setAudienceFilter] = useState<string>("all");

  const metrics = useMemo(
    () =>
      computeProgressMetrics({
        curriculum: CURRICULUM_DAYS,
        sessions: data.sessions,
        assessments: data.assessments,
        publications: data.publications,
        weeklyChallenges: data.weeklyChallenges,
        weeklyReviews: data.weeklyReviews,
        todayDateStr: data.todayDateStr,
      }),
    [data]
  );

  const assessmentList = useMemo(
    () => Object.values(data.assessments),
    [data.assessments]
  );

  const overallDims = useMemo(
    () => computeDimensionAverages(assessmentList),
    [assessmentList]
  );

  const { first30, last30 } = useMemo(
    () => computeFirstVsLast30Days(data.assessments),
    [data.assessments]
  );

  const weeklyRows = useMemo(
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

  const bestTalks = useMemo(
    () =>
      getBestTalks(CURRICULUM_DAYS, data.sessions, data.assessments, 5),
    [data.assessments, data.sessions]
  );

  const archive = useMemo(
    () =>
      buildArchiveEntries({
        curriculum: CURRICULUM_DAYS,
        sessions: data.sessions,
        assessments: data.assessments,
        publications: data.publications,
        todayDateStr: data.todayDateStr,
      }),
    [data]
  );

  const filteredArchive = useMemo(() => {
    const q = search.trim().toLowerCase();
    return archive.filter((item) => {
      if (phaseFilter !== "all" && String(item.day.phase) !== phaseFilter) return false;
      if (weekFilter !== "all" && String(item.day.weekNumber) !== weekFilter) return false;
      if (recordingFilter === "recorded" && !item.hasRecording) return false;
      if (recordingFilter === "unrecorded" && item.hasRecording) return false;
      if (pubFilter === "published" && !item.isPublished) return false;
      if (pubFilter === "unpublished" && item.isPublished) return false;
      if (
        audienceFilter !== "all" &&
        (item.session?.selectedAudience ?? item.day.recommendedAudience) !==
          audienceFilter
      ) {
        return false;
      }
      if (q) {
        return (
          item.day.topic.toLowerCase().includes(q) ||
          item.day.skill.toLowerCase().includes(q) ||
          item.day.date.includes(q) ||
          String(item.day.dayNumber) === q
        );
      }
      return true;
    });
  }, [
    archive,
    audienceFilter,
    phaseFilter,
    pubFilter,
    recordingFilter,
    search,
    weekFilter,
  ]);

  const primaryStats = [
    { label: "Days Completed", value: `${metrics.daysCompleted} / 90` },
    { label: "Streak", value: `${metrics.currentStreak} days` },
    { label: "Speaking Time", value: `${metrics.totalSpeakingMinutes} min` },
    {
      label: "Average Score",
      value:
        metrics.averageSpeakingScore !== null
          ? `${metrics.averageSpeakingScore.toFixed(2)} / 5`
          : "No scores",
    },
  ];

  const secondaryStats = [
    { label: "Recordings", value: String(metrics.numberOfRecordings) },
    { label: "Published", value: String(metrics.publishedVideosAndPosts) },
    { label: "Challenges", value: `${metrics.weeklyChallengesCompleted}/${metrics.totalWeeklyChallenges}` },
    { label: "Sessions", value: String(metrics.totalPracticeSessions) },
    { label: "Reviews", value: `${metrics.weeklyReviewsCompleted}/13` },
    { label: "Idea Sparks", value: String(data.ideas.length) },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      <header className="space-y-1.5 pb-4 sm:pb-6 border-b border-(--rule)">
        <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-(--ink-2)">
          Measured From Saved Data Only
        </div>
        <h1 className="font-display text-[clamp(1.65rem,3.5vw,2.75rem)] font-normal text-(--ink) m-0">
          Progress & Recording Archive
        </h1>
      </header>

      {/* Primary Hero Stats + Compact Secondary Strip */}
      <section className="space-y-2.5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
          {primaryStats.map((card) => (
            <div
              key={card.label}
              className="rounded-[6px] border border-(--rule) bg-(--paper) p-3.5 sm:p-4 space-y-1"
            >
              <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-(--ink-2)">
                {card.label}
              </div>
              <div className="font-display text-xl sm:text-2xl font-normal text-(--ink) tabular-nums">
                {card.value}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {secondaryStats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-[4px] border border-(--rule-2) bg-(--paper) px-3 py-2.5"
            >
              <div className="font-mono text-[11px] uppercase text-(--ink-2) truncate">
                {stat.label}
              </div>
              <div className="font-mono text-sm font-medium text-(--ink) tabular-nums">
                {stat.value}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7-Dimension Skill Development + First 30 vs Last 30 */}
      <section className="rounded-[6px] border border-(--rule) bg-(--paper) p-4 sm:p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-display text-lg sm:text-xl font-normal text-(--ink) m-0">
              Seven-Dimension Skill Development
            </h2>
            <p className="text-xs text-(--ink-2) mt-1 mb-0">
              Averages computed strictly from saved self-assessments.
            </p>
          </div>
          <span className="font-mono text-xs tabular-nums text-(--ink-2)">
            {overallDims.sampleCount} scored session{overallDims.sampleCount === 1 ? "" : "s"}
          </span>
        </div>

        {overallDims.sampleCount === 0 ? (
          <div className="rounded-[4px] border border-dashed border-(--rule) p-6 text-center text-sm text-(--ink-2)">
            No self-assessment scorecards saved yet. Score a session from 1–5 to begin tracking skill growth.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6">
              <div className="space-y-3">
                {SCORECARD_DIMENSIONS.map((dim) => {
                  const val = overallDims[dim.key] ?? 0;
                  const pct = (val / 5) * 100;
                  return (
                    <div key={dim.key} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-(--ink)">{dim.label}</span>
                        <span className="font-mono tabular-nums text-(--ink-2)">
                          {val.toFixed(2)} / 5.00
                        </span>
                      </div>
                      <div className="h-2 rounded-[2px] bg-(--bg-2) border border-(--rule) overflow-hidden">
                        <div
                          className="h-full bg-(--ink)"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="rounded-[4px] border border-(--rule) bg-(--bg) p-4 space-y-3">
                <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-(--ink-2)">
                  First 30 Days vs Last 30 Days
                </div>
                <div className="divide-y divide-(--rule-2) text-xs">
                  <div className="grid grid-cols-3 py-1.5 font-mono text-[11px] uppercase text-(--ink-2)">
                    <span>Dimension</span>
                    <span className="text-right">D1–30</span>
                    <span className="text-right">D61–90</span>
                  </div>
                  {SCORECARD_DIMENSIONS.map((dim) => (
                    <div key={dim.key} className="grid grid-cols-3 py-1.5 tabular-nums">
                      <span className="text-(--ink) truncate">{dim.label}</span>
                      <span className="text-right font-mono text-(--ink-2)">
                        {first30[dim.key] !== null ? first30[dim.key]!.toFixed(2) : "—"}
                      </span>
                      <span className="text-right font-mono text-(--ink)">
                        {last30[dim.key] !== null ? last30[dim.key]!.toFixed(2) : "—"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-(--rule-2) space-y-3 overflow-x-auto">
              <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-(--ink-2)">
                Weekly Dimension Progression (W1–W13)
              </div>
              <table className="w-full min-w-[560px] text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-(--rule) font-mono text-[11px] uppercase text-(--ink-2)">
                    <th className="py-1.5 pr-3 font-medium">Dimension</th>
                    {weeklyRows.map((w) => (
                      <th key={w.weekNumber} className="py-1.5 px-1.5 text-center font-medium tabular-nums">
                        W{w.weekNumber}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-(--rule-2)">
                  {SCORECARD_DIMENSIONS.map((dim) => (
                    <tr key={dim.key} className="tabular-nums">
                      <td className="py-1.5 pr-3 text-(--ink) font-medium">{dim.label}</td>
                      {weeklyRows.map((w) => {
                        const val = w.dimensions[dim.key];
                        return (
                          <td
                            key={w.weekNumber}
                            className="py-1.5 px-1.5 text-center font-mono text-[11px] text-(--ink-2)"
                          >
                            {val !== null ? val.toFixed(1) : "—"}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      {/* Weekly Breakdown + Top-Rated Talks */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-5">
        <section className="rounded-[6px] border border-(--rule) bg-(--paper) p-4 sm:p-6 space-y-4">
          <h2 className="font-display text-lg sm:text-xl font-normal text-(--ink) m-0">
            Weekly Breakdown
          </h2>

          {/* Mobile Week List (< md) */}
          <div className="md:hidden divide-y divide-(--rule-2)">
            {weeklyRows.map((w) => (
              <div key={w.weekNumber} className="py-3 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-(--ink) truncate">
                    <span className="font-mono text-(--ink-2) mr-1.5">W{w.weekNumber}</span>
                    {w.weekTitle}
                  </span>
                  <span
                    className={
                      w.challengeCompleted
                        ? "font-mono text-[11px] uppercase text-(--good) shrink-0"
                        : "font-mono text-[11px] uppercase text-(--ink-2) shrink-0"
                    }
                  >
                    {w.challengeCompleted ? "Done" : "Open"}
                  </span>
                </div>
                <div className="flex items-center gap-4 font-mono text-[11px] text-(--ink-2) tabular-nums">
                  <span>{w.completedDays}/{w.totalDays} days</span>
                  <span>Avg: {w.averageScore !== null ? w.averageScore.toFixed(2) : "—"}</span>
                  <span>Pub: {w.recordingsPublished}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table (md+) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-(--rule) font-mono text-[11px] uppercase tracking-[0.12em] text-(--ink-2)">
                  <th className="py-2 pr-3 font-medium">Week</th>
                  <th className="py-2 pr-3 font-medium">Done</th>
                  <th className="py-2 pr-3 font-medium">Avg Score</th>
                  <th className="py-2 pr-3 font-medium">Published</th>
                  <th className="py-2 font-medium">Challenge</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-(--rule-2)">
                {weeklyRows.map((w) => (
                  <tr key={w.weekNumber} className="tabular-nums">
                    <td className="py-2 pr-3 text-(--ink)">
                      <span className="font-mono text-(--ink-2) mr-1.5">W{w.weekNumber}</span>
                      {w.weekTitle}
                    </td>
                    <td className="py-2 pr-3 font-mono text-(--ink-2)">
                      {w.completedDays}/{w.totalDays}
                    </td>
                    <td className="py-2 pr-3 font-mono text-(--ink)">
                      {w.averageScore !== null ? w.averageScore.toFixed(2) : "—"}
                    </td>
                    <td className="py-2 pr-3 font-mono text-(--ink-2)">
                      {w.recordingsPublished}
                    </td>
                    <td className="py-2 font-mono text-[11px] uppercase">
                      {w.challengeCompleted ? (
                        <span className="text-(--good)">Done</span>
                      ) : (
                        <span className="text-(--ink-2)">Open</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-[6px] border border-(--rule) bg-(--paper) p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-display text-lg sm:text-xl font-normal text-(--ink) m-0">
              Top-Rated Talks
            </h2>
            <Link
              href="/speaking/day/90"
              className="font-mono text-[11px] uppercase tracking-[0.12em] text-(--ink-2) hover:text-(--ink) no-underline shrink-0"
            >
              Day 90 Report →
            </Link>
          </div>
          {bestTalks.length === 0 ? (
            <p className="text-sm text-(--ink-2) m-0">
              Top talks appear automatically once recordings are scored.
            </p>
          ) : (
            <div className="divide-y divide-(--rule-2)">
              {bestTalks.map((t) => (
                <Link
                  key={t.day.dayNumber}
                  href={`/speaking/day/${t.day.dayNumber}`}
                  className="block py-2.5 no-underline hover:underline"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-(--ink) truncate">
                      Day {t.day.dayNumber}: {t.day.topic}
                    </span>
                    <span className="font-mono text-xs tabular-nums text-(--ink) shrink-0">
                      {t.averageScore.toFixed(2)}
                    </span>
                  </div>
                  {t.whatLearned && (
                    <p className="text-[11px] text-(--ink-2) m-0 truncate">
                      {t.whatLearned}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Searchable, Filterable Recording & Session Archive */}
      <section className="rounded-[6px] border border-(--rule) bg-(--paper) p-4 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-display text-lg sm:text-xl font-normal text-(--ink) m-0">
              Recording & Session Archive
            </h2>
            <p className="text-xs text-(--ink-2) mt-0.5 mb-0">
              Filter by day, phase, week, recording, publication status, or audience.
            </p>
          </div>
          <span className="font-mono text-xs tabular-nums text-(--ink-2)">
            {filteredArchive.length} entries
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          <div className="relative sm:col-span-2 lg:col-span-3">
            <Search className="h-3.5 w-3.5 text-(--ink-2) absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search recording archive"
              placeholder="Search Day #, topic, skill, or YYYY-MM-DD..."
              className="w-full rounded-[4px] border border-(--rule) bg-(--bg) pl-9 pr-3 py-2.5 text-base sm:text-xs text-(--ink)"
            />
          </div>
          <select
            value={phaseFilter}
            onChange={(e) => setPhaseFilter(e.target.value)}
            aria-label="Filter by phase"
            className="rounded-[4px] border border-(--rule) bg-(--bg) px-3 py-2 min-h-[40px] text-base sm:text-xs text-(--ink)"
          >
            <option value="all">All phases</option>
            <option value="1">Phase 1</option>
            <option value="2">Phase 2</option>
            <option value="3">Phase 3</option>
          </select>
          <select
            value={weekFilter}
            onChange={(e) => setWeekFilter(e.target.value)}
            aria-label="Filter by week"
            className="rounded-[4px] border border-(--rule) bg-(--bg) px-3 py-2 min-h-[40px] text-base sm:text-xs text-(--ink)"
          >
            <option value="all">All weeks</option>
            {Array.from({ length: 13 }, (_, i) => i + 1).map((wn) => (
              <option key={wn} value={String(wn)}>
                Week {wn}
              </option>
            ))}
          </select>
          <select
            value={recordingFilter}
            onChange={(e) => setRecordingFilter(e.target.value)}
            aria-label="Filter by recording status"
            className="rounded-[4px] border border-(--rule) bg-(--bg) px-3 py-2 min-h-[40px] text-base sm:text-xs text-(--ink)"
          >
            <option value="all">Any recording status</option>
            <option value="recorded">Has recording</option>
            <option value="unrecorded">No recording yet</option>
          </select>
          <select
            value={pubFilter}
            onChange={(e) => setPubFilter(e.target.value)}
            aria-label="Filter by publication status"
            className="rounded-[4px] border border-(--rule) bg-(--bg) px-3 py-2 min-h-[40px] text-base sm:text-xs text-(--ink)"
          >
            <option value="all">Publication: Any</option>
            <option value="published">Published</option>
            <option value="unpublished">Unpublished</option>
          </select>
          <select
            value={audienceFilter}
            onChange={(e) => setAudienceFilter(e.target.value)}
            aria-label="Filter by audience"
            className="rounded-[4px] border border-(--rule) bg-(--bg) px-3 py-2 min-h-[40px] text-base sm:text-xs text-(--ink)"
          >
            <option value="all">Audience: All</option>
            {AUDIENCE_OPTIONS.map((a) => (
              <option key={a.id} value={a.id}>
                {a.label}
              </option>
            ))}
          </select>
        </div>

        <div className="divide-y divide-(--rule-2) max-h-[540px] overflow-y-auto">
          {filteredArchive.map((item) => {
            const safeUrl = safeMediaOrExternalUrl(item.recordingUrl);
            return (
              <div
                key={item.day.dayNumber}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs tabular-nums text-(--ink-2) w-12 shrink-0">
                      D{String(item.day.dayNumber).padStart(2, "0")}
                    </span>
                    <Link
                      href={`/speaking/day/${item.day.dayNumber}`}
                      className="text-sm font-medium text-(--ink) hover:underline no-underline truncate"
                    >
                      {item.day.topic}
                    </Link>
                  </div>
                  <div className="font-mono text-[11px] text-(--ink-2) sm:pl-[56px] tabular-nums">
                    {item.day.date} · {item.day.skill} · P{item.day.phase}/W{item.day.weekNumber}
                    {item.assessment ? ` · Score ${item.assessment.averageScore.toFixed(2)}` : ""}
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  {safeUrl && (
                    <a
                      href={safeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-[4px] border border-(--rule) px-2.5 py-1.5 font-mono text-[11px] text-(--ink) no-underline hover:bg-(--bg-2)"
                    >
                      Recording
                      <ExternalLink className="h-3 w-3" aria-hidden="true" />
                    </a>
                  )}
                  <StatusBadge status={item.status} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Owner Review & Removal Queue for /videos */}
      <VideoReviewPanel initialVideos={data.siteVideos} />
    </div>
  );
}
