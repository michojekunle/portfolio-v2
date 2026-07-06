const http = require("http");
const url = require("url");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

const envPath = path.join(__dirname, "../.env");

if (!fs.existsSync(envPath)) {
  console.error("❌ Could not find .env file at:", envPath);
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
const redirect_uri = `http://localhost:${PORT}/callback`;

if (!client_id || !client_secret) {
  console.error("❌ SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET is missing from your .env file!");
  process.exit(1);
}

console.log("=========================================");
console.log("🟢 Spotify Auth Helper Initialized");
console.log(`Using Client ID: ${client_id}`);
console.log(`Redirect URI: ${redirect_uri}`);
console.log("=========================================\n");

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);

  if (parsedUrl.pathname === "/") {
    // Redirect to Spotify Auth
    const scope = "user-read-currently-playing user-read-playback-state";
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${client_id}&response_type=code&redirect_uri=${encodeURIComponent(
      redirect_uri
    )}&scope=${encodeURIComponent(scope)}`;
    
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
        console.error("❌ Token exchange failed:", errorText);
        return;
      }

      const data = await response.json();
      const newRefreshToken = data.refresh_token;

      if (!newRefreshToken) {
        res.writeHead(500, { "Content-Type": "text/html" });
        res.end("<h1>Failed: Spotify did not return a refresh token</h1>");
        return;
      }

      // Update .env file
      let updatedEnvContent = envContent;
      const regex = /^SPOTIFY_REFRESH_TOKEN=.*$/m;
      if (regex.test(updatedEnvContent)) {
        updatedEnvContent = updatedEnvContent.replace(regex, `SPOTIFY_REFRESH_TOKEN=${newRefreshToken}`);
      } else {
        updatedEnvContent += `\nSPOTIFY_REFRESH_TOKEN=${newRefreshToken}\n`;
      }
      fs.writeFileSync(envPath, updatedEnvContent, "utf-8");

      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(`
        <div style="font-family: sans-serif; text-align: center; padding-top: 50px;">
          <h1 style="color: #1DB954;">🎉 Spotify Authenticated Successfully!</h1>
          <p>The new refresh token has been written directly to your <strong>.env</strong> file.</p>
          <p>You can close this tab and stop the Node script now.</p>
        </div>
      `);

      console.log("\n=========================================");
      console.log("✅ SUCCESS!");
      console.log(`New Refresh Token saved: ${newRefreshToken}`);
      console.log("=========================================\n");
      process.exit(0);
    } catch (err) {
      console.error("❌ Error during token exchange:", err);
      res.writeHead(500, { "Content-Type": "text/html" });
      res.end(`<h1>Internal Server Error</h1><pre>${err.stack}</pre>`);
    }
  }
});

server.listen(PORT, () => {
  const localUrl = `http://localhost:${PORT}`;
  console.log(`👉 Please make sure "${redirect_uri}" is added to your Spotify Developer Dashboard under "Redirect URIs".`);
  console.log(`👉 Open this link in your browser to log in:\n   \x1b[36m${localUrl}\x1b[0m\n`);
  
  // Try to open automatically
  exec(`open "${localUrl}"`, (err) => {
    if (err) {
      console.log("Could not launch browser automatically. Please open the URL manually.");
    }
  });
});
