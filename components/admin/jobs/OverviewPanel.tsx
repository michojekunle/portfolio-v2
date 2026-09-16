"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Chart, type ChartConfiguration } from "chart.js/auto";
import { Clock, Send, CheckCircle2, Circle, Search, ArrowRight, LayoutDashboard, Plus, Briefcase, MessagesSquare } from "lucide-react";
import { GlassCard } from "@/components/admin/ui/glass-card";
import { DAILY_GOAL, type JobApplication } from "./constants";

const SEARCH_TIMES = [{ h: 7, m: 30 }, { h: 22, m: 30 }];

function todayStr(): string {
  return new Date().toLocaleDateString("en-CA");
}

function getNextSearch(now: Date): Date {
  const candidates: Date[] = [];
  for (let d = 0; d <= 1; d++) {
    const base = new Date(now);
    base.setDate(base.getDate() + d);
    for (const { h, m } of SEARCH_TIMES) {
      const t = new Date(base);
      t.setHours(h, m, 0, 0);
      if (t > now) candidates.push(t);
    }
  }
  candidates.sort((a, b) => a.getTime() - b.getTime());
  return candidates[0];
}

function getPrevSearch(now: Date): Date {
  const candidates: Date[] = [];
  for (let d = 0; d <= 1; d++) {
    const base = new Date(now);
    base.setDate(base.getDate() - d);
    for (const { h, m } of SEARCH_TIMES) {
      const t = new Date(base);
      t.setHours(h, m, 0, 0);
      if (t <= now) candidates.push(t);
    }
  }
  candidates.sort((a, b) => b.getTime() - a.getTime());
  return candidates[0];
}

export function OverviewPanel({ apps }: { apps: JobApplication[] }): React.ReactElement {
  const [countdown, setCountdown] = useState({ label: "--:--:--", pct: 0, next: "—" });
  const chartCanvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    const tick = (): void => {
      const now = new Date();
      const next = getNextSearch(now);
      const prev = getPrevSearch(now);
      const msLeft = next.getTime() - now.getTime();
      const msTotal = next.getTime() - prev.getTime();
      const pct = Math.max(0, Math.min(100, ((msTotal - msLeft) / msTotal) * 100));
      const h = Math.floor(msLeft / 3_600_000);
      const m = Math.floor((msLeft % 3_600_000) / 60_000);
      const s = Math.floor((msLeft % 60_000) / 1000);
      const p = (n: number): string => String(n).padStart(2, "0");
      setCountdown({ label: `${p(h)}:${p(m)}:${p(s)}`, pct, next: next.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const stats = useMemo(() => {
    const today = todayStr();
    const sw = new Date();
    sw.setDate(sw.getDate() - sw.getDay());
    const weekStr = sw.toLocaleDateString("en-CA");

    const applied = apps.filter((a) => a.status !== "toapply");
    const flutter = applied.filter((a) => a.role === "flutter");
    const rust = applied.filter((a) => a.role === "rust");
    const active = apps.filter((a) => a.status === "interviewing" || a.status === "offer");
    const todayApps = applied.filter((a) => a.date === today);
    const thisWeek = applied.filter((a) => a.date >= weekStr);

    return {
      total: applied.length,
      flutter: flutter.length,
      rust: rust.length,
      active: active.length,
      thisWeek: thisWeek.length,
      offers: apps.filter((a) => a.status === "offer").length,
      interviewing: apps.filter((a) => a.status === "interviewing").length,
      goalDone: todayApps.length,
    };
  }, [apps]);

  useEffect(() => {
    if (!chartCanvasRef.current) return;
    const total = stats.flutter + stats.rust;
    const data = total > 0 ? [stats.flutter, stats.rust, 0] : [0, 0, 1];

    if (!chartRef.current) {
      const config: ChartConfiguration<"doughnut"> = {
        type: "doughnut",
        data: {
          labels: ["Flutter", "Rust", "Empty"],
          datasets: [{ data, backgroundColor: ["hsl(var(--primary))", "hsl(var(--indigo))", "hsl(var(--muted))"], borderWidth: 0, hoverOffset: 4 }],
        },
        options: { responsive: true, maintainAspectRatio: false, cutout: "72%", plugins: { legend: { display: false } }, animation: { duration: 500 } },
      };
      chartRef.current = new Chart(chartCanvasRef.current, config);
    } else {
      chartRef.current.data.datasets[0].data = data;
      chartRef.current.update();
    }
  }, [stats.flutter, stats.rust]);

  useEffect(() => {
    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <GlassCard className="p-5 sm:p-6 flex flex-col justify-between" hoverEffect={false}>
          <div className="flex items-center justify-between mb-4">
            <div className="h-8 w-8 rounded-lg bg-foreground/5 border border-border/40 flex items-center justify-center">
              <Send className="h-4 w-4 text-foreground/70" strokeWidth={1.5} />
            </div>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-semibold tabular-nums tracking-tight text-foreground/90">{stats.total}</p>
            <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mt-2">Total Applied</p>
            <p className="text-[10px] text-muted-foreground/60 mt-1">{stats.thisWeek} this week</p>
          </div>
        </GlassCard>
        
        <GlassCard className="p-5 sm:p-6 flex flex-col justify-between" hoverEffect={false}>
          <div className="flex items-center justify-between mb-4">
            <div className="h-8 w-8 rounded-lg bg-foreground/5 border border-border/40 flex items-center justify-center">
              <span className="text-sm">🐦</span>
            </div>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-semibold tabular-nums tracking-tight text-foreground/90">{stats.flutter}</p>
            <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mt-2">Flutter Apps</p>
          </div>
        </GlassCard>

        <GlassCard className="p-5 sm:p-6 flex flex-col justify-between" hoverEffect={false}>
          <div className="flex items-center justify-between mb-4">
            <div className="h-8 w-8 rounded-lg bg-foreground/5 border border-border/40 flex items-center justify-center">
              <span className="text-sm">🦀</span>
            </div>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-semibold tabular-nums tracking-tight text-foreground/90">{stats.rust}</p>
            <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mt-2">Rust Apps</p>
          </div>
        </GlassCard>

        <GlassCard className="p-5 sm:p-6 flex flex-col justify-between" hoverEffect={false}>
          <div className="flex items-center justify-between mb-4">
            <div className="h-8 w-8 rounded-lg bg-foreground/5 border border-border/40 flex items-center justify-center">
              <span className="text-sm">💼</span>
            </div>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-semibold tabular-nums tracking-tight text-foreground/90">{stats.active}</p>
            <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mt-2">Active (Interview/Offer)</p>
            <p className="text-[10px] text-muted-foreground/60 mt-1">{stats.offers} offer(s)</p>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <GlassCard className="p-5 sm:p-6" hoverEffect={false}>
          <div className="flex items-center gap-2 mb-6">
            <Clock className="h-4 w-4 text-foreground/70" strokeWidth={1.5} />
            <h3 className="text-sm font-semibold tracking-tight text-foreground/90">Scheduled Job Searches</h3>
          </div>
          <div className="rounded-xl border border-border/40 bg-background/30 p-5 mb-5 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2 relative z-10">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Next search runs in</span>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">{countdown.next}</span>
            </div>
            <p className="text-3xl sm:text-4xl font-semibold tabular-nums tracking-tight text-foreground/90 relative z-10">{countdown.label}</p>
            <div className="mt-4 h-[2px] bg-border/40 rounded-full overflow-hidden relative z-10">
              <div className="h-full bg-foreground/80 transition-[width] duration-1000 ease-linear shadow-[0_0_10px_rgba(255,255,255,0.5)]" style={{ width: `${countdown.pct}%` }} />
            </div>
            {/* Ambient Glow */}
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-foreground/5 blur-2xl rounded-full pointer-events-none" />
          </div>
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-foreground/5 border border-border/40 flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-5 w-5 text-foreground/70" strokeWidth={1.5} />
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-foreground/90 truncate">Daily Job Search — Flutter & Rust</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">7:30 AM & 10:30 PM, every day</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-5 sm:p-6 flex flex-col" hoverEffect={false}>
          <h3 className="text-sm font-semibold tracking-tight text-foreground/90 mb-6">Application Split</h3>
          <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-10">
            <div className="relative w-36 h-36 shrink-0 drop-shadow-xl">
              <canvas ref={chartCanvasRef} />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-semibold tabular-nums text-foreground/90">{stats.flutter + stats.rust}</span>
                <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">total</span>
              </div>
            </div>
            <div className="flex-1 w-full space-y-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary shrink-0 shadow-[0_0_8px_hsl(var(--primary))]" />
                  <span className="text-[13px] font-medium text-muted-foreground">Flutter</span>
                </div>
                <span className="font-semibold tabular-nums text-foreground/90">{stats.flutter}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full shrink-0 shadow-[0_0_8px_hsl(var(--indigo))]" style={{ background: "hsl(var(--indigo))" }} />
                  <span className="text-[13px] font-medium text-muted-foreground">Rust</span>
                </div>
                <span className="font-semibold tabular-nums text-foreground/90">{stats.rust}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-muted-foreground/40 shrink-0" />
                  <span className="text-[13px] font-medium text-muted-foreground">Interviewing</span>
                </div>
                <span className="font-semibold tabular-nums text-foreground/90">{stats.interviewing}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-muted-foreground/20 shrink-0" />
                  <span className="text-[13px] font-medium text-muted-foreground">Offers</span>
                </div>
                <span className="font-semibold tabular-nums text-foreground/90">{stats.offers}</span>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      <GlassCard className="p-5 sm:p-6" hoverEffect={false}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <h3 className="text-sm font-semibold tracking-tight text-foreground/90">Today's Goal</h3>
          <div className="text-right">
            <p className="text-[13px] font-semibold text-foreground/90">{stats.goalDone} / {DAILY_GOAL} applications</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {stats.goalDone >= DAILY_GOAL ? "🎉 Goal smashed!" : `${DAILY_GOAL - stats.goalDone} more to target`}
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="flex gap-2 shrink-0 w-full sm:w-auto justify-between sm:justify-start">
            {Array.from({ length: DAILY_GOAL }, (_, i) => (
              i < stats.goalDone
                ? <div key={i} className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-foreground/10 border border-foreground/20 flex items-center justify-center transition-all duration-500 shadow-[0_0_12px_rgba(255,255,255,0.1)]">
                    <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-foreground/90" strokeWidth={1.5} />
                  </div>
                : <div key={i} className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-background/50 border border-border/40 flex items-center justify-center transition-all duration-500">
                    <Circle className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground/30" strokeWidth={1.5} />
                  </div>
            ))}
          </div>
          <div className="flex-1 w-full mt-2 sm:mt-0">
            <div className="h-[2px] w-full bg-border/40 rounded-full overflow-hidden">
              <div className="h-full bg-foreground/80 transition-[width] duration-700 ease-out shadow-[0_0_10px_rgba(255,255,255,0.5)]" style={{ width: `${Math.min(100, (stats.goalDone / DAILY_GOAL) * 100)}%` }} />
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
