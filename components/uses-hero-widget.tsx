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
    <div className="relative w-full max-w-[400px] max-[900px]:max-w-none rounded-[20px] border border-(--rule) bg-(--paper) p-6 overflow-hidden flex flex-col gap-4">
      {/* Terminal window chrome */}
      <div className="flex items-center justify-between pb-2 border-b border-(--rule)">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
        </div>
        <div className="flex items-center gap-1 text-muted-foreground font-mono text-xs uppercase tracking-wider">
          <Terminal className="w-3 h-3" />
          <span>system_fetch.json</span>
        </div>
      </div>

      {/* Terminal Code Area */}
      <div className="font-mono text-xs leading-[1.6] text-secondary-foreground py-1 select-none">
        <div className="text-muted-foreground">{"{"}</div>
        {specLines.map((line, index) => (
          <div key={line.label} className="pl-4 flex">
            <span className="text-(--v3-accent)">"{line.label}"</span>
            <span className="text-muted-foreground mx-1">:</span>
            <span className="text-(--ink) break-all">{line.value}</span>
            {index < specLines.length - 1 && <span className="text-muted-foreground">,</span>}
          </div>
        ))}
        <div className="text-muted-foreground">{"}"}</div>
      </div>

      {/* Prompt mimic */}
      <div className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground pl-1">
        <span className="text-(--v3-accent)">~</span>
        <span className="text-secondary-foreground">$</span>
        <span className="text-(--ink)">_</span>
      </div>
    </div>
  )
}
