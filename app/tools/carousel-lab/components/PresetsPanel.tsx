import { useState } from "react";
import { Bookmark, Trash2 } from "lucide-react";
import type { DesignPreset } from "../lib/types";

interface Props {
  accent: string;
  presets: DesignPreset[];
  onSave: (name: string) => void;
  onApply: (preset: DesignPreset) => void;
  onDelete: (id: string) => void;
}

export function PresetsPanel({ accent, presets, onSave, onApply, onDelete }: Props): React.ReactElement {
  const [name, setName] = useState("");

  const handleSave = (): void => {
    if (!name.trim()) return;
    onSave(name);
    setName("");
  };

  return (
    <div className="rounded-2xl p-6 border border-(--rule) bg-(--bg-2) space-y-4">
      <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted-foreground border-b pb-2.5 border-(--rule)">Design Presets</div>

      <div className="flex items-center gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
          }}
          placeholder="Preset name…"
          className="flex-1 h-9 px-2.5 rounded-lg border border-(--rule) bg-(--bg) text-(--ink) text-[12px] outline-none"
        />
        <button
          type="button"
          onClick={handleSave}
          disabled={!name.trim()}
          className="h-9 px-3 inline-flex items-center gap-1.5 rounded-lg border text-[11px] font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          style={{ borderColor: accent, color: accent }}
        >
          <Bookmark className="w-3.5 h-3.5" />
          Save
        </button>
      </div>

      {presets.length === 0 ? (
        <p className="text-[11px] text-muted-foreground">
          Save the current mood, fonts, sizes, colors, and branding as a preset — reload them here on any future deck.
        </p>
      ) : (
        <ul className="list-none p-0 m-0 space-y-1.5 max-h-60 overflow-y-auto">
          {presets.map((preset) => (
            <li key={preset.id} className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onApply(preset)}
                className="flex-1 text-left h-9 px-3 rounded-lg border border-(--rule) bg-(--bg) text-(--ink) text-[12px] truncate hover:border-(--accent) transition-colors"
                style={{ "--accent": accent } as React.CSSProperties}
                title={`Apply "${preset.name}"`}
              >
                {preset.name}
              </button>
              <button
                type="button"
                onClick={() => onDelete(preset.id)}
                className="h-9 w-9 shrink-0 inline-flex items-center justify-center rounded-lg border border-(--rule) text-muted-foreground hover:text-foreground hover:border-(--accent) transition-colors"
                aria-label={`Delete preset "${preset.name}"`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
