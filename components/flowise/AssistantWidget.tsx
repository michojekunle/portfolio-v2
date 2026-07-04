"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  MessageSquare,
  Sparkles,
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  X,
  Loader2,
  CornerDownLeft,
} from "lucide-react";

const ACCENT = "#16A34A";
const ACCENT_BG = "rgba(22,163,74,0.08)";

interface Message {
  role: "user" | "assistant";
  content: string;
}

// Browser SpeechRecognition Type Setup
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

export function AssistantWidget(): React.ReactElement {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm Flowy, your AI assistant. Ask me to log transactions, set budgets, or check balances. Try saying: 'I spent ₦5,000 on lunch today.'",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const router = useRouter();

  // Scroll to bottom on new message
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 80);
    }
  }, [messages, open]);

  // Handle TTS clean up on unmount or close
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [open]);

  const speakText = (text: string): void => {
    if (!ttsEnabled || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    // Attempt to pick a natural english voice
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v => v.lang.startsWith("en") && v.name.includes("Google"));
    if (preferred) utterance.voice = preferred;
    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async (text: string): Promise<void> => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: Message = { role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      // Get current local date in YYYY-MM-DD
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const localDate = `${year}-${month}-${day}`;
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      const res = await fetch("/api/flowise/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          localDate,
          timezone,
        }),
      });

      if (!res.ok) throw new Error("Assistant response failed");
      const data = await res.json() as {
        reply: string;
        actionExecuted: string;
        refreshRequired: boolean;
      };

      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      speakText(data.reply);

      if (data.refreshRequired) {
        setRefreshing(true);
        router.refresh();
        setTimeout(() => setRefreshing(false), 1200);
      }
    } catch (err) {
      console.error("[assistant] error:", err);
      const errorMsg = "Sorry, I had trouble processing that request. Please try again.";
      setMessages((prev) => [...prev, { role: "assistant", content: errorMsg }]);
      speakText(errorMsg);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const toggleSpeechRecognition = (): void => {
    if (typeof window === "undefined") return;

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      alert("Speech recognition is not supported in this browser. Please try Chrome or Safari.");
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
        if (result.isFinal) {
          final += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }
      setInterimTranscript(interim);
      if (final) {
        setInterimTranscript("");
        setListening(false);
        void handleSendMessage(final.trim());
      }
    };

    rec.onerror = (e) => {
      console.error("[assistant] speech error:", e);
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
      {/* Floating Trigger Button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-[24px] right-[24px] z-50 w-[56px] h-[56px] rounded-full flex items-center justify-center border-none cursor-pointer shadow-[0_8px_32px_rgba(22,163,74,0.25)] transition-all duration-300 hover:scale-[1.08] hover:shadow-[0_12px_40px_rgba(22,163,74,0.35)]"
        style={{ background: ACCENT, color: "#fff" }}
        aria-label="Open AI Assistant"
      >
        {open ? <X size={24} /> : <Sparkles className="animate-pulse" size={24} />}
      </button>

      {/* Slide-out Drawer */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          <div
            className="fixed top-0 right-0 h-screen w-full max-w-[400px] z-50 flex flex-col shadow-2xl transition-all duration-300 animate-slide-in"
            style={{
              background: "var(--bg)",
              borderLeft: "1px solid var(--rule)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-[20px] py-[16px] border-b border-[var(--rule)] bg-[var(--bg-2)]">
              <div className="flex items-center gap-[10px]">
                <div
                  className="w-[28px] h-[28px] rounded-[6px] flex items-center justify-center"
                  style={{ background: ACCENT_BG }}
                >
                  <Sparkles size={14} style={{ color: ACCENT }} />
                </div>
                <div>
                  <div className="font-display text-[15px] font-semibold text-[var(--ink)]">Flowy</div>
                  <div className="font-mono text-[8px] tracking-[0.1em] uppercase text-[var(--ink-3)]">
                    {refreshing ? "Syncing data…" : "Flowise Copilot"}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-[6px]">
                {/* TTS Reader Toggle */}
                <button
                  onClick={() => setTtsEnabled(!ttsEnabled)}
                  className="w-[30px] h-[30px] rounded-[6px] flex items-center justify-center border-none bg-transparent cursor-pointer hover:bg-[var(--bg-3)] text-[var(--ink-3)] transition-all"
                  title={ttsEnabled ? "Disable voice output" : "Enable voice output"}
                >
                  {ttsEnabled ? <Volume2 size={16} style={{ color: ACCENT }} /> : <VolumeX size={16} />}
                </button>
                {/* Close */}
                <button
                  onClick={() => setOpen(false)}
                  className="w-[30px] h-[30px] rounded-[6px] flex items-center justify-center border-none bg-transparent cursor-pointer hover:bg-[var(--bg-3)] text-[var(--ink-3)]"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 min-h-0 overflow-y-auto px-[20px] py-[20px] space-y-[16px] scrollbar-thin">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-[14px] px-[16px] py-[12px] text-[13px] leading-[1.6] ${
                      m.role === "user"
                        ? "text-white"
                        : "bg-[var(--bg-2)] text-[var(--ink)]"
                    }`}
                    style={
                      m.role === "user"
                        ? { background: ACCENT, borderRadius: "14px 14px 2px 14px" }
                        : { border: "1px solid var(--rule)", borderRadius: "14px 14px 14px 2px" }
                    }
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div
                    className="bg-[var(--bg-2)] border border-[var(--rule)] rounded-[14px] rounded-bl-[2px] px-[16px] py-[12px] flex items-center gap-[8px]"
                  >
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

            {/* Input Panel */}
            <div className="p-[16px] border-t border-[var(--rule)] bg-[var(--bg-2)]">
              <div
                className="flex items-end gap-[8px] rounded-[12px] p-[8px] bg-[var(--bg)] border transition-all duration-200 focus-within:border-[var(--ink-3)]"
                style={{ borderColor: "var(--rule)" }}
              >
                {/* Voice button */}
                <button
                  type="button"
                  onClick={toggleSpeechRecognition}
                  className={`w-[36px] h-[36px] rounded-[8px] flex items-center justify-center border-none shrink-0 cursor-pointer transition-all ${
                    listening ? "bg-red-500 text-white" : "hover:bg-[var(--bg-2)] text-[var(--ink-3)] bg-transparent"
                  }`}
                  style={listening ? { background: "#DC2626" } : undefined}
                  title="Speak command"
                >
                  {listening ? <MicOff size={16} /> : <Mic size={16} />}
                </button>

                {/* Text area input */}
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={listening ? "Listening…" : "Type a financial action…"}
                  disabled={loading}
                  rows={1}
                  className="flex-1 bg-transparent border-none outline-none resize-none font-sans text-[13px] leading-[1.5] py-[8px] text-[var(--ink)] placeholder:text-[var(--ink-4)]"
                  style={{ maxHeight: "120px" }}
                />

                {/* Send */}
                <button
                  type="button"
                  onClick={() => void handleSendMessage(input)}
                  disabled={!input.trim() || loading}
                  className="w-[36px] h-[36px] rounded-[8px] flex items-center justify-center border-none shrink-0 cursor-pointer transition-all disabled:opacity-30 disabled:cursor-not-allowed text-white"
                  style={{ background: ACCENT }}
                >
                  <Send size={14} />
                </button>
              </div>
              <div className="flex items-center justify-between mt-[10px] px-[4px]">
                <span className="font-mono text-[8px] text-[var(--ink-4)] flex items-center gap-[3px]">
                  <CornerDownLeft size={8} /> Enter to send
                </span>
                <span className="font-mono text-[8px] text-[var(--ink-4)]">
                  Press Mic to speak
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
