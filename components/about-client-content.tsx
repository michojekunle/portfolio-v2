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
      <section className="grid grid-cols-1 min-[900px]:grid-cols-[1.4fr_1fr] gap-12 items-center pt-40 pb-20 max-180:pt-20 max-180:pb-14 max-w-(--maxw) mx-auto px-(--gutter) border-b border-(--rule)">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground mb-6"
          >
            02 — ABOUT · BACKGROUND
          </motion.div>

          <h1 className="m-0 font-display font-light text-[clamp(36px,7vw,90px)] leading-[0.95] tracking-[-0.03em] text-(--ink) mb-8 text-balance fvs-display flex flex-wrap gap-x-4 gap-y-3 max-[720px]:gap-x-2.5 max-[720px]:gap-y-2">
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
                className={i === 0 || i === titleWords.length - 1 ? "italic text-(--v3-accent) fvs-soft" : ""}
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
      <section className="max-w-(--maxw) mx-auto px-(--gutter) py-24 max-180:py-16 border-b border-(--rule)">
        <motion.div
          {...fadeUp}
          className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground mb-10 max-180:mb-7"
        >
          ORIGIN
        </motion.div>
        <div className="grid grid-cols-1 min-[900px]:grid-cols-[1.15fr_1fr] gap-16 max-[900px]:gap-10 items-start">
          <div className="flex flex-col gap-7">
            <motion.p
              {...fadeUp}
              className="font-sans text-[24px] max-180:text-[20px] leading-normal text-(--ink) font-normal"
            >
              I came to software through a long detour. My background is in the sciences —
              the kind of education that teaches you to follow evidence, question assumptions,
              and be honest when an experiment fails. It turns out programming rewards exactly
              the same habits.{" "}
              <em
                className="italic text-(--v3-accent) font-medium"
                style={{ fontVariationSettings: '"opsz" 144, "SOFT" 100' }}
              >
                Read the spec before you pour the concrete.
              </em>
            </motion.p>

            <motion.p
              {...fadeUp}
              transition={{ duration: 0.8 }}
              className="text-[18px] leading-[1.7] text-secondary-foreground"
            >
              My first serious programming was Java. Then React. Then — around the time L2s started
              actually shipping — Solidity. Four years of full-stack product work, the last two of
              them deep in web3, shipping on Rootstock, Starknet, and Stacks. Some of it
              I&apos;m proud of. Some of it taught me what I&apos;d never do again.
            </motion.p>
          </div>

          <TiltCard intensity={10}>
            <div className="bg-(--paper) border border-(--rule) rounded-2xl p-8 transition-all duration-300 hover:border-(--v3-accent) hover:shadow-[0_12px_30px_-10px_rgba(0,0,0,0.1)] h-full flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <h4 className="font-mono text-[11px] tracking-[0.18em] uppercase text-muted-foreground font-medium">Stack — current</h4>
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "var(--v3-accent)" }} aria-hidden="true" />
              </div>

              <div className="flex flex-col gap-4.5">
                <div className="flex flex-col gap-1 border-b border-(--rule) pb-4.5">
                  <span className="text-[17px] text-(--ink) font-medium">Mobile</span>
                  <span className="text-[14px] text-muted-foreground font-mono">Flutter · Dart</span>
                </div>
                <div className="flex flex-col gap-1 border-b border-(--rule) pb-4.5">
                  <span className="text-[17px] text-(--ink) font-medium">Systems</span>
                  <span className="text-[14px] text-muted-foreground font-mono">Rust · Linux internals</span>
                </div>
                <div className="flex flex-col gap-1 border-b border-(--rule) pb-4.5">
                  <span className="text-[17px] text-(--ink) font-medium">Frontend</span>
                  <span className="text-[14px] text-muted-foreground font-mono">Next.js 16 · TypeScript · Tailwind</span>
                </div>
                <div className="flex flex-col gap-1 border-b border-(--rule) pb-4.5">
                  <span className="text-[17px] text-(--ink) font-medium">Web3 <span className="text-[11px] text-muted-foreground/70 font-mono">· background</span></span>
                  <span className="text-[14px] text-muted-foreground font-mono">Solidity · Cairo · Clarity · Starknet · Rootstock</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[17px] text-(--ink) font-medium">Infra</span>
                  <span className="text-[14px] text-muted-foreground font-mono">Supabase · Vercel · Hetzner · Resend</span>
                </div>
              </div>
            </div>
          </TiltCard>
        </div>
      </section>

      {/* The narrative — single measured column, no competing sidebar.
          Tinted background breaks the visual rhythm from the sections
          above and below it. */}
      <section className="bg-(--bg-2) border-b border-(--rule)">
        <div className="max-w-(--maxw) mx-auto px-(--gutter) py-24 max-180:py-16">
          <motion.div
            {...fadeUp}
            className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground mb-10 max-180:mb-7 max-w-[68ch] mx-auto"
          >
            NOW
          </motion.div>
          <div className="max-w-[68ch] mx-auto flex flex-col gap-8">
            <motion.p
              {...fadeUp}
              transition={{ duration: 0.8 }}
              className="text-[19px] leading-[1.7] text-secondary-foreground"
            >
              Right now I&apos;m going lower down the stack than the frontend. My two current
              obsessions are{" "}
              <b className="text-(--ink) font-medium">Rust systems programming</b> and{" "}
              <b className="text-(--ink) font-medium">Flutter mobile development</b>. Rust is
              teaching me to think in lifetimes and memory; Flutter is teaching me to ship
              polished apps to real devices. Both are teaching me that the abstractions
              I&apos;d been trusting were never as solid as I assumed.
            </motion.p>

            <motion.div {...fadeUp} className="relative py-2 my-2">
              <span
                aria-hidden="true"
                className="absolute -top-7 -left-1.5 font-display text-[80px] leading-none select-none pointer-events-none"
                style={{ color: "var(--v3-accent)", opacity: 0.22 }}
              >
                &ldquo;
              </span>
              <p className="relative font-sans text-[26px] max-[720px]:text-[21px] leading-[1.45] text-(--ink) font-normal italic pl-9 max-180:pl-7">
                Once these feel like second nature, the real destination is zkML — making
                zero-knowledge machine learning legible and shippable, not mythical.
              </p>
            </motion.div>

            <motion.p
              {...fadeUp}
              transition={{ duration: 0.8 }}
              className="text-[19px] leading-[1.7] text-secondary-foreground"
            >
              I&apos;m not just an engineer for hire — I&apos;m building my own things. A growing
              set of <b className="text-(--ink) font-medium">products and small businesses</b>,
              shipped as real tools with auth, databases, and paying-attention-to-the-details
              polish, not weekend demos. Building my own things teaches me the half of the craft
              that pure engineering doesn&apos;t: distribution, retention, and knowing what&apos;s
              worth building at all.
            </motion.p>

            <motion.p
              {...fadeUp}
              transition={{ duration: 0.8 }}
              className="text-[19px] leading-[1.7] text-secondary-foreground"
            >
              I write essays as I go — not because I have answers, but because writing forces me
              to stop pretending I understand things I don&apos;t. If you&apos;ve read one of my
              pieces and it helped, that&apos;s the loop closing for me.
            </motion.p>

            <motion.p
              {...fadeUp}
              transition={{ duration: 0.8 }}
              className="text-[19px] leading-[1.7] text-secondary-foreground"
            >
              That builder&apos;s itch reaches past software too.{" "}
              <b className="text-(--ink) font-medium">Agriculture and food systems</b>, <b className="text-(--ink) font-medium">waste management</b>, and{" "}
              <b className="text-(--ink) font-medium">recycling infrastructure</b> — the same first-principles thinking I apply to
              protocol design shows up in how I think about resource loops in the physical world.
              The incentive structures are not that different, and I expect some of what I build
              next to live there.
            </motion.p>

            <motion.p
              {...fadeUp}
              transition={{ duration: 0.8 }}
              className="text-[19px] leading-[1.7] text-secondary-foreground"
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
      <section className="max-w-(--maxw) mx-auto px-(--gutter) py-24 max-180:py-16 border-b border-(--rule)">
        <motion.div
          {...fadeUp}
          className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground mb-10 max-180:mb-7"
        >
          ELSEWHERE
        </motion.div>
        <div className="grid grid-cols-3 max-[900px]:grid-cols-1 gap-6">
          <TiltCard intensity={15} className="h-full">
            <div className="bg-(--paper) border border-(--rule) rounded-2xl p-6 transition-all duration-300 hover:border-(--v3-accent) hover:shadow-[0_12px_30px_-10px_rgba(0,0,0,0.1)] h-full flex flex-col gap-4">
              <h4 className="font-mono text-[11px] tracking-[0.18em] uppercase text-muted-foreground font-medium">Reading</h4>
              <div className="flex flex-col gap-3.5 h-full justify-between">
                <span className="text-[16px] text-(--ink) leading-normal">Crafting Interpreters <br/><span className="text-[13px] text-muted-foreground font-mono">Book</span></span>
                <span className="text-[16px] text-(--ink) leading-normal">The Rust Book <br/><span className="text-[13px] text-muted-foreground font-mono">Book</span></span>
              </div>
            </div>
          </TiltCard>

          <TiltCard intensity={15} className="h-full">
            <div className="bg-(--bg-2) border border-(--rule) rounded-2xl p-6 transition-all duration-300 hover:border-(--v3-accent) hover:shadow-[0_12px_30px_-10px_rgba(0,0,0,0.1)] h-full flex flex-col gap-4">
              <h4 className="font-mono text-[11px] tracking-[0.18em] uppercase text-(--v3-accent) font-medium">Curious</h4>
              <div className="flex flex-col gap-2.5">
                <span className="text-[16px] text-(--ink)">Agriculture</span>
                <span className="text-[16px] text-(--ink)">Waste mgmt</span>
                <span className="text-[16px] text-(--ink)">Circular economy</span>
              </div>
            </div>
          </TiltCard>

          <TiltCard intensity={10} className="h-full">
            <div className="bg-(--paper) border border-(--rule) rounded-2xl p-6 transition-all duration-300 hover:border-(--v3-accent) hover:shadow-[0_12px_30px_-10px_rgba(0,0,0,0.1)] h-full flex flex-col gap-4 justify-between">
              <h4 className="font-mono text-[11px] tracking-[0.18em] uppercase text-muted-foreground font-medium m-0">Elsewhere</h4>
              <div className="flex flex-wrap gap-4.5">
                <a href="https://github.com/michojekunle" target="_blank" rel="noopener noreferrer" className="text-[16px] font-medium text-(--ink) hover:text-(--v3-accent) transition-colors underline decoration-(--rule) underline-offset-1">GitHub</a>
                <a href="https://x.com/devvmichael" target="_blank" rel="noopener noreferrer" className="text-[16px] font-medium text-(--ink) hover:text-(--v3-accent) transition-colors underline decoration-(--rule) underline-offset-1">Twitter</a>
                <a href="https://linkedin.com/in/michael-ojekunle" target="_blank" rel="noopener noreferrer" className="text-[16px] font-medium text-(--ink) hover:text-(--v3-accent) transition-colors underline decoration-(--rule) underline-offset-1">LinkedIn</a>
              </div>
            </div>
          </TiltCard>
        </div>
      </section>

      {/* CTA — standalone, never inside a transformed wrapper so it can
          never drift past its layout box */}
      <section className="max-w-(--maxw) mx-auto px-(--gutter) py-24 max-180:py-16">
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.8 }}
          className="rounded-[20px] border border-(--rule) bg-(--paper) px-12 py-12 max-180:px-7 max-180:py-9 flex flex-wrap items-center justify-between gap-7 max-[600px]:justify-start"
        >
          <p className="font-sans text-[22px] max-[600px]:text-[18px] leading-normal text-(--ink) font-normal m-0 max-w-[40ch]">
            That&apos;s the short version. The long version is in the work.
          </p>
          <div className="flex flex-wrap gap-4">
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
