"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Send,
  X,
  Loader2,
  CornerDownLeft,
  Check,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  AlertTriangle,
} from "lucide-react";
import { VELA_ACCENT } from "@/lib/journal/types";
import { Markdown, stripMarkdown } from "@/components/ui/Markdown";

const ACCENT = VELA_ACCENT;
const ACCENT_BG = "rgba(124,58,237,0.08)";

interface ExecutedAction {
  type: string;
  summary: string;
  ok: boolean;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  executed?: ExecutedAction[];
}

// Browser SpeechRecognition typings (not in lib.dom for all targets)
interface SpeechRecognitionAlternative { readonly transcript: string; readonly confidence: number; }
interface SpeechRecognitionResult { readonly length: number; readonly isFinal: boolean; item(i: number): SpeechRecognitionAlternative; readonly [i: number]: SpeechRecognitionAlternative; }
interface SpeechRecognitionResultList { readonly length: number; item(i: number): SpeechRecognitionResult; readonly [i: number]: SpeechRecognitionResult; }
interface SpeechRecognitionEvent extends Event { readonly results: SpeechRecognitionResultList; readonly resultIndex: number; }
interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onerror: ((e: Event) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}
interface SpeechRecognitionConstructor { new (): SpeechRecognitionInstance; }
declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

const SUGGESTIONS = [
  "Plan my day",
  "Log my day",
  "How am I doing this week?",
  "Help me set an objective",
];

interface Props {
  hasObjectives: boolean;
}

import { db } from "@/lib/journal/db";
import { createClient } from "@/lib/supabase/client";

export function AssistantWidget({ hasObjectives }: Props): React.ReactElement {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: hasObjectives
        ? "Hi! I'm your Vela Guide. Tell me your plan for today, what you got done, or what's blocking you — I'll log it and keep you honest about how much fits in one day."
        : "Hi! I'm your Vela Guide. You haven't set an objective yet — tell me one thing you'd like to make progress on this month and I'll set it up with an outline, then we can plan today around it.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const processingRef = useRef(false);
  const router = useRouter();

  // Load user and chat history on mount — pulls server history first so a
  // fresh browser (empty Dexie) still shows past conversations, then reads
  // the merged local mirror for display.
  useEffect(() => {
    const loadChats = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      try {
        const res = await fetch("/api/journal/chats?limit=100");
        if (res.ok) {
          const { messages: serverMessages } = await res.json() as {
            messages: { id: string; role: "user" | "assistant"; content: string; executed: ExecutedAction[] | null; created_at: string }[];
          };
          const existingServerIds = new Set(
            (await db.chats.where("user_id").equals(user.id).toArray())
              .map((c) => c.server_id)
              .filter(Boolean)
          );
          const toInsert = serverMessages
            .filter((m) => !existingServerIds.has(m.id))
            .map((m) => ({
              server_id: m.id,
              user_id: user.id,
              role: m.role,
              content: m.content,
              executed: m.executed,
              created_at: m.created_at,
              sync_status: "synced" as const,
            }));
          if (toInsert.length > 0) await db.chats.bulkAdd(toInsert);
        }
      } catch (err) {
        console.error("[journal/assistant] chat history pull failed (offline?):", err);
      }

      const localChats = await db.chats.where("user_id").equals(user.id).toArray();
      if (localChats.length > 0) {
        localChats.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        setMessages(localChats.map(c => ({
          role: c.role,
          content: c.content,
          executed: c.executed ?? undefined,
        })));
      }
    };
    void loadChats();
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 80);
    }
  }, [messages, open]);

  // Clean up speech synthesis + recognition when the drawer closes/unmounts
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      recognitionRef.current?.stop();
    };
  }, [open]);

  const speakText = (text: string): void => {
    if (!ttsEnabled || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(stripMarkdown(text));
    utterance.rate = 1.05;
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find((v) => v.lang.startsWith("en") && v.name.includes("Google"));
    if (preferred) utterance.voice = preferred;
    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async (text: string): Promise<void> => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: Message = { role: "user", content: trimmed };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    // Optimistic local write so the message survives a reload before we know
    // whether the round trip succeeded.
    let localUserChatId: number | undefined;
    if (userId) {
      localUserChatId = await db.chats.add({
        user_id: userId,
        role: "user",
        content: trimmed,
        executed: null,
        created_at: new Date().toISOString(),
        sync_status: "pending_push"
      });
    }

    try {
      const res = await fetch("/api/journal/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages.map((m) => ({ role: m.role, content: m.content })) }),
      });

      if (!res.ok) throw new Error("Assistant response failed");
      const data = await res.json() as { reply: string; executed: ExecutedAction[] };

      // Refresh server components so the dashboard/log reflects what was done
      if (data.executed.some((e) => e.ok)) {
        router.refresh();
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply, executed: data.executed },
      ]);

      // The /assistant route already persisted both turns to jo_chats
      // server-side with their own ids (which this response doesn't return),
      // so drop the optimistic local copy rather than leave it stranded
      // without a server_id — the next history pull will fetch the
      // server's canonical rows and dedupe correctly. Keeping a
      // server_id-less "synced" copy here would make it invisible to that
      // dedup check and double up on every reload.
      if (userId && localUserChatId !== undefined) {
        await db.chats.delete(localUserChatId);
      }

      speakText(data.reply);

    } catch (err) {
      console.error("[journal/assistant] error:", err);
      const offline = typeof navigator !== "undefined" && !navigator.onLine;
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: offline
            ? "You're offline — your message is saved and queued. Send it again once you're back online to get a reply."
            : "Sorry, I had trouble processing that. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };
  const toggleSpeechRecognition = async (): Promise<void> => {
    if (typeof window === "undefined") return;

    if (listening) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
        return;
      }
      recognitionRef.current?.stop();
      setListening(false);
      setInterimTranscript("");
      return;
    }

    // A previous recording is still being transcribed/sent — refuse to start
    // a new one until that resolves. Without this guard, tapping the mic
    // again while the first recording's upload+transcribe was still in
    // flight let a second recording start, and whichever pipeline finished
    // last would silently send its (possibly stale) transcript as a message.
    if (processingRef.current) return;

    // Prefer the browser's native SpeechRecognition — it streams a live
    // interim transcript as the user speaks. MediaRecorder + server
    // transcription is a fallback for browsers without native support (e.g.
    // Firefox); it only shows text after the full clip is uploaded, so it
    // can't be "real time" no matter how it's wired.
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SR) {
      startNativeSpeech(SR);
      return;
    }

    if (navigator.mediaDevices && window.MediaRecorder) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mr = new MediaRecorder(stream);
        // Captured by this closure only — never shared with a later
        // recording, so a new session can't corrupt or race with this one.
        const chunks: BlobPart[] = [];
        mr.ondataavailable = (e) => {
          if (e.data.size > 0) chunks.push(e.data);
        };
        mr.onstop = async () => {
          stream.getTracks().forEach((t) => t.stop());
          setListening(false);
          setInterimTranscript("Transcribing…");
          processingRef.current = true;
          try {
            const audioBlob = new Blob(chunks, { type: "audio/webm" });
            const form = new FormData();
            form.append("audio", audioBlob);
            const res = await fetch("/api/journal/speech", { method: "POST", body: form });
            if (!res.ok) throw new Error(`Speech API failed: ${res.status}`);
            const data = await res.json() as { transcript: string };
            if (data.transcript) {
              void handleSendMessage(data.transcript);
            }
          } catch (err) {
            console.error("[journal/assistant] Speech API error:", err);
            setMessages((prev) => [...prev, { role: "assistant", content: "Voice recognition failed. Please try again." }]);
          } finally {
            setInterimTranscript("");
            processingRef.current = false;
          }
        };
        mediaRecorderRef.current = mr;
        mr.start();
        setListening(true);
        return;
      } catch (err) {
        console.error("Mic error:", err);
      }
    }

    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: "Voice input isn't supported in this browser — try Chrome or Safari." },
    ]);
  };

  const startNativeSpeech = (SR: SpeechRecognitionConstructor): void => {
    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = "en-US";

    rec.onresult = (e: SpeechRecognitionEvent) => {
      let interim = "";
      let final = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const result = e.results[i];
        if (result.isFinal) final += result[0].transcript;
        else interim += result[0].transcript;
      }
      setInterimTranscript(interim);
      if (final) {
        setInterimTranscript("");
        setListening(false);
        void handleSendMessage(final.trim());
      }
    };

    rec.onerror = (e) => {
      console.error("[journal/assistant] speech error:", e);
      setListening(false);
      setInterimTranscript("");
    };

    rec.onend = () => {
      setListening(false);
      setInterimTranscript("");
    };

    recognitionRef.current = rec;
    rec.start();
    setListening(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSendMessage(input);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center border-none cursor-pointer shadow-[0_8px_32px_rgba(124,58,237,0.25)] transition-all duration-300 hover:scale-[1.08] hover:shadow-[0_12px_40px_rgba(124,58,237,0.35)]"
        style={{ background: ACCENT, color: "#fff" }}
        aria-label="Open Vela Guide"
      >
        {open ? <X size={24} /> : <Sparkles className="animate-pulse" size={24} />}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-0.5"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          <div
            className="fixed top-0 right-0 h-screen w-full max-w-105 z-50 flex flex-col shadow-2xl transition-all duration-300 animate-slide-in"
            style={{ background: "var(--bg)", borderLeft: "1px solid var(--rule)" }}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-(--rule) bg-(--bg-2)">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: ACCENT_BG }}>
                  <Sparkles size={14} style={{ color: ACCENT }} />
                </div>
                <div>
                  <div className="font-display text-[15px] font-semibold text-(--ink)">Vela Guide</div>
                  <div className="font-mono text-[8px] tracking-widest uppercase text-muted-foreground">
                    Day planner · Coach · Logger
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setTtsEnabled(!ttsEnabled)}
                  className="w-7.5 h-7.5 rounded-md flex items-center justify-center border-none bg-transparent cursor-pointer hover:bg-(--bg-3) text-muted-foreground transition-all"
                  title={ttsEnabled ? "Disable voice replies" : "Enable voice replies"}
                >
                  {ttsEnabled ? <Volume2 size={16} style={{ color: ACCENT }} /> : <VolumeX size={16} />}
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="w-7.5 h-7.5 rounded-md flex items-center justify-center border-none bg-transparent cursor-pointer hover:bg-(--bg-3) text-muted-foreground"
                  aria-label="Close Vela Guide"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto px-5 py-5 space-y-4 scrollbar-thin" data-lenis-prevent="true">
              {messages.map((m, idx) => (
                <div key={idx} className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-[14px] px-4 py-3 text-[13px] leading-[1.6] ${m.role === "user" ? "text-white" : "bg-(--bg-2) text-(--ink)"}`}
                    style={
                      m.role === "user"
                        ? { background: ACCENT, borderRadius: "14px 14px 2px 14px" }
                        : { border: "1px solid var(--rule)", borderRadius: "14px 14px 14px 2px" }
                    }
                  >
                    {m.role === "assistant" ? <Markdown text={m.content} accent={ACCENT} /> : m.content}
                  </div>

                  {/* Executed action chips */}
                  {m.executed && m.executed.length > 0 && (
                    <div className="max-w-[85%] mt-2 flex flex-wrap gap-1.5">
                      {m.executed.map((action, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1.25 font-mono text-[9px] tracking-[0.04em] px-2.5 py-1.25 rounded-full"
                          style={
                            action.ok
                              ? { background: "rgba(22,163,74,0.10)", color: "#16A34A", border: "1px solid rgba(22,163,74,0.25)" }
                              : { background: "rgba(217,119,6,0.10)", color: "#D97706", border: "1px solid rgba(217,119,6,0.25)" }
                          }
                        >
                          {action.ok ? <Check size={10} /> : <AlertTriangle size={10} />}
                          {action.summary}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-(--bg-2) border border-(--rule) rounded-[14px] rounded-bl-sm px-4 py-3 flex items-center gap-2">
                    <Loader2 className="animate-spin" size={14} style={{ color: ACCENT }} />
                    <span className="font-mono text-[10px] text-muted-foreground">Thinking…</span>
                  </div>
                </div>
              )}

              {listening && (
                <div className="flex justify-end">
                  <div
                    className="text-white rounded-[14px] rounded-br-sm px-4 py-3 flex items-center gap-2 animate-pulse"
                    style={{ background: ACCENT }}
                  >
                    <Mic className="animate-bounce" size={14} />
                    <span className="font-mono text-[10px]">Listening… {interimTranscript}</span>
                  </div>
                </div>
              )}

              {/* Transcribing — shown after recording stops but before the
                  message sends, so the pause isn't silent */}
              {!listening && interimTranscript && (
                <div className="flex justify-end">
                  <div
                    className="rounded-[14px] rounded-br-sm px-4 py-3 flex items-center gap-2"
                    style={{ background: ACCENT_BG, color: ACCENT }}
                  >
                    <Loader2 className="animate-spin" size={14} />
                    <span className="font-mono text-[10px]">{interimTranscript}</span>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Quick suggestions */}
            {!loading && (
              <div className="px-5 pb-2.5 flex gap-2 flex-wrap">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => void handleSendMessage(s)}
                    className="font-mono text-[9px] tracking-[0.06em] uppercase px-2.5 py-1.5 rounded-full border border-(--rule) bg-transparent cursor-pointer text-muted-foreground hover:text-(--ink) hover:border-muted-foreground transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            <div className="p-4 border-t border-(--rule) bg-(--bg-2)">
              <div
                className="flex items-end gap-2 rounded-xl p-2 bg-(--bg) border transition-all duration-200 focus-within:border-muted-foreground"
                style={{ borderColor: "var(--rule)" }}
              >
                <button
                  type="button"
                  onClick={() => void toggleSpeechRecognition()}
                  disabled={!listening && Boolean(interimTranscript)}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center border-none shrink-0 cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                    listening ? "text-white" : "hover:bg-(--bg-2) text-muted-foreground bg-transparent"
                  }`}
                  style={listening ? { background: "#DC2626" } : undefined}
                  title={listening ? "Stop listening" : !listening && interimTranscript ? "Transcribing…" : "Speak to Vela"}
                  aria-label={listening ? "Stop voice input" : "Start voice input"}
                >
                  {!listening && interimTranscript ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : listening ? (
                    <MicOff size={16} />
                  ) : (
                    <Mic size={16} />
                  )}
                </button>

                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={listening ? "Listening…" : "Plan, log, or ask anything…"}
                  disabled={loading}
                  rows={1}
                  className="flex-1 bg-transparent border-none outline-none resize-none font-sans text-[13px] leading-normal py-2 text-(--ink) placeholder:text-(--ink-4)"
                  style={{ maxHeight: "120px" }}
                />

                <button
                  type="button"
                  onClick={() => void handleSendMessage(input)}
                  disabled={!input.trim() || loading}
                  className="w-9 h-9 rounded-lg flex items-center justify-center border-none shrink-0 cursor-pointer transition-all disabled:opacity-30 disabled:cursor-not-allowed text-white"
                  style={{ background: ACCENT }}
                  aria-label="Send message"
                >
                  <Send size={14} />
                </button>
              </div>
              <div className="flex items-center justify-between mt-2.5 px-1">
                <span className="font-mono text-[8px] text-(--ink-4) flex items-center gap-0.75">
                  <CornerDownLeft size={8} /> Enter to send
                </span>
                <span className="font-mono text-[8px] text-(--ink-4)">
                  Tap the mic to speak
                </span>
              </div>
            </div>
          </div>
        </>
      )}

      <style jsx global>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in {
          animation: slideIn 0.24s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </>
  );
}
