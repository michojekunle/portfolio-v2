"use client";
// impeccable-disable design-system-font-size, design-system-color -- Slide deck filmstrip micro thumbnails

import React from "react";
import { Plus, Copy, Trash2, Sparkles, Layers } from "lucide-react";
import type { ActiveStyle, Slide } from "../lib/types";

interface Props {
  slides: Slide[];
  activeSlideIndex: number;
  onSelect: (index: number) => void;
  onAdd: () => void;
  onDuplicate: (index: number) => void;
  onDelete: (index: number) => void;
  accent: string;
  style: ActiveStyle;
}

export function SlideDeckFilmstrip({
  slides,
  activeSlideIndex,
  onSelect,
  onAdd,
  onDuplicate,
  onDelete,
  accent,
  style,
}: Props): React.ReactElement {
  return (
    <div className="rounded-2xl border border-(--rule) bg-(--bg-2) p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers size={14} className="text-muted-foreground" />
          <span className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground">
            Slide Deck Filmstrip ({slides.length} slides)
          </span>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="px-2.5 py-1 rounded-lg font-mono text-[10px] uppercase tracking-wider font-semibold text-white flex items-center gap-1 cursor-pointer transition-opacity hover:opacity-90"
          style={{ background: accent }}
        >
          <Plus size={12} /> Add Slide
        </button>
      </div>

      {/* Horizontal filmstrip scroll */}
      <div className="flex gap-2.5 overflow-x-auto pb-2 pt-1 scrollbar-thin">
        {slides.map((slide, idx) => {
          const isActive = idx === activeSlideIndex;
          const layoutName = slide.layout || "default";

          return (
            <div
              key={idx}
              onClick={() => onSelect(idx)}
              className="group relative flex-shrink-0 w-28 h-36 rounded-xl border p-2 flex flex-col justify-between transition-all duration-150 cursor-pointer select-none"
              style={{
                background: isActive ? style.bg : "var(--bg)",
                borderColor: isActive ? accent : "var(--rule)",
                boxShadow: isActive ? `0 0 0 2px ${accent}40, 0 4px 12px rgba(0,0,0,0.1)` : "none",
              }}
            >
              {/* Header: Slide Number + Layout badge */}
              <div className="flex items-center justify-between">
                <span
                  className="font-mono text-[8px] font-bold px-1.5 py-0.5 rounded"
                  style={{
                    background: isActive ? `${accent}25` : "var(--rule)",
                    color: isActive ? accent : "var(--ink-2)",
                  }}
                >
                  #{idx + 1}
                </span>
                <span
                  className="font-mono text-[7px] uppercase tracking-wider font-semibold opacity-80"
                  style={{ color: isActive ? style.text : "var(--ink-3)" }}
                >
                  {layoutName}
                </span>
              </div>

              {/* Center Content Preview */}
              <div className="space-y-1 my-auto">
                <div
                  className="text-[9px] font-bold line-clamp-2 leading-tight"
                  style={{ color: isActive ? style.text : "var(--ink)" }}
                >
                  {slide.title || "Untitled Slide"}
                </div>
                <div
                  className="text-[7px] line-clamp-2 leading-tight opacity-75 font-sans"
                  style={{ color: isActive ? style.subtext : "var(--ink-3)" }}
                >
                  {slide.content || "Empty content"}
                </div>
              </div>

              {/* Hover / Active Actions (Duplicate & Delete) */}
              <div className="flex items-center justify-between pt-1 border-t border-(--rule)">
                <span className="text-[7px] font-mono text-muted-foreground">
                  {slide.emoji ? slide.emoji : "Slide"}
                </span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDuplicate(idx);
                    }}
                    title="Duplicate slide"
                    className="p-1 rounded hover:bg-(--rule) text-muted-foreground hover:text-(--ink) cursor-pointer"
                  >
                    <Copy size={10} />
                  </button>
                  {slides.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(idx);
                      }}
                      title="Delete slide"
                      className="p-1 rounded hover:bg-red-500/20 text-muted-foreground hover:text-red-400 cursor-pointer"
                    >
                      <Trash2 size={10} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Plus card at end of filmstrip */}
        <button
          type="button"
          onClick={onAdd}
          className="flex-shrink-0 w-20 h-36 rounded-xl border border-dashed border-(--rule) hover:border-muted-foreground flex flex-col items-center justify-center gap-1.5 text-muted-foreground hover:text-(--ink) transition-colors cursor-pointer bg-(--bg)"
        >
          <Plus size={16} />
          <span className="font-mono text-[8px] uppercase tracking-wider">New</span>
        </button>
      </div>
    </div>
  );
}
