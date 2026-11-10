"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { MagneticWrapper } from "./magnetic-wrapper"
import { TextReveal } from "./text-reveal"
import { ArrowRight, ArrowUpRight } from "lucide-react"

const STACK = [
  { label: "Rust", primary: true },
  { label: "TypeScript", primary: true },
  { label: "Next.js", primary: false },
  { label: "Flutter", primary: false },
  { label: "Web3", primary: false },
]

export function HeroSection(): React.ReactElement {
  return (
    <section className="pt-24 sm:pt-28 lg:pt-36 pb-20 max-[720px]:pb-12 relative overflow-hidden max-w-(--maxw) mx-auto px-(--gutter)" aria-label="Introduction">
      <h1 className="relative z-1 font-normal text-6xl sm:text-7xl lg:text-8xl xl:text-9xl leading-[0.88] tracking-tighter text-(--ink) mb-16 max-[720px]:mb-8">
        <span className="block">
          <TextReveal delay={0.2} stagger={0.05}>Engineer.</TextReveal>
        </span>
        <span className="block">
          <TextReveal delay={0.3} stagger={0.05} className="italic fvs-soft">Writer.</TextReveal>
          <TextReveal delay={0.4} stagger={0.05} className="text-transparent [-webkit-text-stroke:2px_var(--ink)]">Builder.</TextReveal>
        </span>
      </h1>

      <div className="relative z-1 grid grid-cols-[1.2fr_1fr] max-[920px]:grid-cols-1 gap-20 max-[920px]:gap-10 mt-16 max-[720px]:mt-8 pt-10 max-[720px]:pt-6 border-t border-(--rule) items-start">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.5 }}>
          <p className="font-normal text-2xl sm:text-3xl lg:text-4xl leading-[1.38] text-(--ink) m-0 max-w-[24ch] text-pretty">
            I build software end to end, going deep on{" "}
            <em>Rust systems</em> and AI infrastructure.
          </p>

          {/* Tech stack pills */}
          <div className="flex flex-wrap gap-2 mt-6" role="list" aria-label="Primary technologies">
            {STACK.map((s) => (
              <span key={s.label} role="listitem" className={`font-mono text-xs px-3 py-1.5 rounded-[4px] border transition-colors duration-150 hover:border-(--v3-accent-soft) hover:text-(--v3-accent) ${s.primary ? "border-(--v3-accent-soft) text-(--v3-accent) bg-[color-mix(in_oklab,var(--v3-accent-soft)_35%,var(--paper))]" : "border-(--rule) bg-(--paper) text-muted-foreground"}`}>
                {s.label}
              </span>
            ))}
          </div>

          {/* Now → Next trajectory */}
          <div className="flex items-center gap-3.5 mt-7 flex-wrap font-mono text-xs tracking-wider" aria-label="Current focus and where I'm heading">
            <div className="flex items-center gap-2">
              <span className="text-(--v3-accent) font-medium">Now</span>
              <span className="text-muted-foreground">Zamir · Rust</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" aria-hidden="true" />
            <div className="flex items-center gap-2">
              <span className="text-(--ink) font-medium">Next</span>
              <span className="text-muted-foreground">Distributed systems</span>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.6 }}>
          <p className="text-base leading-[1.7] text-secondary-foreground m-0">
            Four years building products across web, mobile and web3: founding-team engineer on{" "}
            <b className="text-(--ink) font-medium">CoinSafe</b>, now building{" "}
            <b className="text-(--ink) font-medium">Zamir</b>, a worship-music app live since March 2026.
          </p>

          <div className="flex gap-4 flex-wrap mt-8 max-[720px]:mb-10">
            <MagneticWrapper strength={30}>
              <Link href="/contact" className="group inline-flex items-center justify-center px-7 py-3.5 h-12 rounded-full font-mono text-xs tracking-wider font-medium cursor-pointer border border-(--rule) transition-all duration-200 no-underline bg-(--ink) text-(--bg) hover:opacity-90">
                Book a call <ArrowUpRight className="inline-block transition-transform duration-300 group-hover:translate-x-1 ml-2 w-4 h-4" aria-hidden="true" />
              </Link>
            </MagneticWrapper>
            <MagneticWrapper strength={20}>
              <Link href="/work" className="group inline-flex items-center justify-center px-7 py-3.5 h-12 rounded-full font-mono text-xs tracking-wider font-medium cursor-pointer border border-(--rule) bg-transparent text-(--ink) transition-all duration-200 no-underline hover:border-(--v3-accent) hover:text-(--v3-accent)">
                Portfolio <ArrowRight className="inline-block transition-transform duration-300 group-hover:translate-x-1 ml-2 w-4 h-4" aria-hidden="true" />
              </Link>
            </MagneticWrapper>
          </div>

          <div className="mt-12 flex items-baseline gap-2.5 flex-wrap text-sm leading-normal text-secondary-foreground">
            <span className="font-medium text-(--ink)">Latest:</span>
            <span>Zamir: 4.7k plays, 40.7% repeat listening rate across 10 languages.</span>
            <Link
              href="/work/zamir"
              className="group inline-flex items-center gap-1 text-(--v3-accent) underline decoration-(--rule) underline-offset-4 hover:decoration-(--v3-accent) no-underline font-medium"
            >
              Case study <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
            <span className="text-muted-foreground/40">·</span>
            <a
              href="https://zamir.app"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-muted-foreground hover:text-(--ink) transition-colors no-underline font-mono text-xs"
            >
              zamir.app ↗
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
