"use client";

import { useState, useEffect, useCallback } from "react";
import { MessageCircle, Copy, Check, Loader2, Unlink, RefreshCw } from "lucide-react";

const ACCENT = "#16A34A";

type Platform = "telegram" | "whatsapp";

interface BotLink {
  platform: Platform;
  chat_id: string | null;
  link_code: string | null;
  code_expires_at: string | null;
  linked_at: string | null;
}

const PLATFORM_META: Record<Platform, { name: string; hint: string }> = {
  telegram: {
    name: "Telegram",
    hint: "Open the bot on Telegram and send /link YOUR-CODE",
  },
  whatsapp: {
    name: "WhatsApp",
    hint: "Message the bot number on WhatsApp: link YOUR-CODE",
  },
};

function PlatformRow({ platform, link, onRefresh }: {
  platform: Platform;
  link: BotLink | null;
  onRefresh: () => void;
}): React.ReactElement {
  const [busy, setBusy] = useState(false);
  const [code, setCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const meta = PLATFORM_META[platform];
  const isLinked = Boolean(link?.chat_id);
  const activeCode = code ?? (link?.link_code && link.code_expires_at && new Date(link.code_expires_at) > new Date() ? link.link_code : null);

  const generateCode = async (): Promise<void> => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/flowise/bot-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(d.error ?? "Failed to generate code");
      }
      const data = await res.json() as { code: string };
      setCode(data.code);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const unlink = async (): Promise<void> => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/flowise/bot-link", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform }),
      });
      if (!res.ok) throw new Error("Failed to unlink");
      setCode(null);
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const copyCode = async (): Promise<void> => {
    if (!activeCode) return;
    try {
      await navigator.clipboard.writeText(platform === "telegram" ? `/link ${activeCode}` : `link ${activeCode}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch (err) {
      console.error("[bot-link] clipboard error:", err);
    }
  };

  return (
    <div className="px-5 py-4 flex flex-col gap-2.5">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[13px] font-medium text-(--ink)">{meta.name}</div>
          <div className="font-mono text-[10px] mt-0.5" style={{ color: isLinked ? ACCENT : "var(--ink-4)" }}>
            {isLinked ? "● Connected" : "○ Not connected"}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isLinked ? (
            <button
              onClick={() => void unlink()}
              disabled={busy}
              className="inline-flex items-center gap-1.5 h-7.5 px-3 rounded-lg font-mono text-[10px] tracking-[0.06em] uppercase cursor-pointer border border-(--rule) bg-transparent text-muted-foreground hover:text-red-500 hover:border-red-300 transition-all disabled:opacity-50"
            >
              {busy ? <Loader2 size={11} className="animate-spin" /> : <Unlink size={11} />}
              Unlink
            </button>
          ) : (
            <button
              onClick={() => void generateCode()}
              disabled={busy}
              className="inline-flex items-center gap-1.5 h-7.5 px-3 rounded-lg font-mono text-[10px] tracking-[0.06em] uppercase cursor-pointer border-none text-white transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: ACCENT }}
            >
              {busy ? <Loader2 size={11} className="animate-spin" /> : activeCode ? <RefreshCw size={11} /> : <MessageCircle size={11} />}
              {activeCode ? "New code" : "Generate code"}
            </button>
          )}
        </div>
      </div>

      {!isLinked && activeCode && (
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => void copyCode()}
            className="inline-flex items-center gap-2 font-mono text-[13px] font-semibold tracking-[0.14em] px-3.5 py-2 rounded-lg cursor-pointer border border-dashed transition-all hover:opacity-80"
            style={{ borderColor: `${ACCENT}60`, background: `${ACCENT}0d`, color: "var(--ink)" }}
            title="Copy link command"
          >
            {activeCode.toUpperCase()}
            {copied ? <Check size={13} style={{ color: ACCENT }} /> : <Copy size={13} className="opacity-50" />}
          </button>
          <span className="text-[11px] text-muted-foreground leading-normal">
            {meta.hint} — expires in 15 minutes.
          </span>
        </div>
      )}

      {error && <div className="text-[11px] text-red-500">{error}</div>}
    </div>
  );
}

export function BotLinkCard(): React.ReactElement {
  const [links, setLinks] = useState<BotLink[]>([]);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async (): Promise<void> => {
    try {
      const res = await fetch("/api/flowise/bot-link");
      if (res.ok) {
        const data = await res.json() as { links: BotLink[] };
        setLinks(data.links);
      }
    } catch (err) {
      console.error("[bot-link] load error:", err);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="rounded-[14px] overflow-hidden" style={{ border: "1px solid var(--rule)" }}>
      <div className="px-5 py-4 border-b border-(--rule) bg-(--bg-2)">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0" style={{ background: `${ACCENT}15` }}>
            <MessageCircle size={18} style={{ color: ACCENT }} />
          </div>
          <div>
            <div className="text-[14px] font-semibold text-(--ink)">Receipt Bots</div>
            <div className="text-[12px] text-muted-foreground mt-0.5 leading-[1.55]">
              Forward bank alerts and receipts to your private bot on Telegram or WhatsApp —
              they're read by AI and logged straight into your transactions.
            </div>
          </div>
        </div>
      </div>

      {!loaded ? (
        <div className="px-5 py-5 flex items-center gap-2 text-[12px] text-muted-foreground">
          <Loader2 size={13} className="animate-spin" /> Loading…
        </div>
      ) : (
        <div className="divide-y divide-(--rule)">
          {(["telegram", "whatsapp"] as const).map((p) => (
            <PlatformRow
              key={p}
              platform={p}
              link={links.find((l) => l.platform === p) ?? null}
              onRefresh={() => void load()}
            />
          ))}
        </div>
      )}
    </div>
  );
}
