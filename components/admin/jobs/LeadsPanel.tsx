"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCw, Sparkles } from "lucide-react";
import type { JobLead } from "@/app/api/job-leads/route";
import { JOB_LEADS_PAGE_SIZE } from "@/lib/admin/job-leads-constants";
import type { ApplicationPrefill } from "./ApplicationFormDialog";
import { JobLeadDetailDialog } from "./JobLeadDetailDialog";

interface LeadsState {
  updatedAt: string | null;
  flutter: JobLead[];
  rust: JobLead[];
  flutterHasMore: boolean;
  rustHasMore: boolean;
}

interface Props {
  initialLeads: LeadsState;
  onLogLead: (prefill: ApplicationPrefill) => void;
  learnedSkills: Set<string>;
  builtProjects: Set<string>;
  onToggleProgress: (kind: "skill" | "project", name: string) => Promise<void>;
  pendingToggles: Set<string>;
}

function fmtAgo(iso: string): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function LeadColumn({
  role,
  items,
  onLogLead,
  onOpenLead,
  learnedSkills,
  builtProjects,
  hasMore,
  loadingMore,
  onLoadMore,
}: {
  role: "flutter" | "rust";
  items: JobLead[];
  onLogLead: (prefill: ApplicationPrefill) => void;
  onOpenLead: (lead: JobLead, role: "flutter" | "rust") => void;
  learnedSkills: Set<string>;
  builtProjects: Set<string>;
  hasMore: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
}): React.ReactElement {
  const isR = role === "rust";
  const emoji = isR ? "🦀" : "🐦";
  const label = isR ? "Rust" : "Flutter";

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-base">{emoji}</span>
        <h3 className="text-sm font-medium">{label} Leads</h3>
        {items.length > 0 && <Badge variant="secondary" className="text-xs">{items.length}{hasMore ? "+" : ""}</Badge>}
      </div>

      {items.length === 0 ? (
        <div className="content-card text-center py-8 border-dashed">
          <p className="text-2xl mb-2">{emoji}</p>
          <p className="text-sm font-medium mb-1">{label} leads appear here</p>
          <p className="text-xs text-muted-foreground">Posted automatically at 7:30 AM &amp; 10:30 PM.</p>
        </div>
      ) : (
        <>
          {items.map((j) => {
            // Guarded — these columns are undefined until the enrichment
            // migration has been run against this Supabase project.
            const skills = j.skills ?? [];
            const projects = j.projects ?? [];
            const learnedCount = skills.filter((s) => learnedSkills.has(s)).length;
            const builtCount = projects.filter((p) => builtProjects.has(p.name)).length;

            return (
              <div
                key={j.id}
                className="content-card py-3 space-y-2 cursor-pointer hover:border-primary/40 transition-colors"
                onClick={() => onOpenLead(j, role)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{j.company || "—"}</p>
                    <p className="text-xs text-muted-foreground truncate">{j.title || "—"} {j.board ? `· ${j.board}` : ""}</p>
                  </div>
                  <Badge variant="secondary" className="text-xs shrink-0">{isR ? "🦀 Rust" : "🐦 Flutter"}</Badge>
                </div>
                {j.tip && (
                  <p className="text-xs text-muted-foreground leading-relaxed border-l-2 border-primary/40 pl-2.5 flex gap-1.5">
                    <Sparkles className="h-3 w-3 shrink-0 mt-0.5 text-primary" />
                    <span>{j.tip}</span>
                  </p>
                )}
                {j.salary && (
                  <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">💰 {j.salary}</p>
                )}
                {(skills.length > 0 || projects.length > 0) && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {skills.length > 0 && (
                      <Badge variant={learnedCount === skills.length ? "secondary" : "outline"} className="text-xs">
                        🎯 {learnedCount}/{skills.length} skills learned
                      </Badge>
                    )}
                    {projects.length > 0 && (
                      <Badge variant={builtCount === projects.length ? "secondary" : "outline"} className="text-xs">
                        🔨 {builtCount}/{projects.length} projects built
                      </Badge>
                    )}
                  </div>
                )}
                <div className="flex gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
                  {j.url && (
                    <Button size="sm" className="flex-1" asChild>
                      <a href={j.url} target="_blank" rel="noopener noreferrer">Apply Now ↗</a>
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onLogLead({ company: j.company ?? "", role, board: j.board ?? "", url: j.url ?? "" })}
                  >
                    + Log
                  </Button>
                </div>
              </div>
            );
          })}

          {hasMore && (
            <Button variant="outline" size="sm" className="w-full" onClick={onLoadMore} disabled={loadingMore}>
              {loadingMore ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : null}
              Load more
            </Button>
          )}
        </>
      )}
    </div>
  );
}

export function LeadsPanel({
  initialLeads,
  onLogLead,
  learnedSkills,
  builtProjects,
  onToggleProgress,
  pendingToggles,
}: Props): React.ReactElement {
  const [leads, setLeads] = useState<LeadsState>(initialLeads);
  const [flutterLimit, setFlutterLimit] = useState(Math.max(JOB_LEADS_PAGE_SIZE, initialLeads.flutter.length));
  const [rustLimit, setRustLimit] = useState(Math.max(JOB_LEADS_PAGE_SIZE, initialLeads.rust.length));
  const [fetching, setFetching] = useState(false);
  const [loadingMore, setLoadingMore] = useState<"flutter" | "rust" | null>(null);
  const [error, setError] = useState(false);
  const [openLead, setOpenLead] = useState<{ lead: JobLead; role: "flutter" | "rust" } | null>(null);

  // Refetches at the *currently loaded* count for each role, not the base
  // page size — so refreshing (manual, or the 5-minute auto-refresh) never
  // collapses a list the admin has already expanded via "Load more".
  const fetchLeads = useCallback(
    async (overrides?: { flutterLimit?: number; rustLimit?: number }): Promise<void> => {
      setFetching(true);
      setError(false);
      try {
        const fLimit = overrides?.flutterLimit ?? flutterLimit;
        const rLimit = overrides?.rustLimit ?? rustLimit;
        const res = await fetch(`/api/job-leads?flutterLimit=${fLimit}&rustLimit=${rLimit}`);
        if (!res.ok) throw new Error(`API ${res.status}`);
        const data = (await res.json()) as LeadsState;
        setLeads(data);
      } catch (err) {
        console.error("[jobs/leads] fetchLeads error:", err);
        setError(true);
      } finally {
        setFetching(false);
      }
    },
    [flutterLimit, rustLimit]
  );

  useEffect(() => {
    const id = setInterval(() => void fetchLeads(), 5 * 60 * 1000);
    return () => clearInterval(id);
  }, [fetchLeads]);

  const handleLoadMore = async (role: "flutter" | "rust"): Promise<void> => {
    setLoadingMore(role);
    try {
      if (role === "flutter") {
        const next = flutterLimit + JOB_LEADS_PAGE_SIZE;
        setFlutterLimit(next);
        await fetchLeads({ flutterLimit: next });
      } else {
        const next = rustLimit + JOB_LEADS_PAGE_SIZE;
        setRustLimit(next);
        await fetchLeads({ rustLimit: next });
      }
    } finally {
      setLoadingMore(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <p className="text-xs text-muted-foreground">
            Auto-updated at 7:30 AM &amp; 10:30 PM by the scheduled task
            {error ? " · fetch error" : leads.updatedAt ? ` · updated ${fmtAgo(leads.updatedAt)}` : " · no leads yet"}
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={() => void fetchLeads()} disabled={fetching}>
          {fetching ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5 mr-1.5" />}
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LeadColumn
          role="flutter"
          items={leads.flutter}
          onLogLead={onLogLead}
          onOpenLead={(lead, role) => setOpenLead({ lead, role })}
          learnedSkills={learnedSkills}
          builtProjects={builtProjects}
          hasMore={leads.flutterHasMore}
          loadingMore={loadingMore === "flutter"}
          onLoadMore={() => void handleLoadMore("flutter")}
        />
        <LeadColumn
          role="rust"
          items={leads.rust}
          onLogLead={onLogLead}
          onOpenLead={(lead, role) => setOpenLead({ lead, role })}
          learnedSkills={learnedSkills}
          builtProjects={builtProjects}
          hasMore={leads.rustHasMore}
          loadingMore={loadingMore === "rust"}
          onLoadMore={() => void handleLoadMore("rust")}
        />
      </div>

      <JobLeadDetailDialog
        lead={openLead?.lead ?? null}
        role={openLead?.role ?? null}
        onClose={() => setOpenLead(null)}
        onLogLead={onLogLead}
        learnedSkills={learnedSkills}
        builtProjects={builtProjects}
        onToggleProgress={onToggleProgress}
        pendingToggles={pendingToggles}
      />
    </div>
  );
}
