import { FONTS_LIST } from "../lib/constants";
import { AESTHETIC_MOODS, type AestheticMood, type AspectRatio, type BackgroundStyle } from "../lib/types";

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
const groupLabel = "block font-mono text-[9px] tracking-widest uppercase mb-2 text-muted-foreground";

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
  activeBg,
  activeText,
  activeAccent,
  onCustomBgChange,
  onCustomTextChange,
  onCustomAccentChange,
  hasCustomColors,
  onResetColors,
}: Props): React.ReactElement {
  return (
    <div className="rounded-2xl p-6 border border-(--rule) bg-(--bg-2) space-y-5">
      <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted-foreground border-b pb-2.5 border-(--rule)">
        Canvas Customizer
      </div>

      <div>
        <label className={groupLabel}>Aesthetic Mood Style</label>
        <select value={aesthetic} onChange={(e) => onAestheticChange(e.target.value as AestheticMood)} className={`${selectClass} focus:border-muted-foreground`}>
          {AESTHETIC_MOODS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={groupLabel}>Aspect Ratio</label>
        <ToggleGroup
          accent={accent}
          value={aspectRatio}
          onChange={onAspectRatioChange}
          gridCols="grid-cols-2"
          buttonClass="py-2.5 rounded-lg border text-[10px] font-mono uppercase tracking-wider cursor-pointer"
          options={[
            { id: "portrait", label: "Portrait 4:5" },
            { id: "square", label: "Square 1:1" },
          ]}
        />
      </div>

      <div>
        <label className={groupLabel}>Background Style</label>
        <ToggleGroup
          accent={accent}
          value={backgroundStyle}
          onChange={onBackgroundStyleChange}
          gridCols="grid-cols-3"
          buttonClass="py-2 rounded-lg border text-[9px] font-mono uppercase tracking-wider cursor-pointer"
          options={[
            { id: "solid", label: "Solid" },
            { id: "gradient", label: "Grad" },
            { id: "mesh", label: "Mesh" },
          ]}
        />
      </div>

      <div className="space-y-3">
        <div>
          <label className="block font-mono text-[9px] tracking-widest uppercase mb-1.5 text-muted-foreground">Title Font</label>
          <select value={fontTitle} onChange={(e) => onFontTitleChange(e.target.value)} className={selectClass}>
            {FONTS_LIST.map((f) => (
              <option key={f.name} value={f.value}>
                {f.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-mono text-[9px] tracking-widest uppercase mb-1.5 text-muted-foreground">Body Font</label>
          <select value={fontBody} onChange={(e) => onFontBodyChange(e.target.value)} className={selectClass}>
            {FONTS_LIST.map((f) => (
              <option key={f.name} value={f.value}>
                {f.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-3">
        <label className="block font-mono text-[9px] tracking-widest uppercase text-muted-foreground">Color Overrides</label>
        <div className="grid grid-cols-3 gap-2">
          <div className="space-y-1">
            <div className="text-[8px] font-mono text-muted-foreground">BG</div>
            <input type="color" value={activeBg} onChange={(e) => onCustomBgChange(e.target.value)} className="w-full h-8 rounded-md border-none bg-transparent cursor-pointer" />
          </div>
          <div className="space-y-1">
            <div className="text-[8px] font-mono text-muted-foreground">Text</div>
            <input type="color" value={activeText} onChange={(e) => onCustomTextChange(e.target.value)} className="w-full h-8 rounded-md border-none bg-transparent cursor-pointer" />
          </div>
          <div className="space-y-1">
            <div className="text-[8px] font-mono text-muted-foreground">Accent</div>
            <input type="color" value={activeAccent} onChange={(e) => onCustomAccentChange(e.target.value)} className="w-full h-8 rounded-md border-none bg-transparent cursor-pointer" />
          </div>
        </div>
        {hasCustomColors && (
          <button
            onClick={onResetColors}
            className="mt-2 w-full h-7 rounded-md font-mono text-[8px] tracking-[0.08em] uppercase font-semibold border border-dashed transition-all hover:bg-(--bg) cursor-pointer"
            style={{ borderColor: "var(--rule)", color: "var(--ink-3)" }}
          >
            Reset to Mood Defaults
          </button>
        )}
      </div>
    </div>
  );
}
