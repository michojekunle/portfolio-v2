"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Pencil, Save } from "lucide-react";
import type { SiteVideo } from "@/lib/videos/types";

interface Props {
  video: SiteVideo;
}

export function EditVideoDialog({ video }: Props): React.ReactElement {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    platform: video.platform,
    url: video.url,
    title: video.title,
    description: video.description ?? "",
    section: video.section,
    display_order: String(video.display_order),
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const set =
    (key: keyof typeof form) =>
    (val: string | React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
      const value = typeof val === "string" ? val : val.target.value;
      setForm((f) => ({ ...f, [key]: value }));
    };

  const handleSave = async (): Promise<void> => {
    if (!form.title.trim() || !form.url.trim()) return;

    setSaving(true);
    setError(null);

    const { error: dbError } = await supabase
      .from("site_videos")
      .update({
        platform: form.platform,
        url: form.url.trim(),
        title: form.title.trim(),
        description: form.description.trim() || null,
        section: form.section,
        display_order: Number(form.display_order) || 0,
      })
      .eq("id", video.id);

    if (dbError) {
      setError(
        dbError.code === "23505"
          ? "There's already an intro video — remove it first."
          : dbError.message || "Failed to update video"
      );
      setSaving(false);
      return;
    }

    setSaving(false);
    setOpen(false);
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit">
          <Pencil className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit video</DialogTitle>
          <DialogDescription>Update the video's details and placement.</DialogDescription>
        </DialogHeader>

        {error && (
          <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
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
              <option value="intro">Intro (hero)</option>
              <option value="featured">Featured (hero sidebar)</option>
              <option value="highlight">Highlights grid</option>
            </select>
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Video URL
            </label>
            <Input value={form.url} onChange={set("url")} className="bg-muted/30" />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Title
            </label>
            <Input value={form.title} onChange={set("title")} className="bg-muted/30" />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Description
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

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => void handleSave()} disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
