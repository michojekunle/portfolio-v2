"use client"

import { useEffect, useState } from "react"
import { BookOpen, Sparkles, TrendingUp } from "lucide-react"

export function BlogHeroWidget() {
  const [status, setStatus] = useState<any>(null)
  const [stats, setStats] = useState<{ trendingTags: { name: string; count: number }[]; pipelineTitle: string; pipelineExcerpt: string } | null>(null)
  
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
    
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/blog/hero-stats")
        if (res.ok) {
          const data = await res.json()
          setStats(data)
        }
      } catch (e) {
        console.warn("Failed to fetch blog stats:", e)
      }
    }
    
    void fetchStatus()
    void fetchStats()
  }, [])

  const trendingTags = stats?.trendingTags || []

  return (
    <div className="relative w-full max-w-[400px] max-[900px]:max-w-none rounded-[20px] border border-(--rule) bg-(--paper) p-6 overflow-hidden flex flex-col gap-5">
      {/* Section 1: Trending Topics */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-(--v3-accent)" />
          <div className="font-mono text-xs tracking-wider text-muted-foreground uppercase">Trending Topics</div>
        </div>
        <div className="flex flex-wrap gap-2">
          {trendingTags.map((tag) => (
            <span
              key={tag.name}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-(--rule) bg-(--bg-2) font-mono text-xs text-secondary-foreground transition-all duration-200 hover:border-muted-foreground hover:text-(--ink) cursor-pointer"
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
          <Sparkles className="w-4 h-4 text-(--v3-accent)" />
          <div className="font-mono text-xs tracking-wider text-muted-foreground uppercase">Writing pipeline</div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Next Essay Draft</span>
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-[color-mix(in_oklab,var(--v3-accent)_10%,transparent)] text-(--v3-accent) font-semibold">80% ready</span>
          </div>
          <div className="font-display text-[14px] text-(--ink) font-semibold">
            {stats?.pipelineTitle || "Gathering thoughts..."}
          </div>
          <p className="m-0 text-xs leading-relaxed text-muted-foreground">
            {stats?.pipelineExcerpt || "Outlining the next deep dive."}
          </p>
        </div>
      </div>

      {/* Section 3: Current Reading Recommendation */}
      <div className="flex items-center gap-3 pt-3 border-t border-(--rule)">
        <BookOpen className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        <div className="flex flex-col gap-0.5">
          <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Currently Reading</span>
          <span className="text-[13px] font-medium text-(--ink) line-clamp-1 leading-[1.3]">
            {status?.currently_reading || "Zero to One by Peter Thiel"}
          </span>
        </div>
      </div>
    </div>
  )
}
