import type { Slide } from "../lib/types";

interface Props {
  slide: Slide;
  onChange: (field: keyof Slide, value: string) => void;
}

export function SlideContentEditor({ slide, onChange }: Props): React.ReactElement {
  return (
    <div className="rounded-2xl p-6 border border-(--rule) bg-(--bg-2) space-y-4">
      <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted-foreground border-b pb-2.5 border-(--rule)">Edit Slide Content</div>

      <div className="grid grid-cols-[1fr_auto] gap-3">
        <div>
          <label className="block font-mono text-[9px] tracking-widest uppercase mb-1.5 text-muted-foreground">Slide Title / Badge</label>
          <input
            type="text"
            value={slide.title}
            onChange={(e) => onChange("title", e.target.value)}
            className="w-full h-9 px-2.5 rounded-lg border border-(--rule) bg-(--bg) text-(--ink) text-[13px] outline-none focus:border-muted-foreground"
          />
        </div>
        <div>
          <label className="block font-mono text-[9px] tracking-widest uppercase mb-1.5 text-muted-foreground">Emoji</label>
          <input
            type="text"
            maxLength={4}
            value={slide.emoji || ""}
            onChange={(e) => onChange("emoji", e.target.value)}
            className="w-15 h-9 text-center rounded-lg border border-(--rule) bg-(--bg) text-[16px] outline-none focus:border-muted-foreground"
          />
        </div>
      </div>

      <div>
        <label className="block font-mono text-[9px] tracking-widest uppercase mb-1.5 text-muted-foreground">Slide Description / Body</label>
        <textarea
          value={slide.content}
          onChange={(e) => onChange("content", e.target.value)}
          rows={4}
          className="w-full p-2.5 rounded-lg border border-(--rule) bg-(--bg) text-(--ink) text-[13px] outline-none focus:border-muted-foreground resize-none"
        />
      </div>
    </div>
  );
}
