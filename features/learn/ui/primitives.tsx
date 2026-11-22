"use client";

import { useLang } from "./lang-context";
import type { ButtonHTMLAttributes, ReactElement, ReactNode } from "react";
import { Check, Volume2 } from "lucide-react";
import { speak } from "./speech-io";

/**
 * Spread onto the answer boxes. Grammarly and similar tools check text as English, "correct"
 * French or Spanish answers, and fight with the accent keys; these attributes tell them to stay out.
 */
export const NO_WRITING_TOOLS = {
  "data-gramm": "false",
  "data-gramm_editor": "false",
  "data-enable-grammarly": "false",
} as const;

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { readonly children: ReactNode };

/** The one action on a screen. `meta` sits right-aligned in small UI type (time, arrow). */
export function ActionButton({
  children,
  meta,
  compact = false,
  className = "",
  ...rest
}: ButtonProps & { readonly meta?: ReactNode; readonly compact?: boolean }): ReactElement {
  return (
    <button type="button" {...rest} className={`fr-action ${compact ? "is-compact" : ""} ${className}`}>
      <span>{children}</span>
      {meta ? <span className="fr-action-meta">{meta}</span> : null}
    </button>
  );
}

/** A secondary choice that should never compete with the action: an underlined word. */
export function QuietButton({ children, className = "", ...rest }: ButtonProps): ReactElement {
  return (
    <button type="button" {...rest} className={`fr-quiet fr-ui ${className}`}>
      {children}
    </button>
  );
}

export function OutlineButton({ children, className = "", ...rest }: ButtonProps): ReactElement {
  return (
    <button type="button" {...rest} className={`fr-outline fr-ui ${className}`}>
      {children}
    </button>
  );
}

export function SpeakerButton({ text, rate, label }: { readonly text: string; readonly rate?: number; readonly label: string }): ReactElement {
  return (
    <button type="button" onClick={() => speak(text, rate)} aria-label={label} title={label} className="fr-speaker">
      <Volume2 className="size-5" strokeWidth={1.75} aria-hidden="true" />
    </button>
  );
}

/**
 * Every step opens the same way: the instruction in the target language (what a teacher
 * would write on the board), then the English for anyone who needs it.
 */
export function StepHeading({ fr, en, children }: { readonly fr: string; readonly en: string; readonly children?: ReactNode }): ReactElement {
  const { pack } = useLang();
  return (
    <header className="mb-8">
      <h2 lang={pack.id} className="fr-print text-[28px] font-semibold leading-8 tracking-[-0.01em] text-(--fr-ink) [text-wrap:balance] md:text-[36px] md:leading-[44px]">
        {fr}
      </h2>
      <p className="fr-ui mt-2 text-[15px] leading-6 text-(--fr-soft)">{en}</p>
      {children}
    </header>
  );
}

export type TrailState = "done" | "current" | "todo";

/** The session's four parts. Cahier: a line of ticks. Dictionnaire: the thumb index on the page edge. */
export function Trail({ items }: { readonly items: readonly { readonly label: string; readonly state: TrailState }[] }): ReactElement {
  return (
    <ol className="fr-trail fr-ui" aria-label="Session">
      {items.map((item) => (
        <li key={item.label} data-state={item.state} aria-current={item.state === "current" ? "step" : undefined}>
          {item.state === "done" ? <Check className="size-3.5" strokeWidth={3} aria-hidden="true" /> : null}
          {item.label}
          {item.state === "done" ? <span className="sr-only"> (done)</span> : null}
        </li>
      ))}
    </ol>
  );
}
