import Link from "next/link"
import Image from "next/image"
import { CASE_STUDIES } from "@/lib/case-studies"

const PROJECT_COLORS: Record<string, string> = {
  coinsafe: "#8b5cf6",
  zamir: "#06b6d4",
  createstacksapp: "#ec4899",
  "firstcode-forge": "#f59e0b",
}

export function FilmReelSection(): React.ReactElement {
  return (
    <section
      className="v3-section v3-film-reel-section"
      id="all-work"
      aria-labelledby="reel-heading"
    >
      <div className="v3-film-reel-head">
        <div>
          <div className="v3-eyebrow" style={{ marginBottom: 8 }}>02 — ALL WORK</div>
          <h2
            id="reel-heading"
            style={{
              fontFamily: "var(--display-font)",
              fontVariationSettings: '"opsz" 96',
              fontSize: "clamp(28px, 3.5vw, 42px)",
              fontWeight: 400,
              letterSpacing: "-0.02em",
              color: "var(--ink)",
              margin: 0,
            }}
          >
            Everything I&apos;ve <em style={{ color: "var(--v3-accent)" }}>shipped.</em>
          </h2>
        </div>
        <Link href="/work" className="v3-btn v3-btn-ghost" style={{ flexShrink: 0 }}>
          Full index <span className="arr" aria-hidden="true">→</span>
        </Link>
      </div>

      <div className="v3-film-reel" role="list" aria-label="All case studies">
        <div className="v3-reel-track">
          {CASE_STUDIES.map((p) => (
            <Link
              key={p.slug}
              href={`/work/${p.slug}`}
              className="v3-reel-card"
              role="listitem"
              aria-label={`View ${p.name} case study`}
            >
              <div className="v3-reel-card-img">
                <div
                  className="accent-bar"
                  style={{ background: PROJECT_COLORS[p.slug] ?? "var(--v3-accent)" }}
                />
                {p.image ? (
                  <Image
                    src={p.image}
                    alt={p.name}
                    fill
                    className="object-cover"
                    sizes="340px"
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      background: `linear-gradient(135deg, color-mix(in oklab, ${PROJECT_COLORS[p.slug] ?? "var(--v3-accent)"} 18%, var(--bg-2)) 0%, var(--bg-2) 100%)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-jetbrains-mono), monospace",
                        fontSize: 11,
                        color: "var(--ink-4)",
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                      }}
                    >
                      {p.cat}
                    </span>
                  </div>
                )}
              </div>
              <div className="v3-reel-card-body">
                <div className="name">{p.name}</div>
                <div className="desc">{p.desc}</div>
                <div className="meta">
                  <span>{p.year}</span>
                  <span>{p.cat.toUpperCase()}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
