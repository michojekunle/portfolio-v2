"use client";

import { useLang } from "./lang-context";
import type { ReactElement } from "react";
import { Check, X } from "lucide-react";
import { diffWords } from "../domain/diff";

interface Props {
  /** What the learner produced. */
  readonly original: string;
  /** The right version. Identical when nothing needed fixing. */
  readonly corrected: string;
  readonly correct: boolean;
}

/**
 * The signature correction: the learner's words in their ink, wrong words
 * struck through one by one in red, then the fix written out beneath.
 */
export function RedPen({ original, corrected, correct }: Props): ReactElement {
  const { pack } = useLang();
  const tokens = diffWords(original, corrected);
  const hasChanges = tokens.some((token) => token.kind !== "same");
  let strikeIndex = 0;

  return (
    <>
      <span className="fr-note leading-8" aria-hidden="true">
        {correct ? <Check className="ml-auto size-5" strokeWidth={2.5} /> : <X className="ml-auto size-5" strokeWidth={2.5} />}
      </span>
      <p lang={pack.id} className="fr-hand text-[24px] leading-8 [overflow-wrap:anywhere]">
        {tokens
          .filter((token) => token.kind !== "added")
          .map((token, i) =>
            token.kind === "removed" ? (
              <span key={i}>
                <span className="fr-strike" style={{ ["--i" as string]: strikeIndex++ }}>
                  {token.word}
                </span>{" "}
              </span>
            ) : (
              <span key={i}>{token.word} </span>
            )
          )}
      </p>
      {hasChanges ? (
        <p lang={pack.id} className="fr-mark fr-written text-[24px] leading-8 [overflow-wrap:anywhere]" style={{ ["--delay" as string]: `${strikeIndex * 120 + 450}ms` }}>
          → {corrected}
        </p>
      ) : null}
    </>
  );
}
