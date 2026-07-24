import Link from "next/link"
import Image from "next/image"
import { CASE_STUDIES } from "@/lib/case-studies"
import { MagneticWrapper } from "./magnetic-wrapper"
import { ArrowRight } from "lucide-react"

const PROJECT_COLORS: Record<string, string> = {
  coinsafe: "#8b5cf6",
  zamir: "#06b6d4",
  createstacksapp: "#ec4899",
  "firstcode-forge": "#f59e0b",
}

export function FilmReelSection(): React.ReactElement {
  return (
    <section
      className="py-30 max-[720px]:py-18 relative overflow-hidden"
      id="all-work"
      aria-labelledby="reel-heading"
    >
      <div className="max-w-(--maxw) mx-auto px-(--gutter) grid grid-cols-[120px_1fr] max-[720px]:grid-cols-1 gap-12 max-[720px]:gap-6 items-baseline mb-20 max-[720px]:mb-12">
        <div className="font-mono text-[11px] tracking-[0.18em] text-secondary-foreground pt-4.5">03 — ARCHIVE</div>
        <div className="flex justify-between items-end max-[720px]:flex-col max-[720px]:items-start gap-6">
          <h2 id="reel-heading" className="m-0 font-display font-normal text-[clamp(44px,7vw,88px)] leading-[0.95] tracking-tight text-(--ink) text-balance fvs-display">
            Everything I&apos;ve <em className="not-italic italic text-(--v3-accent) fvs-soft">shipped.</em>
          </h2>
          <MagneticWrapper strength={20}>
            <Link href="/work" className="group inline-flex items-center gap-3 px-7 py-3.5 rounded-full font-mono text-[11px] uppercase tracking-[0.12em] font-medium cursor-pointer border border-(--rule) bg-transparent text-(--ink) transition-all duration-300 no-underline hover:border-(--v3-accent) hover:text-(--v3-accent) hover:bg-[color-mix(in_oklab,var(--v3-accent)_5%,transparent)] shrink-0 mb-3">
              View full index <ArrowRight className="inline-block transition-transform duration-300 group-hover:translate-x-1 w-3 h-3" aria-hidden="true" />
            </Link>
          </MagneticWrapper>
        </div>
      </div>

      <div className="w-full overflow-x-auto snap-x snap-mandatory [scroll-padding:var(--gutter)] [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="list" aria-label="All case studies" data-lenis-prevent="true">
        <div className="flex gap-6 px-(--gutter) w-max pb-8">
          {CASE_STUDIES.map((p) => (
            <Link
              key={p.slug}
              href={`/work/${p.slug}`}
              className="snap-start w-85 flex flex-col no-underline text-inherit group"
              role="listitem"
              aria-label={`View ${p.name} case study`}
            >
              <div className="aspect-[16/10] rounded-xl overflow-hidden bg-(--bg-2) relative border border-(--rule) transition-colors duration-200 group-hover:border-muted-foreground">
                <div
                  className="absolute top-0 left-0 right-0 h-1 z-[1]"
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
                      className="font-mono"
                      style={{
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
              <div className="py-5 flex flex-col gap-2">
                <div className="font-display font-normal text-[22px] text-(--ink) leading-[1.1] fvs-text">{p.name}</div>
                <div className="text-[14px] text-secondary-foreground leading-normal line-clamp-2 overflow-hidden">{p.desc}</div>
                <div className="flex gap-3 mt-1 font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
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
