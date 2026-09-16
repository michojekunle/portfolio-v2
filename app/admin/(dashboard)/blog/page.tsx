import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Plus } from "lucide-react";
import { BlogActions } from "./blog-actions";
import { PageHeader } from "@/components/admin/ui/page-header";
import { GlassCard } from "@/components/admin/ui/glass-card";

export default async function AdminBlogPage() {
  const supabase = await createClient();

  const { data: posts } = await supabase
    .from("blog_posts")
    .select("id, title, slug, category, published, published_at, updated_at, clicks, external_url")
    .order("created_at", { ascending: false });

  return (
    <div>
      <PageHeader
        title="Blog Posts"
        description={`${posts?.length ?? 0} posts total`}
        action={
          <Button asChild size="sm" className="rounded-full px-4 text-xs font-medium tracking-wide">
            <Link href="/admin/blog/new">
              <Plus className="h-4 w-4 mr-1.5" strokeWidth={1.5} />
              New post
            </Link>
          </Button>
        }
      />

      {!posts?.length ? (
        <GlassCard className="text-center py-12">
          <p className="text-sm font-medium text-muted-foreground">No posts yet.</p>
          <Button asChild size="sm" className="mt-4 rounded-full">
            <Link href="/admin/blog/new">Write your first post</Link>
          </Button>
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <GlassCard
              key={post.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 px-5 transition-all duration-300"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 min-w-0">
                <Badge
                  variant={post.published ? "default" : "secondary"}
                  className={`text-[10px] uppercase tracking-wider font-medium shrink-0 self-start sm:self-auto ${!post.published && "bg-secondary/50 text-foreground/70"}`}
                >
                  {post.published ? "Published" : "Draft"}
                </Badge>
                <div className="min-w-0 mt-1 sm:mt-0">
                  <p className="text-base font-semibold tracking-tight text-foreground/90 truncate">{post.title}</p>
                  <p className="text-[11px] font-medium text-muted-foreground/80 tracking-wide uppercase mt-1">
                    {post.category} <span className="mx-1.5 opacity-50">·</span>{" "}
                    {post.external_url ? (
                      <span className="text-amber-500 font-medium">External ({post.clicks || 0} clicks)</span>
                    ) : (
                      post.published_at
                        ? format(new Date(post.published_at), "MMM d, yyyy")
                        : `Updated ${format(new Date(post.updated_at), "MMM d, yyyy")}`
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 mt-3 sm:mt-0">
                <BlogActions postId={post.id} published={post.published} slug={post.slug} />
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
