"use client";

import type { ReactElement } from "react";

interface Props<T extends string | number> {
  readonly label: string;
  readonly options: readonly T[];
  readonly labels: Record<T, string>;
  readonly value: T | null;
  readonly onChange: (next: T) => void;
}

/** A row of text choices; the chosen one is underlined in red pen. Radio semantics, so arrow keys move between them. */
export function ChoiceGroup<T extends string | number>({ label, options, labels, value, onChange }: Props<T>): ReactElement {
  const move = (from: T, step: number, group: HTMLElement | null): void => {
    const next = (options.indexOf(from) + step + options.length) % options.length;
    onChange(options[next]);
    // Focus follows selection, as in a native radio group.
    group?.querySelectorAll<HTMLButtonElement>('[role="radio"]')[next]?.focus();
  };

  return (
    <div role="radiogroup" aria-label={label} className="fr-ui flex flex-wrap items-center gap-x-1 text-sm">
      {options.map((option, i) => {
        const selected = option === value;
        // With nothing selected yet (before mount), keep the first option reachable by Tab.
        const tabbable = selected || (value === null && i === 0);
        return (
          <button
            key={String(option)}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={tabbable ? 0 : -1}
            onClick={() => onChange(option)}
            onKeyDown={(event) => {
              if (event.key === "ArrowRight" || event.key === "ArrowDown") {
                event.preventDefault();
                move(option, 1, event.currentTarget.parentElement);
              } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
                event.preventDefault();
                move(option, -1, event.currentTarget.parentElement);
              }
            }}
            className={`min-h-11 px-2 font-bold underline-offset-[6px] transition-colors ${
              selected ? "text-(--fr-ink) underline decoration-(--fr-mark) decoration-2" : "text-(--fr-soft) hover:text-(--fr-ink)"
            }`}
          >
            {labels[option]}
          </button>
        );
      })}
    </div>
  );
}
