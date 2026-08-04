"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OverviewPanel } from "./OverviewPanel";
import { ApplicationsPanel } from "./ApplicationsPanel";
import { LeadsPanel } from "./LeadsPanel";
import { ResourcesPanel } from "./ResourcesPanel";
import type { ApplicationPrefill } from "./ApplicationFormDialog";
import type { ApplicationStatus, JobApplication } from "./constants";
import type { JobLead } from "@/app/api/job-leads/route";

interface LeadsState {
  updatedAt: string | null;
  flutter: JobLead[];
  rust: JobLead[];
  flutterHasMore: boolean;
  rustHasMore: boolean;
}

interface ProgressState {
  skills: string[];
  projects: string[];
}

interface Props {
  initialApplications: JobApplication[];
  initialLeads: LeadsState;
  initialProgress: ProgressState;
}

export function JobsDashboard({ initialApplications, initialLeads, initialProgress }: Props): React.ReactElement {
  const [apps, setApps] = useState<JobApplication[]>(initialApplications);
  const [activeTab, setActiveTab] = useState("overview");
  const [logDialogOpen, setLogDialogOpen] = useState(false);
  const [logPrefill, setLogPrefill] = useState<ApplicationPrefill | null>(null);
  const [learnedSkills, setLearnedSkills] = useState<Set<string>>(new Set(initialProgress.skills));
  const [builtProjects, setBuiltProjects] = useState<Set<string>>(new Set(initialProgress.projects));
  // A ref (not state) so the guard below is visible synchronously to a
  // second click dispatched before the first request's state update lands —
  // state updates are batched/async, so a same-tick double-click could slip
  // past a state-only check. Mirrored into state purely to disable the
  // in-flight button visually; the ref is what actually prevents the race.
  const pendingTogglesRef = useRef<Set<string>>(new Set());
  const [pendingToggles, setPendingToggles] = useState<Set<string>>(new Set());

  // Shared across every lead's detail view — toggling "Rust async" learnt
  // from one posting marks it learnt everywhere else it's listed too.
  const handleToggleProgress = async (kind: "skill" | "project", name: string): Promise<void> => {
    const key = `${kind}:${name}`;
    // The API does a check-then-act (SELECT, then INSERT-or-DELETE) with no
    // extra concurrency handling beyond the primary key — a second overlapping
    // request for the same name would 500 on the racing INSERT, and its
    // client-side catch would then revert the FIRST click's already-applied
    // change, desyncing the UI from what the server actually recorded.
    if (pendingTogglesRef.current.has(key)) return;
    pendingTogglesRef.current.add(key);
    setPendingToggles(new Set(pendingTogglesRef.current));

    const setState = kind === "skill" ? setLearnedSkills : setBuiltProjects;
    const wasOn = (kind === "skill" ? learnedSkills : builtProjects).has(name);
    setState((prev) => {
      const next = new Set(prev);
      wasOn ? next.delete(name) : next.add(name);
      return next;
    });
    try {
      const res = await fetch("/api/admin/job-progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, name }),
      });
      if (!res.ok) throw new Error("Progress update failed");
    } catch (err) {
      console.error("[jobs-dashboard] toggle progress error:", err);
      setState((prev) => {
        const next = new Set(prev);
        wasOn ? next.add(name) : next.delete(name);
        return next;
      });
      toast.error(`Failed to update ${kind}`);
    } finally {
      pendingTogglesRef.current.delete(key);
      setPendingToggles(new Set(pendingTogglesRef.current));
    }
  };

  const handleCreate = (app: JobApplication): void => {
    setApps((prev) => [app, ...prev]);
  };

  const handleLogFromLead = (prefill: ApplicationPrefill): void => {
    setLogPrefill(prefill);
    setLogDialogOpen(true);
    setActiveTab("applications");
  };

  const handleStatusChange = async (id: string, status: ApplicationStatus): Promise<void> => {
    const prev = apps;
    setApps((cur) => cur.map((a) => (a.id === id ? { ...a, status } : a)));
    try {
      const res = await fetch(`/api/admin/job-applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Status update failed");
    } catch (err) {
      console.error("[jobs-dashboard] update status error:", err);
      setApps(prev);
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id: string): Promise<void> => {
    const prev = apps;
    setApps((cur) => cur.filter((a) => a.id !== id));
    try {
      const res = await fetch(`/api/admin/job-applications/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
    } catch (err) {
      console.error("[jobs-dashboard] delete application error:", err);
      setApps(prev);
      toast.error("Failed to remove application");
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-4 h-auto gap-1 p-1 mb-6">
        <TabsTrigger value="overview" className="text-xs sm:text-sm px-1.5 sm:px-3 py-2 truncate">Overview</TabsTrigger>
        <TabsTrigger value="applications" className="text-xs sm:text-sm px-1.5 sm:px-3 py-2 truncate">Applications</TabsTrigger>
        <TabsTrigger value="leads" className="text-xs sm:text-sm px-1.5 sm:px-3 py-2 truncate">Leads</TabsTrigger>
        <TabsTrigger value="resources" className="text-xs sm:text-sm px-1.5 sm:px-3 py-2 truncate">Resources</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <OverviewPanel apps={apps} />
      </TabsContent>

      <TabsContent value="applications">
        <ApplicationsPanel
          apps={apps}
          onCreate={handleCreate}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
          logDialogOpen={logDialogOpen}
          onLogDialogOpenChange={setLogDialogOpen}
          logPrefill={logPrefill}
        />
      </TabsContent>

      <TabsContent value="leads">
        <LeadsPanel
          initialLeads={initialLeads}
          onLogLead={handleLogFromLead}
          learnedSkills={learnedSkills}
          builtProjects={builtProjects}
          onToggleProgress={handleToggleProgress}
          pendingToggles={pendingToggles}
        />
      </TabsContent>

      <TabsContent value="resources">
        <ResourcesPanel />
      </TabsContent>
    </Tabs>
  );
}
