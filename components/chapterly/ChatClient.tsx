"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import type { ChBook } from "@/lib/chapterly/types";
import { ArrowLeft, Send, Loader2, BookMarked, Mic, MicOff, Volume2 } from "lucide-react";

// SpeechRecognition is not in lib.dom.d.ts for all targets — declare what we need.
interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}
interface SpeechRecognitionResult {
  readonly length: number;
  readonly isFinal: boolean;
  item(index: number): SpeechRecognitionAlternative;
  readonly [index: number]: SpeechRecognitionAlternative;
}
interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  readonly [index: number]: SpeechRecognitionResult;
}
interface SpeechRecognitionEvent extends Event {
  readonly results: SpeechRecognitionResultList;
  readonly resultIndex: number;
}
interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}
interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionInstance;
}
declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

const ACCENT = "#4F6D7A";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTED_PROMPTS = [
  "Summarize the key themes of this book",
  "What are the 3 most important takeaways?",
  "Create 5 quiz questions from this book",
  "Explain the core idea in simple terms",
  "What would the author say about [your topic]?",
];

interface Props {
  book: ChBook;
}

export function ChChatClient({ book }: Props): React.ReactElement {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `I've read "${book.title}"${book.author ? ` by ${book.author}` : ""}. Ask me anything about it — themes, summaries, explanations, quiz questions, or your own thoughts on it.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string): Promise<void> => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: Message = { role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chapterly/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          book_id: book.id,
          book_title: book.title,
          book_author: book.author,
          messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })),
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

      // Read aloud if TTS enabled
      if (ttsEnabled && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const utt = new SpeechSynthesisUtterance(accumulated);
        window.speechSynthesis.speak(utt);
      }
    } catch (err) {
      console.error("[chapterly/chat] stream error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I couldn't process that. Please try again." },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const startVoice = (): void => {
    if (typeof window === "undefined") return;

    const SR = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SR) return;

    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      setInterimTranscript("");
      return;
    }

    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = "en-US";

    rec.onresult = (e: SpeechRecognitionEvent) => {
      let interim = "";
      let final = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const result = e.results[i];
        if (result.isFinal) {
          final += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }
      setInterimTranscript(interim);
      if (final) {
        setInterimTranscript("");
        setInput(final.trim());
        setListening(false);
        void sendMessage(final.trim());
      }
    };

    rec.onerror = () => {
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
      void sendMessage(input);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[var(--bg)] max-[1024px]:pt-[60px]">
      {/* Header */}
      <div className="flex items-center justify-between px-[16px] sm:px-[20px] h-[56px] border-b border-[var(--rule)] bg-[var(--bg-2)] shrink-0">
        <div className="flex items-center gap-[16px]">
          <Link
            href={`/tools/chapterly/read/${book.id}`}
            className="flex items-center gap-[6px] no-underline font-mono text-[10px] tracking-[0.12em] uppercase text-[var(--ink-3)] hover:text-[var(--ink)] transition-colors"
          >
            <ArrowLeft size={14} />
            Back to reader
          </Link>
          <span className="text-[var(--rule)]">·</span>
          <div className="flex items-center gap-[8px] max-w-[140px] sm:max-w-[200px]">
            <BookMarked size={16} style={{ color: ACCENT }} />
            <span className="font-mono text-[11px] text-[var(--ink-2)] truncate max-w-[200px]">{book.title}</span>
          </div>
        </div>
        <button
          onClick={() => setTtsEnabled((v) => !v)}
          className="w-[32px] h-[32px] flex items-center justify-center rounded-[6px] border-none cursor-pointer transition-all"
          style={{
            background: ttsEnabled ? ACCENT + "20" : "var(--bg)",
            color: ttsEnabled ? ACCENT : "var(--ink-3)",
          }}
          aria-label={ttsEnabled ? "Disable voice responses" : "Enable voice responses"}
          title="Toggle voice responses"
        >
          <Volume2 size={14} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-[20px] py-[24px] space-y-[20px]">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "assistant" && (
              <div
                className="w-[28px] h-[28px] rounded-full flex items-center justify-center shrink-0 mr-[10px] mt-[2px]"
                style={{ background: ACCENT + "20" }}
              >
                <BookMarked size={14} style={{ color: ACCENT }} />
              </div>
            )}
            <div
              className="max-w-[80%] max-[480px]:max-w-[90%] rounded-[12px] px-[14px] sm:px-[16px] py-[12px] text-[13px] sm:text-[14px] leading-[1.65]"
              style={
                msg.role === "user"
                  ? { background: ACCENT, color: "#fff" }
                  : { background: "var(--bg-2)", color: "var(--ink)", border: "1px solid var(--rule)" }
              }
            >
              {msg.content || (loading && i === messages.length - 1 ? (
                <Loader2 size={16} className="animate-spin" style={{ color: ACCENT }} />
              ) : null)}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Suggested prompts (first load) */}
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

      {/* Input */}
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
            onClick={startVoice}
            disabled={loading}
            className="w-[44px] h-[44px] flex items-center justify-center rounded-[10px] border-none cursor-pointer transition-all shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: listening ? "#EA580C20" : "var(--bg)",
              color: listening ? "#EA580C" : "var(--ink-3)",
              border: "1px solid var(--rule)",
            }}
            aria-label={listening ? "Stop voice input" : "Start voice input"}
          >
            {listening ? <MicOff size={16} /> : <Mic size={16} />}
          </button>
          <button
            onClick={() => void sendMessage(input)}
            disabled={!input.trim() || loading}
            className="w-[44px] h-[44px] flex items-center justify-center rounded-[10px] border-none cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            style={{ background: ACCENT, color: "#fff" }}
            aria-label="Send message"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
        <div className="mt-[8px] font-mono text-[9px] tracking-[0.08em] uppercase text-[var(--ink-3)]">
          Enter to send · Shift+Enter for new line · Mic for voice
        </div>
      </div>
    </div>
  );
}
