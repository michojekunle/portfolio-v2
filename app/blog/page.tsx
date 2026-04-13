import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import type { Metadata } from "next";
import { Eye, Heart, MessageSquare, ArrowLeft } from "lucide-react";

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
      id, title, slug, excerpt, category, read_time, published_at, updated_at, views,
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

      {!posts?.length ? (
        <p className="text-sm text-muted-foreground">No posts yet. Check back soon.</p>
      ) : (
        <div className="space-y-1">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group flex flex-col gap-2 py-6 hover:bg-muted/30 transition-all no-underline border-b border-border/40 last:border-0"
            >
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="secondary" className="text-[10px] uppercase tracking-wider h-5 font-bold bg-muted/50 border-border/40 transition-colors group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/20">
                  {post.category}
                </Badge>
                {post.read_time && (
                  <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter opacity-70 group-hover:opacity-100 transition-opacity">
                    {post.read_time}
                  </span>
                )}
              </div>
              
              <div className="flex items-start justify-between gap-6">
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-semibold tracking-tight group-hover:text-primary transition-colors mb-2 line-clamp-2">
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-4">
                      {post.excerpt}
                    </p>
                  )}
                </div>
                <time className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest shrink-0 mt-1.5 opacity-60">
                  {post.published_at ? format(new Date(post.published_at), "MMM d, yyyy") : ""}
                </time>
              </div>

              <div className="flex items-center gap-4 mt-1">
                <div className="flex items-center gap-1.5 text-muted-foreground group-hover:text-foreground transition-all duration-300">
                  <Eye className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                  <span className="text-[11px] font-mono font-bold tracking-tight">{post.views || 0}</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground group-hover:text-primary transition-all duration-300">
                  <Heart className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100 transition-opacity group-hover:fill-primary/20" />
                  <span className="text-[11px] font-mono font-bold tracking-tight">{post.reactionCount}</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground group-hover:text-primary transition-all duration-300">
                  <MessageSquare className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                  <span className="text-[11px] font-mono font-bold tracking-tight">{post.commentCount}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
