"use client";

import { useState } from "react";
import { Check, Sparkles, SlidersHorizontal } from "lucide-react";
import { FONTS_LIST, TEMPLATE_METAS, type TemplateMeta } from "../lib/constants";
import type { AestheticMood, AspectRatio, BackgroundStyle } from "../lib/types";
import { TemplateVisualPreview } from "./TemplateVisualPreview";

// Grouped once at module scope, in list order, so both selects render
// consistent <optgroup> sections without recomputing on every render.
const FONT_GROUPS: [string, typeof FONTS_LIST][] = (() => {
  const order: string[] = [];
  const byGroup = new Map<string, typeof FONTS_LIST>();
  for (const f of FONTS_LIST) {
    if (!byGroup.has(f.group)) {
      byGroup.set(f.group, []);
      order.push(f.group);
    }
    byGroup.get(f.group)!.push(f);
  }
  return order.map((g) => [g, byGroup.get(g)!]);
})();

interface Props {
  accent: string;
  aesthetic: AestheticMood;
  onAestheticChange: (mood: AestheticMood) => void;
  aspectRatio: AspectRatio;
  onAspectRatioChange: (value: AspectRatio) => void;
  backgroundStyle: BackgroundStyle;
  onBackgroundStyleChange: (value: BackgroundStyle) => void;
  fontTitle: string;
  onFontTitleChange: (value: string) => void;
  fontBody: string;
  onFontBodyChange: (value: string) => void;
  titleScale: number;
  onTitleScaleChange: (value: number) => void;
  bodyScale: number;
  onBodyScaleChange: (value: number) => void;
  activeBg: string;
  activeText: string;
  activeAccent: string;
  onCustomBgChange: (value: string) => void;
  onCustomTextChange: (value: string) => void;
  onCustomAccentChange: (value: string) => void;
  hasCustomColors: boolean;
  onResetColors: () => void;
}

const selectClass = "w-full h-9 px-2.5 rounded-lg border border-(--rule) bg-(--bg) text-(--ink) text-[12px] outline-none";
const groupLabel = "block font-mono text-[10px] tracking-widest uppercase mb-2 text-muted-foreground";

const CATEGORIES = [
  "All",
  "Tech & Dev",
  "Venture & Executive",
  "Growth & Copy",
  "Essays & Mindset",
  "Design & Craft",
  "Editorial",
] as const;

function ToggleGroup<T extends string>({
  accent,
  value,
  options,
  onChange,
  gridCols,
  buttonClass,
}: {
  accent: string;
  value: T;
  options: { id: T; label: string }[];
  onChange: (value: T) => void;
  gridCols: string;
  buttonClass: string;
}): React.ReactElement {
  return (
    <div className={`grid ${gridCols} gap-2`}>
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onChange(opt.id)}
          className={buttonClass}
          style={{
            background: value === opt.id ? "var(--bg)" : "transparent",
            borderColor: value === opt.id ? accent : "var(--rule)",
            color: value === opt.id ? accent : "var(--ink-2)",
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function CanvasCustomizerPanel({
  accent,
  aesthetic,
  onAestheticChange,
  aspectRatio,
  onAspectRatioChange,
  backgroundStyle,
  onBackgroundStyleChange,
  fontTitle,
  onFontTitleChange,
  fontBody,
  onFontBodyChange,
  titleScale,
  onTitleScaleChange,
  bodyScale,
  onBodyScaleChange,
  activeBg,
  activeText,
  activeAccent,
  onCustomBgChange,
  onCustomTextChange,
  onCustomAccentChange,
  hasCustomColors,
  onResetColors,
}: Props): React.ReactElement {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const filteredTemplates = TEMPLATE_METAS.filter((t) => {
    if (selectedCategory === "All") return true;
    return t.category === selectedCategory;
  });

  const handleSelectTemplate = (meta: TemplateMeta): void => {
    onAestheticChange(meta.id);
    onResetColors();
  };

  return (
    <div className="rounded-2xl p-6 border border-(--rule) bg-(--bg-2) space-y-6">
      <div className="flex items-center justify-between border-b pb-2.5 border-(--rule)">
        <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted-foreground">
          Design Archetypes & Templates
        </div>
        <span className="text-[10px] font-mono text-emerald-400 font-medium">{TEMPLATE_METAS.length} Archetypes</span>
      </div>

      {/* Active Movement Live Preview Card */}
      <div className="rounded-xl border border-(--rule) bg-(--bg) p-3 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Active Design Movement
          </span>
          <span className="font-mono text-[10px] font-bold text-primary">
            {aesthetic}
          </span>
        </div>
        <div className="w-full py-3 px-2 rounded-lg bg-(--bg-2)/70 border border-(--rule) flex items-center justify-center">
          <TemplateVisualPreview
            aesthetic={aesthetic}
            aspectRatio={aspectRatio}
            title="Headline Typography"
            content="Clean, high-impact readability across all devices."
            className="shadow-sm"
          />
        </div>
      </div>

      {/* Category Filter Pills */}
      <div>
        <label className={groupLabel}>Creator Voice & Intention</label>
        <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className="px-2.5 py-1 rounded-md text-[10px] font-mono uppercase tracking-wider shrink-0 transition-colors border cursor-pointer"
              style={{
                borderColor: selectedCategory === cat ? accent : "var(--rule)",
                background: selectedCategory === cat ? `${accent}18` : "var(--bg)",
                color: selectedCategory === cat ? accent : "var(--ink-3)",
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Visual Template Cards */}
      <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
        {filteredTemplates.map((meta) => {
          const isSelected = aesthetic === meta.id;
          return (
            <button
              key={meta.id}
              type="button"
              onClick={() => handleSelectTemplate(meta)}
              className="w-full text-left p-3 rounded-xl border transition-all duration-150 cursor-pointer relative flex flex-col gap-2 group hover:border-muted-foreground"
              style={{
                borderColor: isSelected ? accent : "var(--rule)",
                background: isSelected ? "var(--bg)" : "var(--bg-2)",
                boxShadow: isSelected ? `0 0 0 1px ${accent}40` : "none",
              }}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-bold text-(--ink)">{meta.name}</span>
                  <span
                    className="text-[8px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border"
                    style={{
                      borderColor: isSelected ? `${accent}60` : "var(--rule)",
                      color: isSelected ? accent : "var(--ink-3)",
                      background: isSelected ? `${accent}15` : "transparent",
                    }}
                  >
                    {meta.badge}
                  </span>
                </div>
                {isSelected && <Check size={13} style={{ color: accent }} />}
              </div>

              <p className="text-[11px] leading-relaxed text-(--ink-3) line-clamp-2 m-0">
                {meta.description}
              </p>

              <div className="flex items-center justify-between pt-1 border-t border-(--rule)">
                <span className="text-[8px] font-mono uppercase tracking-wider text-muted-foreground">
                  {meta.category}
                </span>
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-(--rule) shadow-xs"
                    style={{ background: meta.previewBg }}
                    title={`Background: ${meta.previewBg}`}
                  />
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-(--rule) shadow-xs"
                    style={{ background: meta.previewText }}
                    title={`Text: ${meta.previewText}`}
                  />
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-(--rule) shadow-xs"
                    style={{ background: meta.previewAccent }}
                    title={`Accent: ${meta.previewAccent}`}
                  />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Aspect Ratio & Background Style */}
      <div className="space-y-4 pt-2 border-t border-(--rule)">
        <div>
          <label className={groupLabel}>Aspect Ratio</label>
          <ToggleGroup
            accent={accent}
            value={aspectRatio}
            onChange={onAspectRatioChange}
            gridCols="grid-cols-2"
            buttonClass="py-2 rounded-lg border text-[10px] font-mono uppercase tracking-wider cursor-pointer"
            options={[
              { id: "portrait", label: "Portrait 4:5" },
              { id: "square", label: "Square 1:1" },
            ]}
          />
        </div>

        <div>
          <label className={groupLabel}>Background Ambience</label>
          <ToggleGroup
            accent={accent}
            value={backgroundStyle}
            onChange={onBackgroundStyleChange}
            gridCols="grid-cols-3"
            buttonClass="py-1.5 rounded-lg border text-[10px] font-mono uppercase tracking-wider cursor-pointer"
            options={[
              { id: "solid", label: "Solid" },
              { id: "gradient", label: "Gradient" },
              { id: "mesh", label: "Mesh Glow" },
            ]}
          />
        </div>
      </div>

      {/* Advanced Typography & Color Tuning Toggle */}
      <div className="pt-2 border-t border-(--rule)">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full flex items-center justify-between py-2 text-[10px] font-mono uppercase tracking-wider text-muted-foreground hover:text-(--ink) transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-1.5">
            <SlidersHorizontal size={12} />
            Fine-tune Typography & Colors
          </span>
          <span className="text-[11px]">{showAdvanced ? "▲" : "▼"}</span>
        </button>

        {showAdvanced && (
          <div className="space-y-4 pt-3 mt-1 border-t border-dashed border-(--rule)">
            <div className="space-y-3">
              <div>
                <label className="block font-mono text-[10px] tracking-widest uppercase mb-1.5 text-muted-foreground">
                  Title Font
                </label>
                <select
                  value={fontTitle}
                  onChange={(e) => onFontTitleChange(e.target.value)}
                  className={selectClass}
                >
                  {FONT_GROUPS.map(([group, fonts]) => (
                    <optgroup key={group} label={group}>
                      {fonts.map((f) => (
                        <option key={f.name} value={f.value}>
                          {f.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-mono text-[10px] tracking-widest uppercase mb-1.5 text-muted-foreground">
                  Body Font
                </label>
                <select
                  value={fontBody}
                  onChange={(e) => onFontBodyChange(e.target.value)}
                  className={selectClass}
                >
                  {FONT_GROUPS.map(([group, fonts]) => (
                    <optgroup key={group} label={group}>
                      {fonts.map((f) => (
                        <option key={f.name} value={f.value}>
                          {f.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="flex items-center justify-between font-mono text-[10px] tracking-widest uppercase mb-1.5 text-muted-foreground">
                    <span>Title Size</span>
                    <span style={{ color: accent }}>{Math.round(titleScale * 100)}%</span>
                  </label>
                  <input
                    type="range"
                    min={0.75}
                    max={1.5}
                    step={0.05}
                    value={titleScale}
                    onChange={(e) => onTitleScaleChange(Number(e.target.value))}
                    className="w-full accent-(--accent)"
                    style={{ "--accent": accent } as React.CSSProperties}
                  />
                </div>
                <div>
                  <label className="flex items-center justify-between font-mono text-[10px] tracking-widest uppercase mb-1.5 text-muted-foreground">
                    <span>Body Size</span>
                    <span style={{ color: accent }}>{Math.round(bodyScale * 100)}%</span>
                  </label>
                  <input
                    type="range"
                    min={0.75}
                    max={1.5}
                    step={0.05}
                    value={bodyScale}
                    onChange={(e) => onBodyScaleChange(Number(e.target.value))}
                    className="w-full accent-(--accent)"
                    style={{ "--accent": accent } as React.CSSProperties}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t border-(--rule)">
              <label className="block font-mono text-[10px] tracking-widest uppercase text-muted-foreground">
                Color Palette Overrides
              </label>
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <div className="text-[8px] font-mono text-muted-foreground">BG</div>
                  <input
                    type="color"
                    value={activeBg}
                    onChange={(e) => onCustomBgChange(e.target.value)}
                    className="w-full h-8 rounded-md border-none bg-transparent cursor-pointer"
                  />
                </div>
                <div className="space-y-1">
                  <div className="text-[8px] font-mono text-muted-foreground">Text</div>
                  <input
                    type="color"
                    value={activeText}
                    onChange={(e) => onCustomTextChange(e.target.value)}
                    className="w-full h-8 rounded-md border-none bg-transparent cursor-pointer"
                  />
                </div>
                <div className="space-y-1">
                  <div className="text-[8px] font-mono text-muted-foreground">Accent</div>
                  <input
                    type="color"
                    value={activeAccent}
                    onChange={(e) => onCustomAccentChange(e.target.value)}
                    className="w-full h-8 rounded-md border-none bg-transparent cursor-pointer"
                  />
                </div>
              </div>
              {hasCustomColors && (
                <button
                  type="button"
                  onClick={onResetColors}
                  className="mt-2 w-full h-7 rounded-md font-mono text-[8px] tracking-[0.08em] uppercase font-semibold border border-dashed transition-all hover:bg-(--bg) cursor-pointer"
                  style={{ borderColor: "var(--rule)", color: "var(--ink-3)" }}
                >
                  Reset to Archetype Defaults
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
