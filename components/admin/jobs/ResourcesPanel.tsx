"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";
import {
  JOB_BOARDS,
  PRIORITY_CONFIG,
  PROOF_OF_WORK_PROJECTS,
  SKILLS_GAP,
  type JobRole,
} from "@/lib/admin/job-search-data";

const DIFFICULTY_VARIANT: Record<"Easy" | "Medium" | "Hard", "secondary" | "outline" | "destructive"> = {
  Easy: "secondary",
  Medium: "outline",
  Hard: "destructive",
};

export function ResourcesPanel(): React.ReactElement {
  const [projFilter, setProjFilter] = useState<"all" | JobRole>("all");
  const visibleProjects = projFilter === "all" ? PROOF_OF_WORK_PROJECTS : PROOF_OF_WORK_PROJECTS.filter((p) => p.role === projFilter);

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
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium">Skills to Add</h3>
          <p className="text-xs text-muted-foreground">drawn from job postings</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {(["flutter", "rust"] as const).map((role) => (
            <div key={role} className="content-card">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
                <span className="text-base">{role === "rust" ? "🦀" : "🐦"}</span>
                <h4 className="text-sm font-medium">{role === "rust" ? "Rust Systems" : "Flutter Mobile"}</h4>
              </div>
              <div className="space-y-2">
                {SKILLS_GAP[role].map((s) => {
                  const p = PRIORITY_CONFIG[s.priority];
                  const dom = s.resource.replace("https://", "").split("/")[0];
                  return (
                    <a
                      key={s.name}
                      href={s.resource}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-2.5 rounded-md bg-muted/40 hover:bg-muted/70 border border-border px-3 py-2.5 transition-colors"
                    >
                      <span className="h-2 w-2 rounded-full shrink-0 mt-1.5" style={{ background: p.color }} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium leading-snug">{s.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{s.why}</p>
                        <p className="text-xs text-primary mt-1">Learn → {dom} ↗</p>
                      </div>
                      <span className="text-xs font-medium shrink-0" style={{ color: p.color }}>{p.label}</span>
                    </a>
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
          <div className="flex gap-1.5">
            {([
              { value: "all" as const, label: `All (${PROOF_OF_WORK_PROJECTS.length})` },
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
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {visibleProjects.map((p) => (
            <div key={p.id} className="content-card py-4">
              <div className="flex items-start gap-2 mb-1.5">
                <Badge variant="secondary" className="text-xs shrink-0">{p.role === "rust" ? "🦀" : "🐦"} #{p.num}</Badge>
                <p className="text-sm font-medium leading-snug">{p.name}</p>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed mb-2.5">{p.desc}</p>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {p.skills.map((s) => <span key={s} className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">{s}</span>)}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={DIFFICULTY_VARIANT[p.difficulty]} className="text-xs">{p.difficulty}</Badge>
                <span className="text-xs text-muted-foreground">~{p.weeks} week{p.weeks > 1 ? "s" : ""}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
