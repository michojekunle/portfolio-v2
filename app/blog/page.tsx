import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import type { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Blog | Michael Ojekunle",
  description: "Thoughts on Web3, frontend engineering, ZKML, First Principles, faith, personal growth, and the craft of building.",
};

export default async function BlogPage(): Promise<React.ReactElement> {
  const supabase = await createClient();

  const { data: posts } = await supabase
    .from("blog_posts")
    .select("id, title, slug, excerpt, category, read_time, published_at, updated_at")
    .eq("published", true)
    .order("published_at", { ascending: false });

  return (
    <main className="min-h-screen pt-24 pb-20 px-6 max-w-2xl mx-auto">
      <div className="mb-12">
        <h1 className="text-3xl font-semibold tracking-tight mb-2">Blog</h1>
        <p className="text-muted-foreground">
          Thoughts on Web3, frontend engineering, ZKML, First Principles, faith, personal growth, and the craft of building.
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
              className="group content-card flex items-start justify-between gap-4 py-5 hover:bg-muted/40 transition-colors no-underline"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="secondary" className="text-xs shrink-0">
                    {post.category}
                  </Badge>
                  {post.read_time && (
                    <span className="text-xs text-muted-foreground">{post.read_time}</span>
                  )}
                </div>
                <p className="text-sm font-medium group-hover:text-foreground transition-colors mb-1">
                  {post.title}
                </p>
                {post.excerpt && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{post.excerpt}</p>
                )}
              </div>
              <p className="text-xs text-muted-foreground shrink-0 mt-0.5">
                {post.published_at
                  ? format(new Date(post.published_at), "MMM d, yyyy")
                  : ""}
              </p>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
