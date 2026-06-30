"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { List, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
}

function extractHeadings(content: string): TocItem[] {
  const headings: TocItem[] = [];

  if (content.includes("<h2") || content.includes("<h3") || content.includes("<h4")) {
    const regex = /<h([2-4])[^>]*>(.*?)<\/h\1>/gi;
    let match;
    while ((match = regex.exec(content)) !== null) {
      const level = parseInt(match[1]);
      const text = match[2].replace(/<[^>]+>/g, "").trim();
      const id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-");
      headings.push({ id, text, level });
    }
    return headings;
  }

  const lines = content.split("\n");
  for (const line of lines) {
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

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const offset = 100; // Account for fixed header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
      
      // Update URL hash without jumping
      window.history.pushState(null, "", `#${id}`);
    }
  };

  if (headings.length < 3) return null;

  return (
    <>
      {/* Mobile toggle */}
      {/* Mobile sticky drawer */}
      <div className="xl:hidden fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen((v) => !v)}
          className="bg-[var(--ink)] text-[var(--bg)] p-3 rounded-full shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
          aria-label="Table of Contents"
        >
          {isOpen ? <X className="h-5 w-5" /> : <List className="h-5 w-5" />}
        </button>
        
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="absolute bottom-14 right-0 w-64 bg-[var(--paper)] border border-[var(--rule)] rounded-[16px] shadow-2xl p-4 origin-bottom-right"
            >
              <h4 className="font-mono text-[10px] tracking-[0.1em] uppercase text-[var(--ink-3)] mb-3 border-b border-[var(--rule)] pb-2">Contents</h4>
              <nav className="max-h-[50vh] overflow-y-auto pr-2 flex flex-col gap-2" data-lenis-prevent="true">
                {headings.map((h) => (
                  <a
                    key={h.id}
                    href={`#${h.id}`}
                    onClick={(e) => {
                      setIsOpen(false);
                      handleScroll(e, h.id);
                    }}
                    className={cn(
                      "block text-[13px] transition-colors leading-snug",
                      h.level === 3 && "pl-3",
                      h.level === 4 && "pl-6",
                      activeId === h.id
                        ? "text-[var(--v3-accent)] font-medium"
                        : "text-[var(--ink-2)] hover:text-[var(--ink)]"
                    )}
                  >
                    {h.text}
                  </a>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
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
              onClick={(e) => handleScroll(e, h.id)}
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
