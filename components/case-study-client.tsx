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
      <section className="v3-case-hero v3-container relative z-10 pt-[160px] pb-[80px] max-[720px]:pt-[80px] max-[720px]:pb-[56px] border-b border-[var(--rule)]">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="font-mono text-[11px] tracking-[0.18em] uppercase text-[var(--ink-3)] mb-[24px] flex items-center gap-[12px]"
        >
          <Link href="/work" className="hover:text-[var(--ink)] transition-colors flex items-center gap-1"><ArrowLeft className="w-3 h-3" /> Work</Link>
          <div className="w-[4px] h-[4px] bg-[var(--rule)] rounded-full" />
          Project {p.idx}
        </motion.div>
        
        <div className="flex flex-wrap gap-[48px] max-[720px]:gap-[24px] mb-[64px]">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="flex flex-col gap-[8px]">
            <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--ink-3)]">Role</div>
            <div className="text-[15px] font-medium text-[var(--ink)]">{p.role}</div>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="flex flex-col gap-[8px]">
            <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--ink-3)]">Duration</div>
            <div className="text-[15px] font-medium text-[var(--ink)]">{p.duration}</div>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="flex flex-col gap-[8px]">
            <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--ink-3)]">Team</div>
            <div className="text-[15px] font-medium text-[var(--ink)]">{p.team}</div>
          </motion.div>
        </div>

        <h1 className="m-0 font-display font-normal text-[clamp(40px,12vw,140px)] leading-[0.85] tracking-[-0.04em] text-[var(--ink)] mb-[32px] text-balance fvs-display break-words hyphens-auto">
          {p.name.split(" ").map((w, j, arr) => (
            <motion.span
              key={j}
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: "0%", opacity: 1 }}
              transition={{ duration: 0.8, delay: j * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="inline-block mr-[16px] max-[720px]:mr-[8px]"
            >
              {j === arr.length - 1 ? <em className="text-[var(--v3-accent)] fvs-soft italic">{w}.</em> : w}
            </motion.span>
          ))}
        </h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-[clamp(20px,3vw,32px)] text-[var(--ink-2)] font-light leading-[1.4] max-w-[800px]"
        >
          {p.lede}
        </motion.p>
      </section>

      {/* Image with Parallax */}
      <section ref={imageRef} className="v3-container mb-[120px] max-[720px]:mb-[80px] overflow-hidden rounded-[24px]">
        {p.image ? (
          <motion.div style={{ scale: imageScale, y: imageY }} className="relative w-full aspect-[16/9] bg-[var(--bg-2)] origin-center">
            <Image src={p.image} alt={p.name} fill className="object-cover object-top" sizes="(max-width: 1320px) 100vw, 1320px" priority />
          </motion.div>
        ) : (
          <div className="w-full aspect-[16/9] bg-[var(--bg-2)] flex items-center justify-center border border-[var(--rule)] rounded-[24px]">
            <span className="font-mono text-[12px] text-[var(--ink-3)] uppercase tracking-[0.2em]">Media Asset Pending</span>
          </div>
        )}
      </section>

      {/* Body */}
      <section className="v3-section v3-container grid grid-cols-[280px_1fr] max-[920px]:grid-cols-1 gap-[80px] max-[920px]:gap-[48px] items-start pb-[120px]">
        {/* Sticky Sidebar */}
        <aside className="sticky top-[120px] flex flex-col gap-[48px] border-l border-[var(--rule)] pl-[24px]">
          <div>
            <h5 className="font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--ink-3)] mb-[16px]">Stack</h5>
            <ul className="flex flex-col gap-[8px] m-0 p-0 list-none">
              {p.stack.map((s) => <li key={s} className="text-[14px] font-medium text-[var(--ink)]">{s}</li>)}
            </ul>
          </div>
          
          {p.live && (
            <div>
              <h5 className="font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--ink-3)] mb-[16px]">Live</h5>
              <MagneticWrapper strength={10}>
                <a href={`https://${p.live.replace(/^https?:\/\//, "")}`} target="_blank" rel="noopener noreferrer" className="inline-block text-[14px] font-medium text-[var(--v3-accent)] hover:text-[var(--ink)] transition-colors underline decoration-[var(--rule)] underline-offset-[4px]">
                  {p.live.replace(/^https?:\/\//, "")} <ArrowUpRight className="inline w-3 h-3 ml-1" />
                </a>
              </MagneticWrapper>
            </div>
          )}
          
          <div>
            <h5 className="font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--ink-3)] mb-[16px]">Year</h5>
            <div className="text-[14px] font-medium text-[var(--ink)]">{p.year}</div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex flex-col gap-[80px] max-[720px]:gap-[64px]">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8 }}>
            <h2 className="font-display font-light text-[clamp(40px,5vw,64px)] leading-[1] text-[var(--ink)] mb-[32px] tracking-[-0.03em] fvs-display">
              The <em className="text-[var(--v3-accent)] italic fvs-soft">problem.</em>
            </h2>
            <p className="text-[18px] text-[var(--ink-2)] leading-[1.7] max-w-[65ch]">{p.problem}</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8 }}>
            <h2 className="font-display font-light text-[clamp(40px,5vw,64px)] leading-[1] text-[var(--ink)] mb-[32px] tracking-[-0.03em] fvs-display">
              The <em className="text-[var(--v3-accent)] italic fvs-soft">approach.</em>
            </h2>
            <p className="text-[18px] text-[var(--ink-2)] leading-[1.7] max-w-[65ch]">{p.approach}</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8 }}>
            <h2 className="font-display font-light text-[clamp(40px,5vw,64px)] leading-[1] text-[var(--ink)] mb-[40px] tracking-[-0.03em] fvs-display">
              The <em className="text-[var(--v3-accent)] italic fvs-soft">process.</em>
            </h2>
            <div className="flex flex-col gap-[32px]">
              {p.process.map((step, i) => (
                <div key={i} className="flex gap-[24px] items-start border-t border-[var(--rule)] pt-[24px]">
                  <div className="font-mono text-[14px] text-[var(--v3-accent)] pt-[4px]">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <p className="m-0 text-[18px] text-[var(--ink-2)] leading-[1.7] max-w-[60ch]">{step}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8 }}>
            <h2 className="font-display font-light text-[clamp(40px,5vw,64px)] leading-[1] text-[var(--ink)] mb-[48px] tracking-[-0.03em] fvs-display">
              The <em className="text-[var(--v3-accent)] italic fvs-soft">outcome.</em>
            </h2>
            <div className="grid grid-cols-3 max-[920px]:grid-cols-1 gap-[24px]">
              {p.outcomes.map((o, i) => (
                <div key={i} className="bg-[var(--paper)] border border-[var(--rule)] rounded-[20px] p-[32px] flex flex-col gap-[16px] hover:border-[var(--v3-accent-soft)] transition-colors">
                  <div className="font-display font-light text-[clamp(48px,5vw,64px)] text-[var(--v3-accent)] leading-[1]">
                    <AnimatedCounter value={o.n} />
                  </div>
                  <div className="text-[16px] font-medium text-[var(--ink)]">{o.l}</div>
                  <div className="text-[14px] text-[var(--ink-3)] leading-[1.5]">{o.d}</div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            whileInView={{ opacity: 1, scale: 1 }} 
            viewport={{ once: true, margin: "-100px" }} 
            transition={{ duration: 0.8 }}
            className="my-[80px] p-[64px] max-[720px]:p-[32px] bg-[var(--ink)] text-[var(--bg)] rounded-[24px] relative overflow-hidden"
          >
            <div className="font-display text-[120px] leading-[0.5] text-[var(--bg-2)] opacity-20 absolute top-[40px] left-[24px]">
              ❝
            </div>
            <h2 className="font-display font-light text-[24px] text-[var(--ink-3)] mb-[24px] tracking-[0.05em] uppercase border-b border-[var(--bg-2)]/20 pb-[24px] relative z-10">
              What I learned
            </h2>
            <p className="font-display font-light text-[clamp(28px,4vw,48px)] leading-[1.3] m-0 fvs-text italic relative z-10">
              {p.learned}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Next project nav */}
      <section className="v3-container border-t border-[var(--rule)]">
        <div className="flex max-[720px]:flex-col justify-between items-center py-[80px] max-[720px]:py-[48px] max-[720px]:gap-[48px]">
          <MagneticWrapper strength={20}>
            <Link href="/work" className="group flex flex-col items-center gap-[8px]">
              <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--ink-3)] group-hover:text-[var(--v3-accent)] transition-colors flex items-center gap-1"><ArrowLeft className="w-3 h-3" /> All work</div>
              <div className="font-display text-[32px] text-[var(--ink)]">Index</div>
            </Link>
          </MagneticWrapper>
          
          {nextProject && (
            <MagneticWrapper strength={20}>
              <Link href={`/work/${nextProject.slug}`} className="group flex flex-col items-center gap-[8px]">
                <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--ink-3)] group-hover:text-[var(--v3-accent)] transition-colors flex items-center gap-1">Next project <ArrowRight className="w-3 h-3" /></div>
                <div className="font-display text-[32px] text-[var(--ink)]">{nextProject.name}</div>
              </Link>
            </MagneticWrapper>
          )}
        </div>
      </section>
    </div>
  )
}
