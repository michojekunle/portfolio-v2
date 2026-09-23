"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { MagneticWrapper } from "./magnetic-wrapper"
import { ArrowRight, BookOpen, BookMarked, Wallet, Compass, Share2, LayoutGrid } from "lucide-react"

const TOOLS = [
  { name: "BookBreaks",    tagline: "Books into content",        accent: "#C85A2C", icon: BookOpen,   status: "live", href: "/tools/bookbreaks"    },
  { name: "Chapterly",    tagline: "Read + remember",            accent: "#4F6D7A", icon: BookMarked, status: "live", href: "/tools/chapterly"     },
  { name: "Flowise",      tagline: "Money mapped",               accent: "#16A34A", icon: Wallet,     status: "live", href: "/tools/flowise"       },
  { name: "Vela",         tagline: "Set your course daily",      accent: "#B45309", icon: Compass,    status: "live", href: "/tools/journal"       },
  { name: "Thread Studio", tagline: "Viral threads",             accent: "#2563EB", icon: Share2,     status: "live", href: "/tools/thread-studio" },
  { name: "Carousel Lab",  tagline: "Scroll-stopping slides",    accent: "#FF6B35", icon: LayoutGrid, status: "live", href: "/tools/carousel-lab"  },
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
            className="m-0 font-display font-normal text-[clamp(44px,7vw,88px)] leading-[0.95] tracking-tight text-(--ink) text-balance fvs-display"
          >
            A suite I{" "}
            <em className="not-italic italic text-(--v3-accent) fvs-soft">built</em>{" "}
            and ship.
          </h2>
          <p className="mt-4 max-w-[56ch] text-[17px] leading-[1.6] text-secondary-foreground m-0">
            Six live tools for creators learning in public to read more, build faster, share
            consistently, track every naira, and log every win. All production-grade, all actually useful.
          </p>
        </div>
      </motion.div>

      {/* Tool grid */}
      <div className="grid grid-cols-6 max-[1100px]:grid-cols-3 max-[600px]:grid-cols-2 border-y border-(--rule) mb-16">
        {TOOLS.map((tool, i) => (
          <motion.div
            key={tool.name}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: i * 0.06 }}
            className="group relative border-r border-(--rule) last:border-r-0"
          >
          <Link
            href={tool.href}
            className="block p-[28px_20px] max-[720px]:p-[20px_16px] bg-(--bg) hover:bg-(--bg-2) transition-colors duration-200 no-underline"
          >
            <div className="w-6 h-6 mb-4 flex items-center justify-center" aria-hidden="true">
              <tool.icon className="w-5 h-5" style={{ color: tool.accent }} />
            </div>
            <div
              className="font-display font-normal text-[16px] leading-[1.15] tracking-[-0.01em] fvs-text mb-1 text-(--ink)"
            >
              {tool.name}
            </div>
            <div className="font-mono text-[12px] tracking-wider uppercase py-1.5 text-muted-foreground">
              {tool.tagline}
            </div>
            <span
              className="absolute top-4 right-4 inline-flex items-center gap-1.5 font-mono text-[12px] tracking-wider uppercase text-muted-foreground font-medium"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-500" aria-hidden="true" />
              Live
            </span>
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
          Each tool is a real product with auth, database, AI integrations, and production
          error handling; not a demo. Open source on request.
        </p>
        <MagneticWrapper>
          <Link
            href="/tools"
            className="group inline-flex items-center gap-2.5 py-3.5 px-7 rounded-full font-mono text-[12px] uppercase tracking-[0.12em] font-semibold no-underline transition-all duration-300 whitespace-nowrap border hover:border-(--v3-accent) hover:text-(--v3-accent) hover:bg-[color-mix(in_oklab,var(--v3-accent)_5%,transparent)] text-(--ink) border-(--rule)"
          >
            Explore Creator Suite
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
