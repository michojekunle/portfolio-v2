import { Plus, Sparkles } from "lucide-react";
import type { InputMode } from "../lib/types";

const TABS: { id: InputMode; label: string }[] = [
  { id: "topic", label: "From Topic" },
  { id: "refine", label: "Refine Raw Draft" },
  { id: "manual", label: "Start Manually" },
];

interface Props {
  accent: string;
  inputMode: InputMode;
  onModeChange: (mode: InputMode) => void;
  topic: string;
  onTopicChange: (value: string) => void;
  roughNotes: string;
  onRoughNotesChange: (value: string) => void;
  slideCount: number;
  onSlideCountChange: (value: number) => void;
  loading: boolean;
  onGenerate: () => void;
  onStartManual: () => void;
}

function SlideCountSlider({ accent, slideCount, onSlideCountChange, heightClass }: { accent: string; slideCount: number; onSlideCountChange: (v: number) => void; heightClass: string }): React.ReactElement {
  const pct = ((slideCount - 3) / (8 - 3)) * 100;
  return (
    <div className="w-[200px] max-[720px]:w-full">
      <label className="block font-mono text-[10px] tracking-[0.14em] uppercase mb-2.5" style={{ color: "var(--ink-3)" }}>
        Slides ({slideCount})
      </label>
      <div className={`flex items-center gap-3 ${heightClass} px-3 rounded-[10px] border border-(--rule) bg-(--bg)`}>
        <input
          type="range"
          min={3}
          max={8}
          value={slideCount}
          onChange={(e) => onSlideCountChange(Number(e.target.value))}
          className="flex-1 h-1 rounded-full appearance-none cursor-pointer"
          style={{ background: `linear-gradient(90deg, ${accent} ${pct}%, var(--rule) ${pct}%)`, accentColor: accent }}
          aria-label="Number of slides"
        />
        <span className="font-mono text-[15px] font-semibold text-(--ink)">{slideCount}</span>
      </div>
    </div>
  );
}

export function GeneratorForm({
  accent,
  inputMode,
  onModeChange,
  topic,
  onTopicChange,
  roughNotes,
  onRoughNotesChange,
  slideCount,
  onSlideCountChange,
  loading,
  onGenerate,
  onStartManual,
}: Props): React.ReactElement {
  const canGenerate = (inputMode === "topic" ? topic.trim() : roughNotes.trim()) && !loading;

  return (
    <div className="rounded-2xl p-8 max-[720px]:p-5 mb-10 space-y-6" style={{ background: "var(--bg-2)", border: "1px solid var(--rule)" }}>
      <div className="flex border-b border-(--rule) pb-0.25 gap-6 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onModeChange(tab.id)}
            className="pb-3 font-mono text-[10px] uppercase tracking-[0.14em] font-semibold cursor-pointer border-b-2 transition-colors duration-150 shrink-0"
            style={{
              color: inputMode === tab.id ? accent : "var(--ink-3)",
              borderColor: inputMode === tab.id ? accent : "transparent",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {inputMode === "topic" && (
        <div className="flex gap-4 max-[720px]:flex-col">
          <div className="flex-1">
            <label htmlFor="carousel-topic" className="block font-mono text-[10px] tracking-[0.14em] uppercase mb-2.5" style={{ color: "var(--ink-3)" }}>
              Topic or Content Pitch
            </label>
            <input
              id="carousel-topic"
              type="text"
              placeholder="e.g. 5 Rules for Focus, How to Write Copy that Sells..."
              value={topic}
              onChange={(e) => onTopicChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onGenerate();
              }}
              className="w-full rounded-[10px] px-4 h-13 text-[15px] outline-none transition-colors duration-150"
              style={{ background: "var(--bg)", border: "1px solid var(--rule)", color: "var(--ink)" }}
              onFocus={(e) => (e.currentTarget.style.borderColor = accent)}
              onBlur={(e) => (e.currentTarget.style.borderColor = "var(--rule)")}
            />
          </div>
          <SlideCountSlider accent={accent} slideCount={slideCount} onSlideCountChange={onSlideCountChange} heightClass="h-13" />
        </div>
      )}

      {inputMode === "refine" && (
        <div className="flex gap-4 max-[720px]:flex-col">
          <div className="flex-1">
            <label htmlFor="carousel-notes" className="block font-mono text-[10px] tracking-[0.14em] uppercase mb-2.5" style={{ color: "var(--ink-3)" }}>
              Rough Notes / Copy Draft / Ideas Outline
            </label>
            <textarea
              id="carousel-notes"
              placeholder="Paste your rough outline, outline points, draft notes, or bullet lists here for AI to clean up..."
              value={roughNotes}
              onChange={(e) => onRoughNotesChange(e.target.value)}
              rows={4}
              className="w-full rounded-[10px] p-4 text-[14px] outline-none transition-colors duration-150 resize-none font-sans"
              style={{ background: "var(--bg)", border: "1px solid var(--rule)", color: "var(--ink)" }}
              onFocus={(e) => (e.currentTarget.style.borderColor = accent)}
              onBlur={(e) => (e.currentTarget.style.borderColor = "var(--rule)")}
            />
          </div>
          <SlideCountSlider accent={accent} slideCount={slideCount} onSlideCountChange={onSlideCountChange} heightClass="h-24" />
        </div>
      )}

      {inputMode === "manual" && (
        <div className="p-6 rounded-[10px] border border-(--rule) bg-(--bg) text-center">
          <p className="text-[13px] leading-[1.65] text-secondary-foreground m-0">
            🚀 Skip AI generation entirely! Start with a default empty 3-slide template (Hook Cover, Body Point, Brand CTA Card) and craft your
            layout parameters, brand initials logo, and custom content slides directly in the sidebar design panels.
          </p>
        </div>
      )}

      {inputMode === "manual" ? (
        <button
          type="button"
          onClick={onStartManual}
          className="w-full h-13 rounded-[10px] font-mono text-[11px] uppercase tracking-[0.14em] font-semibold transition-all duration-200 text-white flex items-center justify-center gap-2 cursor-pointer"
          style={{ background: accent }}
        >
          <Plus size={14} /> Start Designer Canvas
        </button>
      ) : (
        <button
          type="button"
          onClick={onGenerate}
          disabled={loading || (inputMode === "topic" ? !topic.trim() : !roughNotes.trim())}
          className="w-full h-13 rounded-[10px] font-mono text-[11px] uppercase tracking-[0.14em] font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-white flex items-center justify-center gap-2 cursor-pointer"
          style={{ background: canGenerate ? accent : "var(--rule)" }}
        >
          <Sparkles size={14} />
          {loading ? "Generating slides..." : "Generate carousel"}
        </button>
      )}
    </div>
  );
}
