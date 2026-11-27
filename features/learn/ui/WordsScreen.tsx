"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent, type ReactElement } from "react";
import { ArrowLeft, BookmarkPlus, Loader2, Plus, Search, Sparkles, Volume2 } from "lucide-react";
import { toast } from "sonner";
import { TRACKS, registerBadgeText, type TrackId } from "../domain/tracks";
import { survivalKitForTrack } from "../domain/tracks-kits";
import { normaliseWord } from "../domain/glossary";
import type { WordDto } from "../server/service";
import { ChoiceGroup } from "./ChoiceGroup";
import { useLang } from "./lang-context";
import { OutlineButton, QuietButton } from "./primitives";
import { speak } from "./speech-io";
import { WordFlashcards } from "./WordFlashcards";
import { WORD_FILTERS, filterWords, type WordFilter } from "./words-deck";

const VIEWS = ["list", "flashcards"] as const;
type ViewMode = (typeof VIEWS)[number];
const VIEW_LABEL: Record<ViewMode, string> = { list: "List", flashcards: "Flashcards" };

const STRENGTH_LABEL: Record<WordDto["strength"], string> = { new: "new", learning: "learning", known: "known" };

interface WordsScreenProps {
  readonly onClose: () => void;
  readonly activeTrack?: TrackId;
  readonly goalFocus?: string;
  readonly goalNote?: string | null;
  readonly variant?: string | null;
}

/**
 * Every word the learner has kept, searchable and reviewable as a list or flashcards.
 * Supports staggered Track Survival Kits and 1-line "I needed this today" capture.
 */
export function WordsScreen({
  onClose,
  activeTrack = "general",
  goalFocus,
  goalNote,
  variant,
}: WordsScreenProps): ReactElement {
  const { copy, pack } = useLang();
  const [words, setWords] = useState<readonly WordDto[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<WordFilter>("all");
  const [view, setView] = useState<ViewMode>("list");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [seedingKit, setSeedingKit] = useState(false);
  const [customEnglish, setCustomEnglish] = useState("");
  const [addingCustom, setAddingCustom] = useState(false);

  const load = useCallback(async (): Promise<void> => {
    setError(null);
    try {
      const response = await fetch(`${pack.api}/words`, { cache: "no-store" });
      if (!response.ok) throw new Error(`Words request failed with ${response.status}`);
      const data = (await response.json()) as { words: WordDto[] };
      setWords(data.words);
    } catch (caught) {
      console.error("[learn] could not load words", caught);
      setError("Your words didn't load. Check your connection and try again.");
    }
  }, [pack.api]);

  useEffect(() => {
    void load();
  }, [load]);

  const act = async (word: WordDto, action: "known" | "again"): Promise<void> => {
    setBusyId(word.id);
    try {
      const response = await fetch(`${pack.api}/words`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId: word.id, action }),
      });
      if (!response.ok) throw new Error(`Word update failed with ${response.status}`);
      const { word: updated } = (await response.json()) as { word: WordDto };
      setWords((current) => current?.map((w) => (w.id === updated.id ? updated : w)) ?? null);
      toast.success(action === "known" ? `“${word.text}” won't come up for months.` : `“${word.text}” is back in today's reviews.`);
    } catch (caught) {
      console.error("[learn] could not update word", caught);
      toast.error("That didn't save. Try again.");
    } finally {
      setBusyId(null);
    }
  };

  const visible = useMemo(() => filterWords(words ?? [], query, filter, activeTrack), [words, query, filter, activeTrack]);
  const counts = useMemo(() => {
    const list = words ?? [];
    return { total: list.length, known: list.filter((w) => w.strength === "known").length };
  }, [words]);

  const filterLabels: Record<WordFilter, string> = {
    all: "All",
    focus: TRACKS[activeTrack].label,
    learning: "Learning",
    known: "Known",
    mistakes: "Mistakes",
  };
  const availableFilters: readonly WordFilter[] =
    activeTrack === "general" ? WORD_FILTERS.filter((f) => f !== "focus") : WORD_FILTERS;

  const missingKitCount = useMemo(() => {
    if (!words || activeTrack === "general") return 0;
    const kit = survivalKitForTrack(pack.id, activeTrack, variant);
    const owned = new Set(words.map((w) => normaliseWord(w.text)));
    return kit.filter((phrase) => !owned.has(normaliseWord(phrase.fr))).length;
  }, [words, activeTrack, pack.id, variant]);

  const loadStarterKit = async (): Promise<void> => {
    setSeedingKit(true);
    try {
      const response = await fetch(`${pack.api}/words`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "starter", track: activeTrack }),
      });
      if (!response.ok) throw new Error(`Starter kit failed with ${response.status}`);
      const data = (await response.json()) as { added: number };
      await load();
      setFilter("focus");
      setView("flashcards");
      toast.success(
        data.added > 0
          ? `Added ${data.added} ${TRACKS[activeTrack].label} phrases (staggered over 3 days).`
          : `All ${TRACKS[activeTrack].label} starter phrases are already in your deck.`
      );
    } catch (caught) {
      console.error("[learn] could not seed starter kit", caught);
      toast.error("Couldn't add starter phrases right now.");
    } finally {
      setSeedingKit(false);
    }
  };

  const addCustom = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    const trimmed = customEnglish.trim();
    if (trimmed.length < 2) return;
    setAddingCustom(true);
    try {
      const response = await fetch(`${pack.api}/words`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "custom",
          english: trimmed,
          track: activeTrack,
          ...(goalFocus ? { goalFocus } : {}),
          ...(goalNote ? { goalNote } : {}),
        }),
      });
      if (!response.ok) throw new Error(`Custom phrase failed with ${response.status}`);
      const data = (await response.json()) as { available?: boolean; word?: WordDto | null; created?: boolean };
      if (!data.available || !data.word) {
        toast.error("Phrase builder is temporarily offline. Try again in a moment.");
        return;
      }
      setCustomEnglish("");
      setWords((current) => {
        if (!current) return [data.word!];
        return current.some((w) => w.id === data.word!.id) ? current : [data.word!, ...current];
      });
      speak(data.word.text);
      toast.success(data.created ? `Saved “${data.word.text}” to your deck.` : `Already in your deck: “${data.word.text}”.`);
    } catch (caught) {
      console.error("[learn] could not add custom phrase", caught);
      toast.error("Couldn't translate and save that line. Try again.");
    } finally {
      setAddingCustom(false);
    }
  };

  return (
    <div className="fr-sheet">
      <header className="fr-head flex min-h-12 items-center gap-2 pb-1">
        <button type="button" onClick={onClose} aria-label="Back" className="grid size-11 place-items-center rounded-full text-(--fr-soft) hover:text-(--fr-ink)">
          <ArrowLeft className="size-5" aria-hidden="true" />
        </button>
        <p className="fr-hand text-[19px] leading-8">{copy.myWords}</p>
      </header>

      <main className="flex flex-1 flex-col pt-6">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
          <div>
            <h1 lang={pack.id} className="fr-print text-[34px] font-semibold leading-10 text-(--fr-ink)">
              {copy.myWords}
            </h1>
            {words ? (
              <p className="fr-ui mt-1 text-[15px] leading-6 text-(--fr-soft)">
                {counts.total} word{counts.total === 1 ? "" : "s"} kept · {counts.known} known for good
              </p>
            ) : null}
          </div>
          {words && words.length > 0 ? (
            <div className="-ml-2 sm:ml-0 sm:-mr-2">
              <ChoiceGroup label="Display mode" options={VIEWS} labels={VIEW_LABEL} value={view} onChange={setView} />
            </div>
          ) : null}
        </div>

        <label className="fr-ui relative mt-6 block">
          <span className="sr-only">Search your words</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-(--fr-soft)" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={`Search in ${pack.name} or English`}
            className="fr-field min-h-12 pl-9 text-base"
          />
        </label>
        <div className="-ml-2 mt-2">
          <ChoiceGroup label="Filter words" options={availableFilters} labels={filterLabels} value={filter} onChange={setFilter} />
        </div>

        {missingKitCount > 0 ? (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-y border-(--fr-rule) py-3">
            <div className="min-w-0">
              <p className="fr-ui text-sm font-semibold text-(--fr-ink)">
                {TRACKS[activeTrack].label} Survival Kit · {missingKitCount} high-leverage phrases
              </p>
              <p className="fr-ui text-xs text-(--fr-soft)">
                Staggered over Days 1–3 into Flashcards so reviews stay light.
              </p>
            </div>
            <OutlineButton onClick={() => void loadStarterKit()} disabled={seedingKit} className="shrink-0 text-xs">
              {seedingKit ? <Loader2 className="size-3.5 animate-spin" aria-hidden="true" /> : <BookmarkPlus className="size-3.5" aria-hidden="true" />}
              Load starter kit
            </OutlineButton>
          </div>
        ) : null}

        <form onSubmit={(e) => void addCustom(e)} className="mt-4 flex items-center gap-2 border-b border-(--fr-rule) pb-3">
          <label htmlFor="fr-custom-line" className="sr-only">
            Add a real-life English phrase you needed today
          </label>
          <input
            id="fr-custom-line"
            type="text"
            value={customEnglish}
            maxLength={180}
            disabled={addingCustom}
            onChange={(event) => setCustomEnglish(event.target.value)}
            placeholder={`Add a line you needed today (English → ${TRACKS[activeTrack].label} ${pack.name})`}
            className="fr-ui min-w-0 flex-1 bg-transparent py-2 text-sm text-(--fr-ink) placeholder:text-(--fr-soft)/80 focus:outline-none"
          />
          <QuietButton type="submit" disabled={addingCustom || customEnglish.trim().length < 2} className="shrink-0 text-xs text-(--fr-key)">
            {addingCustom ? <Loader2 className="size-3.5 animate-spin" aria-hidden="true" /> : <Sparkles className="size-3.5" aria-hidden="true" />}
            Save phrase
          </QuietButton>
        </form>

        <div className="mt-4" aria-live="polite">
          {error ? (
            <div>
              <p role="alert" className="fr-ui text-[15px] leading-6 text-(--fr-mark)">
                {error}
              </p>
              <QuietButton onClick={() => void load()}>{copy.retry}</QuietButton>
            </div>
          ) : null}
          {!words && !error ? (
            <p className="fr-ui flex items-center gap-2 text-sm text-(--fr-soft)">
              <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Loading your words…
            </p>
          ) : null}
          {words && words.length === 0 ? (
            <p className="fr-ui text-[15px] leading-6 text-(--fr-soft)">No words yet. Finish today&apos;s page and the ones you keep will appear here.</p>
          ) : null}
          {words && words.length > 0 && visible.length === 0 ? (
            <p className="fr-ui text-[15px] leading-6 text-(--fr-soft)">Nothing matches that.</p>
          ) : null}
        </div>

        {visible.length > 0 ? (
          view === "flashcards" ? (
            <WordFlashcards words={visible} resetKey={`${filter}:${query.trim()}`} busyId={busyId} onAction={act} />
          ) : (
            <ul>
              {visible.map((word) => (
                <li key={word.id} className="flex items-start gap-3 border-b border-(--fr-rule) py-3 last:border-b-0">
                  <div className="min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => speak(word.text)}
                      lang={pack.id}
                      className="fr-word inline-flex flex-wrap items-baseline gap-x-1.5 text-left text-[20px] leading-7 [overflow-wrap:anywhere]"
                    >
                      <span>{word.text}</span>
                      <Volume2 className="inline size-3.5 shrink-0 self-center text-(--fr-key) opacity-70" aria-hidden="true" />
                      <span className="sr-only"> — hear pronunciation</span>
                    </button>
                    <p className="fr-ui text-[15px] leading-6 text-(--fr-ink)">{word.english}</p>
                    {word.notes ? <p className="fr-ui text-xs leading-5 text-(--fr-soft) [overflow-wrap:anywhere]">{word.notes}</p> : null}
                    <p className="fr-ui mt-0.5 text-xs text-(--fr-soft)">
                      {STRENGTH_LABEL[word.strength]}
                      {word.source === "error"
                        ? " · from a correction"
                        : word.source === "custom"
                          ? " · your line"
                          : word.source === "starter"
                            ? " · survival kit"
                            : ""}
                      {word.track && word.track !== "general" ? ` · ${TRACKS[word.track].label}` : ""}
                      {word.register ? ` · ${registerBadgeText(pack.id, word.register)}` : ""}
                    </p>
                  </div>
                  <QuietButton
                    onClick={() => void act(word, word.strength === "known" ? "again" : "known")}
                    disabled={busyId === word.id}
                    className="shrink-0 text-xs"
                  >
                    {word.strength === "known" ? "Practise again" : "I know this"}
                  </QuietButton>
                </li>
              ))}
            </ul>
          )
        ) : null}
      </main>
    </div>
  );
}
