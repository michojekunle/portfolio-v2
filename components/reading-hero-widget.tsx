"use client"

import { Award, BookOpen, Calendar, CheckCircle2 } from "lucide-react"

export function ReadingHeroWidget() {
  const goal = 12
  const completed = 8
  const currentStreak = 18
  const percentage = Math.round((completed / goal) * 100)
  
  // Calculate SVG stroke offset for a radius of 40
  const radius = 40
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div className="relative w-full max-w-[400px] max-[900px]:max-w-none rounded-[20px] border border-[var(--rule)] bg-[var(--paper)] p-[24px] overflow-hidden group shadow-[0_12px_40px_-12px_rgba(0,0,0,0.05)] backdrop-blur-md flex flex-col gap-4">
      {/* Decorative gradient flare */}
      <div className="absolute top-0 right-0 w-[120px] h-[120px] bg-gradient-to-br from-[var(--v3-accent-soft)] to-transparent rounded-full blur-[40px] opacity-60 pointer-events-none transition-all duration-500 group-hover:scale-125" />

      {/* Header */}
      <div className="flex items-center gap-2">
        <Award className="w-4 h-4 text-[var(--v3-accent)]" />
        <h4 className="m-0 font-mono text-[11px] tracking-[0.18em] text-[var(--ink-3)] uppercase">Reading Goal</h4>
      </div>

      {/* Content: Circular Progress and Stats */}
      <div className="flex items-center gap-6">
        {/* SVG Progress Circle */}
        <div className="relative flex items-center justify-center w-[90px] h-[90px] flex-shrink-0">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background track circle */}
            <circle
              cx="45"
              cy="45"
              r={radius}
              className="stroke-[var(--rule)] fill-none"
            />
            {/* Active progress circle */}
            <circle
              cx="45"
              cy="45"
              r={radius}
              className="stroke-[var(--ink)] fill-none transition-all duration-1000 ease-out"
              strokeWidth="5"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className="font-mono text-[16px] font-bold text-[var(--ink)]">{percentage}%</span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-col gap-2 flex-grow">
          <div>
            <div className="text-[10px] font-mono text-[var(--ink-3)] uppercase tracking-wider">Completed</div>
            <div className="text-[18px] font-semibold text-[var(--ink)] font-display flex items-baseline gap-1">
              {completed} <span className="text-[11px] text-[var(--ink-3)] font-mono">/ {goal} books</span>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div>
              <div className="text-[9px] font-mono text-[var(--ink-3)] uppercase tracking-wider">Streak</div>
              <div className="text-[13px] font-semibold text-[var(--ink)] font-mono">{currentStreak} days</div>
            </div>
            <div>
              <div className="text-[9px] font-mono text-[var(--ink-3)] uppercase tracking-wider">Current Year</div>
              <div className="text-[13px] font-semibold text-[var(--ink)] font-mono">2026</div>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="h-[1px] bg-[var(--rule)] w-full" />

      {/* Footer / Status details */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-[12px] text-[var(--ink-2)]">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
          <span>Ahead of schedule: +2 books ahead of pace</span>
        </div>
        <div className="flex items-center gap-2 text-[12px] text-[var(--ink-2)]">
          <Calendar className="w-3.5 h-3.5 text-[var(--ink-3)] flex-shrink-0" />
          <span>Last read tracked 4 hours ago</span>
        </div>
      </div>
    </div>
  )
}
