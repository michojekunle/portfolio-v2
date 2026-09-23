"use client"

import { CheckCircle2, MessageSquare, ShieldAlert, Sparkles } from "lucide-react"
import { useState, useEffect } from "react"

export function ContactHeroWidget() {
  const [status, setStatus] = useState<any>(null)
  
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
    void fetchStatus()
  }, [])
  return (
    <div className="relative w-full max-w-[400px] max-[900px]:max-w-none rounded-[20px] border border-(--rule) bg-(--paper) p-6 overflow-hidden group shadow-[0_12px_40px_-12px_rgba(0,0,0,0.05)] flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-(--v3-accent)" />
        <div className="m-0 font-mono text-xs tracking-wider text-muted-foreground uppercase font-medium">SLA & Status</div>
      </div>

      {/* Status Item */}
      <div className="pb-4 border-b border-(--rule) flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-(--bg-2) flex items-center justify-center flex-shrink-0">
          <CheckCircle2 className="w-4 h-4 text-(--ink)" />
        </div>
        <div>
          <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Availability</div>
          <div className="text-[13px] font-semibold text-(--ink)">{status?.status || "Open to selective roles & contract work"}</div>
        </div>
      </div>

      {/* SLA Metrics */}
      <div className="grid grid-cols-2 gap-4 pb-4 border-b border-(--rule)">
        <div>
          <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Response Time</div>
          <div className="text-[14px] font-bold text-(--ink) mt-1">&lt; 12 hours</div>
        </div>
        <div>
          <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Preferred channels</div>
          <div className="text-[14px] font-bold text-(--ink) mt-1">Telegram / Mail</div>
        </div>
      </div>

      {/* Preferred topics */}
      <div>
        <div className="flex items-center gap-1.5 mb-2.5">
          <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Let&apos;s talk about</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <span className="px-2.5 py-1 rounded-full border border-(--rule) font-mono text-xs text-secondary-foreground">zk-circuits</span>
          <span className="px-2.5 py-1 rounded-full border border-(--rule) font-mono text-xs text-secondary-foreground">evm security</span>
          <span className="px-2.5 py-1 rounded-full border border-(--rule) font-mono text-xs text-secondary-foreground">agriculture tech</span>
        </div>
      </div>
    </div>
  )
}
