import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Plus } from "lucide-react";
import { BlogActions } from "./blog-actions";

export default async function AdminBlogPage() {
  const supabase = await createClient();

  const { data: posts } = await supabase
    .from("blog_posts")
    .select("id, title, slug, category, published, published_at, updated_at")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Blog Posts</h1>
          <p className="text-sm text-muted-foreground mt-1">{posts?.length ?? 0} posts total</p>
        </div>
        <Button asChild size="sm">
          <Link href="/admin/blog/new">
            <Plus className="h-4 w-4 mr-1" />
            New post
          </Link>
        </Button>
      </div>

      {!posts?.length ? (
        <div className="content-card text-center py-12">
          <p className="text-muted-foreground text-sm">No posts yet.</p>
          <Button asChild size="sm" className="mt-4">
            <Link href="/admin/blog/new">Write your first post</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {posts.map((post) => (
            <div
              key={post.id}
              className="content-card flex items-center justify-between gap-4 py-4"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Badge
                  variant={post.published ? "default" : "secondary"}
                  className="text-xs shrink-0"
                >
                  {post.published ? "Published" : "Draft"}
                </Badge>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{post.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {post.category} ·{" "}
                    {post.published_at
                      ? format(new Date(post.published_at), "MMM d, yyyy")
                      : `Updated ${format(new Date(post.updated_at), "MMM d, yyyy")}`}
                  </p>
                </div>
              </div>
              <BlogActions postId={post.id} published={post.published} slug={post.slug} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
