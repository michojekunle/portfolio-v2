import { getSpotifyConnectionStatus } from "@/lib/spotify";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertTriangle, Music, RefreshCw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const ERROR_MESSAGES: Record<string, string> = {
  access_denied: "You declined the Spotify authorization request.",
  state_mismatch: "That request expired or didn't match — try connecting again.",
  not_configured: "SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET / NEXT_PUBLIC_SITE_URL aren't fully configured in your environment.",
  token_exchange_failed: "Spotify rejected the authorization code — try again.",
  no_refresh_token: "Spotify didn't return a refresh token. Under Spotify's account app-access settings, remove this app's access, then reconnect.",
  unexpected: "Something went wrong connecting to Spotify.",
};

interface Props {
  connectedNotice?: string;
  errorCode?: string;
}

export async function SpotifyConnectionCard({ connectedNotice, errorCode }: Props): Promise<React.ReactElement> {
  const status = await getSpotifyConnectionStatus();

  return (
    <div className="content-card space-y-4">
      {connectedNotice && (
        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 bg-green-500/10 border border-green-500/20 rounded-md px-3 py-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Spotify connected successfully.
        </div>
      )}
      {errorCode && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {ERROR_MESSAGES[errorCode] ?? `Spotify connection failed (${errorCode}).`}
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-md bg-muted flex items-center justify-center shrink-0">
          <Music className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="min-w-0 flex-1">
          {status.connected ? (
            <>
              <p className="text-sm font-medium">
                {status.expired ? "Connection expired" : "Connected"}
              </p>
              <p className="text-xs text-muted-foreground">
                {status.authorizedAt && `Authorized ${formatDistanceToNow(new Date(status.authorizedAt))} ago`}
                {status.expiresAt && !status.expired && ` · expires ${formatDistanceToNow(new Date(status.expiresAt))} from now`}
                {status.expired && " · Spotify's refresh tokens expire after 6 months — reconnect to restore the live widget."}
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-medium">Not connected</p>
              <p className="text-xs text-muted-foreground">
                The homepage widget is showing the manual override below instead of your real Spotify activity.
              </p>
            </>
          )}
        </div>
        <Button size="sm" variant={status.connected && !status.expired ? "outline" : "default"} asChild>
          <a href="/api/spotify/authorize">
            {status.connected ? <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> : <Music className="h-3.5 w-3.5 mr-1.5" />}
            {status.connected ? "Reconnect" : "Connect Spotify"}
          </a>
        </Button>
      </div>

      <p className="text-xs text-muted-foreground border-t border-border pt-3">
        Spotify expires this authorization automatically after 6 months — you&apos;ll need to reconnect periodically here to keep the live &ldquo;now playing&rdquo; widget accurate.
      </p>
    </div>
  );
}
