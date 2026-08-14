"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus } from "lucide-react";
import type { JobRole } from "@/lib/admin/job-search-data";
import type { JobProjectToBuild } from "@/app/api/job-leads/route";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultRole: JobRole;
  onCreated: (role: JobRole, project: JobProjectToBuild) => void;
}

function emptyForm(role: JobRole) {
  return { role, name: "", description: "", skills: "", difficulty: "Medium" as JobProjectToBuild["difficulty"], weeks: "2" };
}

export function ProjectToBuildFormDialog({ open, onOpenChange, defaultRole, onCreated }: Props): React.ReactElement {
  const [form, setForm] = useState(emptyForm(defaultRole));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setForm(emptyForm(defaultRole));
  }, [open, defaultRole]);

  const handleSave = async (): Promise<void> => {
    const weeksNum = parseInt(form.weeks, 10);
    if (!form.name.trim() || !form.description.trim()) {
      toast.error("Name and description are required.");
      return;
    }
    if (!Number.isFinite(weeksNum) || weeksNum < 1) {
      toast.error("Weeks must be a positive number.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/job-projects-to-build", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: form.role,
          name: form.name.trim(),
          description: form.description.trim(),
          skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
          difficulty: form.difficulty,
          weeks: weeksNum,
        }),
      });
      const json = (await res.json()) as { project?: JobProjectToBuild; error?: string };
      if (!res.ok || !json.project) throw new Error(json.error ?? "Failed to save project");
      onCreated(form.role, json.project);
      toast.success("Project added");
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Project to Build</DialogTitle>
          <DialogDescription>Add a proof-of-work project idea to the list.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Role</label>
            <select
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as JobRole }))}
              className="w-full h-10 bg-background border border-input rounded-md px-3 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="flutter">🐦 Flutter Engineer</option>
              <option value="rust">🦀 Rust Systems Engineer</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Difficulty</label>
            <select
              value={form.difficulty}
              onChange={(e) => setForm((f) => ({ ...f, difficulty: e.target.value as JobProjectToBuild["difficulty"] }))}
              className="w-full h-10 bg-background border border-input rounded-md px-3 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Project Name</label>
            <Input placeholder="e.g. gRPC Microservice" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Description</label>
            <Textarea
              placeholder="What it is, what it proves, what it's built with"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Skills (comma-separated)</label>
            <Input placeholder="tonic, protobuf, Tokio, Docker" value={form.skills} onChange={(e) => setForm((f) => ({ ...f, skills: e.target.value }))} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Estimated Weeks</label>
            <Input type="number" min={1} max={52} value={form.weeks} onChange={(e) => setForm((f) => ({ ...f, weeks: e.target.value }))} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => void handleSave()} disabled={saving}>
            {saving ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Plus className="h-3.5 w-3.5 mr-1.5" />}
            Add Project
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
