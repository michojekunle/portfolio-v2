"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, useScroll, useTransform } from "framer-motion"
import { FEATURED_PROJECTS } from "@/lib/case-studies"
import { MagneticWrapper } from "./magnetic-wrapper"
import { TiltCard } from "./tilt-card"
import { ArrowRight } from "lucide-react"

const PROJECT_COLORS: Record<string, string> = {
  coinsafe: "#8b5cf6",
  zamir: "#06b6d4",
  createstacksapp: "#ec4899",
}

export function ProjectsSection(): React.ReactElement {
  // Default to first project so the panel is never empty
  const [hoveredIdx, setHoveredIdx] = useState<number>(0)
  const containerRef = useRef<HTMLElement>(null)
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  })
  
  const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"])

  return (
    <section
      ref={containerRef}
      className="py-30 max-180:py-18 relative max-w-(--maxw) mx-auto px-(--gutter)"
      id="projects"
      aria-labelledby="projects-heading"
    >
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="grid grid-cols-[120px_1fr] max-180:grid-cols-1 gap-12 max-180:gap-6 items-baseline mb-20 max-180:mb-12"
      >
        <div className="font-mono text-[11px] tracking-[0.18em] text-secondary-foreground pt-4.5">02 — FEATURED</div>
        <div>
          <h2 id="projects-heading" className="m-0 font-display font-normal text-[clamp(44px,7vw,88px)] leading-[0.95] tracking-tight text-(--ink) text-balance fvs-display">
            Masterpieces, I&apos;ve <em className="not-italic italic text-(--v3-accent) fvs-soft">shipped.</em>
          </h2>
          <div className="col-start-2 max-180:col-start-1 max-w-[56ch] text-[17px] leading-[1.6] text-secondary-foreground mt-4.5">
            Three I&apos;d most want to talk about. Full case studies inside — process,
            wrong turns, what shipped.
          </div>
        </div>
      </motion.div>

      {/* Desktop: split-panel (hidden on mobile via CSS) */}
      <div className="grid grid-cols-2 gap-10 items-start max-[920px]:hidden">

        {/* Left: numbered text list */}
        <nav className="flex flex-col gap-3" aria-label="Featured projects">
          {FEATURED_PROJECTS.map((p, i) => (
            <motion.div
              key={p.slug}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Link
                href={`/work/${p.slug}`}
                className={`group grid grid-cols-[24px_1fr_auto_auto_24px] gap-4 items-center p-[24px_20px] rounded-xl border border-transparent no-underline transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] cursor-pointer bg-transparent text-(--ink) ${hoveredIdx === i ? "bg-(--bg-2) border-(--rule) opacity-100" : "opacity-40"}`}
                onMouseEnter={() => setHoveredIdx(i)}
                aria-label={`View case study: ${p.name}`}
              >
                <span className="font-mono text-[10px] text-muted-foreground">{p.idx}</span>
                <div className="flex flex-col gap-1">
                  <span className="font-display font-normal text-[24px] leading-[1.1] fvs-text">{p.name}</span>
                  <span className="text-[13px] text-secondary-foreground">{p.stack.slice(0, 3).join(" · ")}</span>
                </div>
                <span className="font-mono text-[10px] tracking-[0.08em] uppercase text-muted-foreground">{p.tag} · {p.year}</span>
                <span className="font-mono text-[10px] tracking-[0.08em] uppercase text-muted-foreground">{p.role.split(" · ")[0]}</span>
                <ArrowRight className={`w-4 h-4 text-muted-foreground transition-all duration-300 ${hoveredIdx === i ? "opacity-100 translate-x-0 text-(--ink)" : "opacity-0 -translate-x-2"}`} aria-hidden="true" />
              </Link>
            </motion.div>
          ))}
        </nav>

        {/* Right: sticky cross-fading image panel */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="sticky top-30 aspect-[4/3] rounded-2xl overflow-hidden bg-(--bg-2) border border-(--rule)" 
          aria-hidden="true"
        >
          {FEATURED_PROJECTS.map((p, i) => (
            <div key={p.slug} className={`absolute inset-0 transition-opacity duration-400 ease-in flex flex-col ${hoveredIdx === i ? "opacity-100 pointer-events-auto z-[2]" : "opacity-0 pointer-events-none"}`}>
              <div className="flex-1 relative overflow-hidden bg-(--bg-2) group">
                {p.image ? (
                  <motion.div style={{ y, width: "100%", height: "120%", top: "-10%", position: "absolute" }}>
                    <Image
                      src={p.image}
                      alt={p.name}
                      fill
                      className={`object-cover transition-transform duration-[6000ms] ease-out ${hoveredIdx === i ? "scale-[1.05]" : "scale-100"}`}
                      sizes="360px"
                      priority={i === 0}
                    />
                  </motion.div>
                ) : (
                  <div
                    className="v3-serif"
                    style={{
                      width: "100%", height: "100%",
                      background: `linear-gradient(135deg, ${PROJECT_COLORS[p.slug] ?? "var(--v3-accent)"} 0%, color-mix(in oklab, ${PROJECT_COLORS[p.slug] ?? "var(--v3-accent)"} 30%, var(--bg)) 100%)`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "32px", color: "white", opacity: 0.8,
                    }}
                  >
                    {p.name}
                  </div>
                )}
              </div>
              <div className="p-[16px_20px] flex justify-between items-center bg-(--bg) border-t border-(--rule) relative z-10">
                <span className="font-display text-[18px] text-(--ink)">{p.name}</span>
                <span className="font-mono text-[10px] uppercase text-muted-foreground">{p.tag} · {p.year}</span>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Mobile: project cards (shown only on mobile via CSS) */}
      <div className="hidden max-[920px]:flex flex-col gap-6">
        {FEATURED_PROJECTS.map((p, i) => (
          <motion.div
            key={p.slug}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          >
            <TiltCard>
              <Link
                href={`/work/${p.slug}`}
                className="group flex flex-col border border-(--rule) rounded-2xl overflow-hidden bg-(--paper) h-full no-underline text-inherit transition-all duration-300 hover:border-(--v3-accent-soft) hover:shadow-[0_16px_40px_-10px_color-mix(in_oklab,var(--ink)_5%,transparent)]"
                aria-label={`View case study: ${p.name}`}
              >
                <div
                  className="h-1.5 w-full"
                  style={{ background: PROJECT_COLORS[p.slug] ?? "var(--v3-accent)" }}
                />
                <div className="p-8 max-[480px]:p-6 flex flex-col gap-3 flex-1">
                  <div className="font-mono text-[10px] uppercase text-muted-foreground tracking-widest">{p.idx} · {p.year} · {p.tag}</div>
                  <div className="font-display text-[32px] leading-[1.1] text-(--ink) transition-colors duration-300 group-hover:text-(--v3-accent)">{p.name}</div>
                  <div className="text-[16px] text-secondary-foreground leading-[1.6]">{p.desc}</div>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {p.stack.slice(0, 4).map((s) => (
                      <span key={s} className="font-mono text-[10px] px-2.5 py-1 border border-(--rule) rounded text-muted-foreground uppercase bg-(--bg)">{s}</span>
                    ))}
                  </div>
                </div>
              </Link>
            </TiltCard>
          </motion.div>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6 }}
        className="flex justify-center mt-20 pt-10 border-t border-(--rule)"
      >
        <MagneticWrapper strength={20}>
          <Link href="/work" className="group inline-flex items-center justify-center px-8 h-13 rounded-full font-mono text-[11px] uppercase tracking-[0.15em] font-medium cursor-pointer border border-(--rule) bg-transparent text-(--ink) transition-all duration-300 no-underline hover:border-(--v3-accent) hover:text-(--v3-accent) hover:bg-[color-mix(in_oklab,var(--v3-accent)_5%,transparent)]">
            Explore complete archive <ArrowRight className="inline-block transition-transform duration-300 group-hover:translate-x-1 ml-2.5 w-4 h-4" aria-hidden="true" />
          </Link>
        </MagneticWrapper>
      </motion.div>
    </section>
  )
}
