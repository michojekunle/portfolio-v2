"use client";

import { useState } from "react";
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
}

interface Props {
  initialApplications: JobApplication[];
  initialLeads: LeadsState;
}

export function JobsDashboard({ initialApplications, initialLeads }: Props): React.ReactElement {
  const [apps, setApps] = useState<JobApplication[]>(initialApplications);
  const [activeTab, setActiveTab] = useState("overview");
  const [logDialogOpen, setLogDialogOpen] = useState(false);
  const [logPrefill, setLogPrefill] = useState<ApplicationPrefill | null>(null);

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
        <LeadsPanel initialLeads={initialLeads} onLogLead={handleLogFromLead} />
      </TabsContent>

      <TabsContent value="resources">
        <ResourcesPanel />
      </TabsContent>
    </Tabs>
  );
}
