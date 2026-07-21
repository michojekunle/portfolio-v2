"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Trash2 } from "lucide-react";
import { ROLE_LABEL, STATUS_BADGE_VARIANT, STATUS_LABEL, type ApplicationStatus, type JobApplication } from "./constants";

interface Props {
  application: JobApplication | null;
  onClose: () => void;
  onStatusChange: (id: string, status: ApplicationStatus) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function ApplicationDetailDialog({ application, onClose, onStatusChange, onDelete }: Props): React.ReactElement {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (): Promise<void> => {
    if (!application) return;
    if (!confirm("Remove this application?")) return;
    setDeleting(true);
    try {
      await onDelete(application.id);
      toast.success("Application removed");
      onClose();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={application !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto">
        {application && (
          <>
            <DialogHeader>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{ROLE_LABEL[application.role]}</p>
              <DialogTitle className="text-xl">{application.company}</DialogTitle>
            </DialogHeader>

            <div className="flex items-center gap-3 py-2 border-y border-border">
              <Badge variant={STATUS_BADGE_VARIANT[application.status]}>{STATUS_LABEL[application.status]}</Badge>
              <select
                value={application.status}
                onChange={(e) => void onStatusChange(application.id, e.target.value as ApplicationStatus)}
                className="ml-auto h-8 bg-muted border border-border rounded px-2 text-xs focus:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {(Object.keys(STATUS_LABEL) as ApplicationStatus[]).map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
              </select>
            </div>

            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Date</p>
                  <p className="text-sm">{application.date || "—"}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Board</p>
                  <p className="text-sm">{application.board || "—"}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Follow-up</p>
                  <p className="text-sm">{application.followup || "Not set"}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">URL</p>
                  {application.url ? (
                    <a href={application.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline break-all">
                      Listing ↗
                    </a>
                  ) : (
                    <p className="text-sm text-muted-foreground">No URL saved</p>
                  )}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Notes</p>
                <p className="text-sm whitespace-pre-wrap leading-relaxed bg-muted/60 rounded-md p-3">
                  {application.notes || "No notes added."}
                </p>
              </div>
            </div>

            <DialogFooter className="border-t border-border pt-4">
              <Button
                variant="ghost"
                className="text-destructive hover:text-destructive sm:mr-auto"
                onClick={() => void handleDelete()}
                disabled={deleting}
              >
                {deleting ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5 mr-1.5" />}
                Remove
              </Button>
              <Button onClick={onClose}>Done</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
