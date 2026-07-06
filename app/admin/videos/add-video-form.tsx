"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus } from "lucide-react";
import type { VideoPlatform, VideoSection } from "@/lib/videos/types";

interface VideoFormState {
  platform: VideoPlatform;
  url: string;
  title: string;
  description: string;
  section: VideoSection;
  display_order: string;
}

const EMPTY: VideoFormState = {
  platform: "youtube",
  url: "",
  title: "",
  description: "",
  section: "highlight",
  display_order: "0",
};

export function AddVideoForm(): React.ReactElement {
  const [form, setForm] = useState<VideoFormState>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const set =
    (key: keyof VideoFormState) =>
    (val: string | React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
      const value = typeof val === "string" ? val : val.target.value;
      setForm((f) => ({ ...f, [key]: value }));
    };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!form.title.trim() || !form.url.trim()) return;

    setSaving(true);
    setError(null);

    const { error: dbError } = await supabase.from("site_videos").insert([
      {
        platform: form.platform,
        url: form.url.trim(),
        title: form.title.trim(),
        description: form.description.trim() || null,
        section: form.section,
        display_order: Number(form.display_order) || 0,
        is_published: true,
      },
    ]);

    if (dbError) {
      setError(
        dbError.code === "23505"
          ? "There's already an intro video — edit or delete it first."
          : dbError.message || "Failed to add video"
      );
      setSaving(false);
      return;
    }

    setForm(EMPTY);
    setSaving(false);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Platform
          </label>
          <select
            value={form.platform}
            onChange={set("platform")}
            className="w-full h-10 bg-muted/30 border border-border rounded-md px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="youtube">YouTube</option>
            <option value="instagram">Instagram</option>
            <option value="tiktok">TikTok</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Section
          </label>
          <select
            value={form.section}
            onChange={set("section")}
            className="w-full h-10 bg-muted/30 border border-border rounded-md px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="intro">Intro (hero — only one allowed)</option>
            <option value="featured">Featured (hero sidebar)</option>
            <option value="highlight">Highlights grid</option>
          </select>
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Video URL
          </label>
          <Input
            value={form.url}
            onChange={set("url")}
            placeholder="https://www.youtube.com/watch?v=..."
            className="bg-muted/30"
          />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Title
          </label>
          <Input value={form.title} onChange={set("title")} className="bg-muted/30" />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Description (optional)
          </label>
          <Input value={form.description} onChange={set("description")} className="bg-muted/30" />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Display order
          </label>
          <Input
            type="number"
            value={form.display_order}
            onChange={set("display_order")}
            className="bg-muted/30"
          />
        </div>
      </div>

      <Button type="submit" disabled={saving}>
        {saving ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Plus className="h-4 w-4 mr-2" />
        )}
        Add video
      </Button>
    </form>
  );
}
