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
      className="v3-section v3-container"
      id="projects"
      aria-labelledby="projects-heading"
    >
      <div className="v3-section-head">
        <div className="num">01 — WORK</div>
        <div>
          <h2 id="projects-heading">Selected <em>work.</em></h2>
          <div className="sub">
            Three I&apos;d most want to talk about. Full case studies inside — process,
            wrong turns, what shipped.
          </div>
        </div>
      </div>

      {/* Desktop: split-panel (hidden on mobile via CSS) */}
      <div className="v3-projects-split">

        {/* Left: numbered text list */}
        <nav className="v3-project-list" aria-label="Featured projects">
          {FEATURED_PROJECTS.map((p, i) => (
            <Link
              key={p.slug}
              href={`/work/${p.slug}`}
              className={`v3-project-row${hoveredIdx === i ? " hovered" : " dimmed"}`}
              onMouseEnter={() => setHoveredIdx(i)}
              aria-label={`View case study: ${p.name}`}
            >
              <span className="idx">{p.idx}</span>
              <div className="content">
                <span className="name">{p.name}</span>
                <span className="stack-preview">{p.stack.slice(0, 3).join(" · ")}</span>
              </div>
              <span className="tag">{p.tag} · {p.year}</span>
              <span className="role">{p.role.split(" · ")[0]}</span>
              <span className="arr" aria-hidden="true">→</span>
            </Link>
          ))}
        </nav>

        {/* Right: sticky cross-fading image panel */}
        <div className="v3-projects-panel" aria-hidden="true">
          {FEATURED_PROJECTS.map((p, i) => (
            <div key={p.slug} className={`v3-panel-slide${hoveredIdx === i ? " active" : ""}`}>
              <div className="v3-panel-img">
                {p.image ? (
                  <Image
                    src={p.image}
                    alt={p.name}
                    fill
                    className="object-cover"
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
              <div className="v3-panel-caption">
                <span className="name">{p.name}</span>
                <span className="meta">{p.tag} · {p.year}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile: project cards (shown only on mobile via CSS) */}
      <div className="v3-project-cards-mobile">
        {FEATURED_PROJECTS.map((p) => (
          <Link
            key={p.slug}
            href={`/work/${p.slug}`}
            className="v3-project-card-mobile"
            aria-label={`View case study: ${p.name}`}
          >
            <div
              className="v3-project-card-accent"
              style={{ background: PROJECT_COLORS[p.slug] ?? "var(--v3-accent)" }}
            />
            <div className="v3-project-card-body">
              <div className="meta">{p.idx} · {p.year} · {p.tag}</div>
              <div className="name">{p.name}</div>
              <div className="desc">{p.desc}</div>
              <div className="stack">
                {p.stack.slice(0, 4).map((s) => (
                  <span key={s}>{s}</span>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div style={{ textAlign: "center", marginTop: "64px" }}>
        <Link href="/work" className="v3-btn v3-btn-ghost">
          See all 6 projects <span className="arr" aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  )
}
