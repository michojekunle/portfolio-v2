import { createClient } from "@/lib/supabase/server";
import {
  getDashboardStats,
  getBBBooks,
  getBBContent,
} from "@/lib/bookbreaks/queries";
import {
  BOOK_THEMES,
  CONTENT_TYPE_LABELS,
  CONTENT_TYPE_ICONS,
} from "@/lib/bookbreaks/constants";
import Link from "next/link";
import { BBSeedButton } from "@/components/bookbreaks/SeedButton";
import {
  BookOpen,
  Sparkles,
  Calendar,
  Settings,
  AlertCircle,
  LayoutTemplate,
  ArrowRight,
} from "lucide-react";
import { TiltCard } from "@/components/tilt-card";
export default async function BookBreaksDashboard(): Promise<React.ReactElement> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [stats, books, recentContent] = await Promise.all([
    getDashboardStats(),
    getBBBooks(),
    getBBContent(),
  ]);

  const firstName = user?.email?.split("@")[0] ?? "there";
  const recentBooks = books.slice(0, 3);
  const latestContent = recentContent.slice(0, 5);
  const isEmpty = books.length === 0;

  return (
    <div className="px-12 py-12 max-[1024px]:pt-20 max-[720px]:px-6 max-[720px]:pb-6 max-[720px]:pt-20">
      {/* Header */}
      <div className="mb-12">
        <div className="font-mono text-[10px] tracking-[0.16em] uppercase mb-2 text-muted-foreground">
          Dashboard
        </div>
        <h1 className="font-display font-normal text-[40px] max-[720px]:text-[28px] leading-[1.05] tracking-tight fvs-text m-0 text-(--ink)">
          Good{getTimeOfDay()},{" "}
          <em className="not-italic italic fvs-text-soft text-(--v3-accent)">
            {firstName}.
          </em>
        </h1>
        <p className="text-[15px] leading-[1.6] mt-2 m-0 text-muted-foreground">
          {isEmpty
            ? "Your library is ready. Add your first book to get started."
            : `${books.length} book${
                books.length !== 1 ? "s" : ""
              } in your library · ${stats.content_count} pieces created`}
        </p>
      </div>

      {/* Seed prompt for new users */}
      {isEmpty && (
        <div className="rounded-xl p-8 mb-12 flex flex-col max-[720px]:flex-col gap-5 items-start bg-[color-mix(in_oklab,var(--v3-accent)_10%,var(--bg))] border border-[color-mix(in_oklab,var(--v3-accent)_20%,var(--bg))]">
          <div>
            <h2 className="font-display text-[22px] fvs-text m-0 mb-2 text-(--ink)">
              Start with 4 pre-loaded books
            </h2>
            <p className="text-[14px] leading-[1.6] m-0 max-w-[52ch] text-secondary-foreground">
              Load <em>The Diary of a CEO</em>, <em>Thinking Sideways</em>,{" "}
              <em>Sell Like Crazy</em>, and <em>Sell or Be Sold</em> — with 10
              pre-written content pieces ready to publish.
            </p>
          </div>
          <BBSeedButton />
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 max-[768px]:grid-cols-1 gap-4 mb-12">
        <StatCard
          label="Books Read"
          value={stats.book_count}
          icon={<BookOpen size={20} />}
        />
        <StatCard
          label="Content Created"
          value={stats.content_count}
          icon={<Sparkles size={20} />}
        />
        <StatCard
          label="This Month"
          value={stats.this_month_count}
          icon={<Calendar size={20} />}
        />
      </div>

      <div className="grid grid-cols-[1fr_320px] max-[1100px]:grid-cols-1 gap-8">
        {/* Recent books */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-mono text-[10px] tracking-[0.14em] uppercase m-0 text-muted-foreground">
              Recent Books
            </h2>
            <Link
              href="/tools/bookbreaks/books"
              className="font-mono text-[10px] tracking-[0.12em] uppercase no-underline transition-colors text-(--v3-accent) hover:opacity-80"
            >
              All books <ArrowRight className="w-3 h-3 ml-1 inline-block" />
            </Link>
          </div>

          {recentBooks.length > 0 ? (
            <div className="space-y-3">
              {recentBooks.map((book) => {
                const theme = BOOK_THEMES[book.theme] ?? BOOK_THEMES.custom;
                return (
                  <div
                    key={book.id}
                    className="rounded-[10px] p-5 flex items-center gap-4 bg-(--bg-2) border border-(--rule) transition-all duration-200 hover:border-(--v3-accent-soft)"
                  >
                    <div
                      className="w-11 h-14 rounded-md flex-shrink-0 flex items-end justify-end p-1.5"
                      style={{ background: theme.bg }}
                    >
                      <span
                        className="font-mono text-[8px] font-bold tracking-[0.04em] opacity-70"
                        style={{ color: theme.accent }}
                      >
                        {book.rating ? `${book.rating}/5` : ""}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-display text-[17px] fvs-text leading-[1.2] truncate text-(--ink)">
                        {book.title}
                      </div>
                      <div className="font-mono text-[11px] mt-0.5 text-muted-foreground">
                        {book.author}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="font-mono text-[11px] font-semibold text-(--v3-accent)">
                        {book.content_count}
                      </div>
                      <div className="font-mono text-[9px] uppercase tracking-widest text-(--ink-4)">
                        pieces
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={<BookOpen size={24} />}
              message="No books yet"
              cta={{
                label: "Add your first book",
                href: "/tools/bookbreaks/books",
              }}
            />
          )}

          {/* Quick actions */}
          <div className="flex flex-wrap gap-2.5 mt-6">
            <Link
              href="/tools/bookbreaks/books"
              className="inline-flex items-center gap-2 h-11 px-5 rounded-lg font-mono text-[10px] uppercase tracking-[0.12em] font-semibold no-underline transition-all duration-150 hover:opacity-90 bg-(--v3-accent) text-(--bg) max-[480px]:flex-1 max-[480px]:justify-center"
            >
              + Add Book
            </Link>
            <Link
              href="/tools/bookbreaks/generate"
              className="inline-flex items-center gap-2 h-11 px-5 rounded-lg font-mono text-[10px] uppercase tracking-[0.12em] font-semibold no-underline transition-all duration-150 bg-transparent text-secondary-foreground border-[1.5px] border-(--rule) hover:border-(--v3-accent) hover:text-(--v3-accent) max-[480px]:flex-1 max-[480px]:justify-center"
            >
              <Sparkles className="w-3 h-3 mr-1 inline-block" /> Generate
            </Link>
          </div>
        </section>

        {/* Recent content */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-mono text-[10px] tracking-[0.14em] uppercase m-0 text-muted-foreground">
              Recent Content
            </h2>
            <Link
              href="/tools/bookbreaks/content"
              className="font-mono text-[10px] tracking-[0.12em] uppercase no-underline transition-colors text-(--v3-accent) hover:opacity-80"
            >
              All <ArrowRight className="w-3 h-3 ml-1 inline-block" />
            </Link>
          </div>

          {latestContent.length > 0 ? (
            <div className="space-y-2">
              {latestContent.map((c) => (
                <div
                  key={c.id}
                  className="rounded-lg p-3.5 flex items-start gap-3 bg-(--bg-2) border border-(--rule)"
                >
                  <span className="flex-shrink-0 mt-0.25 text-(--v3-accent)">
                    <LayoutTemplate size={16} />
                  </span>
                  <div className="min-w-0">
                    <div className="text-[13px] leading-[1.4] font-medium truncate text-(--ink)">
                      {c.title}
                    </div>
                    <div className="font-mono text-[10px] mt-0.75 flex items-center gap-2 text-muted-foreground">
                      <span>{CONTENT_TYPE_LABELS[c.content_type]}</span>
                      <span aria-hidden="true">·</span>
                      <span className="truncate">{c.book_title}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Sparkles size={24} />}
              message="No content yet"
              cta={{
                label: "Generate your first piece",
                href: "/tools/bookbreaks/generate",
              }}
            />
          )}
        </section>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}): React.ReactElement {
  return (
    <TiltCard intensity={10}>
      <div className="rounded-[10px] p-6 bg-(--bg-2) border border-(--rule) h-full">
        <div className="flex items-center justify-between mb-3">
          <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-muted-foreground">
            {label}
          </span>
          <span className="text-(--v3-accent)">{icon}</span>
        </div>
        <div className="font-display text-[44px] font-normal fvs-text leading-none text-(--ink)">
          {value}
        </div>
      </div>
    </TiltCard>
  );
}

function EmptyState({
  icon,
  message,
  cta,
}: {
  icon: React.ReactNode | string;
  message: string;
  cta: { label: string; href: string };
}): React.ReactElement {
  return (
    <div className="rounded-[10px] p-8 text-center bg-(--bg-2) border border-dashed border-(--rule)">
      <div className="flex justify-center mb-3 text-(--v3-accent)">
        {typeof icon === "string" ? <AlertCircle size={32} /> : icon}
      </div>
      <div className="font-mono text-[11px] tracking-widest uppercase mb-4 text-muted-foreground">
        {message}
      </div>
      <Link
        href={cta.href}
        className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] font-semibold no-underline text-(--v3-accent) hover:opacity-80"
      >
        {cta.label} <ArrowRight className="w-3 h-3 ml-1 inline-block" />
      </Link>
    </div>
  );
}

function getTimeOfDay(): string {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}
