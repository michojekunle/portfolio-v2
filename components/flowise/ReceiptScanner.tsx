"use client";

import { useState, useRef, useCallback } from "react";
import { Camera, X, Upload, AlertCircle } from "lucide-react";
import type { FwAccount, FwCategory, FwTransaction } from "@/lib/flowise/types";
import { TransactionForm } from "./TransactionForm";

const ACCENT = "#16A34A";

interface ScannedData {
  amount: number | null;
  description: string | null;
  date: string | null;
  category_id: string | null;
  is_income: boolean | null;
}

interface Props {
  accounts: FwAccount[];
  categories: FwCategory[];
  onClose: () => void;
  onTransactionAdded: (tx: FwTransaction) => void;
}

export function ReceiptScanner({ accounts, categories, onClose, onTransactionAdded }: Props): React.ReactElement {
  const [stage, setStage] = useState<"upload" | "scanning" | "review">("upload");
  const [preview, setPreview] = useState<string | null>(null);
  const [scanned, setScanned] = useState<ScannedData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File): Promise<void> => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.type)) {
      setError("Upload a JPEG, PNG, WebP, or GIF image");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5MB");
      return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    setStage("scanning");
    const fd = new FormData();
    fd.append("image", file);

    try {
      const res = await fetch("/api/flowise/scan", { method: "POST", body: fd });
      const data = await res.json() as { extracted?: ScannedData; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Scan failed");
      setScanned(data.extracted ?? null);
      setStage("review");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to scan image");
      setStage("upload");
    }
  }, []);

  const handleDrop = (e: React.DragEvent): void => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) void handleFile(file);
  };

  // Build pre-fill for TransactionForm
  const prefill = scanned ? {
    amount: scanned.amount !== null ? Math.abs(scanned.amount).toString() : "",
    description: scanned.description ?? "",
    date: scanned.date ?? new Date().toISOString().slice(0, 10),
    category_id: scanned.category_id ?? "",
    isIncome: scanned.is_income ?? false,
  } : null;

  if (stage === "review" && prefill) {
    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center px-0 sm:px-[16px]">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
        <div className="relative z-10 w-full max-w-[480px] max-h-[90vh] flex flex-col rounded-t-[20px] sm:rounded-[16px] overflow-hidden" style={{ background: "var(--bg)", border: "1px solid var(--rule)" }}>
          <div className="flex items-center gap-[10px] px-[20px] py-[14px] border-b border-[var(--rule)] shrink-0" style={{ background: `${ACCENT}08` }}>
            <Camera size={14} style={{ color: ACCENT }} />
            <span className="font-mono text-[10px] uppercase tracking-[0.12em]" style={{ color: ACCENT }}>Receipt Scanned — Review & Confirm</span>
            {preview && (
              <div className="ml-auto w-[36px] h-[36px] rounded-[6px] overflow-hidden shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt="receipt" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
          <div className="overflow-y-auto flex-1">
            <TransactionForm
              accounts={accounts}
              categories={categories}
              prefill={prefill}
              onClose={onClose}
              onCreated={(tx: FwTransaction) => { onTransactionAdded(tx); onClose(); }}
              embedded
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center px-0 sm:px-[16px]">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 w-full max-w-[440px] rounded-t-[20px] sm:rounded-[16px] overflow-hidden" style={{ background: "var(--bg)", border: "1px solid var(--rule)" }}>
        <div className="flex items-center justify-between px-[24px] py-[20px] border-b border-[var(--rule)]">
          <div>
            <h2 className="font-display text-[20px] font-normal tracking-[-0.01em] fvs-text m-0 text-[var(--ink)]">Scan Receipt</h2>
            <div className="text-[12px] text-[var(--ink-3)] mt-[2px]">Upload a bank alert, receipt, or transfer screenshot</div>
          </div>
          <button onClick={onClose} className="w-[32px] h-[32px] rounded-full flex items-center justify-center border-none bg-transparent cursor-pointer text-[var(--ink-3)]"><X size={18} /></button>
        </div>
        <div className="px-[24px] py-[24px]">
          {error && (
            <div className="flex items-center gap-[8px] rounded-[8px] px-[12px] py-[10px] mb-[16px] font-mono text-[12px]" style={{ background: "rgba(220,38,38,0.08)", color: "#DC2626", border: "1px solid rgba(220,38,38,0.2)" }}>
              <AlertCircle size={13} />{error}
            </div>
          )}

          {stage === "upload" && (
            <div
              className="rounded-[12px] border-2 border-dashed py-[48px] flex flex-col items-center gap-[12px] cursor-pointer transition-colors"
              style={{ borderColor: dragOver ? ACCENT : "var(--rule)", background: dragOver ? `${ACCENT}08` : "var(--bg-2)" }}
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onClick={() => fileRef.current?.click()}
            >
              <Camera size={36} style={{ color: ACCENT }} />
              <div className="text-[14px] font-medium text-[var(--ink)]">Upload a screenshot or photo</div>
              <div className="text-[12px] text-[var(--ink-3)] text-center max-w-[30ch]">Bank SMS alerts, transfer receipts, OPay/PalmPay screenshots, paper receipts</div>
              <div className="flex items-center gap-[8px] mt-[4px]">
                <button type="button" className="inline-flex items-center gap-[6px] h-[36px] px-[16px] rounded-full font-mono text-[10px] uppercase tracking-[0.1em] font-semibold text-white border-none cursor-pointer" style={{ background: ACCENT }}>
                  <Upload size={11} /> Choose File
                </button>
              </div>
              <div className="font-mono text-[9px] text-[var(--ink-4)]">JPEG · PNG · WebP · GIF · max 5MB</div>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleFile(f); }} />
            </div>
          )}

          {stage === "scanning" && (
            <div className="py-[48px] flex flex-col items-center gap-[16px]">
              {preview && (
                <div className="w-[80px] h-[80px] rounded-[10px] overflow-hidden mb-[4px]" style={{ border: "2px solid var(--rule)" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={preview} alt="receipt preview" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="w-[40px] h-[40px] rounded-full border-[3px] animate-spin" style={{ borderColor: `${ACCENT}30`, borderTopColor: ACCENT }} />
              <div className="text-[14px] font-medium text-[var(--ink)]">Scanning with AI...</div>
              <div className="text-[12px] text-[var(--ink-3)]">Extracting amount, merchant, date</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
