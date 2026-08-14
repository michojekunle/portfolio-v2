"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Plus, Trash2 } from "lucide-react";
import {
  JOB_BOARDS,
  PRIORITY_CONFIG,
  PROOF_OF_WORK_PROJECTS,
  SKILLS_GAP,
  type JobRole,
  type SkillGapItem,
  type ProofOfWorkProject,
} from "@/lib/admin/job-search-data";
import type { JobSkillGap, JobProjectToBuild } from "@/app/api/job-leads/route";
import { SkillGapFormDialog } from "./SkillGapFormDialog";
import { ProjectToBuildFormDialog } from "./ProjectToBuildFormDialog";

const DIFFICULTY_VARIANT: Record<"Easy" | "Medium" | "Hard", "secondary" | "outline" | "destructive"> = {
  Easy: "secondary",
  Medium: "outline",
  Hard: "destructive",
};

interface Props {
  skillsGap: { flutter: JobSkillGap[]; rust: JobSkillGap[] };
  projectsToBuild: { flutter: JobProjectToBuild[]; rust: JobProjectToBuild[] };
  onAddSkillGap: (role: JobRole, skill: JobSkillGap) => void;
  onDeleteSkillGap: (role: JobRole, id: string) => void;
  onAddProjectToBuild: (role: JobRole, project: JobProjectToBuild) => void;
  onDeleteProjectToBuild: (role: JobRole, id: string) => void;
}

// A dynamically-added skill/project shares a name with a curated seed one —
// the DB-backed version wins so an edit-by-re-add (upsert on role+name)
// actually replaces what's shown, instead of appearing as a duplicate.
function mergeByName<TSeed extends { name: string }, TDynamic extends { name: string; id: string }>(
  seed: TSeed[],
  dynamic: TDynamic[]
): (TSeed | TDynamic)[] {
  const dynamicNames = new Set(dynamic.map((d) => d.name));
  return [...seed.filter((s) => !dynamicNames.has(s.name)), ...dynamic];
}

export function ResourcesPanel({
  skillsGap,
  projectsToBuild,
  onAddSkillGap,
  onDeleteSkillGap,
  onAddProjectToBuild,
  onDeleteProjectToBuild,
}: Props): React.ReactElement {
  const [projFilter, setProjFilter] = useState<"all" | JobRole>("all");
  const [skillDialogRole, setSkillDialogRole] = useState<JobRole | null>(null);
  const [projectDialogRole, setProjectDialogRole] = useState<JobRole | null>(null);

  const mergedSkills: Record<JobRole, (SkillGapItem | JobSkillGap)[]> = {
    flutter: mergeByName(SKILLS_GAP.flutter, skillsGap.flutter),
    rust: mergeByName(SKILLS_GAP.rust, skillsGap.rust),
  };

  // ProofOfWorkProject uses `desc`; JobProjectToBuild uses `description` —
  // normalize both to one shape here so the render below doesn't need to
  // branch on which kind of item it's looking at.
  const normalizedSeedProjects = PROOF_OF_WORK_PROJECTS.map((p) => ({ ...p, description: p.desc }));
  const mergedProjects: Record<JobRole, ((ProofOfWorkProject & { description: string }) | JobProjectToBuild)[]> = {
    flutter: mergeByName(
      normalizedSeedProjects.filter((p) => p.role === "flutter"),
      projectsToBuild.flutter
    ),
    rust: mergeByName(
      normalizedSeedProjects.filter((p) => p.role === "rust"),
      projectsToBuild.rust
    ),
  };

  const allMergedProjects = [...mergedProjects.flutter, ...mergedProjects.rust];
  const visibleProjects = projFilter === "all" ? allMergedProjects : mergedProjects[projFilter];

  return (
    <div className="space-y-10">
      {/* Job Boards */}
      <div>
        <h3 className="text-sm font-medium mb-4">Job Boards</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {JOB_BOARDS.map((b) => (
            <a
              key={b.name}
              href={b.url}
              target="_blank"
              rel="noopener noreferrer"
              className="content-card group flex flex-col items-center gap-1.5 py-4 px-2 text-center hover:border-foreground/20 transition-colors relative"
            >
              <ExternalLink className="h-3 w-3 absolute top-2 right-2 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="text-xl">{b.emoji}</span>
              <span className="text-xs font-medium leading-tight">{b.name}</span>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                {b.tag === "flutter" ? "Flutter" : b.tag === "rust" ? "Rust" : "Both"}
              </Badge>
            </a>
          ))}
        </div>
      </div>

      {/* Skills Gap */}
      <div>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h3 className="text-sm font-medium">Skills to Add</h3>
          <p className="text-xs text-muted-foreground">drawn from job postings — add your own too</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {(["flutter", "rust"] as const).map((role) => (
            <div key={role} className="content-card">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <span className="text-base">{role === "rust" ? "🦀" : "🐦"}</span>
                  <h4 className="text-sm font-medium">{role === "rust" ? "Rust Systems" : "Flutter Mobile"}</h4>
                </div>
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setSkillDialogRole(role)}>
                  <Plus className="h-3 w-3 mr-1" />
                  Add
                </Button>
              </div>
              <div className="space-y-2">
                {mergedSkills[role].map((s) => {
                  const p = PRIORITY_CONFIG[s.priority];
                  const dom = s.resource.replace("https://", "").split("/")[0];
                  const isDynamic = "id" in s;
                  return (
                    <div
                      key={s.name}
                      className="flex items-start gap-2.5 rounded-md bg-muted/40 hover:bg-muted/70 border border-border px-3 py-2.5 transition-colors"
                    >
                      <span className="h-2 w-2 rounded-full shrink-0 mt-1.5" style={{ background: p.color }} />
                      <a href={s.resource} target="_blank" rel="noopener noreferrer" className="min-w-0 flex-1">
                        <p className="text-sm font-medium leading-snug">{s.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{s.why}</p>
                        <p className="text-xs text-primary mt-1">Learn → {dom} ↗</p>
                      </a>
                      <span className="text-xs font-medium shrink-0" style={{ color: p.color }}>{p.label}</span>
                      {isDynamic && (
                        <button
                          type="button"
                          onClick={() => onDeleteSkillGap(role, (s as JobSkillGap).id)}
                          className="shrink-0 text-muted-foreground hover:text-destructive transition-colors"
                          aria-label={`Remove ${s.name}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Proof of Work Projects */}
      <div>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h3 className="text-sm font-medium">Proof of Work Projects</h3>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex gap-1.5">
              {([
                { value: "all" as const, label: `All (${allMergedProjects.length})` },
                { value: "flutter" as const, label: "🐦 Flutter" },
                { value: "rust" as const, label: "🦀 Rust" },
              ]).map((f) => (
                <button
                  key={f.value}
                  onClick={() => setProjFilter(f.value)}
                  className={cn(
                    "px-2.5 py-1 rounded-full text-xs font-medium transition-colors",
                    projFilter === f.value ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => setProjectDialogRole(projFilter === "rust" ? "rust" : "flutter")}
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Project
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {visibleProjects.map((p) => {
            const isDynamic = "id" in p;
            const skills = "skills" in p ? p.skills : [];
            return (
              <div key={p.name} className="content-card py-4 relative">
                <div className="flex items-start gap-2 mb-1.5">
                  <Badge variant="secondary" className="text-xs shrink-0">
                    {p.role === "rust" ? "🦀" : "🐦"}
                    {"num" in p ? ` #${p.num}` : ""}
                  </Badge>
                  <p className="text-sm font-medium leading-snug flex-1">{p.name}</p>
                  {isDynamic && (
                    <button
                      type="button"
                      onClick={() => onDeleteProjectToBuild(p.role, (p as JobProjectToBuild).id)}
                      className="shrink-0 text-muted-foreground hover:text-destructive transition-colors"
                      aria-label={`Remove ${p.name}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mb-2.5">{p.description}</p>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {skills.map((s) => <span key={s} className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">{s}</span>)}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={DIFFICULTY_VARIANT[p.difficulty]} className="text-xs">{p.difficulty}</Badge>
                  <span className="text-xs text-muted-foreground">~{p.weeks} week{p.weeks > 1 ? "s" : ""}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <SkillGapFormDialog
        open={skillDialogRole !== null}
        onOpenChange={(open) => !open && setSkillDialogRole(null)}
        defaultRole={skillDialogRole ?? "flutter"}
        onCreated={onAddSkillGap}
      />
      <ProjectToBuildFormDialog
        open={projectDialogRole !== null}
        onOpenChange={(open) => !open && setProjectDialogRole(null)}
        defaultRole={projectDialogRole ?? "flutter"}
        onCreated={onAddProjectToBuild}
      />
    </div>
  );
}
