"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { MagneticWrapper } from "./magnetic-wrapper"
import { ArrowRight, BookOpen, BookMarked, Wallet, Compass, Share2, LayoutGrid } from "lucide-react"

const TOOLS = [
  { name: "Carousel Lab",  tagline: "Social slides daily driver", accent: "#FF6B35", icon: LayoutGrid, status: "daily driver", href: "/tools/carousel-lab"  },
  { name: "Chapterly",    tagline: "EPUB reader prototype",      accent: "#4F6D7A", icon: BookMarked, status: "in lab",       href: "/tools/chapterly"     },
  { name: "Flowise",      tagline: "Finance flow experiment",    accent: "#16A34A", icon: Wallet,     status: "in lab",       href: "/tools/flowise"       },
  { name: "Vela",         tagline: "Daily log & check-in",       accent: "#B45309", icon: Compass,    status: "prototype",    href: "/tools/journal"       },
  { name: "BookBreaks",    tagline: "Book takeaways pipeline",   accent: "#C85A2C", icon: BookOpen,   status: "experiment",   href: "/tools/bookbreaks"    },
  { name: "Thread Studio", tagline: "Writing scratchpad",        accent: "#2563EB", icon: Share2,     status: "sandbox",      href: "/tools/thread-studio" },
] as const

export function CreatorSuiteSection(): React.ReactElement {
  return (
    <section
      className="py-30 max-[720px]:py-18 relative max-w-(--maxw) mx-auto px-(--gutter)"
      aria-labelledby="creator-suite-heading"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="mb-20 max-[720px]:mb-12"
      >
        <div>
          <h2
            id="creator-suite-heading"
            className="m-0 font-display font-normal text-4xl sm:text-5xl lg:text-6xl leading-[1] sm:leading-[0.95] tracking-tight text-(--ink) text-balance fvs-display"
          >
            Personal workbench,{" "}
            <em className="not-italic italic text-(--v3-accent) fvs-soft">shipped.</em>
          </h2>
          <p className="mt-4 max-w-[56ch] text-base leading-[1.6] text-secondary-foreground m-0">
            Software utilities and prototypes I built to scratch my own everyday itches — anchored by Carousel Lab,
            which I use for my own Instagram slides, alongside reading and finance experiments being fleshed out in the open.
          </p>
        </div>
      </motion.div>

      {/* Tool grid */}
      <div className="grid grid-cols-3 max-[920px]:grid-cols-2 max-[540px]:grid-cols-1 gap-4 mb-16">
        {TOOLS.map((tool, i) => (
          <motion.div
            key={tool.name}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: i * 0.06 }}
          >
            <Link
              href={tool.href}
              className="group relative rounded-2xl border border-(--rule) bg-(--paper) hover:border-muted-foreground/60 hover:bg-(--bg-2)/60 transition-all duration-200 p-6 max-[480px]:p-5 no-underline flex flex-col justify-between h-full"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-(--bg) border border-(--rule)" aria-hidden="true">
                    <tool.icon className="w-4.5 h-4.5" style={{ color: tool.accent }} />
                  </div>
                  <span className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground font-medium">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${tool.status === "daily driver" ? "bg-emerald-500" : "bg-amber-500"}`}
                      aria-hidden="true"
                    />
                    {tool.status}
                  </span>
                </div>
                <div className="font-display font-medium text-[19px] leading-[1.2] text-(--ink) mb-1.5 group-hover:text-(--v3-accent) transition-colors">
                  {tool.name}
                </div>
                <div className="text-[14px] leading-relaxed text-secondary-foreground font-sans">
                  {tool.tagline}
                </div>
              </div>
              <div className="mt-5 pt-3 border-t border-(--rule)/70 flex items-center justify-between font-mono text-xs text-muted-foreground">
                <span>Open tool</span>
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* CTA bar */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex items-center justify-between gap-6 max-[720px]:flex-col max-[720px]:items-start"
      >
        <p className="m-0 text-[15px] text-muted-foreground max-w-[52ch]">
          Personal utilities running free with no paywalls or gated features.
        </p>
        <MagneticWrapper>
          <Link
            href="/tools"
            className="group inline-flex items-center gap-2.5 py-3.5 px-7 rounded-full font-mono text-[12px] tracking-[0.04em] font-semibold no-underline transition-all duration-300 whitespace-nowrap border hover:border-(--v3-accent) hover:text-(--v3-accent) hover:bg-[color-mix(in_oklab,var(--v3-accent)_5%,transparent)] text-(--ink) border-(--rule)"
          >
            Explore all workbench tools
            <ArrowRight
              className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
              aria-hidden="true"
            />
          </Link>
        </MagneticWrapper>
      </motion.div>
    </section>
  )
}
