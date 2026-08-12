import { useEffect, useState } from "react";
import type { DesignPreset, DesignPresetData } from "./types";

const STORAGE_KEY = "carousel_lab_design_presets";
const MAX_PRESETS = 24;

function readStoredPresets(): DesignPreset[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Named design snapshots (mood, fonts, sizes, colors, branding) saved to localStorage — never slide content. */
export function useDesignPresets(): {
  presets: DesignPreset[];
  savePreset: (name: string, data: DesignPresetData) => void;
  deletePreset: (id: string) => void;
} {
  const [presets, setPresets] = useState<DesignPreset[]>([]);

  useEffect(() => {
    setPresets(readStoredPresets());
  }, []);

  const persist = (next: DesignPreset[]): void => {
    setPresets(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  };

  const savePreset = (name: string, data: DesignPresetData): void => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const next: DesignPreset = { id: crypto.randomUUID(), name: trimmed, createdAt: Date.now(), data };
    // Newest first, capped — this is a quick-recall list, not an archive.
    persist([next, ...presets].slice(0, MAX_PRESETS));
  };

  const deletePreset = (id: string): void => {
    persist(presets.filter((p) => p.id !== id));
  };

  return { presets, savePreset, deletePreset };
}
