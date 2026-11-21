"use client";

import { useLang } from "./lang-context";
import { useEffect, useRef, useState, type ReactElement } from "react";
import { Flame, Settings2, Snowflake } from "lucide-react";
import { LEVELS, type Level } from "../domain/lessons";
import { STAGE_SHAPE, practiceStage, sessionsToNextStage } from "../domain/progression";
import type { SessionPayload } from "../server/service";
import { ActionButton, OutlineButton, QuietButton, Trail } from "./primitives";
import { COMMITMENT_STEPS, toCommitment, type Commitment } from "../domain/commitment";
import { CommitmentPicker } from "./CommitmentPicker";
import { LevelUpNote } from "./LevelUpNote";
import { VoiceNotice } from "./VoiceNotice";
import { SettingsPanel } from "./SettingsPanel";
import type { PageStyle } from "./style-preference";
import type { InstallState } from "./use-install";

interface Props {
  readonly payload: SessionPayload;
  readonly onStart: () => void;
  readonly onPickLevel: (level: Level) => void;
  readonly onSignIn: () => void;
  readonly pickingLevel: boolean;
  readonly style: PageStyle;
  readonly onStyleChange: (next: PageStyle) => void;
  readonly install: InstallState;
  readonly onSignOut: () => void;
  readonly onCommitmentChange: (next: Commitment) => void;
}

const LEVEL_HINT: Record<Level, string> = {
  A1: "Starting from zero",
  A2: "I know the basics",
  B1: "I can hold a conversation",
  B2: "I'm comfortable, want polish",
};

function localDate(locale: string, timeZone: string): string {
  try {
    return new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long", timeZone }).format(new Date());
  } catch (error) {
    console.warn("[learn] invalid time zone for date", timeZone, error);
    return new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long" }).format(new Date());
  }
}

function isEvening(): boolean {
  const hour = new Date().getHours();
  return hour >= 18 || hour < 4;
}

function capitalise(text: string): string {
  return text.charAt(0).toLocaleUpperCase("fr") + text.slice(1);
}

export function HomeScreen({ payload, onStart, onPickLevel, onSignIn, pickingLevel, style, onStyleChange, install, onSignOut, onCommitmentChange }: Props): ReactElement {
  const { copy, pack } = useLang();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const sheetEnd = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // The panel opens below the fold; bring it into view.
    if (settingsOpen) sheetEnd.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [settingsOpen]);

  const { streak, due, lesson, estimatedMinutes, guest, profile } = payload;
  const greetingText = streak.completedToday ? copy.seeYouTomorrow : isEvening() ? copy.greetingEvening : copy.greetingMorning;
  const needsLevel = !guest && profile.isNew;
  const reviewCount = due.length;
  const done = streak.completedToday;

  const completed = streak.totalCompletions;
  const stage = practiceStage(profile.level, completed);
  const shape = STAGE_SHAPE[stage];
  const lines = Math.min(shape.sentences, lesson.sentences.length);
  const words = Math.min(shape.newWords, lesson.vocab.length);
  // Guests can't get AI corrections, so free writing becomes the checkable exercise for them.
  const writeKind = shape.write === "free" && guest ? "gap" : shape.write;
  const WRITE_WHY = {
    tiles: "Rebuild one sentence from its words. No typing yet.",
    gap: "Fill in one missing word from today.",
    free: "One sentence of your own, corrected in red. Mistakes become tomorrow's cards.",
  } as const;
  const NEXT_UNLOCK = { 1: "fill in missing words", 2: "write your own sentences" } as const;

  const extras = COMMITMENT_STEPS[toCommitment(profile.dailyMinutes)];
  const plan = [
    reviewCount > 0 ? { label: copy.steps.review, why: `${reviewCount} word${reviewCount === 1 ? "" : "s"} you're about to forget.` } : null,
    { label: copy.steps.learn, why: `A short scene, ${lines} lines, ${words} new words.` },
    extras.listen ? { label: copy.steps.listen, why: "The scene at real speed, and how it's really pronounced." } : null,
    { label: copy.steps.speak, why: stage === 1 ? "Say one line out loud." : "Answer one question out loud, in your own words." },
    { label: copy.steps.write, why: WRITE_WHY[writeKind] },
    extras.dictation ? { label: copy.steps.dictation, why: "Hear one sentence, write it exactly." } : null,
  ].filter((row): row is { label: string; why: string } => row !== null);

  // After a few days the routine is known: stop explaining it, just show today's numbers.
  const familiar = !guest && completed >= 3;
  const toNext = guest ? null : sessionsToNextStage(profile.level, completed);

  return (
    <div className="fr-sheet">
      <header className="fr-head flex min-h-12 items-center justify-between gap-3 pb-1">
        <p className="fr-hand min-w-0 text-[clamp(15px,4.4vw,19px)] leading-8">{capitalise(localDate(pack.speechLocale, profile.timezone))}</p>
        {guest ? (
          <QuietButton onClick={onSignIn} className="shrink-0 whitespace-nowrap">
            Sign in
          </QuietButton>
        ) : (
          <span className="fr-ui flex items-center gap-3 text-sm font-bold text-(--fr-ink)">
            <span className="flex items-center gap-1" aria-label={`${streak.current} day streak`}>
              <Flame className={`size-4 ${streak.current > 0 ? "text-(--fr-mark)" : "text-(--fr-soft)"}`} strokeWidth={2} aria-hidden="true" />
              {streak.current}
            </span>
            {/* Freezes are shown and explained, never spent silently: a fair streak is one people trust. */}
            <span
              className="flex items-center gap-1 text-(--fr-soft)"
              title="Streak freezes: a missed day is covered automatically. You earn one every 7 days, up to 2."
              aria-label={`${streak.freezes} streak freeze${streak.freezes === 1 ? "" : "s"}. A missed day is covered automatically; you earn one every 7 days, up to 2.`}
            >
              <Snowflake className="size-4" strokeWidth={2} aria-hidden="true" />
              {streak.freezes}
            </span>
          </span>
        )}
      </header>

      <div className="fr-trail-preview">
        <Trail items={plan.map((row) => ({ label: row.label, state: "todo" as const }))} />
      </div>

      <main className="fr-enter flex flex-1 flex-col pt-8">
        <h1
          className={`fr-greeting fr-print font-semibold tracking-[-0.025em] md:text-[76px] md:leading-[88px] ${
            // Keep the greeting on one line on phones: "Buenas noches." needs less size than "Bonsoir.".
            greetingText.length > 10 ? "text-[clamp(36px,11vw,56px)] leading-[1.15]" : "text-[56px] leading-16"
          }`}
        >
          {greetingText}
        </h1>

        {done ? (
          <p className="fr-ui mt-4 max-w-[34ch] text-base leading-8 text-(--fr-soft)">
            Today&apos;s page is done. Your cards are scheduled — come back tomorrow and they&apos;ll be waiting.
          </p>
        ) : (
          <p className="fr-hand mt-4 text-[22px] leading-8">
            {copy.today} <span lang={pack.id}>{lesson.title}</span>
          </p>
        )}

        {!guest && !needsLevel && completed === 0 && !done ? (
          <section className="fr-enter mt-8 border-y border-(--fr-rule) py-4" aria-labelledby="fr-goal">
            <h2 id="fr-goal" lang={pack.id} className="fr-print text-xl font-semibold leading-8 text-(--fr-ink)">
              {copy.goal}
            </h2>
            <p className="fr-ui mb-1 text-[15px] leading-6 text-(--fr-soft)">How much time can you give most days? You can change it any time.</p>
            <CommitmentPicker value={profile.dailyMinutes} busy={pickingLevel} onChange={onCommitmentChange} />
          </section>
        ) : null}

        <VoiceNotice />

        {payload.levelSuggestion && !needsLevel ? (
          <LevelUpNote suggestion={payload.levelSuggestion} busy={pickingLevel} onAccept={onPickLevel} />
        ) : null}

        {needsLevel ? (
          <fieldset className="mt-8" disabled={pickingLevel}>
            <legend className="fr-print text-xl font-semibold leading-8 text-(--fr-ink)">{copy.whereAreYou}</legend>
            <p className="fr-ui text-sm leading-6 text-(--fr-soft)">This sets how hard your daily scenes are. You can change it any time under {copy.settings}.</p>
            <div className="mt-4 grid gap-2">
              {LEVELS.map((level) => (
                <OutlineButton key={level} onClick={() => onPickLevel(level)} className="justify-start gap-4 text-left">
                  <span className="fr-print w-8 text-xl text-(--fr-key)">{level}</span>
                  <span className="font-normal">{LEVEL_HINT[level]}</span>
                </OutlineButton>
              ))}
            </div>
          </fieldset>
        ) : familiar ? (
          <p className="fr-ui mt-6 text-[15px] leading-8 text-(--fr-soft)">
            {plan.map((row) => row.label).join(" · ")}
            {reviewCount > 0 ? ` — ${reviewCount} to review, ${words} new` : ` — ${words} new words`}
          </p>
        ) : (
          <section className="mt-8" aria-labelledby="fr-plan">
            <h2 id="fr-plan" className="fr-ui text-sm font-bold leading-8 text-(--fr-ink)">
              {copy.plan} <span className="font-normal text-(--fr-soft)">· today&apos;s plan</span>
            </h2>
            <ol className="mt-2">
              {plan.map((row, i) => (
                <li key={row.label} className="fr-row py-2">
                  <span className="fr-note leading-8">{i + 1}</span>
                  <span lang={pack.id} className="fr-print text-xl font-semibold leading-8 text-(--fr-ink)">
                    {row.label}
                  </span>
                  <p className="fr-ui text-[15px] leading-6 text-(--fr-soft)">{row.why}</p>
                </li>
              ))}
            </ol>

            <details className="group mt-4">
              <summary className="fr-quiet cursor-pointer list-none">Why this order works</summary>
              <div className="fr-ui mt-2 space-y-3 text-[15px] leading-6 text-(--fr-soft)">
                <p>
                  <strong className="text-(--fr-ink)">Recall before you reread.</strong> Pulling a word out of memory, right before you&apos;d forget it,
                  makes it stick far longer than seeing it again. That&apos;s what the review schedule does.
                </p>
                <p>
                  <strong className="text-(--fr-ink)">Hear real sentences, not lists.</strong> Words learned inside a little story come back with their
                  grammar attached.
                </p>
                <p>
                  <strong className="text-(--fr-ink)">Produce something every day.</strong> Saying and writing one line is where you find out what you
                  can&apos;t do yet — and that&apos;s the part worth fixing.
                </p>
                <p>No magic multiplier: about ten focused minutes, every day, is what moves you.</p>
              </div>
            </details>
          </section>
        )}

        {needsLevel ? null : (
          <div className="fr-dock mt-auto">
              {streak.atRisk && !done ? (
                <p className="fr-mark mb-3 text-[17px] leading-8">Your {streak.current}-day streak ends tonight.</p>
              ) : null}
              <ActionButton onClick={onStart} meta={`≈ ${estimatedMinutes} min →`}>
                {done ? copy.startAgain : copy.start}
              </ActionButton>
              {guest ? (
                <p className="fr-ui mt-3 text-center text-sm leading-6 text-(--fr-soft)">No account needed to try. Sign in after to keep your words.</p>
              ) : null}
              {toNext !== null && stage < 3 && !done ? (
                <p className="fr-ui mt-3 text-center text-sm leading-6 text-(--fr-soft)">
                  {toNext} more page{toNext === 1 ? "" : "s"} until you {stage === 1 ? NEXT_UNLOCK[1] : NEXT_UNLOCK[2]}.
                </p>
              ) : null}
          </div>
        )}
      </main>

      <footer className="fr-ui mt-8 border-t border-(--fr-rule) pt-1 text-xs text-(--fr-soft)">
        <div className="flex items-center justify-between gap-x-3">
          <span className="min-w-0">
            Level {profile.level} · {profile.dailyMinutes === 60 ? "1 h" : `${profile.dailyMinutes} min`}/day · {streak.longest > 0 ? `best run ${streak.longest} days` : "day one starts today"}
          </span>
          <QuietButton
            onClick={() => setSettingsOpen((open) => !open)}
            aria-expanded={settingsOpen}
            aria-controls="fr-settings"
            className="shrink-0 text-xs"
          >
            <Settings2 className="size-4" aria-hidden="true" /> {copy.settings}
          </QuietButton>
        </div>
        {settingsOpen ? (
          <SettingsPanel
            id="fr-settings"
            style={style}
            onStyleChange={onStyleChange}
            guest={guest}
            level={profile.level}
            canChangeLevel={!guest && !needsLevel}
            pickingLevel={pickingLevel}
            onPickLevel={onPickLevel}
            install={install}
            onSignIn={onSignIn}
            onSignOut={onSignOut}
            commitment={profile.dailyMinutes}
            onCommitmentChange={onCommitmentChange}
          />
        ) : null}
      </footer>
      <div ref={sheetEnd} aria-hidden="true" />
    </div>
  );
}
