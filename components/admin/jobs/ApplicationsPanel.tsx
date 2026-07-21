"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Inbox, Plus, Trash2 } from "lucide-react";
import { ROLE_LABEL, STATUS_BADGE_VARIANT, STATUS_LABEL, type ApplicationStatus, type JobApplication } from "./constants";
import { ApplicationFormDialog, type ApplicationPrefill } from "./ApplicationFormDialog";
import { ApplicationDetailDialog } from "./ApplicationDetailDialog";
import type { JobRole } from "@/lib/admin/job-search-data";

type Filter = "all" | JobRole | ApplicationStatus;

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "flutter", label: "🐦 Flutter" },
  { value: "rust", label: "🦀 Rust" },
  { value: "applied", label: "Applied" },
  { value: "interviewing", label: "Interviewing" },
  { value: "offer", label: "🎉 Offer" },
];

interface Props {
  apps: JobApplication[];
  onCreate: (app: JobApplication) => void;
  onStatusChange: (id: string, status: ApplicationStatus) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  logDialogOpen: boolean;
  onLogDialogOpenChange: (open: boolean) => void;
  logPrefill: ApplicationPrefill | null;
}

export function ApplicationsPanel({
  apps,
  onCreate,
  onStatusChange,
  onDelete,
  logDialogOpen,
  onLogDialogOpenChange,
  logPrefill,
}: Props): React.ReactElement {
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const rows = useMemo(() => {
    let r = [...apps].sort((a, b) => (a.date < b.date ? 1 : -1));
    if (filter === "flutter" || filter === "rust") r = r.filter((a) => a.role === filter);
    else if (filter !== "all") r = r.filter((a) => a.status === filter);
    return r;
  }, [apps, filter]);

  const selectedApp = selectedId ? apps.find((a) => a.id === selectedId) ?? null : null;

  const handleQuickDelete = async (e: React.MouseEvent, id: string): Promise<void> => {
    e.stopPropagation();
    if (!confirm("Remove this application?")) return;
    await onDelete(id);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex gap-1.5 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap",
                filter === f.value
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <Button size="sm" onClick={() => onLogDialogOpenChange(true)}>
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          Log Application
        </Button>
      </div>

      {rows.length === 0 ? (
        <div className="content-card text-center py-10">
          <Inbox className="h-8 w-8 mx-auto mb-3 text-muted-foreground/50" />
          <p className="text-sm font-medium mb-1">No applications yet</p>
          <p className="text-xs text-muted-foreground">Hit &ldquo;Log Application&rdquo; after each apply.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {rows.map((a) => (
            <div
              key={a.id}
              role="button"
              tabIndex={0}
              onClick={() => setSelectedId(a.id)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelectedId(a.id); } }}
              className="content-card w-full flex items-center gap-3 py-3 text-left hover:border-foreground/20 transition-colors cursor-pointer"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <p className="text-sm font-medium truncate">{a.company}</p>
                  <Badge variant="secondary" className="text-xs shrink-0">{ROLE_LABEL[a.role]}</Badge>
                  <Badge variant={STATUS_BADGE_VARIANT[a.status]} className="text-xs shrink-0">{STATUS_LABEL[a.status]}</Badge>
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {a.board || "—"}
                  {a.notes ? ` · ${a.notes}` : ""}
                </p>
              </div>
              <div className="text-right shrink-0 flex items-center gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">{a.date ? format(new Date(a.date), "MMM d") : "—"}</p>
                  {a.followup && <p className="text-xs text-muted-foreground">follow-up {format(new Date(a.followup), "MMM d")}</p>}
                </div>
                <button
                  type="button"
                  onClick={(e) => void handleQuickDelete(e, a.id)}
                  className="shrink-0 p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  aria-label="Remove application"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ApplicationFormDialog
        open={logDialogOpen}
        onOpenChange={onLogDialogOpenChange}
        prefill={logPrefill}
        onCreated={onCreate}
      />
      <ApplicationDetailDialog
        application={selectedApp}
        onClose={() => setSelectedId(null)}
        onStatusChange={onStatusChange}
        onDelete={onDelete}
      />
    </div>
  );
}
