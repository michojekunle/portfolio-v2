"use client";

import { useEffect, useRef, useState } from "react";
import type { SiteVideo } from "@/lib/videos/types";
import { isYoutubeShort } from "@/lib/videos/youtube";
import { YoutubeEmbed } from "./YoutubeEmbed";
import { InstagramEmbed } from "./InstagramEmbed";
import { TiktokEmbed } from "./TiktokEmbed";

interface Props {
  video: SiteVideo;
  className?: string;
  eager?: boolean;
}

export function PlatformEmbed({
  video,
  className = "",
  eager = false,
}: Props): React.ReactElement {
  const hostRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(eager);

  useEffect(() => {
    if (visible) return;
    const node = hostRef.current;
    if (!node) return;

    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "320px 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [visible]);

  const aspectClass =
    video.platform === "youtube"
      ? isYoutubeShort(video.url)
        ? "aspect-[9/16]"
        : "aspect-video"
      : video.platform === "instagram"
      ? "aspect-[4/5]"
      : "aspect-[9/16]";

  if (!visible) {
    return (
      <div
        ref={hostRef}
        className={`w-full ${aspectClass} rounded-2xl border border-(--rule) bg-(--bg-2) flex flex-col items-center justify-center gap-2 px-4 text-center ${className}`}
      >
        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          {video.platform}
        </span>
        <span className="text-xs text-muted-foreground line-clamp-2 max-w-[26ch]">
          {video.title}
        </span>
      </div>
    );
  }

  switch (video.platform) {
    case "youtube":
      return (
        <YoutubeEmbed url={video.url} title={video.title} className={className} />
      );
    case "instagram":
      return <InstagramEmbed url={video.url} className={className} />;
    case "tiktok":
      return <TiktokEmbed url={video.url} className={className} />;
  }
}
