"use client";

import { useState } from "react";
import type { FwAccount, FwCategory } from "@/lib/flowise/types";
import { SYSTEM_CATEGORIES } from "@/lib/flowise/types";
import { Download, FileText, AlertCircle, Check } from "lucide-react";
import { BotLinkCard } from "./BotLinkCard";

const ACCENT = "#16A34A";

interface Props {
  accounts: FwAccount[];
  categories: FwCategory[];
}

export function SettingsClient({ accounts, categories }: Props): React.ReactElement {
  const today = new Date().toISOString().slice(0, 10);
  const firstOfMonth = today.slice(0, 7) + "-01";

  const [exportFrom, setExportFrom] = useState(firstOfMonth);
  const [exportTo, setExportTo] = useState(today);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportSuccess, setExportSuccess] = useState(false);

  const handleExport = async (): Promise<void> => {
    if (!exportFrom || !exportTo) { setExportError("Select a date range"); return; }
    setExporting(true);
    setExportError(null);
    setExportSuccess(false);
    try {
      const res = await fetch(`/api/flowise/export?from=${exportFrom}&to=${exportTo}`);
      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error ?? "Export failed");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `flowise-${exportFrom}-to-${exportTo}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      setExportSuccess(true);
    } catch (err) {
      setExportError(err instanceof Error ? err.message : "Export failed");
    } finally {
      setExporting(false);
    }
  };

  const userCategories = categories.filter((c) => !c.is_system);

  return (
    <div className="px-10 pt-12 pb-15 max-[1024px]:pt-20 max-[720px]:px-5 max-w-180">
      <h1 className="font-display font-normal text-[36px] leading-[1.05] tracking-[-0.03em] fvs-text m-0 mb-10 text-(--ink)">
        Settings
      </h1>

      {/* Export Section */}
      <section className="mb-10">
        <h2 className="font-mono text-[11px] tracking-[0.16em] uppercase text-muted-foreground mb-4">Export Data</h2>
        <div className="rounded-[14px] px-6 py-5.5" style={{ border: "1px solid var(--rule)", background: "var(--bg-2)" }}>
          <div className="flex items-start gap-4 mb-5">
            <div className="w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0" style={{ background: `${ACCENT}15` }}>
              <Download size={18} style={{ color: ACCENT }} />
            </div>
            <div>
              <div className="text-[14px] font-semibold text-(--ink)">CSV Export</div>
              <div className="text-[12px] text-muted-foreground mt-0.5">Download all your transactions as a CSV file — ready for Excel, Sheets, or your accountant.</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block font-mono text-[9px] tracking-[0.12em] uppercase text-(--ink-4) mb-1.5">From</label>
              <input type="date" value={exportFrom} onChange={(e) => setExportFrom(e.target.value)} max={today} className="w-full h-10 px-3 rounded-lg text-[13px] outline-none bg-(--bg) text-(--ink)" style={{ border: "1.5px solid var(--rule)" }} />
            </div>
            <div>
              <label className="block font-mono text-[9px] tracking-[0.12em] uppercase text-(--ink-4) mb-1.5">To</label>
              <input type="date" value={exportTo} onChange={(e) => setExportTo(e.target.value)} max={today} className="w-full h-10 px-3 rounded-lg text-[13px] outline-none bg-(--bg) text-(--ink)" style={{ border: "1.5px solid var(--rule)" }} />
            </div>
          </div>
          {exportError && (
            <div className="flex items-center gap-2 rounded-lg px-3 py-2 mb-3 font-mono text-[11px]" style={{ background: "rgba(220,38,38,0.08)", color: "#DC2626", border: "1px solid rgba(220,38,38,0.2)" }}>
              <AlertCircle size={12} />{exportError}
            </div>
          )}
          {exportSuccess && (
            <div className="flex items-center gap-2 rounded-lg px-3 py-2 mb-3 font-mono text-[11px]" style={{ background: "rgba(22,163,74,0.08)", color: ACCENT, border: "1px solid rgba(22,163,74,0.2)" }}>
              <Check size={12} /> Export downloaded successfully
            </div>
          )}
          <button onClick={() => void handleExport()} disabled={exporting} className="inline-flex items-center gap-2 h-10 px-5 rounded-[10px] font-mono text-[10px] uppercase tracking-[0.12em] font-semibold text-white border-none cursor-pointer disabled:opacity-60" style={{ background: ACCENT }}>
            {exporting ? <><span className="w-3 h-3 rounded-full border-[1.5px] border-white/30 border-t-white animate-spin" /> Exporting...</> : <><FileText size={12} /> Download CSV</>}
          </button>
        </div>
      </section>

      {/* Chat bots — Telegram / WhatsApp receipt ingestion */}
      <section className="mb-10">
        <h2 className="font-mono text-[11px] tracking-[0.16em] uppercase text-muted-foreground mb-4">Chat Bots</h2>
        <BotLinkCard />
      </section>

      {/* Accounts Overview */}
      <section className="mb-10">
        <h2 className="font-mono text-[11px] tracking-[0.16em] uppercase text-muted-foreground mb-4">Accounts ({accounts.length})</h2>
        <div className="rounded-[14px] overflow-hidden" style={{ border: "1px solid var(--rule)" }}>
          {accounts.length === 0 ? (
            <div className="px-5 py-6 text-[13px] text-muted-foreground">No accounts yet. Add one from the Accounts page.</div>
          ) : accounts.map((a, i) => (
            <div key={a.id} className="flex items-center gap-3 px-5 py-3.5 bg-(--bg) hover:bg-(--bg-2) transition-colors" style={{ borderBottom: i < accounts.length - 1 ? "1px solid var(--rule)" : undefined }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[14px] shrink-0" style={{ background: `${a.color}20` }}>{a.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium text-(--ink) truncate">{a.name}</div>
                <div className="font-mono text-[10px] text-(--ink-4)">{a.type}{a.provider ? ` · ${a.provider}` : ""}</div>
              </div>
              <div className="font-mono text-[12px] font-semibold text-(--ink) shrink-0">
                {a.currency} {a.current_balance.toLocaleString("en-NG")}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* System Categories */}
      <section className="mb-10">
        <h2 className="font-mono text-[11px] tracking-[0.16em] uppercase text-muted-foreground mb-4">Built-in Categories ({SYSTEM_CATEGORIES.length})</h2>
        <div className="rounded-[14px] overflow-hidden" style={{ border: "1px solid var(--rule)" }}>
          <div className="grid grid-cols-2 divide-y divide-(--rule)">
            {SYSTEM_CATEGORIES.map((c) => (
              <div key={c.id} className="flex items-center gap-2.5 px-4 py-2.5 bg-(--bg)">
                <div className="w-7 h-7 rounded-md flex items-center justify-center text-[12px] shrink-0" style={{ background: `${c.color}15` }}>{c.icon}</div>
                <span className="text-[12px] text-secondary-foreground truncate">{c.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* User-created categories */}
      {userCategories.length > 0 && (
        <section className="mb-10">
          <h2 className="font-mono text-[11px] tracking-[0.16em] uppercase text-muted-foreground mb-4">Custom Categories ({userCategories.length})</h2>
          <div className="rounded-[14px] overflow-hidden" style={{ border: "1px solid var(--rule)" }}>
            {userCategories.map((c, i) => (
              <div key={c.id} className="flex items-center gap-2.5 px-4 py-3 bg-(--bg)" style={{ borderBottom: i < userCategories.length - 1 ? "1px solid var(--rule)" : undefined }}>
                <div className="w-7 h-7 rounded-md flex items-center justify-center text-[12px] shrink-0" style={{ background: `${c.color}15` }}>{c.icon}</div>
                <span className="text-[13px] text-(--ink)">{c.name}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Free plan info */}
      <section>
        <h2 className="font-mono text-[11px] tracking-[0.16em] uppercase text-muted-foreground mb-4">Plan</h2>
        <div className="rounded-[14px] px-6 py-5" style={{ border: "1px solid var(--rule)", background: "var(--bg-2)" }}>
          <div className="font-mono text-[10px] uppercase tracking-[0.12em] mb-3" style={{ color: ACCENT }}>Free Tier — Active</div>
          <div className="space-y-2">
            {[
              ["Accounts", "3 max"],
              ["Transactions / month", "100 max"],
              ["Savings goals", "3 active max"],
              ["CSV imports", "1 / month"],
              ["AI insights", "On demand"],
              ["Receipt scan", "5 / month"],
              ["CSV export", "Included"],
            ].map(([feat, limit]) => (
              <div key={feat as string} className="flex items-center justify-between">
                <span className="text-[12px] text-secondary-foreground">{feat as string}</span>
                <span className="font-mono text-[10px] text-muted-foreground">{limit as string}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
