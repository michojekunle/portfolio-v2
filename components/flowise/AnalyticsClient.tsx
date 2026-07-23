"use client";

import { useState, useCallback, useEffect } from "react";
import { SpendingHeatmap } from "./SpendingHeatmap";
import { CategoryDonut } from "./CategoryDonut";
import { CashFlowChart } from "./CashFlowChart";
import { SYSTEM_CATEGORIES } from "@/lib/flowise/types";
import { Sparkles, RefreshCw } from "lucide-react";
import { formatCurrency } from "@/lib/flowise/calculator";
import { usePrivacy, Amount } from "@/components/flowise/PrivacyProvider";
import { MarkdownInline } from "@/components/ui/Markdown";

const ACCENT = "#16A34A";

interface AnalyticsData {
  daily_spend: Record<string, number>;
  monthly_trend: Record<string, { income: number; expenses: number }>;
  category_breakdown: Record<string, number>;
}

interface Insight {
  generated_at: string;
  insights: string[];
}

const CAT_MAP = Object.fromEntries(SYSTEM_CATEGORIES.map((c) => [c.id, c]));

export function AnalyticsClient(): React.ReactElement {
  const { hidden } = usePrivacy();
const [months, setMonths] = useState(3);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [insight, setInsight] = useState<Insight | null>(null);
  const [insightLoading, setInsightLoading] = useState(false);
  const [insightError, setInsightError] = useState<string | null>(null);

  const fetchData = useCallback(async (m: number): Promise<void> => {
    setLoading(true);
    try {
      const res = await fetch(`/api/flowise/analytics?months=${m}`);
      if (res.ok) {
        const d = await res.json() as AnalyticsData;
        setData(d);
      }
    } catch (err) {
      console.error("[analytics] fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData(months);
  }, [months, fetchData]);

  const handleMonthChange = (m: number): void => {
  const { hidden } = usePrivacy();

    setMonths(m);
  };

  const generateInsights = async (): Promise<void> => {
    setInsightLoading(true);
    setInsightError(null);
    try {
      const res = await fetch("/api/flowise/insights", { method: "POST" });
      if (res.ok) {
        const d = await res.json() as Insight;
        setInsight(d);
      } else {
        const body = await res.json().catch(() => ({})) as { error?: string };
        setInsightError(body.error ?? "Failed to generate insights. Please try again.");
      }
    } catch (err) {
      console.error("[analytics] insights error:", err);
      setInsightError("Connection error. Please check your network and retry.");
    } finally {
      setInsightLoading(false);
    }
  };

  // Build category slices for donut
  const categorySlices = data
    ? Object.entries(data.category_breakdown)
        .map(([id, amount]) => {
          const cat = CAT_MAP[id];
          return {
            id,
            name: cat?.name ?? id,
            icon: cat?.icon ?? "📌",
            color: cat?.color ?? "#6B7280",
            amount: Math.abs(amount),
          };
        })
        .filter((s) => s.amount > 0)
    : [];

  const totalCategorySpend = categorySlices.reduce((s, c) => s + c.amount, 0);

  // Summary stats
  const currentMonthKey = new Date().toISOString().slice(0, 7);
  const currentMonth = data?.monthly_trend[currentMonthKey];
  const prevMonths = data ? Object.entries(data.monthly_trend).filter(([k]) => k < currentMonthKey) : [];
  const avgExpenses = prevMonths.length > 0
    ? prevMonths.reduce((s, [, v]) => s + v.expenses, 0) / prevMonths.length
    : 0;
  const expenseDelta = currentMonth && avgExpenses > 0
    ? ((currentMonth.expenses - avgExpenses) / avgExpenses) * 100
    : null;

  return (
    <div className="px-10 pt-12 pb-15 max-256:pt-20 max-180:px-5">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
        <h1 className="font-display font-normal text-[36px] leading-[1.05] tracking-[-0.03em] fvs-text m-0 text-(--ink)">
          Analytics
        </h1>
        <div className="flex items-center gap-2">
          {[1, 3, 6, 12].map((m) => (
            <button
              key={m}
              onClick={() => handleMonthChange(m)}
              className="h-8 px-3 rounded-full font-mono text-[10px] tracking-widest uppercase font-semibold border-none cursor-pointer transition-all"
              style={{
                background: months === m ? ACCENT : "var(--bg-2)",
                color: months === m ? "white" : "var(--ink-3)",
                border: months === m ? "none" : "1px solid var(--rule)",
              }}
            >{m}M</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          {[200, 240, 180].map((h, i) => (
            <div key={i} className="rounded-xl animate-pulse" style={{ height: h, background: "var(--bg-2)" }} />
          ))}
        </div>
      ) : !data ? (
        <div className="rounded-xl py-15 text-center" style={{ border: "1px dashed var(--rule)" }}>
          <div className="text-[13px] text-muted-foreground">Failed to load analytics. Try refreshing.</div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Quick stats row */}
          {currentMonth && (
            <div className="grid grid-cols-3 max-[600px]:grid-cols-1 gap-3">
              {[
                { label: "This Month Income", val: currentMonth.income, color: "#16A34A" },
                { label: "This Month Spend", val: currentMonth.expenses, color: "#EF4444" },
                {
                  label: `vs ${months}M Avg`,
                  val: expenseDelta,
                  isPercent: true,
                  color: expenseDelta !== null && expenseDelta > 0 ? "#EF4444" : "#16A34A",
                },
              ].map(({ label, val, isPercent, color }) => (
                <div key={label} className="rounded-xl px-5 py-4" style={{ border: "1px solid var(--rule)", background: "var(--bg-2)" }}>
                  <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-(--ink-4) mb-1">{label}</div>
                  <div className="font-display text-[24px] font-normal tracking-[-0.02em] fvs-text" style={{ color }}>
                    {val === null ? "—" : isPercent
                      ? `${(val as number) > 0 ? "+" : ""}${Math.round(val as number)}%`
                      : (hidden ? "****" : formatCurrency(val as number, "NGN", true))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Heatmap */}
          <div className="rounded-[14px] px-6 py-5" style={{ border: "1px solid var(--rule)", background: "var(--bg-2)" }}>
            <SpendingHeatmap dailySpend={data.daily_spend} months={months} />
          </div>

          {/* Donut + Cash Flow */}
          <div className="grid grid-cols-2 max-[860px]:grid-cols-1 gap-4">
            <div className="rounded-[14px] px-6 py-5" style={{ border: "1px solid var(--rule)", background: "var(--bg-2)" }}>
              <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground mb-4">Category Breakdown</div>
              <CategoryDonut data={categorySlices} total={totalCategorySpend} />
            </div>
            <div className="rounded-[14px] px-6 py-5" style={{ border: "1px solid var(--rule)", background: "var(--bg-2)" }}>
              <CashFlowChart data={data.monthly_trend} />
            </div>
          </div>

          {/* AI Insights */}
          <div className="rounded-[14px] px-6 py-5" style={{ border: "1px solid var(--rule)", background: "var(--bg-2)" }}>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <div>
                <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">AI Insights</div>
                <div className="text-[12px] text-(--ink-4) mt-0.5">Plain-language analysis of your spending patterns</div>
              </div>
              <button
                onClick={() => void generateInsights()}
                disabled={insightLoading}
                className="inline-flex items-center gap-2 h-9 px-4 rounded-full font-mono text-[10px] uppercase tracking-[0.12em] font-semibold border-none cursor-pointer disabled:opacity-60"
                style={{ background: `${ACCENT}15`, color: ACCENT, border: `1px solid ${ACCENT}30` }}
              >
                {insightLoading
                  ? <><span className="w-3 h-3 rounded-full border-[1.5px] animate-spin" style={{ borderColor: `${ACCENT}30`, borderTopColor: ACCENT }} /> Analysing...</>
                  : <><Sparkles size={12} /> Generate Insights</>}
              </button>
            </div>

            {insightLoading && (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-4 rounded-full animate-pulse" style={{ background: "var(--rule)", width: `${60 + i * 12}%` }} />
                ))}
              </div>
            )}

            {!insightLoading && insight && (
              <div className="space-y-2.5">
                {insight.insights.map((text, i) => (
                  <div key={i} className="flex items-start gap-2.5 rounded-[10px] px-3.5 py-2.5" style={{ background: "var(--bg)", border: "1px solid var(--rule)" }}>
                    <Sparkles size={12} className="shrink-0 mt-0.5" style={{ color: ACCENT }} />
                    <p className="text-[13px] leading-[1.6] text-secondary-foreground m-0"><MarkdownInline text={text} /></p>
                  </div>
                ))}
                <div className="font-mono text-[9px] text-(--ink-4) text-right">
                  Generated {new Date(insight.generated_at).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}
                  {" · "}<button onClick={() => void generateInsights()} className="underline border-none bg-transparent cursor-pointer text-(--ink-4) font-mono text-[9px]"><RefreshCw size={9} className="inline" /> Refresh</button>
                </div>
              </div>
            )}

            {!insightLoading && insightError && (
              <div className="rounded-[10px] px-4 py-3 flex items-center justify-between gap-3" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)" }}>
                <p className="text-[12px] leading-normal m-0" style={{ color: "#dc2626" }}>{insightError}</p>
                <button onClick={() => void generateInsights()} className="shrink-0 font-mono text-[10px] uppercase tracking-[0.06em] border-none cursor-pointer bg-transparent" style={{ color: ACCENT }}>
                  <RefreshCw size={10} className="inline mr-1" />Retry
                </button>
              </div>
            )}

            {!insightLoading && !insight && !insightError && (
              <div className="rounded-[10px] py-8 text-center" style={{ border: "1px dashed var(--rule)" }}>
                <Sparkles size={24} className="mx-auto mb-2 text-(--ink-4)" />
                <div className="text-[13px] text-muted-foreground mb-1">No insights yet</div>
                <div className="text-[12px] text-(--ink-4)">Click Generate Insights to get an AI analysis of your last 60 days.</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
