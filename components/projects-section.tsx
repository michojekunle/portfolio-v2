"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { FEATURED_PROJECTS } from "@/lib/case-studies"

const PROJECT_COLORS: Record<string, string> = {
  coinsafe: "#8b5cf6",
  zamir: "#06b6d4",
  createstacksapp: "#ec4899",
}

export function ProjectsSection(): React.ReactElement {
  // Default to first project so the panel is never empty
  const [hoveredIdx, setHoveredIdx] = useState<number>(0)

  return (
    <section
      className="py-[120px] max-[720px]:py-[72px] relative max-w-[var(--maxw)] mx-auto px-[var(--gutter)]"
      id="projects"
      aria-labelledby="projects-heading"
    >
      <div className="grid grid-cols-[120px_1fr] max-[720px]:grid-cols-1 gap-[48px] max-[720px]:gap-[12px] items-baseline mb-[80px] max-[720px]:mb-[48px]">
        <div className="font-mono text-[11px] tracking-[0.18em] text-[var(--ink-2)] pt-[18px]">01 — WORK</div>
        <div>
          <h2 id="projects-heading" className="m-0 font-[family:var(--display-font)] font-normal text-[clamp(44px,7vw,88px)] leading-[0.95] tracking-[-0.025em] text-[var(--ink)] text-balance [font-variation-settings:'opsz'_144]">Selected <em className="not-italic italic text-[var(--v3-accent)] [font-variation-settings:'opsz'_144,'SOFT'_100]">work.</em></h2>
          <div className="col-start-2 max-[720px]:col-start-1 max-w-[56ch] text-[17px] leading-[1.6] text-[var(--ink-2)] mt-[18px]">
            Three I&apos;d most want to talk about. Full case studies inside — process,
            wrong turns, what shipped.
          </div>
        </div>
      </div>

      {/* Desktop: split-panel (hidden on mobile via CSS) */}
      <div className="grid grid-cols-2 gap-[40px] items-start max-[920px]:hidden">

        {/* Left: numbered text list */}
        <nav className="flex flex-col gap-[12px]" aria-label="Featured projects">
          {FEATURED_PROJECTS.map((p, i) => (
            <Link
              key={p.slug}
              href={`/work/${p.slug}`}
              className={`group grid grid-cols-[24px_1fr_auto_auto_24px] gap-[16px] items-center p-[24px_20px] rounded-[12px] border border-transparent no-underline transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] cursor-pointer bg-transparent text-[var(--ink)] ${hoveredIdx === i ? "bg-[var(--bg-2)] border-[var(--rule)] opacity-100" : "opacity-40"}`}
              onMouseEnter={() => setHoveredIdx(i)}
              aria-label={`View case study: ${p.name}`}
            >
              <span className="font-mono text-[10px] text-[var(--ink-3)]">{p.idx}</span>
              <div className="flex flex-col gap-[4px]">
                <span className="font-[family:var(--display-font)] font-normal text-[24px] leading-[1.1] [font-variation-settings:'opsz'_96]">{p.name}</span>
                <span className="text-[13px] text-[var(--ink-2)]">{p.stack.slice(0, 3).join(" · ")}</span>
              </div>
              <span className="font-mono text-[10px] tracking-[0.08em] uppercase text-[var(--ink-3)]">{p.tag} · {p.year}</span>
              <span className="font-mono text-[10px] tracking-[0.08em] uppercase text-[var(--ink-3)]">{p.role.split(" · ")[0]}</span>
              <span className={`text-[var(--ink-3)] transition-all duration-300 ${hoveredIdx === i ? "opacity-100 translate-x-0 text-[var(--ink)]" : "opacity-0 -translate-x-[8px]"}`} aria-hidden="true">→</span>
            </Link>
          ))}
        </nav>

        {/* Right: sticky cross-fading image panel */}
        <div className="sticky top-[120px] aspect-[4/3] rounded-[16px] overflow-hidden bg-[var(--bg-2)] border border-[var(--rule)]" aria-hidden="true">
          {FEATURED_PROJECTS.map((p, i) => (
            <div key={p.slug} className={`absolute inset-0 transition-opacity duration-400 ease-in flex flex-col ${hoveredIdx === i ? "opacity-100 pointer-events-auto z-[2]" : "opacity-0 pointer-events-none"}`}>
              <div className="flex-1 relative overflow-hidden bg-[var(--bg-2)] group">
                {p.image ? (
                  <Image
                    src={p.image}
                    alt={p.name}
                    fill
                    className={`object-cover transition-transform duration-[6000ms] ease-out ${hoveredIdx === i ? "scale-[1.05]" : "scale-100"}`}
                    sizes="360px"
                    priority={i === 0}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%", height: "100%",
                      background: `linear-gradient(135deg, ${PROJECT_COLORS[p.slug] ?? "var(--v3-accent)"} 0%, color-mix(in oklab, ${PROJECT_COLORS[p.slug] ?? "var(--v3-accent)"} 30%, var(--bg)) 100%)`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontFamily: "var(--display-font)", fontSize: "32px", color: "white", opacity: 0.8,
                    }}
                  >
                    {p.name}
                  </div>
                )}
              </div>
              <div className="p-[16px_20px] flex justify-between items-center bg-[var(--bg)] border-t border-[var(--rule)]">
                <span className="font-[family:var(--display-font)] text-[18px] text-[var(--ink)]">{p.name}</span>
                <span className="font-mono text-[10px] uppercase text-[var(--ink-3)]">{p.tag} · {p.year}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile: project cards (shown only on mobile via CSS) */}
      <div className="hidden max-[920px]:flex flex-col gap-[24px]">
        {FEATURED_PROJECTS.map((p) => (
          <Link
            key={p.slug}
            href={`/work/${p.slug}`}
            className="group flex flex-col border border-[var(--rule)] rounded-[16px] overflow-hidden bg-[var(--paper)] no-underline text-inherit transition-all duration-300 hover:border-[var(--v3-accent-soft)] hover:shadow-[0_16px_40px_-10px_color-mix(in_oklab,var(--ink)_5%,transparent)]"
            aria-label={`View case study: ${p.name}`}
          >
            <div
              className="h-[6px] w-full"
              style={{ background: PROJECT_COLORS[p.slug] ?? "var(--v3-accent)" }}
            />
            <div className="p-[32px] max-[480px]:p-[24px] flex flex-col gap-[12px]">
              <div className="font-mono text-[10px] uppercase text-[var(--ink-3)] tracking-[0.1em]">{p.idx} · {p.year} · {p.tag}</div>
              <div className="font-[family:var(--display-font)] text-[32px] leading-[1.1] text-[var(--ink)] transition-colors duration-300 group-hover:text-[var(--v3-accent)]">{p.name}</div>
              <div className="text-[16px] text-[var(--ink-2)] leading-[1.6]">{p.desc}</div>
              <div className="flex flex-wrap gap-[6px] mt-[12px]">
                {p.stack.slice(0, 4).map((s) => (
                  <span key={s} className="font-mono text-[10px] px-[10px] py-[4px] border border-[var(--rule)] rounded-[4px] text-[var(--ink-3)] uppercase bg-[var(--bg)]">{s}</span>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="flex justify-center mt-[80px] pt-[40px] border-t border-[var(--rule)]">
        <Link href="/work" className="group inline-flex items-center justify-center px-[32px] h-[56px] rounded-full font-mono text-[13px] uppercase tracking-[0.1em] font-medium cursor-pointer border border-transparent transition-all duration-300 no-underline bg-[var(--v3-accent)] text-[var(--bg)] hover:-translate-y-[2px] hover:shadow-[0_16px_40px_-10px_color-mix(in_oklab,var(--v3-accent)_60%,transparent)]">
          See all 6 projects <span className="inline-block transition-transform duration-300 group-hover:translate-x-[4px] ml-[8px]" aria-hidden="true">↗</span>
        </Link>
      </div>
    </section>
  )
}
