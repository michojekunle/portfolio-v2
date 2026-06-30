import {
  getReadingStats,
  getOrCreateGoal,
  getHeatmapData,
  getUserAchievements,
} from "@/lib/chapterly/queries";
import { formatReadingTime } from "@/lib/chapterly/streak";
import { BADGE_DEFS } from "@/lib/chapterly/achievements";
import { HeatmapCalendar } from "@/components/chapterly/HeatmapCalendar";
import { AchievementGrid } from "@/components/chapterly/AchievementGrid";
import { BookOpen, Clock, Flame, TrendingUp, Target, Award } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Chapterly — Stats" };

const ACCENT = "#4F6D7A";

export default async function StatsPage(): Promise<React.ReactElement> {
  const [stats, goal, heatmapData, achievements] = await Promise.all([
    getReadingStats(),
    getOrCreateGoal(),
    getHeatmapData(),
    getUserAchievements(),
  ]);

  const annualGoal = goal?.annual_books ?? 12;
  const annualProgress = Math.min(100, Math.round((stats.books_this_year / annualGoal) * 100));
  const earnedCount = achievements.length;
  const totalBadges = Object.keys(BADGE_DEFS).length;

  return (
    <div className="px-[40px] pt-[48px] pb-[48px] max-[1024px]:pt-[80px] max-[720px]:px-[24px] max-[720px]:pb-[32px] max-w-[1000px]">
      <div className="mb-[40px]">
        <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-[var(--ink-3)] mb-[6px]">
          Your reading data
        </div>
        <h1 className="font-display text-[32px] font-normal tracking-[-0.02em] fvs-text text-[var(--ink)] m-0 leading-[1.1]">
          Stats
        </h1>
      </div>

      {/* ── Streak & annual goal ── */}
      <div className="grid grid-cols-2 max-[600px]:grid-cols-1 gap-[20px] mb-[24px]">
        <div className="rounded-[16px] p-[28px] border border-[var(--rule)] bg-[var(--bg-2)]">
          <div className="flex items-center gap-[10px] mb-[16px]" style={{ color: "#EA580C" }}>
            <Flame size={18} />
            <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-[var(--ink-3)]">
              Streak
            </span>
          </div>
          <div className="text-[48px] font-bold leading-[1] text-[var(--ink)]">
            {stats.current_streak}
            <span className="text-[18px] font-normal text-[var(--ink-3)] ml-[6px]">days</span>
          </div>
          <div className="font-mono text-[11px] text-[var(--ink-3)] mt-[8px]">
            Best: {stats.longest_streak} days
          </div>
        </div>

        <div className="rounded-[16px] p-[28px] border border-[var(--rule)] bg-[var(--bg-2)]">
          <div className="flex items-center gap-[10px] mb-[16px]" style={{ color: ACCENT }}>
            <Target size={18} />
            <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-[var(--ink-3)]">
              Annual Goal
            </span>
          </div>
          <div className="text-[48px] font-bold leading-[1] text-[var(--ink)]">
            {stats.books_this_year}
            <span className="text-[24px] text-[var(--ink-3)]"> / {annualGoal}</span>
          </div>
          <div className="mt-[12px] h-[6px] rounded-full bg-[var(--rule)]">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${annualProgress}%`, background: `linear-gradient(90deg, ${ACCENT}, #6B8FA0)` }}
            />
          </div>
          <div className="font-mono text-[10px] text-[var(--ink-3)] mt-[6px]">
            {annualProgress}% complete
          </div>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-3 max-[700px]:grid-cols-2 max-[400px]:grid-cols-2 gap-[16px] mb-[32px]">
        {(
          [
            {
              icon: <BookOpen size={16} />,
              label: "Total Books",
              value: String(stats.total_books),
              sub: `${stats.finished_books} finished`,
            },
            {
              icon: <Clock size={16} />,
              label: "Total Time",
              value: formatReadingTime(stats.total_reading_time_minutes),
              sub: "all time",
            },
            {
              icon: <TrendingUp size={16} />,
              label: "Pages Read",
              value: stats.total_pages_read.toLocaleString(),
              sub: "all time",
            },
            {
              icon: <Clock size={16} />,
              label: "Today",
              value: formatReadingTime(stats.reading_time_today),
              sub: `goal: ${goal?.daily_minutes ?? 15}m`,
            },
            {
              icon: <Clock size={16} />,
              label: "This Week",
              value: formatReadingTime(stats.reading_time_this_week),
              sub: "last 7 days",
            },
            {
              icon: <Award size={16} />,
              label: "Badges",
              value: String(earnedCount),
              sub: `of ${totalBadges} earned`,
            },
          ] as const
        ).map((s) => (
          <div
            key={s.label}
            className="rounded-[12px] p-[20px] border border-[var(--rule)] bg-[var(--bg-2)]"
          >
            <div className="flex items-center gap-[8px] mb-[10px]" style={{ color: ACCENT }}>
              {s.icon}
              <span className="font-mono text-[9px] tracking-[0.12em] uppercase text-[var(--ink-3)]">
                {s.label}
              </span>
            </div>
            <div className="text-[28px] font-bold leading-[1] text-[var(--ink)]">{s.value}</div>
            <div className="font-mono text-[10px] text-[var(--ink-3)] mt-[4px]">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Activity heatmap (real data) ── */}
      <div className="rounded-[16px] p-[28px] border border-[var(--rule)] bg-[var(--bg-2)] mb-[32px]">
        <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-[var(--ink-3)] mb-[20px]">
          Reading Activity — Last 12 Months
        </div>
        <HeatmapCalendar data={heatmapData} />
      </div>

      {/* ── Achievements ── */}
      <div className="rounded-[16px] p-[28px] border border-[var(--rule)] bg-[var(--bg-2)]">
        <div className="flex items-center justify-between mb-[20px]">
          <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-[var(--ink-3)]">
            Achievements
          </div>
          <span
            className="font-mono text-[9px] tracking-[0.1em] uppercase px-[8px] py-[3px] rounded-full"
            style={{ background: ACCENT + "15", color: ACCENT }}
          >
            {earnedCount} / {totalBadges}
          </span>
        </div>
        <AchievementGrid earned={achievements} />
      </div>
    </div>
  );
}
