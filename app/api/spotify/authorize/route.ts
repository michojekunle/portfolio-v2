import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { requireAdminAuth } from "@/lib/admin/auth";
import { getSpotifyRedirectUri } from "@/lib/spotify";

// Read-only "now playing" is all the widget needs — no playback control scopes.
const SCOPE = "user-read-currently-playing";

/** GET /api/spotify/authorize — kicks off the OAuth flow from the "Connect Spotify" button on /admin/now. */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth = await requireAdminAuth();
  if (auth.unauthorized) return NextResponse.redirect(new URL("/admin/login", request.url));

  const client_id = process.env.SPOTIFY_CLIENT_ID;
  const redirect_uri = getSpotifyRedirectUri();
  if (!client_id || !redirect_uri) {
    return NextResponse.json({ error: "SPOTIFY_CLIENT_ID or NEXT_PUBLIC_SITE_URL not configured" }, { status: 500 });
  }

  const state = randomBytes(16).toString("hex");

  const authUrl = new URL("https://accounts.spotify.com/authorize");
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("client_id", client_id);
  authUrl.searchParams.set("scope", SCOPE);
  authUrl.searchParams.set("redirect_uri", redirect_uri);
  authUrl.searchParams.set("state", state);
  // Forces the account chooser/consent screen every time rather than
  // silently re-approving whichever Spotify account is already logged into
  // the browser — important since this token is meant for one specific account.
  authUrl.searchParams.set("show_dialog", "true");

  const res = NextResponse.redirect(authUrl.toString());
  res.cookies.set("spotify_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  return res;
}
