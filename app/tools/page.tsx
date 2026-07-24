import { MagneticWrapper } from "@/components/magnetic-wrapper";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Creator Suite — Michael Ojekunle",
  description:
    "Six live tools built for creators who read, ship, and share: BookBreaks turns books into content, Chapterly is a reading OS with AI voice chat, Flowise tracks your money, Vela is a life journal for objectives and daily logs, Thread Studio engineers viral X threads, and Carousel Lab builds scroll-stopping slides.",
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
    cta: "Repurpose my first book",
  },
  {
    id: "thread-studio",
    name: "Thread Studio",
    tagline: "Engineer viral threads.",
    description:
      "Draft, structure, and schedule long-form X threads. Hook optimiser, engagement analytics, and a distraction-free writing canvas.",
    status: "live" as const,
    href: "/tools/thread-studio",
    accent: "#6366F1",
    accentSoft: "rgba(99,102,241,0.12)",
    icon: "🐦",
    stats: ["Thread builder", "Hook analyser", "Scheduling"],
    cta: "Engineer my next thread",
  },
  {
    id: "carousel-lab",
    name: "Carousel Lab",
    tagline: "Design scroll-stopping slides.",
    description:
      "Build Instagram and LinkedIn carousels with book-themed templates. Export as PNG or HTML, publish directly from the browser.",
    status: "live" as const,
    href: "/tools/carousel-lab",
    accent: "#FF6B35",
    accentSoft: "rgba(255,107,53,0.12)",
    icon: "📸",
    stats: ["4 visual themes", "6-slide templates", "One-click export"],
    cta: "Design a scroll-stopper",
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
    cta: "Start remembering more",
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
        className="pt-40 pb-[100px] max-[720px]:pt-30 max-[720px]:pb-16 border-b"
        style={{ borderColor: "var(--rule)" }}
      >
        <div className="max-w-(--maxw) mx-auto px-(--gutter)">
          <div className="grid grid-cols-[1fr_auto] max-[900px]:grid-cols-1 gap-12 items-end">
            <div>
              <div className="v3-eyebrow mb-7">CREATOR SUITE · TOOLS</div>
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
                Six production tools I built because I needed them. Turn books
                into content, track every naira, journal your objectives, build
                viral threads, design carousel slides — and read anything with
                an AI that remembers your highlights.
              </p>
              <div className="mt-8 flex items-center gap-4 flex-wrap">
                <MagneticWrapper>
                  <Link
                    href="/tools/bookbreaks"
                    className="inline-flex items-center gap-2 h-12 px-6 rounded-full font-mono text-[11px] uppercase tracking-[0.14em] font-semibold text-(--bg) no-underline transition-all duration-200 hover:opacity-90 hover:scale-[1.02]"
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
                    href="/tools/journal"
                    className="inline-flex items-center gap-2 h-12 px-6 rounded-full font-mono text-[11px] uppercase tracking-[0.14em] font-semibold no-underline transition-all duration-200 hover:opacity-90 hover:scale-[1.02]"
                    style={{ background: "rgba(124,58,237,0.12)", color: "#7C3AED", border: "1px solid rgba(124,58,237,0.25)" }}
                  >
                    Try Vela{" "}
                    <span className="text-[14px]" aria-hidden="true">→</span>
                  </Link>
                </MagneticWrapper>
                <MagneticWrapper>
                  <Link
                    href="/tools/chapterly"
                    className="inline-flex items-center gap-2 h-12 px-6 rounded-full font-mono text-[11px] uppercase tracking-[0.14em] font-semibold no-underline transition-all duration-200 hover:opacity-90 hover:scale-[1.02]"
                    style={{ background: "rgba(79,109,122,0.12)", color: "#4F6D7A", border: "1px solid rgba(79,109,122,0.25)" }}
                  >
                    Try Chapterly{" "}
                    <span className="text-[14px]" aria-hidden="true">→</span>
                  </Link>
                </MagneticWrapper>
                <MagneticWrapper>
                  <Link
                    href="/tools/flowise"
                    className="inline-flex items-center gap-2 h-12 px-6 rounded-full font-mono text-[11px] uppercase tracking-[0.14em] font-semibold no-underline transition-all duration-200 hover:opacity-90 hover:scale-[1.02]"
                    style={{ background: "rgba(22,163,74,0.12)", color: "#16A34A", border: "1px solid rgba(22,163,74,0.25)" }}
                  >
                    Try Flowise{" "}
                    <span className="text-[14px]" aria-hidden="true">→</span>
                  </Link>
                </MagneticWrapper>
                <MagneticWrapper>
                  <Link
                    href="/tools/thread-studio"
                    className="inline-flex items-center gap-2 h-12 px-6 rounded-full font-mono text-[11px] uppercase tracking-[0.14em] font-semibold no-underline transition-all duration-200 hover:opacity-90 hover:scale-[1.02]"
                    style={{ background: "rgba(99,102,241,0.12)", color: "#6366F1", border: "1px solid rgba(99,102,241,0.25)" }}
                  >
                    Try Thread Studio{" "}
                    <span className="text-[14px]" aria-hidden="true">→</span>
                  </Link>
                </MagneticWrapper>
                <MagneticWrapper>
                  <Link
                    href="/tools/carousel-lab"
                    className="inline-flex items-center gap-2 h-12 px-6 rounded-full font-mono text-[11px] uppercase tracking-[0.14em] font-semibold no-underline transition-all duration-200 hover:opacity-90 hover:scale-[1.02]"
                    style={{ background: "rgba(255,107,53,0.12)", color: "#FF6B35", border: "1px solid rgba(255,107,53,0.25)" }}
                  >
                    Try Carousel Lab{" "}
                    <span className="text-[14px]" aria-hidden="true">→</span>
                  </Link>
                </MagneticWrapper>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Tool grid: 2×2 + full-width Flowise ── */}
      <section className="max-w-(--maxw) mx-auto px-(--gutter) py-[100px] max-[720px]:py-16">
        <div className="border border-(--rule) rounded-sm">
          {/* Top 4 tools — 2 column */}
          <div className="grid grid-cols-2 max-[900px]:grid-cols-1">
            {TOOLS.map((tool, i) => (
              <ToolCard key={tool.id} tool={tool} index={i} totalInGrid={TOOLS.length} />
            ))}
          </div>
          {/* Vela — full-width featured row */}
          <VelaCard />
          {/* Flowise — full-width featured row */}
          <FlowiseCard />
        </div>
      </section>

      {/* ── Philosophy strip ── */}
      <section
        className="border-y py-20 max-[720px]:py-14"
        style={{
          borderColor: "var(--rule)",
          background: "var(--bg-2)",
        }}
      >
        <div className="max-w-(--maxw) mx-auto px-(--gutter)">
          <div className="grid grid-cols-3 max-[720px]:grid-cols-1 gap-12">
            {[
              {
                num: "01",
                head: "Built for actual use.",
                body: "Every tool here has auth, a real database, AI integrations, and handles edge cases. Not demos — products.",
              },
              {
                num: "02",
                head: "Nigerian context, global reach.",
                body: "Flowise supports OPay, Kuda, and GTBank natively. The other tools work for anyone, anywhere.",
              },
              {
                num: "03",
                head: "Free to start.",
                body: "All tools have a free tier that covers real daily use. No bait-and-switch. Upgrade only when you need more.",
              },
            ].map((p) => (
              <div key={p.num}>
                <div
                  className="font-mono text-[10px] tracking-[0.18em] uppercase mb-4"
                  style={{ color: "var(--ink-4)" }}
                >
                  {p.num}
                </div>
                <h3
                  className="font-display font-normal text-[28px] leading-[1.1] tracking-[-0.02em] mb-3 fvs-text m-0"
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
        borderBottom: borderBottom ? "1px solid var(--rule)" : undefined,
      }}
    >
      {/* Accent hover background */}
      <div
        className="absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none rounded-sm"
        style={{ background: tool.accentSoft }}
      />

      <div className="relative z-10">
        {/* Header row */}
        <div className="flex items-start justify-between mb-8">
          <div
            className="w-13 h-13 rounded-lg flex items-center justify-center text-[24px] font-mono select-none"
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
          className="font-display font-normal text-[36px] max-[720px]:text-[28px] leading-[1.05] tracking-tight mb-2 fvs-text m-0"
          style={{ color: "var(--ink)" }}
        >
          {tool.name}
        </h2>
        <div
          className="font-mono text-[12px] tracking-[0.08em] uppercase mb-5"
          style={{ color: tool.accent }}
        >
          {tool.tagline}
        </div>

        {/* Description */}
        <p
          className="text-[15px] leading-[1.65] mb-7 max-w-[44ch] m-0"
          style={{ color: "var(--ink-2)" }}
        >
          {tool.description}
        </p>

        {/* Stats pills */}
        <div className="flex flex-wrap gap-2 mb-9">
          {tool.stats.map((s) => (
            <span
              key={s}
              className="font-mono text-[10px] tracking-widest uppercase px-2.5 py-1 rounded-full"
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
        <div className="flex items-center gap-4 flex-wrap">
          {isLive ? (
            <Link
              href={tool.href}
              className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] font-semibold no-underline transition-all duration-200 group/link"
              style={{ color: tool.accent }}
            >
              {tool.cta}
              <span
                className="inline-block transition-transform duration-200 group-hover/link:translate-x-1"
                aria-hidden="true"
              >
                →
              </span>
            </Link>
          ) : (
            <span
              className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.14em]"
              style={{ color: "var(--ink-4)" }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full inline-block"
                style={{ background: "var(--ink-4)" }}
                aria-hidden="true"
              />
              Notify me when ready
            </span>
          )}
          {"bridge" in tool && tool.bridge === "bookbreaks" && (
            <Link
              href="/tools/bookbreaks"
              className="font-mono text-[9px] tracking-[0.12em] uppercase no-underline transition-colors px-2 py-0.75 rounded-full"
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

function VelaCard(): React.ReactElement {
  const accent = "#7C3AED";
  const accentSoft = "rgba(124,58,237,0.10)";

  return (
    <div
      className="p-[48px_40px] max-[720px]:p-[36px_24px] relative group/card transition-colors duration-300"
      style={{ borderTop: "1px solid var(--rule)" }}
    >
      <div
        className="absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: accentSoft }}
      />
      <div className="relative z-10">
        <div className="grid grid-cols-[1fr_auto] max-[900px]:grid-cols-1 gap-10 items-start">
          <div>
            <div className="flex items-center gap-4 mb-6 flex-wrap">
              <div
                className="w-13 h-13 rounded-lg flex items-center justify-center text-[24px] font-mono select-none"
                style={{ background: accentSoft, border: `1px solid ${accent}22` }}
                aria-hidden="true"
              >
                🧭
              </div>
              <StatusBadge status="live" />
              <span
                className="font-mono text-[9px] tracking-[0.12em] uppercase px-2 py-0.75 rounded-full"
                style={{ color: accent, background: accentSoft, border: `1px solid ${accent}30` }}
              >
                ★ Daily driver
              </span>
            </div>

            <h2
              className="font-display font-normal text-[42px] max-[720px]:text-[32px] leading-[1.0] tracking-[-0.03em] mb-2 fvs-text m-0"
              style={{ color: "var(--ink)" }}
            >
              Vela
            </h2>
            <div
              className="font-mono text-[12px] tracking-[0.08em] uppercase mb-5"
              style={{ color: accent }}
            >
              Set your course. Log your progress.
            </div>

            <p
              className="text-[15px] leading-[1.65] mb-7 max-w-[56ch] m-0"
              style={{ color: "var(--ink-2)" }}
            >
              A structured life journal for people who want to move with intention. Set clear
              objectives with milestones, plan each day against them, log what you actually
              accomplished, and track where your energy really goes — day by day.
            </p>

            <div className="flex flex-wrap gap-2">
              {[
                "Objectives + milestones",
                "Daily structured logs",
                "7-day streak",
                "Energy tracking",
                "Priority-first",
                "Reflection prompts",
              ].map((s) => (
                <span
                  key={s}
                  className="font-mono text-[10px] tracking-widest uppercase px-2.5 py-1 rounded-full"
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
          </div>

          <div className="flex flex-col gap-3 max-[900px]:flex-row max-[900px]:flex-wrap">
            <Link
              href="/tools/journal"
              className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-full font-mono text-[11px] uppercase tracking-[0.14em] font-semibold text-white no-underline transition-all duration-200 hover:opacity-90 group/link whitespace-nowrap"
              style={{ background: accent }}
            >
              Set my first objective
              <span
                className="inline-block transition-transform duration-200 group-hover/link:translate-x-0.75"
                aria-hidden="true"
              >
                →
              </span>
            </Link>
            <div
              className="px-4 py-3 rounded-[10px] text-center"
              style={{ background: accentSoft }}
            >
              <div
                className="font-mono text-[9px] tracking-widest uppercase mb-0.5"
                style={{ color: accent }}
              >
                Free tier includes
              </div>
              <div
                className="text-[12px] leading-normal"
                style={{ color: "var(--ink-2)" }}
              >
                Unlimited logs · All objectives · Streaks
              </div>
            </div>
          </div>
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
        <div className="grid grid-cols-[1fr_auto] max-[900px]:grid-cols-1 gap-10 items-start">
          <div>
            {/* Header */}
            <div className="flex items-center gap-4 mb-6 flex-wrap">
              <div
                className="w-13 h-13 rounded-lg flex items-center justify-center text-[24px] font-mono select-none"
                style={{ background: accentSoft, border: `1px solid ${accent}22` }}
                aria-hidden="true"
              >
                💸
              </div>
              <StatusBadge status="live" />
              <span
                className="font-mono text-[9px] tracking-[0.12em] uppercase px-2 py-0.75 rounded-full"
                style={{ color: accent, background: accentSoft, border: `1px solid ${accent}30` }}
              >
                🇳🇬 Nigeria-first
              </span>
            </div>

            <h2
              className="font-display font-normal text-[42px] max-[720px]:text-[32px] leading-[1.0] tracking-[-0.03em] mb-2 fvs-text m-0"
              style={{ color: "var(--ink)" }}
            >
              Flowise
            </h2>
            <div
              className="font-mono text-[12px] tracking-[0.08em] uppercase mb-5"
              style={{ color: accent }}
            >
              Your money, mapped.
            </div>

            <p
              className="text-[15px] leading-[1.65] mb-7 max-w-[56ch] m-0"
              style={{ color: "var(--ink-2)" }}
            >
              A personal finance OS. Log transactions manually, import bank statements, scan
              receipts with AI, set monthly budgets and savings goals — then get plain-language
              insights into where your money actually goes. Built for Nigerian money flows:
              OPay, Kuda, PalmPay, GTBank, and more.
            </p>

            {/* Stats pills */}
            <div className="flex flex-wrap gap-2">
              {["Multi-account", "AI categorization", "Budget & goals", "NGN-first", "CSV import"].map((s) => (
                <span
                  key={s}
                  className="font-mono text-[10px] tracking-widest uppercase px-2.5 py-1 rounded-full"
                  style={{ background: "var(--bg-2)", color: "var(--ink-3)", border: "1px solid var(--rule)" }}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* CTA block */}
          <div className="flex flex-col gap-3 max-[900px]:flex-row max-[900px]:flex-wrap">
            <Link
              href="/tools/flowise"
              className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-full font-mono text-[11px] uppercase tracking-[0.14em] font-semibold text-white no-underline transition-all duration-200 hover:opacity-90 group/link whitespace-nowrap"
              style={{ background: accent }}
            >
              Take control of my money
              <span className="inline-block transition-transform duration-200 group-hover/link:translate-x-0.75" aria-hidden="true">
                →
              </span>
            </Link>
            <div
              className="px-4 py-3 rounded-[10px] text-center"
              style={{ background: accentSoft }}
            >
              <div className="font-mono text-[9px] tracking-widest uppercase mb-0.5" style={{ color: accent }}>
                Free tier includes
              </div>
              <div className="text-[12px] text-secondary-foreground leading-normal">
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
        className="inline-flex items-center gap-1.5 font-mono text-[9px] tracking-[0.14em] uppercase px-2.5 py-1 rounded-full font-semibold"
        style={{
          background: "rgba(45,80,22,0.15)",
          color: "#2D5016",
          border: "1px solid rgba(45,80,22,0.3)",
        }}
      >
        <span
          className="w-1.25 h-1.25 rounded-full"
          style={{ background: "#2D5016" }}
          aria-hidden="true"
        />
        Live
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center gap-1.5 font-mono text-[9px] tracking-[0.14em] uppercase px-2.5 py-1 rounded-full font-semibold"
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
