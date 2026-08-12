import { AMD_DOTS, AMD_PATH_D, MO_PATH_D } from "@/lib/brand-mark";

export type MarkId = "mo" | "amd";
export type MarkVariant = "badge" | "transparent";
export type MarkFormat = "png" | "jpg";

const SVG_FRACTION: Record<MarkId, number> = { mo: 0.64, amd: 0.72 };
const STROKE_WIDTH: Record<MarkId, number> = { mo: 6.4, amd: 8 };
const AMD_ACCENT = "#d97a4d";

function renderMarkToCanvas(mark: MarkId, size: number, variant: MarkVariant): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D canvas context unavailable");

  if (variant === "badge") {
    const r = size * 0.1875;
    ctx.fillStyle = "#0a0a0a";
    ctx.beginPath();
    ctx.roundRect(0, 0, size, size, r);
    ctx.fill();

    const border = Math.max(1, size * 0.03125);
    ctx.strokeStyle = "rgba(255,255,255,0.14)";
    ctx.lineWidth = border;
    ctx.beginPath();
    ctx.roundRect(border / 2, border / 2, size - border, size - border, Math.max(0, r - border));
    ctx.stroke();
  }

  const markSize = size * SVG_FRACTION[mark];
  const offset = (size - markSize) / 2;
  ctx.save();
  ctx.translate(offset, offset);
  ctx.scale(markSize / 100, markSize / 100);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = STROKE_WIDTH[mark];
  ctx.strokeStyle = "#ffffff";
  ctx.stroke(new Path2D(mark === "mo" ? MO_PATH_D : AMD_PATH_D));
  if (mark === "amd") {
    ctx.fillStyle = AMD_ACCENT;
    for (const dot of AMD_DOTS) {
      ctx.beginPath();
      ctx.arc(dot.cx, dot.cy, 5.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();

  return canvas;
}

function triggerDownload(canvas: HTMLCanvasElement, filename: string, format: MarkFormat): void {
  const mime = format === "jpg" ? "image/jpeg" : "image/png";
  const url = canvas.toDataURL(mime, format === "jpg" ? 0.95 : undefined);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
}

export function downloadMark(mark: MarkId, size: number, variant: MarkVariant, format: MarkFormat): void {
  // JPEG has no alpha channel — always flatten onto the dark badge for that format.
  const effectiveVariant: MarkVariant = format === "jpg" ? "badge" : variant;
  const canvas = renderMarkToCanvas(mark, size, effectiveVariant);
  const suffix = effectiveVariant === "transparent" ? "transparent" : "badge";
  triggerDownload(canvas, `${mark}-mark-${suffix}-${size}.${format}`, format);
}
