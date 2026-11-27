"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactElement } from "react";
import { ArrowLeft, BookmarkPlus, Check, Loader2, Mic, Send, Sparkles, Square, Volume2 } from "lucide-react";
import { toast } from "sonner";
import type { Level, Register } from "../domain/lessons";
import {
  MAX_ROLEPLAY_TURNS,
  type RoleplayDebriefOutput,
  type RoleplayHistoryItem,
  type RoleplayTurnOutput,
} from "../domain/schemas";
import { TRACKS, registerBadgeText, resolveFocusId, type TrackId } from "../domain/tracks";
import { AccentKeys, insertAtCaret } from "./AccentKeys";
import { useLang } from "./lang-context";
import { NO_WRITING_TOOLS, ActionButton, OutlineButton, QuietButton, SpeakerButton } from "./primitives";
import { canRecognize, listenOnce, speak, stopSpeaking, type ListenHandle } from "./speech-io";

interface Props {
  readonly track: TrackId;
  readonly goalFocus: string;
  readonly goalNote: string | null;
  readonly level: Level;
  readonly initialMissionSlug?: string;
  readonly onClose: () => void;
}

interface TurnEntry {
  readonly role: "user" | "assistant";
  readonly text: string;
  readonly en?: string;
  readonly coachHint?: string;
}

type Stage = "setup" | "active" | "debrief";

/**
 * Focused 4-6 turn interactive simulation (voice or text) for a real-world
 * scenario in the learner's track, ending with a Red Pen debrief whose
 * corrections & native upgrades save straight into Flashcards.
 */
export function RoleplayScreen({
  track,
  goalFocus,
  goalNote,
  level,
  initialMissionSlug,
  onClose,
}: Props): ReactElement {
  const { pack } = useLang();
  const trackDef = TRACKS[track];
  const resolvedFocus = resolveFocusId(track, goalFocus);
  const defaultMission =
    (initialMissionSlug ? trackDef.missions.find((m) => m.slug === initialMissionSlug) : undefined) ??
    trackDef.missions.find((m) => m.focusIds.includes(resolvedFocus)) ??
    trackDef.missions[0];

  const [missionSlug, setMissionSlug] = useState(defaultMission.slug);
  const [customSituation, setCustomSituation] = useState("");
  const [stage, setStage] = useState<Stage>("setup");
  const [turns, setTurns] = useState<readonly TurnEntry[]>([]);
  const [register, setRegister] = useState<Register>(defaultMission.register);
  const [shouldWrap, setShouldWrap] = useState(false);
  const [showTranslations, setShowTranslations] = useState(false);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [micReady, setMicReady] = useState(false);
  const [debrief, setDebrief] = useState<RoleplayDebriefOutput | null>(null);
  const [savedPhrases, setSavedPhrases] = useState<Record<string, boolean>>({});
  const listenHandle = useRef<ListenHandle | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMicReady(canRecognize());
    return () => {
      listenHandle.current?.stop();
      stopSpeaking();
    };
  }, []);

  const focusMissions = [
    ...trackDef.missions.filter((m) => m.focusIds.includes(resolvedFocus)),
    ...trackDef.missions.filter((m) => !m.focusIds.includes(resolvedFocus)),
  ].slice(0, 5);
  const activeMission = trackDef.missions.find((m) => m.slug === missionSlug) ?? defaultMission;
  const userTurnCount = turns.filter((t) => t.role === "user").length;
  const latestHint = [...turns].reverse().find((t) => t.role === "assistant" && t.coachHint)?.coachHint;

  const callRoleplay = async (
    action: "start" | "reply" | "debrief",
    history: readonly RoleplayHistoryItem[]
  ): Promise<{ turn?: RoleplayTurnOutput; debrief?: RoleplayDebriefOutput } | null> => {
    setBusy(true);
    try {
      const response = await fetch(`${pack.api}/roleplay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          level,
          track,
          goalFocus: resolvedFocus,
          ...(goalNote ? { goalNote } : {}),
          missionSlug,
          ...(customSituation.trim() ? { customSituation: customSituation.trim() } : {}),
          history,
        }),
      });
      if (!response.ok) throw new Error(`Roleplay request failed with ${response.status}`);
      const data = (await response.json()) as {
        available?: boolean;
        turn?: RoleplayTurnOutput;
        debrief?: RoleplayDebriefOutput;
      };
      if (!data.available) {
        toast.error("Live simulation is temporarily unavailable. Try again in a moment.");
        return null;
      }
      return data;
    } catch (caught) {
      console.error("[learn] roleplay request failed", caught);
      toast.error("Couldn't reach the live coach right now.");
      return null;
    } finally {
      setBusy(false);
    }
  };

  const startRoleplay = async (): Promise<void> => {
    const res = await callRoleplay("start", []);
    if (!res?.turn) return;
    setRegister(res.turn.register);
    setShouldWrap(res.turn.shouldWrap);
    setTurns([{ role: "assistant", text: res.turn.reply, en: res.turn.replyEn, coachHint: res.turn.coachHint }]);
    setStage("active");
    speak(res.turn.reply);
  };

  const sendReply = async (textToSend: string): Promise<void> => {
    const cleaned = textToSend.trim();
    if (!cleaned || busy) return;
    const nextTurns: TurnEntry[] = [...turns, { role: "user", text: cleaned }];
    setTurns(nextTurns);
    setDraft("");

    const history: RoleplayHistoryItem[] = nextTurns.map((t) => ({ role: t.role, text: t.text }));
    if (nextTurns.filter((t) => t.role === "user").length >= MAX_ROLEPLAY_TURNS) {
      const debriefRes = await callRoleplay("debrief", history);
      if (debriefRes?.debrief) {
        setDebrief(debriefRes.debrief);
        setStage("debrief");
      }
      return;
    }

    const res = await callRoleplay("reply", history);
    if (!res?.turn) return;
    setShouldWrap(res.turn.shouldWrap);
    setTurns([
      ...nextTurns,
      { role: "assistant", text: res.turn.reply, en: res.turn.replyEn, coachHint: res.turn.coachHint },
    ]);
    speak(res.turn.reply);
  };

  const finishForDebrief = async (): Promise<void> => {
    const history: RoleplayHistoryItem[] = turns.map((t) => ({ role: t.role, text: t.text }));
    const res = await callRoleplay("debrief", history);
    if (!res?.debrief) return;
    setDebrief(res.debrief);
    setStage("debrief");
  };

  const toggleMic = async (): Promise<void> => {
    if (listening) {
      listenHandle.current?.stop();
      setListening(false);
      return;
    }
    setListening(true);
    const handle = listenOnce();
    listenHandle.current = handle;
    const outcome = await handle.result;
    listenHandle.current = null;
    setListening(false);
    if (outcome.kind === "heard" && outcome.transcript.trim()) {
      setDraft((prev) => (prev ? `${prev} ${outcome.transcript}` : outcome.transcript));
    } else if (outcome.kind === "denied") {
      toast.error("Microphone blocked — type your reply below instead.");
    } else {
      toast.message("Nothing heard — try once more or type below.");
    }
  };

  const insertAccent = (char: string): void => {
    const { next, caret } = insertAtCaret(inputRef.current, draft, char, 300);
    setDraft(next);
    requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.setSelectionRange(caret, caret);
    });
  };

  const saveCard = async (
    french: string,
    english: string,
    notes: string,
    source: "error" | "custom"
  ): Promise<void> => {
    setSavedPhrases((prev) => ({ ...prev, [french]: true }));
    try {
      const response = await fetch(`${pack.api}/words`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "save", french, english, notes, track, register, source }),
      });
      if (!response.ok) throw new Error(`Save failed ${response.status}`);
      toast.success(`Saved “${french}” to Flashcards.`);
    } catch (caught) {
      console.error("[learn] debrief save failed", caught);
      setSavedPhrases((prev) => ({ ...prev, [french]: false }));
      toast.error("Couldn't save that card right now.");
    }
  };

  return (
    <div className="fr-sheet">
      <header className="fr-head flex min-h-12 items-center justify-between gap-2 pb-1">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            aria-label="Back"
            className="grid size-11 place-items-center rounded-full text-(--fr-soft) hover:text-(--fr-ink)"
          >
            <ArrowLeft className="size-5" aria-hidden="true" />
          </button>
          <p className="fr-hand text-[19px] leading-8">Live Simulation</p>
        </div>
        <span className="fr-ui text-xs text-(--fr-soft)">
          {trackDef.label} · {registerBadgeText(pack.id, register)}
        </span>
      </header>

      <main className="fr-enter flex flex-1 flex-col pt-6">
        {stage === "setup" ? (
          <div className="flex flex-1 flex-col">
            <h1 className="fr-print text-[30px] font-semibold leading-9 text-(--fr-ink)">
              Step into the room
            </h1>
            <p className="fr-ui mt-2 text-[15px] leading-6 text-(--fr-soft)">
              A focused {MAX_ROLEPLAY_TURNS}-turn exchange by voice or text, ending with a Red Pen debrief whose fixes save directly into your Flashcards.
            </p>

            <div className="mt-6">
              <p className="fr-ui text-xs font-bold uppercase tracking-wider text-(--fr-soft)">Pick scenario</p>
              <div className="mt-2 grid gap-2">
                {focusMissions.map((m) => {
                  const selected = m.slug === activeMission.slug && !customSituation.trim();
                  return (
                    <button
                      key={m.slug}
                      type="button"
                      onClick={() => {
                        setMissionSlug(m.slug);
                        setCustomSituation("");
                      }}
                      className={`fr-outline fr-ui justify-between px-4 py-2.5 text-left text-sm ${
                        selected ? "border-(--fr-mark) text-(--fr-ink)" : "text-(--fr-soft)"
                      }`}
                    >
                      <span>
                        <strong className="text-(--fr-ink)">{m.title}</strong> · {m.medium}
                      </span>
                      <span className="shrink-0 text-xs">{registerBadgeText(pack.id, m.register)}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-5">
              <label htmlFor="rp-custom" className="fr-ui block text-xs font-bold uppercase tracking-wider text-(--fr-soft)">
                Or bring a real room you have this week
              </label>
              <input
                id="rp-custom"
                type="text"
                value={customSituation}
                maxLength={120}
                onChange={(e) => setCustomSituation(e.target.value)}
                placeholder="Optional: e.g. Defending my PR to a French tech lead tomorrow"
                className="fr-ui mt-1 w-full border-b border-(--fr-rule) bg-transparent py-2 text-sm text-(--fr-ink) focus:border-(--fr-key) focus:outline-none"
              />
            </div>

            <div className="mt-auto pt-8">
              <ActionButton onClick={() => void startRoleplay()} disabled={busy} meta="4–6 turns →">
                {busy ? "Entering the room…" : "Start live simulation"}
              </ActionButton>
            </div>
          </div>
        ) : stage === "active" ? (
          <div className="flex flex-1 flex-col">
            <div className="mb-4 flex items-center justify-between gap-2 border-b border-(--fr-rule) pb-2">
              <p className="fr-ui text-xs text-(--fr-soft)">
                {customSituation.trim() || `${activeMission.title} · ${activeMission.medium}`} · Turn {Math.min(MAX_ROLEPLAY_TURNS, userTurnCount + 1)}/{MAX_ROLEPLAY_TURNS}
              </p>
              <QuietButton onClick={() => setShowTranslations((v) => !v)} className="text-xs">
                {showTranslations ? "Hide English" : "Show English"}
              </QuietButton>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto pb-4">
              {turns.map((turn, idx) => (
                <div key={idx} className={turn.role === "assistant" ? "fr-row" : "ml-6 border-l-2 border-(--fr-key) pl-3"}>
                  <div className="flex items-start justify-between gap-2">
                    <p lang={pack.id} className="fr-print text-[20px] leading-7 text-(--fr-ink)">
                      {turn.text}
                    </p>
                    {turn.role === "assistant" ? (
                      <SpeakerButton text={turn.text} label="Hear line again" />
                    ) : null}
                  </div>
                  {showTranslations && turn.en ? (
                    <p className="fr-hand mt-1 text-[17px] leading-6 text-(--fr-soft)">{turn.en}</p>
                  ) : null}
                </div>
              ))}
              {busy ? (
                <p className="fr-ui flex items-center gap-2 text-sm text-(--fr-soft)">
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Listening…
                </p>
              ) : null}
            </div>

            {latestHint ? (
              <p className="fr-ui mb-2 text-xs leading-5 text-(--fr-soft)">
                <Sparkles className="mr-1 inline size-3.5 text-(--fr-key)" aria-hidden="true" /> Idea: {latestHint}
              </p>
            ) : null}

            <form
              onSubmit={(e: FormEvent) => {
                e.preventDefault();
                void sendReply(draft);
              }}
              className="mt-2 space-y-2 border-t border-(--fr-rule) pt-3"
            >
              <div className="flex items-center gap-2">
                {micReady ? (
                  <OutlineButton
                    onClick={() => void toggleMic()}
                    disabled={busy}
                    aria-label={listening ? "Stop voice input" : "Speak reply"}
                    className={`min-h-11 px-3 ${listening ? "border-(--fr-mark) text-(--fr-mark)" : ""}`}
                  >
                    {listening ? <Square className="size-4" aria-hidden="true" /> : <Mic className="size-4" aria-hidden="true" />}
                  </OutlineButton>
                ) : null}
                <input
                  ref={inputRef}
                  type="text"
                  {...NO_WRITING_TOOLS}
                  value={draft}
                  maxLength={300}
                  disabled={busy}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder={`Reply in ${pack.name} (${registerBadgeText(pack.id, register)})…`}
                  className="fr-field min-h-11 flex-1 text-base"
                />
                <OutlineButton type="submit" disabled={busy || !draft.trim()} aria-label="Send reply" className="min-h-11 px-3">
                  <Send className="size-4" aria-hidden="true" />
                </OutlineButton>
              </div>
              <AccentKeys onInsert={insertAccent} disabled={busy} />
              {userTurnCount >= 1 ? (
                <div className="pt-1">
                  <QuietButton onClick={() => void finishForDebrief()} disabled={busy} className="text-xs text-(--fr-ink)">
                    {shouldWrap ? "Scene complete — get Red Pen debrief →" : "End early & get Red Pen debrief →"}
                  </QuietButton>
                </div>
              ) : null}
            </form>
          </div>
        ) : (
          <div className="flex flex-1 flex-col">
            <p className="fr-mark text-[28px] leading-9">Red Pen Debrief</p>
            {debrief ? (
              <div className="mt-3 space-y-6">
                <p className="fr-ui text-[15px] leading-7 text-(--fr-ink)">{debrief.overallNote}</p>
                <p className={`fr-ui border-l-2 pl-3 text-sm leading-6 ${debrief.registerOk ? "border-(--fr-key) text-(--fr-ink)" : "border-(--fr-mark) text-(--fr-mark)"}`}>
                  <strong>Register check:</strong> {debrief.registerVerdict}
                </p>

                {debrief.corrections.length > 0 ? (
                  <div>
                    <h2 className="fr-print text-xl font-semibold text-(--fr-ink)">Fixes to keep</h2>
                    <ul className="mt-2 space-y-3">
                      {debrief.corrections.map((c, idx) => (
                        <li key={idx} className="border-b border-(--fr-rule) pb-3 last:border-b-0">
                          <p lang={pack.id} className="fr-ui text-sm line-through text-(--fr-soft)">{c.original}</p>
                          <div className="mt-0.5 flex flex-wrap items-center justify-between gap-2">
                            <button
                              type="button"
                              onClick={() => speak(c.corrected)}
                              lang={pack.id}
                              className="fr-word inline-flex items-center gap-1.5 text-left text-lg"
                            >
                              {c.corrected} <Volume2 className="size-3.5 text-(--fr-key)" aria-hidden="true" />
                            </button>
                            <QuietButton
                              disabled={savedPhrases[c.corrected]}
                              onClick={() => void saveCard(c.corrected, c.translation, c.explanation, "error")}
                              className="text-xs"
                            >
                              {savedPhrases[c.corrected] ? <Check className="size-3.5" /> : <BookmarkPlus className="size-3.5" />}
                              {savedPhrases[c.corrected] ? "Saved" : "Save card"}
                            </QuietButton>
                          </div>
                          <p className="fr-ui text-xs text-(--fr-soft)">“{c.translation}” · {c.explanation}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {debrief.upgrades.length > 0 ? (
                  <div>
                    <h2 className="fr-print text-xl font-semibold text-(--fr-ink)">Sound even more native</h2>
                    <ul className="mt-2 space-y-3">
                      {debrief.upgrades.map((u, idx) => (
                        <li key={idx} className="border-b border-(--fr-rule) pb-3 last:border-b-0">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <button
                              type="button"
                              onClick={() => speak(u.phrase)}
                              lang={pack.id}
                              className="fr-word inline-flex items-center gap-1.5 text-left text-lg"
                            >
                              {u.phrase} <Volume2 className="size-3.5 text-(--fr-key)" aria-hidden="true" />
                            </button>
                            <QuietButton
                              disabled={savedPhrases[u.phrase]}
                              onClick={() => void saveCard(u.phrase, u.meaning, u.why, "custom")}
                              className="text-xs"
                            >
                              {savedPhrases[u.phrase] ? <Check className="size-3.5" /> : <BookmarkPlus className="size-3.5" />}
                              {savedPhrases[u.phrase] ? "Saved" : "Save card"}
                            </QuietButton>
                          </div>
                          <p className="fr-ui text-xs text-(--fr-soft)">{u.meaning} — {u.why}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className="mt-auto flex flex-wrap gap-3 pt-8">
              <OutlineButton
                onClick={() => {
                  setDebrief(null);
                  setTurns([]);
                  setStage("setup");
                }}
                className="flex-1"
              >
                Try another scenario
              </OutlineButton>
              <ActionButton compact onClick={onClose} className="flex-1" meta="→">
                Back home
              </ActionButton>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
