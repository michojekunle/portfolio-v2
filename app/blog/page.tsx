import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import { BlogListing } from "@/components/blog-listing";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Blog | Michael Ojekunle",
  description: "Thoughts on Web3, frontend engineering, ZKML, faith, personal growth, and the craft of building.",
};

export default async function BlogPage(): Promise<React.ReactElement> {
  const supabase = await createClient();

  const { data: rawPosts } = await supabase
    .from("blog_posts")
    .select(`
      id, title, slug, excerpt, category, read_time, published_at, updated_at, views, external_url, clicks,
      reactions:blog_reactions(count),
      comments:blog_comments(count)
    `)
    .eq("published", true)
    .order("published_at", { ascending: false });

  const posts = (rawPosts || []).map(post => ({
    ...post,
    reactionCount: (post.reactions as any)?.[0]?.count ?? 0,
    commentCount: (post.comments as any)?.[0]?.count ?? 0
  }));

  return (
    <main className="min-h-screen pt-24 pb-20 px-6 max-w-2xl mx-auto">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-10 no-underline"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
        Home
      </Link>

      <div className="mb-12">
        <h1 className="text-3xl font-semibold tracking-tight mb-2">Blog</h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Thoughts on Web3, frontend engineering, ZKML, faith, personal growth, and the craft of building.
        </p>
      </div>

      <BlogListing initialPosts={posts as any} />
    </main>
  );
}
