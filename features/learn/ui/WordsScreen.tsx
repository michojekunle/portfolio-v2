"use client";

import { useCallback, useEffect, useMemo, useState, type ReactElement } from "react";
import { ArrowLeft, Loader2, Search, Volume2 } from "lucide-react";
import { toast } from "sonner";
import type { WordDto } from "../server/service";
import { ChoiceGroup } from "./ChoiceGroup";
import { useLang } from "./lang-context";
import { QuietButton } from "./primitives";
import { speak } from "./speech-io";
import { WordFlashcards } from "./WordFlashcards";
import { WORD_FILTERS, filterWords, type WordFilter } from "./words-deck";

const FILTER_LABEL: Record<WordFilter, string> = { all: "All", learning: "Learning", known: "Known", mistakes: "Mistakes" };

const VIEWS = ["list", "flashcards"] as const;
type ViewMode = (typeof VIEWS)[number];
const VIEW_LABEL: Record<ViewMode, string> = { list: "List", flashcards: "Flashcards" };

const STRENGTH_LABEL: Record<WordDto["strength"], string> = { new: "new", learning: "learning", known: "known" };

/**
 * Every word the learner has kept, searchable and reviewable as a list or flashcards.
 * "I know this" stops a word eating review time; "Practise again" brings one back into today's reviews.
 */
export function WordsScreen({ onClose }: { readonly onClose: () => void }): ReactElement {
  const { copy, pack } = useLang();
  const [words, setWords] = useState<readonly WordDto[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<WordFilter>("all");
  const [view, setView] = useState<ViewMode>("list");
  const [busyId, setBusyId] = useState<string | null>(null);

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

  const visible = useMemo(() => filterWords(words ?? [], query, filter), [words, query, filter]);
  const counts = useMemo(() => {
    const list = words ?? [];
    return { total: list.length, known: list.filter((w) => w.strength === "known").length };
  }, [words]);

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
          <ChoiceGroup label="Filter words" options={WORD_FILTERS} labels={FILTER_LABEL} value={filter} onChange={setFilter} />
        </div>

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
                      {word.source === "error" ? " · from a correction" : ""}
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
