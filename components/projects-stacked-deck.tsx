"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { FEATURED_PROJECTS, type FeaturedProject } from "@/lib/case-studies"
import { MagneticWrapper } from "./magnetic-wrapper"
import { AnimatedCounter } from "./animated-counter"
import { ArrowRight, Lock, ExternalLink } from "lucide-react"

// Gallery views for each project so users can inspect real screens at scale
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
      caption: "Main high-resolution landing capture: self-sovereign savings and zero-custody escrow.",
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
      caption: "Zamir web application: scripture-led generative music for 69 believers across 10 languages.",
    },
    {
      id: "altar",
      label: "The Altar Streak",
      src: "/work/zamir/03-marketing-altar-desktop.webp",
      caption: "Daily spiritual habit loop with forgiving streak logic that covers one missed day per week.",
    },
    {
      id: "ios",
      label: "iOS Native",
      src: "/work/zamir/10-app-altar-ios.webp",
      caption: "Mobile-first worship interface optimized for haptic daily prayer and offline devotions.",
    },
  ],
  "triple-cure": [
    {
      id: "laptop",
      label: "Studio Display",
      src: "/work/triple-cure/tca-landing-on-laptop.png",
      caption: "Triple Cure Aid initiative: funding digital literacy centers and scholarships in Ondo State.",
    },
    {
      id: "landing",
      label: "Impact Home",
      src: "/work/triple-cure/tca_landing_page.png",
      caption: "Sanity-powered headless CMS platform enabling non-technical board members to publish updates.",
    },
    {
      id: "scholarships",
      label: "Scholarships Hub",
      src: "/work/triple-cure/tca_scholarships_page.png",
      caption: "Merit scholarship portal managing applications and student endowment records.",
    },
  ],
  "zk-implementations": [
    {
      id: "harness",
      label: "Criterion Benchmark",
      src: "/work/peacefulnes.png",
      caption: "Rust implementations of Sumcheck, GKR layered circuits, and KZG polynomial commitment schemes.",
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
  const topOffset = 80 + index * 26

  return (
    <div
      style={{
        top: `${topOffset}px`,
        zIndex: index + 1,
      }}
      className="sticky mb-24 sm:mb-32 last:mb-0"
    >
      <div className="relative rounded-[28px] sm:rounded-[36px] border border-(--rule) bg-(--paper) shadow-[0_35px_90px_-25px_rgba(0,0,0,0.18)] dark:shadow-[0_35px_90px_-25px_rgba(0,0,0,0.65)] overflow-hidden transition-all duration-300">
        {/* Subtle accent rule on top */}
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-(--v3-accent) to-transparent opacity-60" />

        <div className="p-6 sm:p-10 lg:p-14 xl:p-16 flex flex-col gap-8 sm:gap-10">
          {/* ── HEADER SPREAD: Identity, Role, and Thesis ── */}
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 pb-6 sm:pb-8 border-b border-(--rule)/60">
            <div className="flex flex-col gap-3 max-w-[70ch]">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-mono text-xs sm:text-sm font-semibold text-(--v3-accent) tracking-wider">
                  0{index + 1}
                </span>
                <span className="text-(--rule)">/</span>
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground font-medium">
                  {project.tag} · {project.year}
                </span>
                <span className="text-(--rule)">·</span>
                <span className="font-mono text-[11px] text-(--ink) font-semibold uppercase tracking-wider">
                  {project.role}
                </span>
              </div>

              <h3 className="m-0 font-display font-normal text-[clamp(36px,5.5vw,72px)] leading-[0.98] tracking-[-0.03em] text-(--ink) fvs-display">
                {project.name}
              </h3>

              {project.lede && (
                <p className="m-0 text-base sm:text-lg text-secondary-foreground leading-[1.55] max-w-[58ch]">
                  {project.lede}
                </p>
              )}
            </div>

            {/* Right: Direct Live Link & View Toggles */}
            <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-3 shrink-0">
              {project.live && (
                <a
                  href={`https://${project.live.replace(/^https?:\/\//, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-mono text-[11px] uppercase tracking-wider border border-(--rule) bg-(--bg-2) text-(--ink) hover:border-(--v3-accent) hover:text-(--v3-accent) transition-all no-underline shadow-xs group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-(--v3-accent)" />
                  <span>{project.liveLabel ?? "Visit Live Deployment"}</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>
              )}

              {/* View Switcher Chips (Click to switch image view) */}
              {views.length > 1 && (
                <div className="flex items-center gap-1.5 p-1 rounded-full border border-(--rule) bg-(--bg-2)/80 self-start lg:self-end">
                  {views.map((v, vIdx) => {
                    const isCurrent = activeViewIdx === vIdx
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setActiveViewIdx(vIdx)}
                        className={`relative px-3.5 py-1.5 rounded-full font-mono text-[11px] uppercase tracking-wider cursor-pointer border-none transition-colors ${
                          isCurrent
                            ? "text-(--ink) font-semibold"
                            : "text-muted-foreground hover:text-(--ink) bg-transparent"
                        }`}
                      >
                        {isCurrent && (
                          <motion.div
                            layoutId={`viewPill-${project.slug}`}
                            className="absolute inset-0 rounded-full bg-(--paper) border border-(--rule) shadow-xs"
                            transition={{ type: "spring", stiffness: 450, damping: 35 }}
                          />
                        )}
                        <span className="relative z-10">{v.label}</span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ── CENTERPIECE: PANORAMIC EXPANSIVE STUDIO VIEWPORT ── */}
          <div className="relative w-full rounded-2xl sm:rounded-3xl border border-(--rule) bg-[#0f1012] overflow-hidden shadow-[0_30px_80px_-20px_rgba(0,0,0,0.35)] group">
            {/* Authentic macOS Studio Browser Chrome */}
            <div className="h-11 sm:h-12 px-4 sm:px-6 bg-[#16171a] border-b border-white/10 flex items-center justify-between gap-4">
              {/* Window controls */}
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#ff5f57] border border-[#e0443e]" />
                <span className="w-3 h-3 rounded-full bg-[#febc2e] border border-[#d89e24]" />
                <span className="w-3 h-3 rounded-full bg-[#28c840] border border-[#1aab29]" />
              </div>

              {/* Address bar with live domain */}
              <div className="flex items-center justify-center gap-2 px-4 py-1 rounded-full bg-black/40 border border-white/10 font-mono text-[11px] text-zinc-300 max-w-[340px] w-full truncate">
                <Lock className="w-3 h-3 text-emerald-400 shrink-0" />
                <span className="truncate">
                  {project.live ? project.live.replace(/^https?:\/\//, "") : `${project.slug}.dev`}
                </span>
                <span className="text-zinc-600 hidden sm:inline">·</span>
                <span className="text-zinc-400 text-[11px] hidden sm:inline uppercase tracking-wider">
                  {activeView.label}
                </span>
              </div>

              {/* Status beacon */}
              <div className="flex items-center gap-2 font-mono text-[11px] text-zinc-400 uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="hidden sm:inline">Verified Build</span>
              </div>
            </div>

            {/* Expansive Screen Canvas */}
            <div className="relative w-full aspect-[16/10] sm:aspect-[16/9.5] lg:aspect-[16/9] overflow-hidden bg-zinc-950">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeView.src}
                  initial={{ opacity: 0, scale: 0.985 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.01 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="relative w-full h-full"
                >
                  <Image
                    src={activeView.src}
                    alt={`${project.name} — ${activeView.label}`}
                    fill
                    className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.015]"
                    sizes="(max-width: 1320px) 100vw, 1320px"
                    priority={index === 0}
                    unoptimized={activeView.src.endsWith(".svg")}
                  />
                </motion.div>
              </AnimatePresence>

              {/* Ambient gradient overlay for subtle contrast */}
              <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_120px_rgba(0,0,0,0.2)]" />

              {/* Floating Caption Badge */}
              <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-auto max-w-[560px] z-10 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-black/75 backdrop-blur-md border border-white/15 text-white shadow-xl">
                <div className="flex items-center gap-2 font-mono text-[11px] text-(--v3-accent) uppercase tracking-[0.14em] font-semibold mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-(--v3-accent)" />
                  <span>{activeView.label}</span>
                </div>
                <p className="m-0 text-xs sm:text-sm text-zinc-300 leading-[1.5]">
                  {activeView.caption}
                </p>
              </div>
            </div>
          </div>

          {/* ── BOTTOM SPECIFICATION RAIL: Outcomes, Tech & CTAs ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 sm:pt-8 border-t border-(--rule)/60 items-center">
            {/* Proof Metric 1 */}
            {metrics[0] && (
              <div className="p-4 sm:p-5 rounded-2xl border border-(--rule)/80 bg-(--bg-2)/60 flex flex-col gap-1">
                <div className="font-display font-light text-3xl sm:text-4xl text-(--ink) leading-none">
                  <AnimatedCounter value={metrics[0].n} />
                </div>
                <div className="font-mono text-[11px] font-semibold uppercase tracking-wider text-(--ink)">
                  {metrics[0].l}
                </div>
                <div className="text-xs text-secondary-foreground leading-normal">
                  {metrics[0].desc}
                </div>
              </div>
            )}

            {/* Proof Metric 2 */}
            {metrics[1] && (
              <div className="p-4 sm:p-5 rounded-2xl border border-(--rule)/80 bg-(--bg-2)/60 flex flex-col gap-1">
                <div className="font-display font-light text-3xl sm:text-4xl text-(--ink) leading-none">
                  <AnimatedCounter value={metrics[1].n} />
                </div>
                <div className="font-mono text-[11px] font-semibold uppercase tracking-wider text-(--ink)">
                  {metrics[1].l}
                </div>
                <div className="text-xs text-secondary-foreground leading-normal">
                  {metrics[1].desc}
                </div>
              </div>
            )}

            {/* Tech Stack & Primary Action */}
            <div className="flex flex-col gap-3.5 md:items-end justify-center">
              <div className="flex flex-wrap gap-1.5 md:justify-end">
                {project.stack.slice(0, 4).map((tech) => (
                  <span
                    key={tech}
                    className="font-mono text-[11px] px-2.5 py-1 rounded bg-(--bg-2) text-secondary-foreground border border-(--rule)/60"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              <MagneticWrapper strength={15}>
                <Link
                  href={`/work/${project.slug}`}
                  className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full font-mono text-xs uppercase tracking-wider font-semibold border border-(--rule) bg-(--ink) text-(--bg) transition-all duration-200 no-underline hover:opacity-90 shadow-sm"
                >
                  Read Deep Dive Case Study <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </MagneticWrapper>
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
