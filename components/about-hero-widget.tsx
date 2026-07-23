"use client"

import { useState, useEffect } from "react"
import { Clock, Play, BookOpen, GraduationCap } from "lucide-react"
import type { SpotifyNowPlaying } from "@/lib/spotify"

const NOW_PLAYING_POLL_MS = 15_000

export function AboutHeroWidget() {
  const [lagosTime, setLagosTime] = useState("");
  const [status, setStatus] = useState<any>(null);
  const [nowPlaying, setNowPlaying] = useState<SpotifyNowPlaying | null>(null);
  const [displayProgress, setDisplayProgress] = useState(0);

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

  // Real live Spotify playback — polled independently of the profile status.
  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch("/api/spotify/now-playing");
        if (!res.ok) return;
        const data = (await res.json()) as SpotifyNowPlaying;
        setNowPlaying(data);
        setDisplayProgress(data.progressMs);
      } catch (e) {
        console.warn("Failed to fetch now-playing:", e);
      }
    };
    void poll();
    const id = setInterval(poll, NOW_PLAYING_POLL_MS);
    return () => clearInterval(id);
  }, []);

  // Interpolate the progress bar forward between polls so it reads as live.
  useEffect(() => {
    if (!nowPlaying?.isPlaying || !nowPlaying.track) return;
    const tick = () => {
      const elapsed = Date.now() - nowPlaying.fetchedAt;
      setDisplayProgress(Math.min(nowPlaying.track!.durationMs, nowPlaying.progressMs + elapsed));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [nowPlaying]);

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
    <div className="relative w-full max-w-[400px] max-[900px]:max-w-none rounded-[20px] border border-(--rule) bg-(--paper) p-6 overflow-hidden group shadow-[0_12px_40px_-12px_rgba(0,0,0,0.05)] backdrop-blur-md flex flex-col gap-5">
      {/* Background radial gradient decoration */}
      <div className="absolute -bottom-8 -left-8 w-35 h-35 bg-gradient-to-tr from-(--v3-accent-soft) to-transparent rounded-full blur-10 opacity-50 pointer-events-none transition-all duration-500 group-hover:scale-125" />

      {/* Grid of micro cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Card 1: Local time (Lagos) */}
        <div className="p-3 rounded-xl bg-(--bg-2) border border-(--rule) flex flex-col gap-1.5 justify-between">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="w-3.5 h-3.5" />
            <span className="font-mono text-[9px] uppercase tracking-wider">Lagos WAT</span>
          </div>
          <div className="font-mono text-[16px] font-semibold text-(--ink) tracking-wider">
            {lagosTime || "--:--:--"}
          </div>
        </div>

        {/* Card 2: Status */}
        <div className="p-3 rounded-xl bg-(--bg-2) border border-(--rule) flex flex-col gap-1.5 justify-between">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <GraduationCap className="w-3.5 h-3.5" />
            <span className="font-mono text-[9px] uppercase tracking-wider">Status</span>
          </div>
          <div className="font-mono text-[11px] font-semibold text-(--v3-accent) uppercase tracking-wider flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-(--v3-accent) animate-ping" />
            {status?.status || "Available"}
          </div>
        </div>
      </div>

      {/* Section 2: Active Focuses */}
      <div>
        <div className="flex items-center gap-1.5 mb-2.5">
          <BookOpen className="w-4 h-4 text-muted-foreground" />
          <h4 className="m-0 font-mono text-[10px] tracking-[0.15em] text-muted-foreground uppercase">Active Focuses</h4>
        </div>
        <div className="flex flex-col gap-2">
          <div>
            <div className="flex justify-between text-[11px] mb-1 font-mono text-secondary-foreground">
              <span>{status?.focus1_name || "Flutter (mobile)"}</span>
              <span>{status?.focus1_pct ?? 35}%</span>
            </div>
            <div className="h-1 bg-(--rule) rounded-full overflow-hidden">
              <div className="h-full bg-(--ink) rounded-full transition-all duration-500" style={{ width: `${status?.focus1_pct ?? 35}%` }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-[11px] mb-1 font-mono text-secondary-foreground">
              <span>{status?.focus2_name || "Rust systems"}</span>
              <span>{status?.focus2_pct ?? 55}%</span>
            </div>
            <div className="h-1 bg-(--rule) rounded-full overflow-hidden">
              <div className="h-full bg-(--ink) rounded-full transition-all duration-500" style={{ width: `${status?.focus2_pct ?? 55}%` }} />
            </div>
          </div>
        </div>

        {/* Horizon — where I'm heading next */}
        <div className="flex items-center gap-2 mt-3.5 pt-3.5 border-t border-(--rule)">
          <span className="font-mono text-[9px] tracking-[0.15em] uppercase text-muted-foreground">Next</span>
          <span className="w-1 h-1 rounded-full bg-(--v3-accent) shrink-0" aria-hidden="true" />
          <span className="font-mono text-[11px] font-medium text-(--v3-accent)">{status?.next_focus || "zkML"}</span>
          <span className="font-mono text-[10px] text-muted-foreground ml-auto">the horizon</span>
        </div>
      </div>

      {/* Divider */}
      <div className="h-0.25 bg-(--rule) w-full" />

      {/* Section 3: Now Playing — real live Spotify, falls back to override text */}
      {(() => {
        const liveTrack = nowPlaying?.track ?? null;
        const isPlaying = Boolean(nowPlaying?.isPlaying && liveTrack);
        const label = liveTrack ? (isPlaying ? "Listening now" : "Last played") : (status?.spotify_override_playlist || "Spotify Track");
        const title = liveTrack?.name ?? status?.spotify_override_title ?? "Metanoia (feat. Lofi Chill)";
        const artist = liveTrack?.artist ?? status?.spotify_override_artist ?? "Michael's Focus Mix";
        const animate = liveTrack ? isPlaying : status?.spotify_override_active !== false;
        const progressPct = liveTrack ? Math.min(100, (displayProgress / liveTrack.durationMs) * 100) : 0;

        return (
          <a
            href={liveTrack?.trackUrl ?? undefined}
            target={liveTrack?.trackUrl ? "_blank" : undefined}
            rel="noopener noreferrer"
            className={`block p-3 rounded-xl border border-(--rule) bg-(--bg-2) relative overflow-hidden no-underline ${liveTrack?.trackUrl ? "transition-colors hover:border-(--v3-accent-soft)" : ""}`}
          >
            <div className="flex items-center gap-3">
              {/* Album art (or animated bars fallback) */}
              <div className="w-10 h-10 rounded-lg bg-(--rule) flex items-center justify-center relative overflow-hidden flex-shrink-0">
                {liveTrack?.albumImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={liveTrack.albumImage} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex gap-0.75 items-end h-4">
                    <div className="w-0.75 bg-(--v3-accent) rounded-full" style={{ height: "40%", animation: animate ? "music-bar 0.8s ease-in-out infinite" : "none" }} />
                    <div className="w-0.75 bg-(--v3-accent) rounded-full" style={{ height: "80%", animation: animate ? "music-bar 1.2s ease-in-out infinite 0.2s" : "none" }} />
                    <div className="w-0.75 bg-(--v3-accent) rounded-full" style={{ height: "60%", animation: animate ? "music-bar 1.0s ease-in-out infinite 0.1s" : "none" }} />
                  </div>
                )}
              </div>
              <div className="flex-grow flex flex-col gap-0.5 overflow-hidden">
                <span className="font-mono text-[8px] uppercase tracking-widest text-(--v3-accent) font-semibold flex items-center gap-1">
                  <Play className="w-2.5 h-2.5 fill-current" /> {label}
                </span>
                <span className="text-[12px] font-semibold text-(--ink) line-clamp-1 leading-[1.3]">{title}</span>
                <span className="text-[10px] text-muted-foreground line-clamp-1">{artist}</span>
              </div>
            </div>

            {/* Live progress bar */}
            {isPlaying && (
              <div className="h-0.75 bg-(--rule) rounded-full overflow-hidden mt-2.5">
                <div className="h-full bg-(--v3-accent) rounded-full" style={{ width: `${progressPct}%`, transition: "width 1s linear" }} />
              </div>
            )}
          </a>
        );
      })()}

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
