"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { FEATURED_PROJECTS, type FeaturedProject } from "@/lib/case-studies"
import {
  ArrowRight,
  Shield,
  Zap,
  Radio,
  ExternalLink,
} from "lucide-react"

interface Hotspot {
  id: string
  x: number // percentage
  y: number // percentage
  label: string
  spec: string
  detail: string
  icon?: typeof Shield
}

interface ProjectStageConfig {
  accentColor: string
  accentRgb: string
  desktopImage: string
  mobileOverlay?: {
    src: string
    alt: string
  }
  hotspots: Hotspot[]
  architecture: {
    protocol: string
    stack: string
    role: string
    benchmark: string
  }
}

const STAGE_CONFIGS: Record<string, ProjectStageConfig> = {
  coinsafe: {
    accentColor: "#f59e0b",
    accentRgb: "245, 158, 11",
    desktopImage: "/work/coinsafe/coinsafe-landing.png",
    mobileOverlay: {
      src: "/work/coinsafe/card1.webp",
      alt: "CoinSafe Onboarding Card",
    },
    architecture: {
      protocol: "ERC-4337 Account Abstraction",
      stack: "thirdweb SDK · Base Mainnet · Lisk · Next.js",
      role: "Blockchain Integrations Engineer",
      benchmark: "$0 balance loss across all smart contract vaults",
    },
    hotspots: [
      {
        id: "cs-aa",
        x: 24,
        y: 42,
        label: "ERC-4337 Passkeys",
        spec: "Gasless Account Abstraction",
        detail:
          "Enables instant web3 onboarding via Google OAuth, biometric passkeys, and sponsored gas bundlers with zero seed-phrase friction.",
        icon: Zap,
      },
      {
        id: "cs-escrow",
        x: 52,
        y: 68,
        label: "Zero-Custody Escrow",
        spec: "State Machine Contracts",
        detail:
          "Funds remain locked in deterministic multi-sig escrow contracts until cryptographic delivery verification is confirmed on-chain.",
        icon: Shield,
      },
      {
        id: "cs-sync",
        x: 82,
        y: 35,
        label: "Reactive State Sync",
        spec: "Sub-Second Event Listeners",
        detail:
          "Subscribes to 10+ smart contract events simultaneously to provide optimistic UI updates before block confirmations finalize.",
        icon: Radio,
      },
    ],
  },
  zamir: {
    accentColor: "#3b82f6",
    accentRgb: "59, 130, 246",
    desktopImage: "/work/zamir/01-marketing-hero-desktop.webp",
    mobileOverlay: {
      src: "/work/zamir/10-app-altar-ios.webp",
      alt: "Zamir iOS Altar App",
    },
    architecture: {
      protocol: "Proprietary Prompt Orchestration & Synthesis",
      stack: "Flutter · PWA · Supabase · Suno API",
      role: "Lead Full-Stack & Systems Engineer",
      benchmark: "69 Believers & 40.7% 30-day repeat devotion rate",
    },
    hotspots: [
      {
        id: "zm-soul",
        x: 30,
        y: 38,
        label: "Soul Check Engine",
        spec: "18 Emotional Classifiers",
        detail:
          "Translates raw human emotions into theological scripture anchors and custom musical arrangements across 7 authentic worship styles.",
      },
      {
        id: "zm-langs",
        x: 65,
        y: 32,
        label: "West African & Global",
        spec: "10 Distinct Languages",
        detail:
          "Full lyric generation and phoneme synthesis in Yoruba, Igbo, Hausa, Nigerian Pidgin, French, Spanish, Swahili, and English.",
      },
      {
        id: "zm-streak",
        x: 80,
        y: 72,
        label: "Forgiving Altar Streak",
        spec: "Habit Retention Loop",
        detail:
          "Automated streak protection covers one missed devotional day per week to foster genuine spiritual discipline without punitive reset.",
      },
    ],
  },
  "triple-cure": {
    accentColor: "#10b981",
    accentRgb: "16, 185, 129",
    desktopImage: "/work/triple-cure/tca-landing-on-laptop.png",
    architecture: {
      protocol: "Headless Content Infrastructure",
      stack: "Sanity CMS · Next.js · TailwindCSS · Vercel",
      role: "Founding Engineer & Web Architect",
      benchmark: "20 Scholars funded & zero-cost maintenance for board",
    },
    hotspots: [
      {
        id: "tc-scholar",
        x: 28,
        y: 46,
        label: "Ondo State Endowment",
        spec: "Merit-Based Scholarships",
        detail:
          "Digital application and verification system supporting full university tuitions and living stipends for underserved students.",
      },
      {
        id: "tc-hub",
        x: 58,
        y: 60,
        label: "Okitipupa ICT Center",
        spec: "Physical Infrastructure",
        detail:
          "Co-developed community digital learning centers equipped with high-speed internet, workstation labs, and developer bootcamps.",
      },
      {
        id: "tc-cms",
        x: 78,
        y: 34,
        label: "Autonomous Board CMS",
        spec: "Sanity Schema Modeling",
        detail:
          "Tailored publishing workflows allowing non-technical foundation directors to release announcements without developer intervention.",
      },
    ],
  },
  "zk-implementations": {
    accentColor: "#14b8a6",
    accentRgb: "20, 184, 166",
    desktopImage: "/work/peacefulnes.png",
    architecture: {
      protocol: "Zero-Knowledge Proof Systems",
      stack: "Rust · Criterion · Arkworks · Halo2 Curves",
      role: "Cryptographic Engineer & Researcher",
      benchmark: "Sub-second verification over 2^20 polynomial hypercubes",
    },
    hotspots: [
      {
        id: "zk-sumcheck",
        x: 32,
        y: 44,
        label: "Sumcheck Protocol",
        spec: "Interactive Proof Reduction",
        detail:
          "Reduces claims regarding multi-variable polynomials over boolean hypercubes to a single verifiable evaluation point.",
      },
      {
        id: "zk-gkr",
        x: 58,
        y: 65,
        label: "GKR Layered Circuits",
        spec: "Dynamic Layer Derivations",
        detail:
          "Validates arithmetic circuits layer by layer, deriving variable counts directly from layer width rather than static hardcoding.",
      },
      {
        id: "zk-kzg",
        x: 82,
        y: 38,
        label: "KZG Endianness Bug",
        spec: "Trusted Setup Serialization Fix",
        detail:
          "Isolated and resolved a critical bit-indexing mismatch from least-significant to most-significant bit formats in proof generation.",
      },
    ],
  },
}

interface ProjectsHardwareStageProps {
  project?: FeaturedProject
  projects?: FeaturedProject[]
  standaloneTopProject?: boolean
}

export function ProjectsHardwareStage({
  project: overrideProject,
  projects = FEATURED_PROJECTS,
  standaloneTopProject = true,
}: ProjectsHardwareStageProps): React.ReactElement {
  const [selectedIdx, setSelectedIdx] = useState<number>(0)
  const project = overrideProject ?? (standaloneTopProject ? FEATURED_PROJECTS[0] : projects[selectedIdx])
  const config = STAGE_CONFIGS[project.slug] ?? STAGE_CONFIGS.zamir
  const [activeHotspotId, setActiveHotspotId] = useState<string>(config.hotspots[0]?.id ?? "")

  const activeHotspot =
    config.hotspots.find((h) => h.id === activeHotspotId) ?? config.hotspots[0]

  function handleProjectChange(idx: number) {
    setSelectedIdx(idx)
    const nextConfig = STAGE_CONFIGS[projects[idx].slug]
    if (nextConfig?.hotspots[0]) {
      setActiveHotspotId(nextConfig.hotspots[0].id)
    }
  }

  return (
    <div className="flex flex-col gap-8 sm:gap-10">
      {/* ── TOP DOCK: Only shown if multiple projects are provided without standalone mode ── */}
      {!standaloneTopProject && projects.length > 1 && (
        <div className="flex justify-start sm:justify-center overflow-x-auto pb-2 scrollbar-none">
          <div className="inline-flex p-1.5 rounded-full border border-(--rule) bg-(--paper) shadow-md gap-1 sm:gap-1.5">
            {projects.map((p, idx) => {
              const isSelected = selectedIdx === idx
              const pConfig = STAGE_CONFIGS[p.slug]
              return (
                <button
                  key={p.slug}
                  type="button"
                  onClick={() => handleProjectChange(idx)}
                  className={`relative px-4 sm:px-6 py-2.5 rounded-full font-mono text-[11px] sm:text-xs uppercase tracking-wider font-medium cursor-pointer transition-colors duration-200 border-none outline-none flex items-center gap-2 whitespace-nowrap ${
                    isSelected ? "text-(--ink)" : "text-muted-foreground hover:text-(--ink) bg-transparent"
                  }`}
                  aria-selected={isSelected}
                  role="tab"
                >
                  {isSelected && (
                    <motion.div
                      layoutId="hardwareTheaterDockActive"
                      className="absolute inset-0 rounded-full bg-(--bg-2) border border-(--rule) shadow-xs"
                      transition={{ type: "spring", stiffness: 450, damping: 35 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full transition-colors"
                      style={{
                        backgroundColor: isSelected ? pConfig?.accentColor ?? "var(--v3-accent)" : "rgba(150,150,150,0.4)",
                        boxShadow: isSelected ? `0 0 10px ${pConfig?.accentColor}` : "none",
                      }}
                    />
                    <span>0{idx + 1}</span>
                    <span className="hidden sm:inline text-muted-foreground">·</span>
                    <span className="font-semibold">{p.name}</span>
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* ── THE OBSIDIAN HARDWARE THEATER STAGE ── */}
      <div className="rounded-[32px] sm:rounded-[44px] border border-zinc-800 bg-[#0b0c0e] p-6 sm:p-10 lg:p-14 text-white relative overflow-hidden shadow-[0_45px_110px_-30px_rgba(0,0,0,0.85)]">
        {/* Dynamic ambient backlight matching brand accent */}
        <div
          className="absolute -top-40 right-1/4 w-[600px] h-[600px] rounded-full blur-[140px] pointer-events-none transition-all duration-700 opacity-25"
          style={{ backgroundColor: config.accentColor }}
        />

        {/* ── STAGE TOP BAR: Telemetry Title & Metadata ── */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 sm:pb-8 border-b border-zinc-800/80">
          <div>
            <div className="flex items-center gap-2.5 font-mono text-[11px] text-zinc-400 uppercase tracking-[0.16em] mb-1.5">
              <span
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ backgroundColor: config.accentColor }}
              />
              <span>Flagship Architecture Stage</span>
              <span className="text-zinc-700">·</span>
              <span className="text-zinc-300 font-semibold">{project.tag}</span>
            </div>
            <h3 className="m-0 font-display font-light text-[clamp(32px,4vw,56px)] leading-[1] text-white fvs-display">
              {project.name}
            </h3>
          </div>

          <div className="flex items-center gap-3">
            {project.live && (
              <a
                href={`https://${project.live.replace(/^https?:\/\//, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-mono text-[11px] uppercase tracking-wider border border-zinc-700 bg-zinc-900 text-zinc-200 hover:text-white hover:border-zinc-500 transition-all no-underline shadow-sm group"
              >
                <span>Launch Live</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
            )}

            <Link
              href={`/work/${project.slug}`}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full font-mono text-[11px] uppercase tracking-wider font-semibold border border-white/20 bg-white text-black hover:bg-zinc-200 transition-all no-underline shadow-sm"
            >
              Case Study <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* ── PANORAMIC MULTI-SCREEN STAGE WITH INTERACTIVE RADAR PINS ── */}
        <div className="relative z-10 my-8 sm:my-10">
          {/* Main Studio Display Bezel */}
          <div className="relative w-full rounded-2xl sm:rounded-3xl border border-zinc-700/80 bg-[#16171c] p-2.5 sm:p-3 shadow-[0_30px_90px_-20px_rgba(0,0,0,0.9)]">
            {/* Top Display Camera Notch & Chrome */}
            <div className="h-6 sm:h-7 px-3 flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-700/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-700/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-700/80" />
              </div>
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                <span className="w-1 h-1 rounded-full bg-emerald-500/80" />
              </div>
              <span className="font-mono text-[11px] uppercase tracking-wider text-zinc-500">
                Studio View · 4K
              </span>
            </div>

            {/* Expansive Screen Viewport */}
            <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] rounded-xl sm:rounded-2xl overflow-hidden bg-black border border-zinc-800">
              <AnimatePresence mode="wait">
                <motion.div
                  key={project.slug}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.01 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="relative w-full h-full"
                >
                  <Image
                    src={config.desktopImage}
                    alt={project.name}
                    fill
                    className="object-cover object-top"
                    sizes="(max-width: 1320px) 100vw, 1320px"
                    priority
                    unoptimized={config.desktopImage.endsWith(".svg")}
                  />
                </motion.div>
              </AnimatePresence>

              {/* Atmospheric lighting gradient */}
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/60 via-transparent to-black/20" />

              {/* ── INTERACTIVE RADAR PINS OVER THE INTERFACE ── */}
              {config.hotspots.map((h, hIdx) => {
                const isActive = activeHotspotId === h.id
                return (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => setActiveHotspotId(h.id)}
                    style={{ left: `${h.x}%`, top: `${h.y}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 z-20 group cursor-pointer border-none bg-transparent p-2 focus:outline-none"
                    aria-label={`Inspect ${h.label}`}
                  >
                    {/* Pulsing radar wave */}
                    <span
                      className="absolute inset-0 rounded-full animate-ping opacity-60 pointer-events-none"
                      style={{
                        backgroundColor: config.accentColor,
                        animationDuration: "2.4s",
                        animationDelay: `${hIdx * 0.4}s`,
                      }}
                    />

                    {/* Pin button */}
                    <span
                      className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full font-mono text-[11px] font-semibold text-white backdrop-blur-md border transition-all duration-300 shadow-xl ${
                        isActive
                          ? "scale-110 border-white bg-black/90"
                          : "border-white/30 bg-black/60 hover:border-white/70 hover:scale-105"
                      }`}
                      style={{
                        boxShadow: isActive
                          ? `0 0 25px ${config.accentColor}, 0 10px 20px rgba(0,0,0,0.8)`
                          : "0 8px 16px rgba(0,0,0,0.5)",
                      }}
                    >
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: config.accentColor }}
                      />
                      <span className="whitespace-nowrap">{h.label}</span>
                    </span>
                  </button>
                )
              })}

              {/* ── FLOATING SECONDARY DEVICE (Multi-Screen Layering) ── */}
              {config.mobileOverlay && (
                <motion.div
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="hidden md:block absolute bottom-4 right-4 lg:bottom-6 lg:right-6 z-25 w-[140px] sm:w-[170px] lg:w-[200px] aspect-[9/16] rounded-2xl sm:rounded-3xl border-2 border-white/20 bg-zinc-950 p-1.5 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] overflow-hidden"
                >
                  <div className="relative w-full h-full rounded-xl sm:rounded-2xl overflow-hidden bg-black">
                    <Image
                      src={config.mobileOverlay.src}
                      alt={config.mobileOverlay.alt}
                      fill
                      className="object-cover object-top"
                      sizes="200px"
                    />
                  </div>
                  {/* Floating badge on device */}
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-3.5 bg-black rounded-full" />
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* ── BOTTOM TELEMETRY CONSOLE: Architecture Deep Dive ── */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-8 pt-6 sm:pt-8 border-t border-zinc-800">
          {/* Active Hotspot Technical Analysis */}
          <div className="p-5 sm:p-6 rounded-2xl border border-zinc-800 bg-zinc-950/70 backdrop-blur-md flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 font-mono text-[11px] text-zinc-400 uppercase tracking-wider">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: config.accentColor }}
                />
                <span className="text-zinc-200 font-semibold">{activeHotspot.label}</span>
                <span className="text-zinc-600">·</span>
                <span className="text-zinc-400">{activeHotspot.spec}</span>
              </div>
              <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-zinc-500">
                Click pins on screen to inspect
              </span>
            </div>

            <p className="m-0 text-sm sm:text-base text-zinc-300 leading-[1.6]">
              {activeHotspot.detail}
            </p>
          </div>

          {/* Architecture Spec Sheet */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-zinc-800/80 bg-zinc-950/40 flex flex-col gap-1">
              <span className="font-mono text-[11px] text-zinc-500 uppercase tracking-wider">
                Protocol Architecture
              </span>
              <span className="text-sm font-semibold text-zinc-200">
                {config.architecture.protocol}
              </span>
            </div>

            <div className="p-4 rounded-xl border border-zinc-800/80 bg-zinc-950/40 flex flex-col gap-1">
              <span className="font-mono text-[11px] text-zinc-500 uppercase tracking-wider">
                Role & Accountability
              </span>
              <span className="text-sm font-semibold text-zinc-200">
                {config.architecture.role}
              </span>
            </div>

            <div className="col-span-2 p-4 rounded-xl border border-zinc-800/80 bg-zinc-950/40 flex flex-col gap-1">
              <span className="font-mono text-[11px] text-zinc-500 uppercase tracking-wider">
                Hard Proof Benchmark
              </span>
              <span className="text-sm font-semibold text-zinc-200">
                {config.architecture.benchmark}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
