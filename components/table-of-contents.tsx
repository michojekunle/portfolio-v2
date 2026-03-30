"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { List } from "lucide-react";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
}

function extractHeadings(markdown: string): TocItem[] {
  const headings: TocItem[] = [];
  const lines = markdown.split("\n");

  for (const line of lines) {
    // Skip headings inside code blocks
    const match = line.match(/^(#{2,4})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2].replace(/[`*_~\[\]]/g, "").trim();
      const id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-");
      headings.push({ id, text, level });
    }
  }

  return headings;
}

export function TableOfContents({
  content,
}: TableOfContentsProps): React.ReactElement | null {
  const [activeId, setActiveId] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);
  const headings = extractHeadings(content);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -70% 0px" }
    );

    for (const heading of headings) {
      const el = document.getElementById(heading.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length < 3) return null;

  return (
    <>
      {/* Mobile toggle */}
      <div className="xl:hidden mb-6">
        <button
          onClick={() => setIsOpen((v) => !v)}
          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <List className="h-3.5 w-3.5" />
          Table of contents
        </button>
        {isOpen && (
          <nav className="mt-3 pl-4 border-l border-border/60 space-y-1.5">
            {headings.map((h) => (
              <a
                key={h.id}
                href={`#${h.id}`}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "block text-xs transition-colors leading-relaxed",
                  h.level === 3 && "pl-3",
                  h.level === 4 && "pl-6",
                  activeId === h.id
                    ? "text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {h.text}
              </a>
            ))}
          </nav>
        )}
      </div>

      {/* Desktop sticky sidebar */}
      <aside className="hidden xl:block fixed right-[max(1rem,calc((100vw-42rem)/2-16rem))] top-32 w-56">
        <p className="text-xs font-medium text-muted-foreground mb-3 flex items-center gap-1.5">
          <List className="h-3 w-3" />
          On this page
        </p>
        <nav className="space-y-1 border-l border-border/60 pl-3">
          {headings.map((h) => (
            <a
              key={h.id}
              href={`#${h.id}`}
              className={cn(
                "block text-xs transition-colors leading-relaxed py-0.5",
                h.level === 3 && "pl-3",
                h.level === 4 && "pl-6",
                activeId === h.id
                  ? "text-foreground font-medium border-l-2 border-foreground -ml-[1px] pl-[11px]"
                  : "text-muted-foreground/70 hover:text-foreground"
              )}
            >
              {h.text}
            </a>
          ))}
        </nav>
      </aside>
    </>
  );
}
