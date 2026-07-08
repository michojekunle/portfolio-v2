"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import type { ChBook } from "@/lib/chapterly/types";
import { ArrowLeft, Send, Loader2, BookMarked, Mic, MicOff, Volume2, Phone, PhoneOff } from "lucide-react";
import { Markdown, stripMarkdown } from "@/components/ui/Markdown";

// SpeechRecognition is not in lib.dom.d.ts for all targets — declare what we need.
interface SpeechRecognitionAlternative { readonly transcript: string; readonly confidence: number; }
interface SpeechRecognitionResult { readonly length: number; readonly isFinal: boolean; item(i: number): SpeechRecognitionAlternative; readonly [i: number]: SpeechRecognitionAlternative; }
interface SpeechRecognitionResultList { readonly length: number; item(i: number): SpeechRecognitionResult; readonly [i: number]: SpeechRecognitionResult; }
interface SpeechRecognitionEvent extends Event { readonly results: SpeechRecognitionResultList; readonly resultIndex: number; }
interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean; interimResults: boolean; lang: string;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onerror: ((e: Event) => void) | null;
  onend: (() => void) | null;
  start(): void; stop(): void;
}
interface SpeechRecognitionConstructor { new(): SpeechRecognitionInstance; }
declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

const ACCENT = "var(--ch-accent)";

interface Message { role: "user" | "assistant"; content: string; }
type VoiceState = "idle" | "listening" | "thinking" | "speaking";

const SUGGESTED_PROMPTS = [
  "Summarize the key themes of this book",
  "What are the 3 most important takeaways?",
  "Create 5 quiz questions from this book",
  "Explain the core idea in simple terms",
  "What would the author say about [your topic]?",
];

interface Props { book: ChBook; }

export function ChChatClient({ book }: Props): React.ReactElement {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: `I've read "${book.title}"${book.author ? ` by ${book.author}` : ""}. Ask me anything — themes, summaries, questions, or your own thoughts on it.` },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [listening, setListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [ttsEnabled, setTtsEnabled] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  // Refs so callbacks can read current values without stale closures.
  const voiceModeRef = useRef(false);
  const loadingRef = useRef(false);
  const messagesRef = useRef(messages);
  const ttsEnabledRef = useRef(false);
  const enteringVoiceRef = useRef(false);

  useEffect(() => { voiceModeRef.current = voiceMode; }, [voiceMode]);
  useEffect(() => { loadingRef.current = loading; }, [loading]);
  useEffect(() => { messagesRef.current = messages; }, [messages]);
  useEffect(() => { ttsEnabledRef.current = ttsEnabled; }, [ttsEnabled]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
      try { recognitionRef.current?.stop(); } catch {}
    };
  }, []);

  // ─── Core functions (hoisted declarations so they can reference each other) ──

  function startVoiceRecognition(isVoiceMode: boolean): void {
    const SR = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SR) return;

    try { recognitionRef.current?.stop(); } catch {}

    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = "en-US";

    rec.onresult = (e: SpeechRecognitionEvent) => {
      let interim = "";
      let final = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) final += r[0].transcript;
        else interim += r[0].transcript;
      }
      setInterimTranscript(interim);
      if (final) {
        setInterimTranscript("");
        if (isVoiceMode) {
          setVoiceState("thinking");
          void sendMessage(final.trim(), true);
        } else {
          setInput(final.trim());
          setListening(false);
          void sendMessage(final.trim(), false);
        }
      }
    };

    // Track whether this recognition session ended due to an error. Both onerror
    // and onend fire on error; without this flag they schedule two restarts.
    let stoppedDueToError = false;

    rec.onerror = () => {
      stoppedDueToError = true;
      setListening(false);
      setInterimTranscript("");
      // Auto-retry after a pause so the conversation doesn't stall on mic errors.
      if (isVoiceMode && voiceModeRef.current) {
        setTimeout(() => {
          if (voiceModeRef.current && !loadingRef.current) {
            setVoiceState("listening");
            startVoiceRecognition(true);
          }
        }, 1500);
      }
    };

    rec.onend = () => {
      setListening(false);
      setInterimTranscript("");
      // onerror already scheduled a restart — don't double-start.
      if (stoppedDueToError) return;
      // In voice mode, recognition stops naturally after silence (continuous=false).
      // Restart if we're still in voice mode and not mid-request, so the mic
      // stays open between turns even when the user pauses without speaking.
      if (isVoiceMode && voiceModeRef.current && !loadingRef.current) {
        setTimeout(() => {
          if (voiceModeRef.current && !loadingRef.current) {
            setVoiceState("listening");
            startVoiceRecognition(true);
          }
        }, 300);
      }
    };

    recognitionRef.current = rec;
    try {
      rec.start();
      setListening(true);
    } catch (err) {
      console.error("[chapterly/chat] SpeechRecognition.start() failed:", err);
    }
  }

  async function sendMessage(text: string, isVoice = false): Promise<void> {
    const trimmed = text.trim();
    if (!trimmed || loadingRef.current) return;

    const snapshot = messagesRef.current;
    const userMsg: Message = { role: "user", content: trimmed };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    loadingRef.current = true;
    if (isVoice) setVoiceState("thinking");

    try {
      const res = await fetch("/api/chapterly/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          book_id: book.id,
          book_title: book.title,
          book_author: book.author,
          voice_mode: isVoice,
          messages: [...snapshot, userMsg].map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok || !res.body) throw new Error("Chat failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: "assistant", content: accumulated };
          return copy;
        });
      }

      if (isVoice && accumulated && window.speechSynthesis) {
        setVoiceState("speaking");
        window.speechSynthesis.cancel();
        const utt = new SpeechSynthesisUtterance(accumulated);
        utt.rate = 1.05;
        // Turn-taking: after AI finishes speaking, reopen the mic automatically.
        const onDone = (): void => {
          if (voiceModeRef.current) {
            setVoiceState("listening");
            startVoiceRecognition(true);
          } else {
            setVoiceState("idle");
          }
        };
        utt.onend = onDone;
        utt.onerror = onDone;
        window.speechSynthesis.speak(utt);
      } else if (isVoice && accumulated) {
        // speechSynthesis unavailable — skip TTS but keep turn-taking alive
        setVoiceState("listening");
        startVoiceRecognition(true);
      } else if (ttsEnabledRef.current && accumulated && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const utt = new SpeechSynthesisUtterance(accumulated);
        window.speechSynthesis.speak(utt);
      }
    } catch (err) {
      console.error("[chapterly/chat] stream error:", err);
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I ran into an issue. Please try again." }]);
      // On API error in voice mode, exit voice mode rather than retrying immediately —
      // retrying unconditionally causes an infinite loop if the server is down or auth expired.
      if (isVoice && voiceModeRef.current) {
        exitVoiceMode();
      }
    } finally {
      setLoading(false);
      loadingRef.current = false;
      if (!isVoice) inputRef.current?.focus();
    }
  }

  function enterVoiceMode(): void {
    if (enteringVoiceRef.current || voiceModeRef.current) return;
    enteringVoiceRef.current = true;
    window.speechSynthesis?.cancel();
    voiceModeRef.current = true;
    setVoiceMode(true);
    setVoiceState("listening");
    setTimeout(() => {
      enteringVoiceRef.current = false;
      startVoiceRecognition(true);
    }, 300);
  }

  function exitVoiceMode(): void {
    voiceModeRef.current = false;
    setVoiceMode(false);
    setVoiceState("idle");
    window.speechSynthesis?.cancel();
    try { recognitionRef.current?.stop(); } catch {}
    setInterimTranscript("");
    setListening(false);
  }

  function toggleTextVoice(): void {
    if (listening) {
      try { recognitionRef.current?.stop(); } catch {}
      setListening(false);
      setInterimTranscript("");
      return;
    }
    startVoiceRecognition(false);
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendMessage(input);
    }
  };

  // ─── Voice mode UI ────────────────────────────────────────────────────────────
  if (voiceMode) {
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    const lastAI   = [...messages].reverse().find((m) => m.role === "assistant");

    const orbColor =
      voiceState === "listening" ? ACCENT :
      voiceState === "speaking"  ? "#16A34A" :
      "var(--bg-2)";

    return (
      <div className="flex flex-col h-[100dvh] bg-[var(--bg)] max-[1024px]:pt-[60px]">
        {/* Header */}
        <div className="flex items-center justify-between px-[20px] h-[56px] border-b border-[var(--rule)] bg-[var(--bg-2)] shrink-0">
          <div className="flex items-center gap-[10px]">
            <BookMarked size={16} style={{ color: ACCENT }} />
            <span className="font-mono text-[11px] text-[var(--ink-2)] truncate max-w-[220px]">{book.title}</span>
          </div>
          <div className="flex items-center gap-[6px] font-mono text-[10px] tracking-[0.1em] uppercase" style={{ color: ACCENT }}>
            <span className="w-[6px] h-[6px] rounded-full animate-pulse inline-block" style={{ background: ACCENT }} />
            Live Voice
          </div>
        </div>

        {/* Orb */}
        <div className="flex-1 flex flex-col items-center justify-center gap-[28px] px-[32px]">
          <div className="relative flex items-center justify-center w-[160px] h-[160px]">
            {(voiceState === "listening") && (
              <>
                <div className="absolute inset-0 rounded-full animate-ping" style={{ background: ACCENT, opacity: 0.18, animationDuration: "1.4s" }} />
                <div className="absolute inset-[-16px] rounded-full animate-ping" style={{ background: ACCENT, opacity: 0.08, animationDuration: "1.4s", animationDelay: "0.55s" }} />
              </>
            )}
            {(voiceState === "speaking") && (
              <>
                <div className="absolute inset-0 rounded-full animate-ping" style={{ background: "#16A34A", opacity: 0.22, animationDuration: "0.9s" }} />
                <div className="absolute inset-[-16px] rounded-full animate-ping" style={{ background: "#16A34A", opacity: 0.10, animationDuration: "0.9s", animationDelay: "0.35s" }} />
              </>
            )}
            <div
              className="w-[112px] h-[112px] rounded-full flex items-center justify-center transition-all duration-500 shadow-xl"
              style={{ background: orbColor, border: "1.5px solid var(--rule)" }}
            >
              {voiceState === "listening" && <Mic size={42} color="#fff" />}
              {voiceState === "thinking"  && <Loader2 size={42} className="animate-spin" style={{ color: ACCENT }} />}
              {voiceState === "speaking"  && <Volume2 size={42} color="#fff" />}
              {voiceState === "idle"      && <Mic size={42} style={{ color: ACCENT }} />}
            </div>
          </div>

          {/* State label */}
          <div className="text-center min-h-[60px]">
            <div className="font-display text-[26px] tracking-[-0.02em] fvs-text text-[var(--ink)]">
              {voiceState === "listening" && "Listening…"}
              {voiceState === "thinking"  && "Thinking…"}
              {voiceState === "speaking"  && "Speaking…"}
              {voiceState === "idle"      && "Ready"}
            </div>
            {interimTranscript && (
              <p className="mt-[8px] text-[14px] text-[var(--ink-3)] italic">
                &ldquo;{interimTranscript}…&rdquo;
              </p>
            )}
          </div>

          {/* Last exchange preview */}
          <div className="w-full max-w-[460px] space-y-[8px]">
            {lastUser && (
              <div className="rounded-[10px] px-[14px] py-[10px]" style={{ background: "color-mix(in srgb, var(--ch-accent) 8%, transparent)", border: `1px solid color-mix(in srgb, var(--ch-accent) 19%, transparent)` }}>
                <div className="font-mono text-[9px] uppercase tracking-[0.12em] mb-[4px]" style={{ color: ACCENT }}>You</div>
                <div className="text-[13px] text-[var(--ink)] leading-[1.6]">{lastUser.content}</div>
              </div>
            )}
            {lastAI && (
              <div className="rounded-[10px] px-[14px] py-[10px]" style={{ background: "var(--bg-2)", border: "1px solid var(--rule)" }}>
                <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--ink-3)] mb-[4px]">AI</div>
                <div className="text-[13px] text-[var(--ink)] leading-[1.6]">
                  {(() => {
                    const plain = stripMarkdown(lastAI.content);
                    return plain.length > 200 ? `${plain.slice(0, 200)}…` : plain;
                  })()}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* End call */}
        <div className="pb-[44px] flex flex-col items-center gap-[10px]">
          <button
            onClick={exitVoiceMode}
            className="w-[64px] h-[64px] rounded-full flex items-center justify-center border-none cursor-pointer transition-transform hover:scale-105 shadow-lg"
            style={{ background: "#DC2626" }}
            aria-label="End voice chat"
          >
            <PhoneOff size={26} color="#fff" />
          </button>
          <span className="font-mono text-[9px] tracking-[0.12em] uppercase text-[var(--ink-3)]">End call</span>
        </div>
      </div>
    );
  }

  // ─── Text chat UI ─────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-[100dvh] bg-[var(--bg)] max-[1024px]:pt-[60px]">
      {/* Header */}
      <div className="flex items-center justify-between px-[16px] sm:px-[20px] h-[56px] border-b border-[var(--rule)] bg-[var(--bg-2)] shrink-0">
        <div className="flex items-center gap-[16px]">
          <Link
            href={`/tools/chapterly/read/${book.id}`}
            className="flex items-center gap-[6px] no-underline font-mono text-[10px] tracking-[0.12em] uppercase text-[var(--ink-3)] hover:text-[var(--ink)] transition-colors"
          >
            <ArrowLeft size={14} /> Back to reader
          </Link>
          <span className="text-[var(--rule)]">·</span>
          <div className="flex items-center gap-[8px]">
            <BookMarked size={16} style={{ color: ACCENT }} />
            <span className="font-mono text-[11px] text-[var(--ink-2)] truncate max-[480px]:max-w-[100px] max-w-[200px]">
              {book.title}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-[8px]">
          <button
            onClick={() => setTtsEnabled((v) => !v)}
            className="w-[32px] h-[32px] flex items-center justify-center rounded-[6px] border-none cursor-pointer transition-all"
            style={{ background: ttsEnabled ? `color-mix(in srgb, var(--ch-accent) 13%, transparent)` : "var(--bg)", color: ttsEnabled ? ACCENT : "var(--ink-3)" }}
            aria-label={ttsEnabled ? "Disable read-aloud" : "Enable read-aloud"}
            title="Read responses aloud"
          >
            <Volume2 size={14} />
          </button>
          <button
            onClick={enterVoiceMode}
            className="inline-flex items-center gap-[6px] h-[32px] px-[12px] rounded-[6px] border-none cursor-pointer font-mono text-[9px] tracking-[0.1em] uppercase font-semibold transition-all hover:opacity-80"
            style={{ background: `color-mix(in srgb, var(--ch-accent) 9%, transparent)`, color: ACCENT }}
            title="Switch to live voice dialogue"
          >
            <Phone size={12} /> Voice Chat
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 min-h-0 overflow-y-auto px-[20px] py-[24px] space-y-[20px]" data-lenis-prevent="true">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "assistant" && (
              <div
                className="w-[28px] h-[28px] rounded-full flex items-center justify-center shrink-0 mr-[10px] mt-[2px]"
                style={{ background: `color-mix(in srgb, var(--ch-accent) 13%, transparent)` }}
              >
                <BookMarked size={14} style={{ color: ACCENT }} />
              </div>
            )}
            <div
              className="max-w-[80%] max-[480px]:max-w-[92%] rounded-[12px] px-[14px] sm:px-[16px] py-[12px] text-[13px] sm:text-[14px] leading-[1.65]"
              style={
                msg.role === "user"
                  ? { background: ACCENT, color: "var(--ch-bg)" }
                  : { background: "var(--bg-2)", color: "var(--ink)", border: "1px solid var(--rule)" }
              }
            >
              {msg.content ? (
                msg.role === "assistant" ? (
                  <Markdown text={msg.content} accent={ACCENT} />
                ) : (
                  msg.content
                )
              ) : loading && i === messages.length - 1 ? (
                <Loader2 size={16} className="animate-spin" style={{ color: ACCENT }} />
              ) : null}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Suggested prompts (first load only) */}
      {messages.length === 1 && (
        <div className="px-[20px] pb-[12px] flex gap-[8px] flex-wrap">
          {SUGGESTED_PROMPTS.map((p) => (
            <button
              key={p}
              onClick={() => void sendMessage(p)}
              className="font-mono text-[9px] tracking-[0.08em] uppercase px-[10px] py-[6px] rounded-full border border-[var(--rule)] bg-transparent cursor-pointer text-[var(--ink-3)] hover:border-[var(--ink-2)] hover:text-[var(--ink)] transition-all"
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Input bar */}
      <div className="px-[16px] sm:px-[20px] pb-[20px] pt-[12px] border-t border-[var(--rule)] bg-[var(--bg-2)] shrink-0">
        <div className="flex items-end gap-[8px]">
          <div className="flex-1 relative">
            {interimTranscript && (
              <div className="absolute inset-x-[14px] top-[12px] text-[14px] text-[var(--ink-3)] italic pointer-events-none leading-[1.5] truncate">
                {interimTranscript}…
              </div>
            )}
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={listening ? "Listening…" : `Ask anything about "${book.title}"…`}
              rows={1}
              disabled={loading || listening}
              className="w-full resize-none rounded-[10px] px-[14px] py-[12px] text-[14px] outline-none bg-[var(--bg)] border border-[var(--rule)] text-[var(--ink)] placeholder:text-[var(--ink-3)] disabled:opacity-50 max-h-[120px] overflow-y-auto transition-colors focus:border-[var(--ink-2)]"
              style={{ lineHeight: "1.5", borderColor: listening ? ACCENT : undefined }}
              onInput={(e) => {
                const el = e.currentTarget;
                el.style.height = "auto";
                el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
              }}
            />
          </div>
          <button
            onClick={toggleTextVoice}
            disabled={loading}
            className="w-[44px] h-[44px] flex items-center justify-center rounded-[10px] border-none cursor-pointer transition-all shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: listening ? "#EA580C20" : "var(--bg)",
              color: listening ? "#EA580C" : "var(--ink-3)",
              border: "1px solid var(--rule)",
            }}
            aria-label={listening ? "Stop dictation" : "Dictate message"}
          >
            {listening ? <MicOff size={16} /> : <Mic size={16} />}
          </button>
          <button
            onClick={() => void sendMessage(input)}
            disabled={!input.trim() || loading}
            className="w-[44px] h-[44px] flex items-center justify-center rounded-[10px] border-none cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            style={{ background: ACCENT, color: "var(--ch-bg)" }}
            aria-label="Send message"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
        <div className="mt-[8px] font-mono text-[9px] tracking-[0.08em] uppercase text-[var(--ink-3)]">
          Enter to send · Shift+Enter new line · Mic to dictate · Voice Chat for live dialogue
        </div>
      </div>
    </div>
  );
}
