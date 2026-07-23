"use client"

import { useEffect, useState } from "react"
import { BookOpen, Sparkles, TrendingUp } from "lucide-react"

export function BlogHeroWidget() {
  const [status, setStatus] = useState<any>(null)
  
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch("/api/profile/status")
        if (res.ok) {
          const data = await res.json()
          setStatus(data)
        }
      } catch (e) {
        console.warn("Failed to fetch profile status:", e)
      }
    }
    void fetchStatus()
  }, [])

  const trendingTags = [
    { name: "Web3", count: 8 },
    { name: "Technical", count: 5 },
    { name: "ZKML", count: 3 },
    { name: "Reflection", count: 4 }
  ]

  return (
    <div className="relative w-full max-w-[400px] max-[900px]:max-w-none rounded-[20px] border border-(--rule) bg-(--paper) p-6 overflow-hidden group shadow-[0_12px_40px_-12px_rgba(0,0,0,0.05)] backdrop-blur-md flex flex-col gap-5">
      {/* Decorative gradient flare */}
      <div className="absolute top-0 right-0 w-30 h-30 bg-gradient-to-br from-(--v3-accent-soft) to-transparent rounded-full blur-10 opacity-60 pointer-events-none transition-all duration-500 group-hover:scale-125" />

      {/* Section 1: Trending Topics */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-(--v3-accent)" />
          <h4 className="m-0 font-mono text-[11px] tracking-[0.18em] text-muted-foreground uppercase">Trending Topics</h4>
        </div>
        <div className="flex flex-wrap gap-2">
          {trendingTags.map((tag) => (
            <span
              key={tag.name}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-(--rule) bg-(--bg-2) font-mono text-[10px] text-secondary-foreground transition-all duration-200 hover:border-muted-foreground hover:text-(--ink) cursor-pointer"
            >
              #{tag.name.toLowerCase()}
              <span className="font-sans opacity-60">({tag.count})</span>
            </span>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="h-0.25 bg-(--rule) w-full" />

      {/* Section 2: In the Pipeline */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-(--v3-accent) animate-pulse" />
          <h4 className="m-0 font-mono text-[11px] tracking-[0.18em] text-muted-foreground uppercase">Writing pipeline</h4>
        </div>
        <div className="p-3 rounded-xl bg-(--bg-2) border border-(--rule)">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Next Essay Draft</span>
            <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-[color-mix(in_oklab,var(--v3-accent)_10%,transparent)] text-(--v3-accent) font-semibold">80% ready</span>
          </div>
          <h5 className="m-0 font-display text-[13px] text-(--ink) font-semibold mb-2">
            The Anatomy of a Zero-Knowledge Proof
          </h5>
          <p className="m-0 text-[11px] leading-[1.4] text-muted-foreground">
            A first-principles breakdown of SNARKs, math constraints, and proving systems. Currently revising the zk-circuit code examples.
          </p>
        </div>
      </div>

      {/* Section 3: Current Reading Recommendation */}
      <div className="flex items-center gap-2.5 p-3 rounded-xl border border-(--rule) bg-(--paper)">
        <BookOpen className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        <div className="flex flex-col gap-0.5">
          <span className="font-mono text-[8px] uppercase tracking-wider text-muted-foreground">Currently Reading</span>
          <span className="text-[12px] font-medium text-(--ink) line-clamp-1 leading-[1.3]">
            {status?.currently_reading || "Zero to One by Peter Thiel"}
          </span>
        </div>
      </div>
    </div>
  )
}
