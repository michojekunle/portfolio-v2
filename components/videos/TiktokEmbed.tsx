"use client";

import { useEffect, useRef } from "react";

interface Props {
  url: string;
  className?: string;
}

export function TiktokEmbed({ url, className = "" }: Props): React.ReactElement {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // TikTok's embed.js has no public re-process API — re-inserting a fresh
    // script tag is the documented workaround for embeds mounted after the
    // initial page load (e.g. client-side navigation).
    const script = document.createElement("script");
    script.src = "https://www.tiktok.com/embed.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      script.remove();
    };
  }, [url]);

  return (
    <div ref={containerRef} className={`flex justify-center ${className}`}>
      <blockquote
        className="tiktok-embed"
        cite={url}
        style={{ maxWidth: 605, minWidth: 325, margin: 0 }}
      >
        <section />
      </blockquote>
    </div>
  );
}
