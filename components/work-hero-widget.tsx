"use client"

import { Code2, Terminal, Shield, Cpu, Layers, Box } from "lucide-react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface TechItem {
  name: string
  icon: React.ComponentType<{ className?: string }>
  level: number // 0-100
  projects: number
  desc: string
  color: string
}

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  "TypeScript": Code2,
  "JavaScript": Code2,
  "Next.js": Layers,
  "Solidity": Shield,
  "Rust": Terminal,
  "C++": Cpu,
  "Go": Box,
  "default": Box
}

export function WorkHeroWidget() {
  const [hovered, setHovered] = useState<string | null>(null)
  const [techs, setTechs] = useState<TechItem[]>([
    // Fallback/loading state
    { name: "Loading...", icon: Box, level: 0, projects: 0, desc: "Fetching data from GitHub...", color: "var(--rule)" }
  ])

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/github/stats")
        if (res.ok) {
          const data = await res.json()
          if (data.languages && data.languages.length > 0) {
            const mapped = data.languages.map((l: any) => ({
              name: l.name,
              icon: ICON_MAP[l.name] || ICON_MAP["default"],
              level: l.level,
              projects: l.projects,
              desc: l.desc,
              color: l.color
            }))
            setTechs(mapped)
          }
        }
      } catch (e) {
        console.warn("Failed to fetch work stats:", e)
      }
    }
    void fetchStats()
  }, [])

  return (
    <div className="relative w-full max-w-[400px] max-[900px]:max-w-none rounded-[20px] border border-(--rule) bg-(--paper) p-6 overflow-hidden group shadow-[0_12px_40px_-12px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-between mb-6">
        <div className="m-0 font-mono text-xs tracking-wider text-muted-foreground uppercase font-medium">Core Stack Radar</div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-(--v3-accent)" />
          <span className="font-mono text-xs text-muted-foreground">Interactive metrics</span>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {techs.map((tech) => {
          const Icon = tech.icon
          const isHovered = hovered === tech.name

          return (
            <div
              key={tech.name}
              className="relative flex flex-col gap-1.5 cursor-help"
              onMouseEnter={() => setHovered(tech.name)}
              onMouseLeave={() => setHovered(null)}
            >
              <div className="flex items-center justify-between text-[13px]">
                <div className="flex items-center gap-2 font-display text-(--ink) font-medium transition-colors duration-200">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  <span>{tech.name}</span>
                </div>
                <span className="font-mono text-xs text-muted-foreground">
                  {tech.projects} {tech.projects === 1 ? "project" : "projects"}
                </span>
              </div>

              {/* Progress bar background */}
              <div className="w-full h-1.5 bg-(--rule)/40 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: tech.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${tech.level}%` }}
                  transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>

              {/* Interactive Tooltip Card inside the widget layout */}
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    transition={{ duration: 0.15 }}
                    className="absolute z-10 top-7 left-0 right-0 p-3 rounded-xl bg-(--bg-2) border border-(--rule) shadow-lg"
                  >
                    <p className="m-0 text-[11px] leading-normal text-secondary-foreground">
                      {tech.desc}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </div>
  )
}
