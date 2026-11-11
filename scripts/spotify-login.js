const http = require("http");
const url = require("url");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

const envPath = path.join(__dirname, "../.env");

if (!fs.existsSync(envPath)) {
  console.error("[error] Could not find .env file at:", envPath);
  process.exit(1);
}

// Simple .env parser
const envContent = fs.readFileSync(envPath, "utf-8");
const env = {};
envContent.split("\n").forEach(line => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) return;
  const equalsIdx = trimmed.indexOf("=");
  if (equalsIdx > 0) {
    const key = trimmed.substring(0, equalsIdx).trim();
    let val = trimmed.substring(equalsIdx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.substring(1, val.length - 1);
    }
    env[key] = val;
  }
});

const client_id = env.SPOTIFY_CLIENT_ID;
const client_secret = env.SPOTIFY_CLIENT_SECRET;
const PORT = 8888;
const redirect_uri = `http://127.0.0.1:${PORT}/callback`;

if (!client_id || !client_secret) {
  console.error("[error] SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET is missing from your .env file!");
  process.exit(1);
}

console.log("=========================================");
console.log("[info] Spotify Auth Helper Initialized");
console.log(`Using Client ID: ${client_id}`);
console.log(`Redirect URI: ${redirect_uri}`);
console.log("=========================================\n");

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);

  if (parsedUrl.pathname === "/") {
    // Redirect to Spotify Auth with all required scopes
    const scope = "user-read-currently-playing user-read-playback-state user-read-recently-played user-top-read";
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${client_id}&response_type=code&redirect_uri=${encodeURIComponent(
      redirect_uri
    )}&scope=${encodeURIComponent(scope)}&show_dialog=true`;
    
    res.writeHead(302, { Location: authUrl });
    res.end();
    return;
  }

  if (parsedUrl.pathname === "/callback") {
    const code = parsedUrl.query.code;
    if (!code) {
      res.writeHead(400, { "Content-Type": "text/html" });
      res.end("<h1>Authentication Failed: Missing authorization code</h1>");
      return;
    }

    try {
      const basicAuth = Buffer.from(`${client_id}:${client_secret}`).toString("base64");
      const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
          Authorization: `Basic ${basicAuth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        res.writeHead(response.status, { "Content-Type": "text/html" });
        res.end(`<h1>Token Exchange Failed</h1><pre>${errorText}</pre>`);
        console.error("[error] Token exchange failed:", errorText);
        return;
      }

      const data = await response.json();
      const newRefreshToken = data.refresh_token;

      if (!newRefreshToken) {
        res.writeHead(500, { "Content-Type": "text/html" });
        res.end("<h1>Failed: Spotify did not return a refresh token</h1>");
        return;
      }

      // 1. Update local .env file
      let updatedEnvContent = envContent;
      const regex = /^SPOTIFY_REFRESH_TOKEN=.*$/m;
      if (regex.test(updatedEnvContent)) {
        updatedEnvContent = updatedEnvContent.replace(regex, `SPOTIFY_REFRESH_TOKEN=${newRefreshToken}`);
      } else {
        updatedEnvContent += `\nSPOTIFY_REFRESH_TOKEN=${newRefreshToken}\n`;
      }
      fs.writeFileSync(envPath, updatedEnvContent, "utf-8");

      // 2. Sync directly to Upstash Redis for production
      let redisSynced = false;
      if (env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN) {
        try {
          const redisUrl = env.UPSTASH_REDIS_REST_URL.replace(/^"|"$/g, "").replace(/\/+$/, "");
          const redisToken = env.UPSTASH_REDIS_REST_TOKEN.replace(/^"|"$/g, "");
          const redisRecord = {
            refresh_token: newRefreshToken,
            authorized_at: new Date().toISOString(),
          };
          const redisRes = await fetch(`${redisUrl}/set/spotify_auth`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${redisToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(redisRecord),
          });
          if (redisRes.ok) {
            redisSynced = true;
            console.log("[success] Synced new token to Upstash Redis (production)!");
          } else {
            console.warn("[warn] Upstash Redis set status:", redisRes.status);
          }
        } catch (redisErr) {
          console.warn("[warn] Failed to sync to Upstash Redis:", redisErr.message);
        }
      }

      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(`
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; text-align: center; padding-top: 60px; max-width: 520px; margin: 0 auto; color: #111;">
          <div style="width: 56px; height: 56px; border-radius: 50%; background: #1DB954; color: white; display: inline-flex; align-items: center; justify-content: center; font-size: 28px; margin-bottom: 20px;">✓</div>
          <h1 style="color: #111; font-size: 24px; margin-bottom: 8px;">Spotify Authenticated Successfully!</h1>
          <p style="color: #666; font-size: 15px; line-height: 1.5;">The new refresh token has been written to your <strong>.env</strong> file${redisSynced ? " and synced directly to <strong>Upstash Redis</strong> for production" : ""}.</p>
          <p style="color: #999; font-size: 13px; margin-top: 24px;">You can close this window now.</p>
        </div>
      `);

      console.log("\n=========================================");
      console.log("[success] Authentication Successful!");
      console.log(`New Refresh Token: ${newRefreshToken}`);
      if (redisSynced) {
        console.log("[success] Upstash Redis: SYNCED");
      }
      console.log("=========================================\n");
      process.exit(0);
    } catch (err) {
      console.error("[error] Error during token exchange:", err);
      res.writeHead(500, { "Content-Type": "text/html" });
      res.end(`<h1>Internal Server Error</h1><pre>${err.stack}</pre>`);
    }
  }
});

server.listen(PORT, "127.0.0.1", () => {
  const localUrl = `http://127.0.0.1:${PORT}`;
  console.log(`Please make sure "${redirect_uri}" is added to your Spotify Developer Dashboard under "Redirect URIs".`);
  console.log(`Open this link in your browser to log in:\n   \x1b[36m${localUrl}\x1b[0m\n`);
  
  // Try to open automatically
  exec(`open "${localUrl}"`, (err) => {
    if (err) {
      console.log("Could not launch browser automatically. Please open the URL manually.");
    }
  });
});
