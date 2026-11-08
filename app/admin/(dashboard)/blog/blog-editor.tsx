"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Save, Eye, Upload } from "lucide-react";
import { TiptapEditor } from "@/components/admin/tiptap-editor";
import Image from "next/image";
import { PageHeader } from "@/components/admin/ui/page-header";
import { GlassCard } from "@/components/admin/ui/glass-card";

interface BlogPost {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  read_time: string;
  published: boolean;
  external_url?: string;
  cover_image?: string;
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
    external_url: post?.external_url ?? "",
    cover_image: post?.cover_image ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("bucket", "blog");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const { url } = await res.json();
      setForm((f) => ({ ...f, cover_image: url }));
    } catch (err) {
      console.error(err);
      alert("Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
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

    const { id, ...postData } = data;
    const { error: dbError } = isNew
      ? await supabase.from("blog_posts").insert([postData])
      : await supabase.from("blog_posts").update(data).eq("id", id!);

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
      <PageHeader
        title={isNew ? "New Post" : "Edit Post"}
        description={isNew ? "Create a new entry in your journal" : "Update this post"}
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSave()}
              disabled={saving}
              className="bg-transparent border-border/40 hover:bg-secondary/40 hover:text-foreground"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-1.5" strokeWidth={1.5} />}
              {form.published ? "Save changes" : "Save draft"}
            </Button>
            <Button
              size="sm"
              onClick={() => handleSave(!form.published)}
              disabled={saving}
            >
              {form.published ? "Unpublish" : "Publish"}
            </Button>
          </div>
        }
      />

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium rounded-lg">
          {error}
        </div>
      )}

      <GlassCard className="p-6 space-y-6" hoverEffect={false}>
        {/* Meta fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2.5">
            <label className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">Title</label>
            <Input
              value={form.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Post title"
              className="bg-background/50 border-border/40 focus-visible:ring-1 focus-visible:ring-foreground/20"
            />
          </div>
          <div className="space-y-2.5">
            <label className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">Slug</label>
            <Input
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              placeholder="post-slug"
              className="bg-background/50 border-border/40 focus-visible:ring-1 focus-visible:ring-foreground/20"
            />
          </div>
          <div className="space-y-2.5">
            <label className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">Category</label>
            <div className="flex flex-wrap gap-2 pt-1">
              {["Technical", "Web3", "Reflection", "ZKML", "First Principles", "Life & Learning"].map((cat) => (
                <Badge
                  key={cat}
                  variant={form.category === cat ? "default" : "outline"}
                  className={`cursor-pointer transition-colors text-[10px] uppercase tracking-wider font-medium ${form.category === cat ? "" : "border-border/40 hover:border-border/80 text-muted-foreground"}`}
                  onClick={() => setForm((f) => ({ ...f, category: cat }))}
                >
                  {cat}
                </Badge>
              ))}
            </div>
          </div>
          <div className="space-y-2.5">
            <label className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">Read time</label>
            <Input
              value={form.read_time}
              onChange={(e) => setForm((f) => ({ ...f, read_time: e.target.value }))}
              placeholder="5 min read"
              className="bg-background/50 border-border/40 focus-visible:ring-1 focus-visible:ring-foreground/20"
            />
          </div>
          <div className="space-y-2.5 sm:col-span-2">
            <label className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">External URL (Optional)</label>
            <Input
              value={form.external_url}
              onChange={(e) => setForm((f) => ({ ...f, external_url: e.target.value }))}
              placeholder="https://medium.com/@username/post-slug"
              className="bg-background/50 border-border/40 focus-visible:ring-1 focus-visible:ring-foreground/20"
            />
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">If provided, this post will link directly to the external platform.</p>
          </div>
        </div>

        <div className="space-y-2.5">
          <label className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">Cover Image</label>
          <div className="flex items-center gap-4">
            <Input
              value={form.cover_image}
              onChange={(e) => setForm((f) => ({ ...f, cover_image: e.target.value }))}
              placeholder="Image URL or upload one ->"
              className="flex-1 bg-background/50 border-border/40 focus-visible:ring-1 focus-visible:ring-foreground/20"
            />
            <div className="relative shrink-0">
              <input
                type="file"
                accept="image/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleImageUpload}
                disabled={uploadingImage}
              />
              <Button type="button" variant="outline" disabled={uploadingImage} className="bg-transparent border-border/40 hover:bg-secondary/40">
                {uploadingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4 mr-2" strokeWidth={1.5} />}
                {uploadingImage ? "Uploading..." : "Upload Image"}
              </Button>
            </div>
          </div>
          {form.cover_image && (
            <div className="relative w-full h-48 mt-4 rounded-xl overflow-hidden border border-border/40 shadow-sm">
              <Image src={form.cover_image} alt="Cover preview" fill className="object-cover" />
            </div>
          )}
        </div>

        <div className="space-y-2.5">
          <label className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">Excerpt</label>
          <Input
            value={form.excerpt}
            onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
            placeholder="Short summary shown in blog listing"
            className="bg-background/50 border-border/40 focus-visible:ring-1 focus-visible:ring-foreground/20"
          />
        </div>
      </GlassCard>

      {/* Content editor (Tiptap) */}
      <GlassCard className="p-0 overflow-hidden border-border/40" hoverEffect={false}>
        <div className="px-6 py-4 border-b border-border/40 bg-secondary/10">
          <h2 className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">Content</h2>
        </div>
        <div className="p-4 sm:p-6 bg-background/20">
          <TiptapEditor 
            content={form.content} 
            onChange={(html, text) => {
              setForm((f) => ({
                ...f,
                content: html,
                read_time: computeReadTime(text),
              }));
            }} 
          />
        </div>
      </GlassCard>
    </div>
  );
}
