"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Chart, type ChartConfiguration } from "chart.js/auto";
import styles from "./JobsDashboard.module.css";
import {
  PRIORITY_CONFIG,
  SKILLS_GAP,
  PROOF_OF_WORK_PROJECTS,
  JOB_BOARDS,
  type JobRole,
} from "@/lib/admin/job-search-data";
import type { JobLead } from "@/app/api/job-leads/route";

export type ApplicationStatus = "toapply" | "applied" | "interviewing" | "offer" | "rejected" | "ghosted";

export interface JobApplication {
  id: string;
  date: string;
  role: JobRole;
  company: string;
  board: string | null;
  status: ApplicationStatus;
  followup: string | null;
  url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface LeadsState {
  updatedAt: string | null;
  flutter: JobLead[];
  rust: JobLead[];
}

const STATUS_LABEL: Record<ApplicationStatus, string> = {
  toapply: "To Apply",
  applied: "Applied",
  interviewing: "Interviewing",
  offer: "Offer 🎉",
  rejected: "Rejected",
  ghosted: "Ghosted 👻",
};

const STATUS_BADGE_CLASS: Record<ApplicationStatus, keyof typeof styles> = {
  toapply: "bToapply",
  applied: "bApplied",
  interviewing: "bInterviewing",
  offer: "bOffer",
  rejected: "bRejected",
  ghosted: "bGhosted",
};

const DAILY_GOAL = 4;
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

function fmtAgo(iso: string): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

interface EmptyFormState {
  date: string;
  role: JobRole;
  company: string;
  board: string;
  status: ApplicationStatus;
  followup: string;
  url: string;
  notes: string;
}

function emptyForm(): EmptyFormState {
  return { date: todayStr(), role: "flutter", company: "", board: "LinkedIn", status: "applied", followup: "", url: "", notes: "" };
}

export function JobsDashboard({
  initialApplications,
  initialLeads,
}: {
  initialApplications: JobApplication[];
  initialLeads: LeadsState;
}): React.ReactElement {
  const [apps, setApps] = useState<JobApplication[]>(initialApplications);
  const [leads, setLeads] = useState<LeadsState>(initialLeads);
  const [leadsFetching, setLeadsFetching] = useState(false);
  const [leadsError, setLeadsError] = useState(false);

  const [filter, setFilter] = useState<"all" | "flutter" | "rust" | ApplicationStatus>("all");
  const [projFilter, setProjFilter] = useState<"all" | JobRole>("all");

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drawerStatus, setDrawerStatus] = useState<ApplicationStatus>("applied");

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<EmptyFormState>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [countdown, setCountdown] = useState({ label: "--:--:--", pct: 0, next: "—" });

  const chartCanvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  // ── Countdown to next scheduled search ──
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
      setCountdown({
        label: `${p(h)}:${p(m)}:${p(s)}`,
        pct,
        next: next.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // ── Stats ──
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
    const offers = apps.filter((a) => a.status === "offer").length;

    return {
      total: applied.length,
      flutter: flutter.length,
      rust: rust.length,
      active: active.length,
      thisWeek: thisWeek.length,
      flutterToday: flutter.filter((a) => a.date === today).length,
      rustToday: rust.filter((a) => a.date === today).length,
      offers,
      interviewing: apps.filter((a) => a.status === "interviewing").length,
      goalDone: todayApps.length,
    };
  }, [apps]);

  // ── Doughnut chart ──
  useEffect(() => {
    if (!chartCanvasRef.current) return;
    const total = stats.flutter + stats.rust;
    const data = total > 0 ? [stats.flutter, stats.rust, 0] : [0, 0, 1];

    if (!chartRef.current) {
      const config: ChartConfiguration<"doughnut"> = {
        type: "doughnut",
        data: {
          labels: ["Flutter", "Rust", "Empty"],
          datasets: [{ data, backgroundColor: ["#0EA5E9", "#F97316", "#E2E8F0"], borderWidth: 0, hoverOffset: 4 }],
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

  // ── Leads ──
  const fetchLeads = useCallback(async (): Promise<void> => {
    setLeadsFetching(true);
    setLeadsError(false);
    try {
      const res = await fetch("/api/job-leads");
      if (!res.ok) throw new Error(`API ${res.status}`);
      const data = (await res.json()) as LeadsState;
      setLeads(data);
    } catch (err) {
      console.error("[jobs-dashboard] fetchLeads error:", err);
      setLeadsError(true);
    } finally {
      setLeadsFetching(false);
    }
  }, []);

  useEffect(() => {
    const id = setInterval(() => void fetchLeads(), 5 * 60 * 1000);
    return () => clearInterval(id);
  }, [fetchLeads]);

  // ── Applications CRUD ──
  const openLogModal = (prefill?: Partial<EmptyFormState>): void => {
    setForm({ ...emptyForm(), ...prefill });
    setSaveError(null);
    setModalOpen(true);
  };

  const handleSaveApp = async (): Promise<void> => {
    if (!form.company.trim()) {
      setSaveError("Please enter the company name.");
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch("/api/admin/job-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: form.date,
          role: form.role,
          company: form.company.trim(),
          board: form.board || null,
          status: form.status,
          followup: form.followup || null,
          url: form.url.trim() || null,
          notes: form.notes.trim() || null,
        }),
      });
      const json = (await res.json()) as { application?: JobApplication; error?: string };
      if (!res.ok || !json.application) throw new Error(json.error ?? "Failed to save application");
      setApps((prev) => [json.application!, ...prev]);
      setModalOpen(false);
    } catch (err) {
      console.error("[jobs-dashboard] save application error:", err);
      setSaveError(err instanceof Error ? err.message : "Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const updateAppStatus = async (id: string, status: ApplicationStatus): Promise<void> => {
    setDrawerStatus(status);
    setApps((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    try {
      const res = await fetch(`/api/admin/job-applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Status update failed");
    } catch (err) {
      console.error("[jobs-dashboard] update status error:", err);
    }
  };

  const deleteApp = async (id: string): Promise<void> => {
    if (!confirm("Remove this application?")) return;
    setApps((prev) => prev.filter((a) => a.id !== id));
    if (selectedId === id) setSelectedId(null);
    try {
      const res = await fetch(`/api/admin/job-applications/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
    } catch (err) {
      console.error("[jobs-dashboard] delete application error:", err);
    }
  };

  const rows = useMemo(() => {
    let r = [...apps].sort((a, b) => (a.date < b.date ? 1 : -1));
    if (filter === "flutter" || filter === "rust") r = r.filter((a) => a.role === filter);
    else if (filter !== "all") r = r.filter((a) => a.status === filter);
    return r;
  }, [apps, filter]);

  const selectedApp = selectedId ? apps.find((a) => a.id === selectedId) ?? null : null;
  const visibleProjects = projFilter === "all" ? PROOF_OF_WORK_PROJECTS : PROOF_OF_WORK_PROJECTS.filter((p) => p.role === projFilter);

  return (
    <div className={styles.dashboard}>
      {/* Overview */}
      <div className={styles.sh}><div className={styles.shLeft}><span className={styles.shLabel}>Overview</span><div className={styles.shLine} /></div></div>
      <div className={styles.statsRow}>
        <div className={`${styles.stat} ${styles.statTotal}`}><div className={styles.statIcon}>📨</div><div className={styles.statVal}>{stats.total}</div><div className={styles.statLbl}>Total Applied</div><div className={styles.statSub}>{stats.thisWeek} this week</div></div>
        <div className={`${styles.stat} ${styles.statFlutter}`}><div className={styles.statIcon}>🐦</div><div className={styles.statVal}>{stats.flutter}</div><div className={styles.statLbl}>Flutter Apps</div><div className={styles.statSub}>{stats.flutterToday} today</div></div>
        <div className={`${styles.stat} ${styles.statRust}`}><div className={styles.statIcon}>🦀</div><div className={styles.statVal}>{stats.rust}</div><div className={styles.statLbl}>Rust Apps</div><div className={styles.statSub}>{stats.rustToday} today</div></div>
        <div className={`${styles.stat} ${styles.statActive}`}><div className={styles.statIcon}>💬</div><div className={styles.statVal}>{stats.active}</div><div className={styles.statLbl}>Active (Interview/Offer)</div><div className={styles.statSub}>{stats.offers} offer(s)</div></div>
      </div>

      {/* Automation */}
      <div className={styles.sh}><div className={styles.shLeft}><span className={styles.shLabel}>Automation</span><div className={styles.shLine} /></div></div>
      <div className={styles.midRow}>
        <div className={styles.card}>
          <div className={styles.cardTitle}>⏰ Scheduled Job Searches</div>
          <div className={styles.cdBox}>
            <div className={styles.cdTop}><span className={styles.cdLabel}>Next search runs in</span><span className={styles.cdTarget}>{countdown.next}</span></div>
            <div className={styles.cdNum}>{countdown.label}</div>
            <div className={styles.cdBarBg}><div className={styles.cdBarFill} style={{ width: `${countdown.pct}%` }} /></div>
          </div>
          <div className={styles.taskRow}>
            <div className={styles.taskIcon}>✅</div>
            <div style={{ flex: 1 }}>
              <div className={styles.taskName}>Daily Job Search — Flutter &amp; Rust</div>
              <div className={styles.taskSched}>7:30 AM &amp; 10:30 PM, every day</div>
            </div>
          </div>
        </div>
        <div className={styles.card} style={{ display: "flex", flexDirection: "column" }}>
          <div className={styles.cardTitle}>📊 Application Split</div>
          <div className={styles.chartWrap} style={{ flex: 1 }}>
            <div className={styles.chartCanvasWrap}>
              <canvas ref={chartCanvasRef} />
              <div className={styles.chartCenter}>
                <div className={styles.chartCenterN}>{stats.flutter + stats.rust}</div>
                <div className={styles.chartCenterS}>total</div>
              </div>
            </div>
            <div className={styles.chartLegend}>
              <div className={styles.legItem}><div className={styles.legDot} style={{ background: "var(--f)" }} /><span className={styles.legLbl}>Flutter</span><span className={styles.legVal}>{stats.flutter}</span></div>
              <div className={styles.legItem}><div className={styles.legDot} style={{ background: "var(--r)" }} /><span className={styles.legLbl}>Rust</span><span className={styles.legVal}>{stats.rust}</span></div>
              <div className={styles.legItem}><div className={styles.legDot} style={{ background: "var(--g)" }} /><span className={styles.legLbl}>Interviewing</span><span className={styles.legVal}>{stats.interviewing}</span></div>
              <div className={styles.legItem}><div className={styles.legDot} style={{ background: "var(--y)" }} /><span className={styles.legLbl}>Offers</span><span className={styles.legVal}>{stats.offers}</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Job Boards */}
      <div className={styles.sh}><div className={styles.shLeft}><span className={styles.shLabel}>Job Boards</span><div className={styles.shLine} /></div></div>
      <div className={styles.card} style={{ padding: "16px 18px" }}>
        <div className={styles.boardsGrid}>
          {JOB_BOARDS.map((b) => (
            <a key={b.name} className={styles.boardA} href={b.url} target="_blank" rel="noopener noreferrer">
              <span className={styles.boardEm}>{b.emoji}</span>
              <span className={styles.boardNm}>{b.name}</span>
              <span className={`${styles.boardPill} ${b.tag === "flutter" ? styles.pillF : b.tag === "rust" ? styles.pillR : styles.pillB}`}>
                {b.tag === "flutter" ? "Flutter" : b.tag === "rust" ? "Rust" : "Both"}
              </span>
            </a>
          ))}
        </div>
      </div>

      {/* Today's Goal */}
      <div className={styles.sh}><div className={styles.shLeft}><span className={styles.shLabel}>Today&apos;s Goal</span><div className={styles.shLine} /></div></div>
      <div className={styles.card}>
        <div className={styles.goalRow}>
          <div className={styles.goalDots}>
            {Array.from({ length: DAILY_GOAL }, (_, i) => (
              <div key={i} className={`${styles.goalDot} ${i < stats.goalDone ? styles.goalDotDone : ""}`}>{i < stats.goalDone ? "✓" : ""}</div>
            ))}
          </div>
          <div className={styles.goalInfo}>
            <div className={styles.goalTitle}>{stats.goalDone} / {DAILY_GOAL} applications today</div>
            <div className={styles.goalSub}>{stats.goalDone >= DAILY_GOAL ? "🎉 Goal smashed! Keep the momentum going." : `${DAILY_GOAL - stats.goalDone} more to hit today's target`}</div>
            <div className={styles.goalBarBg}><div className={styles.goalBarFill} style={{ width: `${Math.min(100, (stats.goalDone / DAILY_GOAL) * 100)}%` }} /></div>
          </div>
        </div>
      </div>

      {/* Skills Gap */}
      <div className={styles.sh}>
        <div className={styles.shLeft}><span className={styles.shLabel}>Skills to Add</span><div className={styles.shLine} /></div>
        <div style={{ fontSize: 10, color: "var(--li)" }}>drawn from job postings · 🔴 critical</div>
      </div>
      <div className={styles.skills2col}>
        {(["flutter", "rust"] as const).map((role) => (
          <div key={role} className={styles.skillsCard}>
            <div className={styles.skillsCardHd}>
              <span style={{ fontSize: 18 }}>{role === "rust" ? "🦀" : "🐦"}</span>
              <span className={styles.skillsCardTitle}>{role === "rust" ? "Rust Systems" : "Flutter Mobile"} — Skills to Add</span>
            </div>
            {SKILLS_GAP[role].map((s) => {
              const p = PRIORITY_CONFIG[s.priority];
              const dom = s.resource.replace("https://", "").split("/")[0];
              return (
                <div key={s.name} className={styles.skillItem}>
                  <div className={styles.skDot} style={{ background: p.color }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className={styles.skName}>{s.name}</div>
                    <div className={styles.skWhy}>{s.why}</div>
                    <a href={s.resource} target="_blank" rel="noopener noreferrer" className={styles.skRes}>Learn → {dom} ↗</a>
                  </div>
                  <span className={styles.skPri} style={{ color: p.color }}>{p.label}</span>
                </div>
              );
            })}
            <div className={styles.priLegend}>
              {(Object.entries(PRIORITY_CONFIG) as [keyof typeof PRIORITY_CONFIG, typeof PRIORITY_CONFIG[keyof typeof PRIORITY_CONFIG]][]).map(([k, v]) => (
                <div key={k} className={styles.priLegItem}><div className={styles.priLegDot} style={{ background: v.color }} />{v.label}</div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Proof of Work Projects */}
      <div className={styles.sh}>
        <div className={styles.shLeft}><span className={styles.shLabel}>Proof of Work Projects</span><div className={styles.shLine} /></div>
        <div className={styles.shActions}>
          <button className={`${styles.chip} ${projFilter === "all" ? styles.chipOn : ""}`} onClick={() => setProjFilter("all")}>All ({PROOF_OF_WORK_PROJECTS.length})</button>
          <button className={`${styles.chip} ${projFilter === "flutter" ? styles.chipOn : ""}`} onClick={() => setProjFilter("flutter")}>🐦 Flutter</button>
          <button className={`${styles.chip} ${projFilter === "rust" ? styles.chipOnR : ""}`} onClick={() => setProjFilter("rust")}>🦀 Rust</button>
        </div>
      </div>
      <div className={styles.projGrid}>
        {visibleProjects.map((p) => {
          const isR = p.role === "rust";
          const diffClass = p.difficulty === "Easy" ? styles.diffEasy : p.difficulty === "Medium" ? styles.diffMedium : styles.diffHard;
          return (
            <div key={p.id} className={styles.projCard}>
              <div className={styles.projStripe} style={{ background: isR ? "var(--r)" : "var(--f)" }} />
              <div className={styles.projBody}>
                <div className={styles.projTop}>
                  <span className={`${styles.projBadge} ${isR ? styles.projBadgeR : styles.projBadgeF}`}>{isR ? "🦀" : "🐦"} #{p.num}</span>
                  <span className={styles.projName}>{p.name}</span>
                </div>
                <div className={styles.projDesc}>{p.desc}</div>
                <div className={styles.projTags}>{p.skills.map((s) => <span key={s} className={styles.projTag}>{s}</span>)}</div>
                <div className={styles.projMeta}>
                  <span className={diffClass}>{p.difficulty}</span>
                  <span className={styles.projWeeks}>~{p.weeks} week{p.weeks > 1 ? "s" : ""}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Latest Leads */}
      <div className={styles.sh}>
        <div className={styles.shLeft}>
          <span className={styles.shLabel}>Latest Job Leads</span><div className={styles.shLine} />
          <span style={{ fontSize: 10, color: "var(--li)", whiteSpace: "nowrap" }}>
            {leadsError ? "· fetch error" : leads.updatedAt ? `· updated ${fmtAgo(leads.updatedAt)}` : "· no leads yet"}
          </span>
        </div>
        <div className={styles.shActions}>
          <button className={styles.btnSm} onClick={() => void fetchLeads()} disabled={leadsFetching}>{leadsFetching ? "↻ Fetching…" : "↻ Refresh Leads"}</button>
        </div>
      </div>
      <div style={{ fontSize: 11, color: "var(--mu)", margin: "-6px 0 12px" }}>Auto-updated at 7:30 AM &amp; 10:30 PM by the scheduled task</div>
      <div className={styles.leads2col}>
        {(["flutter", "rust"] as const).map((role) => {
          const isR = role === "rust";
          const items = leads[role];
          const emoji = isR ? "🦀" : "🐦";
          const label = isR ? "Rust" : "Flutter";
          return (
            <div key={role}>
              <div className={`${styles.leadColHeader} ${isR ? styles.leadColHeaderR : styles.leadColHeaderF}`}>
                <span style={{ fontSize: 16 }}>{emoji}</span><span className={styles.leadColLabel}>{label} Leads</span>
              </div>
              {items.length === 0 ? (
                <div className={styles.emptyLead}>
                  <div className={styles.emptyLeadIcon}>{emoji}</div>
                  <div className={styles.emptyLeadTitle}>{label} leads appear here</div>
                  <div className={styles.emptyLeadSub}>Posted automatically at 7:30 AM &amp; 10:30 PM.<br />Hit ↻ Refresh Leads to pull the latest.</div>
                </div>
              ) : items.map((j) => (
                <div key={j.id} className={styles.leadCard}>
                  <div className={styles.leadCardTop}>
                    <div>
                      <div className={styles.leadCompany}>{j.company || "—"}</div>
                      <div className={styles.leadTitle}>{j.title || "—"} · <span style={{ color: "var(--li)" }}>{j.board || ""}</span></div>
                    </div>
                    <span className={`${styles.badge} ${isR ? styles.bRust : styles.bFlutter}`}>{isR ? "🦀 Rust" : "🐦 Flutter"}</span>
                  </div>
                  {j.tip && <div className={`${styles.leadTip} ${isR ? styles.leadTipR : ""}`}>💡 {j.tip}</div>}
                  <div className={styles.leadActions}>
                    {j.url && <a href={j.url} target="_blank" rel="noopener noreferrer" className={`${styles.leadApply} ${isR ? styles.leadApplyR : styles.leadApplyF}`}>Apply Now ↗</a>}
                    <button
                      className={styles.leadLog}
                      onClick={() => openLogModal({ company: j.company ?? "", role, board: j.board ?? "", url: j.url ?? "" })}
                    >
                      + Log
                    </button>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Applications */}
      <div className={styles.sh}>
        <div className={styles.shLeft}><span className={styles.shLabel}>Applications</span><div className={styles.shLine} /></div>
        <div className={styles.shActions}>
          <div className={styles.chips}>
            <button className={`${styles.chip} ${filter === "all" ? styles.chipOn : ""}`} onClick={() => setFilter("all")}>All</button>
            <button className={`${styles.chip} ${filter === "flutter" ? styles.chipOn : ""}`} onClick={() => setFilter("flutter")}>🐦 Flutter</button>
            <button className={`${styles.chip} ${filter === "rust" ? styles.chipOnR : ""}`} onClick={() => setFilter("rust")}>🦀 Rust</button>
            <button className={`${styles.chip} ${filter === "applied" ? styles.chipOn : ""}`} onClick={() => setFilter("applied")}>Applied</button>
            <button className={`${styles.chip} ${filter === "interviewing" ? styles.chipOn : ""}`} onClick={() => setFilter("interviewing")}>Interviewing</button>
            <button className={`${styles.chip} ${filter === "offer" ? styles.chipOn : ""}`} onClick={() => setFilter("offer")}>🎉 Offer</button>
          </div>
          <button className={styles.addBtn} onClick={() => openLogModal()}><span>+</span> Log Application</button>
        </div>
      </div>
      <div className={styles.card} style={{ padding: 0, overflow: "hidden" }}>
        <div className={styles.tableWrap}>
          {rows.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📬</div>
              <div className={styles.emptyTitle}>No applications yet</div>
              <div className={styles.emptySub}>Hit <strong>+ Log Application</strong> after each apply</div>
            </div>
          ) : (
            <table className={styles.table}>
              <thead><tr><th>Date</th><th>Role</th><th>Company</th><th>Board</th><th>Status</th><th>Follow-up</th><th>Notes</th><th /></tr></thead>
              <tbody>
                {rows.map((a) => (
                  <tr key={a.id} className={selectedId === a.id ? "sel" : ""} onClick={() => { setSelectedId(a.id); setDrawerStatus(a.status); }}>
                    <td style={{ whiteSpace: "nowrap", color: "var(--mu)" }}>{a.date || "—"}</td>
                    <td><span className={`${styles.badge} ${a.role === "flutter" ? styles.bFlutter : styles.bRust}`}>{a.role === "flutter" ? "🐦 Flutter" : "🦀 Rust"}</span></td>
                    <td><span className={styles.coName}>{a.company}</span></td>
                    <td style={{ color: "var(--mu)" }}>{a.board || "—"}</td>
                    <td><span className={`${styles.badge} ${styles[STATUS_BADGE_CLASS[a.status]]}`}>{STATUS_LABEL[a.status]}</span></td>
                    <td style={{ color: "var(--mu)", whiteSpace: "nowrap" }}>{a.followup || "—"}</td>
                    <td style={{ maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "var(--li)" }} title={a.notes || ""}>{a.notes || "—"}</td>
                    <td><button className={styles.delBtn} onClick={(e) => { e.stopPropagation(); void deleteApp(a.id); }}>✕</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Drawer */}
      {selectedApp && <div onClick={() => setSelectedId(null)} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,.3)", zIndex: 149, backdropFilter: "blur(2px)" }} />}
      <div className={`${styles.drawer} ${selectedApp ? styles.drawerOpen : ""}`}>
        {selectedApp && (
          <>
            <div className={styles.drawerHd}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className={styles.drawerRole}>{selectedApp.role === "flutter" ? "🐦 Flutter Engineer" : "🦀 Rust Systems Engineer"}</div>
                <div className={styles.drawerCo}>{selectedApp.company}</div>
              </div>
              <button className={styles.closeBtn} onClick={() => setSelectedId(null)}>✕</button>
            </div>
            <div className={styles.drawerStatusRow}>
              <span className={`${styles.badge} ${styles[STATUS_BADGE_CLASS[drawerStatus]]}`}>{STATUS_LABEL[drawerStatus]}</span>
              <select
                className={styles.drawerStatusSelect}
                value={drawerStatus}
                onChange={(e) => void updateAppStatus(selectedApp.id, e.target.value as ApplicationStatus)}
              >
                {(Object.keys(STATUS_LABEL) as ApplicationStatus[]).map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
              </select>
            </div>
            <div className={styles.drawerFields}>
              <div><div className={styles.dfLabel}>📅 Date</div><div className={styles.dfVal}>{selectedApp.date || "—"}</div></div>
              <div><div className={styles.dfLabel}>🔗 Board</div><div className={styles.dfVal}>{selectedApp.board || "—"}</div></div>
              <div><div className={styles.dfLabel}>⏰ Follow-up</div><div className={styles.dfVal}>{selectedApp.followup || "Not set"}</div></div>
              <div>
                <div className={styles.dfLabel}>🌐 URL</div>
                <div className={styles.dfVal}>
                  {selectedApp.url ? <a href={selectedApp.url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--f)", wordBreak: "break-all" }}>{selectedApp.url} ↗</a> : "No URL saved"}
                </div>
              </div>
              <div><div className={styles.dfLabel}>📝 Notes</div><div className={styles.dfVal} style={{ whiteSpace: "pre-wrap", lineHeight: 1.8, background: "#F8FAFC", borderRadius: 10, padding: 12, fontSize: 12 }}>{selectedApp.notes || "No notes added."}</div></div>
            </div>
            <div className={styles.drawerFoot}>
              <button className={styles.btnCancel} style={{ color: "var(--red)", borderColor: "#fecaca" }} onClick={() => void deleteApp(selectedApp.id)}>🗑 Remove</button>
              <button className={styles.btnSave} onClick={() => setSelectedId(null)}>Done</button>
            </div>
          </>
        )}
      </div>

      {/* Log Application Modal */}
      <div className={`${styles.overlay} ${modalOpen ? styles.overlayOpen : ""}`} onClick={(e) => { if (e.target === e.currentTarget) setModalOpen(false); }}>
        {modalOpen && (
          <div className={styles.modal}>
            <div className={styles.modalHd}><div className={styles.modalTitle}>📝 Log Application</div><button className={styles.closeBtn} onClick={() => setModalOpen(false)}>✕</button></div>
            <div className={styles.formGrid}>
              <div className={styles.ff}><label>Date Applied</label><input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} /></div>
              <div className={styles.ff}>
                <label>Role</label>
                <select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as JobRole }))}>
                  <option value="flutter">🐦 Flutter Engineer</option>
                  <option value="rust">🦀 Rust Systems Engineer</option>
                </select>
              </div>
              <div className={styles.ff}><label>Company</label><input type="text" placeholder="e.g. Coinme" value={form.company} onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))} /></div>
              <div className={styles.ff}>
                <label>Job Board</label>
                <select value={form.board} onChange={(e) => setForm((f) => ({ ...f, board: e.target.value }))}>
                  {["LinkedIn", "Wellfound", "We Work Remotely", "Arc.dev", "RustJobs.dev", "Web3 Career", "ZK Jobs Board", "Other"].map((b) => <option key={b}>{b}</option>)}
                </select>
              </div>
              <div className={styles.ff}>
                <label>Status</label>
                <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as ApplicationStatus }))}>
                  {(Object.keys(STATUS_LABEL) as ApplicationStatus[]).map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                </select>
              </div>
              <div className={styles.ff}><label>Follow-up Date</label><input type="date" value={form.followup} onChange={(e) => setForm((f) => ({ ...f, followup: e.target.value }))} /></div>
              <div className={`${styles.ff} ${styles.ffFull}`}><label>Job Listing URL</label><input type="url" placeholder="https://..." value={form.url} onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))} /></div>
              <div className={`${styles.ff} ${styles.ffFull}`}><label>Notes / Tailoring</label><textarea placeholder="e.g. Emphasised ZK background…" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} /></div>
            </div>
            {saveError && <div style={{ color: "var(--red)", fontSize: 12, marginBottom: 10 }}>{saveError}</div>}
            <div className={styles.modalFoot}>
              <button className={styles.btnCancel} onClick={() => setModalOpen(false)}>Cancel</button>
              <button className={styles.btnSave} disabled={saving} onClick={() => void handleSaveApp()}>{saving ? "Saving…" : "Save Application"}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
