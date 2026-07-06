"use client"

import { CheckCircle2, MessageSquare, ShieldAlert, Sparkles } from "lucide-react"

export function ContactHeroWidget() {
  return (
    <div className="relative w-full max-w-[400px] max-[900px]:max-w-none rounded-[20px] border border-[var(--rule)] bg-[var(--paper)] p-[24px] overflow-hidden group shadow-[0_12px_40px_-12px_rgba(0,0,0,0.05)] backdrop-blur-md flex flex-col gap-4">
      {/* Decorative gradient flare */}
      <div className="absolute top-0 right-0 w-[120px] h-[120px] bg-gradient-to-br from-[var(--v3-accent-soft)] to-transparent rounded-full blur-[40px] opacity-60 pointer-events-none transition-all duration-500 group-hover:scale-125" />

      {/* Header */}
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-[var(--v3-accent)]" />
        <h4 className="m-0 font-mono text-[11px] tracking-[0.18em] text-[var(--ink-3)] uppercase">SLA & Status</h4>
      </div>

      {/* Status Item */}
      <div className="p-3.5 rounded-[12px] bg-[var(--bg-2)] border border-[var(--rule)] flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <div className="text-[10px] font-mono text-[var(--ink-3)] uppercase tracking-wider">Availability</div>
          <div className="text-[13px] font-semibold text-[var(--ink)]">Open to selective roles & contract work</div>
        </div>
      </div>

      {/* SLA Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-[12px] border border-[var(--rule)] bg-[var(--paper)]">
          <div className="text-[9px] font-mono text-[var(--ink-3)] uppercase tracking-wider">Response Time</div>
          <div className="text-[14px] font-bold text-[var(--ink)] mt-0.5">&lt; 12 hours</div>
        </div>
        <div className="p-3 rounded-[12px] border border-[var(--rule)] bg-[var(--paper)]">
          <div className="text-[9px] font-mono text-[var(--ink-3)] uppercase tracking-wider">Preferred channels</div>
          <div className="text-[14px] font-bold text-[var(--ink)] mt-0.5">Telegram / Mail</div>
        </div>
      </div>

      {/* Divider */}
      <div className="h-[1px] bg-[var(--rule)] w-full" />

      {/* Preferred topics */}
      <div>
        <div className="flex items-center gap-1.5 mb-2.5">
          <MessageSquare className="w-3.5 h-3.5 text-[var(--ink-3)]" />
          <span className="font-mono text-[9px] uppercase tracking-wider text-[var(--ink-3)]">Let&apos;s talk about</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <span className="px-[10px] py-[4px] rounded-full border border-[var(--rule)] bg-[var(--bg-2)] font-mono text-[9px] text-[var(--ink-2)]">zk-circuits</span>
          <span className="px-[10px] py-[4px] rounded-full border border-[var(--rule)] bg-[var(--bg-2)] font-mono text-[9px] text-[var(--ink-2)]">evm security</span>
          <span className="px-[10px] py-[4px] rounded-full border border-[var(--rule)] bg-[var(--bg-2)] font-mono text-[9px] text-[var(--ink-2)]">agriculture tech</span>
        </div>
      </div>
    </div>
  )
}
