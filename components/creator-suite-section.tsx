"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { MagneticWrapper } from "./magnetic-wrapper"
import { ArrowRight } from "lucide-react"

const TOOLS = [
  { name: "BookBreaks",    tagline: "Books into content",        accent: "#C85A2C", icon: "📚", status: "live", href: "/tools/bookbreaks"    },
  { name: "Chapterly",    tagline: "Read + remember",            accent: "#4F6D7A", icon: "📖", status: "live", href: "/tools/chapterly"     },
  { name: "Flowise",      tagline: "Money mapped",               accent: "#16A34A", icon: "💸", status: "live", href: "/tools/flowise"       },
  { name: "Vela",         tagline: "Set your course daily",      accent: "#7C3AED", icon: "🧭", status: "live", href: "/tools/journal"       },
  { name: "Thread Studio", tagline: "Viral threads",             accent: "#6366F1", icon: "🐦", status: "live", href: "/tools/thread-studio" },
  { name: "Carousel Lab",  tagline: "Scroll-stopping slides",    accent: "#FF6B35", icon: "📸", status: "live", href: "/tools/carousel-lab"  },
] as const

export function CreatorSuiteSection(): React.ReactElement {
  return (
    <section
      className="py-[120px] max-[720px]:py-[72px] relative max-w-[var(--maxw)] mx-auto px-[var(--gutter)]"
      aria-labelledby="creator-suite-heading"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="grid grid-cols-[120px_1fr] max-[720px]:grid-cols-1 gap-[48px] max-[720px]:gap-[24px] items-baseline mb-[80px] max-[720px]:mb-[48px]"
      >
        <div className="font-mono text-[11px] tracking-[0.18em] text-[var(--ink-2)] pt-[18px]">
          03 — TOOLS
        </div>
        <div>
          <h2
            id="creator-suite-heading"
            className="m-0 font-display font-normal text-[clamp(44px,7vw,88px)] leading-[0.95] tracking-[-0.025em] text-[var(--ink)] text-balance fvs-display"
          >
            A suite I{" "}
            <em className="not-italic italic text-[var(--v3-accent)] fvs-soft">built</em>{" "}
            and ship.
          </h2>
          <p className="mt-[18px] max-w-[56ch] text-[17px] leading-[1.6] text-[var(--ink-2)] m-0 mt-[16px]">
            Six live tools for creators learning in public — read more, build faster, share
            consistently, track every naira, and log every win. All production-grade, all actually useful.
          </p>
        </div>
      </motion.div>

      {/* Tool grid */}
      <div className="grid grid-cols-6 max-[1100px]:grid-cols-3 max-[600px]:grid-cols-2 gap-[1px] border border-[var(--rule)] rounded-[2px] overflow-hidden mb-[64px]">
        {TOOLS.map((tool, i) => (
          <motion.div
            key={tool.name}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: i * 0.06 }}
            className="group relative border-r border-[var(--rule)] last:border-r-0"
          >
          <Link
            href={tool.href}
            className="block p-[28px_20px] max-[720px]:p-[20px_16px] bg-[var(--bg)] hover:bg-[var(--bg-2)] transition-colors duration-200 no-underline"
          >
            <div
              className="w-[40px] h-[40px] rounded-[8px] flex items-center justify-center text-[18px] mb-[16px]"
              style={{ background: tool.accent + "18", border: `1px solid ${tool.accent}25` }}
              aria-hidden="true"
            >
              {tool.icon}
            </div>
            <div
              className="font-display font-normal text-[16px] leading-[1.15] tracking-[-0.01em] fvs-text mb-[4px] text-[var(--ink)]"
            >
              {tool.name}
            </div>
            <div className="font-mono text-[9px] tracking-[0.1em] uppercase" style={{ color: tool.accent }}>
              {tool.tagline}
            </div>
            <span
              className="absolute top-[12px] right-[12px] inline-flex items-center gap-[4px] font-mono text-[8px] tracking-[0.1em] uppercase px-[6px] py-[2px] rounded-full"
              style={{ background: "rgba(22,163,74,0.1)", color: "#2D5016" }}
            >
              <span className="w-[4px] h-[4px] rounded-full bg-[#2D5016]" aria-hidden="true" />
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
        className="flex items-center justify-between gap-[24px] max-[720px]:flex-col max-[720px]:items-start"
      >
        <p className="m-0 text-[15px] text-[var(--ink-3)] max-w-[52ch]">
          Each tool is a real product with auth, database, AI integrations, and production
          error handling — not a demo. Open source on request.
        </p>
        <MagneticWrapper>
          <Link
            href="/tools"
            className="group inline-flex items-center gap-[10px] h-[52px] px-[28px] rounded-full font-mono text-[12px] uppercase tracking-[0.12em] font-semibold no-underline transition-all duration-300 whitespace-nowrap border hover:border-[var(--v3-accent)] hover:text-[var(--v3-accent)] hover:bg-[color-mix(in_oklab,var(--v3-accent)_5%,transparent)] text-[var(--ink)] border-[var(--rule)]"
          >
            Explore Creator Suite
            <ArrowRight
              className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-[4px]"
              aria-hidden="true"
            />
          </Link>
        </MagneticWrapper>
      </motion.div>
    </section>
  )
}
