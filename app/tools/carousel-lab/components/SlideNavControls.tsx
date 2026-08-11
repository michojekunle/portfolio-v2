import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  accent: string;
  slideCount: number;
  activeIndex: number;
  onSelect: (index: number) => void;
  onPrev: () => void;
  onNext: () => void;
}

export function SlideNavControls({ accent, slideCount, activeIndex, onSelect, onPrev, onNext }: Props): React.ReactElement {
  return (
    <div className="flex items-center justify-between bg-(--bg-2) p-3 rounded-xl border border-(--rule)">
      <button
        disabled={activeIndex === 0}
        onClick={onPrev}
        className="w-9 h-9 flex items-center justify-center rounded-lg border border-(--rule) bg-transparent cursor-pointer disabled:opacity-30"
      >
        <ChevronLeft size={16} />
      </button>

      <div className="flex gap-1 flex-wrap justify-center">
        {Array.from({ length: slideCount }, (_, idx) => (
          <button
            key={idx}
            onClick={() => onSelect(idx)}
            className="w-7 h-7 rounded-md font-mono text-[10px] border cursor-pointer font-semibold"
            style={{
              background: idx === activeIndex ? accent : "transparent",
              borderColor: idx === activeIndex ? accent : "var(--rule)",
              color: idx === activeIndex ? "#fff" : "var(--ink-2)",
            }}
          >
            {idx + 1}
          </button>
        ))}
      </div>

      <button
        disabled={activeIndex === slideCount - 1}
        onClick={onNext}
        className="w-9 h-9 flex items-center justify-center rounded-lg border border-(--rule) bg-transparent cursor-pointer disabled:opacity-30"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
