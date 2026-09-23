"use client"

import { Award, BookOpen, Calendar, CheckCircle2 } from "lucide-react"
import { useState, useEffect } from "react"

export function ReadingHeroWidget() {
  const [stats, setStats] = useState({ goal: 12, completed: 8, currentStreak: 18, percentage: 67 })
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/reading/stats")
        if (res.ok) {
          const data = await res.json()
          setStats(data)
        }
      } catch (e) {
        console.warn("Failed to fetch reading stats:", e)
      }
    }
    void fetchStats()
  }, [])
  
  const { goal, completed, currentStreak, percentage } = stats
  
  // Calculate SVG stroke offset for a radius of 40
  const radius = 40
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div className="relative w-full max-w-[400px] max-[900px]:max-w-none rounded-[20px] border border-(--rule) bg-(--paper) p-6 overflow-hidden flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Award className="w-4 h-4 text-(--v3-accent)" />
        <div className="font-mono text-xs tracking-wider text-muted-foreground uppercase">Reading Goal</div>
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
              className="stroke-(--rule) fill-none"
            />
            {/* Active progress circle */}
            <circle
              cx="45"
              cy="45"
              r={radius}
              className="stroke-(--ink) fill-none transition-all duration-1000 ease-out"
              strokeWidth="5"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className="font-mono text-[16px] font-bold text-(--ink)">{percentage}%</span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-col gap-2 flex-grow">
          <div>
            <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Completed</div>
            <div className="text-[18px] font-semibold text-(--ink) font-display flex items-baseline gap-1">
              {completed} <span className="text-xs text-muted-foreground font-mono">/ {goal} books</span>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div>
              <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Streak</div>
              <div className="text-[13px] font-semibold text-(--ink) font-mono">{currentStreak} days</div>
            </div>
            <div>
              <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Current Year</div>
              <div className="text-[13px] font-semibold text-(--ink) font-mono">2026</div>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="h-0.25 bg-(--rule) w-full" />

      {/* Footer / Status details */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-[12px] text-secondary-foreground">
          <CheckCircle2 className="w-3.5 h-3.5 text-(--ink) flex-shrink-0" />
          <span>Ahead of schedule: +2 books ahead of pace</span>
        </div>
        <div className="flex items-center gap-2 text-[12px] text-secondary-foreground">
          <Calendar className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
          <span>Last read tracked 4 hours ago</span>
        </div>
      </div>
    </div>
  )
}
