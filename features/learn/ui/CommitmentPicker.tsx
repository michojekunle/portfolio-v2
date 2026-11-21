"use client";

import type { ReactElement } from "react";
import { COMMITMENTS, GOALS, type Commitment } from "../domain/commitment";
import { ChoiceGroup } from "./ChoiceGroup";

const LABELS: Record<Commitment, string> = { 15: "15 min", 30: "30 min", 60: "1 h" };

const ADDS: Record<Commitment, string> = {
  15: "Review, a short scene, speaking and writing.",
  30: "Everything in 15, plus real-speed listening.",
  60: "Everything in 30, plus a daily dictation.",
};

interface Props {
  readonly value: Commitment;
  readonly busy: boolean;
  readonly onChange: (next: Commitment) => void;
}

/**
 * Daily time, with what it realistically gets you. The goals are estimates —
 * said so on the page — because overpromising is how learning apps lose trust.
 */
export function CommitmentPicker({ value, busy, onChange }: Props): ReactElement {
  return (
    <div>
      <div className={busy ? "pointer-events-none opacity-50" : ""}>
        <ChoiceGroup label="Daily time" options={COMMITMENTS} labels={LABELS} value={value} onChange={onChange} />
      </div>
      <p className="fr-ui text-sm leading-6 text-(--fr-ink)">{ADDS[value]}</p>
      <ol className="mt-2 space-y-1" aria-label={`Realistic goals at ${LABELS[value]} a day`}>
        {GOALS[value].map((goal) => (
          <li key={goal.months} className="fr-ui grid grid-cols-[4.5rem_3.5rem_1fr] items-baseline gap-x-2 text-sm leading-6">
            <span className="text-(--fr-soft)">{goal.months} months</span>
            <span className="fr-print font-semibold text-(--fr-key)">{goal.level}</span>
            <span className="text-(--fr-ink)">{goal.canDo}</span>
          </li>
        ))}
      </ol>
      <p className="fr-ui mt-2 text-xs leading-5 text-(--fr-soft)">
        Estimates for showing up most days. Real conversations with people speed everything up.
      </p>
    </div>
  );
}
