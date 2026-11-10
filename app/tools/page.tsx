import type { Metadata } from "next";
import Link from "next/link";
import { MagneticWrapper } from "@/components/magnetic-wrapper";
import {
  LayoutGrid,
  BookMarked,
  BookOpen,
  Wallet,
  Compass,
  Share2,
  ArrowRight,
  Sparkles,
  Check,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Tools & Workbench · Michael Ojekunle",
  description:
    "Personal utilities, workflow experiments, and lab prototypes built by Michael Ojekunle — featuring Carousel Lab, his daily driver for Instagram carousel creation.",
};

interface LabTool {
  id: string;
  name: string;
  badge: string;
  tagline: string;
  description: string;
  notes: string;
  href: string;
  icon: typeof LayoutGrid;
  tags: string[];
}

const LAB_EXPERIMENTS: LabTool[] = [
  {
    id: "chapterly",
    name: "Chapterly",
    badge: "Prototype · Reading",
    tagline: "A distraction-free reading dashboard & EPUB companion.",
    description:
      "Built to test clean reader typography for EPUBs, highlight management, and reading streaks without bloated social network features.",
    notes: "Active prototype testing custom font rendering and highlight exports.",
    href: "/tools/chapterly",
    icon: BookMarked,
    tags: ["EPUB Reader", "Highlights", "Reading Streaks"],
  },
  {
    id: "bookbreaks",
    name: "BookBreaks",
    badge: "Experiment · Content",
    tagline: "Extracting core arguments and lessons from books.",
    description:
      "A personal experiment in breaking down non-fiction reading notes into structured takeaways, slide outlines, and bite-sized post drafts.",
    notes: "Prototype testing prompt pipelines for content structuring.",
    href: "/tools/bookbreaks",
    icon: BookOpen,
    tags: ["Book Notes", "Takeaways", "Draft Outlines"],
  },
  {
    id: "flowise",
    name: "Flowise",
    badge: "Work in progress · Finance",
    tagline: "A lightweight interface for personal money flows.",
    description:
      "A finance tracking experiment tailored to Nigerian money flows (OPay, Kuda, bank transaction SMS alerts) and simple spending categories without accounting clutter.",
    notes: "Early prototype testing manual logging and SMS parser concepts.",
    href: "/tools/flowise",
    icon: Wallet,
    tags: ["Expense Log", "NGN Alerts", "Category Budgets"],
  },
  {
    id: "journal",
    name: "Vela",
    badge: "Prototype · Reflection",
    tagline: "Daily check-ins, objectives, and reflection logs.",
    description:
      "A quiet, structured daily log experiment built to track daily intentions, energy levels, and priority milestones without productivity guilt.",
    notes: "Personal check-in experiment built for intentional daily logging.",
    href: "/tools/journal",
    icon: Compass,
    tags: ["Daily Logs", "Objectives", "Energy Tracking"],
  },
  {
    id: "thread-studio",
    name: "Thread Studio",
    badge: "Sandbox · Writing",
    tagline: "Distraction-free drafting for multi-post threads.",
    description:
      "A minimal writing scratchpad to preview post lengths, character counts, and thread pacing before copying over to social platforms.",
    notes: "Clean drafting scratchpad for long-form social threads.",
    href: "/tools/thread-studio",
    icon: Share2,
    tags: ["Writing Canvas", "Thread Splitter", "Pacing Preview"],
  },
];

export default function ToolsPage(): React.ReactElement {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="outline-none min-h-screen bg-(--bg) text-(--ink)"
    >
      {/* ── HERO / HEADER ── */}
      <section className="pt-32 sm:pt-36 lg:pt-40 pb-16 sm:pb-20 border-b border-(--rule)">
        <div className="max-w-(--maxw) mx-auto px-(--gutter)">
          <div className="flex flex-col gap-6 max-w-[85ch]">
            {/* Context Eyebrow */}
            <div className="flex items-center gap-3 font-mono text-xs text-muted-foreground flex-wrap">
              <span className="font-semibold text-(--ink)">Tools &amp; Lab</span>
              <span className="text-(--rule)">·</span>
              <span className="text-(--v3-accent) font-medium">Personal Workbench</span>
              <span className="text-(--rule)">·</span>
              <span>Updated 2026</span>
            </div>

            {/* Page Heading */}
            <h1 className="m-0 font-display font-normal text-4xl sm:text-5xl lg:text-6xl xl:text-7xl leading-[1.02] tracking-tight text-(--ink) fvs-display text-balance">
              Personal tools, utilities, and things{" "}
              <em className="not-italic italic text-(--v3-accent) fvs-soft">in the works.</em>
            </h1>

            {/* Honest Subtitle */}
            <p className="m-0 text-base sm:text-lg lg:text-xl text-secondary-foreground leading-relaxed max-w-[65ch]">
              A candid collection of utilities, workflow hacks, and prototypes I built to scratch my
              own everyday itches. Most of what you see here are work-in-progress experiments being
              fleshed out in the open — except <strong className="text-(--ink) font-semibold">Carousel Lab</strong>, which
              is my active, battle-tested daily driver for social publishing.
            </p>

            {/* Quick Status Bar */}
            <div className="flex items-center gap-4 pt-2 flex-wrap font-mono text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5 font-medium text-(--ink)">
                <span className="w-2 h-2 rounded-full bg-(--v3-accent)" aria-hidden="true" />
                1 Daily Driver (Carousel Lab)
              </span>
              <span className="text-(--rule)">/</span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-muted-foreground" aria-hidden="true" />
                5 Prototypes in Progress
              </span>
              <span className="text-(--rule)">/</span>
              <span>No paywalls · Free personal utilities</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── FLAGSHIP SPOTLIGHT: CAROUSEL LAB ── */}
      <section className="py-16 sm:py-20 lg:py-24 border-b border-(--rule)">
        <div className="max-w-(--maxw) mx-auto px-(--gutter)">
          {/* Spotlight Header */}
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 sm:gap-6 mb-10 sm:mb-12">
            <div className="shrink-0">
              <div className="flex items-center gap-2 font-mono text-xs text-(--v3-accent) font-medium mb-2 flex-wrap">
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span>Featured Daily Driver</span>
                <span className="text-(--rule)">·</span>
                <span className="text-muted-foreground">Active Production Use</span>
              </div>
              <h2 className="m-0 font-display font-normal text-3xl sm:text-4xl lg:text-5xl leading-tight tracking-tight text-(--ink) fvs-display">
                Carousel Lab
              </h2>
            </div>
            <p className="m-0 max-w-[50ch] text-sm sm:text-base text-secondary-foreground leading-relaxed">
              The tool I actually use to design and export every multi-slide carousel I post on my
              personal Instagram (<span className="font-mono text-xs text-(--ink)">@devvmichaell</span>).
            </p>
          </div>

          {/* Spotlight Presentation Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10 xl:gap-14 items-start">
            {/* Left: Punchy Purpose & Highlights */}
            <div className="flex flex-col gap-6">
              <p className="m-0 text-lg sm:text-xl text-(--ink) leading-relaxed max-w-[52ch]">
                Built for raw speed: pick an aesthetic mood, draft your slides, and export retina PNG decks directly from your browser in seconds.
              </p>

              {/* Core Strengths */}
              <div className="space-y-3.5 pt-1">
                <div className="flex items-center gap-3 text-base text-secondary-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-(--v3-accent) shrink-0" aria-hidden="true" />
                  <span>Instant high-res PNG &amp; ZIP exports rendered 100% in-browser</span>
                </div>
                <div className="flex items-center gap-3 text-base text-secondary-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-(--v3-accent) shrink-0" aria-hidden="true" />
                  <span>Curated typographic moods: Fraunces, Grotesk, Playfair &amp; Minimal</span>
                </div>
                <div className="flex items-center gap-3 text-base text-secondary-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-(--v3-accent) shrink-0" aria-hidden="true" />
                  <span>Flexible aspect ratios: 4:5 Instagram portrait &amp; 1:1 square</span>
                </div>
                <div className="flex items-center gap-3 text-base text-secondary-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-(--v3-accent) shrink-0" aria-hidden="true" />
                  <span>Zero lag, no account required, and auto-saving scratchpad</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-4 pt-2 flex-wrap">
                <MagneticWrapper strength={15}>
                  <Link
                    href="/tools/carousel-lab"
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-mono text-xs tracking-wider font-semibold bg-(--ink) text-(--bg) no-underline transition-all duration-200 hover:opacity-90 hover:scale-[1.02]"
                  >
                    Open Carousel Lab <ArrowRight className="w-4 h-4" />
                  </Link>
                </MagneticWrapper>
                <span className="font-mono text-xs text-muted-foreground">
                  Free · Runs 100% client-side
                </span>
              </div>
            </div>

            {/* Right: Clean Live Preview Canvas */}
            <div className="border border-(--rule) rounded-2xl overflow-hidden bg-(--paper) shadow-[0_16px_40px_-16px_color-mix(in_oklab,var(--ink)_8%,transparent)]">
              {/* Chrome header */}
              <div className="h-10 px-4 border-b border-(--rule) flex items-center justify-between font-mono text-xs text-muted-foreground">
                <svg width="36" height="10" viewBox="0 0 36 10" fill="none" aria-hidden="true" className="shrink-0">
                  <circle cx="5" cy="5" r="4" fill="var(--rule)" />
                  <circle cx="17" cy="5" r="4" fill="var(--rule)" />
                  <circle cx="29" cy="5" r="4" fill="var(--rule)" />
                </svg>
                <span className="text-(--ink) font-medium">tools/carousel-lab · Live Canvas</span>
                <span className="text-(--v3-accent) font-semibold">● Ready</span>
              </div>

              {/* Sample Slide Graphic */}
              <div className="p-8 sm:p-10 flex flex-col justify-between aspect-[4/3] relative">
                <div className="flex items-center justify-between font-mono text-xs text-muted-foreground">
                  <span className="text-(--v3-accent) font-semibold">01 / 06</span>
                  <span>Instagram 4:5</span>
                </div>

                <div className="my-auto py-4">
                  <div className="font-mono text-xs text-(--v3-accent) font-medium tracking-wider mb-2">
                    The Art of Shipping
                  </div>
                  <h3 className="m-0 font-display font-normal text-2xl sm:text-3xl leading-tight text-(--ink) fvs-display">
                    Stop designing for perfection. Ship the prototype and let real usage show you where to polish.
                  </h3>
                </div>

                <div className="flex items-center justify-between font-mono text-xs pt-4 border-t border-(--rule)/50 text-muted-foreground">
                  <span className="font-semibold text-(--ink)">@devvmichaell</span>
                  <span>Swipe next →</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── THE WORKBENCH SHELF: EDITORIAL ROW LIST (FLAT HIERARCHY) ── */}
      <section className="py-16 sm:py-20 lg:py-24 border-b border-(--rule)">
        <div className="max-w-(--maxw) mx-auto px-(--gutter)">
          {/* Shelf Section Header */}
          <div className="max-w-[65ch] mb-12 sm:mb-16">
            <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground mb-2">
              <span className="font-semibold text-(--ink)">The Workbench Shelf</span>
              <span className="text-(--rule)">·</span>
              <span className="text-(--v3-accent) font-medium">In Fleshing Out State</span>
            </div>
            <h2 className="m-0 font-display font-normal text-3xl sm:text-4xl lg:text-5xl leading-tight tracking-tight text-(--ink) fvs-display mb-4">
              Experimental prototypes &amp; utilities.
            </h2>
            <p className="m-0 text-base text-secondary-foreground leading-relaxed">
              These are personal experiments and early-stage prototypes I have built to test
              APIs, reader interfaces, and workflows. They are rough around the edges, openly evolving, and free to explore.
            </p>
          </div>

          {/* Flat Editorial Rows */}
          <div className="border-t border-(--rule)" role="list" aria-label="Workbench prototypes list">
            {LAB_EXPERIMENTS.map((tool) => (
              <div
                key={tool.id}
                className="py-8 sm:py-10 border-b border-(--rule) grid grid-cols-1 lg:grid-cols-[1.2fr_1.5fr_auto] gap-6 lg:gap-10 items-start group"
                role="listitem"
              >
                {/* Column 1: Identity & Meta */}
                <div>
                  <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground mb-2">
                    <span className="font-medium text-(--v3-accent)">{tool.badge}</span>
                  </div>
                  <h3 className="m-0 font-display font-normal text-2xl sm:text-3xl text-(--ink) group-hover:text-(--v3-accent) transition-colors fvs-display">
                    {tool.name}
                  </h3>
                  <div className="font-mono text-xs text-muted-foreground mt-1">
                    {tool.tagline}
                  </div>
                </div>

                {/* Column 2: Problem & Notes */}
                <div className="space-y-3 max-w-[65ch]">
                  <p className="m-0 text-sm sm:text-base text-secondary-foreground leading-relaxed">
                    {tool.description}
                  </p>
                  <div className="font-mono text-xs text-muted-foreground">
                    <span className="text-(--ink) font-medium">Current status:</span> {tool.notes}
                  </div>
                  <ul className="flex flex-wrap gap-2 pt-1 m-0 p-0 list-none font-mono text-xs text-muted-foreground" role="list">
                    {tool.tags.map((t) => (
                      <li key={t} className="after:content-['·'] after:ml-2 last:after:content-none">
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Column 3: Launch Action */}
                <div className="lg:text-right pt-1">
                  <Link
                    href={tool.href}
                    className="inline-flex items-center gap-2 font-mono text-xs tracking-wider font-semibold text-(--ink) group-hover:text-(--v3-accent) transition-colors no-underline py-2"
                  >
                    <span>Launch prototype</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </main>
  );
}
