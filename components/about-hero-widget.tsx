"use client"

import { useState, useEffect } from "react"
import { Clock, Play, BookOpen, GraduationCap } from "lucide-react"

export function AboutHeroWidget() {
  const [lagosTime, setLagosTime] = useState("");
  const [status, setStatus] = useState<any>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch("/api/profile/status");
        if (res.ok) {
          const data = await res.json();
          setStatus(data);
        }
      } catch (e) {
        console.warn("Failed to fetch profile status:", e);
      }
    };
    void fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const updateTime = () => {
      // Lagos is UTC+1
      const now = new Date()
      const utc = now.getTime() + now.getTimezoneOffset() * 60000
      const lagosOffset = 1
      const lagosDate = new Date(utc + 3600000 * lagosOffset)
      
      const hours = String(lagosDate.getHours()).padStart(2, "0")
      const minutes = String(lagosDate.getMinutes()).padStart(2, "0")
      const seconds = String(lagosDate.getSeconds()).padStart(2, "0")
      setLagosTime(`${hours}:${minutes}:${seconds}`)
    }

    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="relative w-full max-w-[400px] max-[900px]:max-w-none rounded-[20px] border border-[var(--rule)] bg-[var(--paper)] p-[24px] overflow-hidden group shadow-[0_12px_40px_-12px_rgba(0,0,0,0.05)] backdrop-blur-md flex flex-col gap-5">
      {/* Background radial gradient decoration */}
      <div className="absolute -bottom-8 -left-8 w-[140px] h-[140px] bg-gradient-to-tr from-[var(--v3-accent-soft)] to-transparent rounded-full blur-[40px] opacity-50 pointer-events-none transition-all duration-500 group-hover:scale-125" />

      {/* Grid of micro cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Card 1: Local time (Lagos) */}
        <div className="p-3 rounded-[12px] bg-[var(--bg-2)] border border-[var(--rule)] flex flex-col gap-1.5 justify-between">
          <div className="flex items-center gap-1.5 text-[var(--ink-3)]">
            <Clock className="w-3.5 h-3.5" />
            <span className="font-mono text-[9px] uppercase tracking-wider">Lagos WAT</span>
          </div>
          <div className="font-mono text-[16px] font-semibold text-[var(--ink)] tracking-wider">
            {lagosTime || "--:--:--"}
          </div>
        </div>

        {/* Card 2: Status */}
        <div className="p-3 rounded-[12px] bg-[var(--bg-2)] border border-[var(--rule)] flex flex-col gap-1.5 justify-between">
          <div className="flex items-center gap-1.5 text-[var(--ink-3)]">
            <GraduationCap className="w-3.5 h-3.5" />
            <span className="font-mono text-[9px] uppercase tracking-wider">Status</span>
          </div>
          <div className="font-mono text-[11px] font-semibold text-[var(--v3-accent)] uppercase tracking-wider flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[var(--v3-accent)] animate-ping" />
            {status?.status || "Available"}
          </div>
        </div>
      </div>

      {/* Section 2: Active Focuses */}
      <div>
        <div className="flex items-center gap-1.5 mb-2.5">
          <BookOpen className="w-4 h-4 text-[var(--ink-3)]" />
          <h4 className="m-0 font-mono text-[10px] tracking-[0.15em] text-[var(--ink-3)] uppercase">Active Focuses</h4>
        </div>
        <div className="flex flex-col gap-2">
          <div>
            <div className="flex justify-between text-[11px] mb-1 font-mono text-[var(--ink-2)]">
              <span>{status?.focus1_name || "zk-SNARKs & Circuits"}</span>
              <span>{status?.focus1_pct ?? 85}%</span>
            </div>
            <div className="h-[4px] bg-[var(--rule)] rounded-full overflow-hidden">
              <div className="h-full bg-[var(--ink)] rounded-full transition-all duration-500" style={{ width: `${status?.focus1_pct ?? 85}%` }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-[11px] mb-1 font-mono text-[var(--ink-2)]">
              <span>{status?.focus2_name || "Rust Systems & WebAssembly"}</span>
              <span>{status?.focus2_pct ?? 60}%</span>
            </div>
            <div className="h-[4px] bg-[var(--rule)] rounded-full overflow-hidden">
              <div className="h-full bg-[var(--ink)] rounded-full transition-all duration-500" style={{ width: `${status?.focus2_pct ?? 60}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="h-[1px] bg-[var(--rule)] w-full" />

      {/* Section 3: Now Playing Spotify mockup */}
      <div className="flex items-center gap-3 p-3 rounded-[12px] border border-[var(--rule)] bg-[var(--bg-2)] relative overflow-hidden group/spotify">
        <div className="w-10 h-10 rounded-[8px] bg-[var(--rule)] flex items-center justify-center relative overflow-hidden flex-shrink-0">
          {/* Animated bars */}
          <div className="flex gap-[3px] items-end h-[16px]">
            <div
              className="w-[3px] bg-[var(--v3-accent)] rounded-full"
              style={{
                height: "40%",
                animation: status?.spotify_override_active !== false
                  ? "music-bar 0.8s ease-in-out infinite"
                  : "none",
              }}
            />
            <div
              className="w-[3px] bg-[var(--v3-accent)] rounded-full"
              style={{
                height: "80%",
                animation: status?.spotify_override_active !== false
                  ? "music-bar 1.2s ease-in-out infinite 0.2s"
                  : "none",
              }}
            />
            <div
              className="w-[3px] bg-[var(--v3-accent)] rounded-full"
              style={{
                height: "60%",
                animation: status?.spotify_override_active !== false
                  ? "music-bar 1.0s ease-in-out infinite 0.1s"
                  : "none",
              }}
            />
          </div>
        </div>
        <div className="flex-grow flex flex-col gap-0.5 overflow-hidden">
          <span className="font-mono text-[8px] uppercase tracking-widest text-[var(--v3-accent)] font-semibold flex items-center gap-1">
            <Play className="w-2.5 h-2.5 fill-current" /> {status?.spotify_override_playlist || "Spotify Track"}
          </span>
          <span className="text-[12px] font-semibold text-[var(--ink)] line-clamp-1 leading-[1.3]">
            {status?.spotify_override_title || "Metanoia (feat. Lofi Chill)"}
          </span>
          <span className="text-[10px] text-[var(--ink-3)] line-clamp-1">
            {status?.spotify_override_artist || "Michael's Focus Mix"}
          </span>
        </div>
      </div>

      {/* Styles for custom music bar keyframe animation inside a style tag to keep it clean */}
      <style jsx>{`
        @keyframes music-bar {
          0%, 100% { height: 30%; }
          50% { height: 100%; }
        }
      `}</style>
    </div>
  );
}
