"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Code2, Terminal, Shield, Cpu, Layers } from "lucide-react"

interface TechItem {
  name: string
  icon: React.ComponentType<{ className?: string }>
  level: number // 0-100
  projects: number
  desc: string
  color: string
}

const TECHS: TechItem[] = [
  {
    name: "TypeScript",
    icon: Code2,
    level: 95,
    projects: 12,
    desc: "Primary language for high-fidelity frontends, Creator Suite tools, and type-safe systems.",
    color: "#3178C6"
  },
  {
    name: "Next.js",
    icon: Layers,
    level: 90,
    projects: 8,
    desc: "Framework of choice for SSR, SEO-optimized web apps, server actions, and edge routes.",
    color: "var(--ink)"
  },
  {
    name: "Solidity",
    icon: Shield,
    level: 80,
    projects: 3,
    desc: "Smart contracts shipped on EVM-compatible chains, protocol integrations, and audits.",
    color: "#E29051"
  },
  {
    name: "ZK / Cryptography",
    icon: Cpu,
    level: 70,
    projects: 2,
    desc: "ZK-snark applications, verification circuits, and privacy-preserving interactive frontends.",
    color: "var(--v3-accent)"
  },
  {
    name: "Rust",
    icon: Terminal,
    level: 75,
    projects: 4,
    desc: "Systems engineering, CLI builders, and performance-critical pipeline optimization.",
    color: "#DEA584"
  }
]

export function WorkHeroWidget() {
  const [hovered, setHovered] = useState<string | null>(null)

  return (
    <div className="relative w-full max-w-[400px] max-[900px]:max-w-none rounded-[20px] border border-(--rule) bg-(--paper) p-6 overflow-hidden group shadow-[0_12px_40px_-12px_rgba(0,0,0,0.05)] backdrop-blur-md">
      {/* Decorative gradient flare */}
      <div className="absolute top-0 right-0 w-30 h-30 bg-gradient-to-br from-(--v3-accent-soft) to-transparent rounded-full blur-10 opacity-60 pointer-events-none transition-all duration-500 group-hover:scale-125" />
      
      <div className="flex items-center justify-between mb-6">
        <h4 className="m-0 font-mono text-[11px] tracking-[0.18em] text-muted-foreground uppercase">Core Stack Radar</h4>
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-(--v3-accent) animate-pulse" />
          <span className="font-mono text-[10px] text-muted-foreground">Interactive metrics</span>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {TECHS.map((tech) => {
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
                <span className="font-mono text-[11px] text-muted-foreground">
                  {tech.projects} {tech.projects === 1 ? "project" : "projects"}
                </span>
              </div>

              {/* Progress bar background */}
              <div className="w-full h-1.5 bg-(--bg-2) rounded-full overflow-hidden border border-(--rule)">
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
