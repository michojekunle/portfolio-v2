"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus } from "lucide-react";

interface ProjectFormState {
  title: string;
  description: string;
  github_url: string;
  demo_url: string;
  category: string;
  tags: string;
}

const EMPTY: ProjectFormState = {
  title: "",
  description: "",
  github_url: "",
  demo_url: "",
  category: "featured",
  tags: "",
};

export function AddProjectForm(): React.ReactElement {
  const [form, setForm] = useState<ProjectFormState>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const set = (key: keyof ProjectFormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
      setForm((f) => ({ ...f, [key]: e.target.value }));
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
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Title <span className="text-destructive">*</span>
          </label>
          <Input
            value={form.title}
            onChange={set("title")}
            placeholder="My Project"
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Category</label>
          <select
            value={form.category}
            onChange={set("category")}
            className="w-full h-9 bg-muted border border-border rounded-md px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="featured">featured</option>
            <option value="web3">web3</option>
            <option value="frontend">frontend</option>
            <option value="experiments">experiments</option>
          </select>
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <label className="text-xs font-medium text-muted-foreground">Description</label>
          <Input
            value={form.description}
            onChange={set("description")}
            placeholder="What does this project do?"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">GitHub URL</label>
          <Input
            value={form.github_url}
            onChange={set("github_url")}
            placeholder="https://github.com/..."
            type="url"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Demo URL</label>
          <Input
            value={form.demo_url}
            onChange={set("demo_url")}
            placeholder="https://..."
            type="url"
          />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <label className="text-xs font-medium text-muted-foreground">
            Tags <span className="text-muted-foreground/60">(comma-separated)</span>
          </label>
          <Input
            value={form.tags}
            onChange={set("tags")}
            placeholder="React, TypeScript, Solidity"
          />
        </div>
      </div>

      <Button type="submit" size="sm" disabled={saving || !form.title.trim()}>
        {saving ? (
          <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
        ) : (
          <Plus className="h-3.5 w-3.5 mr-1.5" />
        )}
        Add project
      </Button>
    </form>
  );
}
