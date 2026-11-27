"use client";

import type { ReactElement } from "react";
import {
  MAX_GOAL_NOTE_LENGTH,
  TRACK_LIST,
  TRACKS,
  registerBadgeText,
  resolveFocusId,
  type TrackId,
} from "../domain/tracks";
import { useLang } from "./lang-context";

interface Props {
  readonly track: TrackId;
  readonly focus: string;
  readonly goalNote: string;
  readonly compact?: boolean;
  readonly hideNote?: boolean;
  readonly disabled?: boolean;
  readonly onChange: (next: { readonly track: TrackId; readonly focus: string; readonly goalNote: string }) => void;
}

const NOTE_PLACEHOLDER: Record<TrackId, string> = {
  general: "Optional: e.g. trip to Lyon next month",
  tech: "Optional: e.g. backend dev joining a Paris team",
  medical: "Optional: e.g. pediatric nurse doing patient triage",
  student: "Optional: e.g. CS Master's student sorting housing & seminars",
  business: "Optional: e.g. SaaS founder pitching French retail clients",
  relocation: "Optional: e.g. moving in 6 weeks, apartment & préfecture",
  exams: "Optional: e.g. DELF B2 oral prep in 8 weeks",
};

/** Selects why the learner needs French/Spanish: track, focus area, and optional 1-line role context. */
export function TrackPicker({ track, focus, goalNote, compact = false, hideNote = false, disabled = false, onChange }: Props): ReactElement {
  const { pack } = useLang();
  const activeTrack = TRACKS[track];
  const resolvedFocus = resolveFocusId(track, focus);
  const activeFocus = activeTrack.focuses.find((f) => f.id === resolvedFocus) ?? activeTrack.focuses[0];
  const preview = activeTrack.samplePreview[pack.id];
  const regLabel = registerBadgeText(pack.id, activeFocus.preferredRegister ?? activeTrack.defaultRegister);

  return (
    <div className={disabled ? "pointer-events-none opacity-60" : ""}>
      <div role="radiogroup" aria-label="Learning goal track" className="fr-ui flex flex-wrap gap-1.5">
        {TRACK_LIST.map((item) => {
          const selected = item.id === track;
          return (
            <button
              key={item.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() =>
                onChange({
                  track: item.id,
                  focus: item.focuses[0].id,
                  goalNote,
                })
              }
              className={`min-h-9 rounded-lg border px-2.5 py-1.5 text-left text-xs font-medium transition-colors ${
                selected
                  ? "border-(--fr-mark) text-(--fr-ink) underline decoration-(--fr-mark) decoration-2 underline-offset-4"
                  : "border-(--rule,var(--fr-rule)) text-(--fr-soft) hover:border-(--fr-ink) hover:text-(--fr-ink)"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <p className="fr-ui mt-2 text-xs leading-5 text-(--fr-soft)">
        {activeTrack.shortHint} · <span className="text-(--fr-ink)">{regLabel}</span>
      </p>

      <div role="radiogroup" aria-label="Specific focus" className="fr-ui mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1">
        {activeTrack.focuses.map((item) => {
          const selected = item.id === resolvedFocus;
          return (
            <button
              key={item.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange({ track, focus: item.id, goalNote })}
              className={`min-h-9 px-1.5 text-xs underline-offset-4 transition-colors ${
                selected
                  ? "font-bold text-(--fr-ink) underline decoration-(--fr-key) decoration-2"
                  : "text-(--fr-soft) hover:text-(--fr-ink)"
              }`}
              title={item.hint}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {!hideNote ? (
        <div className="mt-2.5">
          <label htmlFor={`learn-goal-note-${compact ? "setup" : "settings"}`} className="sr-only">
            Exact role or context (optional)
          </label>
          <input
            id={`learn-goal-note-${compact ? "setup" : "settings"}`}
            type="text"
            value={goalNote}
            maxLength={MAX_GOAL_NOTE_LENGTH}
            onChange={(event) => onChange({ track, focus: resolvedFocus, goalNote: event.target.value })}
            placeholder={NOTE_PLACEHOLDER[track]}
            className="fr-ui w-full border-b border-(--fr-rule) bg-transparent py-1.5 text-sm text-(--fr-ink) placeholder:text-(--fr-soft)/70 focus:border-(--fr-key) focus:outline-none"
          />
        </div>
      ) : null}

      {!compact ? (
        <div className="mt-3 border-l-2 border-(--fr-rule) pl-3">
          <p className="fr-ui text-[11px] uppercase tracking-wider text-(--fr-soft)">{preview.context}</p>
          <p lang={pack.id} className="fr-print mt-0.5 text-[15px] leading-6 text-(--fr-ink)">
            « {preview.line} »
          </p>
          <p className="fr-ui text-xs text-(--fr-soft)">{preview.gloss}</p>
        </div>
      ) : null}
    </div>
  );
}
