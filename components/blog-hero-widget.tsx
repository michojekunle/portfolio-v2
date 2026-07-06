"use client"

import { BookOpen, Sparkles, TrendingUp } from "lucide-react"

export function BlogHeroWidget() {
  const trendingTags = [
    { name: "Web3", count: 8 },
    { name: "Technical", count: 5 },
    { name: "ZKML", count: 3 },
    { name: "Reflection", count: 4 }
  ]

  return (
    <div className="relative w-full max-w-[400px] max-[900px]:max-w-none rounded-[20px] border border-[var(--rule)] bg-[var(--paper)] p-[24px] overflow-hidden group shadow-[0_12px_40px_-12px_rgba(0,0,0,0.05)] backdrop-blur-md flex flex-col gap-5">
      {/* Decorative gradient flare */}
      <div className="absolute top-0 right-0 w-[120px] h-[120px] bg-gradient-to-br from-[var(--v3-accent-soft)] to-transparent rounded-full blur-[40px] opacity-60 pointer-events-none transition-all duration-500 group-hover:scale-125" />

      {/* Section 1: Trending Topics */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-[var(--v3-accent)]" />
          <h4 className="m-0 font-mono text-[11px] tracking-[0.18em] text-[var(--ink-3)] uppercase">Trending Topics</h4>
        </div>
        <div className="flex flex-wrap gap-2">
          {trendingTags.map((tag) => (
            <span
              key={tag.name}
              className="inline-flex items-center gap-1.5 px-[12px] py-[6px] rounded-full border border-[var(--rule)] bg-[var(--bg-2)] font-mono text-[10px] text-[var(--ink-2)] transition-all duration-200 hover:border-[var(--ink-3)] hover:text-[var(--ink)] cursor-pointer"
            >
              #{tag.name.toLowerCase()}
              <span className="font-sans opacity-60">({tag.count})</span>
            </span>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="h-[1px] bg-[var(--rule)] w-full" />

      {/* Section 2: In the Pipeline */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-[var(--v3-accent)] animate-pulse" />
          <h4 className="m-0 font-mono text-[11px] tracking-[0.18em] text-[var(--ink-3)] uppercase">Writing pipeline</h4>
        </div>
        <div className="p-3 rounded-[12px] bg-[var(--bg-2)] border border-[var(--rule)]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-mono text-[9px] uppercase tracking-wider text-[var(--ink-3)]">Next Essay Draft</span>
            <span className="font-mono text-[9px] px-[6px] py-[2px] rounded bg-[color-mix(in_oklab,var(--v3-accent)_10%,transparent)] text-[var(--v3-accent)] font-semibold">80% ready</span>
          </div>
          <h5 className="m-0 font-display text-[13px] text-[var(--ink)] font-semibold mb-2">
            The Anatomy of a Zero-Knowledge Proof
          </h5>
          <p className="m-0 text-[11px] leading-[1.4] text-[var(--ink-3)]">
            A first-principles breakdown of SNARKs, math constraints, and proving systems. Currently revising the zk-circuit code examples.
          </p>
        </div>
      </div>

      {/* Section 3: Current Reading Recommendation */}
      <div className="flex items-center gap-2.5 p-3 rounded-[12px] border border-[var(--rule)] bg-[var(--paper)]">
        <BookOpen className="w-4 h-4 text-[var(--ink-3)] flex-shrink-0" />
        <div className="flex flex-col gap-0.5">
          <span className="font-mono text-[8px] uppercase tracking-wider text-[var(--ink-3)]">Currently Reading</span>
          <span className="text-[12px] font-medium text-[var(--ink)] line-clamp-1 leading-[1.3]">
            Zero to One by Peter Thiel
          </span>
        </div>
      </div>
    </div>
  )
}
