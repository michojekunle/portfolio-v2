import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AddVideoForm } from "./add-video-form";
import { VideoActions } from "./video-actions";
import { SeedVideosButton } from "./seed-button";
import type { SiteVideo } from "@/lib/videos/types";
import { AlertCircle } from "lucide-react";
import { PageHeader } from "@/components/admin/ui/page-header";
import { GlassCard } from "@/components/admin/ui/glass-card";

const SECTION_LABELS: Record<SiteVideo["section"], string> = {
  intro: "Intro (hero)",
  featured: "Featured (hero sidebar)",
  highlight: "Highlights",
};

export default async function AdminVideosPage(): Promise<React.ReactElement> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: videos, error: dbError } = await supabase
    .from("site_videos")
    .select("*")
    .order("section", { ascending: true })
    .order("display_order", { ascending: true });

  const isTableMissing = dbError && dbError.code === "PGRST205";
  const sections: SiteVideo["section"][] = ["intro", "featured", "highlight"];

  return (
    <div>
      <PageHeader
        title="Videos"
        description={`${videos?.length ?? 0} videos · shown on /videos`}
        action={!isTableMissing && <SeedVideosButton />}
      />

      {isTableMissing && (
        <GlassCard className="border-destructive/20 bg-destructive/5 p-5 mb-10 flex flex-col sm:flex-row items-start gap-4" hoverEffect={false}>
          <div className="p-2 bg-destructive/10 rounded-lg text-destructive border border-destructive/20 shrink-0">
            <AlertCircle className="h-5 w-5" strokeWidth={1.5} />
          </div>
          <div className="space-y-1.5 mt-1 sm:mt-0">
            <h3 className="text-sm font-semibold tracking-tight text-destructive">Database Table Missing</h3>
            <p className="text-xs font-medium text-muted-foreground/80 leading-relaxed">
              The <code className="bg-destructive/10 px-1.5 py-0.5 rounded text-destructive font-mono">site_videos</code> table does not exist in your database schema yet.
            </p>
            <p className="text-xs font-medium text-muted-foreground/80 leading-relaxed">
              Please copy the contents of <code className="bg-muted px-1.5 py-0.5 rounded font-mono">lib/videos/schema.sql</code> and execute them in your <strong>Supabase Dashboard &rarr; SQL Editor &rarr; New Query</strong>.
            </p>
          </div>
        </GlassCard>
      )}

      {!isTableMissing && sections.map((section) => {
        const sectionVideos = (videos ?? []).filter((v) => v.section === section);
        return (
          <div key={section} className="mb-12">
            <h2 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground mb-4">{SECTION_LABELS[section]}</h2>
            <div className="space-y-3">
              {sectionVideos.length === 0 ? (
                <GlassCard className="text-center py-8">
                  <p className="text-sm font-medium text-muted-foreground">Nothing here yet.</p>
                </GlassCard>
              ) : (
                sectionVideos.map((video: SiteVideo) => (
                  <GlassCard
                    key={video.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 px-5 transition-all duration-300"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <p className="text-base font-semibold tracking-tight text-foreground/90 truncate">{video.title}</p>
                        <span className="text-[10px] bg-secondary/50 text-foreground/70 rounded-full px-2 py-0.5 border border-border/50 font-medium shrink-0 uppercase tracking-wider">
                          {video.platform}
                        </span>
                        {!video.is_published && (
                          <span className="text-[10px] text-muted-foreground rounded-full px-2 py-0.5 border border-border/50 font-medium shrink-0 uppercase tracking-wider">
                            Hidden
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-medium text-muted-foreground/60 truncate">{video.url}</p>
                    </div>
                    <div className="self-end sm:self-auto shrink-0">
                      <VideoActions video={video} />
                    </div>
                  </GlassCard>
                ))
              )}
            </div>
          </div>
        );
      })}

      {!isTableMissing && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold tracking-tight text-foreground/90 mb-4">Add a video</h2>
          <GlassCard className="p-6">
            <AddVideoForm />
          </GlassCard>
        </div>
      )}
    </div>
  );
}
