import type { CarouselDraft } from "./types";

const STORAGE_KEY = "carousel_lab_autosave_draft";

export function readDraft(): CarouselDraft | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CarouselDraft;
    if (!parsed || !Array.isArray(parsed.slides)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeDraft(draft: CarouselDraft): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch {
    // Quota exceeded or storage unavailable — autosave is a convenience,
    // not a guarantee, so fail silently rather than interrupt editing.
  }
}

export function clearDraft(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}
