import { LAYOUT_OPTIONS } from "../lib/constants";
import type { SlideLayout } from "../lib/types";

interface Props {
  accent: string;
  activeLayout: SlideLayout;
  onChange: (layout: SlideLayout) => void;
}

export function LayoutPicker({ accent, activeLayout, onChange }: Props): React.ReactElement {
  return (
    <div className="p-4 rounded-xl border border-(--rule) bg-(--bg-2)">
      <label className="block font-mono text-[9px] tracking-widest uppercase mb-2 text-muted-foreground">Active Slide Template Layout</label>
      <div className="grid grid-cols-6 gap-1.5 max-[480px]:grid-cols-2">
        {LAYOUT_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            className="py-2 rounded-md border text-[9px] font-mono uppercase tracking-wider cursor-pointer"
            style={{
              background: activeLayout === opt.id ? "var(--bg)" : "transparent",
              borderColor: activeLayout === opt.id ? accent : "var(--rule)",
              color: activeLayout === opt.id ? accent : "var(--ink-2)",
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
