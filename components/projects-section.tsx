"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { MagneticWrapper } from "./magnetic-wrapper"
import { ProjectsStackedDeck } from "./projects-stacked-deck"
import { ProjectsHardwareStage } from "./projects-hardware-stage"
import { ArrowRight, Layers, LayoutGrid } from "lucide-react"

export function ProjectsSection(): React.ReactElement {
  return (
    <section
      className="py-20 sm:py-24 lg:py-32 relative max-w-(--maxw) mx-auto px-(--gutter)"
      id="projects"
      aria-labelledby="projects-heading"
    >
      {/* Header with Option Switcher Jump Links */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="mb-14 sm:mb-20 pb-8 sm:pb-10 border-b border-(--rule)"
      >
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-(--v3-accent) font-semibold mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-(--v3-accent)" />
              Showcase Comparison · Pick Your Favorite
            </div>
            <h2
              id="projects-heading"
              className="m-0 font-display font-normal text-[clamp(34px,6vw,80px)] leading-[1] sm:leading-[0.95] tracking-tight text-(--ink) text-balance fvs-display"
            >
              Selected work, <em className="not-italic italic text-(--v3-accent) fvs-soft">shipped.</em>
            </h2>
          </div>

          <div className="flex flex-col gap-3 max-w-[46ch]">
            <p className="text-[15px] sm:text-[16px] leading-[1.6] text-secondary-foreground m-0">
              Two world-class layout concepts implemented back-to-back on this page. Scroll through both and let me know which one you prefer.
            </p>
            <div className="flex items-center gap-2 pt-1 flex-wrap">
              <a
                href="#option-1"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-[11px] uppercase tracking-wider border border-(--rule) bg-(--paper) text-secondary-foreground hover:text-(--ink) hover:border-muted-foreground transition-all no-underline"
              >
                <Layers className="w-3 h-3 text-(--v3-accent)" />
                Option 1: Sticky Deck
              </a>
              <a
                href="#option-2"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-[11px] uppercase tracking-wider border border-(--rule) bg-(--paper) text-secondary-foreground hover:text-(--ink) hover:border-muted-foreground transition-all no-underline"
              >
                <LayoutGrid className="w-3 h-3 text-(--v3-accent)" />
                Option 2: Hardware Stage
              </a>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── OPTION 1: THE APPLE CINEMATIC STICKY CARD DECK ── */}
      <div id="option-1" className="scroll-mt-32">
        <div className="flex items-center justify-between gap-4 mb-8 pb-3 border-b border-(--rule)/60">
          <span className="font-mono text-[12px] uppercase tracking-[0.14em] text-(--ink) font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-(--v3-accent)" />
            Option 1 · The Cinematic Sticky Card Deck
          </span>
          <span className="font-mono text-[11px] text-muted-foreground uppercase tracking-wider hidden sm:inline">
            Scroll to stack cards
          </span>
        </div>

        <ProjectsStackedDeck />
      </div>

      {/* ── OPTION 2: THE APPLE PRO INTERACTIVE HARDWARE STAGE ── */}
      <div id="option-2" className="pt-24 sm:pt-32 scroll-mt-32 border-t border-(--rule) mt-16 sm:mt-24">
        <div className="flex items-center justify-between gap-4 mb-8 pb-3 border-b border-(--rule)/60">
          <span className="font-mono text-[12px] uppercase tracking-[0.14em] text-(--ink) font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-(--v3-accent)" />
            Option 2 · The Apple Pro Interactive Hardware Stage
          </span>
          <span className="font-mono text-[11px] text-muted-foreground uppercase tracking-wider hidden sm:inline">
            Click tabs & inspect features
          </span>
        </div>

        <ProjectsHardwareStage />
      </div>

      {/* Global Bottom CTA: Complete Archive */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6 }}
        className="flex justify-center mt-16 sm:mt-20 lg:mt-24 pt-8 sm:pt-10 border-t border-(--rule)"
      >
        <MagneticWrapper strength={20}>
          <Link
            href="/work"
            className="group inline-flex items-center justify-center w-full sm:w-auto px-7 sm:px-9 py-3.5 rounded-full font-mono text-[12px] uppercase tracking-[0.08em] font-medium cursor-pointer border border-(--rule) bg-(--paper) text-(--ink) transition-all duration-300 no-underline hover:border-(--v3-accent) hover:text-(--v3-accent) hover:bg-[color-mix(in_oklab,var(--v3-accent)_5%,transparent)] text-center shadow-sm"
          >
            Explore complete archive{" "}
            <ArrowRight
              className="inline-block transition-transform duration-300 group-hover:translate-x-1 ml-2.5 w-4 h-4 shrink-0"
              aria-hidden="true"
            />
          </Link>
        </MagneticWrapper>
      </motion.div>
    </section>
  )
}
