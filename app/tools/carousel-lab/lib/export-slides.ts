import JSZip from "jszip";
import type { AspectRatio, Slide } from "./types";
import { EXPORT_WIDTH, exportHeight } from "./constants";
import { drawSlideToCanvas, type RenderConfig } from "./render-slide";

function renderToCanvas(slide: Slide, index: number, aspectRatio: AspectRatio, config: RenderConfig): HTMLCanvasElement | null {
  const canvas = document.createElement("canvas");
  canvas.width = EXPORT_WIDTH;
  canvas.height = exportHeight(aspectRatio);
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  drawSlideToCanvas(ctx, slide, index, canvas.width, canvas.height, config);
  return canvas;
}

export function exportSlideAsPNG(slide: Slide, index: number, aspectRatio: AspectRatio, config: RenderConfig): void {
  const canvas = renderToCanvas(slide, index, aspectRatio, config);
  if (!canvas) return;
  const link = document.createElement("a");
  link.download = `slide-${index + 1}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

export async function exportSlidesAsZip(slides: Slide[], aspectRatio: AspectRatio, config: RenderConfig, filenamePrefix: string): Promise<void> {
  const zip = new JSZip();

  for (let idx = 0; idx < slides.length; idx++) {
    const canvas = renderToCanvas(slides[idx], idx, aspectRatio, config);
    if (!canvas) continue;
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((b) => {
        if (b) resolve(b);
        else reject(new Error("canvas.toBlob failed"));
      }, "image/png");
    });
    zip.file(`slide-${idx + 1}.png`, blob);
  }

  const content = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(content);
  const link = document.createElement("a");
  link.download = `${filenamePrefix || "carousel"}-slides.zip`;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
}

export async function exportSlidesAsPDF(slides: Slide[], aspectRatio: AspectRatio, config: RenderConfig, filenamePrefix: string): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const width = EXPORT_WIDTH;
  const height = exportHeight(aspectRatio);

  const pdf = new jsPDF({ orientation: "p", unit: "px", format: [width, height] });

  for (let idx = 0; idx < slides.length; idx++) {
    if (idx > 0) pdf.addPage([width, height]);
    const canvas = renderToCanvas(slides[idx], idx, aspectRatio, config);
    if (!canvas) continue;
    const imgData = canvas.toDataURL("image/jpeg", 0.95);
    pdf.addImage(imgData, "JPEG", 0, 0, width, height);
  }

  pdf.save(`${filenamePrefix || "carousel-lab"}-swipe.pdf`);
}
