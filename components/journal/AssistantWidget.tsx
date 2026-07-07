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

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const router = useRouter();

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

    try {
      const res = await fetch("/api/journal/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages.map((m) => ({ role: m.role, content: m.content })) }),
      });

      if (!res.ok) throw new Error("Assistant response failed");
      const data = await res.json() as { reply: string; executed: ExecutedAction[] };

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply, executed: data.executed },
      ]);
      speakText(data.reply);

      // Refresh server components so the dashboard/log reflects what was done
      if (data.executed.some((e) => e.ok)) {
        router.refresh();
      }
    } catch (err) {
      console.error("[journal/assistant] error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I had trouble processing that. Please try again." },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const toggleSpeechRecognition = (): void => {
    if (typeof window === "undefined") return;

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Voice input isn't supported in this browser — try Chrome or Safari." },
      ]);
      return;
    }

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
        className="fixed bottom-[24px] right-[24px] z-50 w-[56px] h-[56px] rounded-full flex items-center justify-center border-none cursor-pointer shadow-[0_8px_32px_rgba(124,58,237,0.25)] transition-all duration-300 hover:scale-[1.08] hover:shadow-[0_12px_40px_rgba(124,58,237,0.35)]"
        style={{ background: ACCENT, color: "#fff" }}
        aria-label="Open Vela Guide"
      >
        {open ? <X size={24} /> : <Sparkles className="animate-pulse" size={24} />}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          <div
            className="fixed top-0 right-0 h-screen w-full max-w-[420px] z-50 flex flex-col shadow-2xl transition-all duration-300 animate-slide-in"
            style={{ background: "var(--bg)", borderLeft: "1px solid var(--rule)" }}
          >
            <div className="flex items-center justify-between px-[20px] py-[16px] border-b border-[var(--rule)] bg-[var(--bg-2)]">
              <div className="flex items-center gap-[10px]">
                <div className="w-[28px] h-[28px] rounded-[6px] flex items-center justify-center" style={{ background: ACCENT_BG }}>
                  <Sparkles size={14} style={{ color: ACCENT }} />
                </div>
                <div>
                  <div className="font-display text-[15px] font-semibold text-[var(--ink)]">Vela Guide</div>
                  <div className="font-mono text-[8px] tracking-[0.1em] uppercase text-[var(--ink-3)]">
                    Day planner · Coach · Logger
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-[6px]">
                <button
                  onClick={() => setTtsEnabled(!ttsEnabled)}
                  className="w-[30px] h-[30px] rounded-[6px] flex items-center justify-center border-none bg-transparent cursor-pointer hover:bg-[var(--bg-3)] text-[var(--ink-3)] transition-all"
                  title={ttsEnabled ? "Disable voice replies" : "Enable voice replies"}
                >
                  {ttsEnabled ? <Volume2 size={16} style={{ color: ACCENT }} /> : <VolumeX size={16} />}
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="w-[30px] h-[30px] rounded-[6px] flex items-center justify-center border-none bg-transparent cursor-pointer hover:bg-[var(--bg-3)] text-[var(--ink-3)]"
                  aria-label="Close Vela Guide"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto px-[20px] py-[20px] space-y-[16px] scrollbar-thin" data-lenis-prevent="true">
              {messages.map((m, idx) => (
                <div key={idx} className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-[14px] px-[16px] py-[12px] text-[13px] leading-[1.6] ${m.role === "user" ? "text-white" : "bg-[var(--bg-2)] text-[var(--ink)]"}`}
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
                    <div className="max-w-[85%] mt-[8px] flex flex-wrap gap-[6px]">
                      {m.executed.map((action, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-[5px] font-mono text-[9px] tracking-[0.04em] px-[10px] py-[5px] rounded-full"
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
                  <div className="bg-[var(--bg-2)] border border-[var(--rule)] rounded-[14px] rounded-bl-[2px] px-[16px] py-[12px] flex items-center gap-[8px]">
                    <Loader2 className="animate-spin" size={14} style={{ color: ACCENT }} />
                    <span className="font-mono text-[10px] text-[var(--ink-3)]">Thinking…</span>
                  </div>
                </div>
              )}

              {listening && (
                <div className="flex justify-end">
                  <div
                    className="text-white rounded-[14px] rounded-br-[2px] px-[16px] py-[12px] flex items-center gap-[8px] animate-pulse"
                    style={{ background: ACCENT }}
                  >
                    <Mic className="animate-bounce" size={14} />
                    <span className="font-mono text-[10px]">Listening… {interimTranscript}</span>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Quick suggestions — only while the conversation is fresh */}
            {messages.length <= 1 && !loading && (
              <div className="px-[20px] pb-[10px] flex gap-[8px] flex-wrap">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => void handleSendMessage(s)}
                    className="font-mono text-[9px] tracking-[0.06em] uppercase px-[10px] py-[6px] rounded-full border border-[var(--rule)] bg-transparent cursor-pointer text-[var(--ink-3)] hover:text-[var(--ink)] hover:border-[var(--ink-3)] transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            <div className="p-[16px] border-t border-[var(--rule)] bg-[var(--bg-2)]">
              <div
                className="flex items-end gap-[8px] rounded-[12px] p-[8px] bg-[var(--bg)] border transition-all duration-200 focus-within:border-[var(--ink-3)]"
                style={{ borderColor: "var(--rule)" }}
              >
                <button
                  type="button"
                  onClick={toggleSpeechRecognition}
                  className={`w-[36px] h-[36px] rounded-[8px] flex items-center justify-center border-none shrink-0 cursor-pointer transition-all ${
                    listening ? "text-white" : "hover:bg-[var(--bg-2)] text-[var(--ink-3)] bg-transparent"
                  }`}
                  style={listening ? { background: "#DC2626" } : undefined}
                  title={listening ? "Stop listening" : "Speak to Vela"}
                  aria-label={listening ? "Stop voice input" : "Start voice input"}
                >
                  {listening ? <MicOff size={16} /> : <Mic size={16} />}
                </button>

                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={listening ? "Listening…" : "Plan, log, or ask anything…"}
                  disabled={loading}
                  rows={1}
                  className="flex-1 bg-transparent border-none outline-none resize-none font-sans text-[13px] leading-[1.5] py-[8px] text-[var(--ink)] placeholder:text-[var(--ink-4)]"
                  style={{ maxHeight: "120px" }}
                />

                <button
                  type="button"
                  onClick={() => void handleSendMessage(input)}
                  disabled={!input.trim() || loading}
                  className="w-[36px] h-[36px] rounded-[8px] flex items-center justify-center border-none shrink-0 cursor-pointer transition-all disabled:opacity-30 disabled:cursor-not-allowed text-white"
                  style={{ background: ACCENT }}
                  aria-label="Send message"
                >
                  <Send size={14} />
                </button>
              </div>
              <div className="flex items-center justify-between mt-[10px] px-[4px]">
                <span className="font-mono text-[8px] text-[var(--ink-4)] flex items-center gap-[3px]">
                  <CornerDownLeft size={8} /> Enter to send
                </span>
                <span className="font-mono text-[8px] text-[var(--ink-4)]">
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
