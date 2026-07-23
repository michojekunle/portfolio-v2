"use client"

import { MessageSquare, Users } from "lucide-react"

export function GuestbookHeroWidget() {
  const highlights = [
    { name: "Alex K.", msg: "Love the minimal design and typography!", date: "2 days ago" },
    { name: "Sarah L.", msg: "Great essays on ZK. Extremely clean explanations.", date: "1 week ago" },
    { name: "David M.", msg: "Arc + Claude Code is an elite dev combo.", date: "2 weeks ago" },
    { name: "Elena R.", msg: "Saying hi from Berlin! The Lagos time clock is cool.", date: "3 weeks ago" }
  ]

  return (
    <div className="relative w-full max-w-[400px] max-[900px]:max-w-none rounded-[20px] border border-(--rule) bg-(--paper) p-6 overflow-hidden group shadow-[0_12px_40px_-12px_rgba(0,0,0,0.05)] backdrop-blur-md flex flex-col gap-4">
      {/* Decorative gradient flare */}
      <div className="absolute top-0 right-0 w-30 h-30 bg-gradient-to-br from-(--v3-accent-soft) to-transparent rounded-full blur-10 opacity-60 pointer-events-none transition-all duration-500 group-hover:scale-125" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-(--v3-accent)" />
          <h4 className="m-0 font-mono text-[11px] tracking-[0.18em] text-muted-foreground uppercase">Visitor Highlights</h4>
        </div>
        <div className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
          <Users className="w-3.5 h-3.5" />
          <span>Active Log</span>
        </div>
      </div>

      {/* Scrolling container (vertical marquee animation) */}
      <div className="relative h-[150px] overflow-hidden rounded-xl border border-(--rule) bg-(--bg-2) p-2">
        <div className="absolute top-0 left-0 w-full h-[15px] bg-gradient-to-b from-(--bg-2) to-transparent z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-full h-[15px] bg-gradient-to-t from-(--bg-2) to-transparent z-10 pointer-events-none" />

        <div className="flex flex-col gap-2 animate-[marquee-y_16s_linear_infinite] hover:[animation-play-state:paused]">
          {/* Render highlights twice for seamless looping */}
          {[...highlights, ...highlights].map((item, idx) => (
            <div
              key={idx}
              className="p-3 rounded-lg bg-(--paper) border border-(--rule) flex flex-col gap-1 text-[12px] transition-all duration-200 hover:border-muted-foreground"
            >
              <div className="flex justify-between items-center text-[10px] font-mono text-muted-foreground">
                <span>{item.name}</span>
                <span>{item.date}</span>
              </div>
              <p className="m-0 text-[11px] leading-[1.4] text-secondary-foreground italic">
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
