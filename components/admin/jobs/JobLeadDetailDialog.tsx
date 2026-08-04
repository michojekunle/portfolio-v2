"use client";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Circle } from "lucide-react";
import type { JobLead } from "@/app/api/job-leads/route";
import type { ApplicationPrefill } from "./ApplicationFormDialog";

interface Props {
  lead: JobLead | null;
  role: "flutter" | "rust" | null;
  onClose: () => void;
  onLogLead: (prefill: ApplicationPrefill) => void;
  learnedSkills: Set<string>;
  builtProjects: Set<string>;
  onToggleProgress: (kind: "skill" | "project", name: string) => Promise<void>;
  pendingToggles: Set<string>;
}

const DIFFICULTY_VARIANT: Record<string, "secondary" | "default" | "destructive"> = {
  Easy: "secondary",
  Medium: "default",
  Hard: "destructive",
};

export function JobLeadDetailDialog({
  lead,
  role,
  onClose,
  onLogLead,
  learnedSkills,
  builtProjects,
  onToggleProgress,
  pendingToggles,
}: Props): React.ReactElement {
  return (
    <Dialog open={lead !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
        {lead && role && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{role === "rust" ? "🦀 Rust" : "🐦 Flutter"}</Badge>
                {lead.board && <span className="text-xs text-muted-foreground">{lead.board}</span>}
              </div>
              <DialogTitle className="text-xl">{lead.company}</DialogTitle>
              <p className="text-sm text-muted-foreground">{lead.title}</p>
              {lead.salary && (
                <Badge variant="secondary" className="w-fit text-emerald-700 dark:text-emerald-400">
                  💰 {lead.salary}
                </Badge>
              )}
            </DialogHeader>

            <div className="space-y-4 py-2">
              {lead.tip && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Why it fits you</p>
                  <p className="text-sm leading-relaxed bg-muted/60 rounded-md p-3 border-l-2 border-primary/40">
                    {lead.tip}
                  </p>
                </div>
              )}

              {lead.requirements && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Requirements</p>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{lead.requirements}</p>
                </div>
              )}

              {(lead.skills ?? []).length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                    Skills to learn from this posting
                  </p>
                  <div className="space-y-1.5">
                    {(lead.skills ?? []).map((skill) => {
                      const done = learnedSkills.has(skill);
                      const pending = pendingToggles.has(`skill:${skill}`);
                      return (
                        <button
                          key={skill}
                          onClick={() => void onToggleProgress("skill", skill)}
                          disabled={pending}
                          className={`w-full flex items-center gap-2 text-left text-sm rounded-md border px-3 py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                            done
                              ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800"
                              : "bg-muted/40 border-border hover:border-primary/40"
                          }`}
                        >
                          {done ? (
                            <Check className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <Circle className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                          )}
                          <span className="flex-1">{skill}</span>
                          <span className="text-xs text-muted-foreground shrink-0">
                            {done ? "Learned" : "Mark learned"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {(lead.projects ?? []).length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                    Projects to build for this role
                  </p>
                  <div className="space-y-2">
                    {(lead.projects ?? []).map((project) => {
                      const done = builtProjects.has(project.name);
                      const pending = pendingToggles.has(`project:${project.name}`);
                      return (
                        <div
                          key={project.name}
                          className={`rounded-md border p-3 transition-colors ${
                            done
                              ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800"
                              : "bg-muted/40 border-border"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <p className="text-sm font-medium">{project.name}</p>
                            <Badge variant={DIFFICULTY_VARIANT[project.difficulty] ?? "secondary"} className="text-xs shrink-0">
                              {project.difficulty}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed mb-2">{project.desc}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              ~{project.weeks} week{project.weeks > 1 ? "s" : ""}
                            </span>
                            <Button
                              size="sm"
                              variant={done ? "secondary" : "outline"}
                              onClick={() => void onToggleProgress("project", project.name)}
                              disabled={pending}
                            >
                              {done ? "✓ Built" : "Mark built"}
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="border-t border-border pt-4 gap-2">
              <Button
                variant="outline"
                onClick={() =>
                  onLogLead({ company: lead.company, role, board: lead.board ?? "", url: lead.url ?? "" })
                }
              >
                + Log Application
              </Button>
              {lead.url && (
                <Button asChild>
                  <a href={lead.url} target="_blank" rel="noopener noreferrer">
                    Apply Now ↗
                  </a>
                </Button>
              )}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
