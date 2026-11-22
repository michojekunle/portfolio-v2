"use client";

import type { ReactElement } from "react";
import { NaturalVoiceSettings } from "./NaturalVoiceSettings";
import { ReminderSettings } from "./ReminderSettings";
import { useLang } from "./lang-context";

/**
 * Shown to a signed-in learner before their first page: the two things most worth setting
 * up on day one, each optional and each a single tap. Everything else lives in settings.
 */
export function FirstRunSetup(): ReactElement {
  const { copy, pack } = useLang();
  return (
    <section className="fr-enter mt-8 border-y border-(--fr-rule) py-4" aria-labelledby="fr-first-run">
      <h2 id="fr-first-run" className="fr-print text-xl font-semibold leading-8 text-(--fr-ink)">
        Before your first page
      </h2>
      <p className="fr-ui mb-2 text-[15px] leading-6 text-(--fr-soft)">Both optional, and you can change them under {copy.settings}.</p>

      <div className="mb-3">
        <p className="fr-ui text-sm font-bold text-(--fr-ink)">{copy.settingsRows.reminder}</p>
        <p className="fr-ui text-sm text-(--fr-soft)">A nudge at the hour you pick, only on days you haven&apos;t done your page.</p>
        <ReminderSettings />
      </div>

      <div>
        <p className="fr-ui text-sm font-bold text-(--fr-ink)">{copy.settingsRows.naturalVoice}</p>
        <p className="fr-ui text-sm text-(--fr-soft)">
          {pack.name} spoken by a free neural voice on your device, instead of your phone&apos;s robotic one. It downloads in the background, so you can start straight away.
        </p>
        <NaturalVoiceSettings />
      </div>
    </section>
  );
}
