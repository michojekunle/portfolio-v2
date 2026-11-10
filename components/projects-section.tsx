"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { FEATURED_PROJECTS, type FeaturedProject } from "@/lib/case-studies"
import { MagneticWrapper } from "./magnetic-wrapper"
import { AnimatedCounter } from "./animated-counter"
import { ArrowRight, Lock, ExternalLink } from "lucide-react"

// Verified metrics for each featured project
const PROJECT_METRICS: Record<string, { n: string; l: string; desc: string }[]> = {
  zamir: [
    { n: "69", l: "Believers", desc: "Global active community" },
    { n: "40.7%", l: "Repeat Rate", desc: "30-day worship retention" },
  ],
  coinsafe: [
    { n: "200+", l: "Wallets", desc: "ERC-4337 passkey onboarding" },
    { n: "10+", l: "Tx Types", desc: "Synchronized on-chain event pipeline" },
  ],
  "triple-cure": [
    { n: "20", l: "Scholars", desc: "Full tuition + mentorship funded" },
    { n: "~8 wks", l: "To Production", desc: "Sanity CMS + Next.js build" },
  ],
  "zk-implementations": [
    { n: "3", l: "Protocols", desc: "Sumcheck, GKR & KZG verified" },
    { n: "Criterion", l: "Benchmarked", desc: "Empirical prover & verifier performance" },
  ],
}

// Live URL display labels for the browser mockup chrome
const PROJECT_DOMAINS: Record<string, string> = {
  zamir: "zamir.app · Live Stage",
  coinsafe: "coinsafe.network · Production",
  "triple-cure": "triplecure.com · Live Foundation",
  "zk-implementations": "github.com/michojekunle/zk · Rust",
}

export function ProjectsSection(): React.ReactElement {
  const [activeIdx, setActiveIdx] = useState<number>(0)
  const activeProject: FeaturedProject = FEATURED_PROJECTS[activeIdx] ?? FEATURED_PROJECTS[0]
  const metrics = PROJECT_METRICS[activeProject.slug] ?? []
  const domainLabel = PROJECT_DOMAINS[activeProject.slug] ?? `${activeProject.slug}.dev`

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
        className="mb-12 sm:mb-16 pb-6 sm:pb-8 border-b border-(--rule)"
      >
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 sm:gap-6">
          <div>
            <h2
              id="projects-heading"
              className="m-0 font-display font-normal text-4xl sm:text-5xl lg:text-6xl leading-[1] sm:leading-[0.95] tracking-tight text-(--ink) text-balance fvs-display"
            >
              Selected work, <em className="not-italic italic text-(--v3-accent) fvs-soft">shipped.</em>
            </h2>
          </div>
          <p className="max-w-[46ch] text-sm sm:text-base leading-relaxed text-secondary-foreground m-0">
            Four key systems spanning protocol engineering, full-stack architecture, and zero-knowledge research. Full case studies inside with architecture, wrong turns, and verified benchmarks.
          </p>
        </div>
      </motion.div>

      {/* ── DESKTOP: SPLIT-PANEL INTERACTIVE SHOWCASE (>= 1024px) ── */}
      <div className="hidden lg:grid grid-cols-[1fr_1.15fr] gap-10 xl:gap-14 items-start">
        {/* Left Column: Interactive Editorial Project List */}
        <nav className="flex flex-col gap-3.5" aria-label="Featured projects list">
          {FEATURED_PROJECTS.map((p, i) => {
            const isSelected = activeIdx === i
            const pMetrics = PROJECT_METRICS[p.slug] ?? []

            return (
              <motion.div
                key={p.slug}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <button
                  type="button"
                  onClick={() => setActiveIdx(i)}
                  onMouseEnter={() => setActiveIdx(i)}
                  onFocus={() => setActiveIdx(i)}
                  className={`w-full group relative flex flex-col p-6 rounded-2xl border transition-all duration-200 cursor-pointer text-left select-none outline-none ${
                    isSelected
                      ? "bg-(--paper) border-(--rule) shadow-[0_12px_32px_-12px_color-mix(in_oklab,var(--ink)_8%,transparent)]"
                      : "bg-transparent border-transparent hover:border-(--rule)/50"
                  }`}
                  aria-selected={isSelected}
                  aria-label={`Select ${p.name}`}
                >
                  <div className="w-full flex items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground flex-wrap">
                      <span className="font-semibold text-(--ink)">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-(--rule)">·</span>
                      <span className="text-(--v3-accent) font-medium">
                        {p.tag.split(" · ")[0]}
                      </span>
                      <span className="text-(--rule)">·</span>
                      <span>{p.year}</span>
                    </div>

                    <span
                      aria-hidden="true"
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors duration-200 shrink-0 ${
                        isSelected
                          ? "bg-(--v3-accent) text-white"
                          : "text-muted-foreground group-hover:text-(--ink)"
                      }`}
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>

                  <h3 className="m-0 font-display font-normal text-2xl xl:text-3xl leading-snug tracking-tight text-(--ink) fvs-display group-hover:text-(--v3-accent) transition-colors">
                    {p.name}
                  </h3>

                  <div className="font-mono text-xs text-(--v3-accent) font-medium mt-1">
                    {p.role}
                  </div>

                  <p className="m-0 mt-2 text-xs xl:text-sm text-secondary-foreground leading-relaxed line-clamp-2">
                    {p.desc}
                  </p>

                  {pMetrics.length > 0 && (
                    <div className="w-full flex items-center gap-4 mt-3 pt-2.5 border-t border-(--rule)/40 font-mono text-xs text-muted-foreground">
                      {pMetrics.map((m, mIdx) => (
                        <div key={m.l} className="flex items-center gap-1.5">
                          {mIdx > 0 && <span className="text-(--rule) mr-1">/</span>}
                          <span className="font-semibold text-(--ink)">{m.n}</span>
                          <span>{m.l}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <ul
                    className="flex flex-wrap gap-1.5 mt-3 p-0 m-0 list-none"
                    role="list"
                    aria-label={`Technologies used in ${p.name}`}
                  >
                    {p.stack.slice(0, 4).map((tech) => (
                      <li
                        key={tech}
                        className="font-mono text-xs px-2 py-0.5 rounded-[4px] border border-(--rule)/60 bg-(--bg-2) text-secondary-foreground"
                      >
                        {tech}
                      </li>
                    ))}
                  </ul>
                </button>
              </motion.div>
            )
          })}
        </nav>

        {/* Right Column: Sticky Live Preview Stage */}
        <div className="lg:sticky lg:top-28 w-full">
          <div className="flex flex-col rounded-2xl border border-(--rule) bg-(--paper) overflow-hidden shadow-[0_16px_40px_-16px_color-mix(in_oklab,var(--ink)_10%,transparent)]">
            {/* Top Display Chrome */}
            <div className="h-10 px-4 border-b border-(--rule) flex items-center justify-between gap-4">
              <svg width="36" height="10" viewBox="0 0 36 10" fill="none" aria-hidden="true" className="shrink-0">
                <circle cx="5" cy="5" r="4" fill="var(--rule)" />
                <circle cx="17" cy="5" r="4" fill="var(--rule)" />
                <circle cx="29" cy="5" r="4" fill="var(--rule)" />
              </svg>
              <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground truncate">
                <Lock className="w-3 h-3 text-(--v3-accent) shrink-0" />
                <span className="text-(--ink) font-medium truncate">{domainLabel}</span>
              </div>
              <span className="font-mono text-xs text-muted-foreground hidden xl:inline shrink-0">
                Retina Display
              </span>
            </div>

            {/* Screen Canvas (Proper Aspect Ratio, Zero Lost Content) */}
            <div className="relative w-full aspect-[16/10] overflow-hidden">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={activeProject.slug}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="relative w-full h-full flex items-center justify-center"
                >
                  {activeProject.image && (
                    <img
                      src={activeProject.image}
                      alt={`${activeProject.name} showcase screen`}
                      className={`w-full h-full ${
                        activeProject.slug === "zk-implementations"
                          ? "object-contain p-3.5"
                          : "object-cover object-top"
                      }`}
                      loading="eager"
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
            {/* Stage Telemetry & Actions Bar */}
            <div className="p-5 xl:p-6 flex flex-col gap-4 border-t border-(--rule)">
              {/* Active Project Proof Metrics Banner */}
              {metrics.length > 0 && (
                <div className="grid grid-cols-2 gap-4 pb-4 border-b border-(--rule)/60">
                  {metrics.map((m) => (
                    <div key={m.l} className="flex flex-col gap-0.5">
                      <div className="font-display font-normal text-2xl xl:text-3xl text-(--ink) leading-none">
                        <AnimatedCounter value={m.n} />
                      </div>
                      <div className="font-mono text-xs font-semibold text-(--ink) mt-0.5">
                        {m.l}
                      </div>
                      <div className="text-xs text-secondary-foreground leading-normal">
                        {m.desc}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Action Buttons: Read Case Study & Launch Live */}
              <div className="flex items-center justify-between gap-4 flex-wrap pt-1">
                <MagneticWrapper strength={15}>
                  <Link
                    href={`/work/${activeProject.slug}`}
                    className="inline-flex items-center gap-2 px-6 py-2.5 font-mono text-xs tracking-wider font-medium text-(--ink) hover:text-(--v3-accent) transition-colors"
                  >
                    Read Case Study <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </MagneticWrapper>

                {activeProject.live && (
                  <a
                    href={`https://${activeProject.live?.replace(/^https?:\/\//, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-mono text-xs tracking-wider text-muted-foreground hover:text-(--v3-accent) transition-colors py-2"
                  >
                    <svg width="6" height="6" viewBox="0 0 6 6" fill="currentColor" className="text-(--v3-accent) shrink-0" aria-hidden="true">
                      <circle cx="3" cy="3" r="3" fill="currentColor" />
                    </svg>
                    <span>{activeProject.liveLabel ?? "Live App"}</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── MOBILE & TABLET: EDITORIAL CARDS (< 1024px) ── */}
      <div className="flex lg:hidden flex-col gap-8 sm:gap-10">
        {FEATURED_PROJECTS.map((p, i) => {
          const pMetrics = PROJECT_METRICS[p.slug] ?? []

          return (
            <motion.article
              key={p.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="flex flex-col border border-(--rule) rounded-2xl overflow-hidden bg-(--paper)"
            >
              {/* Screen Preview Container (Clean Aspect Ratio, Zero Loss) */}
              <div className="relative w-full aspect-[16/10] overflow-hidden border-b border-(--rule)">
                {p.image && (
                  <img
                    src={p.image}
                    alt={p.name}
                    className={`w-full h-full ${
                      p.slug === "zk-implementations"
                        ? "object-contain p-3.5"
                        : "object-cover object-top"
                    }`}
                    loading="lazy"
                  />
                )}
              </div>

              {/* Card Body */}
              <div className="p-5 sm:p-7 flex flex-col gap-3.5">
                {/* Meta Row */}
                <div className="flex items-center justify-between gap-2 font-mono text-xs text-muted-foreground flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-(--ink)">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-(--rule)">·</span>
                    <span className="text-(--v3-accent) font-medium">
                      {p.tag.split(" · ")[0]}
                    </span>
                    <span className="text-(--rule)">·</span>
                    <span>{p.year}</span>
                  </div>
                  <span className="text-secondary-foreground font-medium">
                    {p.role}
                  </span>
                </div>

                {/* Title */}
                <h3 className="m-0 font-display font-normal text-2xl sm:text-3xl leading-snug text-(--ink) fvs-display">
                  {p.name}
                </h3>

                {/* Lede / Description */}
                <p className="m-0 text-sm text-secondary-foreground leading-relaxed max-w-[65ch]">
                  {p.desc}
                </p>

                {/* Proof Metrics */}
                {pMetrics.length > 0 && (
                  <div className="grid grid-cols-2 gap-4 py-3 border-y border-(--rule)/60">
                    {pMetrics.map((m) => (
                      <div key={m.l} className="flex flex-col gap-0.5">
                        <div className="font-display font-normal text-2xl text-(--ink) leading-none">
                          <AnimatedCounter value={m.n} />
                        </div>
                        <div className="font-mono text-xs font-semibold text-(--ink)">
                          {m.l}
                        </div>
                        <div className="text-xs text-secondary-foreground">
                          {m.desc}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Technology Stack Tags */}
                <ul
                  className="flex flex-wrap gap-1.5 p-0 m-0 list-none"
                  role="list"
                  aria-label={`Technologies used in ${p.name}`}
                >
                  {p.stack.slice(0, 5).map((tech) => (
                    <li
                      key={tech}
                      className="font-mono text-xs px-2.5 py-1 rounded-[4px] border border-(--rule)/60 bg-(--bg-2) text-secondary-foreground"
                    >
                      {tech}
                    </li>
                  ))}
                </ul>

                {/* CTAs */}
                <div className="flex items-center gap-5 pt-2 flex-wrap">
                  <MagneticWrapper strength={15}>
                    <Link
                      href={`/work/${p.slug}`}
                      className="inline-flex items-center gap-2 font-mono text-xs tracking-wider font-medium text-(--ink) hover:text-(--v3-accent) transition-colors py-2"
                    >
                      Read Case Study <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </MagneticWrapper>

                  {p.live && (
                    <a
                      href={`https://${p.live?.replace(/^https?:\/\//, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 font-mono text-xs tracking-wider text-muted-foreground hover:text-(--v3-accent) transition-colors py-2"
                    >
                      <svg width="6" height="6" viewBox="0 0 6 6" fill="currentColor" className="text-(--v3-accent) shrink-0" aria-hidden="true">
                        <circle cx="3" cy="3" r="3" fill="currentColor" />
                      </svg>
                      <span>{p.liveLabel ?? "Live App"}</span>
                      <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                    </a>
                  )}
                </div>
              </div>
            </motion.article>
          )
        })}
      </div>

      {/* ── GLOBAL BOTTOM CTA: Archive Link ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6 }}
        className="flex justify-center mt-12 sm:mt-16 lg:mt-20 pt-8 sm:pt-10 border-t border-(--rule)"
      >
        <MagneticWrapper strength={20}>
          <Link
            href="/work"
            className="group inline-flex items-center justify-center w-full sm:w-auto px-7 sm:px-9 py-3.5 rounded-full font-mono text-xs tracking-wider font-medium cursor-pointer border border-(--rule) bg-(--paper) text-(--ink) transition-all duration-300 no-underline hover:border-(--v3-accent) hover:text-(--v3-accent) hover:bg-[color-mix(in_oklab,var(--v3-accent)_5%,transparent)] text-center"
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
