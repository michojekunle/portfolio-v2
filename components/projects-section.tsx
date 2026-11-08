"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, useScroll, useTransform } from "framer-motion"
import { FEATURED_PROJECTS } from "@/lib/case-studies"
import { MagneticWrapper } from "./magnetic-wrapper"
import { ArrowRight } from "lucide-react"

const PROJECT_COLORS: Record<string, string> = {
  coinsafe: "#D97706",
  zamir: "#2563EB",
  createstacksapp: "#ec4899",
  "zk-implementations": "#0d9488",
  rhng: "#64748b",
  edifition: "#7c3aed",
}

export function ProjectsSection(): React.ReactElement {
  // Default to first project so the panel is never empty
  const [hoveredIdx, setHoveredIdx] = useState<number>(0)
  const containerRef = useRef<HTMLElement>(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  })

  const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"])

  return (
    <section
      ref={containerRef}
      className="py-20 sm:py-24 lg:py-32 relative max-w-(--maxw) mx-auto px-(--gutter)"
      id="projects"
      aria-labelledby="projects-heading"
    >
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
              className="m-0 font-display font-normal text-[clamp(34px,6vw,80px)] leading-[1] sm:leading-[0.95] tracking-tight text-(--ink) text-balance fvs-display"
            >
              Selected work, <em className="not-italic italic text-(--v3-accent) fvs-soft">shipped.</em>
            </h2>
          </div>
          <p className="max-w-[44ch] text-[15px] sm:text-[16px] leading-[1.6] text-secondary-foreground m-0">
            Three I&apos;d most want to talk about. Full case studies inside with process,
            wrong turns, and what shipped.
          </p>
        </div>
      </motion.div>

      {/* Desktop: split-panel with sticky interactive preview (>= 1024px) */}
      <div className="hidden lg:grid grid-cols-[1.1fr_1fr] gap-10 xl:gap-16 items-start">
        {/* Left: spacious editorial list */}
        <nav className="flex flex-col gap-4" aria-label="Featured projects">
          {FEATURED_PROJECTS.map((p, i) => {
            const isSelected = hoveredIdx === i
            return (
              <motion.div
                key={p.slug}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Link
                  href={`/work/${p.slug}`}
                  onMouseEnter={() => setHoveredIdx(i)}
                  onFocus={() => setHoveredIdx(i)}
                  className={`group relative flex flex-col p-6 xl:p-7 rounded-2xl border transition-all duration-300 no-underline cursor-pointer ${
                    isSelected
                      ? "bg-(--paper) border-(--rule) shadow-[0_16px_40px_-12px_color-mix(in_oklab,var(--ink)_8%,transparent)] -translate-y-0.5"
                      : "bg-transparent border-transparent hover:border-(--rule)/40 opacity-80 hover:opacity-100"
                  }`}
                  aria-label={`View case study: ${p.name}`}
                >
                  {/* Top row: Index + Tag pill + Action Arrow */}
                  <div className="flex items-center justify-between gap-3 mb-2.5">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-[12px] text-muted-foreground font-semibold">
                        {p.idx}
                      </span>
                      <span className="font-mono text-[11px] tracking-[0.05em] text-muted-foreground px-2.5 py-0.5 rounded-full border border-(--rule) bg-(--bg-2)/70">
                        {p.tag.split(" · ")[0]} · {p.year}
                      </span>
                    </div>
                    <div
                      className={`w-7 h-7 rounded-full border border-(--rule) flex items-center justify-center transition-all duration-300 shrink-0 ${
                        isSelected
                          ? "border-(--v3-accent) bg-(--v3-accent) text-white"
                          : "text-muted-foreground bg-transparent group-hover:text-(--ink)"
                      }`}
                    >
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </div>
                  </div>

                  {/* Second row: Title (full width, never truncates) */}
                  <h3 className="m-0 font-display font-normal text-[26px] xl:text-[28px] leading-[1.18] text-(--ink) fvs-text group-hover:text-(--v3-accent) transition-colors mb-2">
                    {p.name}
                  </h3>

                  {/* Third row: Description */}
                  <p className="text-[14px] xl:text-[15px] leading-[1.6] text-secondary-foreground m-0 mb-4 line-clamp-2">
                    {p.desc}
                  </p>

                  {/* Fourth row: Role & Tech Stack */}
                  <div className="flex items-center justify-between gap-3 pt-3 border-t border-(--rule)/50 flex-wrap">
                    <span className="font-mono text-[12px] text-muted-foreground tracking-[0.02em]">
                      Role: <span className="text-(--ink) font-medium">{p.role.split(" · ")[0]}</span>
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {p.stack.slice(0, 3).map((tech) => (
                        <span
                          key={tech}
                          className="font-mono text-[11px] px-2 py-0.5 rounded bg-(--bg-2) text-secondary-foreground border border-(--rule)/60"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </nav>

        {/* Right: sticky cross-fading image panel */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="sticky top-28 xl:top-32 flex flex-col gap-3.5"
          aria-label="Project visual preview"
        >
          <Link
            href={`/work/${FEATURED_PROJECTS[hoveredIdx]?.slug}`}
            className="group/preview block no-underline"
            aria-label={`Open case study for ${FEATURED_PROJECTS[hoveredIdx]?.name}`}
          >
            <div className="aspect-[16/11] rounded-2xl overflow-hidden border border-(--rule) relative bg-(--bg-2) shadow-[0_20px_50px_-15px_color-mix(in_oklab,var(--ink)_10%,transparent)]">
              {FEATURED_PROJECTS.map((p, i) => (
                <div
                  key={p.slug}
                  className={`absolute inset-0 transition-opacity duration-400 ease-in flex flex-col ${
                    hoveredIdx === i ? "opacity-100 pointer-events-auto z-[2]" : "opacity-0 pointer-events-none"
                  }`}
                >
                  <div className="flex-1 relative overflow-hidden group">
                    {p.image ? (
                      <motion.div style={{ y, width: "100%", height: "120%", top: "-10%", position: "absolute" }}>
                        <Image
                          src={p.image}
                          alt={p.name}
                          fill
                          className={`object-cover transition-transform duration-[5000ms] ease-out ${
                            hoveredIdx === i ? "scale-[1.04]" : "scale-100"
                          }`}
                          sizes="(max-width: 1200px) 50vw, 600px"
                          style={{ objectPosition: p.imagePosition }}
                          priority={i === 0}
                          unoptimized={p.image.endsWith(".svg")}
                        />
                      </motion.div>
                    ) : (
                      <div
                        className="v3-serif font-display"
                        style={{
                          width: "100%",
                          height: "100%",
                          background: `linear-gradient(135deg, color-mix(in oklab, ${
                            PROJECT_COLORS[p.slug] ?? "var(--v3-accent)"
                          } 15%, #09090b) 0%, #09090b 100%)`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "36px",
                          color: "#f5f5f4",
                          letterSpacing: "-0.02em",
                        }}
                      >
                        {p.name}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Floating preview badge */}
              <div className="absolute top-3.5 left-3.5 z-10 font-mono text-[11px] px-3 py-1 rounded-full bg-(--bg)/85 backdrop-blur-md border border-(--rule) text-(--ink) flex items-center gap-2 pointer-events-none">
                <span className="w-1.5 h-1.5 rounded-full bg-(--v3-accent)" />
                Case study preview
              </div>
            </div>

            <div className="flex justify-between items-center px-1.5 pt-3">
              <div>
                <span className="font-display text-[19px] xl:text-[20px] text-(--ink) block leading-tight group-hover/preview:text-(--v3-accent) transition-colors">
                  {FEATURED_PROJECTS[hoveredIdx]?.name}
                </span>
                <span className="font-mono text-[12px] text-muted-foreground mt-0.5 block">
                  {FEATURED_PROJECTS[hoveredIdx]?.role.split(" · ")[0]} · {FEATURED_PROJECTS[hoveredIdx]?.year}
                </span>
              </div>
              <span className="font-mono text-[12px] text-(--v3-accent) group-hover/preview:underline flex items-center gap-1 font-medium">
                Read case study <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/preview:translate-x-1" />
              </span>
            </div>
          </Link>
        </motion.div>
      </div>

      {/* Mobile & Tablet: individual rich cards (< 1024px) */}
      <div className="flex lg:hidden flex-col gap-6 sm:gap-8">
        {FEATURED_PROJECTS.map((p, i) => (
          <motion.div
            key={p.slug}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          >
            <Link
              href={`/work/${p.slug}`}
              className="group flex flex-col border border-(--rule) rounded-2xl overflow-hidden bg-(--paper) h-full no-underline text-inherit transition-all duration-300 hover:border-(--v3-accent-soft) hover:shadow-[0_16px_40px_-10px_color-mix(in_oklab,var(--ink)_8%,transparent)]"
              aria-label={`View case study: ${p.name}`}
            >
              {p.image && (
                <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] bg-(--bg-2) overflow-hidden border-b border-(--rule)">
                  <Image
                    src={p.image}
                    alt={p.name}
                    fill
                    className="object-cover object-top transition-transform duration-700 group-hover:scale-[1.03]"
                    sizes="(max-width: 1024px) 100vw, 800px"
                    unoptimized={p.image.endsWith(".svg")}
                  />
                  <span className="absolute top-3 right-3 sm:top-3.5 sm:right-3.5 font-mono text-[11px] tracking-wider uppercase px-2.5 py-1 rounded-full bg-(--bg)/90 backdrop-blur-md border border-(--rule) text-(--ink)">
                    {p.tag.split(" · ")[0]} · {p.year}
                  </span>
                </div>
              )}
              <div className="p-5 sm:p-7 flex flex-col gap-2.5 sm:gap-3 flex-1">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="font-mono text-[12px] text-muted-foreground font-medium">
                    {p.idx} · {p.role.split(" · ")[0]}
                  </span>
                  <span className="font-mono text-[12px] text-(--v3-accent) font-semibold flex items-center gap-1.5 shrink-0 group-hover:translate-x-0.5 transition-transform">
                    View study <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
                <h3 className="m-0 font-display text-[22px] sm:text-[26px] leading-[1.2] text-(--ink) transition-colors duration-300 group-hover:text-(--v3-accent)">
                  {p.name}
                </h3>
                <p className="m-0 text-[14px] sm:text-[15px] text-secondary-foreground leading-[1.6] line-clamp-3">
                  {p.desc}
                </p>
                <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-1 pt-3 border-t border-(--rule)">
                  {p.stack.slice(0, 4).map((s) => (
                    <span
                      key={s}
                      className="font-mono text-[11px] px-2 py-0.5 rounded bg-(--bg-2) border border-(--rule)/60 text-secondary-foreground"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

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
            className="group inline-flex items-center justify-center w-full sm:w-auto px-6 sm:px-8 py-3.5 rounded-full font-mono text-[12px] tracking-[0.06em] font-medium cursor-pointer border border-(--rule) bg-transparent text-(--ink) transition-all duration-300 no-underline hover:border-(--v3-accent) hover:text-(--v3-accent) hover:bg-[color-mix(in_oklab,var(--v3-accent)_5%,transparent)] text-center"
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
