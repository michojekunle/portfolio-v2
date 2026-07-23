import { Redis } from "@upstash/redis";

const REDIS_KEY = "spotify_auth";
/** Spotify expires user-authorization refresh tokens 6 months after issuance (rolled out to existing apps 2026-07-20) — the clock does not reset on refresh, only on a fresh authorization. */
const REFRESH_TOKEN_LIFETIME_DAYS = 180;

let redis: Redis | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

interface SpotifyAuthRecord {
  refresh_token: string;
  authorized_at: string; // ISO
}

/**
 * Builds the OAuth callback URL from NEXT_PUBLIC_SITE_URL, stripping any
 * trailing slash first — Spotify's redirect_uri match is byte-exact, and a
 * trailing slash on the env var silently produces a double slash
 * (".dev//api/...") that won't match what's registered on the app.
 */
export function getSpotifyRedirectUri(): string | null {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl) return null;
  return `${siteUrl.replace(/\/+$/, "")}/api/spotify/callback`;
}

export async function getSpotifyAuth(): Promise<SpotifyAuthRecord | null> {
  if (!redis) return null;
  try {
    return await redis.get<SpotifyAuthRecord>(REDIS_KEY);
  } catch (e) {
    console.error("[spotify] redis read error:", e);
    return null;
  }
}

export async function setSpotifyAuth(refresh_token: string): Promise<void> {
  if (!redis) return;
  const record: SpotifyAuthRecord = { refresh_token, authorized_at: new Date().toISOString() };
  await redis.set(REDIS_KEY, record);
}

export async function clearSpotifyAuth(): Promise<void> {
  if (!redis) return;
  await redis.del(REDIS_KEY);
}

export interface SpotifyConnectionStatus {
  connected: boolean;
  authorizedAt: string | null;
  expiresAt: string | null;
  expired: boolean;
}

export async function getSpotifyConnectionStatus(): Promise<SpotifyConnectionStatus> {
  const auth = await getSpotifyAuth();
  if (!auth) return { connected: false, authorizedAt: null, expiresAt: null, expired: false };

  const authorizedAt = new Date(auth.authorized_at);
  const expiresAt = new Date(authorizedAt.getTime() + REFRESH_TOKEN_LIFETIME_DAYS * 86_400_000);
  return {
    connected: true,
    authorizedAt: auth.authorized_at,
    expiresAt: expiresAt.toISOString(),
    expired: Date.now() > expiresAt.getTime(),
  };
}

// The scopes below are all read-only, user-personalization endpoints (not
// the catalog/algorithmic endpoints Spotify restricted to Extended Quota
// Mode in late 2024 — recommendations, related-artists, featured-playlists,
// audio-features/analysis). These remain available to an app in Development
// Mode for the app owner's own account, which is this integration's only use.
export const SPOTIFY_SCOPES = "user-read-currently-playing user-read-playback-state user-read-recently-played user-top-read";

/** Exchanges the stored refresh token for a fresh access token. Shared by every Spotify data fetcher below so token-refresh/expiry handling lives in exactly one place. */
async function getSpotifyAccessToken(): Promise<string | null> {
  const client_id = process.env.SPOTIFY_CLIENT_ID;
  const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!client_id || !client_secret) return null;

  const stored = await getSpotifyAuth();
  // Falls back to the legacy env-var token for a first deploy that hasn't
  // gone through the /admin/now "Connect Spotify" flow yet.
  const refresh_token = stored?.refresh_token ?? process.env.SPOTIFY_REFRESH_TOKEN;
  if (!refresh_token) return null;

  try {
    const basic = Buffer.from(`${client_id}:${client_secret}`).toString("base64");
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${basic}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ grant_type: "refresh_token", refresh_token }),
      cache: "no-store",
    });

    if (!response.ok) {
      const body: unknown = await response.json().catch(() => null);
      const errorCode = body && typeof body === "object" && "error" in body ? (body as { error: string }).error : null;
      if (errorCode === "invalid_grant") {
        // Expired (6-month lifetime) or revoked — stop retrying with a dead
        // token and surface a clear "reconnect" state in /admin/now instead
        // of failing silently on every request.
        console.error("[spotify] refresh token invalid/expired — reconnect at /admin/now");
        await clearSpotifyAuth();
      } else {
        console.error("[spotify] token refresh failed:", response.status, body);
      }
      return null;
    }

    const tokenData = (await response.json()) as { access_token: string; refresh_token?: string };

    // Persist a rotated refresh token if Spotify issues one, so the old
    // string doesn't get invalidated out from under a token we didn't save.
    if (tokenData.refresh_token && tokenData.refresh_token !== refresh_token) {
      await setSpotifyAuth(tokenData.refresh_token);
    }

    return tokenData.access_token;
  } catch (e) {
    console.error("[spotify] token refresh error:", e);
    return null;
  }
}

/**
 * Short-TTL cache shared across every visitor hitting the public Spotify
 * endpoints. This is single-account data (one Spotify account, arbitrary
 * site traffic) — without this, N concurrent page loads would mean N calls
 * to Spotify's API, and Spotify's per-app rate limit is shared across every
 * one of those, not per-visitor. Falls back to calling `fetcher` directly if
 * Redis isn't configured (dev/local).
 */
async function withCache<T>(key: string, ttlSeconds: number, fetcher: () => Promise<T>): Promise<T> {
  if (!redis) return fetcher();
  try {
    const cached = await redis.get<T>(key);
    if (cached !== null && cached !== undefined) return cached;
  } catch (e) {
    console.error(`[spotify] cache read error (${key}):`, e);
  }
  const fresh = await fetcher();
  try {
    await redis.set(key, fresh, { ex: ttlSeconds });
  } catch (e) {
    console.error(`[spotify] cache write error (${key}):`, e);
  }
  return fresh;
}

export interface SpotifyTrackRef {
  id: string;
  name: string;
  artist: string;
  album: string;
  albumImage: string | null;
  trackUrl: string | null;
  durationMs: number;
}

export interface SpotifyNowPlaying {
  isPlaying: boolean;
  track: SpotifyTrackRef | null;
  progressMs: number;
  /** Server timestamp this was fetched at (ms epoch) — the client interpolates progress forward from here between polls instead of re-fetching every second. */
  fetchedAt: number;
}

const NOW_PLAYING_CACHE_KEY = "spotify_now_playing_cache";
const NOW_PLAYING_CACHE_TTL_SECONDS = 8;

function toTrackRef(item: {
  id: string;
  name: string;
  artists: { name: string }[];
  album: { name: string; images: { url: string }[] };
  external_urls?: { spotify?: string };
  duration_ms: number;
}): SpotifyTrackRef {
  return {
    id: item.id,
    name: item.name,
    artist: item.artists.map((a) => a.name).join(", "),
    album: item.album.name,
    albumImage: item.album.images[0]?.url ?? null,
    trackUrl: item.external_urls?.spotify ?? null,
    durationMs: item.duration_ms,
  };
}

/** Live "now playing" with playback progress — cached for a few seconds so concurrent site visitors share one upstream call. */
export async function getSpotifyNowPlaying(): Promise<SpotifyNowPlaying> {
  return withCache(NOW_PLAYING_CACHE_KEY, NOW_PLAYING_CACHE_TTL_SECONDS, async () => {
    const empty: SpotifyNowPlaying = { isPlaying: false, track: null, progressMs: 0, fetchedAt: Date.now() };
    const access_token = await getSpotifyAccessToken();
    if (!access_token) return empty;

    try {
      const res = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
        headers: { Authorization: `Bearer ${access_token}` },
        cache: "no-store",
      });
      if (res.status === 204 || res.status >= 400) return empty;

      const data = await res.json();
      if (!data || !data.item) return empty;

      return {
        isPlaying: Boolean(data.is_playing),
        track: toTrackRef(data.item),
        progressMs: data.progress_ms ?? 0,
        fetchedAt: Date.now(),
      };
    } catch (e) {
      console.error("[spotify] now-playing fetch error:", e);
      return empty;
    }
  });
}

/** Legacy simple shape, kept for /api/profile/status and the About-page hero widget so neither needs to change. */
export async function getSpotifyLiveTrack(): Promise<{ title: string; artist: string; playlist: string; active: boolean } | null> {
  const now = await getSpotifyNowPlaying();
  if (!now.track) return null;
  return {
    title: now.track.name,
    artist: now.track.artist,
    playlist: "Spotify Live",
    active: now.isPlaying,
  };
}

export interface SpotifyRecentTrack extends SpotifyTrackRef {
  playedAt: string;
}

const RECENTLY_PLAYED_CACHE_KEY = "spotify_recently_played_cache";
const STATS_CACHE_TTL_SECONDS = 600; // 10 min — this data doesn't meaningfully change minute to minute.

/** Last N tracks played, most recent first. */
export async function getSpotifyRecentlyPlayed(limit = 10): Promise<SpotifyRecentTrack[]> {
  return withCache(`${RECENTLY_PLAYED_CACHE_KEY}:${limit}`, STATS_CACHE_TTL_SECONDS, async () => {
    const access_token = await getSpotifyAccessToken();
    if (!access_token) return [];

    try {
      const res = await fetch(`https://api.spotify.com/v1/me/player/recently-played?limit=${limit}`, {
        headers: { Authorization: `Bearer ${access_token}` },
        cache: "no-store",
      });
      if (!res.ok) return [];

      const data = (await res.json()) as { items: { played_at: string; track: Parameters<typeof toTrackRef>[0] }[] };
      return (data.items ?? []).map((entry) => ({ ...toTrackRef(entry.track), playedAt: entry.played_at }));
    } catch (e) {
      console.error("[spotify] recently-played fetch error:", e);
      return [];
    }
  });
}

export type SpotifyTimeRange = "short_term" | "medium_term" | "long_term";

const TOP_TRACKS_CACHE_KEY = "spotify_top_tracks_cache";

/** Most-played tracks. time_range: short_term ≈ 4 weeks, medium_term ≈ 6 months, long_term ≈ several years. */
export async function getSpotifyTopTracks(timeRange: SpotifyTimeRange = "short_term", limit = 10): Promise<SpotifyTrackRef[]> {
  return withCache(`${TOP_TRACKS_CACHE_KEY}:${timeRange}:${limit}`, STATS_CACHE_TTL_SECONDS, async () => {
    const access_token = await getSpotifyAccessToken();
    if (!access_token) return [];

    try {
      const res = await fetch(`https://api.spotify.com/v1/me/top/tracks?time_range=${timeRange}&limit=${limit}`, {
        headers: { Authorization: `Bearer ${access_token}` },
        cache: "no-store",
      });
      if (!res.ok) return [];

      const data = (await res.json()) as { items: Parameters<typeof toTrackRef>[0][] };
      return (data.items ?? []).map(toTrackRef);
    } catch (e) {
      console.error("[spotify] top-tracks fetch error:", e);
      return [];
    }
  });
}
