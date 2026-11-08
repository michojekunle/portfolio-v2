"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, Pencil, Trash2, Eye, EyeOff } from "lucide-react";

interface BlogActionsProps {
  postId: string;
  published: boolean;
  slug: string;
}

export function BlogActions({ postId, published, slug }: BlogActionsProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const togglePublished = async (): Promise<void> => {
    setLoading("publish");
    const update = published
      ? { published: false, published_at: null }
      : { published: true, published_at: new Date().toISOString() };

    await supabase.from("blog_posts").update(update).eq("id", postId);
    setLoading(null);
    router.refresh();
  };

  const deletePost = async (): Promise<void> => {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    setLoading("delete");
    await supabase.from("blog_posts").delete().eq("id", postId);
    setLoading(null);
    router.refresh();
  };

  return (
    <div className="flex items-center gap-1 shrink-0">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={togglePublished}
        disabled={loading !== null}
        title={published ? "Unpublish" : "Publish"}
      >
        {loading === "publish" ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : published ? (
          <EyeOff className="h-3.5 w-3.5" />
        ) : (
          <Eye className="h-3.5 w-3.5" />
        )}
      </Button>
      <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
        <Link href={`/admin/blog/${postId}`}>
          <Pencil className="h-3.5 w-3.5" />
          <span className="sr-only">Edit</span>
        </Link>
      </Button>
      {published && (
        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
          <Link href={`/blog/${slug}`} target="_blank">
            <Eye className="h-3.5 w-3.5" />
            <span className="sr-only">View</span>
          </Link>
        </Button>
      )}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-destructive hover:text-destructive"
        onClick={deletePost}
        disabled={loading !== null}
      >
        {loading === "delete" ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Trash2 className="h-3.5 w-3.5" />
        )}
      </Button>
    </div>
  );
}
