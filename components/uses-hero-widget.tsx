"use client"

import { Terminal } from "lucide-react"

export function UsesHeroWidget() {
  const specLines = [
    { label: "os", value: '"macOS Sequoia 15.4"' },
    { label: "host", value: '"MacBook Pro M3 Pro"' },
    { label: "kernel", value: '"Darwin 24.3.0 arm64"' },
    { label: "shell", value: '"zsh 5.9 (omz)"' },
    { label: "terminal", value: '"Warp / Alacritty"' },
    { label: "editor", value: '"VS Code (Vim mode) / Neovim"' },
    { label: "font", value: '"Geist Mono / Fira Code"' },
    { label: "cpu", value: '"Apple M3 Pro (12-core)"' },
    { label: "memory", value: '"36 GB Unified Memory"' }
  ]

  return (
    <div className="relative w-full max-w-[400px] max-[900px]:max-w-none rounded-[20px] border border-(--rule) bg-(--paper) p-6 overflow-hidden group shadow-[0_12px_40px_-12px_rgba(0,0,0,0.05)] backdrop-blur-md flex flex-col gap-4">
      {/* Background terminal glow */}
      <div className="absolute top-0 right-0 w-35 h-35 bg-gradient-to-br from-(--v3-accent-soft) to-transparent rounded-full blur-10 opacity-40 pointer-events-none transition-all duration-500 group-hover:scale-125" />

      {/* Terminal window chrome */}
      <div className="flex items-center justify-between pb-2 border-b border-(--rule)">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
        </div>
        <div className="flex items-center gap-1 text-muted-foreground font-mono text-[9px] uppercase tracking-wider">
          <Terminal className="w-3 h-3" />
          <span>system_fetch.json</span>
        </div>
      </div>

      {/* Terminal Code Area */}
      <div className="font-mono text-[11px] leading-[1.6] text-secondary-foreground bg-(--bg-2) p-4 rounded-xl border border-(--rule) select-none">
        <div className="text-muted-foreground">{"{"}</div>
        {specLines.map((line, index) => (
          <div key={line.label} className="pl-4 flex">
            <span className="text-(--v3-accent)">"{line.label}"</span>
            <span className="text-muted-foreground mx-1">:</span>
            <span className="text-emerald-600 dark:text-emerald-400 break-all">{line.value}</span>
            {index < specLines.length - 1 && <span className="text-muted-foreground">,</span>}
          </div>
        ))}
        <div className="text-muted-foreground">{"}"}</div>
      </div>

      {/* Prompt mimic */}
      <div className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground pl-1">
        <span className="text-(--v3-accent)">~</span>
        <span className="text-secondary-foreground">$</span>
        <span className="text-(--ink) animate-[cursor-blink_1.2s_step-start_infinite]">_</span>
      </div>

      <style jsx>{`
        @keyframes cursor-blink {
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  )
}
