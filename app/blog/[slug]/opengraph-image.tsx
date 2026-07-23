import { createClient } from "@supabase/supabase-js";
import { renderOgCard, OG_SIZE } from "@/lib/og";

export const runtime = "edge";
export const alt = "Blog post — Michael Ojekunle";
export const size = OG_SIZE;
export const contentType = "image/png";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function Image({ params }: Props) {
  const { slug } = await params;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: post } = await supabase
    .from("blog_posts")
    .select("title, excerpt, category")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  const title = post?.title ?? "Blog Post";
  const excerpt = post?.excerpt ?? "";
  const category = post?.category ?? "Article";
  const subtitle = excerpt.length > 130 ? excerpt.slice(0, 127) + "…" : excerpt;

  return renderOgCard({
    eyebrow: category,
    title,
    subtitle: subtitle || undefined,
    cta: "Read the article →",
    path: "/blog",
  });
}
