import { Copy, Plus, Trash2 } from "lucide-react";
import type { Slide } from "../lib/types";

interface Props {
  accent: string;
  slides: Slide[];
  activeIndex: number;
  onSelect: (index: number) => void;
  onAdd: () => void;
  onDuplicate: (index: number) => void;
  onDelete: (index: number) => void;
}

export function SlideStackPanel({ accent, slides, activeIndex, onSelect, onAdd, onDuplicate, onDelete }: Props): React.ReactElement {
  return (
    <div className="space-y-4 max-[1120px]:col-span-2 max-[800px]:col-span-1">
      <div className="flex items-center justify-between">
        <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted-foreground">Slide Stack</div>
        <button onClick={onAdd} className="inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.08em] font-semibold text-(--ink) cursor-pointer bg-transparent border-none">
          <Plus size={10} /> Add Slide
        </button>
      </div>

      <div className="space-y-3 max-h-145 overflow-y-auto pr-1">
        {slides.map((s, idx) => {
          const isActive = idx === activeIndex;
          return (
            <div
              key={idx}
              onClick={() => onSelect(idx)}
              className="group/item relative rounded-xl p-3.5 border cursor-pointer transition-all flex flex-col justify-between"
              style={{ background: isActive ? "var(--bg-2)" : "var(--bg)", borderColor: isActive ? accent : "var(--rule)" }}
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="font-mono text-[9px] text-muted-foreground">
                  Slide {idx + 1} · <span className="capitalize">{s.layout || "default"}</span>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDuplicate(idx);
                    }}
                    className="w-5 h-5 flex items-center justify-center rounded border-none bg-transparent cursor-pointer text-muted-foreground hover:text-(--ink)"
                    title="Duplicate"
                  >
                    <Copy size={10} />
                  </button>
                  <button
                    disabled={slides.length <= 1}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(idx);
                    }}
                    className="w-5 h-5 flex items-center justify-center rounded border-none bg-transparent cursor-pointer text-muted-foreground hover:text-red-500 disabled:opacity-30"
                    title="Delete"
                  >
                    <Trash2 size={10} />
                  </button>
                </div>
              </div>
              <div className="text-[12px] font-semibold text-(--ink) truncate mb-0.5">{s.title}</div>
              <div className="text-[11px] text-muted-foreground line-clamp-1 font-sans">{s.content}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
