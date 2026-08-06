"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { MagneticWrapper } from "./magnetic-wrapper"
import { TextReveal } from "./text-reveal"

const ROLES = [
  {
    title: "Software Engineer",
    desc: "Four years full-stack, two deep in web3. Now going lower down the stack, doubling down on Rust systems programming.",
    tag: "ENGINEERING"
  },
  {
    title: "Builder",
    desc: "Building a handful of my own products and businesses — shipping real tools, not demos, and learning what it takes to run them.",
    tag: "PRODUCTS"
  },
  {
    title: "Writer",
    desc: "Writing essays as I learn in public — distilling hard technical ideas into accessible, high-signal pieces.",
    tag: "CONTENT"
  }
]

export function AboutPreviewSection(): React.ReactElement {
  return (
    <section className="py-30 max-[720px]:py-18 max-w-(--maxw) mx-auto px-(--gutter)" aria-labelledby="about-preview-heading">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="grid grid-cols-[120px_1fr] max-[720px]:grid-cols-1 gap-12 max-[720px]:gap-6 items-baseline mb-20 max-[720px]:mb-12"
      >
        <div className="font-mono text-[11px] tracking-[0.18em] text-secondary-foreground pt-4.5">01 — IDENTITY</div>
        <div>
          <h2 id="about-preview-heading" className="m-0 font-display font-normal text-[clamp(44px,7vw,88px)] leading-[0.95] tracking-tight text-(--ink) text-balance fvs-display">
            <TextReveal delay={0.1}>Engineering with</TextReveal> <br className="max-[720px]:hidden" />
            <TextReveal delay={0.3} className="italic text-(--v3-accent) fvs-soft">precision.</TextReveal>
          </h2>
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="col-start-2 max-[720px]:col-start-1 max-w-[56ch] text-[17px] leading-[1.6] text-secondary-foreground mt-4.5"
          >
            I don&apos;t just build features; I architect systems and ship products. Rooted in understanding the metal while obsessing over the interface — and increasingly, the business around it.
          </motion.div>
        </div>
      </motion.div>

      <div className="grid grid-cols-3 max-[920px]:grid-cols-1 gap-10 max-[920px]:gap-16">
        {ROLES.map((role, i) => (
          <motion.div 
            key={role.title} 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: i * 0.15 }}
            className="flex flex-col gap-5"
          >
            <div className="font-mono text-[10px] tracking-[0.2em] text-(--v3-accent) font-bold uppercase">{role.tag}</div>
            <h3 className="m-0 font-display font-normal text-[28px] leading-[1.1] text-(--ink) fvs-text">
              {role.title}
            </h3>
            <p className="m-0 text-[16px] leading-[1.7] text-secondary-foreground">
              {role.desc}
            </p>
          </motion.div>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6 }}
        className="mt-20 pt-10 border-t border-(--rule) flex justify-center"
      >
        <MagneticWrapper strength={20}>
          <Link href="/about" className="group inline-flex items-center justify-center px-8 h-13 rounded-full font-mono text-[11px] uppercase tracking-[0.15em] font-medium cursor-pointer border border-(--rule) bg-transparent text-(--ink) transition-all duration-300 no-underline hover:border-(--v3-accent) hover:text-(--v3-accent) hover:bg-[color-mix(in_oklab,var(--v3-accent)_5%,transparent)]">
            More about my journey <ArrowRight className="inline-block transition-transform duration-300 group-hover:translate-x-1 ml-2.5 w-3 h-3" aria-hidden="true" />
          </Link>
        </MagneticWrapper>
      </motion.div>
    </section>
  )
}
