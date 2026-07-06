"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { TiltCard } from "./tilt-card"
import { MagneticWrapper } from "./magnetic-wrapper"

import { AboutHeroWidget } from "./about-hero-widget"

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
}

export function AboutClientContent() {
  const titleWords = "Curiosity is the constant.".split(" ")

  return (
    <div className="overflow-x-hidden">
      {/* Hero */}
      <section className="grid grid-cols-1 min-[900px]:grid-cols-[1.4fr_1fr] gap-[48px] items-center pt-[160px] pb-[80px] max-[720px]:pt-[80px] max-[720px]:pb-[56px] max-w-[var(--maxw)] mx-auto px-[var(--gutter)] border-b border-[var(--rule)]">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="font-mono text-[11px] tracking-[0.18em] text-[var(--ink-3)] mb-[24px]"
          >
            02 — ABOUT · BACKGROUND
          </motion.div>

          <h1 className="m-0 font-display font-light text-[clamp(36px,7vw,90px)] leading-[0.95] tracking-[-0.03em] text-[var(--ink)] mb-[32px] text-balance fvs-display flex flex-wrap gap-x-[16px] gap-y-[12px] max-[720px]:gap-x-[10px] max-[720px]:gap-y-[8px]">
            {titleWords.map((word, i) => (
              <motion.span
                key={i}
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: "0%", opacity: 1 }}
                transition={{
                  duration: 0.8,
                  ease: [0.16, 1, 0.3, 1],
                  delay: i * 0.1
                }}
                className={i === 0 || i === titleWords.length - 1 ? "italic text-[var(--v3-accent)] fvs-soft" : ""}
              >
                {word}
              </motion.span>
            ))}
          </h1>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="flex justify-start min-[900px]:justify-end w-full"
        >
          <AboutHeroWidget />
        </motion.div>
      </section>

      {/* Origin + current stack — a balanced two-column pairing, not a
          length-mismatched sidebar */}
      <section className="max-w-[var(--maxw)] mx-auto px-[var(--gutter)] py-[96px] max-[720px]:py-[64px] border-b border-[var(--rule)]">
        <motion.div
          {...fadeUp}
          className="font-mono text-[11px] tracking-[0.18em] text-[var(--ink-3)] mb-[40px] max-[720px]:mb-[28px]"
        >
          ORIGIN
        </motion.div>
        <div className="grid grid-cols-1 min-[900px]:grid-cols-[1.15fr_1fr] gap-[64px] max-[900px]:gap-[40px] items-start">
          <div className="flex flex-col gap-[28px]">
            <motion.p
              {...fadeUp}
              className="font-sans text-[24px] max-[720px]:text-[20px] leading-[1.5] text-[var(--ink)] font-normal"
            >
              I came to software through a long detour. My background is in the sciences —
              the kind of education that teaches you to follow evidence, question assumptions,
              and be honest when an experiment fails. It turns out programming rewards exactly
              the same habits.{" "}
              <em
                className="italic text-[var(--v3-accent)] font-medium"
                style={{ fontVariationSettings: '"opsz" 144, "SOFT" 100' }}
              >
                Read the spec before you pour the concrete.
              </em>
            </motion.p>

            <motion.p
              {...fadeUp}
              transition={{ duration: 0.8 }}
              className="text-[18px] leading-[1.7] text-[var(--ink-2)]"
            >
              My first serious programming was Java. Then React. Then — around the time L2s started
              actually shipping — Solidity. I&apos;ve spent the last four years engineering
              frontends for web3 teams shipping on Rootstock, Starknet, and Stacks. Some of it
              I&apos;m proud of. Some of it taught me what I&apos;d never do again.
            </motion.p>
          </div>

          <TiltCard intensity={10}>
            <div className="bg-[var(--paper)] border border-[var(--rule)] rounded-[16px] p-[32px] transition-all duration-300 hover:border-[var(--v3-accent)] hover:shadow-[0_12px_30px_-10px_rgba(0,0,0,0.1)] h-full flex flex-col gap-[24px]">
              <div className="flex items-center justify-between">
                <h4 className="font-mono text-[11px] tracking-[0.18em] uppercase text-[var(--ink-3)] font-medium">Stack — current</h4>
                <span className="w-[6px] h-[6px] rounded-full shrink-0" style={{ background: "var(--v3-accent)" }} aria-hidden="true" />
              </div>

              <div className="flex flex-col gap-[18px]">
                <div className="flex flex-col gap-[4px] border-b border-[var(--rule)] pb-[18px]">
                  <span className="text-[17px] text-[var(--ink)] font-medium">Frontend</span>
                  <span className="text-[14px] text-[var(--ink-3)] font-mono">Next.js 16 · TypeScript · Tailwind</span>
                </div>
                <div className="flex flex-col gap-[4px] border-b border-[var(--rule)] pb-[18px]">
                  <span className="text-[17px] text-[var(--ink)] font-medium">Contracts</span>
                  <span className="text-[14px] text-[var(--ink-3)] font-mono">Solidity · Cairo · Clarity · Foundry</span>
                </div>
                <div className="flex flex-col gap-[4px] border-b border-[var(--rule)] pb-[18px]">
                  <span className="text-[17px] text-[var(--ink)] font-medium">Chains</span>
                  <span className="text-[14px] text-[var(--ink-3)] font-mono">Starknet · Rootstock · Stacks · ETH L1</span>
                </div>
                <div className="flex flex-col gap-[4px] border-b border-[var(--rule)] pb-[18px]">
                  <span className="text-[17px] text-[var(--ink)] font-medium">Systems</span>
                  <span className="text-[14px] text-[var(--ink-3)] font-mono">Rust · Linux internals · Halo2</span>
                </div>
                <div className="flex flex-col gap-[4px]">
                  <span className="text-[17px] text-[var(--ink)] font-medium">Infra</span>
                  <span className="text-[14px] text-[var(--ink-3)] font-mono">Supabase · Vercel · Hetzner · Resend</span>
                </div>
              </div>
            </div>
          </TiltCard>
        </div>
      </section>

      {/* The narrative — single measured column, no competing sidebar.
          Tinted background breaks the visual rhythm from the sections
          above and below it. */}
      <section className="bg-[var(--bg-2)] border-b border-[var(--rule)]">
        <div className="max-w-[var(--maxw)] mx-auto px-[var(--gutter)] py-[96px] max-[720px]:py-[64px]">
          <motion.div
            {...fadeUp}
            className="font-mono text-[11px] tracking-[0.18em] text-[var(--ink-3)] mb-[40px] max-[720px]:mb-[28px] max-w-[68ch] mx-auto"
          >
            NOW
          </motion.div>
          <div className="max-w-[68ch] mx-auto flex flex-col gap-[32px]">
            <motion.p
              {...fadeUp}
              transition={{ duration: 0.8 }}
              className="text-[19px] leading-[1.7] text-[var(--ink-2)]"
            >
              Right now I&apos;m splitting time between two adjacent obsessions:{" "}
              <b className="text-[var(--ink)] font-medium">zero-knowledge machine learning</b> and <b className="text-[var(--ink)] font-medium">Rust systems programming</b>. They
              feel related to me, even though most people would put them on opposite ends of a
              stack diagram. ZK is teaching me to think in constraints. Rust is teaching me to
              think in lifetimes. Both are teaching me that the abstractions I&apos;ve been
              trusting were never as solid as I assumed.
            </motion.p>

            <motion.div {...fadeUp} className="relative py-[8px] my-[8px]">
              <span
                aria-hidden="true"
                className="absolute -top-[28px] -left-[6px] font-display text-[80px] leading-none select-none pointer-events-none"
                style={{ color: "var(--v3-accent)", opacity: 0.22 }}
              >
                &ldquo;
              </span>
              <p className="relative font-sans text-[26px] max-[720px]:text-[21px] leading-[1.45] text-[var(--ink)] font-normal italic pl-[36px] max-[720px]:pl-[28px]">
                I&apos;m building toward making zkML feel legible to the engineer on the
                other side of the screen. Less mythical, more shippable.
              </p>
            </motion.div>

            <motion.p
              {...fadeUp}
              transition={{ duration: 0.8 }}
              className="text-[19px] leading-[1.7] text-[var(--ink-2)]"
            >
              I write essays as I go — not because I have answers, but because writing forces me
              to stop pretending I understand things I don&apos;t. If you&apos;ve read one of my
              pieces and it helped, that&apos;s the loop closing for me.
            </motion.p>

            <motion.p
              {...fadeUp}
              transition={{ duration: 0.8 }}
              className="text-[19px] leading-[1.7] text-[var(--ink-2)]"
            >
              I&apos;m also drawn to applied systems thinking beyond software.{" "}
              <b className="text-[var(--ink)] font-medium">Agriculture and food systems</b>, <b className="text-[var(--ink)] font-medium">waste management</b>, and{" "}
              <b className="text-[var(--ink)] font-medium">recycling infrastructure</b> — the same first-principles thinking I apply to
              protocol design shows up in how I think about resource loops in the physical world.
              The incentive structures are not that different.
            </motion.p>

            <motion.p
              {...fadeUp}
              transition={{ duration: 0.8 }}
              className="text-[19px] leading-[1.7] text-[var(--ink-2)]"
            >
              Off-screen: I play guitar badly, chess decently, and study Mandarin daily. I live in
              Lagos. I&apos;m a Christian, which informs how I think about work — patience,
              restraint, and the conviction that the small invisible parts matter as much as the
              visible ones.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Elsewhere — bento strip, full width */}
      <section className="max-w-[var(--maxw)] mx-auto px-[var(--gutter)] py-[96px] max-[720px]:py-[64px] border-b border-[var(--rule)]">
        <motion.div
          {...fadeUp}
          className="font-mono text-[11px] tracking-[0.18em] text-[var(--ink-3)] mb-[40px] max-[720px]:mb-[28px]"
        >
          ELSEWHERE
        </motion.div>
        <div className="grid grid-cols-3 max-[900px]:grid-cols-1 gap-[24px]">
          <TiltCard intensity={15} className="h-full">
            <div className="bg-[var(--paper)] border border-[var(--rule)] rounded-[16px] p-[24px] transition-all duration-300 hover:border-[var(--v3-accent)] hover:shadow-[0_12px_30px_-10px_rgba(0,0,0,0.1)] h-full flex flex-col gap-[16px]">
              <h4 className="font-mono text-[11px] tracking-[0.18em] uppercase text-[var(--ink-3)] font-medium">Reading</h4>
              <div className="flex flex-col gap-[14px] h-full justify-between">
                <span className="text-[16px] text-[var(--ink)] leading-[1.5]">Crafting Interpreters <br/><span className="text-[13px] text-[var(--ink-3)] font-mono">Book</span></span>
                <span className="text-[16px] text-[var(--ink)] leading-[1.5]">Halo2 spec <br/><span className="text-[13px] text-[var(--ink-3)] font-mono">Paper</span></span>
              </div>
            </div>
          </TiltCard>

          <TiltCard intensity={15} className="h-full">
            <div className="bg-[var(--bg-2)] border border-[var(--rule)] rounded-[16px] p-[24px] transition-all duration-300 hover:border-[var(--v3-accent)] hover:shadow-[0_12px_30px_-10px_rgba(0,0,0,0.1)] h-full flex flex-col gap-[16px]">
              <h4 className="font-mono text-[11px] tracking-[0.18em] uppercase text-[var(--v3-accent)] font-medium">Curious</h4>
              <div className="flex flex-col gap-[10px]">
                <span className="text-[16px] text-[var(--ink)]">Agriculture</span>
                <span className="text-[16px] text-[var(--ink)]">Waste mgmt</span>
                <span className="text-[16px] text-[var(--ink)]">Circular economy</span>
              </div>
            </div>
          </TiltCard>

          <TiltCard intensity={10} className="h-full">
            <div className="bg-[var(--paper)] border border-[var(--rule)] rounded-[16px] p-[24px] transition-all duration-300 hover:border-[var(--v3-accent)] hover:shadow-[0_12px_30px_-10px_rgba(0,0,0,0.1)] h-full flex flex-col gap-[16px] justify-between">
              <h4 className="font-mono text-[11px] tracking-[0.18em] uppercase text-[var(--ink-3)] font-medium m-0">Elsewhere</h4>
              <div className="flex flex-wrap gap-[18px]">
                <a href="https://github.com/michojekunle" target="_blank" rel="noopener noreferrer" className="text-[16px] font-medium text-[var(--ink)] hover:text-[var(--v3-accent)] transition-colors underline decoration-[var(--rule)] underline-offset-[4px]">GitHub</a>
                <a href="https://x.com/devvmichael" target="_blank" rel="noopener noreferrer" className="text-[16px] font-medium text-[var(--ink)] hover:text-[var(--v3-accent)] transition-colors underline decoration-[var(--rule)] underline-offset-[4px]">Twitter</a>
                <a href="https://linkedin.com/in/michael-ojekunle" target="_blank" rel="noopener noreferrer" className="text-[16px] font-medium text-[var(--ink)] hover:text-[var(--v3-accent)] transition-colors underline decoration-[var(--rule)] underline-offset-[4px]">LinkedIn</a>
              </div>
            </div>
          </TiltCard>
        </div>
      </section>

      {/* CTA — standalone, never inside a transformed wrapper so it can
          never drift past its layout box */}
      <section className="max-w-[var(--maxw)] mx-auto px-[var(--gutter)] py-[96px] max-[720px]:py-[64px]">
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.8 }}
          className="rounded-[20px] border border-[var(--rule)] bg-[var(--paper)] px-[48px] py-[48px] max-[720px]:px-[28px] max-[720px]:py-[36px] flex flex-wrap items-center justify-between gap-[28px] max-[600px]:justify-start"
        >
          <p className="font-sans text-[22px] max-[600px]:text-[18px] leading-[1.5] text-[var(--ink)] font-normal m-0 max-w-[40ch]">
            That&apos;s the short version. The long version is in the work.
          </p>
          <div className="flex flex-wrap gap-[16px]">
            <MagneticWrapper strength={15}>
              <Link href="/work" className="v3-btn v3-btn-primary">
                See the work <ArrowRight className="inline w-4 h-4 ml-2" aria-hidden="true" />
              </Link>
            </MagneticWrapper>
            <MagneticWrapper strength={15}>
              <Link href="/contact" className="v3-btn v3-btn-ghost">
                Book a call
              </Link>
            </MagneticWrapper>
          </div>
        </motion.div>
      </section>
    </div>
  )
}
