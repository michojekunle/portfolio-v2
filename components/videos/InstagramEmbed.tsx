"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    instgrm?: {
      Embeds: {
        process: () => void;
      };
    };
  }
}

const SCRIPT_SRC = "https://www.instagram.com/embed.js";

function normalizeInstagramPermalink(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl.trim());
    const cleanPath = parsed.pathname.endsWith("/")
      ? parsed.pathname
      : `${parsed.pathname}/`;
    return `https://www.instagram.com${cleanPath}`;
  } catch {
    return rawUrl;
  }
}

function scheduleInstagramProcess(): void {
  if (typeof document === "undefined") return;
  const process = (): void => {
    window.instgrm?.Embeds.process();
  };

  if (window.instgrm?.Embeds) {
    process();
    return;
  }

  const existing = document.querySelector<HTMLScriptElement>(
    `script[src="${SCRIPT_SRC}"], script[src="//www.instagram.com/embed.js"]`
  );
  if (existing) {
    existing.addEventListener("load", process, { once: true });
    return;
  }

  const script = document.createElement("script");
  script.src = SCRIPT_SRC;
  script.async = true;
  script.addEventListener("load", process, { once: true });
  document.body.appendChild(script);
}

interface Props {
  url: string;
  className?: string;
}

export function InstagramEmbed({ url, className = "" }: Props): React.ReactElement {
  const containerRef = useRef<HTMLDivElement>(null);
  const permalink = normalizeInstagramPermalink(url);

  useEffect(() => {
    scheduleInstagramProcess();
  }, [permalink]);

  return (
    <div ref={containerRef} className={`flex justify-center w-full min-h-[380px] ${className}`}>
      <blockquote
        className="instagram-media"
        data-instgrm-permalink={permalink}
        data-instgrm-version="14"
        style={{ width: "100%", maxWidth: 540, minWidth: 260, margin: 0 }}
      />
    </div>
  );
}
