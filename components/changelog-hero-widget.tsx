"use client"

import { GitCommit, GitBranch, Shield, Zap } from "lucide-react"

export function ChangelogHeroWidget() {
  const commitStats = {
    branch: "develop",
    commitsThisWeek: 14,
    activeRepos: 4,
    status: "healthy"
  }

  // Mini sparkline data representing commits per day for the last 7 days
  const activityData = [4, 8, 3, 5, 2, 7, 6]
  const maxVal = Math.max(...activityData)

  return (
    <div className="relative w-full max-w-[400px] max-[900px]:max-w-none rounded-[20px] border border-[var(--rule)] bg-[var(--paper)] p-[24px] overflow-hidden group shadow-[0_12px_40px_-12px_rgba(0,0,0,0.05)] backdrop-blur-md flex flex-col gap-4">
      {/* Decorative gradient flare */}
      <div className="absolute top-0 right-0 w-[120px] h-[120px] bg-gradient-to-br from-[var(--v3-accent-soft)] to-transparent rounded-full blur-[40px] opacity-60 pointer-events-none transition-all duration-500 group-hover:scale-125" />

      {/* Header */}
      <div className="flex items-center gap-2">
        <GitCommit className="w-4 h-4 text-[var(--v3-accent)]" />
        <h4 className="m-0 font-mono text-[11px] tracking-[0.18em] text-[var(--ink-3)] uppercase">Git Activity</h4>
      </div>

      {/* Grid of stats */}
      <div className="grid grid-cols-2 gap-3">
        {/* Active Branch */}
        <div className="p-3 rounded-[12px] bg-[var(--bg-2)] border border-[var(--rule)] flex flex-col gap-1">
          <span className="font-mono text-[8px] uppercase tracking-wider text-[var(--ink-3)] flex items-center gap-1">
            <GitBranch className="w-3 h-3 text-[var(--ink-3)]" /> Active Branch
          </span>
          <span className="text-[13px] font-mono font-semibold text-[var(--ink)]">
            {commitStats.branch}
          </span>
        </div>

        {/* Status */}
        <div className="p-3 rounded-[12px] bg-[var(--bg-2)] border border-[var(--rule)] flex flex-col gap-1">
          <span className="font-mono text-[8px] uppercase tracking-wider text-[var(--ink-3)] flex items-center gap-1">
            <Shield className="w-3 h-3 text-[var(--ink-3)]" /> Build Pipeline
          </span>
          <span className="text-[13px] font-mono font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> passing
          </span>
        </div>
      </div>

      {/* Section 2: Commits Sparkline */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="font-mono text-[9px] uppercase tracking-wider text-[var(--ink-3)]">Weekly Commit Frequency</span>
          <span className="font-mono text-[10px] font-semibold text-[var(--ink-2)]">{commitStats.commitsThisWeek} commits</span>
        </div>
        
        {/* Sparkline chart bar grid */}
        <div className="flex items-end justify-between h-[48px] px-2 py-1 rounded-[12px] bg-[var(--bg-2)] border border-[var(--rule)]">
          {activityData.map((val, idx) => {
            const pct = (val / maxVal) * 100
            return (
              <div key={idx} className="group/bar flex flex-col items-center gap-1 w-[8%] h-full justify-end">
                <div 
                  style={{ height: `${pct}%` }}
                  className="w-full bg-[var(--ink-3)] group-hover/bar:bg-[var(--v3-accent)] rounded-t-[2px] transition-all duration-300 min-h-[4px]"
                />
              </div>
            )
          })}
        </div>
      </div>

      {/* Divider */}
      <div className="h-[1px] bg-[var(--rule)] w-full" />

      {/* Footer: Live syncing status */}
      <div className="flex items-center gap-2 text-[11px] text-[var(--ink-2)]">
        <Zap className="w-3.5 h-3.5 text-[var(--v3-accent)]" />
        <span>Synced with GitHub GraphQL API v4</span>
      </div>
    </div>
  )
}
