import Link from "next/link";
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

export const metadata: Metadata = {
  title: "Chapterly — Home",
};

const ACCENT = "#4F6D7A";
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

  const currentBook =
    books.find((b) => b.status === "reading") ?? books[0] ?? null;
  const recentBooks = books.slice(0, 4);
  const dailyProgress = goal
    ? goalProgressPct(stats.reading_time_today, goal.daily_minutes)
    : 0;
  const streakActive = goal ? isStreakAlive(goal) : false;
  const isFreeAtLimit = books.length >= FREE_BOOK_LIMIT;

  return (
    <div className="px-[40px] pt-[48px] pb-[48px] max-[1024px]:pt-[80px] max-[720px]:px-[24px] max-[720px]:pb-[32px] max-w-[1200px]">
      {/* ── Header ── */}
      <div className="mb-[48px]">
        <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-[var(--ink-3)] mb-[8px]">
          Good {getGreeting()}, {user?.email?.split("@")[0]}
        </div>
        <h1 className="font-display text-[36px] max-[720px]:text-[28px] font-normal tracking-[-0.02em] fvs-text text-[var(--ink)] m-0 leading-[1.1]">
          Your Reading OS
        </h1>
      </div>

      {/* ── Stats strip ── */}
      <div className="grid grid-cols-4 max-[900px]:grid-cols-2 max-[480px]:grid-cols-2 gap-[16px] mb-[40px]">
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
          sub={streakActive ? "active" : "start today"}
          color="#EA580C"
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

      {/* ── Daily goal ring + current book ── */}
      <div className="grid grid-cols-[1fr_1fr] max-[900px]:grid-cols-1 gap-[24px] mb-[40px]">
        {/* Daily goal ring */}
        <div className="rounded-[16px] p-[32px] max-[480px]:p-[24px] bg-[var(--bg-2)] border border-[var(--rule)]">
          <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-[var(--ink-3)] mb-[24px]">
            Daily Goal
          </div>
          <div className="flex items-center gap-[32px]">
            <GoalRing pct={dailyProgress} accent={ACCENT} />
            <div>
              <div className="text-[32px] font-bold text-[var(--ink)] leading-[1]">
                {dailyProgress}%
              </div>
              <div className="text-[14px] text-[var(--ink-3)] mt-[4px]">
                {formatReadingTime(stats.reading_time_today)} of{" "}
                {goal?.daily_minutes ?? 15}m
              </div>
              {dailyProgress >= 100 ? (
                <div
                  className="mt-[12px] inline-flex items-center gap-[6px] font-mono text-[10px] tracking-[0.1em] uppercase font-semibold px-[10px] py-[5px] rounded-full"
                  style={{
                    background: "rgba(22,163,74,0.12)",
                    color: "#16A34A",
                  }}
                >
                  Goal complete!
                </div>
              ) : (
                <div className="mt-[12px] font-mono text-[11px] text-[var(--ink-3)]">
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
          <div className="mt-[24px] pt-[20px] border-t border-[var(--rule)] flex items-center justify-between">
            <div>
              <div className="font-mono text-[9px] tracking-[0.12em] uppercase text-[var(--ink-3)]">
                Annual
              </div>
              <div className="text-[14px] font-semibold text-[var(--ink)] mt-[2px]">
                {stats.books_this_year} / {goal?.annual_books ?? 12} books
              </div>
            </div>
            <Link
              href="/tools/chapterly/settings"
              className="font-mono text-[9px] tracking-[0.12em] uppercase no-underline text-[var(--ink-3)] hover:text-[var(--ink)]"
            >
              Edit goals →
            </Link>
          </div>
        </div>

        {/* Current book */}
        <div className="rounded-[16px] p-[32px] max-[480px]:p-[24px] bg-[var(--bg-2)] border border-[var(--rule)]">
          <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-[var(--ink-3)] mb-[24px]">
            {currentBook?.status === "reading"
              ? "Currently Reading"
              : "Up Next"}
          </div>

          {currentBook ? (
            <>
              <div className="flex items-start gap-[16px]">
                {/* Cover placeholder */}
                <div
                  className="w-[56px] h-[76px] rounded-[6px] shrink-0 flex items-center justify-center"
                  style={{ background: ACCENT + "22" }}
                >
                  <BookMarked size={24} style={{ color: ACCENT }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[16px] font-semibold text-[var(--ink)] leading-[1.3] line-clamp-2">
                    {currentBook.title}
                  </div>
                  {currentBook.author && (
                    <div className="text-[13px] text-[var(--ink-3)] mt-[4px]">
                      {currentBook.author}
                    </div>
                  )}
                  <div className="mt-[12px]">
                    <div className="flex items-center justify-between mb-[6px]">
                      <span className="font-mono text-[9px] tracking-[0.1em] uppercase text-[var(--ink-3)]">
                        Progress
                      </span>
                      <span
                        className="font-mono text-[10px] font-semibold"
                        style={{ color: ACCENT }}
                      >
                        {Math.round(currentBook.progress_pct)}%
                      </span>
                    </div>
                    <div className="h-[4px] rounded-full bg-[var(--rule)]">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${currentBook.progress_pct}%`,
                          background: `linear-gradient(90deg, ${ACCENT}, #6B8FA0)`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-[24px] pt-[20px] border-t border-[var(--rule)] flex items-center gap-[12px]">
                <Link
                  href={`/tools/chapterly/read/${currentBook.id}`}
                  className="flex-1 h-[40px] rounded-[8px] flex items-center justify-center gap-[8px] no-underline font-mono text-[10px] tracking-[0.12em] uppercase font-semibold text-(--bg) transition-all hover:opacity-90"
                  style={{ background: ACCENT }}
                >
                  <BookOpen size={14} /> Continue reading
                </Link>
                <Link
                  href={`/tools/chapterly/chat/${currentBook.id}`}
                  className="h-[40px] px-[16px] rounded-[8px] flex items-center justify-center no-underline font-mono text-[10px] tracking-[0.12em] uppercase transition-all border border-[var(--rule)] text-[var(--ink-2)] hover:border-[var(--ink-2)]"
                >
                  AI chat
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-[24px]">
              <BookMarked
                size={40}
                className="mx-auto mb-[16px] opacity-20 text-[var(--ink)]"
              />
              <p className="text-[14px] text-[var(--ink-3)] mb-[20px]">
                No books in your library yet.
              </p>
              <Link
                href="/tools/chapterly/library"
                className="inline-flex items-center gap-[8px] font-mono text-[11px] tracking-[0.12em] uppercase font-semibold no-underline px-[16px] py-[10px] rounded-[8px] text-(--bg)"
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
        <div className="mb-[40px]">
          <div className="flex items-center justify-between mb-[20px]">
            <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-[var(--ink-3)]">
              Your Library
            </div>
            <Link
              href="/tools/chapterly/library"
              className="font-mono text-[10px] tracking-[0.12em] uppercase no-underline text-[var(--ink-3)] hover:text-[var(--ink)] flex items-center gap-[6px]"
            >
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="grid grid-cols-4 max-[1100px]:grid-cols-3 max-[800px]:grid-cols-2 max-[480px]:grid-cols-2 gap-[16px]">
            {recentBooks.map((book) => (
              <Link
                key={book.id}
                href={`/tools/chapterly/read/${book.id}`}
                className="rounded-[14px] p-[16px] no-underline border border-[var(--rule)] bg-[var(--bg-2)] hover:border-[var(--ink-3)] hover:shadow-md transition-all duration-200 group block"
              >
                <div
                  className="w-full aspect-[3/4] rounded-[6px] flex items-center justify-center mb-[12px]"
                  style={{ background: ACCENT + "18" }}
                >
                  <BookMarked
                    size={28}
                    style={{ color: ACCENT, opacity: 0.7 }}
                  />
                </div>
                <div className="text-[13px] font-semibold text-[var(--ink)] line-clamp-2 leading-[1.3]">
                  {book.title}
                </div>
                {book.author && (
                  <div className="text-[11px] text-[var(--ink-3)] mt-[3px] truncate">
                    {book.author}
                  </div>
                )}
                <div className="mt-[10px]">
                  <div className="h-[3px] rounded-full bg-[var(--rule)]">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${book.progress_pct}%`,
                        background: `linear-gradient(90deg, ${ACCENT}, #6B8FA0)`,
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-[6px]">
                    <span
                      className="font-mono text-[8px] tracking-[0.1em] uppercase px-[6px] py-[2px] rounded-full"
                      style={{ background: ACCENT + "18", color: ACCENT }}
                    >
                      {STATUS_LABELS[book.status]}
                    </span>
                    <span className="font-mono text-[9px] text-[var(--ink-3)]">
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
                className="rounded-[12px] p-[16px] no-underline border border-dashed border-[var(--rule)] bg-transparent hover:border-[var(--ink-3)] transition-all flex flex-col items-center justify-center text-center min-h-[160px]"
              >
                <Plus size={24} className="text-[var(--ink-3)] mb-[8px]" />
                <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-[var(--ink-3)]">
                  Add Book
                </span>
              </Link>
            )}
          </div>

          {/* Freemium upgrade nudge */}
          {isFreeAtLimit && (
            <div
              className="mt-[20px] rounded-[12px] px-[20px] py-[16px] flex items-center justify-between gap-[16px]"
              style={{
                background: ACCENT + "10",
                border: `1px solid ${ACCENT}30`,
              }}
            >
              <div>
                <div className="font-semibold text-[14px] text-[var(--ink)]">
                  Free plan limit reached — {FREE_BOOK_LIMIT} books
                </div>
                <div className="text-[13px] text-[var(--ink-3)] mt-[2px]">
                  Upgrade to add unlimited books and unlock all AI features.
                </div>
              </div>
              <Link
                href="/tools/chapterly/settings#upgrade"
                className="shrink-0 font-mono text-[10px] tracking-[0.12em] uppercase font-semibold no-underline px-[14px] py-[8px] rounded-[8px] text-(--bg)"
                style={{ background: ACCENT }}
              >
                Upgrade
              </Link>
            </div>
          )}
        </div>
      )}

      {/* ── BookBreaks bridge ── */}
      <div className="rounded-[16px] p-[28px] border border-[var(--rule)] bg-[var(--bg-2)] flex items-center justify-between gap-[20px] max-[640px]:flex-col max-[640px]:text-center">
        <div>
          <div className="font-mono text-[9px] tracking-[0.14em] uppercase text-[var(--ink-3)] mb-[6px]">
            Powered by BookBreaks
          </div>
          <div className="text-[15px] font-semibold text-[var(--ink)]">
            Turn your highlights into content
          </div>
          <div className="text-[13px] text-[var(--ink-3)] mt-[4px]">
            Any book you finish → one click to generate threads, carousels, and
            articles in BookBreaks.
          </div>
        </div>
        <Link
          href="/tools/bookbreaks"
          className="shrink-0 inline-flex items-center gap-[8px] font-mono text-[10px] tracking-[0.12em] uppercase font-semibold no-underline px-[16px] py-[10px] rounded-[8px] transition-all hover:opacity-80"
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
      className="rounded-[14px] p-[20px] border transition-all duration-300 relative overflow-hidden"
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
          className="absolute top-0 left-0 w-[80px] h-[80px] rounded-full opacity-20 blur-xl pointer-events-none"
          style={{ background: color }}
        />
      )}
      <div className="flex items-center gap-[8px] mb-[12px] relative" style={{ color }}>
        {icon}
        <span className="font-mono text-[9px] tracking-[0.12em] uppercase text-[var(--ink-3)]">
          {label}
        </span>
      </div>
      <div className="text-[28px] max-[480px]:text-[22px] font-bold text-[var(--ink)] leading-[1] relative">
        {value}
      </div>
      <div className="font-mono text-[10px] text-[var(--ink-3)] mt-[4px]">
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
