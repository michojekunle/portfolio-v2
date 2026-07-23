"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { AnimatedCounter } from "./animated-counter"
import { MagneticWrapper } from "./magnetic-wrapper"
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react"

// We define a loose interface that matches the Case Study returned from lib
interface CaseStudyProps {
  slug: string
  name: string
  role: string
  duration: string
  team: string
  lede: string
  image?: string
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

export function CaseStudyClient({ p, nextProject }: { p: CaseStudyProps, nextProject?: { slug: string, name: string } | null }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)
  
  const { scrollYProgress: imageScroll } = useScroll({
    target: imageRef,
    offset: ["start end", "end start"]
  })

  // Image scales up from 0.8 to 1.1 as it scrolls
  const imageScale = useTransform(imageScroll, [0, 1], [0.85, 1.05])
  const imageY = useTransform(imageScroll, [0, 1], ["-10%", "10%"])

  return (
    <div ref={containerRef}>
      {/* Hero */}
      <section className="v3-case-hero v3-container relative z-10 pt-40 pb-20 max-180:pt-20 max-180:pb-14 border-b border-(--rule)">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="font-mono text-[11px] tracking-[0.18em] uppercase text-muted-foreground mb-6 flex items-center gap-3"
        >
          <Link href="/work" className="hover:text-(--ink) transition-colors flex items-center gap-1"><ArrowLeft className="w-3 h-3" /> Work</Link>
          <div className="w-1 h-1 bg-(--rule) rounded-full" />
          Project {p.idx}
        </motion.div>
        
        <div className="flex flex-wrap gap-12 max-180:gap-6 mb-16">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="flex flex-col gap-2">
            <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground">Role</div>
            <div className="text-[15px] font-medium text-(--ink)">{p.role}</div>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="flex flex-col gap-2">
            <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground">Duration</div>
            <div className="text-[15px] font-medium text-(--ink)">{p.duration}</div>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="flex flex-col gap-2">
            <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground">Team</div>
            <div className="text-[15px] font-medium text-(--ink)">{p.team}</div>
          </motion.div>
        </div>

        <h1 className="m-0 font-display font-normal text-[clamp(40px,12vw,140px)] leading-[0.85] tracking-[-0.04em] text-(--ink) mb-8 text-balance fvs-display break-words hyphens-auto">
          {p.name.split(" ").map((w, j, arr) => (
            <motion.span
              key={j}
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: "0%", opacity: 1 }}
              transition={{ duration: 0.8, delay: j * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="inline-block mr-4 max-180:mr-2"
            >
              {j === arr.length - 1 ? <em className="text-(--v3-accent) fvs-soft italic">{w}.</em> : w}
            </motion.span>
          ))}
        </h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-[clamp(20px,3vw,32px)] text-secondary-foreground font-light leading-[1.4] max-w-[800px]"
        >
          {p.lede}
        </motion.p>
      </section>

      {/* Image with Parallax */}
      <section ref={imageRef} className="v3-container mb-30 max-180:mb-20 overflow-hidden rounded-3xl">
        {p.image ? (
          <motion.div style={{ scale: imageScale, y: imageY }} className="relative w-full aspect-[16/9] bg-(--bg-2) origin-center">
            <Image src={p.image} alt={p.name} fill className="object-cover object-top" sizes="(max-width: 1320px) 100vw, 1320px" priority />
          </motion.div>
        ) : (
          <div className="w-full aspect-[16/9] bg-(--bg-2) flex items-center justify-center border border-(--rule) rounded-3xl">
            <span className="font-mono text-[12px] text-muted-foreground uppercase tracking-[0.2em]">Media Asset Pending</span>
          </div>
        )}
      </section>

      {/* Body */}
      <section className="v3-section v3-container grid grid-cols-[280px_1fr] max-[920px]:grid-cols-1 gap-20 max-[920px]:gap-12 items-start pb-30">
        {/* Sticky Sidebar */}
        <aside className="sticky top-30 flex flex-col gap-12 border-l border-(--rule) pl-6">
          <div>
            <h5 className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-4">Stack</h5>
            <ul className="flex flex-col gap-2 m-0 p-0 list-none">
              {p.stack.map((s) => <li key={s} className="text-[14px] font-medium text-(--ink)">{s}</li>)}
            </ul>
          </div>
          
          {p.live && (
            <div>
              <h5 className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-4">Live</h5>
              <MagneticWrapper strength={10}>
                <a href={`https://${p.live.replace(/^https?:\/\//, "")}`} target="_blank" rel="noopener noreferrer" className="inline-block text-[14px] font-medium text-(--v3-accent) hover:text-(--ink) transition-colors underline decoration-(--rule) underline-offset-1">
                  {p.live.replace(/^https?:\/\//, "")} <ArrowUpRight className="inline w-3 h-3 ml-1" />
                </a>
              </MagneticWrapper>
            </div>
          )}
          
          <div>
            <h5 className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-4">Year</h5>
            <div className="text-[14px] font-medium text-(--ink)">{p.year}</div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex flex-col gap-20 max-180:gap-16">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8 }}>
            <h2 className="font-display font-light text-[clamp(40px,5vw,64px)] leading-none text-(--ink) mb-8 tracking-[-0.03em] fvs-display">
              The <em className="text-(--v3-accent) italic fvs-soft">problem.</em>
            </h2>
            <p className="text-[18px] text-secondary-foreground leading-[1.7] max-w-[65ch]">{p.problem}</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8 }}>
            <h2 className="font-display font-light text-[clamp(40px,5vw,64px)] leading-none text-(--ink) mb-8 tracking-[-0.03em] fvs-display">
              The <em className="text-(--v3-accent) italic fvs-soft">approach.</em>
            </h2>
            <p className="text-[18px] text-secondary-foreground leading-[1.7] max-w-[65ch]">{p.approach}</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8 }}>
            <h2 className="font-display font-light text-[clamp(40px,5vw,64px)] leading-none text-(--ink) mb-10 tracking-[-0.03em] fvs-display">
              The <em className="text-(--v3-accent) italic fvs-soft">process.</em>
            </h2>
            <div className="flex flex-col gap-8">
              {p.process.map((step, i) => (
                <div key={i} className="flex gap-6 items-start border-t border-(--rule) pt-6">
                  <div className="font-mono text-[14px] text-(--v3-accent) pt-1">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <p className="m-0 text-[18px] text-secondary-foreground leading-[1.7] max-w-[60ch]">{step}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8 }}>
            <h2 className="font-display font-light text-[clamp(40px,5vw,64px)] leading-none text-(--ink) mb-12 tracking-[-0.03em] fvs-display">
              The <em className="text-(--v3-accent) italic fvs-soft">outcome.</em>
            </h2>
            <div className="grid grid-cols-3 max-[920px]:grid-cols-1 gap-6">
              {p.outcomes.map((o, i) => (
                <div key={i} className="bg-(--paper) border border-(--rule) rounded-[20px] p-8 flex flex-col gap-4 hover:border-(--v3-accent-soft) transition-colors">
                  <div className="font-display font-light text-[clamp(48px,5vw,64px)] text-(--v3-accent) leading-none">
                    <AnimatedCounter value={o.n} />
                  </div>
                  <div className="text-[16px] font-medium text-(--ink)">{o.l}</div>
                  <div className="text-[14px] text-muted-foreground leading-normal">{o.d}</div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            whileInView={{ opacity: 1, scale: 1 }} 
            viewport={{ once: true, margin: "-100px" }} 
            transition={{ duration: 0.8 }}
            className="my-20 p-16 max-180:p-8 bg-(--ink) text-(--bg) rounded-3xl relative overflow-hidden"
          >
            <div className="font-display text-[120px] leading-[0.5] text-(--bg-2) opacity-20 absolute top-10 left-6">
              ❝
            </div>
            <h2 className="font-display font-light text-[24px] text-muted-foreground mb-6 tracking-wider uppercase border-b border-(--bg-2)/20 pb-6 relative z-10">
              What I learned
            </h2>
            <p className="font-display font-light text-[clamp(28px,4vw,48px)] leading-[1.3] m-0 fvs-text italic relative z-10">
              {p.learned}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Next project nav */}
      <section className="v3-container border-t border-(--rule)">
        <div className="flex max-180:flex-col justify-between items-center py-20 max-180:py-12 max-180:gap-12">
          <MagneticWrapper strength={20}>
            <Link href="/work" className="group flex flex-col items-center gap-2">
              <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground group-hover:text-(--v3-accent) transition-colors flex items-center gap-1"><ArrowLeft className="w-3 h-3" /> All work</div>
              <div className="font-display text-[32px] text-(--ink)">Index</div>
            </Link>
          </MagneticWrapper>
          
          {nextProject && (
            <MagneticWrapper strength={20}>
              <Link href={`/work/${nextProject.slug}`} className="group flex flex-col items-center gap-2">
                <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground group-hover:text-(--v3-accent) transition-colors flex items-center gap-1">Next project <ArrowRight className="w-3 h-3" /></div>
                <div className="font-display text-[32px] text-(--ink)">{nextProject.name}</div>
              </Link>
            </MagneticWrapper>
          )}
        </div>
      </section>
    </div>
  )
}
