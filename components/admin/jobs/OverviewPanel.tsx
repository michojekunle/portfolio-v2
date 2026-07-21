"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Chart, type ChartConfiguration } from "chart.js/auto";
import { CheckCircle2, Circle, Clock, MessagesSquare, Send } from "lucide-react";
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
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="content-card py-4">
          <Send className="h-4 w-4 text-muted-foreground mb-2" />
          <p className="text-3xl font-semibold tabular-nums tracking-tight">{stats.total}</p>
          <p className="text-xs text-muted-foreground mt-1">Total Applied</p>
          <p className="text-xs text-muted-foreground/70">{stats.thisWeek} this week</p>
        </div>
        <div className="content-card py-4">
          <span className="text-base leading-none mb-2 block">🐦</span>
          <p className="text-3xl font-semibold tabular-nums tracking-tight">{stats.flutter}</p>
          <p className="text-xs text-muted-foreground mt-1">Flutter Apps</p>
        </div>
        <div className="content-card py-4">
          <span className="text-base leading-none mb-2 block">🦀</span>
          <p className="text-3xl font-semibold tabular-nums tracking-tight">{stats.rust}</p>
          <p className="text-xs text-muted-foreground mt-1">Rust Apps</p>
        </div>
        <div className="content-card py-4">
          <MessagesSquare className="h-4 w-4 text-muted-foreground mb-2" />
          <p className="text-3xl font-semibold tabular-nums tracking-tight">{stats.active}</p>
          <p className="text-xs text-muted-foreground mt-1">Active (Interview/Offer)</p>
          <p className="text-xs text-muted-foreground/70">{stats.offers} offer(s)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="content-card">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-medium">Scheduled Job Searches</h3>
          </div>
          <div className="rounded-md bg-muted/60 p-4 mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Next search runs in</span>
              <span className="text-xs text-muted-foreground">{countdown.next}</span>
            </div>
            <p className="text-2xl font-semibold tabular-nums tracking-tight text-primary">{countdown.label}</p>
            <div className="mt-2 h-1 bg-border rounded-full overflow-hidden">
              <div className="h-full bg-primary transition-[width] duration-1000 ease-linear" style={{ width: `${countdown.pct}%` }} />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">Daily Job Search — Flutter &amp; Rust</p>
              <p className="text-xs text-muted-foreground">7:30 AM &amp; 10:30 PM, every day</p>
            </div>
          </div>
        </div>

        <div className="content-card flex flex-col">
          <h3 className="text-sm font-medium mb-4">Application Split</h3>
          <div className="flex-1 flex flex-col sm:flex-row items-center gap-6">
            <div className="relative w-32 h-32 shrink-0">
              <canvas ref={chartCanvasRef} />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-semibold tabular-nums">{stats.flutter + stats.rust}</span>
                <span className="text-xs text-muted-foreground">total</span>
              </div>
            </div>
            <div className="flex-1 w-full space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <span className="h-2.5 w-2.5 rounded-sm bg-primary shrink-0" /><span className="text-muted-foreground flex-1">Flutter</span><span className="font-semibold">{stats.flutter}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="h-2.5 w-2.5 rounded-sm shrink-0" style={{ background: "hsl(var(--indigo))" }} /><span className="text-muted-foreground flex-1">Rust</span><span className="font-semibold">{stats.rust}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="h-2.5 w-2.5 rounded-sm bg-muted-foreground/40 shrink-0" /><span className="text-muted-foreground flex-1">Interviewing</span><span className="font-semibold">{stats.interviewing}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="h-2.5 w-2.5 rounded-sm bg-muted-foreground/20 shrink-0" /><span className="text-muted-foreground flex-1">Offers</span><span className="font-semibold">{stats.offers}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="content-card">
        <h3 className="text-sm font-medium mb-4">Today&apos;s Goal</h3>
        <div className="flex items-center gap-4">
          <div className="flex gap-1.5 shrink-0">
            {Array.from({ length: DAILY_GOAL }, (_, i) => (
              i < stats.goalDone
                ? <CheckCircle2 key={i} className="h-8 w-8 text-primary" />
                : <Circle key={i} className="h-8 w-8 text-muted-foreground/30" />
            ))}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">{stats.goalDone} / {DAILY_GOAL} applications today</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {stats.goalDone >= DAILY_GOAL ? "🎉 Goal smashed! Keep the momentum going." : `${DAILY_GOAL - stats.goalDone} more to hit today's target`}
            </p>
            <div className="mt-2 h-1.5 bg-border rounded-full overflow-hidden">
              <div className="h-full bg-primary transition-[width] duration-500" style={{ width: `${Math.min(100, (stats.goalDone / DAILY_GOAL) * 100)}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
