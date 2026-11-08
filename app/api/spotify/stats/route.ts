import { NextRequest, NextResponse } from "next/server";
import { getSpotifyRecentlyPlayed, getSpotifyTopTracks, type SpotifyTimeRange } from "@/lib/spotify";

const VALID_RANGES: SpotifyTimeRange[] = ["short_term", "medium_term", "long_term"];

// Public — same reasoning as /api/spotify/now-playing. Cached in lib/spotify.ts.
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const rangeParam = request.nextUrl.searchParams.get("range");
  const timeRange: SpotifyTimeRange = VALID_RANGES.includes(rangeParam as SpotifyTimeRange)
    ? (rangeParam as SpotifyTimeRange)
    : "short_term";

  const [topTracks, recentlyPlayed] = await Promise.all([
    getSpotifyTopTracks(timeRange, 8),
    getSpotifyRecentlyPlayed(8),
  ]);

  return NextResponse.json({ topTracks, recentlyPlayed, timeRange });
}
