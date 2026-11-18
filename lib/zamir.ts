export interface ZamirTrackRef {
  id: string;
  title: string;
  artistOrTheme?: string;
  scriptureRef?: string;
  coverUrl?: string | null;
  zamirUrl: string;
  durationMs: number;
}

export interface ZamirRecentTrack extends ZamirTrackRef {
  playedAt: number;
}

export interface ZamirNowPlaying {
  isPlaying: boolean;
  status: "playing" | "paused" | "offline";
  track: ZamirTrackRef | null;
  progressMs: number;
  durationMs: number;
  fetchedAt: number;
  lastPlayed: ZamirRecentTrack | null;
  recentlyPlayed: ZamirRecentTrack[];
}

export async function getZamirNowPlaying(handle?: string): Promise<ZamirNowPlaying> {
  const targetHandle = handle || process.env.NEXT_PUBLIC_ZAMIR_HANDLE || "@mich";
  const clean = targetHandle.trim().toLowerCase().replace(/^@/, "");
  const secret = process.env.ZAMIR_TEAM_SECRET || "";
  const baseUrl = process.env.ZAMIR_API_BASE_URL || "https://play.zamir.app";

  try {
    const res = await fetch(`${baseUrl}/api/internal/team/now-playing?handle=${clean}`, {
      headers: {
        "X-Zamir-Team-Secret": secret,
      },
      next: { revalidate: 15 },
    });

    if (!res.ok) throw new Error(`Zamir API error: ${res.status}`);
    return await res.json();
  } catch {
    return {
      isPlaying: false,
      status: "offline",
      track: null,
      progressMs: 0,
      durationMs: 0,
      fetchedAt: Date.now(),
      lastPlayed: null,
      recentlyPlayed: [],
    };
  }
}
