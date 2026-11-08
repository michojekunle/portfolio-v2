"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { CASE_STUDIES } from "@/lib/case-studies"
import { ArrowUpRight } from "lucide-react"
import { getProjects, type Project } from "@/lib/projects"
import { ProjectLogo } from "@/components/project-logo"

const CATS = ["all", "product", "web3", "systems", "oss"] as const
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

  // Archive rows that already have a full case study above are not repeated.
  const caseStudyNames = new Set([
    ...CASE_STUDIES.map((cs) => cs.name.toLowerCase()),
    "zk",
    "zamir",
  ])
  const archiveProjects = dbProjects.filter((p) => !caseStudyNames.has(p.title.toLowerCase()))
  const filteredDbProjects =
    filter === "all" ? archiveProjects : archiveProjects.filter((p) => p.category === filter)

  return (
    <section className="v3-container pb-40 max-[720px]:pb-[100px]">
      <div className="v3-work-filters mb-20 max-[720px]:mb-12">
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
      <div className="mb-30 max-[720px]:mb-20">
        <div className="mb-12">
          <h2 className="m-0 font-normal text-[clamp(44px,6vw,64px)] leading-[0.95] tracking-[-0.03em] text-(--ink)">
            Selected <em>work.</em>
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {filteredCaseStudies.map((p) => (
            <Link 
              key={p.slug} 
              href={`/work/${p.slug}`} 
              className="group relative grid grid-cols-[1.5fr_1fr] max-[920px]:grid-cols-1 gap-12 max-[920px]:gap-6 p-10 max-[920px]:p-7 max-[480px]:p-5 rounded-2xl border border-(--rule) bg-(--paper) overflow-hidden transition-all duration-300 hover:border-(--v3-accent-soft) hover:shadow-[0_20px_48px_-12px_color-mix(in_oklab,var(--ink)_8%,transparent)]"
            >
              <div className="flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-4">
                  <ProjectLogo name={p.name} logo={p.logo} logoBg={p.logoBg} size={36} />
                  <span className="font-mono text-[12px] tracking-[0.04em] text-(--v3-accent)">{p.tag} · {p.year}</span>
                </div>
                <h3 className="m-0 text-[clamp(26px,3.5vw,40px)] leading-[1.1] mb-3 text-(--ink)">{p.name}</h3>
                <p className="text-[16px] text-secondary-foreground leading-[1.6] m-0 max-w-[46ch] mb-6">
                  {p.desc}
                </p>
                <div className="flex flex-wrap gap-2 mt-auto">
                  {p.stack.slice(0, 4).map(s => (
                    <span key={s} className="font-mono text-[11px] px-2.5 py-1 border border-(--rule) rounded-md text-muted-foreground">{s}</span>
                  ))}
                </div>
              </div>
              <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-(--bg-2) border border-(--rule)">
                {p.image ? (
                  <Image
                    src={p.image}
                    alt={p.name}
                    fill
                    className="object-cover transition-transform duration-[2000ms] group-hover:scale-105"
                    sizes="(max-width: 920px) 100vw, 40vw"
                    style={{ objectPosition: p.imagePosition }}
                    unoptimized={p.image.endsWith(".svg")}
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-start justify-end gap-2 p-8 max-[720px]:p-6">
                    <span className="font-display font-light text-[clamp(56px,7vw,96px)] leading-none tracking-[-0.03em] text-(--v3-accent) fvs-display">
                      {p.outcomes[0]?.n}
                    </span>
                    <span className="text-[16px] text-secondary-foreground">{p.outcomes[0]?.l}</span>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Archive List */}
      <div>
        <div className="mb-12">
          <h2 className="m-0 font-normal text-[clamp(32px,4vw,48px)] leading-[0.95] tracking-[-0.03em] text-(--ink)">
            Everything <em>shipped.</em>
          </h2>
        </div>

        {loading ? (
          <div className="py-10 font-mono text-xs text-muted-foreground tracking-wider">Synchronizing archive...</div>
        ) : (
          <div className="v3-work-list">
            {filteredDbProjects.length === 0 && filteredCaseStudies.length === 0 && (
              <div className="py-10 text-muted-foreground italic">No projects found in this category.</div>
            )}
            {filteredDbProjects.map((p, i) => (
              <div key={p.id} className="v3-work-row group">
                <div className="idx">{String(i + 1).padStart(2, '0')}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="name">{p.title}</div>
                    {p.github_url && <a href={p.github_url} target="_blank" rel="noopener noreferrer" className="text-xs font-mono text-muted-foreground hover:text-(--v3-accent) transition-colors">GH <ArrowUpRight className="inline w-3 h-3 ml-1" /></a>}
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
