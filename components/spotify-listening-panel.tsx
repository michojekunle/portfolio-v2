"use client"

import { useEffect, useRef, useState } from "react"
import { Music2, ListMusic, History } from "lucide-react"
import type { SpotifyNowPlaying, SpotifyRecentTrack, SpotifyTrackRef, SpotifyTimeRange } from "@/lib/spotify"

const NOW_PLAYING_POLL_MS = 15_000
const STATS_POLL_MS = 5 * 60_000

const RANGE_LABEL: Record<SpotifyTimeRange, string> = {
  short_term: "4 weeks",
  medium_term: "6 months",
  long_term: "all time",
}

function formatMs(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m}:${String(s).padStart(2, "0")}`
}

function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (seconds < 60) return "just now"
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

interface Props {
  initialNowPlaying: SpotifyNowPlaying
  initialTopTracks: SpotifyTrackRef[]
  initialRecentlyPlayed: SpotifyRecentTrack[]
}

export function SpotifyListeningPanel({ initialNowPlaying, initialTopTracks, initialRecentlyPlayed }: Props): React.ReactElement | null {
  const [nowPlaying, setNowPlaying] = useState(initialNowPlaying)
  const [displayProgress, setDisplayProgress] = useState(initialNowPlaying.progressMs)
  const [topTracks, setTopTracks] = useState(initialTopTracks)
  const [recentlyPlayed, setRecentlyPlayed] = useState(initialRecentlyPlayed)
  const [tab, setTab] = useState<"top" | "recent">("top")
  const [range, setRange] = useState<SpotifyTimeRange>("short_term")
  // Starts at 0 (SSR-safe/deterministic) and is only ever updated inside a
  // useEffect — computing `Date.now() - fetchedAt` directly during render
  // would differ between the server render and the client hydration render
  // (real time passes between the two), which is a hydration mismatch.
  const [syncedSecondsAgo, setSyncedSecondsAgo] = useState(0)
  const rangeRef = useRef(range)
  rangeRef.current = range

  // Ticks once a second so the "synced Xs ago" label below makes clear the
  // data is live even in the ~15s between polls, not stale.
  useEffect(() => {
    const tick = (): void => setSyncedSecondsAgo(Math.max(0, Math.round((Date.now() - nowPlaying.fetchedAt) / 1000)))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [nowPlaying.fetchedAt])

  // Poll live now-playing state.
  useEffect(() => {
    const poll = async (): Promise<void> => {
      try {
        const res = await fetch("/api/spotify/now-playing")
        if (!res.ok) return
        const data = (await res.json()) as SpotifyNowPlaying
        setNowPlaying(data)
        setDisplayProgress(data.progressMs)
      } catch (e) {
        console.warn("[spotify-panel] now-playing poll failed:", e)
      }
    }
    const id = setInterval(poll, NOW_PLAYING_POLL_MS)
    return () => clearInterval(id)
  }, [])

  // Smoothly tick the progress bar forward between polls instead of only
  // updating once every 15s, so it reads as genuinely live.
  useEffect(() => {
    if (!nowPlaying.isPlaying || !nowPlaying.track) return
    const tick = (): void => {
      const elapsed = Date.now() - nowPlaying.fetchedAt
      setDisplayProgress(Math.min(nowPlaying.track!.durationMs, nowPlaying.progressMs + elapsed))
    }
    tick()
    const id = setInterval(tick, 500)
    return () => clearInterval(id)
  }, [nowPlaying])

  // Poll top tracks / recently played less aggressively — this data barely changes minute to minute.
  useEffect(() => {
    const fetchStats = async (): Promise<void> => {
      try {
        const res = await fetch(`/api/spotify/stats?range=${rangeRef.current}`)
        if (!res.ok) return
        const data = (await res.json()) as { topTracks: SpotifyTrackRef[]; recentlyPlayed: SpotifyRecentTrack[] }
        setTopTracks(data.topTracks)
        setRecentlyPlayed(data.recentlyPlayed)
      } catch (e) {
        console.warn("[spotify-panel] stats poll failed:", e)
      }
    }
    void fetchStats()
    const id = setInterval(fetchStats, STATS_POLL_MS)
    return () => clearInterval(id)
  }, [range])

  const hasAnyData = nowPlaying.track || topTracks.length > 0 || recentlyPlayed.length > 0
  if (!hasAnyData) return null

  const list = tab === "top" ? topTracks : recentlyPlayed

  // When nothing is actively playing, fall back to the most-recent track so
  // the hero panel is never a sad empty box — labelled "Last played" so it's
  // clearly not live.
  const liveTrack = nowPlaying.track
  const fallbackTrack = !liveTrack && recentlyPlayed.length > 0 ? recentlyPlayed[0] : null
  const displayTrack = liveTrack ?? fallbackTrack
  const isLive = Boolean(liveTrack)
  const progressPct = liveTrack ? Math.min(100, (displayProgress / liveTrack.durationMs) * 100) : 0

  const headerLabel = isLive
    ? (nowPlaying.isPlaying ? "Listening now" : "Paused")
    : (fallbackTrack ? "Last played" : "Spotify")

  return (
    <div className="grid grid-cols-[1.05fr_1fr] max-[820px]:grid-cols-1 gap-0 border border-(--rule) rounded-2xl overflow-hidden mb-16 bg-(--bg)">
      {/* Now playing — hero */}
      <div className="relative p-8 max-[820px]:p-6 border-r border-(--rule) max-[820px]:border-r-0 max-[820px]:border-b overflow-hidden flex flex-col">
        {/* Blurred album backdrop for a premium now-playing feel */}
        {displayTrack?.albumImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={displayTrack.albumImage}
            alt=""
            aria-hidden
            className="absolute inset-0 w-full h-full object-cover opacity-[0.07] blur-2xl scale-125 pointer-events-none select-none"
          />
        )}

        <div className="relative flex flex-col h-full">
          <h4 className="font-mono text-[10px] tracking-[0.18em] uppercase text-muted-foreground m-0 mb-6 font-medium flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${nowPlaying.isPlaying ? "bg-(--v3-accent) animate-pulse" : "bg-muted-foreground/40"}`} />
            <span className="flex-1">{headerLabel}</span>
            <span className="text-muted-foreground/50 normal-case font-normal">synced {syncedSecondsAgo}s ago</span>
          </h4>

          {displayTrack ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-5 py-2">
              {/* Album art */}
              <div className="relative shrink-0">
                {displayTrack.albumImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={displayTrack.albumImage}
                    alt={`${displayTrack.album} cover`}
                    className="w-44 h-44 max-[820px]:w-40 max-[820px]:h-40 rounded-2xl object-cover shadow-[0_16px_40px_-12px_rgba(0,0,0,0.35)]"
                  />
                ) : (
                  <div className="w-44 h-44 rounded-2xl bg-(--bg-2) border border-(--rule) flex items-center justify-center">
                    <Music2 className="w-10 h-10 text-muted-foreground" />
                  </div>
                )}
                {isLive && nowPlaying.isPlaying && (
                  <span className="absolute bottom-2.5 right-2.5 flex gap-[3px] items-end h-4 bg-(--bg)/85 backdrop-blur-sm rounded-md px-1.5 py-1 shadow-sm">
                    <span className="w-[3px] bg-(--v3-accent) rounded-full" style={{ height: "40%", animation: "spotify-eq 0.8s ease-in-out infinite" }} />
                    <span className="w-[3px] bg-(--v3-accent) rounded-full" style={{ height: "80%", animation: "spotify-eq 1.2s ease-in-out infinite 0.2s" }} />
                    <span className="w-[3px] bg-(--v3-accent) rounded-full" style={{ height: "60%", animation: "spotify-eq 1.0s ease-in-out infinite 0.1s" }} />
                  </span>
                )}
              </div>

              {/* Track meta */}
              <div className="w-full min-w-0">
                {displayTrack.trackUrl ? (
                  <a
                    href={displayTrack.trackUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block font-display text-[22px] max-[820px]:text-[20px] leading-tight tracking-[-0.01em] text-(--ink) fvs-text truncate hover:text-(--v3-accent) transition-colors no-underline"
                  >
                    {displayTrack.name}
                  </a>
                ) : (
                  <span className="block font-display text-[22px] leading-tight tracking-[-0.01em] text-(--ink) fvs-text truncate">{displayTrack.name}</span>
                )}
                <p className="font-mono text-[11px] text-muted-foreground tracking-[0.04em] truncate mt-1.5">{displayTrack.artist}</p>
              </div>

              {/* Progress — only meaningful for the live track */}
              {isLive && (
                <div className="w-full">
                  <div className="h-1 bg-(--rule) rounded-full overflow-hidden">
                    <div className="h-full bg-(--v3-accent) rounded-full" style={{ width: `${progressPct}%`, transition: "width 0.5s linear" }} />
                  </div>
                  <div className="flex justify-between mt-1.5 font-mono text-[9px] text-muted-foreground tabular-nums">
                    <span>{formatMs(displayProgress)}</span>
                    <span>{formatMs(liveTrack!.durationMs)}</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 py-10">
              <Music2 className="w-8 h-8 text-muted-foreground/40" />
              <p className="font-mono text-[11px] text-muted-foreground tracking-[0.04em]">Nothing playing right now.</p>
            </div>
          )}
        </div>
      </div>

      {/* Top tracks / recently played */}
      <div className="p-8 max-[820px]:p-6">
        <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
          <div className="flex gap-1">
            <button
              onClick={() => setTab("top")}
              className={`flex items-center gap-1.5 font-mono text-[10px] tracking-[0.12em] uppercase px-2.5 py-1.5 rounded-md transition-colors ${tab === "top" ? "bg-(--v3-accent) text-white" : "text-muted-foreground hover:text-(--ink)"}`}
            >
              <ListMusic className="w-3 h-3" /> Top tracks
            </button>
            <button
              onClick={() => setTab("recent")}
              className={`flex items-center gap-1.5 font-mono text-[10px] tracking-[0.12em] uppercase px-2.5 py-1.5 rounded-md transition-colors ${tab === "recent" ? "bg-(--v3-accent) text-white" : "text-muted-foreground hover:text-(--ink)"}`}
            >
              <History className="w-3 h-3" /> Recent
            </button>
          </div>

          {tab === "top" && (
            <select
              value={range}
              onChange={(e) => setRange(e.target.value as SpotifyTimeRange)}
              className="font-mono text-[10px] uppercase tracking-[0.08em] bg-transparent border border-(--rule) rounded-md px-2 py-1 text-muted-foreground focus:outline-none"
            >
              {(Object.keys(RANGE_LABEL) as SpotifyTimeRange[]).map((r) => (
                <option key={r} value={r}>{RANGE_LABEL[r]}</option>
              ))}
            </select>
          )}
        </div>

        {list.length === 0 ? (
          <p className="font-mono text-[11px] text-muted-foreground tracking-[0.04em]">Nothing to show yet.</p>
        ) : (
          <ul className="list-none p-0 m-0 space-y-3">
            {list.map((track, i) => (
              <li key={`${track.id}-${i}`} className="flex items-center gap-3">
                <span className="font-mono text-[10px] text-muted-foreground/60 w-4 shrink-0 text-right">{i + 1}</span>
                {track.albumImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={track.albumImage} alt="" className="w-9 h-9 rounded object-cover shrink-0" />
                ) : (
                  <div className="w-9 h-9 rounded bg-(--bg-2) border border-(--rule) shrink-0" />
                )}
                <div className="min-w-0 flex-1">
                  {track.trackUrl ? (
                    <a href={track.trackUrl} target="_blank" rel="noopener noreferrer" className="block text-[13px] text-(--ink) truncate hover:text-(--v3-accent) transition-colors no-underline">
                      {track.name}
                    </a>
                  ) : (
                    <span className="block text-[13px] text-(--ink) truncate">{track.name}</span>
                  )}
                  <span className="block font-mono text-[10px] text-muted-foreground truncate">{track.artist}</span>
                </div>
                {tab === "recent" && "playedAt" in track && (
                  <span className="font-mono text-[9px] text-muted-foreground/60 shrink-0">{timeAgo((track as SpotifyRecentTrack).playedAt)}</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <style jsx>{`
        @keyframes spotify-eq {
          0%, 100% { height: 30%; }
          50% { height: 100%; }
        }
      `}</style>
    </div>
  )
}
