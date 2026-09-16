import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { SyncGitHubButton } from "./sync-github-button";
import { ProjectActions } from "./project-actions";
import { AddProjectForm } from "./add-project-form";
import { PageHeader } from "@/components/admin/ui/page-header";
import { GlassCard } from "@/components/admin/ui/glass-card";

export default async function AdminProjectsPage() {
  const supabase = await createClient();

  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .order("sort_order", { ascending: true });

  return (
    <div>
      <PageHeader
        title="Projects"
        description={`${projects?.length ?? 0} projects · synced from GitHub pinned repos`}
        action={<SyncGitHubButton />}
      />

      <div className="space-y-3 mb-12">
        {!projects?.length ? (
          <GlassCard className="text-center py-12">
            <p className="text-sm text-muted-foreground font-medium">No projects yet. Sync from GitHub or add manually.</p>
          </GlassCard>
        ) : (
          projects.map((project) => (
            <GlassCard
              key={project.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 px-5 transition-all duration-300"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <p className="text-base font-semibold tracking-tight text-foreground/90 truncate">{project.title}</p>
                  <Badge variant="secondary" className="text-[10px] uppercase tracking-wider font-medium bg-secondary/50 text-foreground/70 shrink-0">{project.category}</Badge>
                  {project.is_hidden && <Badge variant="outline" className="text-[10px] uppercase tracking-wider font-medium text-muted-foreground shrink-0 border-border/50">Hidden</Badge>}
                </div>
                <p className="text-sm text-muted-foreground truncate mb-2">{project.description}</p>
                <div className="flex flex-wrap gap-x-3 gap-y-1">
                  {project.tags?.slice(0, 4).map((tag: string) => (
                    <span key={tag} className="text-[11px] font-medium text-muted-foreground/80 tracking-wide uppercase">{tag}</span>
                  ))}
                  {project.stars != null && (
                    <span className="text-[11px] font-medium text-amber-500/80 tracking-wide">★ {project.stars}</span>
                  )}
                </div>
              </div>
              <div className="text-left sm:text-right shrink-0 flex sm:flex-col items-center sm:items-end gap-3 sm:gap-1">
                <p className="text-xs font-medium text-muted-foreground/60">
                  {format(new Date(project.updated_at), "MMM d, yyyy")}
                </p>
                <ProjectActions project={project} />
              </div>
            </GlassCard>
          ))
        )}
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-semibold tracking-tight text-foreground/90 mb-4">Add project manually</h2>
        <GlassCard className="p-6">
          <AddProjectForm />
        </GlassCard>
      </div>
    </div>
  );
}
