"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, Trash2, Save } from "lucide-react";

interface BuildingProject {
  id: string;
  name: string;
  description: string | null;
  status: string;
  notes: string | null;
  github_url: string | null;
  sort_order: number;
}

const STATUSES = ["In Progress", "Paused", "Shipped", "Ideating"] as const;

interface ProjectRowProps {
  project: BuildingProject;
  onDelete: (id: string) => Promise<void>;
}

function ProjectRow({ project, onDelete }: ProjectRowProps): React.ReactElement {
  const [form, setForm] = useState({
    name: project.name,
    description: project.description ?? "",
    status: project.status,
    notes: project.notes ?? "",
    github_url: project.github_url ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const save = async (): Promise<void> => {
    setSaving(true);
    await supabase
      .from("building_projects")
      .update({
        ...form,
        description: form.description || null,
        notes: form.notes || null,
        github_url: form.github_url || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", project.id);
    setSaving(false);
    router.refresh();
  };

  const handleDelete = async (): Promise<void> => {
    setDeleting(true);
    await onDelete(project.id);
    setDeleting(false);
  };

  return (
    <div className="content-card py-4 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="Project name"
        />
        <select
          value={form.status}
          onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
          className="h-9 bg-muted border border-border rounded-md px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <Input
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          placeholder="Short description"
          className="sm:col-span-2"
        />
        <Input
          value={form.github_url}
          onChange={(e) => setForm((f) => ({ ...f, github_url: e.target.value }))}
          placeholder="https://github.com/..."
          type="url"
          className="sm:col-span-2"
        />
      </div>

      <textarea
        value={form.notes}
        onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
        rows={4}
        placeholder="Notes / thoughts (markdown, shown publicly)..."
        className="w-full bg-muted/60 border border-border rounded-md p-3 text-sm font-mono resize-y focus:outline-none focus:ring-1 focus:ring-ring"
      />

      <div className="flex justify-end gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive hover:text-destructive"
          onClick={handleDelete}
          disabled={deleting}
        >
          {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
        </Button>
        <Button size="sm" onClick={save} disabled={saving}>
          {saving ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Save className="h-3.5 w-3.5 mr-1.5" />}
          Save
        </Button>
      </div>
    </div>
  );
}

interface BuildingManagerProps {
  initialProjects: BuildingProject[];
}

export function BuildingManager({ initialProjects }: BuildingManagerProps): React.ReactElement {
  const [projects, setProjects] = useState<BuildingProject[]>(initialProjects);
  const [adding, setAdding] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const addProject = async (): Promise<void> => {
    setAdding(true);
    const { data } = await supabase
      .from("building_projects")
      .insert([{ name: "New project", status: "In Progress" }])
      .select()
      .single();
    if (data) setProjects((prev) => [...prev, data as BuildingProject]);
    setAdding(false);
    router.refresh();
  };

  const deleteProject = async (id: string): Promise<void> => {
    if (!confirm("Delete this project?")) return;
    await supabase.from("building_projects").delete().eq("id", id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
    router.refresh();
  };

  return (
    <div className="space-y-3">
      {projects.map((project) => (
        <ProjectRow key={project.id} project={project} onDelete={deleteProject} />
      ))}
      <Button variant="outline" size="sm" onClick={addProject} disabled={adding}>
        {adding ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Plus className="h-3.5 w-3.5 mr-1.5" />}
        Add project
      </Button>
    </div>
  );
}
