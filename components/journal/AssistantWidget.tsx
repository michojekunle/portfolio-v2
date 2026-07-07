"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Send, X, Loader2, CornerDownLeft, Check, Plus } from "lucide-react";
import { VELA_ACCENT } from "@/lib/journal/types";
import { Markdown } from "@/components/ui/Markdown";

const ACCENT = VELA_ACCENT;
const ACCENT_BG = "rgba(124,58,237,0.08)";

type Draft =
  | { type: "objective"; title: string; description?: string | null; target_date?: string | null; priority?: "high" | "medium" | "low" }
  | { type: "milestone"; objective_id: string; title: string; due_date?: string | null };

interface Message {
  role: "user" | "assistant";
  content: string;
  draft?: Draft | null;
  draftStatus?: "pending" | "added" | "error";
}

interface Props {
  hasObjectives: boolean;
}

export function AssistantWidget({ hasObjectives }: Props): React.ReactElement {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: hasObjectives
        ? "Hi! I'm the Vela Guide. Ask me how anything works, or tell me what you're trying to get done."
        : "Hi! I'm the Vela Guide. Looks like you haven't set an objective yet — what's one thing you'd like to make progress on this month?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [addingIdx, setAddingIdx] = useState<number | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (open) {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 80);
    }
  }, [messages, open]);

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
      const data = await res.json() as { reply: string; draft: Draft | null };

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply, draft: data.draft, draftStatus: data.draft ? "pending" : undefined },
      ]);
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

  const handleConfirmDraft = async (idx: number): Promise<void> => {
    const msg = messages[idx];
    if (!msg.draft) return;
    setAddingIdx(idx);

    try {
      const endpoint = msg.draft.type === "objective" ? "/api/journal/objectives" : "/api/journal/milestones";
      const body = msg.draft.type === "objective"
        ? { title: msg.draft.title, description: msg.draft.description ?? null, target_date: msg.draft.target_date ?? null, priority: msg.draft.priority ?? "medium" }
        : { objective_id: msg.draft.objective_id, title: msg.draft.title, due_date: msg.draft.due_date ?? null };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Failed to create");

      setMessages((prev) => prev.map((m, i) => (i === idx ? { ...m, draftStatus: "added" } : m)));
      router.refresh();
    } catch (err) {
      console.error("[journal/assistant] confirm draft error:", err);
      setMessages((prev) => prev.map((m, i) => (i === idx ? { ...m, draftStatus: "error" } : m)));
    } finally {
      setAddingIdx(null);
    }
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
            className="fixed top-0 right-0 h-screen w-full max-w-[400px] z-50 flex flex-col shadow-2xl transition-all duration-300 animate-slide-in"
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
                    Journal Copilot
                  </div>
                </div>
              </div>

              <button
                onClick={() => setOpen(false)}
                className="w-[30px] h-[30px] rounded-[6px] flex items-center justify-center border-none bg-transparent cursor-pointer hover:bg-[var(--bg-3)] text-[var(--ink-3)]"
              >
                <X size={16} />
              </button>
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

                  {m.draft && (
                    <div
                      className="max-w-[85%] mt-[8px] rounded-[12px] p-[12px] border"
                      style={{ borderColor: ACCENT, background: ACCENT_BG }}
                    >
                      <div className="font-mono text-[8px] tracking-[0.1em] uppercase mb-[4px]" style={{ color: ACCENT }}>
                        Draft {m.draft.type}
                      </div>
                      <div className="text-[13px] font-semibold text-[var(--ink)]">{m.draft.title}</div>
                      {m.draft.type === "objective" && m.draft.description && (
                        <div className="text-[11px] text-[var(--ink-3)] mt-[2px]">{m.draft.description}</div>
                      )}
                      {m.draft.type === "objective" && m.draft.target_date && (
                        <div className="font-mono text-[9px] text-[var(--ink-3)] mt-[4px]">Due {m.draft.target_date}</div>
                      )}
                      {m.draft.type === "milestone" && m.draft.due_date && (
                        <div className="font-mono text-[9px] text-[var(--ink-3)] mt-[4px]">Due {m.draft.due_date}</div>
                      )}

                      {m.draftStatus === "added" ? (
                        <div className="flex items-center gap-[4px] mt-[8px] font-mono text-[9px]" style={{ color: "#16A34A" }}>
                          <Check size={11} /> Added
                        </div>
                      ) : (
                        <button
                          onClick={() => void handleConfirmDraft(idx)}
                          disabled={addingIdx === idx}
                          className="flex items-center gap-[4px] mt-[8px] h-[26px] px-[10px] rounded-[6px] font-mono text-[9px] tracking-[0.06em] uppercase font-semibold text-white cursor-pointer border-none disabled:opacity-50"
                          style={{ background: ACCENT }}
                        >
                          {addingIdx === idx ? <Loader2 size={11} className="animate-spin" /> : <Plus size={11} />}
                          Add this
                        </button>
                      )}
                      {m.draftStatus === "error" && (
                        <div className="text-[10px] mt-[6px] text-red-500">Couldn&apos;t save — try again.</div>
                      )}
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
              <div ref={bottomRef} />
            </div>

            <div className="p-[16px] border-t border-[var(--rule)] bg-[var(--bg-2)]">
              <div
                className="flex items-end gap-[8px] rounded-[12px] p-[8px] bg-[var(--bg)] border transition-all duration-200 focus-within:border-[var(--ink-3)]"
                style={{ borderColor: "var(--rule)" }}
              >
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask a question, or tell me what you're working on…"
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
                >
                  <Send size={14} />
                </button>
              </div>
              <div className="flex items-center mt-[10px] px-[4px]">
                <span className="font-mono text-[8px] text-[var(--ink-4)] flex items-center gap-[3px]">
                  <CornerDownLeft size={8} /> Enter to send
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
