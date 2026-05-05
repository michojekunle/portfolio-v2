import { ImageResponse } from "next/og";
import { createClient } from "@supabase/supabase-js";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function BlogPostOGImage({ params }: Props): Promise<ImageResponse> {
  const { slug } = await params;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: post } = await supabase
    .from("blog_posts")
    .select("title, excerpt, category, published_at")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  const title = post?.title ?? "Blog Post";
  const excerpt = post?.excerpt ?? "";
  const category = post?.category ?? "Article";

  const truncatedExcerpt =
    excerpt.length > 140 ? excerpt.slice(0, 137) + "…" : excerpt;

  return new ImageResponse(
    (
      <div
        style={{
          background: "#0a0a0a",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 80px",
          position: "relative",
          fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
        }}
      >
        {/* Radial glow — top-left origin for asymmetric depth */}
        <div
          style={{
            position: "absolute",
            top: -160,
            left: -100,
            width: 700,
            height: 500,
            background:
              "radial-gradient(ellipse, rgba(255,255,255,0.035) 0%, transparent 65%)",
            borderRadius: "50%",
          }}
        />

        {/* Inset border frame */}
        <div
          style={{
            position: "absolute",
            inset: "28px",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "3px",
            display: "flex",
          }}
        />

        {/* Top row — logomark + domain */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: "relative",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            {/* M geometric mark */}
            <div
              style={{
                width: 40,
                height: 40,
                background: "#111",
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid rgba(255,255,255,0.08)",
                position: "relative",
              }}
            >
              <svg
                width="40"
                height="40"
                viewBox="0 0 44 44"
                style={{ position: "absolute" }}
              >
                <polyline
                  points="10,34 10,10 22,22 34,10 34,34"
                  fill="none"
                  stroke="white"
                  stroke-width="3"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
            <span
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: "#444",
                letterSpacing: "0.3px",
              }}
            >
              Michael Ojekunle
            </span>
          </div>

          {/* Category pill */}
          <span
            style={{
              background: "rgba(255,255,255,0.06)",
              color: "rgba(255,255,255,0.35)",
              fontSize: 12,
              fontWeight: 500,
              padding: "6px 16px",
              borderRadius: 100,
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {category}
          </span>
        </div>

        {/* Main content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0px",
            position: "relative",
            flex: 1,
            justifyContent: "center",
            paddingTop: "20px",
            paddingBottom: "20px",
          }}
        >
          {/* Accent line */}
          <div
            style={{
              width: 40,
              height: 2,
              background: "rgba(255,255,255,0.15)",
              marginBottom: "32px",
            }}
          />

          {/* Post title */}
          <div
            style={{
              fontSize: title.length > 70 ? 44 : title.length > 50 ? 52 : 60,
              fontWeight: 800,
              color: "#f2f2f2",
              lineHeight: 1.1,
              letterSpacing: "-2px",
              maxWidth: 960,
              marginBottom: truncatedExcerpt ? "24px" : "0px",
            }}
          >
            {title}
          </div>

          {/* Excerpt */}
          {truncatedExcerpt && (
            <div
              style={{
                fontSize: 22,
                fontWeight: 400,
                color: "rgba(255,255,255,0.3)",
                lineHeight: 1.55,
                maxWidth: 840,
                letterSpacing: "-0.2px",
              }}
            >
              {truncatedExcerpt}
            </div>
          )}
        </div>

        {/* Bottom row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: "relative",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            paddingTop: "24px",
          }}
        >
          <span
            style={{
              fontSize: 14,
              color: "#2e2e2e",
              letterSpacing: "0.5px",
            }}
          >
            michaelojekunle.dev/blog
          </span>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <div
              style={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: "#222",
                display: "flex",
              }}
            />
            <span
              style={{
                fontSize: 12,
                color: "#272727",
                letterSpacing: "2px",
                textTransform: "uppercase",
              }}
            >
              Faith-driven developer
            </span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
