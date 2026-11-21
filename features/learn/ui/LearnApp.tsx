"use client";

import "./learn.css";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactElement,
} from "react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { Level } from "../domain/lessons";
import type { Commitment } from "../domain/commitment";
import { practiceStage, type Stage } from "../domain/progression";
import type { CompletePayload, SessionPayload } from "../server/service";
import { AuthPanel } from "./AuthPanel";
import { DoneScreen } from "./DoneScreen";
import { HomeScreen } from "./HomeScreen";
import { ActionButton } from "./primitives";
import { SessionRunner } from "./SessionRunner";
import type { LanguageId, LanguagePack } from "../domain/language";
import { LANGUAGES } from "../domain/languages";
import { COPY } from "./copy";
import { LangProvider } from "./lang-context";
import { setSpeechLanguage } from "./speech-io";
import { usePageStyle, type PageStyle } from "./style-preference";
import { useInstall } from "./use-install";

type Phase = "home" | "session" | "done";

/** Paper colour per language, style and mode — the browser chrome / status bar matches the page (mirrors learn.css). */
const PAPER: Record<
  LanguagePack["id"],
  Record<PageStyle, { readonly light: string; readonly dark: string }>
> = {
  fr: {
    notebook: { light: "#fbfaf7", dark: "#16131f" },
    dictionary: { light: "#f6f3ec", dark: "#14110d" },
  },
  es: {
    notebook: { light: "#fdfdfb", dark: "#0f1624" },
    dictionary: { light: "#f7f4ee", dark: "#14110d" },
  },
};

function browserTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

interface Props {
  /** next/font CSS variable classes, created server-side. */
  readonly fontClassName: string;
  /** Just the id crosses the server→client boundary; the pack (with its RegExps) is resolved here. */
  readonly lang: LanguageId;
}

/** The whole daily-page app for one language. French and Spanish are this component with a different pack. */
export function LearnApp({ fontClassName, lang }: Props): ReactElement {
  const pack = LANGUAGES[lang];
  const copy = COPY[pack.id];
  // Set during render (idempotent): child screens speak in their own mount effects, which run before a parent effect would.
  setSpeechLanguage(pack.speechLocale, pack.voiceHints);
  const [style, setStyle] = usePageStyle(pack.id);
  const [payload, setPayload] = useState<SessionPayload | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("home");
  const [result, setResult] = useState<CompletePayload | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [pickingLevel, setPickingLevel] = useState(false);
  const install = useInstall(pack.route);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (resolvedTheme !== "light" && resolvedTheme !== "dark") return;
    const color = PAPER[pack.id][style][resolvedTheme];
    // Override both media-scoped tags: the user's chosen mode may differ from the OS one.
    document
      .querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')
      .forEach((meta) => {
        meta.content = color;
      });
  }, [pack.id, style, resolvedTheme]);

  // Once a page is on screen, a failed refresh shouldn't replace it with an error screen.
  const hasPayload = useRef(false);

  const load = useCallback(async (): Promise<void> => {
    setLoadError(null);
    try {
      const response = await fetch(
        `${pack.api}/session?tz=${encodeURIComponent(browserTimeZone())}`,
        { cache: "no-store" },
      );
      if (!response.ok)
        throw new Error(`Session request failed with ${response.status}`);
      setPayload((await response.json()) as SessionPayload);
      hasPayload.current = true;
    } catch (caught) {
      console.error("[learn] could not load session", caught);
      if (hasPayload.current)
        toast.error(
          "Couldn't refresh today's page. What you see may be out of date.",
        );
      else
        setLoadError(
          "Today's page didn't load. Check your connection and try again.",
        );
    }
  }, [pack.api]);

  useEffect(() => {
    void load();
  }, [load]);

  // The install shortcut ("Start today's page") lands on ?start=1: open the session once the page is ready.
  const startHandled = useRef(false);
  useEffect(() => {
    if (!payload || startHandled.current) return;
    startHandled.current = true;
    const url = new URL(window.location.href);
    // A failed Google sign-in comes back here (see lib/auth-redirect.ts) instead of another tool's login page.
    if (url.searchParams.get("auth_error") === "1") {
      toast.error("Sign-in didn't complete. Please try again.");
      setAuthOpen(true);
    }
    const start = url.searchParams.get("start") === "1";
    url.searchParams.delete("start");
    url.searchParams.delete("auth_error");
    window.history.replaceState(null, "", `${url.pathname}${url.search}`);
    if (start && (!payload.profile.isNew || payload.guest)) setPhase("session");
  }, [payload]);

  const signOut = async (): Promise<void> => {
    const { error } = await createClient().auth.signOut();
    if (error) {
      console.error("[learn] sign-out failed", error);
      toast.error("Sign-out didn't go through. Try again.");
      return;
    }
    setPhase("home");
    setResult(null);
    await load();
  };

  const pickLevel = async (level: Level): Promise<void> => {
    setPickingLevel(true);
    try {
      const response = await fetch(`${pack.api}/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level, timezone: browserTimeZone() }),
      });
      if (!response.ok)
        throw new Error(`Profile update failed with ${response.status}`);
      const wasNew = payload?.profile.isNew ?? true;
      await load();
      if (!wasNew)
        toast.success(`Level ${level} saved — tomorrow's scene will match it.`);
    } catch (caught) {
      console.error("[learn] could not save level", caught);
      toast.error("Your level wasn't saved. Try again.");
    } finally {
      setPickingLevel(false);
    }
  };

  const changeCommitment = async (dailyMinutes: Commitment): Promise<void> => {
    if (!payload) return;
    setPickingLevel(true);
    try {
      const response = await fetch(`${pack.api}/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          level: payload.profile.level,
          timezone: browserTimeZone(),
          dailyMinutes,
        }),
      });
      if (!response.ok)
        throw new Error(`Profile update failed with ${response.status}`);
      await load();
    } catch (caught) {
      console.error("[learn] could not save daily time", caught);
      toast.error("Your daily time wasn't saved. Try again.");
    } finally {
      setPickingLevel(false);
    }
  };

  const backHome = useCallback((): void => {
    setPhase("home");
    setResult(null);
    void load();
  }, [load]);

  const closeAuth = useCallback((): void => setAuthOpen(false), []);

  let screen: ReactElement;
  if (loadError && !payload) {
    screen = (
      <div className="fr-sheet">
        <main className="flex flex-1 flex-col justify-center">
          <p className="fr-print text-[32px] font-semibold leading-10 text-(--fr-ink)">
            {copy.pageNotFound}
          </p>
          <p
            role="alert"
            className="fr-ui mt-2 text-base leading-6 text-(--fr-soft)"
          >
            {loadError}
          </p>
          <div className="mt-8">
            <ActionButton onClick={() => void load()} meta="↻">
              {copy.retry}
            </ActionButton>
          </div>
        </main>
      </div>
    );
  } else if (!payload) {
    screen = (
      <div className="fr-sheet" role="status" aria-label="Loading today's page">
        <div className="flex flex-1 items-center justify-center">
          <p className="fr-hand animate-pulse text-[26px] leading-8">
            {copy.brand}
          </p>
        </div>
      </div>
    );
  } else if (phase === "session") {
    screen = (
      <SessionRunner
        payload={payload}
        onExit={backHome}
        onComplete={(completed) => {
          setResult(completed);
          setPhase("done");
        }}
      />
    );
  } else if (phase === "done") {
    const before = payload.streak.totalCompletions;
    const after = result && !result.alreadyCompleted ? before + 1 : before;
    const stageBefore = practiceStage(payload.profile.level, before);
    const stageAfter = practiceStage(payload.profile.level, after);
    const unlocked: Stage | null = stageAfter > stageBefore ? stageAfter : null;
    screen = (
      <DoneScreen
        result={result}
        onClose={backHome}
        onSignIn={() => setAuthOpen(true)}
        install={install}
        unlocked={unlocked}
      />
    );
  } else {
    screen = (
      <HomeScreen
        payload={payload}
        onStart={() => setPhase("session")}
        onPickLevel={(level) => void pickLevel(level)}
        onSignIn={() => setAuthOpen(true)}
        pickingLevel={pickingLevel}
        style={style}
        onStyleChange={setStyle}
        install={install}
        onSignOut={() => void signOut()}
        onCommitmentChange={(next) => void changeCommitment(next)}
      />
    );
  }

  return (
    <LangProvider pack={pack}>
      <div
        className={`fr-app ${fontClassName}`}
        data-style={style}
        data-lang={pack.id}
        lang="en"
      >
        {screen}
        {authOpen ? (
          <AuthPanel
            onClose={closeAuth}
            onSignedIn={() => {
              setAuthOpen(false);
              backHome();
            }}
          />
        ) : null}
      </div>
    </LangProvider>
  );
}
