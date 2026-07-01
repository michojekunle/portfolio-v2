"use client";

import { useState } from "react";
import type { FwAccount, FwCategory } from "@/lib/flowise/types";
import { SYSTEM_CATEGORIES } from "@/lib/flowise/types";
import { Download, FileText, AlertCircle, Check } from "lucide-react";

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
    <div className="px-[40px] pt-[48px] pb-[60px] max-[1024px]:pt-[80px] max-[720px]:px-[20px] max-w-[720px]">
      <h1 className="font-display font-normal text-[36px] leading-[1.05] tracking-[-0.03em] fvs-text m-0 mb-[40px] text-[var(--ink)]">
        Settings
      </h1>

      {/* Export Section */}
      <section className="mb-[40px]">
        <h2 className="font-mono text-[11px] tracking-[0.16em] uppercase text-[var(--ink-3)] mb-[16px]">Export Data</h2>
        <div className="rounded-[14px] px-[24px] py-[22px]" style={{ border: "1px solid var(--rule)", background: "var(--bg-2)" }}>
          <div className="flex items-start gap-[16px] mb-[20px]">
            <div className="w-[40px] h-[40px] rounded-[10px] flex items-center justify-center shrink-0" style={{ background: `${ACCENT}15` }}>
              <Download size={18} style={{ color: ACCENT }} />
            </div>
            <div>
              <div className="text-[14px] font-semibold text-[var(--ink)]">CSV Export</div>
              <div className="text-[12px] text-[var(--ink-3)] mt-[2px]">Download all your transactions as a CSV file — ready for Excel, Sheets, or your accountant.</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-[12px] mb-[16px]">
            <div>
              <label className="block font-mono text-[9px] tracking-[0.12em] uppercase text-[var(--ink-4)] mb-[6px]">From</label>
              <input type="date" value={exportFrom} onChange={(e) => setExportFrom(e.target.value)} max={today} className="w-full h-[40px] px-[12px] rounded-[8px] text-[13px] outline-none bg-[var(--bg)] text-[var(--ink)]" style={{ border: "1.5px solid var(--rule)" }} />
            </div>
            <div>
              <label className="block font-mono text-[9px] tracking-[0.12em] uppercase text-[var(--ink-4)] mb-[6px]">To</label>
              <input type="date" value={exportTo} onChange={(e) => setExportTo(e.target.value)} max={today} className="w-full h-[40px] px-[12px] rounded-[8px] text-[13px] outline-none bg-[var(--bg)] text-[var(--ink)]" style={{ border: "1.5px solid var(--rule)" }} />
            </div>
          </div>
          {exportError && (
            <div className="flex items-center gap-[8px] rounded-[8px] px-[12px] py-[8px] mb-[12px] font-mono text-[11px]" style={{ background: "rgba(220,38,38,0.08)", color: "#DC2626", border: "1px solid rgba(220,38,38,0.2)" }}>
              <AlertCircle size={12} />{exportError}
            </div>
          )}
          {exportSuccess && (
            <div className="flex items-center gap-[8px] rounded-[8px] px-[12px] py-[8px] mb-[12px] font-mono text-[11px]" style={{ background: "rgba(22,163,74,0.08)", color: ACCENT, border: "1px solid rgba(22,163,74,0.2)" }}>
              <Check size={12} /> Export downloaded successfully
            </div>
          )}
          <button onClick={() => void handleExport()} disabled={exporting} className="inline-flex items-center gap-[8px] h-[40px] px-[20px] rounded-[10px] font-mono text-[10px] uppercase tracking-[0.12em] font-semibold text-white border-none cursor-pointer disabled:opacity-60" style={{ background: ACCENT }}>
            {exporting ? <><span className="w-[12px] h-[12px] rounded-full border-[1.5px] border-white/30 border-t-white animate-spin" /> Exporting...</> : <><FileText size={12} /> Download CSV</>}
          </button>
        </div>
      </section>

      {/* Accounts Overview */}
      <section className="mb-[40px]">
        <h2 className="font-mono text-[11px] tracking-[0.16em] uppercase text-[var(--ink-3)] mb-[16px]">Accounts ({accounts.length})</h2>
        <div className="rounded-[14px] overflow-hidden" style={{ border: "1px solid var(--rule)" }}>
          {accounts.length === 0 ? (
            <div className="px-[20px] py-[24px] text-[13px] text-[var(--ink-3)]">No accounts yet. Add one from the Accounts page.</div>
          ) : accounts.map((a, i) => (
            <div key={a.id} className="flex items-center gap-[12px] px-[20px] py-[14px] bg-[var(--bg)] hover:bg-[var(--bg-2)] transition-colors" style={{ borderBottom: i < accounts.length - 1 ? "1px solid var(--rule)" : undefined }}>
              <div className="w-[32px] h-[32px] rounded-[8px] flex items-center justify-center text-[14px] shrink-0" style={{ background: `${a.color}20` }}>{a.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium text-[var(--ink)] truncate">{a.name}</div>
                <div className="font-mono text-[10px] text-[var(--ink-4)]">{a.type}{a.provider ? ` · ${a.provider}` : ""}</div>
              </div>
              <div className="font-mono text-[12px] font-semibold text-[var(--ink)] shrink-0">
                {a.currency} {a.current_balance.toLocaleString("en-NG")}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* System Categories */}
      <section className="mb-[40px]">
        <h2 className="font-mono text-[11px] tracking-[0.16em] uppercase text-[var(--ink-3)] mb-[16px]">Built-in Categories ({SYSTEM_CATEGORIES.length})</h2>
        <div className="rounded-[14px] overflow-hidden" style={{ border: "1px solid var(--rule)" }}>
          <div className="grid grid-cols-2 divide-y divide-[var(--rule)]">
            {SYSTEM_CATEGORIES.map((c) => (
              <div key={c.id} className="flex items-center gap-[10px] px-[16px] py-[10px] bg-[var(--bg)]">
                <div className="w-[28px] h-[28px] rounded-[6px] flex items-center justify-center text-[12px] shrink-0" style={{ background: `${c.color}15` }}>{c.icon}</div>
                <span className="text-[12px] text-[var(--ink-2)] truncate">{c.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* User-created categories */}
      {userCategories.length > 0 && (
        <section className="mb-[40px]">
          <h2 className="font-mono text-[11px] tracking-[0.16em] uppercase text-[var(--ink-3)] mb-[16px]">Custom Categories ({userCategories.length})</h2>
          <div className="rounded-[14px] overflow-hidden" style={{ border: "1px solid var(--rule)" }}>
            {userCategories.map((c, i) => (
              <div key={c.id} className="flex items-center gap-[10px] px-[16px] py-[12px] bg-[var(--bg)]" style={{ borderBottom: i < userCategories.length - 1 ? "1px solid var(--rule)" : undefined }}>
                <div className="w-[28px] h-[28px] rounded-[6px] flex items-center justify-center text-[12px] shrink-0" style={{ background: `${c.color}15` }}>{c.icon}</div>
                <span className="text-[13px] text-[var(--ink)]">{c.name}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Free plan info */}
      <section>
        <h2 className="font-mono text-[11px] tracking-[0.16em] uppercase text-[var(--ink-3)] mb-[16px]">Plan</h2>
        <div className="rounded-[14px] px-[24px] py-[20px]" style={{ border: "1px solid var(--rule)", background: "var(--bg-2)" }}>
          <div className="font-mono text-[10px] uppercase tracking-[0.12em] mb-[12px]" style={{ color: ACCENT }}>Free Tier — Active</div>
          <div className="space-y-[8px]">
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
                <span className="text-[12px] text-[var(--ink-2)]">{feat as string}</span>
                <span className="font-mono text-[10px] text-[var(--ink-3)]">{limit as string}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
