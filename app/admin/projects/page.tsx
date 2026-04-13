import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { SyncGitHubButton } from "./sync-github-button";
import { ProjectActions } from "./project-actions";
import { AddProjectForm } from "./add-project-form";

export default async function AdminProjectsPage() {
  const supabase = await createClient();

  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .order("sort_order", { ascending: true });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {projects?.length ?? 0} projects · synced from GitHub pinned repos
          </p>
        </div>
        <SyncGitHubButton />
      </div>

      <div className="space-y-2 mb-10">
        {!projects?.length ? (
          <div className="content-card text-center py-10">
            <p className="text-sm text-muted-foreground">No projects yet. Sync from GitHub or add manually.</p>
          </div>
        ) : (
          projects.map((project) => (
            <div
              key={project.id}
              className="content-card flex items-center justify-between gap-4 py-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium truncate">{project.title}</p>
                  <Badge variant="secondary" className="text-xs shrink-0">{project.category}</Badge>
                  {project.is_hidden && <Badge variant="outline" className="text-xs shrink-0">Hidden</Badge>}
                </div>
                <p className="text-xs text-muted-foreground truncate">{project.description}</p>
                <div className="flex gap-2 mt-1">
                  {project.tags?.slice(0, 3).map((tag: string) => (
                    <span key={tag} className="text-xs text-muted-foreground">{tag}</span>
                  ))}
                  {project.stars != null && (
                    <span className="text-xs text-muted-foreground">★ {project.stars}</span>
                  )}
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-muted-foreground mb-2">
                  {format(new Date(project.updated_at), "MMM d")}
                </p>
                <ProjectActions project={project} />
              </div>
            </div>
          ))
        )}
      </div>

      <div className="content-card">
        <h2 className="text-sm font-medium mb-4">Add project manually</h2>
        <AddProjectForm />
      </div>
    </div>
  );
}
