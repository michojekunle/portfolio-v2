"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { MagneticWrapper } from "./magnetic-wrapper"
import { TextReveal } from "./text-reveal"
import { ArrowRight, ArrowUpRight } from "lucide-react"

const STACK = [
  { label: "Flutter", primary: true },
  { label: "Rust", primary: true },
  { label: "TypeScript", primary: true },
  { label: "Next.js", primary: false },
  { label: "Dart", primary: false },
  { label: "Solidity", primary: false },
]

export function HeroSection(): React.ReactElement {
  return (
    <section className="pt-5 pb-20 max-[720px]:pt-16 max-[720px]:pb-12 max-[480px]:pt-10 max-[480px]:pb-8 relative overflow-hidden max-w-(--maxw) mx-auto px-(--gutter)" aria-label="Introduction">
      <div className="absolute inset-0 bg-[repeating-linear-gradient(-55deg,transparent,transparent_2px,color-mix(in_oklab,var(--v3-accent)_5%,transparent)_2px,color-mix(in_oklab,var(--v3-accent)_5%,transparent)_5px)] opacity-50 z-0 pointer-events-none" aria-hidden="true" />

      {/* Status dashboard meta row */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="relative z-1 grid grid-cols-[1fr_auto_1fr] max-[720px]:grid-cols-1 items-end max-[720px]:items-start gap-8 max-[720px]:gap-6 pb-8 mb-16 border-b border-(--rule) font-mono text-[11px] tracking-[0.18em] uppercase text-muted-foreground max-[480px]:text-[10px]" role="presentation"
      >
        <div className="leading-[1.7] text-[12px] text-muted-foreground max-[720px]:text-left max-[480px]:text-[10px]">
          <b className="text-(--ink) font-medium">Michael Ojekunle</b><br />
          Software Engineer &amp; Builder · Lagos, NG
        </div>
        <div className="leading-[1.7] text-[12px] text-center max-[720px]:text-left text-(--v3-accent) max-[480px]:text-[10px]">
          <span className="inline-block w-1.75 h-1.75 rounded-full bg-(--v3-accent) mr-2 align-middle animate-[v3-pulse_2.4s_infinite_ease-in-out]" aria-hidden="true" />
          Available for select work
        </div>
        <div className="leading-[1.7] text-[12px] text-right max-[720px]:text-left text-muted-foreground max-[480px]:text-[10px]">
          <b className="text-(--ink) font-medium">2026 · v3</b><br />
          EST. 2021 · 4+ years
        </div>
      </motion.div>

      <h1 className="relative z-1 font-normal text-[clamp(72px,18vw,200px)] leading-[0.85] tracking-tighter text-(--ink) mb-20 max-[720px]:mb-8 text-balance">
        <TextReveal delay={0.2} stagger={0.05} className="block">Engineer.</TextReveal>
        <TextReveal delay={0.3} stagger={0.05} className="block italic fvs-soft">Writer.</TextReveal>
        <TextReveal delay={0.4} stagger={0.05} className="block text-transparent [-webkit-text-stroke:2px_var(--ink)]">Builder.</TextReveal>
      </h1>

      <div className="relative z-1 grid grid-cols-[1.2fr_1fr] max-[920px]:grid-cols-1 gap-20 max-[920px]:gap-10 mt-20 pt-10 border-t border-(--rule) items-start">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.5 }}>
          <p className="font-normal text-[clamp(28px,3.4vw,40px)] leading-tight text-(--ink) m-0 max-w-[24ch] text-pretty">
            I build software end to end. Four years full-stack — now going deep on{" "}
            <em>Rust systems</em> and <em>Flutter mobile</em>, building products of my own.
          </p>

          {/* Tech stack pills */}
          <div className="flex flex-wrap gap-1.75 mt-6" role="list" aria-label="Primary technologies">
            {STACK.map((s) => (
              <span key={s.label} role="listitem" className={`font-mono text-[10px] tracking-widest px-3 py-1.25 rounded-[5px] border uppercase transition-colors duration-150 hover:border-(--v3-accent-soft) hover:text-(--v3-accent) ${s.primary ? "border-(--v3-accent-soft) text-(--v3-accent) bg-[color-mix(in_oklab,var(--v3-accent-soft)_35%,var(--paper))]" : "border-(--rule) bg-(--paper) text-muted-foreground"}`}>
                {s.label}
              </span>
            ))}
          </div>

          {/* Now → Next trajectory */}
          <div className="flex items-center gap-3.5 mt-7 flex-wrap font-mono text-[10px] tracking-[0.14em] uppercase" aria-label="Current focus and where I'm heading">
            <div className="flex items-center gap-2">
              <span className="text-(--v3-accent) font-medium">Now</span>
              <span className="text-muted-foreground">Flutter · Rust systems</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" aria-hidden="true" />
            <div className="flex items-center gap-2">
              <span className="text-(--ink) font-medium">Next</span>
              <span className="text-muted-foreground">zkML</span>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.6 }}>
          <p className="text-[17px] leading-[1.7] text-secondary-foreground m-0">
            Four years building full-stack products — two of them deep in web3, shipping on{" "}
            <b className="text-(--ink) font-medium">Rootstock</b>, <b className="text-(--ink) font-medium">Starknet</b>, and <b className="text-(--ink) font-medium">Stacks</b>.
            Now I&apos;m going deeper into systems with <b className="text-(--ink) font-medium">Rust</b> and mobile with{" "}
            <b className="text-(--ink) font-medium">Flutter</b>, and building products of my own — heading toward zkML.
          </p>

          <div className="flex gap-4 flex-wrap mt-8 max-[720px]:mb-10">
            <MagneticWrapper strength={30}>
              <Link href="/contact" className="group inline-flex items-center justify-center px-7 h-13 rounded-full font-mono text-[12px] uppercase tracking-widest font-medium cursor-pointer border border-transparent transition-all duration-300 no-underline bg-(--v3-accent) text-(--bg) hover:-translate-y-0.5 hover:shadow-[0_12px_32px_-8px_color-mix(in_oklab,var(--v3-accent)_60%,transparent)]">
                Book a call <ArrowUpRight className="inline-block transition-transform duration-300 group-hover:translate-x-1 ml-2 w-4 h-4" aria-hidden="true" />
              </Link>
            </MagneticWrapper>
            <MagneticWrapper strength={20}>
              <Link href="/work" className="group inline-flex items-center justify-center px-7 h-13 rounded-full font-mono text-[12px] uppercase tracking-widest font-medium cursor-pointer border border-(--rule) bg-transparent text-(--ink) transition-all duration-300 no-underline hover:border-(--v3-accent) hover:text-(--v3-accent) hover:bg-[color-mix(in_oklab,var(--v3-accent)_5%,transparent)]">
                Portfolio <ArrowRight className="inline-block transition-transform duration-300 group-hover:translate-x-1 ml-2 w-4 h-4" aria-hidden="true" />
              </Link>
            </MagneticWrapper>
          </div>

          <div className="flex gap-0 mt-12 border border-(--rule) rounded-lg overflow-hidden" role="list" aria-label="Career highlights">
            <div className="flex-[1] flex flex-col p-[20px_24px] border-r border-(--rule) bg-(--paper) last:border-r-0 max-[720px]:pr-3.5 max-[720px]:mr-3.5" role="listitem">
              <span className="font-display text-[40px] font-normal leading-none tracking-[-0.03em] text-(--v3-accent) fvs-display">4+</span>
              <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted-foreground mt-1.5">Years building</span>
            </div>
            <div className="flex-[1] flex flex-col p-[20px_24px] border-r border-(--rule) bg-(--paper) last:border-r-0 max-[720px]:pr-3.5 max-[720px]:mr-3.5" role="listitem">
              <span className="font-display text-[40px] font-normal leading-none tracking-[-0.03em] text-(--v3-accent) fvs-display">3</span>
              <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted-foreground mt-1.5">Chains shipped</span>
            </div>
            <div className="flex-[1] flex flex-col p-[20px_24px] border-r border-(--rule) bg-(--paper) last:border-r-0 max-[720px]:pr-3.5 max-[720px]:mr-3.5" role="listitem">
              <span className="font-display text-[40px] font-normal leading-none tracking-[-0.03em] text-(--v3-accent) fvs-display">12+</span>
              <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted-foreground mt-1.5">Projects live</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
