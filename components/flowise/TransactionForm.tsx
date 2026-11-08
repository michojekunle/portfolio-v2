"use client";

import { useState, useRef, useEffect } from "react";
import type { FwAccount, FwCategory, FwTransaction } from "@/lib/flowise/types";
import { CURRENCY_SYMBOLS } from "@/lib/flowise/types";
import { X, Check } from "lucide-react";

const ACCENT = "#16A34A";

interface Prefill {
  amount: string;
  description: string;
  date: string;
  category_id: string;
  isIncome: boolean;
}

interface Props {
  accounts: FwAccount[];
  categories: FwCategory[];
  onCreated: (tx: FwTransaction) => void;
  onClose: () => void;
  defaultAccountId?: string;
  prefill?: Prefill;
  embedded?: boolean;
}

type TxType = "expense" | "income";

export function TransactionForm({
  accounts,
  categories,
  onCreated,
  onClose,
  defaultAccountId,
  prefill,
  embedded = false,
}: Props): React.ReactElement {
  const [txType, setTxType] = useState<TxType>(prefill?.isIncome ? "income" : "expense");
  const [amount, setAmount] = useState(prefill?.amount ?? "");
  const [description, setDescription] = useState(prefill?.description ?? "");
  const [accountId, setAccountId] = useState(defaultAccountId ?? accounts[0]?.id ?? "");
  const [categoryId, setCategoryId] = useState(prefill?.category_id ?? "");
  const [date, setDate] = useState(prefill?.date ?? new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const amountRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    amountRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError(null);

    const parsedAmount = parseFloat(amount.replace(/,/g, ""));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Enter a valid amount greater than 0");
      return;
    }
    if (!accountId) {
      setError("Select an account");
      return;
    }

    setLoading(true);
    try {
      const signedAmount = txType === "expense" ? -parsedAmount : parsedAmount;
      const submit = async (allowDuplicate: boolean): Promise<Response> =>
        fetch("/api/flowise/transactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            account_id: accountId,
            amount: signedAmount,
            category_id: categoryId || null,
            date,
            description: description.trim() || (txType === "expense" ? "Expense" : "Income"),
            note: note.trim() || null,
            tags: [],
            source: "manual",
            allow_duplicate: allowDuplicate,
          }),
        });

      let res = await submit(false);
      let data: unknown = await res.json();

      if (res.status === 409 && (data as { error?: string }).error === "duplicate") {
        const message = (data as { message?: string }).message ?? "This looks like a duplicate.";
        if (!confirm(`${message} Add it anyway?`)) {
          setLoading(false);
          return;
        }
        res = await submit(true);
        data = await res.json();
      }

      if (!res.ok) {
        const errData = data as { error?: string };
        throw new Error(errData.error ?? "Failed to create transaction");
      }

      const { transaction } = data as { transaction: FwTransaction };
      // Attach local account/category info for immediate display
      const account = accounts.find((a) => a.id === accountId);
      const cat = categories.find((c) => c.id === categoryId);
      onCreated({
        ...transaction,
        account: account ? { name: account.name, color: account.color, currency: account.currency, icon: account.icon } : undefined,
        category: cat ? { name: cat.name, icon: cat.icon, color: cat.color } : undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const activeCategories = categories.filter((c) =>
    txType === "income"
      ? ["salary", "business", "investment_in", "transfer", "other"].includes(c.id)
      : !["salary", "business", "investment_in"].includes(c.id),
  );

  const selectedAccount = accounts.find((a) => a.id === accountId);
  const symbol = CURRENCY_SYMBOLS[selectedAccount?.currency ?? "NGN"] ?? "₦";

  const formContent = (
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4.5">
          {/* Type toggle */}
          <div
            className="flex rounded-[10px] p-0.75"
            style={{ background: "var(--bg-2)" }}
          >
            {(["expense", "income"] as TxType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => { setTxType(t); setCategoryId(""); }}
                className="flex-1 h-9 rounded-lg font-mono text-[11px] uppercase tracking-widest font-semibold border-none cursor-pointer transition-all duration-150"
                style={
                  txType === t
                    ? {
                        background: t === "expense" ? "#DC2626" : ACCENT,
                        color: "#fff",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.12)",
                      }
                    : { background: "transparent", color: "var(--ink-3)" }
                }
              >
                {t === "expense" ? "− Expense" : "+ Income"}
              </button>
            ))}
          </div>

          {/* Amount */}
          <div>
            <label className="block font-mono text-[10px] tracking-[0.12em] uppercase text-muted-foreground mb-2">
              Amount
            </label>
            <div className="relative">
              <span
                className="absolute left-4 top-1/2 -translate-y-1/2 font-display text-[20px] fvs-text"
                style={{ color: "var(--ink-3)" }}
              >
                {symbol}
              </span>
              <input
                ref={amountRef}
                type="number"
                inputMode="decimal"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
                className="w-full h-14 pl-10 pr-4 rounded-[10px] font-display text-[24px] fvs-text outline-none transition-all bg-(--bg-2) text-(--ink)"
                style={{ border: "1.5px solid var(--rule)" }}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-mono text-[10px] tracking-[0.12em] uppercase text-muted-foreground mb-2">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={txType === "expense" ? "e.g. Groceries at Shoprite" : "e.g. Freelance payment"}
              maxLength={200}
              className="w-full h-11 px-3.5 rounded-lg text-[14px] outline-none bg-(--bg-2) text-(--ink)"
              style={{ border: "1.5px solid var(--rule)" }}
            />
          </div>

          {/* Category + Account row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-mono text-[10px] tracking-[0.12em] uppercase text-muted-foreground mb-2">
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full h-11 px-3 rounded-lg text-[14px] outline-none bg-(--bg-2) text-(--ink) cursor-pointer"
                style={{ border: "1.5px solid var(--rule)" }}
              >
                <option value="">Uncategorized</option>
                {activeCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-mono text-[10px] tracking-[0.12em] uppercase text-muted-foreground mb-2">
                Account
              </label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                required
                className="w-full h-11 px-3 rounded-lg text-[14px] outline-none bg-(--bg-2) text-(--ink) cursor-pointer"
                style={{ border: "1.5px solid var(--rule)" }}
              >
                {accounts.length === 0 && (
                  <option value="" disabled>No accounts</option>
                )}
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.icon} {a.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block font-mono text-[10px] tracking-[0.12em] uppercase text-muted-foreground mb-2">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full h-11 px-3.5 rounded-lg text-[14px] outline-none bg-(--bg-2) text-(--ink)"
              style={{ border: "1.5px solid var(--rule)" }}
            />
          </div>

          {/* Note (optional) */}
          <div>
            <label className="block font-mono text-[10px] tracking-[0.12em] uppercase text-muted-foreground mb-2">
              Note <span className="normal-case tracking-normal text-(--ink-4)">(optional)</span>
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Any extra detail…"
              maxLength={500}
              className="w-full h-11 px-3.5 rounded-lg text-[14px] outline-none bg-(--bg-2) text-(--ink)"
              style={{ border: "1.5px solid var(--rule)" }}
            />
          </div>

          {error && (
            <div
              className="rounded-lg px-3.5 py-2.5 text-[13px] font-mono"
              style={{ background: "rgba(220,38,38,0.08)", color: "#DC2626", border: "1px solid rgba(220,38,38,0.2)" }}
            >
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || accounts.length === 0}
            className="w-full h-13 rounded-[10px] font-mono text-[11px] tracking-[0.14em] uppercase font-semibold text-white transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed border-none cursor-pointer flex items-center justify-center gap-2"
            style={{ background: txType === "expense" ? "#DC2626" : ACCENT }}
          >
            {loading ? (
              <span
                className="w-4 h-4 rounded-full border-0.5 border-white/30 border-t-white animate-spin"
                aria-hidden="true"
              />
            ) : (
              <>
                <Check size={14} />
                {txType === "expense" ? "Log Expense" : "Log Income"}
              </>
            )}
          </button>

          {accounts.length === 0 && (
            <p className="text-center text-[12px] text-muted-foreground m-0">
              You need to add an account first.
            </p>
          )}
        </form>
  );

  if (embedded) return formContent;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center px-0 sm:px-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 w-full max-w-[480px] rounded-t-[20px] sm:rounded-2xl overflow-hidden" style={{ background: "var(--bg)", border: "1px solid var(--rule)" }}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-(--rule)">
          <h2 className="font-display text-[20px] font-normal tracking-[-0.01em] fvs-text m-0 text-(--ink)">Add Transaction</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center border-none bg-transparent cursor-pointer text-muted-foreground hover:bg-(--bg-2) transition-colors" aria-label="Close"><X size={18} /></button>
        </div>
        {formContent}
      </div>
    </div>
  );
}
