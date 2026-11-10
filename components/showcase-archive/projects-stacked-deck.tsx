"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { FEATURED_PROJECTS, type FeaturedProject } from "@/lib/case-studies"
import { MagneticWrapper } from "../magnetic-wrapper"
import { AnimatedCounter } from "../animated-counter"
import { ArrowRight, Lock, ExternalLink } from "lucide-react"

// Gallery views for each project so visitors can inspect real screens at scale
interface ProjectView {
  id: string
  label: string
  src: string
  caption: string
}

const PROJECT_VIEWS: Record<string, ProjectView[]> = {
  coinsafe: [
    {
      id: "landing",
      label: "Hero Showcase",
      src: "/work/coinsafe/coinsafe-landing.png",
      caption: "Self-sovereign savings with zero-custody multi-sig escrow.",
    },
    {
      id: "vaults",
      label: "On-Chain Vaults",
      src: "/work/coinsafe/vault.webp",
      caption: "Discipline-first time-locked vaults deployed across Base & Lisk mainnets.",
    },
    {
      id: "dashboard",
      label: "Reactive Dashboard",
      src: "/work/coinsafe/dash.webp",
      caption: "Real-time portfolio telemetry listening to 10+ smart contract events.",
    },
  ],
  zamir: [
    {
      id: "marketing",
      label: "Desktop Web",
      src: "/work/zamir/01-marketing-hero-desktop.webp",
      caption: "Scripture-led generative worship for 69 believers across 10 languages.",
    },
    {
      id: "altar",
      label: "The Altar Streak",
      src: "/work/zamir/03-marketing-altar-desktop.webp",
      caption: "Daily spiritual habit loop with forgiving streak logic.",
    },
    {
      id: "ios",
      label: "iOS Native",
      src: "/work/zamir/10-app-altar-ios.webp",
      caption: "Mobile-first worship interface optimized for daily prayer.",
    },
  ],
  "triple-cure": [
    {
      id: "laptop",
      label: "Studio Display",
      src: "/work/triple-cure/tca-landing-on-laptop.png",
      caption: "Digital literacy centers and scholarships in Ondo State.",
    },
    {
      id: "landing",
      label: "Impact Home",
      src: "/work/triple-cure/tca_landing_page.png",
      caption: "Headless CMS enabling non-technical board members to publish updates.",
    },
    {
      id: "scholarships",
      label: "Scholarships Hub",
      src: "/work/triple-cure/tca_scholarships_page.png",
      caption: "Merit scholarship portal managing applications and student records.",
    },
  ],
  "zk-implementations": [
    {
      id: "harness",
      label: "Criterion Benchmark",
      src: "/work/peacefulnes.png",
      caption: "Rust implementations of Sumcheck, GKR layered circuits, and KZG commitments.",
    },
  ],
}

// Hard proof points
const PROJECT_METRICS: Record<string, { n: string; l: string; desc: string }[]> = {
  coinsafe: [
    { n: "200+", l: "Wallets Onboarded", desc: "ERC-4337 passkey onboarding" },
    { n: "$0", l: "Balance Loss", desc: "Zero-custody escrow state machine" },
  ],
  zamir: [
    { n: "69", l: "Believers", desc: "Global active community" },
    { n: "40.7%", l: "Repeat Rate", desc: "30-day worship retention" },
  ],
  "triple-cure": [
    { n: "20", l: "Scholars Funded", desc: "Full tuition + mentorship" },
    { n: "~8 wks", l: "Zero to Production", desc: "Sanity CMS + Next.js build" },
  ],
  "zk-implementations": [
    { n: "3", l: "Protocols Verified", desc: "Sumcheck, GKR, and KZG" },
    { n: "1", l: "Critical Bug Solved", desc: "KZG endianness discrepancy fixed" },
  ],
}

interface DeckCardProps {
  project: FeaturedProject
  index: number
  total: number
}

function DeckCard({ project, index }: DeckCardProps) {
  const views = PROJECT_VIEWS[project.slug] ?? [
    {
      id: "default",
      label: "Primary",
      src: project.image,
      caption: project.desc,
    },
  ]
  const [activeViewIdx, setActiveViewIdx] = useState(0)
  const activeView = views[activeViewIdx] ?? views[0]
  const metrics = PROJECT_METRICS[project.slug] ?? []

  return (
    <article
      id={`project-${project.slug}`}
      className="scroll-mt-28 pt-12 sm:pt-16 border-t border-(--rule)/70 first:border-t-0 first:pt-0"
    >
      <div className="py-2 sm:py-4">
        {/* ── TWO-COLUMN HARMONIOUS MONOGRAPH (Apple & Duolingo Spatial Grace) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1.25fr] gap-8 xl:gap-14 items-center">
          {/* ── COLUMN 1: Editorial Monograph, Proof Metrics, and CTAs ── */}
          <div className="flex flex-col gap-6 order-2 lg:order-1">
            {/* Meta information row (No artificial numbered badges, no uppercase shouting) */}
            <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground flex-wrap">
              <span className="text-(--v3-accent) font-semibold">
                {project.tag}
              </span>
              <span className="text-(--rule)">·</span>
              <span>{project.year}</span>
              <span className="text-(--rule)">·</span>
              <span className="text-(--ink) font-medium">
                {project.role}
              </span>
            </div>

            {/* Title & Lede */}
            <div className="flex flex-col gap-2.5">
              <h3 className="m-0 font-display font-normal text-3xl sm:text-4xl lg:text-5xl leading-[1.05] tracking-tight text-(--ink) fvs-display">
                {project.name}
              </h3>
              {project.lede && (
                <p className="m-0 text-sm sm:text-base text-secondary-foreground leading-relaxed max-w-[50ch]">
                  {project.lede}
                </p>
              )}
            </div>

            {/* View Switcher Chips (Clean Editorial Pill Buttons) */}
            {views.length > 1 && (
              <div className="flex flex-col gap-2 pt-1">
                <div className="flex items-center gap-2 flex-wrap" role="tablist" aria-label={`${project.name} views`}>
                  {views.map((v, vIdx) => {
                    const isCurrent = activeViewIdx === vIdx
                    return (
                      <button
                        key={v.id}
                        type="button"
                        role="tab"
                        aria-selected={isCurrent}
                        onClick={() => setActiveViewIdx(vIdx)}
                        className={`px-3.5 py-1.5 rounded-full font-mono text-xs tracking-wider cursor-pointer border transition-colors ${
                          isCurrent
                            ? "bg-(--ink) text-(--bg) border-(--ink) font-medium"
                            : "bg-transparent text-muted-foreground border-(--rule) hover:text-(--ink) hover:border-muted-foreground"
                        }`}
                      >
                        {v.label}
                      </button>
                    )
                  })}
                </div>
                <p className="m-0 text-xs text-secondary-foreground leading-normal">
                  <span className="font-mono text-xs text-(--v3-accent) font-medium mr-1.5">
                    {activeView.label} ·
                  </span>
                  {activeView.caption}
                </p>
              </div>
            )}

            {/* Hard Proof Metrics (Flattened Monograph Rail — Zero Nested Cards) */}
            {metrics.length > 0 && (
              <div className="grid grid-cols-2 gap-6 py-4 border-y border-(--rule)/60">
                {metrics.map((m) => (
                  <div key={m.l} className="flex flex-col gap-1">
                    <div className="font-display font-normal text-3xl sm:text-4xl text-(--ink) leading-none">
                      <AnimatedCounter value={m.n} />
                    </div>
                    <div className="font-mono text-xs font-semibold text-(--ink) tracking-wider mt-0.5">
                      {m.l}
                    </div>
                    <div className="text-xs text-secondary-foreground leading-normal">
                      {m.desc}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Technology Stack Tags (Accessible Semantic List, Zero Nested Cards) */}
            <ul className="flex flex-wrap gap-2 p-0 m-0 list-none" role="list" aria-label="Technologies used">
              {project.stack.slice(0, 5).map((tech) => (
                <li
                  key={tech}
                  className="font-mono text-xs px-2.5 py-1 rounded-[4px] border border-(--rule)/70 bg-(--bg-2) text-secondary-foreground"
                >
                  {tech}
                </li>
              ))}
            </ul>

            {/* Actions: Primary Case Study & Live App */}
            <div className="flex items-center gap-4 pt-1 flex-wrap">
              <MagneticWrapper strength={15}>
                <Link
                  href={`/work/${project.slug}`}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full font-mono text-xs tracking-wider font-medium bg-(--ink) text-(--bg) transition-opacity duration-200 no-underline hover:opacity-90"
                >
                  Read Case Study <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </MagneticWrapper>

              {project.live && (
                <a
                  href={`https://${project.live.replace(/^https?:\/\//, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-mono text-xs tracking-wider text-muted-foreground hover:text-(--v3-accent) transition-colors no-underline group py-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-(--v3-accent)" />
                  <span>{project.liveLabel ?? "Live App"}</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>
              )}
            </div>
          </div>

          {/* ── COLUMN 2: High-Definition Screen Stage (Pristine Framing, Zero Sticky Traps) ── */}
          <div className="order-1 lg:order-2 w-full">
            <div className="relative w-full aspect-[16/10] rounded-xl sm:rounded-2xl overflow-hidden border border-(--rule) bg-(--bg-2)" suppressHydrationWarning>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={activeView.src}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="relative w-full h-full"
                >
                  <Image
                    src={activeView.src}
                    alt={`${project.name} — ${activeView.label}`}
                    fill
                    className="object-cover object-top"
                    sizes="(max-width: 1024px) 100vw, 700px"
                    priority={index === 0}
                    unoptimized={activeView.src.endsWith(".svg")}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}

interface ProjectsStackedDeckProps {
  projects?: FeaturedProject[]
}

export function ProjectsStackedDeck({
  projects = FEATURED_PROJECTS.slice(1),
}: ProjectsStackedDeckProps): React.ReactElement {
  return (
    <div className="flex flex-col space-y-16 sm:space-y-20 lg:space-y-24">
      {projects.map((project, index) => (
        <DeckCard
          key={project.slug}
          project={project}
          index={index}
          total={projects.length}
        />
      ))}
    </div>
  )
}
