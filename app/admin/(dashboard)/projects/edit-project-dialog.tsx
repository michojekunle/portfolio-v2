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
import { ImageUpload } from "@/components/admin/image-upload";
import { toast } from "sonner";

interface Project {
  id: string;
  title: string;
  description: string | null;
  tags: string[] | null;
  github_url: string | null;
  demo_url: string | null;
  category: string;
  image_url: string | null;
}

interface EditProjectDialogProps {
  project: Project;
}

export function EditProjectDialog({ project }: EditProjectDialogProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: project.title,
    description: project.description || "",
    github_url: project.github_url || "",
    demo_url: project.demo_url || "",
    category: project.category,
    tags: project.tags?.join(", ") || "",
    image_url: project.image_url || "",
  });
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const set = (key: string) => (val: string | React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = typeof val === "string" ? val : val.target.value;
    setForm((f) => ({ ...f, [key]: value }));
  };

  const handleSave = async () => {
    if (!form.title.trim()) return;

    setSaving(true);
    const tags = form.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      const { error } = await supabase
        .from("projects")
        .update({
          title: form.title,
          description: form.description || null,
          github_url: form.github_url || null,
          demo_url: form.demo_url || null,
          category: form.category,
          tags,
          image_url: form.image_url || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", project.id);

      if (error) throw error;

      toast.success("Project updated successfully");
      setOpen(false);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to update project");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit">
          <Pencil className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
          <DialogDescription>
            Update project details and image.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
          <div className="md:col-span-1">
            <ImageUpload 
              value={form.image_url} 
              onChange={(url) => set("image_url")(url)} 
            />
          </div>

          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Title</label>
              <Input
                value={form.title}
                onChange={set("title")}
                className="bg-muted/30"
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
                className="bg-muted/30"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">GitHub URL</label>
              <Input
                value={form.github_url}
                onChange={set("github_url")}
                className="bg-muted/30"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Demo URL</label>
              <Input
                value={form.demo_url}
                onChange={set("demo_url")}
                className="bg-muted/30"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Tags</label>
              <Input
                value={form.tags}
                onChange={set("tags")}
                className="bg-muted/30"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
