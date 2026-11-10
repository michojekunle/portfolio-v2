"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { MagneticWrapper } from "./magnetic-wrapper"
import { ProjectsStackedDeck } from "./projects-stacked-deck"
import { ProjectsHardwareStage } from "./projects-hardware-stage"
import { FEATURED_PROJECTS } from "@/lib/case-studies"
import { ArrowRight, Layers } from "lucide-react"

export function ProjectsSection(): React.ReactElement {
  // Flagship top project is rendered on the interactive hardware stage
  const flagshipProject = FEATURED_PROJECTS[0]
  // Remaining production projects are rendered on the panoramic card deck
  const remainingProjects = FEATURED_PROJECTS.slice(1)

  return (
    <section
      className="py-20 sm:py-24 lg:py-32 relative max-w-(--maxw) mx-auto px-(--gutter)"
      id="projects"
      aria-labelledby="projects-heading"
    >
      {/* ── SECTION HEADER ── */}
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
              Selected Systems · Shipped
            </div>
            <h2
              id="projects-heading"
              className="m-0 font-display font-normal text-[clamp(34px,6vw,80px)] leading-[1] sm:leading-[0.95] tracking-tight text-(--ink) text-balance fvs-display"
            >
              Selected work, <em className="not-italic italic text-(--v3-accent) fvs-soft">shipped.</em>
            </h2>
          </div>

          <div className="flex flex-col gap-2 max-w-[48ch]">
            <p className="text-sm sm:text-base leading-[1.6] text-secondary-foreground m-0">
              Interactive hardware telemetry for my flagship build, followed by deep-dive production monographs below. Full case studies inside with architecture, wrong turns, and verified benchmarks.
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── 1. FLAGSHIP SHOWCASE: THE PRO INTERACTIVE HARDWARE STAGE ── */}
      <div className="mb-20 sm:mb-28">
        <ProjectsHardwareStage
          project={flagshipProject}
          standaloneTopProject={true}
        />
      </div>

      {/* ── 2. MONOGRAPH INTERLUDE: Hairline Divider & Sub-Header ── */}
      <div className="flex items-center justify-between gap-4 mb-8 pb-3.5 border-b border-(--rule)/70">
        <div className="flex items-center gap-2 font-mono text-xs tracking-wider text-(--ink) font-medium">
          <Layers className="w-4 h-4 text-(--v3-accent)" />
          <span>Production Systems · Architecture Archive</span>
        </div>
        <span className="font-mono text-[11px] text-muted-foreground tracking-wider hidden sm:inline">
          Scroll to stack cards · Click tabs to inspect
        </span>
      </div>

      {/* ── 3. REMAINING PROJECTS: THE PANORAMIC STICKY CARD DECK ── */}
      <ProjectsStackedDeck projects={remainingProjects} />

      {/* ── 4. GLOBAL BOTTOM CTA: Complete Archive ── */}
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
            className="group inline-flex items-center justify-center w-full sm:w-auto px-7 sm:px-9 py-3.5 rounded-full font-mono text-xs uppercase tracking-[0.08em] font-medium cursor-pointer border border-(--rule) bg-(--paper) text-(--ink) transition-all duration-300 no-underline hover:border-(--v3-accent) hover:text-(--v3-accent) hover:bg-[color-mix(in_oklab,var(--v3-accent)_5%,transparent)] text-center shadow-sm"
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
