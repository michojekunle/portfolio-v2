"use client"

import { useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, useScroll, useTransform } from "framer-motion"
import { FEATURED_PROJECTS, type FeaturedProject } from "@/lib/case-studies"
import { MagneticWrapper } from "./magnetic-wrapper"
import { AnimatedCounter } from "./animated-counter"
import { ArrowRight, ArrowUpRight, Sparkles } from "lucide-react"

// Specific highlight metrics for the 4 projects
const PROJECT_METRICS: Record<string, { n: string; l: string }[]> = {
  zamir: [
    { n: "40.7%", l: "Repeat rate" },
    { n: "4.7k", l: "Plays logged" },
  ],
  coinsafe: [
    { n: "200+", l: "Wallets onboarded" },
    { n: "10+", l: "Transaction types" },
  ],
  "triple-cure": [
    { n: "20", l: "Scholars supported" },
    { n: "~8 wks", l: "Zero to production" },
  ],
  "zk-implementations": [
    { n: "3", l: "Protocols verified" },
    { n: "1", l: "Critical bug solved" },
  ],
}

interface DeckCardProps {
  project: FeaturedProject
  index: number
  total: number
}

function DeckCard({ project, index, total }: DeckCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const metrics = PROJECT_METRICS[project.slug] ?? []

  // Top offset for stacked deck tabs: each card sticks slightly lower than the previous one
  const topOffset = 100 + index * 24

  return (
    <div
      ref={cardRef}
      style={{
        top: `${topOffset}px`,
        zIndex: index + 1,
      }}
      className="sticky mb-16 sm:mb-24 last:mb-0 transition-transform duration-300"
    >
      <div className="relative rounded-3xl border border-(--rule) bg-(--paper) shadow-[0_30px_70px_-20px_color-mix(in_oklab,var(--ink)_14%,transparent)] overflow-hidden transition-all duration-300 hover:border-(--v3-accent-soft)">
        {/* Subtle accent hairline header */}
        <div className="h-1 w-full bg-gradient-to-r from-transparent via-(--v3-accent) to-transparent opacity-40" />

        <div className="p-7 sm:p-10 lg:p-12 xl:p-14 grid grid-cols-1 lg:grid-cols-[1.1fr_1.3fr] gap-10 xl:gap-14 items-center">
          {/* Left Column: Project Narrative & Specifications */}
          <div className="flex flex-col gap-6 min-w-0">
            {/* Top Eyebrow: Index + Category + Live badge */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-[13px] text-(--v3-accent) font-semibold tracking-wider">
                  0{index + 1}
                </span>
                <span className="text-(--rule)">/</span>
                <span className="font-mono text-[11px] tracking-[0.14em] uppercase text-muted-foreground font-medium px-3 py-1 rounded-full border border-(--rule) bg-(--bg-2)/80">
                  {project.tag.split(" · ")[0]} · {project.year}
                </span>
              </div>

              {project.live && (
                <a
                  href={`https://${project.live.replace(/^https?:\/\//, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[11px] tracking-[0.08em] uppercase text-(--v3-accent) hover:text-(--ink) transition-colors flex items-center gap-1 font-medium no-underline"
                >
                  {project.liveLabel ?? "Live Project"} <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            {/* Giant Title */}
            <div>
              <h3 className="m-0 font-display font-light text-[clamp(34px,4.5vw,58px)] leading-[1.05] tracking-[-0.03em] text-(--ink) fvs-display">
                {project.name}
              </h3>
              <p className="mt-2 font-mono text-[13px] text-muted-foreground tracking-[0.02em]">
                {project.role}
              </p>
            </div>

            {/* Description / Lede */}
            <p className="m-0 text-[16px] sm:text-[17px] text-secondary-foreground leading-[1.65] max-w-[52ch]">
              {project.lede ? `${project.lede} — ` : ""}
              {project.desc}
            </p>

            {/* Metrics Ticker (Bold proof points) */}
            {metrics.length > 0 && (
              <div className="grid grid-cols-2 gap-4 pt-2 pb-1">
                {metrics.map((m) => (
                  <div
                    key={m.l}
                    className="p-3.5 rounded-2xl border border-(--rule)/70 bg-(--bg-2)/50 flex flex-col gap-1"
                  >
                    <div className="font-display font-light text-[28px] sm:text-[32px] text-(--ink) leading-none">
                      <AnimatedCounter value={m.n} />
                    </div>
                    <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                      {m.l}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Tech Stack badges */}
            <div className="flex flex-wrap gap-2 pt-1 border-t border-(--rule)/50">
              {project.stack.slice(0, 5).map((tech) => (
                <span
                  key={tech}
                  className="font-mono text-[11px] px-2.5 py-1 rounded bg-(--bg-2) text-secondary-foreground border border-(--rule)/60"
                >
                  {tech}
                </span>
              ))}
            </div>

            {/* Action Row */}
            <div className="flex items-center gap-4 pt-2">
              <MagneticWrapper strength={15}>
                <Link
                  href={`/work/${project.slug}`}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-mono text-[12px] uppercase tracking-wider font-medium border border-(--rule) bg-(--ink) text-(--bg) transition-all duration-200 no-underline hover:opacity-90 shadow-sm"
                >
                  Read Case Study <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </MagneticWrapper>
            </div>
          </div>

          {/* Right Column: Hardware Frame / Panoramic Mockup */}
          <div className="relative w-full aspect-[16/11] rounded-2xl overflow-hidden border border-(--rule) bg-(--bg-2) shadow-[0_20px_50px_-15px_color-mix(in_oklab,var(--ink)_10%,transparent)] group">
            {project.image ? (
              <div className="relative w-full h-full overflow-hidden">
                <Image
                  src={project.image}
                  alt={project.name}
                  fill
                  className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  sizes="(max-width: 1024px) 100vw, 700px"
                  priority={index === 0}
                  unoptimized={project.image.endsWith(".svg")}
                />
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center font-display text-[32px] text-muted-foreground">
                {project.name}
              </div>
            )}

            {/* Corner floating pill */}
            <div className="absolute bottom-4 right-4 z-10 font-mono text-[11px] px-3.5 py-1.5 rounded-full bg-(--bg)/90 backdrop-blur-md border border-(--rule) text-(--ink) flex items-center gap-2 shadow-sm pointer-events-none">
              <span className="w-1.5 h-1.5 rounded-full bg-(--v3-accent)" />
              {project.slug === "zk-implementations"
                ? "Criterion Harness"
                : project.slug === "zamir"
                ? "Web + Flutter Beta"
                : "Production Deployed"}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ProjectsStackedDeck(): React.ReactElement {
  return (
    <div className="relative">
      <div className="flex flex-col">
        {FEATURED_PROJECTS.map((project, index) => (
          <DeckCard
            key={project.slug}
            project={project}
            index={index}
            total={FEATURED_PROJECTS.length}
          />
        ))}
      </div>
    </div>
  )
}
