import { History, X } from "lucide-react";

interface Props {
  accent: string;
  savedAt: number;
  slideCount: number;
  onRestore: () => void;
  onDiscard: () => void;
}

function relativeTime(ms: number): string {
  const seconds = Math.max(0, Math.round((Date.now() - ms) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

export function DraftRestoreBanner({ accent, savedAt, slideCount, onRestore, onDiscard }: Props): React.ReactElement {
  return (
    <div className="mb-8 rounded-2xl border p-5 flex items-center justify-between gap-4 max-[640px]:flex-col max-[640px]:items-start" style={{ borderColor: accent + "40", background: accent + "0d" }}>
      <div className="flex items-start gap-3">
        <History className="w-4.5 h-4.5 shrink-0 mt-0.5" style={{ color: accent }} />
        <div>
          <div className="text-[13px] font-medium text-(--ink)">
            Unsaved work found — {slideCount} slide{slideCount === 1 ? "" : "s"} autosaved {relativeTime(savedAt)}.
          </div>
          <p className="text-[12px] text-muted-foreground mt-0.5">Restore it, or discard it and start fresh.</p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onRestore}
          className="h-9 px-4 rounded-full font-mono text-[11px] uppercase tracking-widest font-medium"
          style={{ background: accent, color: "var(--bg)" }}
        >
          Restore
        </button>
        <button
          type="button"
          onClick={onDiscard}
          className="h-9 w-9 inline-flex items-center justify-center rounded-full border border-(--rule) text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Discard autosaved draft"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
