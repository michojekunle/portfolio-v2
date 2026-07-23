import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getUserBooks,
  getReadingStats,
  getOrCreateGoal,
} from "@/lib/chapterly/queries";
import {
  goalProgressPct,
  formatReadingTime,
  isStreakAlive,
  isStreakFrozen,
} from "@/lib/chapterly/streak";
import { FREE_BOOK_LIMIT } from "@/lib/chapterly/types";
import {
  BookMarked,
  Flame,
  Target,
  Clock,
  BookOpen,
  Plus,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import type { Metadata } from "next";
import { ChLearningPlanClient } from "@/components/chapterly/LearningPlanClient";
import { DailyInsightCard } from "@/components/chapterly/DailyInsightCard";
import { FreezeStreakButton } from "@/components/chapterly/FreezeStreakButton";

export const metadata: Metadata = {
  title: "Chapterly — Home",
};

const ACCENT = "var(--ch-accent)";
const STATUS_LABELS: Record<string, string> = {
  unread: "Unread",
  reading: "Reading",
  finished: "Finished",
  abandoned: "Abandoned",
  on_hold: "On Hold",
};

export default async function ChapterlyHomePage(): Promise<React.ReactElement> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [books, stats, goal] = await Promise.all([
    getUserBooks(),
    getReadingStats(),
    getOrCreateGoal(),
  ]);

  if (!goal || !goal.onboarded) {
    redirect("/tools/chapterly/onboarding");
  }

  const currentBook =
    books.find((b) => b.status === "reading") ?? books[0] ?? null;
  const recentBooks = books.slice(0, 4);
  const dailyProgress = goal
    ? goalProgressPct(stats.reading_time_today, goal.daily_minutes)
    : 0;
  const streakActive = goal ? isStreakAlive(goal) : false;
  const streakFrozen = goal ? isStreakFrozen(goal) : false;
  const isFreeAtLimit = books.length >= FREE_BOOK_LIMIT;

  return (
    <div className="px-10 pt-12 pb-12 max-256:pt-20 max-180:px-6 max-180:pb-8 max-w-[1200px]">
      {/* ── Header ── */}
      <div className="mb-12">
        <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted-foreground mb-2">
          Good {getGreeting()}, {user?.email?.split("@")[0]}
        </div>
        <h1 className="font-display text-[36px] max-180:text-[28px] font-normal tracking-[-0.02em] fvs-text text-(--ink) m-0 leading-[1.1]">
          Your Reading OS
        </h1>
      </div>

      {/* ── Daily Insight ── */}
      <DailyInsightCard />

      {/* ── Stats strip ── */}
      <div className="grid grid-cols-4 max-[900px]:grid-cols-2 max-[480px]:grid-cols-2 gap-4 mb-10">
        <StatCard
          icon={<BookOpen size={18} />}
          label="Books"
          value={`${stats.total_books}`}
          sub={`${stats.finished_books} finished`}
          color={ACCENT}
        />
        <StatCard
          icon={<Clock size={18} />}
          label="Today"
          value={formatReadingTime(stats.reading_time_today)}
          sub={`Goal: ${goal?.daily_minutes ?? 15}m`}
          color={ACCENT}
          highlight={dailyProgress >= 100}
        />
        <StatCard
          icon={<Flame size={18} />}
          label="Streak"
          value={`${stats.current_streak}`}
          sub={streakFrozen ? "frozen" : streakActive ? "active" : "start today"}
          color={streakFrozen ? "#0EA5E9" : "#EA580C"}
          highlight={streakActive && stats.current_streak > 0}
        />
        <StatCard
          icon={<TrendingUp size={18} />}
          label="This Year"
          value={`${stats.books_this_year}`}
          sub={`of ${goal?.annual_books ?? 12} goal`}
          color={ACCENT}
        />
      </div>

      {/* ── Streak freeze ── */}
      {goal && stats.current_streak > 0 && (
        <div className="mb-10 -mt-6">
          <FreezeStreakButton
            frozenUntil={goal.streak_freeze_until}
            freezesUsed={goal.streak_freeze_count ?? 0}
            freezesMax={4}
          />
        </div>
      )}

      {/* ── Daily goal ring + current book ── */}
      <div className="grid grid-cols-[1fr_1fr] max-[900px]:grid-cols-1 gap-6 mb-10 items-start">
        {/* Left Column: Daily goal & Learning plan */}
        <div className="space-y-6">
          {/* Daily goal ring */}
          <div className="rounded-2xl p-8 max-[480px]:p-6 bg-(--bg-2) border border-(--rule)">
            <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted-foreground mb-6">
              Daily Goal
            </div>
            <div className="flex items-center gap-8">
              <GoalRing pct={dailyProgress} accent={ACCENT} />
              <div>
                <div className="text-[32px] font-bold text-(--ink) leading-none">
                  {dailyProgress}%
                </div>
                <div className="text-[14px] text-muted-foreground mt-1">
                  {formatReadingTime(stats.reading_time_today)} of{" "}
                  {goal?.daily_minutes ?? 15}m
                </div>
                {dailyProgress >= 100 ? (
                  <div
                    className="mt-3 inline-flex items-center gap-1.5 font-mono text-[10px] tracking-widest uppercase font-semibold px-2.5 py-1.25 rounded-full"
                    style={{
                      background: "rgba(22,163,74,0.12)",
                      color: "#16A34A",
                    }}
                  >
                    Goal complete!
                  </div>
                ) : (
                  <div className="mt-3 font-mono text-[11px] text-muted-foreground">
                    {formatReadingTime(
                      Math.max(
                        0,
                        (goal?.daily_minutes ?? 15) - stats.reading_time_today
                      )
                    )}{" "}
                    left
                  </div>
                )}
              </div>
            </div>
            <div className="mt-6 pt-5 border-t border-(--rule) flex items-center justify-between">
              <div>
                <div className="font-mono text-[9px] tracking-[0.12em] uppercase text-muted-foreground">
                  Annual
                </div>
                <div className="text-[14px] font-semibold text-(--ink) mt-0.5">
                  {stats.books_this_year} / {goal?.annual_books ?? 12} books
                </div>
              </div>
              <Link
                href="/tools/chapterly/settings"
                className="font-mono text-[9px] tracking-[0.12em] uppercase no-underline text-muted-foreground hover:text-(--ink)"
              >
                Edit goals →
              </Link>
            </div>
          </div>

          {/* Learning plan timeline */}
          {goal && (
            <ChLearningPlanClient
              initialPlan={goal.learning_plan}
              userBookTitles={books.map((b) => b.title)}
            />
          )}
        </div>

        {/* Current book */}
        <div className="rounded-2xl p-8 max-[480px]:p-6 bg-(--bg-2) border border-(--rule)">
          <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted-foreground mb-6">
            {currentBook?.status === "reading"
              ? "Currently Reading"
              : "Up Next"}
          </div>

          {currentBook ? (
            <>
              <div className="flex items-start gap-4">
                {/* Cover placeholder */}
                <div
                  className="w-14 h-[76px] rounded-md shrink-0 flex items-center justify-center relative overflow-hidden"
                  style={{ background: "color-mix(in srgb, var(--ch-accent) 13%, transparent)" }}
                >
                  {currentBook.cover_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={currentBook.cover_url}
                      alt={currentBook.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <BookMarked size={24} style={{ color: ACCENT }} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[16px] font-semibold text-(--ink) leading-[1.3] line-clamp-2">
                    {currentBook.title}
                  </div>
                  {currentBook.author && (
                    <div className="text-[13px] text-muted-foreground mt-1">
                      {currentBook.author}
                    </div>
                  )}
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-[9px] tracking-widest uppercase text-muted-foreground">
                        Progress
                      </span>
                      <span
                        className="font-mono text-[10px] font-semibold"
                        style={{ color: ACCENT }}
                      >
                        {Math.round(currentBook.progress_pct)}%
                      </span>
                    </div>
                    <div className="h-1 rounded-full bg-(--rule)">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${currentBook.progress_pct}%`,
                          background: `linear-gradient(90deg, ${ACCENT}, color-mix(in srgb, var(--ch-accent) 60%, white))`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-(--rule) flex items-center gap-3">
                <Link
                  href={`/tools/chapterly/read/${currentBook.id}`}
                  className="flex-1 h-10 rounded-lg flex items-center justify-center gap-2 no-underline font-mono text-[10px] tracking-[0.12em] uppercase font-semibold text-(--bg) transition-all hover:opacity-90"
                  style={{ background: ACCENT }}
                >
                  <BookOpen size={14} /> Continue reading
                </Link>
                <Link
                  href={`/tools/chapterly/chat/${currentBook.id}`}
                  className="h-10 px-4 rounded-lg flex items-center justify-center no-underline font-mono text-[10px] tracking-[0.12em] uppercase transition-all border border-(--rule) text-secondary-foreground hover:border-secondary-foreground"
                >
                  AI chat
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-6">
              <BookMarked
                size={40}
                className="mx-auto mb-4 opacity-20 text-(--ink)"
              />
              <p className="text-[14px] text-muted-foreground mb-5">
                No books in your library yet.
              </p>
              <Link
                href="/tools/chapterly/library"
                className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.12em] uppercase font-semibold no-underline px-4 py-2.5 rounded-lg text-(--bg)"
                style={{ background: ACCENT }}
              >
                <Plus size={14} /> Add your first book
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ── Recent library ── */}
      {recentBooks.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center justify-between mb-5">
            <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted-foreground">
              Your Library
            </div>
            <Link
              href="/tools/chapterly/library"
              className="font-mono text-[10px] tracking-[0.12em] uppercase no-underline text-muted-foreground hover:text-(--ink) flex items-center gap-1.5"
            >
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="grid grid-cols-4 max-[1100px]:grid-cols-3 max-[800px]:grid-cols-2 max-[480px]:grid-cols-2 gap-4">
            {recentBooks.map((book) => (
              <Link
                key={book.id}
                href={`/tools/chapterly/read/${book.id}`}
                className="rounded-[14px] p-4 no-underline border border-(--rule) bg-(--bg-2) hover:border-muted-foreground hover:shadow-md transition-all duration-200 group block"
              >
                <div
                  className="w-full aspect-[3/4] rounded-md flex items-center justify-center mb-3 relative overflow-hidden"
                  style={{ background: "color-mix(in srgb, var(--ch-accent) 9%, transparent)" }}
                >
                  {book.cover_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={book.cover_url}
                      alt={book.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <BookMarked
                      size={28}
                      style={{ color: ACCENT, opacity: 0.7 }}
                    />
                  )}
                </div>
                <div className="text-[13px] font-semibold text-(--ink) line-clamp-2 leading-[1.3]">
                  {book.title}
                </div>
                {book.author && (
                  <div className="text-[11px] text-muted-foreground mt-0.75 truncate">
                    {book.author}
                  </div>
                )}
                <div className="mt-2.5">
                  <div className="h-0.75 rounded-full bg-(--rule)">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${book.progress_pct}%`,
                        background: `linear-gradient(90deg, ${ACCENT}, color-mix(in srgb, var(--ch-accent) 60%, white))`,
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1.5">
                    <span
                      className="font-mono text-[8px] tracking-widest uppercase px-1.5 py-0.5 rounded-full"
                      style={{ background: "color-mix(in srgb, var(--ch-accent) 9%, transparent)", color: ACCENT }}
                    >
                      {STATUS_LABELS[book.status]}
                    </span>
                    <span className="font-mono text-[9px] text-muted-foreground">
                      {Math.round(book.progress_pct)}%
                    </span>
                  </div>
                </div>
              </Link>
            ))}

            {/* Add book card */}
            {!isFreeAtLimit && (
              <Link
                href="/tools/chapterly/library"
                className="rounded-xl p-4 no-underline border border-dashed border-(--rule) bg-transparent hover:border-muted-foreground transition-all flex flex-col items-center justify-center text-center min-h-40"
              >
                <Plus size={24} className="text-muted-foreground mb-2" />
                <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-muted-foreground">
                  Add Book
                </span>
              </Link>
            )}
          </div>

          {/* Freemium upgrade nudge */}
          {isFreeAtLimit && (
            <div
              className="mt-5 rounded-xl px-5 py-4 flex items-center justify-between gap-4"
              style={{
                background: "color-mix(in srgb, var(--ch-accent) 6%, transparent)",
                border: `1px solid color-mix(in srgb, var(--ch-accent) 19%, transparent)`,
              }}
            >
              <div>
                <div className="font-semibold text-[14px] text-(--ink)">
                  Free plan limit reached — {FREE_BOOK_LIMIT} books
                </div>
                <div className="text-[13px] text-muted-foreground mt-0.5">
                  Upgrade to add unlimited books and unlock all AI features.
                </div>
              </div>
              <Link
                href="/tools/chapterly/settings#upgrade"
                className="shrink-0 font-mono text-[10px] tracking-[0.12em] uppercase font-semibold no-underline px-3.5 py-2 rounded-lg text-(--bg)"
                style={{ background: ACCENT }}
              >
                Upgrade
              </Link>
            </div>
          )}
        </div>
      )}

      {/* ── BookBreaks bridge ── */}
      <div className="rounded-2xl p-7 border border-(--rule) bg-(--bg-2) flex items-center justify-between gap-5 max-160:flex-col max-160:text-center">
        <div>
          <div className="font-mono text-[9px] tracking-[0.14em] uppercase text-muted-foreground mb-1.5">
            Powered by BookBreaks
          </div>
          <div className="text-[15px] font-semibold text-(--ink)">
            Turn your highlights into content
          </div>
          <div className="text-[13px] text-muted-foreground mt-1">
            Any book you finish → one click to generate threads, carousels, and
            articles in BookBreaks.
          </div>
        </div>
        <Link
          href="/tools/bookbreaks"
          className="shrink-0 inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.12em] uppercase font-semibold no-underline px-4 py-2.5 rounded-lg transition-all hover:opacity-80"
          style={{ background: "#C85A2C", color: "#fff" }}
        >
          Open BookBreaks <ArrowRight size={12} />
        </Link>
      </div>
    </div>
  );
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

function StatCard({
  icon,
  label,
  value,
  sub,
  color,
  highlight = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  color: string;
  highlight?: boolean;
}): React.ReactElement {
  return (
    <div
      className="rounded-[14px] p-5 border transition-all duration-300 relative overflow-hidden"
      style={{
        background: highlight
          ? `linear-gradient(135deg, ${color}10, ${color}20)`
          : "var(--bg-2)",
        borderColor: highlight ? color + "50" : "var(--rule)",
        backdropFilter: "blur(12px)",
        boxShadow: highlight ? `0 0 20px ${color}15` : undefined,
      }}
    >
      {/* Subtle top-left glow when highlighted */}
      {highlight && (
        <div
          className="absolute top-0 left-0 w-20 h-20 rounded-full opacity-20 blur-xl pointer-events-none"
          style={{ background: color }}
        />
      )}
      <div className="flex items-center gap-2 mb-3 relative" style={{ color }}>
        {icon}
        <span className="font-mono text-[9px] tracking-[0.12em] uppercase text-muted-foreground">
          {label}
        </span>
      </div>
      <div className="text-[28px] max-[480px]:text-[22px] font-bold text-(--ink) leading-none relative">
        {value}
      </div>
      <div className="font-mono text-[10px] text-muted-foreground mt-1">
        {sub}
      </div>
    </div>
  );
}

function GoalRing({
  pct,
  accent,
}: {
  pct: number;
  accent: string;
}): React.ReactElement {
  const r = 40;
  const circ = 2 * Math.PI * r;
  const dash = (Math.min(pct, 100) / 100) * circ;
  const strokeColor = pct >= 100 ? "#16A34A" : accent;

  return (
    <svg
      width="100"
      height="100"
      viewBox="0 0 100 100"
      className="shrink-0 -rotate-90"
    >
      <defs>
        <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={strokeColor} stopOpacity="1" />
          <stop offset="100%" stopColor={strokeColor} stopOpacity="0.6" />
        </linearGradient>
      </defs>
      <circle
        cx="50"
        cy="50"
        r={r}
        fill="none"
        stroke="var(--rule)"
        strokeWidth="8"
      />
      <circle
        cx="50"
        cy="50"
        r={r}
        fill="none"
        stroke="url(#ringGrad)"
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`}
        style={{ transition: "stroke-dasharray 0.6s ease" }}
      />
    </svg>
  );
}
