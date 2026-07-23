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

export interface SpotifyNowPlaying {
  title: string;
  artist: string;
  playlist: string;
  active: boolean;
}

export async function getSpotifyLiveTrack(): Promise<SpotifyNowPlaying | null> {
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

    const trackResponse = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
      cache: "no-store",
    });

    if (trackResponse.status === 204 || trackResponse.status >= 400) return null;

    const track = await trackResponse.json();
    if (!track || !track.item) return null;

    return {
      title: track.item.name,
      artist: track.item.artists.map((a: { name: string }) => a.name).join(", "),
      playlist: "Spotify Live",
      active: track.is_playing,
    };
  } catch (e) {
    console.error("[spotify] live fetch error:", e);
    return null;
  }
}
