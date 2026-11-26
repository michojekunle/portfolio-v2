"use client";

import { useEffect, useState } from "react";
import { Music2, Radio, Sparkles } from "lucide-react";
import type { ZamirNowPlaying } from "@/lib/zamir";

const NOW_PLAYING_POLL_MS = 15_000;

function formatMs(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function timeAgo(epochMs: number): string {
  const seconds = Math.floor((Date.now() - epochMs) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function cleanTitle(title: string): string {
  // Strip trailing " // Zamir" or " - Zamir" if present
  return title.replace(/\s*(\/\/|-)\s*zamir\s*$/i, "").trim() || title;
}

function cleanDescription(desc?: string): string {
  if (!desc) return "Sacred Worship";
  // If the description is a long prompt (e.g. contains audio generation instructions), shorten/clean it
  const firstPart = desc.split(/[;.]/)[0].trim();
  return firstPart || desc;
}

interface Props {
  initialData?: ZamirNowPlaying;
  handle?: string;
}

export function ZamirListeningPanel({ initialData, handle }: Props): React.ReactElement | null {
  const [data, setData] = useState<ZamirNowPlaying | null>(initialData ?? null);
  const [displayProgress, setDisplayProgress] = useState(initialData?.progressMs ?? 0);
  const [syncedSecondsAgo, setSyncedSecondsAgo] = useState(0);

  // Sync age ticker (safe inside useEffect to prevent hydration mismatch)
  useEffect(() => {
    if (!data?.fetchedAt) return;
    const tick = (): void => {
      setSyncedSecondsAgo(Math.max(0, Math.round((Date.now() - data.fetchedAt) / 1000)));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [data?.fetchedAt]);

  // Poll live now-playing state
  useEffect(() => {
    const poll = async () => {
      try {
        const query = handle ? `?handle=${encodeURIComponent(handle)}` : "";
        const res = await fetch(`/api/zamir/now-playing${query}`);
        if (!res.ok) return;
        const fresh: ZamirNowPlaying = await res.json();
        setData(fresh);
        setDisplayProgress(fresh.progressMs);
      } catch (err) {
        console.warn("[zamir-panel] Poll failed:", err);
      }
    };

    const id = setInterval(poll, NOW_PLAYING_POLL_MS);
    return () => clearInterval(id);
  }, [handle]);

  // Interpolate progress smoothly between polls
  useEffect(() => {
    if (!data?.isPlaying || !data.track) return;
    const tick = () => {
      const elapsed = Date.now() - data.fetchedAt;
      setDisplayProgress(
        Math.min(data.track!.durationMs, data.progressMs + elapsed)
      );
    };
    tick();
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, [data]);

  const activeTrack = data?.track ?? data?.lastPlayed;
  if (!activeTrack && (!data?.recentlyPlayed || data.recentlyPlayed.length === 0)) {
    return null;
  }

  const isLive = Boolean(data?.isPlaying && data?.track);
  const progressPct = data?.track?.durationMs
    ? Math.min(100, (displayProgress / data.track.durationMs) * 100)
    : 0;

  const headerLabel = isLive
    ? "Listening on Zamir"
    : data?.lastPlayed
      ? "Last heard on Zamir"
      : "Zamir Worship";

  return (
    <div className="grid grid-cols-[1.05fr_1fr] max-[820px]:grid-cols-1 gap-0 border-y border-(--rule) bg-(--bg) w-full overflow-hidden">
      {/* Hero Now Playing */}
      <div className="relative p-8 max-[820px]:p-6 border-r border-(--rule) max-[820px]:border-r-0 max-[820px]:border-b overflow-hidden flex flex-col justify-between min-w-0">
        {/* Soft atmospheric cover backdrop */}
        {activeTrack?.coverUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={activeTrack.coverUrl}
            alt=""
            aria-hidden
            className="absolute inset-0 w-full h-full object-cover opacity-[0.16] blur-2xl scale-125 pointer-events-none select-none"
          />
        )}

        <div className="relative flex flex-col h-full z-10 min-w-0">
          {/* Header Row */}
          <div className="flex items-center justify-between gap-3 mb-6 min-w-0">
            <h3 className="font-mono text-[12px] tracking-[0.16em] uppercase text-muted-foreground m-0 font-medium flex items-center gap-2 min-w-0 truncate">
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  isLive ? "bg-(--v3-accent) animate-pulse" : "bg-muted-foreground/40"
                }`}
              />
              <span className="truncate">{headerLabel}</span>
              {data?.fetchedAt && (
                <span className="text-muted-foreground/50 normal-case font-normal shrink-0 hidden sm:inline">
                  synced {syncedSecondsAgo}s ago
                </span>
              )}
            </h3>

            {/* Zamir brand badge */}
            <span className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.12em] uppercase px-2 py-0.5 rounded-full border border-(--rule) bg-(--bg-2) text-(--ink) font-medium shrink-0">
              <Radio className={`w-3 h-3 ${isLive ? "text-(--v3-accent)" : "text-muted-foreground"}`} />
              Worship App
            </span>
          </div>

          {activeTrack ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-5 py-2 min-w-0">
              {/* Cover Art / Icon with equalizer */}
              <div className="relative shrink-0">
                {activeTrack.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={activeTrack.coverUrl}
                    alt={`${activeTrack.title} cover`}
                    className="w-44 h-44 max-[820px]:w-40 max-[820px]:h-40 rounded-2xl object-cover shadow-[0_16px_40px_-12px_rgba(0,0,0,0.35)] border border-(--rule)"
                  />
                ) : (
                  <div className="w-44 h-44 max-[820px]:w-40 max-[820px]:h-40 rounded-2xl bg-(--bg-2) border border-(--rule) flex flex-col items-center justify-center gap-2 shadow-xs">
                    <Music2 className="w-10 h-10 text-(--v3-accent)" />
                    <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                      Zamir Track
                    </span>
                  </div>
                )}

                {isLive && (
                  <span className="absolute bottom-2.5 right-2.5 flex gap-0.75 items-end h-4 bg-(--bg)/85 backdrop-blur-sm rounded-md px-1.5 py-1 shadow-sm border border-(--rule)/40">
                    <span
                      className="w-0.75 h-3 bg-(--v3-accent) rounded-full origin-bottom"
                      style={{ animation: "zamir-eq 0.8s ease-in-out infinite" }}
                    />
                    <span
                      className="w-0.75 h-3 bg-(--v3-accent) rounded-full origin-bottom"
                      style={{ animation: "zamir-eq 1.2s ease-in-out infinite 0.2s" }}
                    />
                    <span
                      className="w-0.75 h-3 bg-(--v3-accent) rounded-full origin-bottom"
                      style={{ animation: "zamir-eq 1.0s ease-in-out infinite 0.1s" }}
                    />
                  </span>
                )}
              </div>

              {/* Track Meta */}
              <div className="w-full min-w-0 max-w-105 px-2">
                {activeTrack.zamirUrl ? (
                  <a
                    href={activeTrack.zamirUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block font-display text-[22px] max-[820px]:text-[20px] leading-tight tracking-[-0.01em] text-(--ink) fvs-text truncate hover:text-(--v3-accent) transition-colors no-underline"
                    title={activeTrack.title}
                  >
                    {cleanTitle(activeTrack.title)}
                  </a>
                ) : (
                  <span
                    className="block font-display text-[22px] leading-tight tracking-[-0.01em] text-(--ink) fvs-text truncate"
                    title={activeTrack.title}
                  >
                    {cleanTitle(activeTrack.title)}
                  </span>
                )}

                <p className="font-mono text-[13px] text-muted-foreground tracking-[0.02em] truncate mt-1.5">
                  {activeTrack.scriptureRef ? (
                    <span className="text-(--v3-accent) font-medium">
                      {activeTrack.scriptureRef} ·{" "}
                    </span>
                  ) : null}
                  {cleanDescription(activeTrack.artistOrTheme)}
                </p>
              </div>

              {/* Progress bar — live track only */}
              {isLive && data?.track && (
                <div className="w-full max-w-105">
                  <div className="h-1 bg-(--rule) rounded-full overflow-hidden">
                    <div
                      className="h-full bg-(--v3-accent) rounded-full transition-[width] duration-500 ease-linear"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-1.5 font-mono text-[12px] text-muted-foreground tabular-nums">
                    <span>{formatMs(displayProgress)}</span>
                    <span>{formatMs(data.track.durationMs)}</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 py-10">
              <Music2 className="w-8 h-8 text-muted-foreground/40" />
              <p className="font-mono text-[13px] text-muted-foreground tracking-[0.02em]">
                No devotions active right now.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Right Column — Recent Devotions */}
      <div className="p-8 max-[820px]:p-6 flex flex-col justify-between min-w-0 overflow-hidden">
        <div className="min-w-0">
          <div className="flex items-center justify-between mb-5 gap-3 min-w-0">
            <h4 className="font-mono text-[12px] tracking-[0.16em] uppercase text-muted-foreground m-0 font-medium flex items-center gap-2 shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-(--v3-accent)" />
              Recent Devotions
            </h4>
            <span className="font-mono text-[11px] text-muted-foreground/70 uppercase truncate">
              Scripture on repeat
            </span>
          </div>

          {(!data?.recentlyPlayed || data.recentlyPlayed.length === 0) ? (
            <div className="py-8 text-center">
              <p className="font-mono text-[13px] text-muted-foreground tracking-[0.02em]">
                Recent sessions will appear here once played.
              </p>
            </div>
          ) : (
            <ul className="list-none p-0 m-0 space-y-3 min-w-0">
              {data.recentlyPlayed.slice(0, 5).map((track, i) => (
                <li key={`${track.id}-${track.playedAt || i}`} className="flex items-center gap-3 min-w-0">
                  <span className="font-mono text-[12px] text-muted-foreground/60 w-4 shrink-0 text-right">
                    {i + 1}
                  </span>

                  {track.coverUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={track.coverUrl}
                      alt={track.title}
                      loading="lazy"
                      decoding="async"
                      className="w-9 h-9 rounded object-cover shrink-0 border border-(--rule)"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded bg-(--bg-2) border border-(--rule) flex items-center justify-center shrink-0">
                      <Music2 className="w-4 h-4 text-muted-foreground/60" />
                    </div>
                  )}

                  <div className="min-w-0 flex-1 overflow-hidden">
                    <a
                      href={track.zamirUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-[13px] text-(--ink) truncate hover:text-(--v3-accent) transition-colors no-underline font-medium"
                      title={track.title}
                    >
                      {cleanTitle(track.title)}
                    </a>
                    <span className="block font-mono text-[12px] text-muted-foreground truncate" title={track.artistOrTheme}>
                      {track.scriptureRef ? `${track.scriptureRef} · ` : ""}
                      {cleanDescription(track.artistOrTheme)}
                    </span>
                  </div>

                  <span className="font-mono text-[12px] text-muted-foreground/60 shrink-0 ml-2">
                    {timeAgo(track.playedAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Zamir Link Footer */}
        <div className="pt-6 mt-6 border-t border-(--rule) flex items-center justify-between text-[12px] font-mono min-w-0 gap-2">
          <span className="text-muted-foreground truncate">Personal daily worship habit</span>
          <a
            href="https://play.zamir.app"
            target="_blank"
            rel="noopener noreferrer"
            className="text-(--v3-accent) hover:text-(--ink) transition-colors font-medium shrink-0"
          >
            Open Zamir ↗
          </a>
        </div>
      </div>

      <style jsx>{`
        @keyframes zamir-eq {
          0%, 100% {
            transform: scaleY(0.35);
          }
          50% {
            transform: scaleY(1);
          }
        }
      `}</style>
    </div>
  );
}
