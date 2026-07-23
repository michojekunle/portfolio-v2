"use client"

import { CheckCircle2, MessageSquare, ShieldAlert, Sparkles } from "lucide-react"

export function ContactHeroWidget() {
  return (
    <div className="relative w-full max-w-[400px] max-[900px]:max-w-none rounded-[20px] border border-(--rule) bg-(--paper) p-6 overflow-hidden group shadow-[0_12px_40px_-12px_rgba(0,0,0,0.05)] backdrop-blur-md flex flex-col gap-4">
      {/* Decorative gradient flare */}
      <div className="absolute top-0 right-0 w-30 h-30 bg-gradient-to-br from-(--v3-accent-soft) to-transparent rounded-full blur-10 opacity-60 pointer-events-none transition-all duration-500 group-hover:scale-125" />

      {/* Header */}
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-(--v3-accent)" />
        <h4 className="m-0 font-mono text-[11px] tracking-[0.18em] text-muted-foreground uppercase">SLA & Status</h4>
      </div>

      {/* Status Item */}
      <div className="p-3.5 rounded-xl bg-(--bg-2) border border-(--rule) flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Availability</div>
          <div className="text-[13px] font-semibold text-(--ink)">Open to selective roles & contract work</div>
        </div>
      </div>

      {/* SLA Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-xl border border-(--rule) bg-(--paper)">
          <div className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider">Response Time</div>
          <div className="text-[14px] font-bold text-(--ink) mt-0.5">&lt; 12 hours</div>
        </div>
        <div className="p-3 rounded-xl border border-(--rule) bg-(--paper)">
          <div className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider">Preferred channels</div>
          <div className="text-[14px] font-bold text-(--ink) mt-0.5">Telegram / Mail</div>
        </div>
      </div>

      {/* Divider */}
      <div className="h-0.25 bg-(--rule) w-full" />

      {/* Preferred topics */}
      <div>
        <div className="flex items-center gap-1.5 mb-2.5">
          <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Let&apos;s talk about</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <span className="px-2.5 py-1 rounded-full border border-(--rule) bg-(--bg-2) font-mono text-[9px] text-secondary-foreground">zk-circuits</span>
          <span className="px-2.5 py-1 rounded-full border border-(--rule) bg-(--bg-2) font-mono text-[9px] text-secondary-foreground">evm security</span>
          <span className="px-2.5 py-1 rounded-full border border-(--rule) bg-(--bg-2) font-mono text-[9px] text-secondary-foreground">agriculture tech</span>
        </div>
      </div>
    </div>
  )
}
