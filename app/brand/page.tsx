"use client";

import { useState } from "react";
import { MoMark, AmdMark, MoSignatureInline, AmdSignatureInline } from "@/lib/brand-mark";
import { downloadMark, type MarkFormat, type MarkId, type MarkVariant } from "@/lib/download-mark";

const SIZES = [128, 256, 512, 1024, 2048] as const;

const MARKS: { id: MarkId; label: string; blurb: string }[] = [
  {
    id: "mo",
    label: "MO — Signature Flourish",
    blurb: "Michael Ojekunle, the forward brand. Primary mark — use this by default.",
  },
  {
    id: "amd",
    label: "AMD — Unbroken",
    blurb: "Ayomide, one name in three syllables. Signature mark — socials, footer credit.",
  },
];

const fieldLabel = "block font-mono text-[10px] tracking-[0.14em] uppercase mb-2 text-muted-foreground";

function MarkCard({ id, label, blurb }: { id: MarkId; label: string; blurb: string }): React.ReactElement {
  const [size, setSize] = useState<(typeof SIZES)[number]>(512);
  const [variant, setVariant] = useState<MarkVariant>("badge");

  const download = (format: MarkFormat): void => downloadMark(id, size, variant, format);

  return (
    <div className="rounded-2xl border border-(--rule) bg-(--bg-2) p-6 space-y-5">
      <div>
        <h2 className="font-display text-[20px] text-(--ink) mb-1">{label}</h2>
        <p className="text-[13px] text-secondary-foreground leading-relaxed">{blurb}</p>
      </div>

      {/* Preview actually reflects the selected background — badge vs. bare
          stroke on the page's own surface — so it isn't showing a fixed
          mockup the download will silently disagree with. */}
      <div
        className="flex items-center justify-center py-6 rounded-xl border border-(--rule)"
        style={variant === "badge" ? { background: "var(--bg)" } : undefined}
      >
        {variant === "badge" ? (
          id === "mo" ? (
            <MoMark dim={96} />
          ) : (
            <AmdMark dim={96} />
          )
        ) : id === "mo" ? (
          <MoSignatureInline height={64} color="var(--ink)" />
        ) : (
          <AmdSignatureInline height={64} color="var(--ink)" />
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={fieldLabel}>Size (px)</label>
          <select
            value={size}
            onChange={(e) => setSize(Number(e.target.value) as (typeof SIZES)[number])}
            className="w-full h-9 px-2.5 rounded-lg border border-(--rule) bg-(--bg) text-(--ink) text-[12px] outline-none"
          >
            {SIZES.map((s) => (
              <option key={s} value={s}>
                {s} × {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={fieldLabel}>Background</label>
          <select
            value={variant}
            onChange={(e) => setVariant(e.target.value as MarkVariant)}
            className="w-full h-9 px-2.5 rounded-lg border border-(--rule) bg-(--bg) text-(--ink) text-[12px] outline-none"
          >
            <option value="badge">Dark badge</option>
            <option value="transparent">Transparent</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={() => download("png")}
          className="h-9.5 rounded-full font-mono text-[11px] uppercase tracking-widest font-medium border border-(--rule) bg-(--ink) text-(--bg) hover:opacity-90 transition-opacity"
        >
          Download PNG
        </button>
        <button
          type="button"
          onClick={() => download("jpg")}
          className="h-9.5 rounded-full font-mono text-[11px] uppercase tracking-widest font-medium border border-(--rule) bg-(--bg) text-(--ink) hover:border-muted-foreground transition-colors"
        >
          Download JPG
        </button>
      </div>
      {variant === "transparent" && (
        <p className="text-[10px] text-muted-foreground -mt-2">JPG has no transparency — that download always uses the dark badge.</p>
      )}
    </div>
  );
}

export default function BrandKitPage(): React.ReactElement {
  return (
    <main id="main-content" tabIndex={-1} className="outline-none min-h-screen">
      <section className="max-w-(--maxw) mx-auto px-(--gutter) py-16 space-y-10">
        <div className="max-w-[60ch]">
          <div className="font-mono text-[10px] tracking-[0.16em] uppercase text-(--v3-accent) mb-3">Brand Kit</div>
          <h1 className="font-display text-[clamp(32px,5vw,44px)] leading-tight text-(--ink) mb-3">Logo downloads.</h1>
          <p className="text-[15px] text-secondary-foreground leading-relaxed">
            Both marks, straight from the same source used across the site, favicon, and OG cards — so nothing here can drift
            from what&apos;s live. Pick a size and background, download PNG or JPG.
          </p>
        </div>

        <div className="grid grid-cols-2 max-[720px]:grid-cols-1 gap-6">
          {MARKS.map((m) => (
            <MarkCard key={m.id} {...m} />
          ))}
        </div>
      </section>
    </main>
  );
}
