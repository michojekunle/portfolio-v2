"use client"

import { MessageSquare, Users } from "lucide-react"
import { useState, useEffect } from "react"

export function GuestbookHeroWidget() {
  const [highlights, setHighlights] = useState<{ name: string; msg: string; date: string }[]>([])
  
  useEffect(() => {
    const fetchGuestbook = async () => {
      try {
        const res = await fetch("/api/guestbook")
        if (res.ok) {
          const data = await res.json()
          const mapped = data.slice(0, 4).map((entry: any) => {
            const date = new Date(entry.created_at)
            const daysAgo = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24))
            const dateStr = daysAgo === 0 ? "today" : daysAgo === 1 ? "1 day ago" : `${daysAgo} days ago`
            return {
              name: entry.name,
              msg: entry.message,
              date: dateStr
            }
          })
          setHighlights(mapped)
        }
      } catch (e) {
        console.warn("Failed to fetch guestbook:", e)
      }
    }
    void fetchGuestbook()
  }, [])
  
  const displayHighlights = highlights.length > 0 ? highlights : [
    { name: "Loading...", msg: "Fetching recent entries...", date: "" }
  ]

  return (
    <div className="relative w-full max-w-[400px] max-[900px]:max-w-none rounded-[20px] border border-(--rule) bg-(--paper) p-6 overflow-hidden flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-(--v3-accent)" />
          <div className="m-0 font-mono text-xs tracking-wider text-muted-foreground uppercase">Visitor Highlights</div>
        </div>
        <div className="flex items-center gap-1 font-mono text-xs text-muted-foreground">
          <Users className="w-3.5 h-3.5" />
          <span>Active Log</span>
        </div>
      </div>

      {/* Scrolling container (vertical marquee animation) */}
      <div className="relative h-[160px] overflow-hidden">
        <div className="flex flex-col gap-2.5 animate-[marquee-y_16s_linear_infinite] hover:[animation-play-state:paused]">
          {/* Render highlights twice for seamless looping */}
          {[...displayHighlights, ...displayHighlights].map((item, idx) => (
            <div
              key={idx}
              className="p-3 rounded-lg bg-(--bg-2) flex flex-col gap-1.5 text-xs"
            >
              <div className="flex justify-between items-center text-xs font-mono text-muted-foreground">
                <span>{item.name}</span>
                <span>{item.date}</span>
              </div>
              <p className="m-0 text-xs leading-[1.5] text-secondary-foreground italic">
                &ldquo;{item.msg}&rdquo;
              </p>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee-y {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
      `}</style>
    </div>
  )
}
