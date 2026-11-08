"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, EyeOff, Eye, Trash2 } from "lucide-react";
import { EditVideoDialog } from "./edit-video-dialog";
import type { SiteVideo } from "@/lib/videos/types";

interface Props {
  video: SiteVideo;
}

export function VideoActions({ video }: Props): React.ReactElement {
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const togglePublished = async (): Promise<void> => {
    setLoading("publish");
    await supabase
      .from("site_videos")
      .update({ is_published: !video.is_published })
      .eq("id", video.id);
    setLoading(null);
    router.refresh();
  };

  const deleteVideo = async (): Promise<void> => {
    if (!confirm("Delete this video? This cannot be undone.")) return;
    setLoading("delete");
    await supabase.from("site_videos").delete().eq("id", video.id);
    setLoading(null);
    router.refresh();
  };

  return (
    <div className="flex items-center gap-1 shrink-0">
      <EditVideoDialog video={video} />

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => void togglePublished()}
        disabled={loading !== null}
        title={video.is_published ? "Hide" : "Show"}
      >
        {loading === "publish" ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : video.is_published ? (
          <EyeOff className="h-3.5 w-3.5" />
        ) : (
          <Eye className="h-3.5 w-3.5" />
        )}
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-destructive hover:text-destructive"
        onClick={() => void deleteVideo()}
        disabled={loading !== null}
      >
        {loading === "delete" ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Trash2 className="h-3.5 w-3.5" />
        )}
      </Button>
    </div>
  );
}
