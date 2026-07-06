"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import { extractYoutubeId, getYoutubeThumbnail } from "@/lib/videos/youtube";

interface Props {
  url: string;
  title: string;
  className?: string;
}

export function YoutubeEmbed({ url, title, className = "" }: Props): React.ReactElement {
  const [playing, setPlaying] = useState(false);
  const id = extractYoutubeId(url);
  const thumbnail = getYoutubeThumbnail(url);

  if (!id) {
    return (
      <div
        className={`flex items-center justify-center aspect-video rounded-[16px] bg-[var(--bg-2)] border border-[var(--rule)] ${className}`}
      >
        <span className="font-mono text-[11px] text-[var(--ink-3)]">Invalid YouTube URL</span>
      </div>
    );
  }

  if (playing) {
    return (
      <div className={`relative aspect-video rounded-[16px] overflow-hidden bg-black ${className}`}>
        <iframe
          src={`https://www.youtube.com/embed/${id}?autoplay=1&rel=0`}
          title={title}
          className="absolute inset-0 w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <button
      onClick={() => setPlaying(true)}
      aria-label={`Play video: ${title}`}
      className="group relative block w-full aspect-video rounded-[16px] overflow-hidden border-none cursor-pointer p-0 bg-[var(--bg-2)]"
    >
      {thumbnail && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={thumbnail}
          alt=""
          aria-hidden="true"
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
      )}
      <div className="absolute inset-0 bg-black/25 transition-colors duration-200 group-hover:bg-black/35" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[56px] h-[56px] rounded-full bg-white/95 flex items-center justify-center shadow-lg transition-transform duration-200 group-hover:scale-110">
          <Play size={22} fill="#FF0000" color="#FF0000" className="ml-[3px]" />
        </div>
      </div>
    </button>
  );
}
