"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Save, Eye } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface BlogPost {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  read_time: string;
  published: boolean;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function computeReadTime(content: string): string {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 230));
  return `${minutes} min`;
}

export function BlogEditor({ post }: { post?: BlogPost }) {
  const isNew = !post?.id;
  const [form, setForm] = useState<BlogPost>({
    id: post?.id,
    title: post?.title ?? "",
    slug: post?.slug ?? "",
    excerpt: post?.excerpt ?? "",
    content: post?.content ?? "",
    category: post?.category ?? "Technical",
    read_time: post?.read_time ?? "",
    published: post?.published ?? false,
  });
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleTitleChange = (title: string): void => {
    setForm((f) => ({
      ...f,
      title,
      slug: isNew ? slugify(title) : f.slug,
    }));
  };

  const handleSave = async (publish?: boolean): Promise<void> => {
    setSaving(true);
    setError(null);

    const data = {
      ...form,
      updated_at: new Date().toISOString(),
      ...(publish !== undefined && {
        published: publish,
        published_at: publish ? new Date().toISOString() : null,
      }),
    };

    const { error: dbError } = isNew
      ? await supabase.from("blog_posts").insert([data])
      : await supabase.from("blog_posts").update(data).eq("id", form.id!);

    if (dbError) {
      setError(dbError.message);
      setSaving(false);
      return;
    }

    setSaving(false);
    router.push("/admin/blog");
    router.refresh();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">
          {isNew ? "New post" : "Edit post"}
        </h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPreview((p) => !p)}
          >
            <Eye className="h-4 w-4 mr-1" />
            {preview ? "Edit" : "Preview"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSave()}
            disabled={saving}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
            Save draft
          </Button>
          <Button
            size="sm"
            onClick={() => handleSave(!form.published)}
            disabled={saving}
          >
            {form.published ? "Unpublish" : "Publish"}
          </Button>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Meta fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Title</label>
          <Input
            value={form.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Post title"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Slug</label>
          <Input
            value={form.slug}
            onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
            placeholder="post-slug"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Category</label>
          <div className="flex gap-2">
            {["Technical", "Web3", "Reflection"].map((cat) => (
              <Badge
                key={cat}
                variant={form.category === cat ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setForm((f) => ({ ...f, category: cat }))}
              >
                {cat}
              </Badge>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Read time</label>
          <Input
            value={form.read_time}
            onChange={(e) => setForm((f) => ({ ...f, read_time: e.target.value }))}
            placeholder="5 min read"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Excerpt</label>
        <Input
          value={form.excerpt}
          onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
          placeholder="Short summary shown in blog listing"
        />
      </div>

      {/* Content editor / preview */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Content (Markdown)</label>
        {preview ? (
          <div className="content-card prose dark:prose-invert max-w-none min-h-[400px]">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {form.content || "*Nothing to preview yet.*"}
            </ReactMarkdown>
          </div>
        ) : (
          <textarea
            value={form.content}
            onChange={(e) => {
              const content = e.target.value;
              setForm((f) => ({
                ...f,
                content,
                read_time: computeReadTime(content),
              }));
            }}
            className="w-full min-h-[400px] bg-muted/60 border border-border rounded-md p-4 text-sm font-mono resize-y focus:outline-none focus:ring-1 focus:ring-ring"
            placeholder="Write your post in Markdown..."
          />
        )}
      </div>
    </div>
  );
}
