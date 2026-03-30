import { createClient } from "@supabase/supabase-js";

const SITE = "https://michaelojekunle.dev";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET(): Promise<Response> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: posts } = await supabase
    .from("blog_posts")
    .select("title, slug, excerpt, category, published_at, updated_at")
    .eq("published", true)
    .order("published_at", { ascending: false })
    .limit(50);

  const items = (posts ?? [])
    .map(
      (post) => `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${SITE}/blog/${post.slug}</link>
      <guid isPermaLink="true">${SITE}/blog/${post.slug}</guid>
      <description>${escapeXml(post.excerpt ?? "")}</description>
      <category>${escapeXml(post.category ?? "")}</category>
      <pubDate>${new Date(post.published_at as string).toUTCString()}</pubDate>
    </item>`
    )
    .join("");

  const lastBuildDate = posts?.[0]?.published_at
    ? new Date(posts[0].published_at as string).toUTCString()
    : new Date().toUTCString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Michael Ojekunle — Blog</title>
    <link>${SITE}/blog</link>
    <description>Thoughts on Web3, frontend engineering, and the craft of building software.</description>
    <language>en</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${SITE}/feed.xml" rel="self" type="application/rss+xml" />
    <image>
      <url>${SITE}/opengraph-image</url>
      <title>Michael Ojekunle</title>
      <link>${SITE}</link>
    </image>${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600",
    },
  });
}
