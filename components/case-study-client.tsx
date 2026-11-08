"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform, useSpring } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { AnimatedCounter } from "./animated-counter"
import { MagneticWrapper } from "./magnetic-wrapper"
import { ArrowLeft, ArrowRight, ArrowUpRight, Quote } from "lucide-react"

interface CaseStudyProps {
  slug: string
  name: string
  role: string
  duration: string
  team: string
  lede: string
  image?: string
  gallery?: { src: string; alt: string; kind: "desktop" | "phone"; w: number; h: number }[]
  liveLabel?: string
  stack: string[]
  live?: string
  year: string | number
  problem: string
  approach: string
  process: string[]
  outcomes: { n: string; l: string; d: string }[]
  learned: string
  idx: string
}

function ParallaxHeroImage({
  image,
  name,
}: {
  image: string
  name: string
}) {
  const imageRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: imageRef,
    offset: ["start end", "end start"],
  })
  const imageScale = useTransform(scrollYProgress, [0, 1], [0.94, 1.03])
  const imageY = useTransform(scrollYProgress, [0, 1], ["-5%", "5%"])

  return (
    <section ref={imageRef} className="max-w-(--maxw) mx-auto px-(--gutter) my-10 sm:my-16 lg:my-20">
      <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] rounded-2xl sm:rounded-3xl overflow-hidden border border-(--rule) bg-(--bg-2) shadow-[0_20px_50px_-15px_color-mix(in_oklab,var(--ink)_10%,transparent)]">
        <motion.div
          style={{ scale: imageScale, y: imageY }}
          className="relative w-full h-[120%] -top-[10%] origin-center"
        >
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover object-top"
            sizes="(max-width: 1400px) 100vw, 1400px"
            priority
            unoptimized={image.endsWith(".svg")}
          />
        </motion.div>
      </div>
    </section>
  )
}

export function CaseStudyClient({
  p,
  prevProject,
  nextProject,
}: {
  p: CaseStudyProps
  prevProject?: { slug: string; name: string } | null
  nextProject?: { slug: string; name: string } | null
}) {
  // Top reading progress bar (matching Notes page)
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  })

  const titleWords = p.name.split(" ")

  return (
    <>
      {/* Reading Progress Indicator */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-0.75 bg-(--v3-accent) z-[500] origin-left"
        style={{ scaleX }}
      />

      {/* Hero Section — Clean, unified typography matching /work and /notes */}
      <section className="pt-32 sm:pt-36 lg:pt-40 pb-12 sm:pb-16 max-w-(--maxw) mx-auto px-(--gutter) border-b border-(--rule) relative w-full">
        {/* Breadcrumbs */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="crumbs font-mono text-[11px] tracking-[0.18em] text-muted-foreground uppercase mb-6 sm:mb-8 flex flex-wrap items-center gap-2"
          aria-label="Breadcrumb"
        >
          <Link href="/" className="hover:text-(--ink) transition-colors no-underline">
            Home
          </Link>
          <span className="text-(--rule)">/</span>
          <Link href="/work" className="hover:text-(--ink) transition-colors no-underline">
            Work
          </Link>
          <span className="text-(--rule)">/</span>
          <span className="text-(--ink) font-medium">{p.name}</span>
        </motion.div>

        {/* Project Title with word-by-word reveal */}
        <h1 className="m-0 font-display font-light text-[clamp(38px,6.5vw,84px)] leading-[0.96] tracking-[-0.035em] text-(--ink) mb-6 sm:mb-8 text-balance fvs-display flex flex-wrap gap-x-3.5 sm:gap-x-4 gap-y-2">
          {titleWords.map((word, i) => (
            <motion.span
              key={i}
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: "0%", opacity: 1 }}
              transition={{
                duration: 0.8,
                ease: [0.16, 1, 0.3, 1],
                delay: i * 0.08,
              }}
              className={i === titleWords.length - 1 ? "italic text-(--v3-accent) fvs-soft" : ""}
            >
              {word}
            </motion.span>
          ))}
        </h1>

        {/* Project Lede */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-[clamp(18px,2.2vw,24px)] text-secondary-foreground font-light leading-[1.55] max-w-[62ch] m-0 mb-8 sm:mb-10 text-pretty"
        >
          {p.lede}
        </motion.p>

        {/* Hero Metadata Line (Notes page inspired) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="flex flex-wrap items-center justify-between gap-6 pt-6 sm:pt-8 border-t border-(--rule) font-mono text-[12px] tracking-[0.04em] text-muted-foreground"
        >
          <div className="flex flex-wrap items-center gap-x-6 sm:gap-x-8 gap-y-3">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground uppercase text-[11px] tracking-wider">Role</span>
              <span className="text-(--ink) font-medium">{p.role.split(" · ")[0]}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground uppercase text-[11px] tracking-wider">Duration</span>
              <span className="text-(--ink) font-medium">{p.duration}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground uppercase text-[11px] tracking-wider">Team</span>
              <span className="text-(--ink) font-medium">{p.team}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground uppercase text-[11px] tracking-wider">Year</span>
              <span className="text-(--ink) font-medium">{p.year}</span>
            </div>
          </div>

          {p.live && (
            <div className="flex items-center gap-2">
              <MagneticWrapper strength={10}>
                <a
                  href={`https://${p.live.replace(/^https?:\/\//, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-(--rule) bg-(--bg-2)/70 text-(--v3-accent) hover:border-(--v3-accent) hover:text-(--ink) transition-colors no-underline font-medium text-[11px] uppercase tracking-wider"
                >
                  {p.liveLabel ?? "Live Project"} <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </MagneticWrapper>
            </div>
          )}
        </motion.div>
      </section>

      {/* Hero Image with Parallax Scroll */}
      {p.image && <ParallaxHeroImage image={p.image} name={p.name} />}

      {/* Case Study Body & Sidebar Layout (Exact Notes structure: Article + Sticky Sidebar) */}
      <div className="max-w-(--maxw) mx-auto px-(--gutter) flex flex-col lg:flex-row gap-12 lg:gap-16 xl:gap-20 items-start relative pb-20 sm:pb-28">
        {/* Main Article Body */}
        <article className="flex-1 min-w-0 w-full lg:max-w-[760px] xl:max-w-[820px] flex flex-col gap-16 sm:gap-20">
          {/* Problem */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="font-display font-light text-[clamp(32px,4vw,52px)] leading-none text-(--ink) mb-6 sm:mb-8 tracking-[-0.03em] fvs-display">
              The <em className="text-(--v3-accent) italic fvs-soft">problem.</em>
            </h2>
            <p className="text-[16px] sm:text-[18px] text-secondary-foreground leading-[1.75] max-w-[65ch] m-0">
              {p.problem}
            </p>
          </motion.div>

          {/* Approach */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="font-display font-light text-[clamp(32px,4vw,52px)] leading-none text-(--ink) mb-6 sm:mb-8 tracking-[-0.03em] fvs-display">
              The <em className="text-(--v3-accent) italic fvs-soft">approach.</em>
            </h2>
            <p className="text-[16px] sm:text-[18px] text-secondary-foreground leading-[1.75] max-w-[65ch] m-0">
              {p.approach}
            </p>
          </motion.div>

          {/* Process */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="font-display font-light text-[clamp(32px,4vw,52px)] leading-none text-(--ink) mb-8 sm:mb-10 tracking-[-0.03em] fvs-display">
              The <em className="text-(--v3-accent) italic fvs-soft">process.</em>
            </h2>
            <div className="flex flex-col gap-6 sm:gap-8">
              {p.process.map((step, i) => (
                <div key={i} className="flex gap-4 sm:gap-6 items-start border-t border-(--rule) pt-6">
                  <span className="font-mono text-[13px] sm:text-[14px] text-(--v3-accent) font-semibold pt-0.5 shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="m-0 text-[16px] sm:text-[18px] text-secondary-foreground leading-[1.75] max-w-[62ch]">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Screens / Gallery */}
          {p.gallery && p.gallery.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7 }}
            >
              <h2 className="font-display font-light text-[clamp(32px,4vw,52px)] leading-none text-(--ink) mb-8 sm:mb-10 tracking-[-0.03em] fvs-display">
                The <em className="text-(--v3-accent) italic fvs-soft">screens.</em>
              </h2>

              {/* Desktop screenshots */}
              {p.gallery.some((g) => g.kind === "desktop") && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-start">
                  {p.gallery
                    .filter((g) => g.kind === "desktop")
                    .map((g, gi, arr) => (
                      <figure
                        key={g.src}
                        className={`m-0 flex flex-col gap-3 ${
                          arr.length % 2 === 1 && gi === 0 ? "md:col-span-2" : ""
                        }`}
                      >
                        <div className="overflow-hidden rounded-2xl border border-(--rule) bg-(--bg-2)">
                          <Image
                            src={g.src}
                            alt={g.alt}
                            width={g.w}
                            height={g.h}
                            className="w-full h-auto block"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                            unoptimized={g.src.endsWith(".svg")}
                          />
                        </div>
                        <figcaption className="text-[13px] font-mono text-muted-foreground leading-normal">
                          {g.alt}
                        </figcaption>
                      </figure>
                    ))}
                </div>
              )}

              {/* Phone screenshots */}
              {p.gallery.some((g) => g.kind === "phone") && (
                <div
                  className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 items-start ${
                    p.gallery.some((g) => g.kind === "desktop") ? "mt-10" : ""
                  }`}
                >
                  {p.gallery
                    .filter((g) => g.kind === "phone")
                    .map((g) => (
                      <figure key={g.src} className="m-0 flex flex-col gap-2.5">
                        <div className="overflow-hidden rounded-2xl border border-(--rule) bg-(--bg-2)">
                          <Image
                            src={g.src}
                            alt={g.alt}
                            width={g.w}
                            height={g.h}
                            className="w-full h-auto block"
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          />
                        </div>
                        <figcaption className="text-[12px] font-mono text-muted-foreground leading-normal">
                          {g.alt}
                        </figcaption>
                      </figure>
                    ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Outcomes */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="font-display font-light text-[clamp(32px,4vw,52px)] leading-none text-(--ink) mb-8 sm:mb-10 tracking-[-0.03em] fvs-display">
              The <em className="text-(--v3-accent) italic fvs-soft">outcome.</em>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {p.outcomes.map((o, i) => (
                <div
                  key={i}
                  className="bg-(--paper) border border-(--rule) rounded-2xl p-6 sm:p-7 flex flex-col gap-3 transition-all duration-300 hover:border-(--v3-accent-soft) hover:shadow-[0_12px_32px_-8px_color-mix(in_oklab,var(--ink)_6%,transparent)]"
                >
                  <div className="font-display font-light text-[clamp(40px,4.5vw,56px)] text-(--v3-accent) leading-none">
                    <AnimatedCounter value={o.n} />
                  </div>
                  <div className="text-[15px] font-medium text-(--ink)">{o.l}</div>
                  <div className="text-[13px] text-muted-foreground leading-normal">{o.d}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* What I Learned — Editorial Quote Block */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className="my-8 sm:my-12 p-8 sm:p-12 lg:p-16 bg-(--ink) text-(--bg) rounded-2xl sm:rounded-3xl relative overflow-hidden"
          >
            <Quote className="w-16 h-16 sm:w-24 sm:h-24 opacity-10 absolute top-6 left-6 text-(--bg-2) pointer-events-none" />
            <div className="font-mono text-[11px] text-(--bg-2)/70 mb-4 sm:mb-6 tracking-widest uppercase border-b border-(--bg-2)/20 pb-4 relative z-10">
              What I learned
            </div>
            <p className="font-display font-light text-[clamp(20px,3vw,34px)] leading-[1.45] m-0 fvs-text italic relative z-10">
              &ldquo;{p.learned}&rdquo;
            </p>
          </motion.div>
        </article>

        {/* Sticky Sidebar (Desktop >= 1024px; wraps gracefully below on tablet & mobile) */}
        <aside className="w-full lg:w-[260px] xl:w-[280px] shrink-0 lg:sticky lg:top-28 flex flex-col gap-8 sm:gap-10 border-t lg:border-t-0 lg:border-l border-(--rule) pt-8 lg:pt-0 lg:pl-8">
          {/* Tech Stack */}
          <div>
            <div className="font-mono text-[11px] tracking-[0.14em] uppercase text-muted-foreground mb-3">
              Tech Stack
            </div>
            <div className="flex flex-wrap lg:flex-col gap-2">
              {p.stack.map((s) => (
                <span
                  key={s}
                  className="font-mono text-[12px] px-2.5 py-1 rounded bg-(--bg-2) border border-(--rule)/60 text-secondary-foreground inline-block"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Live Link Card */}
          {p.live && (
            <div className="p-4 rounded-xl border border-(--rule) bg-(--bg-2)/40">
              <div className="font-mono text-[11px] tracking-[0.14em] uppercase text-muted-foreground mb-2">
                Live Deployment
              </div>
              <a
                href={`https://${p.live.replace(/^https?:\/\//, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[13px] font-mono text-(--v3-accent) hover:underline flex items-center gap-1.5 break-all no-underline"
              >
                {p.live.replace(/^https?:\/\//, "")}{" "}
                <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
              </a>
            </div>
          )}

          {/* Project Specs */}
          <div className="flex flex-col gap-3 font-mono text-[12px] text-muted-foreground border-t border-(--rule)/60 pt-4">
            <div className="flex justify-between items-center">
              <span>Index</span>
              <span className="text-(--ink) font-medium">{p.idx}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Year</span>
              <span className="text-(--ink) font-medium">{p.year}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Duration</span>
              <span className="text-(--ink) font-medium">{p.duration}</span>
            </div>
          </div>

          {/* Back link */}
          <div className="pt-2">
            <Link
              href="/work"
              className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground hover:text-(--ink) flex items-center gap-1.5 transition-colors no-underline"
            >
              <ArrowLeft className="w-3 h-3" /> Back to all work
            </Link>
          </div>
        </aside>
      </div>

      {/* Prev / All Work / Next Navigation (Identical structure to Notes page) */}
      <section className="max-w-(--maxw) mx-auto px-(--gutter) border-t border-(--rule)">
        <div className="flex flex-col sm:flex-row justify-between items-center py-16 sm:py-20 gap-8 sm:gap-12">
          {/* Previous Project */}
          <div className="flex-1 flex justify-start w-full sm:w-auto">
            {prevProject && (
              <MagneticWrapper strength={20}>
                <Link
                  href={`/work/${prevProject.slug}`}
                  className="group flex flex-col items-start gap-2 no-underline"
                >
                  <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground group-hover:text-(--v3-accent) transition-colors flex items-center gap-1.5">
                    <ArrowLeft className="w-3 h-3 transition-transform group-hover:-translate-x-1" /> Previous
                  </div>
                  <div className="font-display text-[22px] sm:text-[28px] text-(--ink) text-balance leading-tight max-w-[280px]">
                    {prevProject.name}
                  </div>
                </Link>
              </MagneticWrapper>
            )}
          </div>

          {/* Center Index Link */}
          <div className="flex justify-center">
            <MagneticWrapper strength={20}>
              <Link href="/work" className="group flex flex-col items-center gap-2 no-underline">
                <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground group-hover:text-(--v3-accent) transition-colors">
                  All work
                </div>
                <div className="font-display text-[28px] sm:text-[32px] text-(--ink)">
                  Index
                </div>
              </Link>
            </MagneticWrapper>
          </div>

          {/* Next Project */}
          <div className="flex-1 flex justify-end text-right w-full sm:w-auto">
            {nextProject && (
              <MagneticWrapper strength={20}>
                <Link
                  href={`/work/${nextProject.slug}`}
                  className="group flex flex-col items-end gap-2 no-underline"
                >
                  <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground group-hover:text-(--v3-accent) transition-colors flex items-center gap-1.5">
                    Next <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                  </div>
                  <div className="font-display text-[22px] sm:text-[28px] text-(--ink) text-balance leading-tight max-w-[280px]">
                    {nextProject.name}
                  </div>
                </Link>
              </MagneticWrapper>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
