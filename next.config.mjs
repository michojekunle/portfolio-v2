import withSerwistInit from "@serwist/next";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Strip the X-Powered-By header — no information leakage.
  poweredByHeader: false,

  // Strict mode catches double-invocation bugs early.
  reactStrictMode: true,

  // Suppress the turbopack/webpack mismatch warning when no turbopack config is needed.
  turbopack: {},

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(self), microphone=(self), geolocation=(), interest-cohort=()",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // unsafe-eval is required by Next.js dev/edge runtime; unsafe-inline for RSC inline scripts
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.instagram.com https://*.tiktok.com https://*.tiktokcdn.com https://vercel.live https://*.vercel.live",
              "style-src 'self' 'unsafe-inline' https://vercel.live https://*.vercel.live",
              // blob: for next/image output; data: for inline SVG; https: for remote images
              "img-src 'self' blob: data: https:",
              // media-src: blob: for local MediaRecorder audio/video previews; https: for Supabase storage media
              `media-src 'self' blob: data: https: https://${process.env.NEXT_PUBLIC_SUPABASE_URL?.replace("https://", "") ?? "*.supabase.co"}`,
              // next/font serves fonts from same origin after build-time download
              "font-src 'self' data: https://assets.vercel.com https://vercel.live https://*.vercel.live",
              // Only browser→API calls need to be listed here (server-side fetches are exempt).
              // Instagram/TikTok's embed.js each fetch their own oEmbed endpoint client-side
              // before they can render a video — without these, script-src/frame-src alone
              // still leave the embed stuck on the placeholder blockquote.
              [
                "connect-src 'self' blob:",
                "https://bible-api.com",
                "https://*.instagram.com",
                "https://*.tiktok.com",
                `https://${process.env.NEXT_PUBLIC_SUPABASE_URL?.replace("https://", "") ?? "*.supabase.co"}`,
                // WebSocket for Supabase realtime (if ever enabled)
                `wss://${process.env.NEXT_PUBLIC_SUPABASE_URL?.replace("https://", "") ?? "*.supabase.co"}`,
                // Web Push — allow subscribing to push notification endpoints
                "https://fcm.googleapis.com",
                "https://*.push.services.mozilla.com",
                "https://*.notify.windows.com",
                "https://*.apple.com",
                // Vercel Live Preview / Toolbar
                "https://vercel.live",
                "https://*.vercel.live",
                "wss://*.vercel.live",
              ].join(" "),
              // Allow YouTube, Instagram, TikTok, and Vimeo embeds (plus blob: for epubjs)
              "frame-src 'self' blob: https://*.youtube.com https://*.youtube-nocookie.com https://*.instagram.com https://*.tiktok.com https://*.vimeo.com https://vercel.live https://*.vercel.live",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "upgrade-insecure-requests",
            ].join("; "),
          },
        ],
      },

      // Cache OG images for 1 hour
      {
        source: "/(opengraph-image|twitter-image|icon|apple-icon)(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=3600, stale-while-revalidate=86400" },
        ],
      },
    ];
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
    formats: ["image/avif", "image/webp"],
    // Reasonable device sizes for a portfolio site
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },
};

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
});

export default withSerwist(nextConfig);
