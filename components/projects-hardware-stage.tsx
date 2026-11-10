"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { FEATURED_PROJECTS } from "@/lib/case-studies"
import { MagneticWrapper } from "./magnetic-wrapper"
import { AnimatedCounter } from "./animated-counter"
import { ArrowRight, ArrowUpRight, CheckCircle2, Laptop, Smartphone, Terminal, Shield } from "lucide-react"

// Interactive deep-dive feature tabs for each project
const STAGE_FEATURES: Record<string, { title: string; desc: string }[]> = {
  zamir: [
    {
      title: "Soul Check (18 Emotions)",
      desc: "Translates real emotional states into custom worship music across 7 styles and 10 West African & global languages.",
    },
    {
      title: "The Altar Daily Streak",
      desc: "Daily habit loop with forgiving streak logic: covers one missed day per week automatically to foster genuine habit formation.",
    },
    {
      title: "Bounded Unit Economics",
      desc: "Carefully engineered credit bounds (4 free credits, 1 every 3 days) to strictly safeguard generative API costs while keeping community listening free.",
    },
  ],
  coinsafe: [
    {
      title: "Sponsored Gas Onboarding",
      desc: "ERC-4337 Account Abstraction via thirdweb: sign-in with Google, email, and biometric passkeys with zero seed-phrase friction.",
    },
    {
      title: "Reactive State Sync",
      desc: "Listens to 10+ smart contract events and reflects them into optimistic UI state, eliminating interface lag during block confirmation.",
    },
    {
      title: "Time-Locked Vaults",
      desc: "Discipline-first on-chain vaults deployed on Base and Lisk with non-custodial smart contract withdrawal enforcement.",
    },
  ],
  "triple-cure": [
    {
      title: "Ondo State Youth Impact",
      desc: "Dedicated to funding merit scholarships and digital literacy centers for underserved students across Ondo State communities.",
    },
    {
      title: "Okitipupa ICT Hub",
      desc: "Physical digital center partnership providing computers, high-speed connectivity, and practical programming training.",
    },
    {
      title: "Autonomous Board CMS",
      desc: "Modeled in Sanity CMS so non-technical board members publish ceremony updates and student announcements without ongoing developer retainers.",
    },
  ],
  "zk-implementations": [
    {
      title: "Sumcheck Protocol",
      desc: "Reduces claims regarding multi-variable polynomials over boolean hypercubes to a single verifiable evaluation point.",
    },
    {
      title: "GKR Layered Circuits",
      desc: "Layer-by-layer circuit verification where variable counts are dynamically derived from layer widths rather than hardcoded.",
    },
    {
      title: "KZG Endianness Bug Fix",
      desc: "Diagnosed and corrected a critical bit-indexing bug in trusted setup from least-significant to most-significant bit format.",
    },
  ],
}

export function ProjectsHardwareStage(): React.ReactElement {
  const [selectedIdx, setSelectedIdx] = useState<number>(0)
  const [activeFeatureIdx, setActiveFeatureIdx] = useState<number>(0)

  const project = FEATURED_PROJECTS[selectedIdx]
  const features = STAGE_FEATURES[project.slug] ?? []

  function handleProjectChange(idx: number) {
    setSelectedIdx(idx)
    setActiveFeatureIdx(0)
  }

  return (
    <div className="flex flex-col gap-8 sm:gap-10">
      {/* Top Segmented Controller (Apple Pro style tab switcher) */}
      <div className="flex justify-start sm:justify-center overflow-x-auto pb-2 scrollbar-none">
        <div className="inline-flex p-1.5 rounded-full border border-(--rule) bg-(--paper) shadow-sm gap-1 sm:gap-1.5">
          {FEATURED_PROJECTS.map((p, idx) => {
            const isSelected = selectedIdx === idx
            return (
              <button
                key={p.slug}
                onClick={() => handleProjectChange(idx)}
                className={`relative px-4 sm:px-6 py-2.5 rounded-full font-mono text-[11px] sm:text-[12px] uppercase tracking-wider font-medium cursor-pointer transition-colors duration-200 border-none outline-none flex items-center gap-2 whitespace-nowrap ${
                  isSelected
                    ? "text-(--ink)"
                    : "text-muted-foreground hover:text-(--ink)"
                }`}
                aria-selected={isSelected}
                role="tab"
              >
                {isSelected && (
                  <motion.div
                    layoutId="hardwareStageActiveTab"
                    className="absolute inset-0 rounded-full bg-(--bg-2) border border-(--rule) shadow-sm"
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <span
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${
                      isSelected ? "bg-(--v3-accent)" : "bg-muted-foreground/40"
                    }`}
                  />
                  <span>0{idx + 1}</span>
                  <span className="hidden sm:inline">·</span>
                  <span className="font-semibold">{p.name}</span>
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Interactive Stage Stage */}
      <div className="rounded-3xl border border-(--rule) bg-(--paper) p-6 sm:p-10 lg:p-12 xl:p-14 shadow-[0_30px_70px_-20px_color-mix(in_oklab,var(--ink)_14%,transparent)] relative overflow-hidden">
        {/* Subtle background ambient glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-(--v3-accent)/5 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1.3fr] gap-10 xl:gap-14 items-center relative z-10">
          {/* Left HUD: Information & Interactive Deep Dive */}
          <div className="flex flex-col gap-6">
            {/* Header info */}
            <div>
              <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-(--v3-accent) font-semibold mb-2">
                <span>0{selectedIdx + 1}</span>
                <span>/</span>
                <span>{project.tag}</span>
              </div>
              <h3 className="m-0 font-display font-light text-[clamp(32px,4vw,52px)] text-(--ink) leading-[1.08] fvs-display">
                {project.name}
              </h3>
              <p className="mt-2 font-mono text-[12px] text-muted-foreground">
                {project.role} · {project.year}
              </p>
            </div>

            <p className="m-0 text-[15px] sm:text-[16px] text-secondary-foreground leading-[1.65]">
              {project.desc}
            </p>

            {/* Interactive Feature Selector */}
            {features.length > 0 && (
              <div className="flex flex-col gap-3 pt-2">
                <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                  Engineering Highlights (Click to inspect)
                </span>
                <div className="flex flex-col gap-2">
                  {features.map((feat, fi) => {
                    const isActive = activeFeatureIdx === fi
                    return (
                      <button
                        key={feat.title}
                        onClick={() => setActiveFeatureIdx(fi)}
                        className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                          isActive
                            ? "border-(--v3-accent) bg-(--bg-2) shadow-sm"
                            : "border-(--rule)/60 bg-transparent hover:border-(--rule) hover:bg-(--bg-2)/40"
                        }`}
                      >
                        <div className="flex items-center justify-between text-[13px] font-mono font-medium text-(--ink) mb-1">
                          <span>{feat.title}</span>
                          {isActive && <CheckCircle2 className="w-3.5 h-3.5 text-(--v3-accent)" />}
                        </div>
                        {isActive && (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="m-0 text-[13px] text-secondary-foreground leading-relaxed pt-1"
                          >
                            {feat.desc}
                          </motion.p>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 pt-3 flex-wrap">
              <MagneticWrapper strength={15}>
                <Link
                  href={`/work/${project.slug}`}
                  className="inline-flex items-center gap-2 px-6 py-2.75 rounded-full font-mono text-[12px] uppercase tracking-wider font-medium border border-(--rule) bg-(--ink) text-(--bg) transition-all duration-200 no-underline hover:opacity-90"
                >
                  Full Case Study <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </MagneticWrapper>

              {project.live && (
                <a
                  href={`https://${project.live.replace(/^https?:\/\//, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2.75 rounded-full font-mono text-[12px] uppercase tracking-wider font-medium border border-(--rule) text-secondary-foreground hover:text-(--ink) hover:border-muted-foreground transition-all duration-200 no-underline"
                >
                  {project.liveLabel ?? "Live Project"} <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>

          {/* Right Device Display: Hardware bezel and mockup */}
          <div className="flex flex-col gap-3">
            <div className="relative w-full aspect-[16/11] rounded-2xl overflow-hidden border border-(--rule) bg-(--bg-2) shadow-[0_25px_60px_-15px_color-mix(in_oklab,var(--ink)_16%,transparent)] group">
              <AnimatePresence mode="wait">
                <motion.div
                  key={project.slug}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.4 }}
                  className="relative w-full h-full"
                >
                  {project.image ? (
                    <Image
                      src={project.image}
                      alt={project.name}
                      fill
                      className="object-cover object-top"
                      sizes="(max-width: 1024px) 100vw, 750px"
                      priority
                      unoptimized={project.image.endsWith(".svg")}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-display text-[32px] text-muted-foreground">
                      {project.name}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Top hardware badge bar */}
              <div className="absolute top-3 left-3 z-10 flex items-center gap-2 font-mono text-[11px] px-3 py-1 rounded-full bg-(--bg)/90 backdrop-blur-md border border-(--rule) text-(--ink) pointer-events-none">
                <span className="w-1.5 h-1.5 rounded-full bg-(--v3-accent)" />
                {project.slug === "zamir" && "AI Music Engine · Flutter Mobile"}
                {project.slug === "coinsafe" && "Account Abstraction · Base & Lisk"}
                {project.slug === "triple-cure" && "Education Foundation · Sanity CMS"}
                {project.slug === "zk-implementations" && "Rust Systems · Criterion Prover"}
              </div>
            </div>

            {/* Bottom hardware caption bar */}
            <div className="flex justify-between items-center px-1 text-[11px] font-mono text-muted-foreground">
              <span>Displaying: {project.name}</span>
              <span>Interactive Stage (Option 2)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
