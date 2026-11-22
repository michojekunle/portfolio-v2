"use client";

import { useLang } from "./lang-context";
import Link from "next/link";
import { useEffect, useState, type ReactElement, type ReactNode } from "react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { Download, Share } from "lucide-react";
import { LEVELS, type Level } from "../domain/lessons";
import type { Commitment } from "../domain/commitment";
import { LANGUAGES } from "../domain/languages";
import { ChoiceGroup } from "./ChoiceGroup";
import { CommitmentPicker } from "./CommitmentPicker";
import { NaturalVoiceSettings } from "./NaturalVoiceSettings";
import { ReminderSettings } from "./ReminderSettings";
import { QuietButton } from "./primitives";
import { PAGE_STYLES, type PageStyle } from "./style-preference";
import type { InstallState } from "./use-install";

const MODES = ["light", "dark", "system"] as const;
type Mode = (typeof MODES)[number];

const LEVEL_LABEL: Record<Level, string> = { A1: "A1", A2: "A2", B1: "B1", B2: "B2" };

function isMode(value: string | undefined): value is Mode {
  return value !== undefined && (MODES as readonly string[]).includes(value);
}

interface Props {
  readonly id: string;
  readonly style: PageStyle;
  readonly onStyleChange: (next: PageStyle) => void;
  readonly guest: boolean;
  readonly level: Level;
  readonly canChangeLevel: boolean;
  readonly pickingLevel: boolean;
  readonly onPickLevel: (level: Level) => void;
  readonly plus: boolean;
  readonly variant: string | null;
  readonly onVariantChange: (variant: string) => void;
  readonly commitment: Commitment;
  readonly onCommitmentChange: (next: Commitment) => void;
  readonly install: InstallState;
  readonly onSignIn: () => void;
  readonly onSignOut: () => void;
}

async function startCheckout(app: string): Promise<void> {
  try {
    const response = await fetch("/api/billing/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ app }) });
    const data = (await response.json()) as { url?: string; error?: string };
    if (!response.ok || !data.url) throw new Error(data.error ?? "Checkout didn't start.");
    window.location.assign(data.url);
  } catch (error) {
    console.error("[learn] checkout failed", error);
    toast.error(error instanceof Error ? error.message : "Checkout didn't start. Try again.");
  }
}

function Row({ label, hint, children }: { readonly label: string; readonly hint?: string; readonly children: ReactNode }): ReactElement {
  return (
    <div className="grid gap-x-4 border-b border-(--fr-rule) py-2 last:border-b-0 sm:grid-cols-[9rem_1fr] sm:items-center">
      <div>
        <p className="fr-ui text-sm font-bold text-(--fr-ink)">{label}</p>
        {hint ? <p className="fr-ui text-xs leading-5 text-(--fr-soft)">{hint}</p> : null}
      </div>
      <div className="-ml-2">{children}</div>
    </div>
  );
}

/** Everything that isn't today's page, kept off the page until asked for. */
export function SettingsPanel(props: Props): ReactElement {
  const { copy, pack } = useLang();
  const { theme, setTheme } = useTheme();
  // next-themes only knows the stored mode on the client.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const mode: Mode | null = mounted && isMode(theme) ? theme : null;

  return (
    <section id={props.id} aria-label="Settings" className="fr-enter mt-6 border-t border-(--fr-ink) pt-2">
      <Row label={copy.settingsRows.page} hint="How the page looks">
        <ChoiceGroup label="Page style" options={PAGE_STYLES} labels={copy.styles} value={props.style} onChange={props.onStyleChange} />
      </Row>

      {pack.variants && pack.variants.length > 1 ? (
        <Row label={copy.settingsRows.variant} hint="Voice and vocabulary">
          <div className={props.pickingLevel ? "pointer-events-none opacity-50" : ""}>
            <ChoiceGroup
              label={`${pack.name} variety`}
              options={pack.variants.map((v) => v.id)}
              labels={Object.fromEntries(pack.variants.map((v) => [v.id, v.label]))}
              value={props.variant ?? pack.variants[0].id}
              onChange={props.onVariantChange}
            />
          </div>
        </Row>
      ) : null}

      <Row label={copy.settingsRows.light} hint="Auto follows your device">
        <ChoiceGroup label="Light or dark" options={MODES} labels={copy.modes} value={mode} onChange={(next) => setTheme(next)} />
      </Row>

      {props.canChangeLevel ? (
        <Row label={copy.settingsRows.level} hint="Applies from tomorrow's scene">
          <div className={props.pickingLevel ? "pointer-events-none opacity-50" : ""}>
            <ChoiceGroup label="Level" options={LEVELS} labels={LEVEL_LABEL} value={props.level} onChange={props.onPickLevel} />
          </div>
        </Row>
      ) : null}

      {props.canChangeLevel ? (
        <Row label={copy.settingsRows.reminder} hint="Only on days you haven't done your page">
          <ReminderSettings />
        </Row>
      ) : null}

      {props.canChangeLevel ? (
        <Row label={copy.settingsRows.time} hint="Per day — and what it gets you">
          <div className="pl-2">
            <CommitmentPicker value={props.commitment} busy={props.pickingLevel} onChange={props.onCommitmentChange} />
          </div>
        </Row>
      ) : null}

      <Row label={copy.settingsRows.naturalVoice} hint="Open-source neural voice, free">
        <NaturalVoiceSettings />
      </Row>

      {/* Plus (paid cloud voices) stays hidden until it's switched on with NEXT_PUBLIC_PLUS_ENABLED=true. */}
      {!props.guest && process.env.NEXT_PUBLIC_PLUS_ENABLED === "true" ? (
        <Row label={copy.settingsRows.plus} hint="Natural, native-sounding voices">
          {props.plus ? (
            <p className="fr-ui px-2 py-3 text-sm text-(--fr-ink)">Natural voices are on. Thank you for supporting the app.</p>
          ) : (
            <QuietButton onClick={() => void startCheckout(pack.route)} className="text-(--fr-ink)">
              Upgrade for natural voices →
            </QuietButton>
          )}
        </Row>
      ) : null}

      {props.install.mode === "prompt" ? (
        <Row label="App" hint="Opens straight to today's page">
          <QuietButton onClick={() => void props.install.install()} className="text-(--fr-ink)">
            <Download className="size-4" aria-hidden="true" /> Install {pack.appName}
          </QuietButton>
        </Row>
      ) : null}
      {props.install.mode === "ios" ? (
        <Row label="App" hint="Opens straight to today's page">
          <p className="fr-ui flex flex-wrap items-center gap-1 px-2 py-2 text-sm leading-6 text-(--fr-ink)">
            Tap <Share className="size-4" aria-label="Share" /> then <strong>Add to Home Screen</strong>.
          </p>
        </Row>
      ) : null}

      <Row label={copy.settingsRows.account}>
        {props.guest ? (
          <QuietButton onClick={props.onSignIn}>Sign in to keep your progress</QuietButton>
        ) : (
          <QuietButton onClick={props.onSignOut}>Sign out</QuietButton>
        )}
      </Row>

      {Object.values(LANGUAGES)
        .filter((other) => other.id !== pack.id)
        .map((other) => (
          <Row key={other.id} label={copy.settingsRows.otherLanguage} hint="Separate streak, words and level">
            <Link href={other.route} className="fr-quiet fr-ui">
              {other.appName} →
            </Link>
          </Row>
        ))}
    </section>
  );
}
