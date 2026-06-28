"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { CASE_STUDIES } from "@/lib/case-studies"
import { ArrowUpRight } from "lucide-react"
import { getProjects, type Project } from "@/lib/projects"

const CATS = ["all", "web3", "product", "oss"] as const
type Cat = (typeof CATS)[number]

export function WorkClient(): React.ReactElement {
  const [filter, setFilter] = useState<Cat>("all")
  const [dbProjects, setDbProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const data = await getProjects()
      setDbProjects(data.filter(p => !p.is_hidden))
      setLoading(false)
    }
    load()
  }, [])

  const filteredCaseStudies =
    filter === "all" ? CASE_STUDIES : CASE_STUDIES.filter((p) => p.cat === filter)

  const filteredDbProjects =
    filter === "all" ? dbProjects : dbProjects.filter((p) => p.category === filter)

  return (
    <section className="v3-container pb-[160px] max-[720px]:pb-[100px]">
      <div className="v3-work-filters mb-[80px] max-[720px]:mb-[48px]">
        <span className="lbl">Filter archive</span>
        {CATS.map((c) => (
          <button
            key={c}
            className={`v3-filter-pill${filter === c ? " active" : ""}`}
            onClick={() => setFilter(c)}
          >
            {c === "all" ? "All" : c === "oss" ? "OSS" : c.charAt(0).toUpperCase() + c.slice(1)}
          </button>
        ))}
      </div>

      {/* Featured / Masterpieces */}
      <div className="mb-[120px] max-[720px]:mb-[80px]">
        <div className="grid grid-cols-[120px_1fr] max-[720px]:grid-cols-1 gap-[48px] max-[720px]:gap-[16px] items-baseline mb-[48px]">
          <div className="font-mono text-[11px] tracking-[0.18em] text-[var(--ink-3)] uppercase pt-[8px]">Selection</div>
          <h2 className="m-0 font-normal text-[clamp(44px,6vw,64px)] leading-[0.95] tracking-[-0.03em] text-[var(--ink)]">
            Selected <em>Masterpieces.</em>
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-[32px]">
          {filteredCaseStudies.map((p) => (
            <Link 
              key={p.slug} 
              href={`/work/${p.slug}`} 
              className="group relative grid grid-cols-[1.5fr_1fr] max-[920px]:grid-cols-1 gap-[64px] max-[920px]:gap-[32px] p-[48px] max-[720px]:p-[32px] rounded-[24px] border border-[var(--rule)] bg-[var(--paper)] overflow-hidden transition-all duration-300 hover:border-[var(--v3-accent-soft)] hover:shadow-[0_24px_64px_-12px_color-mix(in_oklab,var(--ink)_10%,transparent)]"
            >
              <div className="flex flex-col justify-center">
                <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--v3-accent)] mb-[16px]">{p.idx} · {p.year}</div>
                <h3 className="m-0 text-[clamp(32px,4vw,48px)] leading-[1.05] mb-[20px]">{p.name}</h3>
                <p className="text-[18px] text-[var(--ink-2)] leading-[1.6] m-0 max-w-[40ch] mb-[32px]">
                  {p.desc}
                </p>
                <div className="flex flex-wrap gap-[8px] mt-auto">
                  {p.stack.slice(0, 4).map(s => (
                    <span key={s} className="font-mono text-[10px] px-[12px] py-[5px] border border-[var(--rule)] rounded-[6px] text-[var(--ink-3)] uppercase">{s}</span>
                  ))}
                </div>
              </div>
              <div className="relative aspect-[16/10] rounded-[12px] overflow-hidden bg-[var(--bg-2)] border border-[var(--rule)]">
                {p.image ? (
                  <Image src={p.image} alt={p.name} fill className="object-cover transition-transform duration-[3000ms] group-hover:scale-105" sizes="(max-width: 920px) 100vw, 40vw" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center font-mono text-[12px] text-[var(--ink-4)] uppercase tracking-widest">Preview pending</div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Archive List */}
      <div>
        <div className="grid grid-cols-[120px_1fr] max-[720px]:grid-cols-1 gap-[48px] max-[720px]:gap-[16px] items-baseline mb-[48px]">
          <div className="font-mono text-[11px] tracking-[0.18em] text-[var(--ink-3)] uppercase pt-[8px]">Archive</div>
          <h2 className="m-0 font-normal text-[clamp(32px,4vw,48px)] leading-[0.95] tracking-[-0.03em] text-[var(--ink)]">
            Everything <em>shipped.</em>
          </h2>
        </div>

        {loading ? (
          <div className="py-[40px] font-mono text-[11px] text-[var(--ink-4)] uppercase tracking-widest">Synchronizing archive...</div>
        ) : (
          <div className="v3-work-list">
            {filteredDbProjects.length === 0 && filteredCaseStudies.length === 0 && (
              <div className="py-[40px] text-[var(--ink-3)] italic">No projects found in this category.</div>
            )}
            {filteredDbProjects.map((p) => (
              <div key={p.id} className="v3-work-row group">
                <div className="idx">{p.sort_order.toString().padStart(2, '0')}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="name">{p.title}</div>
                    {p.github_url && <a href={p.github_url} target="_blank" rel="noopener noreferrer" className="text-[10px] font-mono text-[var(--ink-4)] hover:text-[var(--v3-accent)] transition-colors">GH <ArrowUpRight className="inline w-3 h-3 ml-1" /></a>}
                  </div>
                  <div className="desc">{p.description}</div>
                </div>
                <div className="stack-mini hidden min-[921px]:flex">
                  {p.tags?.slice(0, 3).map((s) => (
                    <span key={s}>{s}</span>
                  ))}
                </div>
                <div className="yr">
                  <b>{new Date(p.created_at).getFullYear()}</b>
                  {p.category}
                </div>
                {p.live_url && (
                  <a href={p.live_url} target="_blank" rel="noopener noreferrer" className="v3-work-arrow flex items-center justify-center" aria-label="Visit live site"><ArrowUpRight className="w-5 h-5" /></a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
