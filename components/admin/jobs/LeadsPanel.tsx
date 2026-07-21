"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCw, Sparkles } from "lucide-react";
import type { JobLead } from "@/app/api/job-leads/route";
import type { ApplicationPrefill } from "./ApplicationFormDialog";

interface LeadsState {
  updatedAt: string | null;
  flutter: JobLead[];
  rust: JobLead[];
}

interface Props {
  initialLeads: LeadsState;
  onLogLead: (prefill: ApplicationPrefill) => void;
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
}: {
  role: "flutter" | "rust";
  items: JobLead[];
  onLogLead: (prefill: ApplicationPrefill) => void;
}): React.ReactElement {
  const isR = role === "rust";
  const emoji = isR ? "🦀" : "🐦";
  const label = isR ? "Rust" : "Flutter";

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-base">{emoji}</span>
        <h3 className="text-sm font-medium">{label} Leads</h3>
        {items.length > 0 && <Badge variant="secondary" className="text-xs">{items.length}</Badge>}
      </div>

      {items.length === 0 ? (
        <div className="content-card text-center py-8 border-dashed">
          <p className="text-2xl mb-2">{emoji}</p>
          <p className="text-sm font-medium mb-1">{label} leads appear here</p>
          <p className="text-xs text-muted-foreground">Posted automatically at 7:30 AM &amp; 10:30 PM.</p>
        </div>
      ) : (
        items.map((j) => (
          <div key={j.id} className="content-card py-3 space-y-2">
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
            <div className="flex gap-2 pt-1">
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
        ))
      )}
    </div>
  );
}

export function LeadsPanel({ initialLeads, onLogLead }: Props): React.ReactElement {
  const [leads, setLeads] = useState<LeadsState>(initialLeads);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState(false);

  const fetchLeads = useCallback(async (): Promise<void> => {
    setFetching(true);
    setError(false);
    try {
      const res = await fetch("/api/job-leads");
      if (!res.ok) throw new Error(`API ${res.status}`);
      const data = (await res.json()) as LeadsState;
      setLeads(data);
    } catch (err) {
      console.error("[jobs/leads] fetchLeads error:", err);
      setError(true);
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    const id = setInterval(() => void fetchLeads(), 5 * 60 * 1000);
    return () => clearInterval(id);
  }, [fetchLeads]);

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
        <LeadColumn role="flutter" items={leads.flutter} onLogLead={onLogLead} />
        <LeadColumn role="rust" items={leads.rust} onLogLead={onLogLead} />
      </div>
    </div>
  );
}
