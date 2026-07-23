"use client";

import { useState, useRef, useCallback } from "react";
import type { FwAccount } from "@/lib/flowise/types";
import { Upload, X, Check, ChevronRight, AlertCircle } from "lucide-react";

const ACCENT = "#16A34A";

interface ParsedRow {
  date: string;
  description: string;
  amount: number;
  raw: string;
}

interface Props {
  accounts: FwAccount[];
  onClose: () => void;
  onImported: (count: number) => void;
}

type Step = "upload" | "map" | "preview" | "importing" | "done";

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  const lines = text.trim().split(/\r?\n/);
  for (const line of lines) {
    const cells: string[] = [];
    let inQuote = false;
    let cur = "";
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuote && line[i + 1] === '"') { cur += '"'; i++; }
        else inQuote = !inQuote;
      } else if (ch === "," && !inQuote) {
        cells.push(cur.trim());
        cur = "";
      } else {
        cur += ch;
      }
    }
    cells.push(cur.trim());
    rows.push(cells);
  }
  return rows;
}

function tryParseAmount(val: string): number | null {
  const cleaned = val.replace(/[₦$,\s]/g, "").replace(/\((\d+(?:\.\d+)?)\)/, "-$1");
  const n = parseFloat(cleaned);
  return isNaN(n) ? null : n;
}

function tryParseDate(val: string): string | null {
  if (!val) return null;
  // YYYY-MM-DD — ISO, pass through directly
  if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
  // DD/MM/YYYY — Nigerian bank default (GTBank, Access, Zenith, Kuda, OPay, etc.)
  const dmy = val.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (dmy) return `${dmy[3]}-${dmy[2]}-${dmy[1]}`;
  // DD-MM-YYYY — hyphen variant used by some exporters
  const dmyHyphen = val.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (dmyHyphen) return `${dmyHyphen[3]}-${dmyHyphen[2]}-${dmyHyphen[1]}`;
  // "15-Jan-2025", "15 Jan 2025" or any locale string — let the engine parse it
  const d = new Date(val);
  if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  return null;
}

export function CSVImportWizard({ accounts, onClose, onImported }: Props): React.ReactElement {
  const [step, setStep] = useState<Step>("upload");
  const [rawRows, setRawRows] = useState<string[][]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [colDate, setColDate] = useState("");
  const [colDesc, setColDesc] = useState("");
  const [colAmount, setColAmount] = useState("");
  const [colCredit, setColCredit] = useState("");
  const [colDebit, setColDebit] = useState("");
  const [useSeparateColumns, setUseSeparateColumns] = useState(false);
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [selectedAccount, setSelectedAccount] = useState(accounts[0]?.id ?? "");
  const [error, setError] = useState<string | null>(null);
  const [importedCount, setImportedCount] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback((file: File): void => {
    if (!file.name.endsWith(".csv") && file.type !== "text/csv") {
      setError("Please upload a CSV file");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const rows = parseCSV(text);
      if (rows.length < 2) { setError("CSV appears empty"); return; }
      setHeaders(rows[0]);
      setRawRows(rows.slice(1).filter((r) => r.some((c) => c)));
      // Auto-detect common column names
      const h = rows[0].map((x) => x.toLowerCase());
      setColDate(rows[0][h.findIndex((x) => x.includes("date"))] ?? "");
      setColDesc(rows[0][h.findIndex((x) => x.includes("desc") || x.includes("narr") || x.includes("detail"))] ?? "");
      const amtIdx = h.findIndex((x) => x === "amount" || x.includes("value"));
      if (amtIdx >= 0) { setColAmount(rows[0][amtIdx]); setUseSeparateColumns(false); }
      else {
        const crIdx = h.findIndex((x) => x.includes("credit") || x.includes("cr"));
        const drIdx = h.findIndex((x) => x.includes("debit") || x.includes("dr"));
        if (crIdx >= 0 && drIdx >= 0) {
          setColCredit(rows[0][crIdx]);
          setColDebit(rows[0][drIdx]);
          setUseSeparateColumns(true);
        }
      }
      setStep("map");
      setError(null);
    };
    reader.readAsText(file);
  }, []);

  const handleDrop = (e: React.DragEvent): void => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleBuildPreview = (): void => {
    const dateIdx = headers.indexOf(colDate);
    const descIdx = headers.indexOf(colDesc);

    if (dateIdx < 0 || descIdx < 0) { setError("Map Date and Description columns first"); return; }
    if (!useSeparateColumns && headers.indexOf(colAmount) < 0) { setError("Map Amount column"); return; }
    if (useSeparateColumns && (headers.indexOf(colCredit) < 0 || headers.indexOf(colDebit) < 0)) { setError("Map Credit and Debit columns"); return; }

    // Hoist column index lookups outside the loop — avoids O(n×m) indexOf per row
    const crIdx = headers.indexOf(colCredit);
    const drIdx = headers.indexOf(colDebit);
    const amtIdx = headers.indexOf(colAmount);

    const rows: ParsedRow[] = [];
    for (const raw of rawRows) {
      const dateVal = raw[dateIdx] ?? "";
      const descVal = raw[descIdx] ?? "";
      const date = tryParseDate(dateVal);
      if (!date || !descVal) continue;

      let amount: number | null = null;
      if (useSeparateColumns) {
        const cr = tryParseAmount(raw[crIdx] ?? "");
        const dr = tryParseAmount(raw[drIdx] ?? "");
        if (cr && cr > 0) amount = cr;
        else if (dr && dr > 0) amount = -dr;
      } else {
        amount = tryParseAmount(raw[amtIdx] ?? "");
      }

      if (amount === null) continue;
      rows.push({ date, description: descVal, amount, raw: raw.join(",") });
    }

    if (rows.length === 0) { setError("No valid rows found. Check column mapping."); return; }
    setParsedRows(rows);
    setStep("preview");
    setError(null);
  };

  const handleImport = async (): Promise<void> => {
    if (!selectedAccount) { setError("Select an account"); return; }
    setStep("importing");
    try {
      const res = await fetch("/api/flowise/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          account_id: selectedAccount,
          rows: parsedRows,
        }),
      });
      const data = await res.json() as { imported?: number; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Import failed");
      setImportedCount(data.imported ?? parsedRows.length);
      setStep("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed");
      setStep("preview");
    }
  };

  const STEPS: Step[] = ["upload", "map", "preview", "done"];
  const stepIdx = STEPS.indexOf(step === "importing" ? "preview" : step);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center px-0 sm:px-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 w-full max-w-[560px] max-h-[90vh] flex flex-col rounded-t-[20px] sm:rounded-2xl overflow-hidden" style={{ background: "var(--bg)", border: "1px solid var(--rule)" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-(--rule) shrink-0">
          <div>
            <h2 className="font-display text-[18px] font-normal tracking-[-0.01em] fvs-text m-0 text-(--ink)">Import CSV</h2>
            <div className="flex items-center gap-2 mt-1">
              {["Upload", "Map", "Preview", "Done"].map((s, i) => (
                <div key={s} className="flex items-center gap-1">
                  <div className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-mono font-bold" style={{ background: i <= stepIdx ? ACCENT : "var(--rule)", color: i <= stepIdx ? "white" : "var(--ink-4)" }}>{i < stepIdx ? "✓" : i + 1}</div>
                  <span className="font-mono text-[9px] text-muted-foreground">{s}</span>
                  {i < 3 && <ChevronRight size={10} className="text-(--ink-4)" />}
                </div>
              ))}
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center border-none bg-transparent cursor-pointer text-muted-foreground"><X size={18} /></button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5">
          {error && (
            <div className="flex items-center gap-2 rounded-lg px-3 py-2.5 mb-4 font-mono text-[12px]" style={{ background: "rgba(220,38,38,0.08)", color: "#DC2626", border: "1px solid rgba(220,38,38,0.2)" }}>
              <AlertCircle size={13} />{error}
            </div>
          )}

          {/* Step: Upload */}
          {step === "upload" && (
            <div
              className="rounded-xl border-2 border-dashed py-12 flex flex-col items-center gap-3 cursor-pointer transition-colors"
              style={{ borderColor: dragOver ? ACCENT : "var(--rule)", background: dragOver ? `${ACCENT}08` : "var(--bg-2)" }}
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onClick={() => fileRef.current?.click()}
            >
              <Upload size={32} style={{ color: ACCENT }} />
              <div className="text-[14px] font-medium text-(--ink)">Drop your bank CSV here</div>
              <div className="text-[12px] text-muted-foreground text-center max-w-[32ch]">Supports GTBank, Access, Zenith, UBA, Kuda, OPay, PalmPay and most Nigerian bank exports</div>
              <div className="font-mono text-[10px] uppercase tracking-widest" style={{ color: ACCENT }}>or click to browse</div>
              <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
            </div>
          )}

          {/* Step: Map */}
          {step === "map" && (
            <div className="space-y-4">
              <div className="text-[13px] text-muted-foreground">Found <strong className="text-(--ink)">{rawRows.length} rows</strong> and <strong className="text-(--ink)">{headers.length} columns</strong>. Map them below.</div>
              {[
                { label: "Date Column", value: colDate, set: setColDate },
                { label: "Description Column", value: colDesc, set: setColDesc },
              ].map(({ label, value, set }) => (
                <div key={label}>
                  <label className="block font-mono text-[10px] tracking-[0.12em] uppercase text-muted-foreground mb-1.5">{label}</label>
                  <select value={value} onChange={(e) => set(e.target.value)} className="w-full h-10 px-3 rounded-lg text-[13px] outline-none bg-(--bg-2) text-(--ink) cursor-pointer" style={{ border: "1.5px solid var(--rule)" }}>
                    <option value="">— Select column —</option>
                    {headers.map((h) => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
              ))}
              <div>
                <label className="flex items-center gap-2 cursor-pointer mb-3">
                  <input type="checkbox" checked={useSeparateColumns} onChange={(e) => setUseSeparateColumns(e.target.checked)} className="w-3.5 h-3.5 rounded" />
                  <span className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground">Separate Credit / Debit columns</span>
                </label>
                {useSeparateColumns ? (
                  <div className="grid grid-cols-2 gap-3">
                    {[["Credit / Income", colCredit, setColCredit], ["Debit / Expense", colDebit, setColDebit]].map(([label, val, set]) => (
                      <div key={label as string}>
                        <label className="block font-mono text-[9px] tracking-widest uppercase text-muted-foreground mb-1">{label as string}</label>
                        <select value={val as string} onChange={(e) => (set as React.Dispatch<React.SetStateAction<string>>)(e.target.value)} className="w-full h-9.5 px-2.5 rounded-lg text-[12px] outline-none bg-(--bg-2) text-(--ink) cursor-pointer" style={{ border: "1.5px solid var(--rule)" }}>
                          <option value="">—</option>
                          {headers.map((h) => <option key={h} value={h}>{h}</option>)}
                        </select>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div>
                    <label className="block font-mono text-[10px] tracking-[0.12em] uppercase text-muted-foreground mb-1.5">Amount Column</label>
                    <select value={colAmount} onChange={(e) => setColAmount(e.target.value)} className="w-full h-10 px-3 rounded-lg text-[13px] outline-none bg-(--bg-2) text-(--ink) cursor-pointer" style={{ border: "1.5px solid var(--rule)" }}>
                      <option value="">— Select column —</option>
                      {headers.map((h) => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>
                )}
              </div>
              <button onClick={handleBuildPreview} className="w-full h-11 rounded-[10px] font-mono text-[11px] tracking-[0.12em] uppercase font-semibold text-white border-none cursor-pointer mt-2" style={{ background: ACCENT }}>
                Preview Import <ChevronRight size={13} className="inline" />
              </button>
            </div>
          )}

          {/* Step: Preview */}
          {step === "preview" && (
            <div className="space-y-4">
              <div>
                <label className="block font-mono text-[10px] tracking-[0.12em] uppercase text-muted-foreground mb-1.5">Import to Account</label>
                <select value={selectedAccount} onChange={(e) => setSelectedAccount(e.target.value)} className="w-full h-10 px-3 rounded-lg text-[13px] outline-none bg-(--bg-2) text-(--ink) cursor-pointer" style={{ border: "1.5px solid var(--rule)" }}>
                  {accounts.map((a) => <option key={a.id} value={a.id}>{a.icon} {a.name}</option>)}
                </select>
              </div>
              <div className="font-mono text-[11px] text-muted-foreground"><strong className="text-(--ink)">{parsedRows.length}</strong> valid transactions found. AI will auto-categorize on import.</div>
              <div className="rounded-[10px] overflow-hidden" style={{ border: "1px solid var(--rule)" }}>
                <div className="grid text-[10px] font-mono uppercase tracking-widest text-(--ink-4) px-3 py-2" style={{ gridTemplateColumns: "100px 1fr 80px", background: "var(--bg-2)" }}>
                  <div>Date</div><div>Description</div><div className="text-right">Amount</div>
                </div>
                <div className="max-h-60 overflow-y-auto divide-y divide-(--rule)">
                  {parsedRows.slice(0, 50).map((r, i) => (
                    <div key={i} className="grid px-3 py-2 text-[12px]" style={{ gridTemplateColumns: "100px 1fr 80px" }}>
                      <div className="font-mono text-[10px] text-muted-foreground">{r.date}</div>
                      <div className="text-(--ink) truncate">{r.description}</div>
                      <div className="font-mono text-right font-semibold" style={{ color: r.amount > 0 ? "#16A34A" : "#EF4444" }}>
                        {r.amount > 0 ? "+" : ""}₦{Math.abs(r.amount).toLocaleString()}
                      </div>
                    </div>
                  ))}
                  {parsedRows.length > 50 && (
                    <div className="px-3 py-2 font-mono text-[10px] text-(--ink-4)">+{parsedRows.length - 50} more rows...</div>
                  )}
                </div>
              </div>
              <button onClick={() => void handleImport()} className="w-full h-12 rounded-[10px] font-mono text-[11px] tracking-[0.12em] uppercase font-semibold text-white border-none cursor-pointer flex items-center justify-center gap-2" style={{ background: ACCENT }}>
                <Check size={14} /> Import {parsedRows.length} Transactions
              </button>
            </div>
          )}

          {/* Step: Importing */}
          {step === "importing" && (
            <div className="py-12 flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-full border-0.75 animate-spin" style={{ borderColor: `${ACCENT}30`, borderTopColor: ACCENT }} />
              <div className="text-[14px] text-(--ink)">Importing & categorizing...</div>
              <div className="text-[12px] text-muted-foreground">AI is categorizing your transactions</div>
            </div>
          )}

          {/* Step: Done */}
          {step === "done" && (
            <div className="py-12 flex flex-col items-center gap-4 text-center">
              <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: `${ACCENT}15` }}>
                <Check size={28} style={{ color: ACCENT }} />
              </div>
              <div className="text-[18px] font-semibold text-(--ink)">{importedCount} transactions imported</div>
              <div className="text-[13px] text-muted-foreground max-w-[32ch]">Categories have been assigned automatically. Review them in your transaction list.</div>
              <button onClick={() => { onImported(importedCount); onClose(); }} className="h-11 px-6 rounded-[10px] font-mono text-[11px] tracking-[0.12em] uppercase font-semibold text-white border-none cursor-pointer" style={{ background: ACCENT }}>
                View Transactions
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
