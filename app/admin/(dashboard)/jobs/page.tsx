import { createClient } from "@/lib/supabase/server";
import { JobsDashboard } from "@/components/admin/jobs/JobsDashboard";
import type { JobApplication } from "@/components/admin/jobs/constants";
import type { JobLead } from "@/app/api/job-leads/route";
import { JOB_LEADS_PAGE_SIZE } from "@/lib/admin/job-leads-constants";

// Leads/applications are written by an external cron POST and by admin
// mutations independent of this render — without this, Next's fetch cache
// can serve a stale (e.g. pre-first-lead empty) result here indefinitely.
export const dynamic = "force-dynamic";

export default async function JobsPage(): Promise<React.ReactElement> {
  const supabase = await createClient();

  // Leads fetched per-role (not one combined query sliced afterward) so a
  // burst on one track can never crowd out the other's share of the limit —
  // mirrors app/api/job-leads/route.ts's GET handler, including the
  // fetch-limit+1-to-detect-more trick "Load more" needs.
  const [
    { data: applications },
    { data: flutterLeads },
    { data: rustLeads },
    { data: learnedSkills },
    { data: builtProjects },
  ] = await Promise.all([
    supabase.from("job_applications").select("*").order("date", { ascending: false }),
    supabase.from("job_leads").select("*").eq("role", "flutter").order("created_at", { ascending: false }).limit(JOB_LEADS_PAGE_SIZE + 1),
    supabase.from("job_leads").select("*").eq("role", "rust").order("created_at", { ascending: false }).limit(JOB_LEADS_PAGE_SIZE + 1),
    supabase.from("job_skills_learned").select("skill"),
    supabase.from("job_projects_built").select("project"),
  ]);

  const flutterRows = (flutterLeads ?? []) as JobLead[];
  const rustRows = (rustLeads ?? []) as JobLead[];
  const flutter = flutterRows.slice(0, JOB_LEADS_PAGE_SIZE);
  const rust = rustRows.slice(0, JOB_LEADS_PAGE_SIZE);
  const initialLeads = {
    updatedAt: [flutter[0]?.created_at, rust[0]?.created_at].filter(Boolean).sort().reverse()[0] ?? null,
    flutter,
    rust,
    flutterHasMore: flutterRows.length > JOB_LEADS_PAGE_SIZE,
    rustHasMore: rustRows.length > JOB_LEADS_PAGE_SIZE,
  };
  const initialProgress = {
    skills: (learnedSkills ?? []).map((s) => s.skill as string),
    projects: (builtProjects ?? []).map((p) => p.project as string),
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
        initialProgress={initialProgress}
      />
    </div>
  );
}
