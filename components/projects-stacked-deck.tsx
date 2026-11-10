"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { FEATURED_PROJECTS, type FeaturedProject } from "@/lib/case-studies"
import { MagneticWrapper } from "./magnetic-wrapper"
import { AnimatedCounter } from "./animated-counter"
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

  // Top offset for the stacking effect: clean stepped tabs
  const topOffset = 88 + index * 26

  return (
    <div
      style={{
        top: `${topOffset}px`,
        zIndex: index + 1,
      }}
      className="lg:sticky mb-16 sm:mb-20 lg:mb-24 last:mb-0 scroll-mt-24"
    >
      <div className="relative rounded-2xl sm:rounded-3xl border border-(--rule) bg-(--paper) shadow-xs overflow-hidden transition-all duration-300">
        {/* Subtle accent rule on top */}
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-(--v3-accent) to-transparent opacity-60" />

        <div className="p-6 sm:p-8 lg:p-10 xl:p-12">
          {/* ── TWO-COLUMN HARMONIOUS STAGE (Apple / Duolingo Spatial Balance) ── */}
          <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_1.25fr] gap-8 xl:gap-12 items-center">
            {/* ── LEFT COLUMN: Editorial Monograph, Proof Metrics, and CTAs ── */}
            <div className="flex flex-col gap-5 sm:gap-6">
              {/* Meta eyebrow bar */}
              <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground flex-wrap">
                <span className="font-semibold text-(--v3-accent)">
                  0{index + 1}
                </span>
                <span className="text-(--rule)">/</span>
                <span className="text-(--v3-accent) font-medium">
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

              {/* Hard Proof Metrics (Side-by-Side Clean Numbers) */}
              {metrics.length > 0 && (
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {metrics.map((m) => (
                    <div
                      key={m.l}
                      className="p-3.5 sm:p-4 rounded-xl border border-(--rule) bg-(--bg-2)/50 flex flex-col gap-0.5"
                    >
                      <div className="font-display font-light text-2xl sm:text-3xl text-(--ink) leading-none">
                        <AnimatedCounter value={m.n} />
                      </div>
                      <div className="font-mono text-[11px] font-medium text-(--ink) tracking-wider mt-1">
                        {m.l}
                      </div>
                      <div className="text-xs text-secondary-foreground leading-normal">
                        {m.desc}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Technology Stack Tags */}
              <div className="flex flex-wrap gap-1.5">
                {project.stack.slice(0, 5).map((tech) => (
                  <span
                    key={tech}
                    className="font-mono text-[11px] px-2.5 py-1 rounded border border-(--rule) bg-(--bg-2)/80 text-secondary-foreground"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              {/* Actions: Primary Case Study & Live App */}
              <div className="flex items-center gap-3 pt-2 flex-wrap">
                <MagneticWrapper strength={15}>
                  <Link
                    href={`/work/${project.slug}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-mono text-xs tracking-wider font-medium border border-(--rule) bg-(--ink) text-(--bg) transition-all duration-200 no-underline hover:opacity-90 shadow-xs"
                  >
                    Read Case Study <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </MagneticWrapper>

                {project.live && (
                  <a
                    href={`https://${project.live.replace(/^https?:\/\//, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full font-mono text-xs tracking-wider border border-(--rule) bg-(--bg-2) text-(--ink) hover:border-(--v3-accent) hover:text-(--v3-accent) transition-all no-underline shadow-xs group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-(--v3-accent)" />
                    <span>{project.liveLabel ?? "Live App"}</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </a>
                )}
              </div>
            </div>

            {/* ── RIGHT COLUMN: Interactive Studio Browser Viewport ── */}
            <div className="relative w-full rounded-xl sm:rounded-2xl border border-(--rule) bg-(--bg-2) p-2 sm:p-2.5 shadow-xs flex flex-col gap-2">
              {/* macOS Studio Browser Header & View Switcher */}
              <div className="min-h-9 px-2 sm:px-3 py-1 flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
                {/* Window control dots */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-black/15 dark:bg-white/15" />
                  <span className="w-2.5 h-2.5 rounded-full bg-black/15 dark:bg-white/15" />
                  <span className="w-2.5 h-2.5 rounded-full bg-black/15 dark:bg-white/15" />
                </div>

                {/* View Switcher Chips (Integrated seamlessly in browser toolbar) */}
                {views.length > 1 ? (
                  <div className="flex items-center gap-1 p-0.5 rounded-full border border-(--rule) bg-(--paper) overflow-x-auto scrollbar-none max-w-full">
                    {views.map((v, vIdx) => {
                      const isCurrent = activeViewIdx === vIdx
                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => setActiveViewIdx(vIdx)}
                          className={`relative px-2.5 sm:px-3 py-1 rounded-full font-mono text-[11px] tracking-wider cursor-pointer border-none transition-colors whitespace-nowrap ${
                            isCurrent
                              ? "text-(--ink) font-medium"
                              : "text-muted-foreground hover:text-(--ink) bg-transparent"
                          }`}
                        >
                          {isCurrent && (
                            <motion.div
                              layoutId={`viewPill-${project.slug}`}
                              className="absolute inset-0 rounded-full bg-(--bg-2) border border-(--rule) shadow-xs"
                              transition={{ type: "spring", stiffness: 450, damping: 35 }}
                            />
                          )}
                          <span className="relative z-10">{v.label}</span>
                        </button>
                      )
                    })}
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
                    <Lock className="w-3 h-3 text-emerald-500" />
                    <span>{project.slug}.dev</span>
                  </div>
                )}

                {/* Verified build badge */}
                <div className="hidden sm:flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Verified</span>
                </div>
              </div>

              {/* High-definition Screen Canvas (16/10 Aspect Ratio) */}
              <div className="relative w-full aspect-[16/10] rounded-lg sm:rounded-xl overflow-hidden bg-black border border-black/10 dark:border-white/10 group">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeView.src}
                    initial={{ opacity: 0, scale: 0.99 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.01 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="relative w-full h-full"
                  >
                    <Image
                      src={activeView.src}
                      alt={`${project.name} — ${activeView.label}`}
                      fill
                      className="object-cover object-top transition-transform duration-500 ease-out group-hover:scale-[1.015]"
                      sizes="(max-width: 1024px) 100vw, 600px"
                      priority={index === 0}
                      unoptimized={activeView.src.endsWith(".svg")}
                    />
                  </motion.div>
                </AnimatePresence>

                {/* Subtle vignette shadow */}
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/45 via-transparent to-black/10" />

                {/* Floating Caption Badge */}
                <div className="absolute bottom-3 left-3 right-3 z-10 p-2.5 sm:p-3 rounded-lg bg-black/80 backdrop-blur-md border border-white/10 text-white shadow-sm">
                  <div className="flex items-center gap-1.5 font-mono text-[11px] text-(--v3-accent) tracking-wider font-medium mb-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-(--v3-accent)" />
                    <span>{activeView.label}</span>
                  </div>
                  <p className="m-0 text-xs text-zinc-300 leading-normal line-clamp-2">
                    {activeView.caption}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface ProjectsStackedDeckProps {
  projects?: FeaturedProject[]
}

export function ProjectsStackedDeck({
  projects = FEATURED_PROJECTS.slice(1),
}: ProjectsStackedDeckProps): React.ReactElement {
  return (
    <div className="relative">
      <div className="flex flex-col">
        {projects.map((project, index) => (
          <DeckCard
            key={project.slug}
            project={project}
            index={index}
            total={projects.length}
          />
        ))}
      </div>
    </div>
  )
}
