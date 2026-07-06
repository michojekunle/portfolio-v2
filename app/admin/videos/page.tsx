import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AddVideoForm } from "./add-video-form";
import { VideoActions } from "./video-actions";
import { SeedVideosButton } from "./seed-button";
import type { SiteVideo } from "@/lib/videos/types";
import { AlertCircle } from "lucide-react";

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
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Videos</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {videos?.length ?? 0} videos · shown on{" "}
            <a href="/videos" target="_blank" rel="noopener noreferrer" className="underline">
              /videos
            </a>
          </p>
        </div>
        {!isTableMissing && (
          <div className="flex items-center gap-2">
            <SeedVideosButton />
          </div>
        )}
      </div>

      {isTableMissing && (
        <div className="border border-destructive/20 bg-destructive/5 rounded-xl p-5 mb-8 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-destructive">Database Table Missing</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              The <code className="bg-destructive/10 px-1 py-0.5 rounded text-destructive font-mono">site_videos</code> table does not exist in your database schema yet.
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Please copy the contents of <code className="bg-muted px-1.5 py-0.5 rounded font-mono">lib/videos/schema.sql</code> and execute them in your <strong>Supabase Dashboard &rarr; SQL Editor &rarr; New Query</strong>.
            </p>
          </div>
        </div>
      )}

      {!isTableMissing && sections.map((section) => {
        const sectionVideos = (videos ?? []).filter((v) => v.section === section);
        return (
          <div key={section} className="mb-10">
            <h2 className="text-sm font-medium mb-3">{SECTION_LABELS[section]}</h2>
            <div className="space-y-2">
              {sectionVideos.length === 0 ? (
                <div className="content-card text-center py-6">
                  <p className="text-sm text-muted-foreground">Nothing here yet.</p>
                </div>
              ) : (
                sectionVideos.map((video: SiteVideo) => (
                  <div
                    key={video.id}
                    className="content-card flex items-center justify-between gap-4 py-4"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium truncate">{video.title}</p>
                        <span className="text-xs text-muted-foreground shrink-0 uppercase">
                          {video.platform}
                        </span>
                        {!video.is_published && (
                          <span className="text-xs text-muted-foreground shrink-0 border rounded px-1.5">
                            Hidden
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{video.url}</p>
                    </div>
                    <VideoActions video={video} />
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}

      {!isTableMissing && (
        <div className="content-card">
          <h2 className="text-sm font-medium mb-4">Add a video</h2>
          <AddVideoForm />
        </div>
      )}
    </div>
  );
}
