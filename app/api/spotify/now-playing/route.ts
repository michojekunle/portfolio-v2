import { NextResponse } from "next/server";
import { getSpotifyNowPlaying } from "@/lib/spotify";

// Deliberately public (no admin auth) — this is display data for the
// homepage/about page widgets, not an admin action. Freshness is controlled
// by lib/spotify.ts's own short-TTL Redis cache, not Next's fetch cache.
export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse> {
  const nowPlaying = await getSpotifyNowPlaying();
  return NextResponse.json(nowPlaying);
}
