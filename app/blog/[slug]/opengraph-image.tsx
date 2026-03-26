import { ImageResponse } from "next/og";
import { createClient } from "@supabase/supabase-js";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function BlogOGImage({ params }: Props): Promise<ImageResponse> {
  const { slug } = await params;
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: post } = await supabase
    .from("blog_posts")
    .select("title, excerpt, category")
    .eq("slug", slug)
    .single();

  const title = post?.title ?? "Blog Post";
  const excerpt = post?.excerpt ?? "";
  const category = post?.category ?? "Technical";

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: "#0a0a0a",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "64px 72px",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
        }}
      >
        {/* subtle top glow */}
        <div
          style={{
            position: "absolute",
            top: -200,
            left: "50%",
            transform: "translateX(-50%)",
            width: 800,
            height: 400,
            background: "radial-gradient(ellipse, rgba(255,255,255,0.04) 0%, transparent 70%)",
            borderRadius: "50%",
          }}
        />

        {/* inset border */}
        <div
          style={{
            position: "absolute",
            inset: 24,
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 16,
          }}
        />

        {/* category pill */}
        <div
          style={{
            display: "flex",
            marginBottom: 28,
          }}
        >
          <span
            style={{
              background: "rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.5)",
              fontSize: 14,
              fontWeight: 500,
              padding: "6px 14px",
              borderRadius: 100,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            {category}
          </span>
        </div>

        {/* title */}
        <div
          style={{
            fontSize: title.length > 60 ? 44 : 56,
            fontWeight: 700,
            color: "#f9f9f9",
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
            marginBottom: excerpt ? 20 : 40,
            maxWidth: 900,
          }}
        >
          {title}
        </div>

        {/* excerpt */}
        {excerpt && (
          <div
            style={{
              fontSize: 20,
              color: "rgba(255,255,255,0.4)",
              lineHeight: 1.5,
              maxWidth: 800,
              marginBottom: 40,
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {excerpt}
          </div>
        )}

        {/* footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            paddingTop: 24,
          }}
        >
          <span style={{ fontSize: 16, fontWeight: 600, color: "rgba(255,255,255,0.6)" }}>
            Michael Ojekunle
          </span>
          <span style={{ fontSize: 14, color: "rgba(255,255,255,0.25)" }}>
            michaeldev.xyz
          </span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
