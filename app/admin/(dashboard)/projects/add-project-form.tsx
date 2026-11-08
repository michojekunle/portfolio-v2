"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus } from "lucide-react";
import { ImageUpload } from "@/components/admin/image-upload";

interface ProjectFormState {
  title: string;
  description: string;
  github_url: string;
  demo_url: string;
  category: string;
  tags: string;
  image_url: string;
}

const EMPTY: ProjectFormState = {
  title: "",
  description: "",
  github_url: "",
  demo_url: "",
  category: "featured",
  tags: "",
  image_url: "",
};

export function AddProjectForm(): React.ReactElement {
  const [form, setForm] = useState<ProjectFormState>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const set = (key: keyof ProjectFormState) =>
    (val: string | React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
      if (typeof val === "string") {
        setForm((f) => ({ ...f, [key]: val }));
      } else {
        setForm((f) => ({ ...f, [key]: val.target.value }));
      }
    };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!form.title.trim()) return;

    setSaving(true);
    setError(null);

    const tags = form.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const { error: dbError } = await supabase.from("projects").insert([
      {
        title: form.title,
        description: form.description || null,
        github_url: form.github_url || null,
        demo_url: form.demo_url || null,
        category: form.category,
        tags,
        image_url: form.image_url || null,
        updated_at: new Date().toISOString(),
      },
    ]);

    if (dbError) {
      setError(dbError.message);
      setSaving(false);
      return;
    }

    setForm(EMPTY);
    setSaving(false);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <ImageUpload 
            value={form.image_url} 
            onChange={(url) => set("image_url")(url)} 
          />
        </div>

        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Title <span className="text-destructive">*</span>
            </label>
            <Input
              value={form.title}
              onChange={set("title")}
              placeholder="My Project"
              required
              className="bg-muted/30 border-border"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Category</label>
            <select
              value={form.category}
              onChange={set("category")}
              className="w-full h-10 bg-muted/30 border border-border rounded-md px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="featured">featured</option>
              <option value="web3">web3</option>
              <option value="frontend">frontend</option>
              <option value="experiments">experiments</option>
            </select>
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Description</label>
            <Input
              value={form.description}
              onChange={set("description")}
              placeholder="What does this project do?"
              className="bg-muted/30 border-border"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">GitHub URL</label>
            <Input
              value={form.github_url}
              onChange={set("github_url")}
              placeholder="https://github.com/..."
              type="url"
              className="bg-muted/30 border-border"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Demo URL</label>
            <Input
              value={form.demo_url}
              onChange={set("demo_url")}
              placeholder="https://..."
              type="url"
              className="bg-muted/30 border-border"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Tags <span className="text-muted-foreground/60">(comma-separated)</span>
            </label>
            <Input
              value={form.tags}
              onChange={set("tags")}
              placeholder="React, TypeScript, Solidity"
              className="bg-muted/30 border-border"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" size="lg" disabled={saving || !form.title.trim()} className="px-8">
          {saving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Plus className="h-4 w-4 mr-2" />
          )}
          Add Project
        </Button>
      </div>
    </form>
  );
}

