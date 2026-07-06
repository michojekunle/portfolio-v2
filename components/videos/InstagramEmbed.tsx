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

const SCRIPT_SRC = "//www.instagram.com/embed.js";

interface Props {
  url: string;
  className?: string;
}

export function InstagramEmbed({ url, className = "" }: Props): React.ReactElement {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const process = (): void => window.instgrm?.Embeds.process();

    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`);
    if (existing) {
      process();
      return;
    }

    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = process;
    document.body.appendChild(script);
  }, [url]);

  return (
    <div ref={containerRef} className={`flex justify-center ${className}`}>
      <blockquote
        className="instagram-media"
        data-instgrm-permalink={url}
        data-instgrm-version="14"
        style={{ width: "100%", maxWidth: 540, margin: 0 }}
      />
    </div>
  );
}
