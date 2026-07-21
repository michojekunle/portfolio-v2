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
import { STATUS_LABEL, type ApplicationStatus, type JobApplication } from "./constants";

const BOARD_OPTIONS = ["LinkedIn", "Wellfound", "We Work Remotely", "Arc.dev", "RustJobs.dev", "Web3 Career", "ZK Jobs Board", "Other"];

function todayStr(): string {
  return new Date().toLocaleDateString("en-CA");
}

export interface ApplicationPrefill {
  company?: string;
  role?: JobRole;
  board?: string;
  url?: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prefill: ApplicationPrefill | null;
  onCreated: (app: JobApplication) => void;
}

function emptyForm(prefill: ApplicationPrefill | null) {
  return {
    date: todayStr(),
    role: prefill?.role ?? "flutter",
    company: prefill?.company ?? "",
    board: prefill?.board || "LinkedIn",
    status: "applied" as ApplicationStatus,
    followup: "",
    url: prefill?.url ?? "",
    notes: "",
  };
}

export function ApplicationFormDialog({ open, onOpenChange, prefill, onCreated }: Props): React.ReactElement {
  const [form, setForm] = useState(emptyForm(prefill));
  const [saving, setSaving] = useState(false);

  // Re-seed the form whenever the dialog is (re)opened with a new prefill (e.g. "+ Log" from a different lead card).
  useEffect(() => {
    if (open) setForm(emptyForm(prefill));
  }, [open, prefill]);

  const handleSave = async (): Promise<void> => {
    if (!form.company.trim()) {
      toast.error("Please enter the company name.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/job-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: form.date,
          role: form.role,
          company: form.company.trim(),
          board: form.board || null,
          status: form.status,
          followup: form.followup || null,
          url: form.url.trim() || null,
          notes: form.notes.trim() || null,
        }),
      });
      const json = (await res.json()) as { application?: JobApplication; error?: string };
      if (!res.ok || !json.application) throw new Error(json.error ?? "Failed to save application");
      onCreated(json.application);
      toast.success("Application logged");
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Log Application</DialogTitle>
          <DialogDescription>Record a new application to track its status over time.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Date Applied</label>
            <Input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
          </div>
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
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Company</label>
            <Input placeholder="e.g. Coinme" value={form.company} onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Job Board</label>
            <select
              value={form.board}
              onChange={(e) => setForm((f) => ({ ...f, board: e.target.value }))}
              className="w-full h-10 bg-background border border-input rounded-md px-3 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {BOARD_OPTIONS.map((b) => <option key={b}>{b}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as ApplicationStatus }))}
              className="w-full h-10 bg-background border border-input rounded-md px-3 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {(Object.keys(STATUS_LABEL) as ApplicationStatus[]).map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
            </select>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Follow-up Date</label>
            <Input type="date" value={form.followup} onChange={(e) => setForm((f) => ({ ...f, followup: e.target.value }))} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Job Listing URL</label>
            <Input type="url" placeholder="https://..." value={form.url} onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Notes / Tailoring</label>
            <Textarea placeholder="e.g. Emphasised ZK background…" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => void handleSave()} disabled={saving}>
            {saving ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Plus className="h-3.5 w-3.5 mr-1.5" />}
            Save Application
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
