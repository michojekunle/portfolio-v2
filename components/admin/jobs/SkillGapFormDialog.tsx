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
import type { JobSkillGap } from "@/app/api/job-leads/route";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultRole: JobRole;
  onCreated: (role: JobRole, skill: JobSkillGap) => void;
}

function emptyForm(role: JobRole) {
  return { role, name: "", priority: "high" as JobSkillGap["priority"], why: "", resource: "" };
}

export function SkillGapFormDialog({ open, onOpenChange, defaultRole, onCreated }: Props): React.ReactElement {
  const [form, setForm] = useState(emptyForm(defaultRole));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setForm(emptyForm(defaultRole));
  }, [open, defaultRole]);

  const handleSave = async (): Promise<void> => {
    if (!form.name.trim() || !form.why.trim() || !form.resource.trim()) {
      toast.error("Name, why, and a resource link are required.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/job-skills-gap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: form.role,
          name: form.name.trim(),
          priority: form.priority,
          why: form.why.trim(),
          resource: form.resource.trim(),
        }),
      });
      const json = (await res.json()) as { skill?: JobSkillGap; error?: string };
      if (!res.ok || !json.skill) throw new Error(json.error ?? "Failed to save skill");
      onCreated(form.role, json.skill);
      toast.success("Skill added");
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
          <DialogTitle>Add Skill to Learn</DialogTitle>
          <DialogDescription>Add a skill recommendation to the Skills to Add list.</DialogDescription>
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
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Priority</label>
            <select
              value={form.priority}
              onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as JobSkillGap["priority"] }))}
              className="w-full h-10 bg-background border border-input rounded-md px-3 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Skill Name</label>
            <Input placeholder="e.g. gRPC + tonic" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Why it matters</label>
            <Textarea
              placeholder="One sentence — why this matters for the job market right now"
              value={form.why}
              onChange={(e) => setForm((f) => ({ ...f, why: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Learning Resource URL</label>
            <Input type="url" placeholder="https://..." value={form.resource} onChange={(e) => setForm((f) => ({ ...f, resource: e.target.value }))} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => void handleSave()} disabled={saving}>
            {saving ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Plus className="h-3.5 w-3.5 mr-1.5" />}
            Add Skill
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
