"use client";

import { useState, useCallback } from "react";
import type { FwAccount, FwCategory } from "@/lib/flowise/types";
import { NIGERIAN_PROVIDERS, FREE_ACCOUNT_LIMIT } from "@/lib/flowise/types";
import { formatCurrency } from "@/lib/flowise/calculator";
import { usePrivacy, Amount } from "@/components/flowise/PrivacyProvider";
import { Plus, X, Check, Landmark, Wallet, Coins, TrendingUp, CreditCard } from "lucide-react";

const ACCENT = "#16A34A";

const ACCOUNT_ICONS: Record<string, string> = {
  bank: "🏦", wallet: "📱", cash: "💵", investment: "📈", credit: "💳",
};
const ACCOUNT_COLORS = ["#16A34A","#3B82F6","#8B5CF6","#F97316","#EC4899","#0EA5E9","#F59E0B","#EF4444","#6B7280","#0D9488"];

interface Props {
  accounts: FwAccount[];
  categories: FwCategory[];
}

export function AccountsClient({ accounts: initialAccounts }: Props): React.ReactElement {
  const { hidden } = usePrivacy();
const [accounts, setAccounts] = useState(initialAccounts);
  const [showForm, setShowForm] = useState(false);

  const handleCreated = useCallback((account: FwAccount): void => {
    setAccounts((prev) => [...prev, account]);
    setShowForm(false);
  }, []);

  const atLimit = accounts.length >= FREE_ACCOUNT_LIMIT;

  return (
    <div className="px-[40px] pt-[48px] pb-[60px] max-[1024px]:pt-[80px] max-[720px]:px-[20px]">
      <div className="flex items-center justify-between mb-[32px] gap-[16px] flex-wrap">
        <h1 className="font-display font-normal text-[36px] leading-[1.05] tracking-[-0.03em] fvs-text m-0 text-[var(--ink)]">
          Accounts
        </h1>
        <button
          onClick={() => setShowForm(true)}
          disabled={atLimit}
          className="inline-flex items-center gap-[8px] h-[40px] px-[18px] rounded-full font-mono text-[10px] uppercase tracking-[0.14em] font-semibold text-white border-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: ACCENT }}
          title={atLimit ? `Free plan: max ${FREE_ACCOUNT_LIMIT} accounts` : undefined}
        >
          <Plus size={13} /> Add Account
        </button>
      </div>

      {atLimit && (
        <div className="mb-[24px] rounded-[10px] px-[16px] py-[12px] font-mono text-[12px]" style={{ background: "rgba(22,163,74,0.08)", color: ACCENT, border: "1px solid rgba(22,163,74,0.2)" }}>
          Free plan limit: {FREE_ACCOUNT_LIMIT} accounts. Upgrade for unlimited.
        </div>
      )}

      {accounts.length === 0 ? (
        <div className="rounded-[12px] py-[60px] text-center" style={{ border: "1px dashed var(--rule)" }}>
          <div className="text-[40px] mb-[12px]">🏦</div>
          <div className="text-[15px] font-medium text-[var(--ink)] mb-[6px]">No accounts yet</div>
          <div className="text-[13px] text-[var(--ink-3)] mb-[20px]">Add your bank, wallet, or cash account to start tracking.</div>
          <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-[6px] h-[36px] px-[16px] rounded-full font-mono text-[10px] uppercase tracking-[0.12em] font-semibold text-white border-none cursor-pointer" style={{ background: ACCENT }}>
            <Plus size={12} /> Add Account
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 max-[900px]:grid-cols-1 gap-[16px]">
          {accounts.map((account) => (
            <AccountCard key={account.id} account={account} />
          ))}
        </div>
      )}

      {showForm && (
        <AddAccountForm onCreated={handleCreated} onClose={() => setShowForm(false)} />
      )}
    </div>
  );
}

function AccountCard({ account }: { account: FwAccount }): React.ReactElement {
  const { hidden } = usePrivacy();

  const currencySymbols: Record<string, string> = { NGN: "₦", USD: "$", GBP: "£", EUR: "€", GHS: "₵", KES: "KSh" };
  const symbol = currencySymbols[account.currency] ?? account.currency;
  const isPositive = account.current_balance >= 0;

  return (
    <div className="rounded-[14px] px-[24px] py-[20px]" style={{ border: "1px solid var(--rule)", background: "var(--bg-2)" }}>
      <div className="flex items-start justify-between mb-[16px]">
        <div className="w-[44px] h-[44px] rounded-[10px] flex items-center justify-center text-[20px]" style={{ background: `${account.color}18` }}>
          {account.icon}
        </div>
        <span className="font-mono text-[9px] tracking-[0.1em] uppercase px-[8px] py-[3px] rounded-full" style={{ background: "var(--bg)", border: "1px solid var(--rule)", color: "var(--ink-3)" }}>
          {account.type}
        </span>
      </div>
      <div className="text-[16px] font-medium text-[var(--ink)] mb-[2px]">{account.name}</div>
      {account.provider && <div className="font-mono text-[10px] text-[var(--ink-3)] mb-[16px]">{account.provider}</div>}
      <div className="font-display text-[28px] font-normal tracking-[-0.02em] fvs-text" style={{ color: isPositive ? "var(--ink)" : "#DC2626" }}>
        <Amount value={account.current_balance} currency={account.currency} />
      </div>
      <div className="font-mono text-[10px] text-[var(--ink-4)] mt-[4px]">{account.currency} · current balance</div>
    </div>
  );
}

function AddAccountForm({
  onCreated,
  onClose,
}: {
  onCreated: (a: FwAccount) => void;
  onClose: () => void;
}): React.ReactElement {
  const [name, setName] = useState("");
  const [provider, setProvider] = useState("");
  const [type, setType] = useState<FwAccount["type"]>("bank");
  const [currency, setCurrency] = useState<FwAccount["currency"]>("NGN");
  const [balance, setBalance] = useState("0");
  const [color, setColor] = useState(ACCOUNT_COLORS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const icon = ACCOUNT_ICONS[type] ?? "🏦";

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError(null);
    const startingBalance = parseFloat(balance) || 0;

    setLoading(true);
    try {
      const res = await fetch("/api/flowise/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), provider: provider.trim() || null, type, currency, starting_balance: startingBalance, color, icon }),
      });
      const data = await res.json() as { account?: FwAccount; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Failed to create account");
      onCreated(data.account!);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center px-0 sm:px-[16px]">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 w-full max-w-[460px] rounded-t-[20px] sm:rounded-[16px] overflow-hidden" style={{ background: "var(--bg)", border: "1px solid var(--rule)" }}>
        <div className="flex items-center justify-between px-[24px] py-[20px] border-b border-[var(--rule)]">
          <h2 className="font-display text-[20px] font-normal tracking-[-0.01em] fvs-text m-0 text-[var(--ink)]">Add Account</h2>
          <button onClick={onClose} className="w-[32px] h-[32px] rounded-full flex items-center justify-center border-none bg-transparent cursor-pointer text-[var(--ink-3)] hover:bg-[var(--bg-2)]" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-[24px] py-[20px] space-y-[16px]">
          {/* Account type */}
          <div>
            <label className="block font-mono text-[10px] tracking-[0.12em] uppercase text-[var(--ink-3)] mb-[8px]">Account Type</label>
            <div className="grid grid-cols-5 gap-[8px]">
              {(["bank","wallet","cash","investment","credit"] as FwAccount["type"][]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className="flex flex-col items-center gap-[4px] py-[10px] rounded-[8px] border-none cursor-pointer transition-all"
                  style={type === t ? { background: `${ACCENT}15`, border: `1.5px solid ${ACCENT}`, color: ACCENT } : { background: "var(--bg-2)", border: "1.5px solid var(--rule)", color: "var(--ink-3)" }}
                >
                  <span className="text-[18px]">{ACCOUNT_ICONS[t]}</span>
                  <span className="font-mono text-[8px] tracking-[0.06em] uppercase">{t}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block font-mono text-[10px] tracking-[0.12em] uppercase text-[var(--ink-3)] mb-[8px]">Account Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. GTBank Main, OPay Wallet" required maxLength={60} className="w-full h-[44px] px-[14px] rounded-[8px] text-[14px] outline-none bg-[var(--bg-2)] text-[var(--ink)]" style={{ border: "1.5px solid var(--rule)" }} />
          </div>

          {/* Provider */}
          <div>
            <label className="block font-mono text-[10px] tracking-[0.12em] uppercase text-[var(--ink-3)] mb-[8px]">Provider <span className="normal-case tracking-normal text-[var(--ink-4)]">(optional)</span></label>
            <select value={provider} onChange={(e) => setProvider(e.target.value)} className="w-full h-[44px] px-[12px] rounded-[8px] text-[14px] outline-none bg-[var(--bg-2)] text-[var(--ink)] cursor-pointer" style={{ border: "1.5px solid var(--rule)" }}>
              <option value="">Select provider</option>
              {NIGERIAN_PROVIDERS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          {/* Currency + Balance */}
          <div className="grid grid-cols-2 gap-[12px]">
            <div>
              <label className="block font-mono text-[10px] tracking-[0.12em] uppercase text-[var(--ink-3)] mb-[8px]">Currency</label>
              <select value={currency} onChange={(e) => setCurrency(e.target.value as FwAccount["currency"])} className="w-full h-[44px] px-[12px] rounded-[8px] text-[14px] outline-none bg-[var(--bg-2)] text-[var(--ink)] cursor-pointer" style={{ border: "1.5px solid var(--rule)" }}>
                {["NGN","USD","GBP","EUR","GHS","KES"].map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block font-mono text-[10px] tracking-[0.12em] uppercase text-[var(--ink-3)] mb-[8px]">Starting Balance</label>
              <input type="number" value={balance} onChange={(e) => setBalance(e.target.value)} min="0" step="0.01" className="w-full h-[44px] px-[14px] rounded-[8px] text-[14px] outline-none bg-[var(--bg-2)] text-[var(--ink)]" style={{ border: "1.5px solid var(--rule)" }} />
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="block font-mono text-[10px] tracking-[0.12em] uppercase text-[var(--ink-3)] mb-[8px]">Color</label>
            <div className="flex gap-[8px] flex-wrap">
              {ACCOUNT_COLORS.map((c) => (
                <button key={c} type="button" onClick={() => setColor(c)} className="w-[28px] h-[28px] rounded-full border-none cursor-pointer transition-transform hover:scale-110" style={{ background: c, outline: color === c ? `3px solid ${c}` : undefined, outlineOffset: "2px" }} aria-label={c} />
              ))}
            </div>
          </div>

          {error && <div className="rounded-[8px] px-[14px] py-[10px] text-[13px] font-mono" style={{ background: "rgba(220,38,38,0.08)", color: "#DC2626", border: "1px solid rgba(220,38,38,0.2)" }}>{error}</div>}

          <button type="submit" disabled={loading} className="w-full h-[48px] rounded-[10px] font-mono text-[11px] tracking-[0.14em] uppercase font-semibold text-white border-none cursor-pointer disabled:opacity-60 flex items-center justify-center gap-[8px]" style={{ background: ACCENT }}>
            {loading ? <span className="w-[16px] h-[16px] rounded-full border-[2px] border-white/30 border-t-white animate-spin" aria-hidden="true" /> : <><Check size={14} /> Add Account</>}
          </button>
        </form>
      </div>
    </div>
  );
}
