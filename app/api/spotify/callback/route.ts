import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/admin/auth";
import { setSpotifyAuth } from "@/lib/spotify";

/** GET /api/spotify/callback — Spotify redirects here after the user approves access; must exactly match a Redirect URI registered on the Spotify app. */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth = await requireAdminAuth();
  if (auth.unauthorized) return NextResponse.redirect(new URL("/admin/login", request.url));

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const redirectTarget = new URL("/admin/now", siteUrl ?? request.url);

  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const oauthError = request.nextUrl.searchParams.get("error");
  const storedState = request.cookies.get("spotify_oauth_state")?.value;

  const fail = (reason: string): NextResponse => {
    redirectTarget.searchParams.set("spotify_error", reason);
    const res = NextResponse.redirect(redirectTarget);
    res.cookies.delete("spotify_oauth_state");
    return res;
  };

  if (oauthError) return fail(oauthError);
  if (!code || !state || !storedState || state !== storedState) return fail("state_mismatch");

  const client_id = process.env.SPOTIFY_CLIENT_ID;
  const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!client_id || !client_secret || !siteUrl) return fail("not_configured");

  try {
    const basic = Buffer.from(`${client_id}:${client_secret}`).toString("base64");
    const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: { Authorization: `Basic ${basic}`, "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: `${siteUrl}/api/spotify/callback`,
      }),
      cache: "no-store",
    });

    if (!tokenRes.ok) {
      console.error("[spotify/callback] token exchange failed:", tokenRes.status, await tokenRes.text().catch(() => ""));
      return fail("token_exchange_failed");
    }

    const { refresh_token } = (await tokenRes.json()) as { refresh_token?: string };
    if (!refresh_token) return fail("no_refresh_token");

    await setSpotifyAuth(refresh_token);
  } catch (err) {
    console.error("[spotify/callback] unexpected error:", err);
    return fail("unexpected");
  }

  redirectTarget.searchParams.set("spotify_connected", "1");
  const res = NextResponse.redirect(redirectTarget);
  res.cookies.delete("spotify_oauth_state");
  return res;
}
