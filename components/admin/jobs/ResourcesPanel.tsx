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
              className="bg-card/40 backdrop-blur-xl border border-border/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] rounded-2xl group flex flex-col items-center gap-2 p-5 text-center hover:bg-foreground/5 hover:border-border/80 hover:shadow-[0_4px_24px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.1)] transition-all duration-300 ease-out relative cursor-pointer"
            >
              <ExternalLink className="h-3.5 w-3.5 absolute top-3 right-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="text-3xl mb-1">{b.emoji}</span>
              <span className="text-[13px] font-semibold tracking-tight text-foreground/90 leading-tight">{b.name}</span>
              <Badge variant="secondary" className="text-[9px] uppercase tracking-wider font-semibold px-1.5 py-0 bg-background/50 border border-border/40">
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
            <div key={role} className="bg-card/40 backdrop-blur-xl border border-border/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] rounded-2xl p-5">
              <div className="flex items-center justify-between mb-5 pb-4 border-b border-border/40">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{role === "rust" ? "🦀" : "🐦"}</span>
                  <h4 className="text-[14px] font-semibold tracking-tight text-foreground/90">{role === "rust" ? "Rust Systems" : "Flutter Mobile"}</h4>
                </div>
                <Button variant="outline" size="sm" className="h-8 text-xs font-medium bg-background/50" onClick={() => setSkillDialogRole(role)}>
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Add
                </Button>
              </div>
              <div className="space-y-3">
                {mergedSkills[role].map((s) => {
                  const p = PRIORITY_CONFIG[s.priority];
                  const dom = s.resource.replace("https://", "").split("/")[0];
                  const isDynamic = "id" in s;
                  return (
                    <div
                      key={s.name}
                      className="flex items-start gap-3 rounded-xl bg-background/50 hover:bg-foreground/5 border border-border/40 px-4 py-3.5 transition-all duration-300 ease-out shadow-sm group"
                    >
                      <span className="h-2 w-2 rounded-full shrink-0 mt-1.5 shadow-[0_0_8px_rgba(0,0,0,0.5)]" style={{ background: p.color, boxShadow: `0 0 8px ${p.color}` }} />
                      <a href={s.resource} target="_blank" rel="noopener noreferrer" className="min-w-0 flex-1">
                        <p className="text-[13px] font-semibold tracking-tight text-foreground/90 leading-snug">{s.name}</p>
                        <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{s.why}</p>
                        <p className="text-[11px] font-medium text-primary mt-1.5 flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">Learn <span className="text-muted-foreground mx-1">→</span> {dom} <ExternalLink className="h-3 w-3 ml-0.5" /></p>
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
              <div key={p.name} className="bg-card/40 backdrop-blur-xl border border-border/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] rounded-2xl p-5 hover:bg-foreground/5 hover:border-border/80 hover:shadow-[0_4px_24px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.1)] transition-all duration-300 ease-out relative group">
                <div className="flex items-start gap-3 mb-2">
                  <Badge variant="secondary" className="text-[10px] uppercase tracking-wider font-semibold shrink-0 bg-background/50 border border-border/40">
                    {p.role === "rust" ? "🦀 Rust" : "🐦 Flutter"}
                    {"num" in p ? ` #${p.num}` : ""}
                  </Badge>
                  <p className="text-[14px] font-semibold tracking-tight text-foreground/90 leading-snug flex-1">{p.name}</p>
                  {isDynamic && (
                    <button
                      type="button"
                      onClick={() => onDeleteProjectToBuild(p.role, (p as JobProjectToBuild).id)}
                      className="shrink-0 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                      aria-label={`Remove ${p.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <p className="text-[12px] text-muted-foreground leading-relaxed mb-4 font-medium">{p.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {skills.map((s) => <span key={s} className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-background/50 border border-border/40 rounded-full px-2.5 py-1">{s}</span>)}
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={DIFFICULTY_VARIANT[p.difficulty]} className="text-[10px] uppercase tracking-wider font-semibold">{p.difficulty}</Badge>
                  <span className="text-[11px] font-medium text-muted-foreground">~{p.weeks} week{p.weeks > 1 ? "s" : ""}</span>
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
