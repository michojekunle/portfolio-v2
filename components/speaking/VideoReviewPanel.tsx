"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  ExternalLink,
  Film,
  Loader2,
  Play,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { VIDEO_CATEGORIES, type SiteVideo } from "@/lib/videos/types";
import { PlatformEmbed } from "@/components/videos/PlatformEmbed";
import { cn } from "@/lib/utils";

interface VideoReviewPanelProps {
  initialVideos: SiteVideo[];
}

export function VideoReviewPanel({
  initialVideos,
}: VideoReviewPanelProps): React.ReactElement {
  const [videos, setVideos] = useState<SiteVideo[]>(initialVideos);
  const [statusFilter, setStatusFilter] = useState<"all" | "live" | "hidden">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [previewVideo, setPreviewVideo] = useState<SiteVideo | null>(null);

  const allCategories = Array.from(
    new Set([
      ...VIDEO_CATEGORIES,
      ...videos.map((v) => v.category).filter(Boolean),
    ])
  );

  const filtered = videos.filter((v) => {
    if (statusFilter === "live" && !v.is_published) return false;
    if (statusFilter === "hidden" && v.is_published) return false;
    if (categoryFilter !== "all" && v.category !== categoryFilter) return false;
    return true;
  });

  const handleTogglePublished = async (video: SiteVideo): Promise<void> => {
    setBusyId(video.id);
    try {
      const res = await fetch("/api/speaking/videos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: video.id,
          is_published: !video.is_published,
        }),
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Update failed");
      setVideos((prev) =>
        prev.map((v) =>
          v.id === video.id ? { ...v, is_published: !video.is_published } : v
        )
      );
      toast.success(
        !video.is_published
          ? "Video is now live on /videos"
          : "Video hidden from public /videos"
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update video");
    } finally {
      setBusyId(null);
    }
  };

  const handleCategoryChange = async (
    video: SiteVideo,
    nextCategory: string
  ): Promise<void> => {
    setBusyId(video.id);
    try {
      const res = await fetch("/api/speaking/videos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: video.id, category: nextCategory }),
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Failed to update category");
      setVideos((prev) =>
        prev.map((v) =>
          v.id === video.id ? { ...v, category: nextCategory } : v
        )
      );
      toast.success(`Moved to ${nextCategory}`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not update category"
      );
    } finally {
      setBusyId(null);
    }
  };

  const handleRemoveVideo = async (videoId: string): Promise<void> => {
    setBusyId(videoId);
    try {
      const res = await fetch(
        `/api/speaking/videos?id=${encodeURIComponent(videoId)}`,
        { method: "DELETE" }
      );
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Delete failed");
      setVideos((prev) => prev.filter((v) => v.id !== videoId));
      if (previewVideo?.id === videoId) setPreviewVideo(null);
      setConfirmDeleteId(null);
      toast.success("Removed from /videos");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not remove video");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section
      id="videos-manager"
      className="rounded-[6px] border border-(--rule) bg-(--paper) p-4 sm:p-6 space-y-5"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-(--ink-2)">
            <Film className="h-3.5 w-3.5" aria-hidden="true" />
            Owner Review Queue
          </div>
          <h2 className="font-display text-lg sm:text-xl font-normal text-(--ink) mt-0.5 mb-0">
            My /videos Library ({videos.length})
          </h2>
          <p className="text-xs text-(--ink-2) mt-0.5 mb-0">
            Preview embedded YouTube, TikTok & Instagram links yourself, organize by category, hide, or remove.
          </p>
        </div>

        <Link
          href="/videos"
          target="_blank"
          className="inline-flex items-center gap-1.5 rounded-[4px] border border-(--rule) bg-(--bg) px-3 py-2 min-h-[38px] text-xs font-medium text-(--ink) no-underline hover:border-(--ink) self-start sm:self-auto shrink-0"
        >
          Open /videos
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div
          role="group"
          aria-label="Filter library by visibility"
          className="inline-flex rounded-[4px] border border-(--rule) bg-(--bg) p-0.5"
        >
          {(
            [
              { id: "all", label: "All" },
              { id: "live", label: "Live" },
              { id: "hidden", label: "Hidden" },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={statusFilter === item.id}
              onClick={() => setStatusFilter(item.id)}
              className={cn(
                "rounded-[2px] px-3 py-1.5 min-h-[34px] font-mono text-[11px] uppercase cursor-pointer transition-colors",
                statusFilter === item.id
                  ? "bg-(--ink) text-(--bg)"
                  : "text-(--ink-2) hover:text-(--ink)"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          aria-label="Filter library by category"
          className="rounded-[4px] border border-(--rule) bg-(--bg) px-3 py-2 min-h-[38px] text-base sm:text-xs text-(--ink)"
        >
          <option value="all">All categories</option>
          {allCategories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-[4px] border border-dashed border-(--rule) p-6 text-center text-sm text-(--ink-2)">
          No synced or published videos match this filter yet.
        </div>
      ) : (
        <div className="divide-y divide-(--rule-2)">
          {filtered.map((video) => (
            <div
              key={video.id}
              className="py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3"
            >
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-[2px] border border-(--rule) bg-(--bg-2) px-2 py-0.5 font-mono text-[11px] uppercase text-(--ink)">
                    {video.platform}
                  </span>
                  {video.speaking_day_number && (
                    <Link
                      href={`/speaking/day/${video.speaking_day_number}`}
                      className="font-mono text-[11px] text-(--ink-2) hover:text-(--ink) underline"
                    >
                      Day {video.speaking_day_number}
                    </Link>
                  )}
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 font-mono text-[11px]",
                      video.is_published
                        ? "bg-(--good)/12 text-(--good)"
                        : "bg-(--bg-2) text-(--ink-2)"
                    )}
                  >
                    {video.is_published ? "Live" : "Hidden"}
                  </span>
                </div>
                <div className="text-sm font-medium text-(--ink) truncate">
                  {video.title}
                </div>
                <div className="font-mono text-[11px] text-(--ink-2) truncate">
                  {video.url}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <select
                  value={video.category}
                  disabled={busyId === video.id}
                  onChange={(e) => void handleCategoryChange(video, e.target.value)}
                  aria-label={`Category for ${video.title}`}
                  className="rounded-[4px] border border-(--rule) bg-(--bg) px-2.5 py-1.5 min-h-[38px] text-base sm:text-xs text-(--ink)"
                >
                  {allCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => setPreviewVideo(video)}
                  className="inline-flex items-center gap-1 rounded-[4px] border border-(--rule) bg-(--bg) px-3 py-1.5 min-h-[38px] text-xs font-medium text-(--ink) hover:border-(--ink) cursor-pointer"
                >
                  <Play className="h-3.5 w-3.5" aria-hidden="true" />
                  Preview
                </button>

                <button
                  type="button"
                  disabled={busyId === video.id}
                  onClick={() => void handleTogglePublished(video)}
                  aria-label={video.is_published ? "Hide from /videos" : "Publish to /videos"}
                  className="inline-flex items-center gap-1 rounded-[4px] border border-(--rule) bg-(--bg) px-3 py-1.5 min-h-[38px] text-xs font-medium text-(--ink-2) hover:text-(--ink) cursor-pointer"
                >
                  {busyId === video.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                  ) : video.is_published ? (
                    <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                  )}
                  {video.is_published ? "Hide" : "Show"}
                </button>

                {confirmDeleteId === video.id ? (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={busyId === video.id}
                      onClick={() => void handleRemoveVideo(video.id)}
                      className="rounded-[4px] border border-destructive bg-destructive text-white px-2.5 py-1.5 min-h-[38px] font-mono text-[11px] cursor-pointer"
                    >
                      Remove
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(null)}
                      className="rounded-[4px] border border-(--rule) px-2.5 py-1.5 min-h-[38px] font-mono text-[11px] text-(--ink-2) cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={busyId === video.id}
                    onClick={() => setConfirmDeleteId(video.id)}
                    aria-label={`Remove ${video.title} from /videos`}
                    className="inline-flex h-[38px] w-[38px] items-center justify-center rounded-[4px] border border-(--rule) text-(--ink-2) hover:text-destructive cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Owner Self-Review Embed Modal */}
      {previewVideo && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Review video: ${previewVideo.title}`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
        >
          <div className="w-full max-w-[540px] max-h-[90vh] overflow-y-auto rounded-[8px] border border-(--rule) bg-(--paper) p-4 sm:p-6 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-(--ink-2)">
                  {previewVideo.platform} · {previewVideo.category}
                </div>
                <h3 className="font-display text-lg text-(--ink) mt-0.5 mb-0 break-words">
                  {previewVideo.title}
                </h3>
              </div>
              <button
                type="button"
                aria-label="Close preview"
                onClick={() => setPreviewVideo(null)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-[4px] border border-(--rule) text-(--ink-2) hover:text-(--ink) cursor-pointer shrink-0"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="rounded-[6px] overflow-hidden border border-(--rule) bg-(--bg)">
              <PlatformEmbed video={previewVideo} eager />
            </div>

            <div className="flex items-center justify-between gap-3 pt-2 border-t border-(--rule-2)">
              <a
                href={previewVideo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-(--ink-2) hover:text-(--ink) underline"
              >
                Open original post
                <ExternalLink className="h-3 w-3" aria-hidden="true" />
              </a>
              <button
                type="button"
                onClick={() => void handleRemoveVideo(previewVideo.id)}
                disabled={busyId === previewVideo.id}
                className="inline-flex items-center gap-1.5 rounded-[4px] border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                Remove from /videos
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
