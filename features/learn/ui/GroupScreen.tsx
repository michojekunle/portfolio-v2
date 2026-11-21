"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent, type ReactElement } from "react";
import { ArrowLeft, Check, Copy, Loader2, Mic, Square, Users } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { MAX_GROUP_SIZE } from "../domain/groups";
import type { GroupDto } from "../server/groups";
import { useLang } from "./lang-context";
import { ActionButton, OutlineButton, QuietButton, SpeakerButton } from "./primitives";

const MAX_RECORDING_MS = 60_000;

function browserTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/** The best recording format this browser supports, with the file extension the storage policy expects. */
function recorderFormat(): { readonly mimeType: string; readonly ext: string } | null {
  if (typeof MediaRecorder === "undefined") return null;
  const options = [
    { mimeType: "audio/webm;codecs=opus", ext: "webm" },
    { mimeType: "audio/webm", ext: "webm" },
    { mimeType: "audio/mp4", ext: "m4a" },
    { mimeType: "audio/ogg;codecs=opus", ext: "ogg" },
  ];
  return options.find((o) => MediaRecorder.isTypeSupported(o.mimeType)) ?? null;
}

interface Props {
  readonly onClose: () => void;
  /** Code from an invite link (?join=), prefilled into the join form. */
  readonly inviteCode: string | null;
}

/**
 * A group of up to five friends: who's done today's page, the group streak,
 * and everyone's spoken answer to the same daily question.
 */
export function GroupScreen({ onClose, inviteCode }: Props): ReactElement {
  const { pack } = useLang();
  const [group, setGroup] = useState<GroupDto | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<"join" | "create">(inviteCode ? "join" : "create");
  const [code, setCode] = useState(inviteCode ?? "");
  const [name, setName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [recording, setRecording] = useState<{ readonly startedAt: number } | null>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const stopTimer = useRef<number | null>(null);

  const load = useCallback(async (): Promise<void> => {
    setError(null);
    try {
      const response = await fetch(`${pack.api}/group?tz=${encodeURIComponent(browserTimeZone())}`, { cache: "no-store" });
      if (!response.ok) throw new Error(`Group request failed with ${response.status}`);
      setGroup(((await response.json()) as { group: GroupDto | null }).group);
    } catch (caught) {
      console.error("[learn] could not load group", caught);
      setError("Your group didn't load. Check your connection and try again.");
    }
  }, [pack.api]);

  useEffect(() => {
    void load();
    return () => {
      if (stopTimer.current) window.clearTimeout(stopTimer.current);
      recorder.current?.stream.getTracks().forEach((track) => track.stop());
    };
  }, [load]);

  const send = async (body: Record<string, unknown>): Promise<boolean> => {
    setBusy(true);
    try {
      const response = await fetch(`${pack.api}/group`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = (await response.json()) as { group?: GroupDto | null; error?: string };
      if (!response.ok) throw new Error(data.error ?? "That didn't work. Try again.");
      setGroup(data.group ?? null);
      return true;
    } catch (caught) {
      console.error("[learn] group action failed", caught);
      toast.error(caught instanceof Error ? caught.message : "That didn't work. Try again.");
      return false;
    } finally {
      setBusy(false);
    }
  };

  const submit = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    const ok =
      mode === "create"
        ? await send({ action: "create", name, displayName, timezone: browserTimeZone() })
        : await send({ action: "join", code, displayName });
    if (ok) toast.success(mode === "create" ? "Group created. Now invite your friends." : "You're in. Say hello with today's voice note.");
  };

  const inviteLink = group ? `${window.location.origin}${pack.route}?join=${group.inviteCode}` : "";

  const shareInvite = async (): Promise<void> => {
    if (!group) return;
    const text = `Join my ${pack.name} group "${group.name}": ten minutes a day, together. ${inviteLink}`;
    try {
      if (navigator.share) await navigator.share({ title: pack.appName, text, url: inviteLink });
      else {
        await navigator.clipboard.writeText(text);
        toast.success("Invite copied — paste it to your friends.");
      }
    } catch (caught) {
      // Cancelling the share sheet is not an error worth surfacing.
      if (!(caught instanceof DOMException && caught.name === "AbortError")) {
        console.warn("[learn] could not share invite", caught);
        toast.error("Couldn't share. Copy the link instead.");
      }
    }
  };

  const startRecording = async (): Promise<void> => {
    const format = recorderFormat();
    if (!format || !navigator.mediaDevices?.getUserMedia) {
      toast.error("This browser can't record audio. Try Chrome or Safari.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const chunks: Blob[] = [];
      const media = new MediaRecorder(stream, { mimeType: format.mimeType });
      const startedAt = Date.now();
      media.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.push(event.data);
      };
      media.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        setRecording(null);
        void upload(new Blob(chunks, { type: format.mimeType.split(";")[0] }), format.ext, Date.now() - startedAt);
      };
      recorder.current = media;
      media.start();
      setRecording({ startedAt });
      stopTimer.current = window.setTimeout(() => media.state === "recording" && media.stop(), MAX_RECORDING_MS);
    } catch (caught) {
      console.error("[learn] could not start recording", caught);
      toast.error("Microphone access is blocked. Allow it in your browser settings.");
    }
  };

  const stopRecording = (): void => {
    if (stopTimer.current) window.clearTimeout(stopTimer.current);
    if (recorder.current?.state === "recording") recorder.current.stop();
  };

  const upload = async (blob: Blob, ext: string, durationMs: number): Promise<void> => {
    if (!group) return;
    if (durationMs < 800) {
      toast.message("That was very short — hold on a little longer.");
      return;
    }
    setBusy(true);
    try {
      const supabase = createClient();
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Sign in again to post.");
      const path = `${group.id}/${group.today}/${auth.user.id}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("learn-voice").upload(path, blob, { upsert: true, contentType: blob.type });
      if (uploadError) throw uploadError;
      const ok = await send({ action: "post", path, durationMs: Math.min(durationMs, 65_000), timezone: browserTimeZone() });
      if (ok) toast.success("Posted to your group.");
    } catch (caught) {
      console.error("[learn] voice note upload failed", caught);
      toast.error("The voice note didn't upload. Try again.");
    } finally {
      setBusy(false);
    }
  };

  const header = (
    <header className="fr-head flex min-h-12 items-center gap-2 pb-1">
      <button type="button" onClick={onClose} aria-label="Back" className="grid size-11 place-items-center rounded-full text-(--fr-soft) hover:text-(--fr-ink)">
        <ArrowLeft className="size-5" aria-hidden="true" />
      </button>
      <p className="fr-hand text-[19px] leading-8">{group?.name ?? "Your group"}</p>
    </header>
  );

  if (group === undefined) {
    return (
      <div className="fr-sheet">
        {header}
        <main className="flex flex-1 items-center justify-center" role="status">
          {error ? (
            <div className="text-center">
              <p role="alert" className="fr-ui text-[15px] text-(--fr-mark)">{error}</p>
              <QuietButton onClick={() => void load()}>Try again</QuietButton>
            </div>
          ) : (
            <Loader2 className="size-6 animate-spin text-(--fr-key)" aria-label="Loading your group" />
          )}
        </main>
      </div>
    );
  }

  if (group === null) {
    return (
      <div className="fr-sheet">
        {header}
        <main className="flex flex-1 flex-col pt-6">
          <h1 className="fr-print text-[32px] font-semibold leading-10 text-(--fr-ink)">Learn with up to {MAX_GROUP_SIZE - 1} friends.</h1>
          <p className="fr-ui mt-2 text-[15px] leading-6 text-(--fr-soft)">
            See who&apos;s done today&apos;s page, keep a streak together, and answer the same question out loud each day. Friends see only that you finished — never your words or mistakes.
          </p>
          <div className="-ml-2 mt-6 flex gap-2">
            <QuietButton onClick={() => setMode("create")} aria-pressed={mode === "create"} className={mode === "create" ? "text-(--fr-ink)" : ""}>
              Start a group
            </QuietButton>
            <QuietButton onClick={() => setMode("join")} aria-pressed={mode === "join"} className={mode === "join" ? "text-(--fr-ink)" : ""}>
              I have an invite
            </QuietButton>
          </div>
          <form onSubmit={(event) => void submit(event)} className="mt-4 space-y-3">
            {mode === "create" ? (
              <label className="fr-ui block text-sm font-bold text-(--fr-ink)">
                Group name
                <input required maxLength={40} value={name} onChange={(e) => setName(e.target.value)} placeholder="Les matinaux" className="fr-field mt-1 min-h-12 text-base font-normal" />
              </label>
            ) : (
              <label className="fr-ui block text-sm font-bold text-(--fr-ink)">
                Invite code
                <input required value={code} onChange={(e) => setCode(e.target.value)} placeholder="ABCD2345" autoCapitalize="characters" className="fr-field mt-1 min-h-12 text-base font-normal tracking-widest" />
              </label>
            )}
            <label className="fr-ui block text-sm font-bold text-(--fr-ink)">
              Your name in the group
              <input required maxLength={30} value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Mo" className="fr-field mt-1 min-h-12 text-base font-normal" />
            </label>
            <ActionButton type="submit" disabled={busy} meta="→" compact>
              {mode === "create" ? "Create the group" : "Join the group"}
            </ActionButton>
          </form>
        </main>
      </div>
    );
  }

  const done = group.members.filter((m) => m.doneToday).length;
  const myPost = group.posts.find((p) => group.members.find((m) => m.isYou)?.userId === p.userId);

  return (
    <div className="fr-sheet">
      {header}
      <main className="flex flex-1 flex-col pt-6">
        <p className="fr-mark text-[22px] leading-8">
          {group.streak > 0 ? `${group.streak} day${group.streak === 1 ? "" : "s"} together` : "Day one together"}
        </p>
        <h1 className="fr-print text-[30px] font-semibold leading-10 text-(--fr-ink)">
          {done} of {group.members.length} done today
        </h1>

        <ul className="mt-4">
          {group.members.map((m) => (
            <li key={m.userId} className="flex items-center gap-3 border-b border-(--fr-rule) py-2 last:border-b-0">
              <span className={`grid size-7 place-items-center rounded-full ${m.doneToday ? "bg-(--fr-key) text-(--fr-paper)" : "border border-(--fr-rule)"}`} aria-hidden="true">
                {m.doneToday ? <Check className="size-4" strokeWidth={3} /> : null}
              </span>
              <span className="fr-ui text-[15px] text-(--fr-ink)">
                {m.displayName}
                {m.isYou ? <span className="text-(--fr-soft)"> (you)</span> : null}
              </span>
              <span className="sr-only">{m.doneToday ? "done today" : "not yet today"}</span>
            </li>
          ))}
        </ul>

        {group.members.length < MAX_GROUP_SIZE ? (
          <div className="mt-4 flex flex-wrap items-center gap-x-4">
            <OutlineButton onClick={() => void shareInvite()}>
              <Users className="size-4" aria-hidden="true" /> Invite a friend
            </OutlineButton>
            <button type="button" onClick={() => void navigator.clipboard.writeText(group.inviteCode).then(() => toast.success("Code copied."))} className="fr-quiet">
              <Copy className="size-4" aria-hidden="true" /> {group.inviteCode}
            </button>
          </div>
        ) : null}

        <section className="mt-8 border-t border-(--fr-ink) pt-4" aria-labelledby="fr-group-question">
          <p className="fr-ui text-xs font-bold text-(--fr-soft)">Today&apos;s question</p>
          <div className="flex items-start gap-1">
            <h2 id="fr-group-question" lang={pack.id} className="fr-print min-w-0 flex-1 text-[24px] leading-8 text-(--fr-ink)">
              {group.question.fr}
            </h2>
            <SpeakerButton text={group.question.fr} label="Hear the question" />
          </div>
          <p className="fr-ui text-sm leading-6 text-(--fr-soft)">{group.question.en}</p>

          <div className="mt-3">
            <ActionButton
              compact
              disabled={busy}
              onClick={() => (recording ? stopRecording() : void startRecording())}
              aria-label={recording ? "Stop and post" : myPost ? "Record again" : "Record your answer"}
            >
              <span className="inline-flex items-center gap-2">
                {recording ? <Square className="size-4" aria-hidden="true" /> : <Mic className="size-4" aria-hidden="true" />}
                {recording ? "Stop and post" : myPost ? "Record again" : "Record your answer"}
              </span>
            </ActionButton>
            <p className="fr-ui mt-1 text-xs text-(--fr-soft)">Up to a minute. Your group hears it; nobody else can.</p>
          </div>

          <ul className="mt-4 space-y-3">
            {group.posts.length === 0 ? <li className="fr-ui text-sm text-(--fr-soft)">No answers yet today. Go first?</li> : null}
            {group.posts.map((post) => (
              <li key={post.userId}>
                <p className="fr-ui text-sm font-bold text-(--fr-ink)">
                  {post.displayName} <span className="font-normal text-(--fr-soft)">· {Math.round(post.durationMs / 1000)}s</span>
                </p>
                {post.audioUrl ? <audio controls preload="none" src={post.audioUrl} className="mt-1 w-full" /> : null}
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-auto pt-10">
          <QuietButton
            onClick={() => {
              if (window.confirm(`Leave "${group.name}"? Your history stays yours.`)) void send({ action: "leave" });
            }}
            className="w-full"
          >
            Leave the group
          </QuietButton>
        </div>
      </main>
    </div>
  );
}
