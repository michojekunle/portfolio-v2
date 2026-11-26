"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  ShieldCheck,
  Shield,
  Sparkles,
  ArrowRight,
  TrendingDown,
  Calendar,
  Wallet,
  Clock,
  CheckCircle2,
  FileText,
  AlertTriangle,
} from "lucide-react";
import { CURRENCIES, CURRENCY_SYMBOLS, type Currency } from "@/lib/flowise/types";

interface ParsedAlert {
  raw: string;
  amount: number;
  type: "debit" | "credit";
  category: string;
  bank?: string;
  newBalance?: number;
}

export function RunwayCalculator(): React.ReactElement {
  const [currency, setCurrency] = useState<Currency>("NGN");
  const [savings, setSavings] = useState<number>(1500000);
  const [burnRate, setBurnRate] = useState<number>(350000);
  const [income, setIncome] = useState<number>(0);

  // SMS alert parser state
  const [rawSms, setRawSms] = useState<string>("");
  const [parsedAlert, setParsedAlert] = useState<ParsedAlert | null>(null);

  // Waitlist state
  const [email, setEmail] = useState("");
  const [waitlistSuccess, setWaitlistSuccess] = useState(false);

  const symbol = CURRENCY_SYMBOLS[currency];

  // Instant heuristic parser for bank SMS alerts
  const handleParseAlert = (text: string): void => {
    setRawSms(text);
    if (!text.trim()) {
      setParsedAlert(null);
      return;
    }

    const lower = text.toLowerCase();
    const isDebit = lower.includes("debit") || lower.includes("dr") || lower.includes("sent") || lower.includes("paid") || lower.includes("purchase");
    const isCredit = lower.includes("credit") || lower.includes("cr") || lower.includes("received");

    // Extract amount: e.g. NGN 25,000.00 or $450 or ₦12,500
    const amtMatch = text.match(/(?:ngn|usd|eur|gbp|₦|\$|£|€)?\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{2})?|[0-9]+(?:\.[0-9]{2})?)/i);
    let amount = 0;
    if (amtMatch && amtMatch[1]) {
      amount = parseFloat(amtMatch[1].replace(/,/g, ""));
    }

    // Extract balance if present: e.g. Bal: NGN 450,000
    const balMatch = text.match(/(?:bal|balance|avl bal)[\s:]*(?:ngn|usd|eur|gbp|₦|\$|£|€)?\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{2})?|[0-9]+(?:\.[0-9]{2})?)/i);
    let newBalance: number | undefined;
    if (balMatch && balMatch[1]) {
      newBalance = parseFloat(balMatch[1].replace(/,/g, ""));
    }

    // Detect Bank
    let bank = "Bank";
    if (lower.includes("opay")) bank = "OPay";
    else if (lower.includes("gtbank") || lower.includes("gtb")) bank = "GTBank";
    else if (lower.includes("kuda")) bank = "Kuda";
    else if (lower.includes("zenith")) bank = "Zenith Bank";
    else if (lower.includes("access")) bank = "Access Bank";
    else if (lower.includes("palmpay")) bank = "PalmPay";
    else if (lower.includes("moniepoint")) bank = "Moniepoint";

    // Guess category
    let category = "General Expense";
    if (lower.includes("uber") || lower.includes("bolt") || lower.includes("fuel") || lower.includes("transport")) category = "Transport";
    else if (lower.includes("food") || lower.includes("chowdeck") || lower.includes("restaurant") || lower.includes("market") || lower.includes("kitchen")) category = "Food & Dining";
    else if (lower.includes("airtime") || lower.includes("data") || lower.includes("mtn") || lower.includes("airtel")) category = "Airtime & Data";
    else if (lower.includes("netflix") || lower.includes("spotify") || lower.includes("subscription") || lower.includes("apple")) category = "Subscriptions";
    else if (lower.includes("rent") || lower.includes("electricity") || lower.includes("nepa") || lower.includes("power")) category = "Housing & Utilities";

    if (amount > 0) {
      setParsedAlert({
        raw: text,
        amount,
        type: isDebit ? "debit" : isCredit ? "credit" : "debit",
        category,
        bank,
        newBalance,
      });
    } else {
      setParsedAlert(null);
    }
  };

  const applyParsedAlert = (): void => {
    if (!parsedAlert) return;
    if (parsedAlert.type === "debit") {
      setBurnRate((prev) => prev + parsedAlert.amount);
    } else {
      setIncome((prev) => prev + parsedAlert.amount);
    }
    if (parsedAlert.newBalance && parsedAlert.newBalance > 0) {
      setSavings(parsedAlert.newBalance);
    }
    setRawSms("");
    setParsedAlert(null);
  };

  // Runway math
  const netMonthlyBurn = Math.max(0, burnRate - income);
  const runwayMonths = useMemo(() => {
    if (netMonthlyBurn <= 0) return 99; // Infinite runway
    return parseFloat((savings / netMonthlyBurn).toFixed(1));
  }, [savings, netMonthlyBurn]);

  const depletionDate = useMemo(() => {
    if (netMonthlyBurn <= 0) return "Indefinite (Cash flow positive)";
    const d = new Date();
    const days = Math.round(runwayMonths * 30.4);
    d.setDate(d.getDate() + days);
    return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  }, [runwayMonths, netMonthlyBurn]);

  const handleWaitlistSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;
    try {
      const existing = JSON.parse(localStorage.getItem("flowise_waitlist") || "[]");
      existing.push({ email, currency, runwayMonths, submittedAt: Date.now() });
      localStorage.setItem("flowise_waitlist", JSON.stringify(existing));
    } catch {
      // ignore localstorage errors
    }
    setWaitlistSuccess(true);
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8 animate-fade-in">
      {/* Eyebrow and Headline */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full font-mono text-[10px] tracking-widest uppercase font-semibold border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <Sparkles size={12} />
          <span>Zero Bookkeeping · Instant Clarity</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-normal text-(--ink) m-0 tracking-tight">
          How many months of freedom <em className="italic text-emerald-600 dark:text-emerald-400">do you have?</em>
        </h1>
        <p className="text-sm sm:text-base text-secondary-foreground max-w-xl mx-auto leading-relaxed m-0">
          No bank logins, no tedious spreadsheets. Calculate your exact financial runway and paste bank alerts to detect leakage in seconds.
        </p>
      </div>

      {/* Main Calculator Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Left: Input Card */}
        <div className="p-6 rounded-3xl border border-(--rule) bg-(--bg-2) space-y-5 shadow-sm">
          <div className="flex items-center justify-between border-b pb-3 border-(--rule)">
            <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
              Financial Inputs
            </span>
            <div className="flex items-center gap-1">
              {CURRENCIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCurrency(c)}
                  className="px-2 py-1 rounded text-[10px] font-mono font-bold transition-colors cursor-pointer"
                  style={
                    currency === c
                      ? { background: "#16A34A", color: "#fff" }
                      : { background: "var(--bg)", color: "var(--ink-3)" }
                  }
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5">
                Total Liquid Savings ({symbol})
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-muted-foreground font-mono font-bold text-sm">
                  {symbol}
                </span>
                <input
                  type="number"
                  value={savings}
                  onChange={(e) => setSavings(Math.max(0, Number(e.target.value)))}
                  className="w-full h-10 pl-9 pr-3 rounded-xl border border-(--rule) bg-(--bg) text-(--ink) text-sm font-semibold outline-none focus:border-emerald-500"
                />
              </div>
              <span className="text-[10px] text-muted-foreground font-mono mt-1 block">
                Cash across bank accounts, wallets, emergency funds.
              </span>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5">
                Monthly Living Burn Rate ({symbol})
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-muted-foreground font-mono font-bold text-sm">
                  {symbol}
                </span>
                <input
                  type="number"
                  value={burnRate}
                  onChange={(e) => setBurnRate(Math.max(0, Number(e.target.value)))}
                  className="w-full h-10 pl-9 pr-3 rounded-xl border border-(--rule) bg-(--bg) text-(--ink) text-sm font-semibold outline-none focus:border-emerald-500"
                />
              </div>
              <span className="text-[10px] text-muted-foreground font-mono mt-1 block">
                Rent, groceries, utilities, subscriptions, recurring debt.
              </span>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5">
                Expected Monthly Side Income ({symbol}) <span className="opacity-60">(optional)</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-muted-foreground font-mono font-bold text-sm">
                  {symbol}
                </span>
                <input
                  type="number"
                  value={income}
                  onChange={(e) => setIncome(Math.max(0, Number(e.target.value)))}
                  className="w-full h-10 pl-9 pr-3 rounded-xl border border-(--rule) bg-(--bg) text-(--ink) text-sm font-semibold outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Quick Bank Alert Parser Box */}
          <div className="pt-2 border-t border-(--rule) space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                <FileText size={12} />
                <span>Bank Alert SMS Parser</span>
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">Paste &amp; Auto-Extract</span>
            </div>

            <textarea
              rows={2}
              value={rawSms}
              onChange={(e) => handleParseAlert(e.target.value)}
              placeholder="Paste raw bank alert SMS (e.g. 'Debit: NGN 25,000.00 Desc: POS/UBER Bal: 1,475,000')"
              className="w-full p-2.5 rounded-xl border border-(--rule) bg-(--bg) text-(--ink) text-xs font-mono outline-none resize-none focus:border-emerald-500"
            />

            {parsedAlert && (
              <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-between text-xs animate-fade-in">
                <div>
                  <div className="font-semibold text-emerald-700 dark:text-emerald-300">
                    Detected: {parsedAlert.bank} {parsedAlert.type.toUpperCase()}
                  </div>
                  <div className="text-[11px] text-muted-foreground font-mono">
                    {symbol}
                    {parsedAlert.amount.toLocaleString()} · {parsedAlert.category}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={applyParsedAlert}
                  className="px-2.5 py-1.5 rounded-lg font-mono text-[10px] font-bold uppercase text-white bg-emerald-600 hover:bg-emerald-500 cursor-pointer transition-colors"
                >
                  Apply to Burn
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right: The Runway Clock & Health Assessment */}
        <div className="p-6 sm:p-8 rounded-3xl border border-(--rule) bg-(--bg-2) space-y-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b pb-3 border-(--rule)">
              <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
                <Clock size={13} />
                <span>Runway Projection</span>
              </span>
              <span className="font-mono text-[10px] px-2 py-0.5 rounded font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                Live Analysis
              </span>
            </div>

            {/* The Big Clock Number */}
            <div className="py-6 text-center space-y-2">
              <div className="text-5xl sm:text-6xl font-display font-bold tracking-tight text-(--ink)">
                {runwayMonths >= 99 ? "∞" : runwayMonths}
                <span className="text-xl sm:text-2xl font-mono text-emerald-600 dark:text-emerald-400 font-normal ml-2">
                  Months
                </span>
              </div>
              <p className="text-xs font-mono text-muted-foreground m-0">
                Of complete financial freedom without new income
              </p>
            </div>

            {/* Metrics Breakdown Cards */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 rounded-2xl border border-(--rule) bg-(--bg) space-y-1">
                <div className="font-mono text-[10px] uppercase text-muted-foreground">Depletion Date</div>
                <div className="text-sm font-semibold text-(--ink) flex items-center gap-1">
                  <Calendar size={13} className="text-emerald-500" />
                  <span>{depletionDate}</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl border border-(--rule) bg-(--bg) space-y-1">
                <div className="font-mono text-[10px] uppercase text-muted-foreground">Net Monthly Burn</div>
                <div className="text-sm font-semibold text-(--ink) flex items-center gap-1">
                  <TrendingDown size={13} className="text-amber-500" />
                  <span>
                    {symbol}
                    {netMonthlyBurn.toLocaleString()}/mo
                  </span>
                </div>
              </div>
            </div>

            {/* Status Indicator */}
            <div
              className="p-3.5 rounded-2xl border flex items-start gap-3 text-xs leading-relaxed"
              style={
                runwayMonths >= 6
                  ? { borderColor: "rgba(16,185,129,0.3)", background: "rgba(16,185,129,0.08)", color: "#10b981" }
                  : runwayMonths >= 3
                  ? { borderColor: "rgba(245,158,11,0.3)", background: "rgba(245,158,11,0.08)", color: "#f59e0b" }
                  : { borderColor: "rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.08)", color: "#ef4444" }
              }
            >
              {runwayMonths >= 6 ? (
                <ShieldCheck size={20} className="shrink-0 mt-0.5" />
              ) : runwayMonths >= 3 ? (
                <Shield size={20} className="shrink-0 mt-0.5" />
              ) : (
                <ShieldAlert size={20} className="shrink-0 mt-0.5" />
              )}
              <div>
                <strong>
                  {runwayMonths >= 6
                    ? "Healthy Runway Buffer:"
                    : runwayMonths >= 3
                    ? "Moderate Buffer:"
                    : "High Insecurity Risk:"}
                </strong>{" "}
                {runwayMonths >= 6
                  ? "You have over half a year of safety cushion to withstand job transitions, medical needs, or market downtime."
                  : runwayMonths >= 3
                  ? "You are within safe range, but an unexpected expense could rapidly shorten your runway below 90 days."
                  : "Your savings will run out within 90 days at this burn rate. Immediate expense audits and runway extensions are critical."}
              </div>
            </div>
          </div>

          {/* Login or Pro Waitlist CTA */}
          <div className="pt-4 border-t border-(--rule) space-y-3">
            {waitlistSuccess ? (
              <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-center space-y-1">
                <CheckCircle2 size={24} className="mx-auto text-emerald-500" />
                <div className="font-semibold text-sm">You are on the Early-Bird Waitlist!</div>
                <div className="text-xs text-muted-foreground">
                  We will invite you as soon as automated SMS sync &amp; WhatsApp logging launch.
                </div>
              </div>
            ) : (
              <form onSubmit={handleWaitlistSubmit} className="space-y-2">
                <div className="text-xs font-semibold text-(--ink)">
                  Want automated SMS tracking &amp; WhatsApp balance alerts?
                </div>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="flex-1 h-9 px-3 rounded-xl border border-(--rule) bg-(--bg) text-xs outline-none focus:border-emerald-500"
                  />
                  <button
                    type="submit"
                    className="h-9 px-3.5 rounded-xl font-mono text-[10px] uppercase font-bold tracking-wider text-white bg-emerald-600 hover:bg-emerald-500 cursor-pointer transition-colors shrink-0"
                  >
                    Join Waitlist ($29/yr)
                  </button>
                </div>
              </form>
            )}

            <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
              <span>Already a member?</span>
              <Link href="/tools/flowise/login" className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">
                Sign In to Full Dashboard &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
