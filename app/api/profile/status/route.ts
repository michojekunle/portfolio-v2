import { NextResponse } from "next/server";
import { getProfileStatus, getSpotifyLiveTrack } from "@/lib/profile-status";

export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  const status = await getProfileStatus();
  
  // Attempt to fetch live Spotify playing state
  const liveSpotify = await getSpotifyLiveTrack();
  if (liveSpotify) {
    return NextResponse.json({
      ...status,
      spotify_override_title: liveSpotify.title,
      spotify_override_artist: liveSpotify.artist,
      spotify_override_playlist: liveSpotify.playlist,
      spotify_override_active: liveSpotify.active,
    });
  }

  return NextResponse.json(status);
}
