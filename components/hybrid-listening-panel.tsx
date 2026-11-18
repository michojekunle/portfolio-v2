"use client";

import { useState } from "react";
import type { SpotifyNowPlaying, SpotifyRecentTrack, SpotifyTrackRef } from "@/lib/spotify";
import type { ZamirNowPlaying } from "@/lib/zamir";
import { ZamirListeningPanel } from "./zamir-listening-panel";
import { SpotifyListeningPanel } from "./spotify-listening-panel";

interface HybridListeningProps {
  initialSpotifyNowPlaying: SpotifyNowPlaying;
  initialSpotifyTopTracks: SpotifyTrackRef[];
  initialSpotifyRecentlyPlayed: SpotifyRecentTrack[];
  initialZamirData: ZamirNowPlaying;
}

export function HybridListeningPanel({
  initialSpotifyNowPlaying,
  initialSpotifyTopTracks,
  initialSpotifyRecentlyPlayed,
  initialZamirData,
}: HybridListeningProps): React.ReactElement | null {
  // Determine primary active source:
  // 1. If actively playing: whichever is currently playing takes focus.
  //    If BOTH are somehow playing simultaneously, Zamir takes precedence ("although zamir comes first").
  // 2. If neither is actively playing: Zamir comes first if it has a lastPlayed track or recentlyPlayed history,
  //    otherwise Spotify.
  const isZamirLive = Boolean(initialZamirData.isPlaying && initialZamirData.track);
  const isSpotifyLive = Boolean(initialSpotifyNowPlaying.isPlaying && initialSpotifyNowPlaying.track);

  const initialSource: "zamir" | "spotify" = (() => {
    if (isZamirLive) return "zamir";
    if (isSpotifyLive) return "spotify";
    // Neither is live playing: Zamir comes first if it has data
    const hasZamirData = Boolean(
      initialZamirData.lastPlayed ||
      (initialZamirData.recentlyPlayed && initialZamirData.recentlyPlayed.length > 0)
    );
    if (hasZamirData) return "zamir";
    return "spotify";
  })();

  const [activeSource, setActiveSource] = useState<"zamir" | "spotify">(initialSource);

  // Check data availability to decide if switcher should show
  const hasZamirContent = Boolean(
    initialZamirData.track ||
    initialZamirData.lastPlayed ||
    (initialZamirData.recentlyPlayed && initialZamirData.recentlyPlayed.length > 0)
  );

  const hasSpotifyContent = Boolean(
    initialSpotifyNowPlaying.track ||
    initialSpotifyTopTracks.length > 0 ||
    initialSpotifyRecentlyPlayed.length > 0
  );

  // If absolutely no listening data from either platform in production/live, render nothing
  if (!hasZamirContent && !hasSpotifyContent) {
    return null;
  }

  // Switcher is enabled so user can always see or toggle between Zamir and Spotify
  const canSwitch = true;

  return (
    <div className="mb-16">
      {/* Active player panel */}
      {activeSource === "zamir" ? (
        <ZamirListeningPanel initialData={initialZamirData} />
      ) : (
        <SpotifyListeningPanel
          initialNowPlaying={initialSpotifyNowPlaying}
          initialTopTracks={initialSpotifyTopTracks}
          initialRecentlyPlayed={initialSpotifyRecentlyPlayed}
        />
      )}

      {/* Switcher bar: subtle, clean underline-tab bar right below the listening card */}
      {canSwitch && (
        <div className="pt-3 pb-1 flex items-center justify-between px-1 sm:px-2 border-b border-(--rule)/40">
          <div className="flex items-center gap-7">
            <button
              type="button"
              onClick={() => setActiveSource("zamir")}
              className={`group relative flex items-center gap-2 py-2 font-mono text-[11px] uppercase tracking-[0.14em] transition-all cursor-pointer ${
                activeSource === "zamir"
                  ? "text-(--ink) font-semibold"
                  : "text-muted-foreground/70 hover:text-(--ink)"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  isZamirLive
                    ? "bg-(--v3-accent) animate-pulse"
                    : activeSource === "zamir"
                      ? "bg-(--v3-accent)"
                      : "bg-muted-foreground/40"
                }`}
              />
              <span>Listening on Zamir</span>
              {isZamirLive && (
                <span className="font-mono text-[9px] uppercase px-1.5 py-0.2 rounded bg-(--v3-accent)/10 text-(--v3-accent) border border-(--v3-accent)/30">
                  Live
                </span>
              )}
              {/* Active underline indicator */}
              {activeSource === "zamir" && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-(--v3-accent)" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveSource("spotify")}
              className={`group relative flex items-center gap-2 py-2 font-mono text-[11px] uppercase tracking-[0.14em] transition-all cursor-pointer ${
                activeSource === "spotify"
                  ? "text-(--ink) font-semibold"
                  : "text-muted-foreground/70 hover:text-(--ink)"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  isSpotifyLive
                    ? "bg-(--v3-accent) animate-pulse"
                    : activeSource === "spotify"
                      ? "bg-(--v3-accent)"
                      : "bg-muted-foreground/40"
                }`}
              />
              <span>Listening on Spotify</span>
              {isSpotifyLive && (
                <span className="font-mono text-[9px] uppercase px-1.5 py-0.2 rounded bg-(--v3-accent)/10 text-(--v3-accent) border border-(--v3-accent)/30">
                  Live
                </span>
              )}
              {/* Active underline indicator */}
              {activeSource === "spotify" && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-(--v3-accent)" />
              )}
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-muted-foreground/60 font-mono text-[11px] tracking-wider uppercase">
            <span>Source</span>
            <span>·</span>
            <span className="text-(--ink)">
              {activeSource === "zamir" ? "play.zamir.app" : "Spotify"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
