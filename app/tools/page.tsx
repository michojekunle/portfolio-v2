import { MagneticWrapper } from "@/components/magnetic-wrapper";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Creator Suite",
  description:
    "Michael Ojekunle's creator tools — BookBreaks, Chapterly, Flowise, Thread Studio, Carousel Lab. Build in public, learn out loud.",
};

const TOOLS = [
  {
    id: "bookbreaks",
    name: "BookBreaks",
    tagline: "Books → Content, instantly.",
    description:
      "Turn every book you read into blog articles, X threads, Instagram carousels, and TikTok scripts. AI-powered, multi-platform, built for creators learning in public.",
    status: "live" as const,
    href: "/tools/bookbreaks",
    accent: "#C85A2C",
    accentSoft: "rgba(200,90,44,0.12)",
    icon: "📚",
    stats: ["4 books seeded", "5 content types", "Groq + Gemini AI"],
  },
  {
    id: "thread-studio",
    name: "Thread Studio",
    tagline: "Engineer viral threads.",
    description:
      "Draft, structure, and schedule long-form X threads. Hook optimiser, engagement analytics, and a distraction-free writing canvas.",
    status: "soon" as const,
    href: "#",
    accent: "#6366F1",
    accentSoft: "rgba(99,102,241,0.12)",
    icon: "🐦",
    stats: ["Thread builder", "Hook analyser", "Scheduling"],
  },
  {
    id: "carousel-lab",
    name: "Carousel Lab",
    tagline: "Design scroll-stopping slides.",
    description:
      "Build Instagram and LinkedIn carousels with book-themed templates. Export as PNG or HTML, publish directly from the browser.",
    status: "soon" as const,
    href: "#",
    accent: "#FF6B35",
    accentSoft: "rgba(255,107,53,0.12)",
    icon: "📸",
    stats: ["4 visual themes", "6-slide templates", "One-click export"],
  },
  {
    id: "chapterly",
    name: "Chapterly",
    tagline: "Read everything. Remember everything.",
    description:
      "A personal reading OS. Upload PDFs, EPUBs, DOCX and more. AI reading companion, voice chat about your books, streaks, goals, highlights — and a direct bridge to BookBreaks.",
    status: "live" as const,
    href: "/tools/chapterly",
    accent: "#4F6D7A",
    accentSoft: "rgba(79,109,122,0.12)",
    icon: "📖",
    stats: ["10+ formats", "AI voice chat", "Streaks & goals"],
    bridge: "bookbreaks",
  },
] as const;

export default function CreatorSuitePage(): React.ReactElement {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="outline-none min-h-screen"
      style={{ background: "var(--bg)" }}
    >
      {/* ── Hero ── */}
      <section
        className="pt-[160px] pb-[100px] max-[720px]:pt-[120px] max-[720px]:pb-[64px] border-b"
        style={{ borderColor: "var(--rule)" }}
      >
        <div className="max-w-[var(--maxw)] mx-auto px-[var(--gutter)]">
          <div className="grid grid-cols-[1fr_auto] max-[900px]:grid-cols-1 gap-[48px] items-end">
            <div>
              <div className="v3-eyebrow mb-[28px]">CREATOR SUITE · TOOLS</div>
              <h1
                className="m-0 font-display font-normal leading-[0.88] tracking-[-0.04em] text-balance fvs-display"
                style={{
                  fontSize: "clamp(56px,10vw,116px)",
                  color: "var(--ink)",
                }}
              >
                Tools for{" "}
                <em
                  className="not-italic italic fvs-soft"
                  style={{ color: "var(--v3-accent)" }}
                >
                  builders
                </em>{" "}
                <br className="max-[900px]:hidden" />
                who share.
              </h1>
            </div>
            <div className="max-w-[44ch] max-[900px]:max-w-none">
              <p
                className="text-[18px] leading-[1.65] m-0"
                style={{ color: "var(--ink-2)" }}
              >
                A suite of creator tools for people learning in public. Read
                more, build better, ship consistently — and let your community
                grow alongside you.
              </p>
              <div className="mt-[32px] flex items-center gap-[16px] flex-wrap">
                <MagneticWrapper>
                  <Link
                    href="/tools/bookbreaks"
                    className="inline-flex items-center gap-[8px] h-[48px] px-[24px] rounded-full font-mono text-[11px] uppercase tracking-[0.14em] font-semibold text-(--bg) no-underline transition-all duration-200 hover:opacity-90 hover:scale-[1.02]"
                    style={{ background: "var(--v3-accent)" }}
                  >
                    Launch BookBreaks{" "}
                    <span className="text-[14px]" aria-hidden="true">
                      →
                    </span>
                  </Link>
                </MagneticWrapper>
                <MagneticWrapper>
                  <Link
                    href="/tools/chapterly"
                    className="inline-flex items-center gap-[8px] h-[48px] px-[24px] rounded-full font-mono text-[11px] uppercase tracking-[0.14em] font-semibold no-underline transition-all duration-200 hover:opacity-90 hover:scale-[1.02]"
                    style={{ background: "rgba(79,109,122,0.12)", color: "#4F6D7A", border: "1px solid rgba(79,109,122,0.25)" }}
                  >
                    Try Chapterly{" "}
                    <span className="text-[14px]" aria-hidden="true">→</span>
                  </Link>
                </MagneticWrapper>
                <MagneticWrapper>
                  <Link
                    href="/tools/flowise"
                    className="inline-flex items-center gap-[8px] h-[48px] px-[24px] rounded-full font-mono text-[11px] uppercase tracking-[0.14em] font-semibold no-underline transition-all duration-200 hover:opacity-90 hover:scale-[1.02]"
                    style={{ background: "rgba(22,163,74,0.12)", color: "#16A34A", border: "1px solid rgba(22,163,74,0.25)" }}
                  >
                    Try Flowise{" "}
                    <span className="text-[14px]" aria-hidden="true">→</span>
                  </Link>
                </MagneticWrapper>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Tool grid: 2×2 + full-width Flowise ── */}
      <section className="max-w-[var(--maxw)] mx-auto px-[var(--gutter)] py-[100px] max-[720px]:py-[64px]">
        <div className="border border-[var(--rule)] rounded-[2px]">
          {/* Top 4 tools — 2 column */}
          <div className="grid grid-cols-2 max-[900px]:grid-cols-1">
            {TOOLS.map((tool, i) => (
              <ToolCard key={tool.id} tool={tool} index={i} totalInGrid={TOOLS.length} />
            ))}
          </div>
          {/* Flowise — full-width featured row */}
          <FlowiseCard />
        </div>
      </section>

      {/* ── Philosophy strip ── */}
      <section
        className="border-y py-[80px] max-[720px]:py-[56px]"
        style={{
          borderColor: "var(--rule)",
          background: "var(--bg-2)",
        }}
      >
        <div className="max-w-[var(--maxw)] mx-auto px-[var(--gutter)]">
          <div className="grid grid-cols-3 max-[720px]:grid-cols-1 gap-[48px]">
            {[
              {
                num: "01",
                head: "Read deeply.",
                body: "Every book contains compressed decades of someone else's experience. Extract it properly.",
              },
              {
                num: "02",
                head: "Share freely.",
                body: "Knowledge hoarded dies. Knowledge shared compounds — for you and for everyone you reach.",
              },
              {
                num: "03",
                head: "Build in public.",
                body: "The process is the product. Your learning journey is as valuable as the destination.",
              },
            ].map((p) => (
              <div key={p.num}>
                <div
                  className="font-mono text-[10px] tracking-[0.18em] uppercase mb-[16px]"
                  style={{ color: "var(--ink-4)" }}
                >
                  {p.num}
                </div>
                <h3
                  className="font-display font-normal text-[28px] leading-[1.1] tracking-[-0.02em] mb-[12px] fvs-text m-0"
                  style={{ color: "var(--ink)" }}
                >
                  {p.head}
                </h3>
                <p
                  className="text-[15px] leading-[1.6] m-0"
                  style={{ color: "var(--ink-2)" }}
                >
                  {p.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function ToolCard({
  tool,
  index,
  totalInGrid,
}: {
  tool: (typeof TOOLS)[number];
  index: number;
  totalInGrid: number;
}): React.ReactElement {
  const isLive = tool.status === "live";
  const borderRight = index % 2 === 0;
  const borderBottom = index < totalInGrid - 2 || (totalInGrid % 2 !== 0 && index < totalInGrid - 1);

  return (
    <div
      className="p-[48px_40px] max-[720px]:p-[36px_24px] relative group/card transition-colors duration-300"
      style={{
        borderRight: borderRight ? "1px solid var(--rule)" : undefined,
        borderBottom: "1px solid var(--rule)",
      }}
    >
      {/* Accent hover background */}
      <div
        className="absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none rounded-[2px]"
        style={{ background: tool.accentSoft }}
      />

      <div className="relative z-10">
        {/* Header row */}
        <div className="flex items-start justify-between mb-[32px]">
          <div
            className="w-[52px] h-[52px] rounded-[8px] flex items-center justify-center text-[24px] font-mono select-none"
            style={{
              background: tool.accentSoft,
              border: `1px solid ${tool.accent}22`,
            }}
            aria-hidden="true"
          >
            {tool.icon}
          </div>
          <StatusBadge status={tool.status} />
        </div>

        {/* Name + tagline */}
        <h2
          className="font-display font-normal text-[36px] max-[720px]:text-[28px] leading-[1.05] tracking-[-0.025em] mb-[8px] fvs-text m-0"
          style={{ color: "var(--ink)" }}
        >
          {tool.name}
        </h2>
        <div
          className="font-mono text-[12px] tracking-[0.08em] uppercase mb-[20px]"
          style={{ color: tool.accent }}
        >
          {tool.tagline}
        </div>

        {/* Description */}
        <p
          className="text-[15px] leading-[1.65] mb-[28px] max-w-[44ch] m-0"
          style={{ color: "var(--ink-2)" }}
        >
          {tool.description}
        </p>

        {/* Stats pills */}
        <div className="flex flex-wrap gap-[8px] mb-[36px]">
          {tool.stats.map((s) => (
            <span
              key={s}
              className="font-mono text-[10px] tracking-[0.1em] uppercase px-[10px] py-[4px] rounded-full"
              style={{
                background: "var(--bg-2)",
                color: "var(--ink-3)",
                border: "1px solid var(--rule)",
              }}
            >
              {s}
            </span>
          ))}
        </div>

        {/* CTA */}
        <div className="flex items-center gap-[16px] flex-wrap">
          {isLive ? (
            <Link
              href={tool.href}
              className="inline-flex items-center gap-[8px] font-mono text-[11px] uppercase tracking-[0.14em] font-semibold no-underline transition-all duration-200 group/link"
              style={{ color: tool.accent }}
            >
              Open tool
              <span
                className="inline-block transition-transform duration-200 group-hover/link:translate-x-[4px]"
                aria-hidden="true"
              >
                →
              </span>
            </Link>
          ) : (
            <span
              className="inline-flex items-center gap-[6px] font-mono text-[11px] uppercase tracking-[0.14em]"
              style={{ color: "var(--ink-4)" }}
            >
              <span
                className="w-[6px] h-[6px] rounded-full inline-block"
                style={{ background: "var(--ink-4)" }}
                aria-hidden="true"
              />
              Notify me when ready
            </span>
          )}
          {"bridge" in tool && tool.bridge === "bookbreaks" && (
            <Link
              href="/tools/bookbreaks"
              className="font-mono text-[9px] tracking-[0.12em] uppercase no-underline transition-colors px-[8px] py-[3px] rounded-full"
              style={{
                color: "#C85A2C",
                background: "rgba(200,90,44,0.1)",
                border: "1px solid rgba(200,90,44,0.2)",
              }}
            >
              pairs with BookBreaks →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function FlowiseCard(): React.ReactElement {
  const accent = "#16A34A";
  const accentSoft = "rgba(22,163,74,0.10)";

  return (
    <div
      className="p-[48px_40px] max-[720px]:p-[36px_24px] relative group/card transition-colors duration-300"
      style={{ borderTop: "1px solid var(--rule)" }}
    >
      {/* Accent hover background */}
      <div
        className="absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: accentSoft }}
      />

      <div className="relative z-10">
        <div className="grid grid-cols-[1fr_auto] max-[900px]:grid-cols-1 gap-[40px] items-start">
          <div>
            {/* Header */}
            <div className="flex items-center gap-[16px] mb-[24px] flex-wrap">
              <div
                className="w-[52px] h-[52px] rounded-[8px] flex items-center justify-center text-[24px] font-mono select-none"
                style={{ background: accentSoft, border: `1px solid ${accent}22` }}
                aria-hidden="true"
              >
                💸
              </div>
              <StatusBadge status="live" />
              <span
                className="font-mono text-[9px] tracking-[0.12em] uppercase px-[8px] py-[3px] rounded-full"
                style={{ color: accent, background: accentSoft, border: `1px solid ${accent}30` }}
              >
                🇳🇬 Nigeria-first
              </span>
            </div>

            <h2
              className="font-display font-normal text-[42px] max-[720px]:text-[32px] leading-[1.0] tracking-[-0.03em] mb-[8px] fvs-text m-0"
              style={{ color: "var(--ink)" }}
            >
              Flowise
            </h2>
            <div
              className="font-mono text-[12px] tracking-[0.08em] uppercase mb-[20px]"
              style={{ color: accent }}
            >
              Your money, mapped.
            </div>

            <p
              className="text-[15px] leading-[1.65] mb-[28px] max-w-[56ch] m-0"
              style={{ color: "var(--ink-2)" }}
            >
              A personal finance OS. Log transactions manually, import bank statements, scan
              receipts with AI, set monthly budgets and savings goals — then get plain-language
              insights into where your money actually goes. Built for Nigerian money flows:
              OPay, Kuda, PalmPay, GTBank, and more.
            </p>

            {/* Stats pills */}
            <div className="flex flex-wrap gap-[8px]">
              {["Multi-account", "AI categorization", "Budget & goals", "NGN-first", "CSV import"].map((s) => (
                <span
                  key={s}
                  className="font-mono text-[10px] tracking-[0.1em] uppercase px-[10px] py-[4px] rounded-full"
                  style={{ background: "var(--bg-2)", color: "var(--ink-3)", border: "1px solid var(--rule)" }}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* CTA block */}
          <div className="flex flex-col gap-[12px] max-[900px]:flex-row max-[900px]:flex-wrap">
            <Link
              href="/tools/flowise"
              className="inline-flex items-center justify-center gap-[8px] h-[48px] px-[28px] rounded-full font-mono text-[11px] uppercase tracking-[0.14em] font-semibold text-white no-underline transition-all duration-200 hover:opacity-90 group/link whitespace-nowrap"
              style={{ background: accent }}
            >
              Open Flowise
              <span className="inline-block transition-transform duration-200 group-hover/link:translate-x-[3px]" aria-hidden="true">
                →
              </span>
            </Link>
            <div
              className="px-[16px] py-[12px] rounded-[10px] text-center"
              style={{ background: accentSoft }}
            >
              <div className="font-mono text-[9px] tracking-[0.1em] uppercase mb-[2px]" style={{ color: accent }}>
                Free tier includes
              </div>
              <div className="text-[12px] text-[var(--ink-2)] leading-[1.5]">
                3 accounts · 100 tx/month · 3 goals
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: "live" | "soon";
}): React.ReactElement {
  if (status === "live") {
    return (
      <span
        className="inline-flex items-center gap-[6px] font-mono text-[9px] tracking-[0.14em] uppercase px-[10px] py-[4px] rounded-full font-semibold"
        style={{
          background: "rgba(45,80,22,0.15)",
          color: "#2D5016",
          border: "1px solid rgba(45,80,22,0.3)",
        }}
      >
        <span
          className="w-[5px] h-[5px] rounded-full"
          style={{ background: "#2D5016" }}
          aria-hidden="true"
        />
        Live
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center gap-[6px] font-mono text-[9px] tracking-[0.14em] uppercase px-[10px] py-[4px] rounded-full font-semibold"
      style={{
        background: "var(--bg-2)",
        color: "var(--ink-3)",
        border: "1px solid var(--rule)",
      }}
    >
      Coming soon
    </span>
  );
}
