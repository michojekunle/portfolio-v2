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
      className="py-[120px] max-[720px]:py-[72px] relative overflow-hidden"
      id="all-work"
      aria-labelledby="reel-heading"
    >
      <div className="max-w-[var(--maxw)] mx-auto px-[var(--gutter)] grid grid-cols-[120px_1fr] max-[720px]:grid-cols-1 gap-[48px] max-[720px]:gap-[24px] items-baseline mb-[80px] max-[720px]:mb-[48px]">
        <div className="font-mono text-[11px] tracking-[0.18em] text-[var(--ink-2)] pt-[18px]">03 — ARCHIVE</div>
        <div className="flex justify-between items-end max-[720px]:flex-col max-[720px]:items-start gap-[24px]">
          <h2 id="reel-heading" className="m-0 font-display font-normal text-[clamp(44px,7vw,88px)] leading-[0.95] tracking-[-0.025em] text-[var(--ink)] text-balance fvs-display">
            Everything I&apos;ve <em className="not-italic italic text-[var(--v3-accent)] fvs-soft">shipped.</em>
          </h2>
          <MagneticWrapper strength={20}>
            <Link href="/work" className="group inline-flex items-center gap-[12px] px-[28px] py-[14px] rounded-full font-mono text-[11px] uppercase tracking-[0.12em] font-medium cursor-pointer border border-[var(--rule)] bg-transparent text-[var(--ink)] transition-all duration-300 no-underline hover:border-[var(--v3-accent)] hover:text-[var(--v3-accent)] hover:bg-[color-mix(in_oklab,var(--v3-accent)_5%,transparent)] shrink-0 mb-[12px]">
              View full index <ArrowRight className="inline-block transition-transform duration-300 group-hover:translate-x-[4px] w-3 h-3" aria-hidden="true" />
            </Link>
          </MagneticWrapper>
        </div>
      </div>

      <div className="w-full overflow-x-auto snap-x snap-mandatory [scroll-padding:var(--gutter)] [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="list" aria-label="All case studies">
        <div className="flex gap-[24px] px-[var(--gutter)] w-max pb-[32px]">
          {CASE_STUDIES.map((p) => (
            <Link
              key={p.slug}
              href={`/work/${p.slug}`}
              className="snap-start w-[340px] flex flex-col no-underline text-inherit group"
              role="listitem"
              aria-label={`View ${p.name} case study`}
            >
              <div className="aspect-[16/10] rounded-[12px] overflow-hidden bg-[var(--bg-2)] relative border border-[var(--rule)] transition-colors duration-200 group-hover:border-[var(--ink-3)]">
                <div
                  className="absolute top-0 left-0 right-0 h-[4px] z-[1]"
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
              <div className="py-[20px] flex flex-col gap-[8px]">
                <div className="font-display font-normal text-[22px] text-[var(--ink)] leading-[1.1] fvs-text">{p.name}</div>
                <div className="text-[14px] text-[var(--ink-2)] leading-[1.5] line-clamp-2 overflow-hidden">{p.desc}</div>
                <div className="flex gap-[12px] mt-[4px] font-mono text-[10px] text-[var(--ink-3)] uppercase tracking-[0.1em]">
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
