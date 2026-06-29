import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Creator Suite",
  description:
    "Michael Ojekunle's creator tools — BookBreaks, Thread Studio, Carousel Lab, and more. Build in public, learn out loud.",
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
    id: "content-calendar",
    name: "Content Calendar",
    tagline: "Ship consistently. Never miss a week.",
    description:
      "Plan and schedule content across X, Instagram, and your blog. Drag-and-drop calendar, batch scheduling, and a publishing queue.",
    status: "soon" as const,
    href: "#",
    accent: "#2D5016",
    accentSoft: "rgba(45,80,22,0.12)",
    icon: "📅",
    stats: ["Multi-platform", "Batch scheduling", "Analytics"],
  },
];

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
        <div
          className="max-w-[var(--maxw)] mx-auto px-[var(--gutter)]"
        >
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
                A suite of creator tools for people learning in public.
                Read more, build better, ship consistently — and let your
                community grow alongside you.
              </p>
              <div className="mt-[32px] flex items-center gap-[16px] flex-wrap">
                <Link
                  href="/tools/bookbreaks"
                  className="inline-flex items-center gap-[8px] h-[48px] px-[24px] rounded-full font-mono text-[11px] uppercase tracking-[0.14em] font-semibold text-white no-underline transition-all duration-200 hover:opacity-90 hover:scale-[1.02]"
                  style={{ background: "var(--v3-accent)" }}
                >
                  Launch BookBreaks{" "}
                  <span className="text-[14px]" aria-hidden="true">→</span>
                </Link>
                <span
                  className="font-mono text-[11px] tracking-[0.12em] uppercase"
                  style={{ color: "var(--ink-4)" }}
                >
                  3 more tools coming
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Tool grid ── */}
      <section className="max-w-[var(--maxw)] mx-auto px-[var(--gutter)] py-[100px] max-[720px]:py-[64px]">
        <div className="grid grid-cols-2 max-[900px]:grid-cols-1 gap-0 border border-[var(--rule)] rounded-[2px]">
          {TOOLS.map((tool, i) => (
            <ToolCard key={tool.id} tool={tool} index={i} />
          ))}
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
}: {
  tool: (typeof TOOLS)[number];
  index: number;
}): React.ReactElement {
  const isLive = tool.status === "live";
  const borderRight = index % 2 === 0;
  const borderBottom = index < 2;

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
        className="absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none rounded-[2px]"
        style={{ background: tool.accentSoft }}
      />

      <div className="relative z-10">
        {/* Header row */}
        <div className="flex items-start justify-between mb-[32px]">
          <div
            className="w-[52px] h-[52px] rounded-[8px] flex items-center justify-center text-[24px] font-mono select-none"
            style={{ background: tool.accentSoft, border: `1px solid ${tool.accent}22` }}
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
