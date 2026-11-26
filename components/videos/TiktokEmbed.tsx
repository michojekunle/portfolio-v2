"use client";

import { useEffect, useRef } from "react";

interface Props {
  url: string;
  className?: string;
}

let tiktokTimer: ReturnType<typeof setTimeout> | null = null;
let tiktokScriptEl: HTMLScriptElement | null = null;

function normalizeTiktokCiteUrl(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl.trim());
    return `${parsed.origin}${parsed.pathname}`;
  } catch {
    return rawUrl;
  }
}

function scheduleTiktokProcess(): void {
  if (typeof document === "undefined") return;
  if (tiktokTimer) clearTimeout(tiktokTimer);
  tiktokTimer = setTimeout(() => {
    tiktokScriptEl?.remove();
    const script = document.createElement("script");
    script.src = "https://www.tiktok.com/embed.js";
    script.async = true;
    document.body.appendChild(script);
    tiktokScriptEl = script;
  }, 120);
}

export function TiktokEmbed({ url, className = "" }: Props): React.ReactElement {
  const containerRef = useRef<HTMLDivElement>(null);
  const citeUrl = normalizeTiktokCiteUrl(url);

  useEffect(() => {
    scheduleTiktokProcess();
  }, [citeUrl]);

  const videoIdMatch = url.match(/\/(?:video|photo)\/(\d+)/);
  const videoId = videoIdMatch ? videoIdMatch[1] : undefined;

  return (
    <div
      ref={containerRef}
      className={`flex justify-center w-full min-h-[420px] overflow-hidden ${className}`}
    >
      <blockquote
        className="tiktok-embed"
        cite={citeUrl}
        data-video-id={videoId}
        style={{ maxWidth: 605, minWidth: 260, width: "100%", margin: 0 }}
      >
        <section />
      </blockquote>
    </div>
  );
}
