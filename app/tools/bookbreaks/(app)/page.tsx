import { createClient } from "@/lib/supabase/server";
import { getDashboardStats, getBBBooks, getBBContent } from "@/lib/bookbreaks/queries";
import { BOOK_THEMES, CONTENT_TYPE_LABELS, CONTENT_TYPE_ICONS } from "@/lib/bookbreaks/constants";
import Link from "next/link";
import { BBSeedButton } from "@/components/bookbreaks/SeedButton";

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
    <div className="p-[48px] max-[720px]:p-[24px] max-[1024px]:pt-[80px]">
      {/* Header */}
      <div className="mb-[48px]">
        <div
          className="font-mono text-[10px] tracking-[0.16em] uppercase mb-[8px]"
          style={{ color: "#8B6F47" }}
        >
          Dashboard
        </div>
        <h1
          className="font-display font-normal text-[40px] max-[720px]:text-[28px] leading-[1.05] tracking-[-0.025em] fvs-text m-0"
          style={{ color: "#2C2C2C" }}
        >
          Good{getTimeOfDay()},{" "}
          <em
            className="not-italic italic fvs-text-soft"
            style={{ color: "#C85A2C" }}
          >
            {firstName}.
          </em>
        </h1>
        <p
          className="text-[15px] leading-[1.6] mt-[8px] m-0"
          style={{ color: "#8B6F47" }}
        >
          {isEmpty
            ? "Your library is ready. Add your first book to get started."
            : `${books.length} book${books.length !== 1 ? "s" : ""} in your library · ${stats.content_count} pieces created`}
        </p>
      </div>

      {/* Seed prompt for new users */}
      {isEmpty && (
        <div
          className="rounded-[12px] p-[32px] mb-[48px] flex flex-col max-[720px]:flex-col gap-[20px] items-start"
          style={{
            background: "rgba(200,90,44,0.08)",
            border: "1px solid rgba(200,90,44,0.2)",
          }}
        >
          <div>
            <h2
              className="font-display text-[22px] fvs-text m-0 mb-[8px]"
              style={{ color: "#2C2C2C" }}
            >
              Start with 4 pre-loaded books
            </h2>
            <p
              className="text-[14px] leading-[1.6] m-0 max-w-[52ch]"
              style={{ color: "#8B6F47" }}
            >
              Load{" "}
              <em>The Diary of a CEO</em>,{" "}
              <em>Thinking Sideways</em>,{" "}
              <em>Sell Like Crazy</em>, and{" "}
              <em>Sell or Be Sold</em> — with 10 pre-written content pieces ready to publish.
            </p>
          </div>
          <BBSeedButton />
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 max-[720px]:grid-cols-1 gap-[16px] mb-[48px]">
        <StatCard label="Books Read" value={stats.book_count} icon="📚" />
        <StatCard label="Content Created" value={stats.content_count} icon="✦" />
        <StatCard label="This Month" value={stats.this_month_count} icon="📅" />
      </div>

      <div className="grid grid-cols-[1fr_320px] max-[1100px]:grid-cols-1 gap-[32px]">
        {/* Recent books */}
        <section>
          <div className="flex items-center justify-between mb-[20px]">
            <h2
              className="font-mono text-[10px] tracking-[0.14em] uppercase m-0"
              style={{ color: "#8B6F47" }}
            >
              Recent Books
            </h2>
            <Link
              href="/tools/bookbreaks/books"
              className="font-mono text-[10px] tracking-[0.12em] uppercase no-underline transition-colors"
              style={{ color: "#C85A2C" }}
            >
              All books →
            </Link>
          </div>

          {recentBooks.length > 0 ? (
            <div className="space-y-[12px]">
              {recentBooks.map((book) => {
                const theme = BOOK_THEMES[book.theme] ?? BOOK_THEMES.custom;
                return (
                  <div
                    key={book.id}
                    className="rounded-[10px] p-[20px] flex items-center gap-[16px]"
                    style={{
                      background: "#FAF5EC",
                      border: "1px solid #D4B896",
                    }}
                  >
                    <div
                      className="w-[44px] h-[56px] rounded-[6px] flex-shrink-0 flex items-end justify-end p-[6px]"
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
                      <div
                        className="font-display text-[17px] fvs-text leading-[1.2] truncate"
                        style={{ color: "#2C2C2C" }}
                      >
                        {book.title}
                      </div>
                      <div
                        className="font-mono text-[11px] mt-[2px]"
                        style={{ color: "#8B6F47" }}
                      >
                        {book.author}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div
                        className="font-mono text-[11px] font-semibold"
                        style={{ color: "#C85A2C" }}
                      >
                        {book.content_count}
                      </div>
                      <div
                        className="font-mono text-[9px] uppercase tracking-[0.1em]"
                        style={{ color: "#8B6F47" }}
                      >
                        pieces
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon="📚"
              message="No books yet"
              cta={{ label: "Add your first book", href: "/tools/bookbreaks/books" }}
            />
          )}

          {/* Quick actions */}
          <div className="flex gap-[12px] mt-[24px]">
            <Link
              href="/tools/bookbreaks/books"
              className="inline-flex items-center gap-[8px] h-[44px] px-[20px] rounded-[8px] font-mono text-[10px] uppercase tracking-[0.12em] font-semibold no-underline transition-all duration-150 hover:opacity-90"
              style={{ background: "#C85A2C", color: "#FFF" }}
            >
              + Add Book
            </Link>
            <Link
              href="/tools/bookbreaks/generate"
              className="inline-flex items-center gap-[8px] h-[44px] px-[20px] rounded-[8px] font-mono text-[10px] uppercase tracking-[0.12em] font-semibold no-underline transition-all duration-150"
              style={{
                background: "transparent",
                color: "#2D5016",
                border: "1.5px solid #2D5016",
              }}
            >
              ✦ Generate Content
            </Link>
          </div>
        </section>

        {/* Recent content */}
        <section>
          <div className="flex items-center justify-between mb-[20px]">
            <h2
              className="font-mono text-[10px] tracking-[0.14em] uppercase m-0"
              style={{ color: "#8B6F47" }}
            >
              Recent Content
            </h2>
            <Link
              href="/tools/bookbreaks/content"
              className="font-mono text-[10px] tracking-[0.12em] uppercase no-underline transition-colors"
              style={{ color: "#C85A2C" }}
            >
              All →
            </Link>
          </div>

          {latestContent.length > 0 ? (
            <div className="space-y-[8px]">
              {latestContent.map((c) => (
                <div
                  key={c.id}
                  className="rounded-[8px] p-[14px] flex items-start gap-[12px]"
                  style={{
                    background: "#FAF5EC",
                    border: "1px solid #D4B896",
                  }}
                >
                  <span
                    className="text-[16px] flex-shrink-0 mt-[1px]"
                    aria-hidden="true"
                  >
                    {CONTENT_TYPE_ICONS[c.content_type] ?? "📄"}
                  </span>
                  <div className="min-w-0">
                    <div
                      className="text-[13px] leading-[1.4] font-medium truncate"
                      style={{ color: "#2C2C2C", fontFamily: "inherit" }}
                    >
                      {c.title}
                    </div>
                    <div
                      className="font-mono text-[10px] mt-[3px] flex items-center gap-[8px]"
                      style={{ color: "#8B6F47" }}
                    >
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
              icon="✦"
              message="No content yet"
              cta={{ label: "Generate your first piece", href: "/tools/bookbreaks/generate" }}
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
  icon: string;
}): React.ReactElement {
  return (
    <div
      className="rounded-[10px] p-[24px]"
      style={{ background: "#FAF5EC", border: "1px solid #D4B896" }}
    >
      <div className="flex items-center justify-between mb-[12px]">
        <span
          className="font-mono text-[10px] tracking-[0.12em] uppercase"
          style={{ color: "#8B6F47" }}
        >
          {label}
        </span>
        <span className="text-[18px]" aria-hidden="true">{icon}</span>
      </div>
      <div
        className="font-display text-[44px] font-normal fvs-text leading-[1]"
        style={{ color: "#2C2C2C" }}
      >
        {value}
      </div>
    </div>
  );
}

function EmptyState({
  icon,
  message,
  cta,
}: {
  icon: string;
  message: string;
  cta: { label: string; href: string };
}): React.ReactElement {
  return (
    <div
      className="rounded-[10px] p-[32px] text-center"
      style={{ background: "#FAF5EC", border: "1px dashed #D4B896" }}
    >
      <div className="text-[32px] mb-[12px]">{icon}</div>
      <div
        className="font-mono text-[11px] tracking-[0.1em] uppercase mb-[16px]"
        style={{ color: "#8B6F47" }}
      >
        {message}
      </div>
      <Link
        href={cta.href}
        className="inline-flex items-center gap-[6px] font-mono text-[10px] uppercase tracking-[0.12em] font-semibold no-underline"
        style={{ color: "#C85A2C" }}
      >
        {cta.label} →
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
