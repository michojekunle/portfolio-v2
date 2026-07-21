import { createClient } from "@/lib/supabase/server";
import { JobsDashboard } from "@/components/admin/jobs/JobsDashboard";
import type { JobApplication } from "@/components/admin/jobs/constants";
import type { JobLead } from "@/app/api/job-leads/route";

// Leads/applications are written by an external cron POST and by admin
// mutations independent of this render — without this, Next's fetch cache
// can serve a stale (e.g. pre-first-lead empty) result here indefinitely.
export const dynamic = "force-dynamic";

export default async function JobsPage(): Promise<React.ReactElement> {
  const supabase = await createClient();

  const [{ data: applications }, { data: leads }] = await Promise.all([
    supabase.from("job_applications").select("*").order("date", { ascending: false }),
    supabase.from("job_leads").select("*").order("created_at", { ascending: false }).limit(60),
  ]);

  const allLeads = (leads ?? []) as JobLead[];
  const initialLeads = {
    updatedAt: allLeads[0]?.created_at ?? null,
    flutter: allLeads.filter((l) => l.role === "flutter").slice(0, 20),
    rust: allLeads.filter((l) => l.role === "rust").slice(0, 20),
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Job Search HQ</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Flutter &amp; Rust application tracker, leads, and skills gap
        </p>
      </div>
      <JobsDashboard
        initialApplications={(applications ?? []) as JobApplication[]}
        initialLeads={initialLeads}
      />
    </div>
  );
}
