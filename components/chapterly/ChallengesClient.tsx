"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Flame,
  BookOpen,
  Clock,
  Highlighter,
  FileText,
  Trophy,
  Plus,
  CheckCircle2,
  Loader2,
  X,
  Zap,
} from "lucide-react";
import type { PrebuiltChallenge } from "@/lib/chapterly/challenges";
import { PREBUILT_CHALLENGES, DIFFICULTY_STYLES } from "@/lib/chapterly/challenges";

const ACCENT = "var(--ch-accent)";

const TYPE_ICONS: Record<PrebuiltChallenge["type"], React.ReactElement> = {
  streak:     <Flame size={16} />,
  books:      <BookOpen size={16} />,
  time:       <Clock size={16} />,
  highlights: <Highlighter size={16} />,
  pages:      <FileText size={16} />,
};

const TYPE_UNITS: Record<PrebuiltChallenge["type"], string> = {
  streak:     "days",
  books:      "books",
  time:       "minutes",
  highlights: "highlights",
  pages:      "pages",
};

interface ChallengEntry {
  id: string;
  user_id: string;
  challenge_ref: string | null;
  challenge_id: string | null;
  joined_at: string;
  completed_at: string | null;
  progress: number;
}

interface CustomChallenge {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  type: PrebuiltChallenge["type"];
  target: number;
  duration_days: number;
  difficulty: PrebuiltChallenge["difficulty"];
  ends_at: string | null;
  created_at: string;
}

interface Props {
  prebuilt: PrebuiltChallenge[];
  customChallenges: CustomChallenge[];
  entries: ChallengEntry[];
}

export function ChallengesClient({ prebuilt, customChallenges, entries }: Props): React.ReactElement {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [tab, setTab] = useState<"browse" | "active" | "create">("browse");
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [leavingId, setLeavingId] = useState<string | null>(null);

  // Create form state
  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "books" as PrebuiltChallenge["type"],
    target: 3,
    duration_days: 30,
    difficulty: "medium" as PrebuiltChallenge["difficulty"],
  });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const entryMap = new Map(entries.map((e) => [e.challenge_ref ?? e.challenge_id ?? "", e]));

  const joinPrebuilt = async (id: string): Promise<void> => {
    setJoiningId(id);
    try {
      const res = await fetch("/api/chapterly/challenges", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "join", challenge_ref: id }),
      });
      if (!res.ok) throw new Error("Join failed");
      startTransition(() => router.refresh());
    } catch (err) {
      console.error("[challenges] join error:", err);
    } finally {
      setJoiningId(null);
    }
  };

  const leaveChallenge = async (challengeRef?: string, challengeId?: string): Promise<void> => {
    const key = challengeRef ?? challengeId ?? "";
    setLeavingId(key);
    try {
      const res = await fetch("/api/chapterly/challenges", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "leave",
          ...(challengeRef ? { challenge_ref: challengeRef } : {}),
          ...(challengeId ? { challenge_id: challengeId } : {}),
        }),
      });
      if (!res.ok) throw new Error("Leave failed");
      startTransition(() => router.refresh());
    } catch (err) {
      console.error("[challenges] leave error:", err);
    } finally {
      setLeavingId(null);
    }
  };

  const createChallenge = async (): Promise<void> => {
    if (!form.title.trim()) {
      setCreateError("Title is required.");
      return;
    }
    setCreating(true);
    setCreateError("");
    try {
      const res = await fetch("/api/chapterly/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim() || undefined,
          type: form.type,
          target: form.target,
          duration_days: form.duration_days,
          difficulty: form.difficulty,
        }),
      });
      if (!res.ok) throw new Error("Create failed");
      setForm({ title: "", description: "", type: "books", target: 3, duration_days: 30, difficulty: "medium" });
      setTab("active");
      startTransition(() => router.refresh());
    } catch (err) {
      console.error("[challenges] create error:", err);
      setCreateError("Failed to create challenge. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  const activeEntries = entries.filter((e) => !e.completed_at);
  const completedEntries = entries.filter((e) => e.completed_at);

  return (
    <div className="px-10 pt-12 pb-12 max-256:pt-20 max-180:px-6 max-180:pb-8 max-w-[900px]">
      {/* Header */}
      <div className="mb-10">
        <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted-foreground mb-1.5">
          {PREBUILT_CHALLENGES.length} pre-built · unlimited custom
        </div>
        <h1 className="font-display text-[32px] font-normal tracking-[-0.02em] fvs-text text-(--ink) m-0 leading-[1.1]">
          Challenges
        </h1>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Active", value: activeEntries.length, icon: <Zap size={14} /> },
          { label: "Completed", value: completedEntries.length, icon: <CheckCircle2 size={14} /> },
          { label: "Custom", value: customChallenges.length, icon: <Trophy size={14} /> },
        ].map((s) => (
          <div key={s.label} className="rounded-xl p-4.5 border border-(--rule) bg-(--bg-2)">
            <div className="flex items-center gap-2 mb-2" style={{ color: ACCENT }}>
              {s.icon}
              <span className="font-mono text-[9px] tracking-[0.12em] uppercase text-muted-foreground">
                {s.label}
              </span>
            </div>
            <div className="text-[28px] font-bold text-(--ink)">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-0.5 mb-8 p-1 rounded-[10px] bg-(--bg-2) w-fit border border-(--rule)">
        {(["browse", "active", "create"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex items-center gap-1.75 px-3.5 py-2 rounded-[7px] font-mono text-[10px] tracking-widest uppercase font-semibold border-none cursor-pointer transition-all"
            style={
              tab === t
                ? { background: ACCENT, color: "var(--ch-bg)" }
                : { background: "transparent", color: "var(--ink-3)" }
            }
          >
            {t === "browse" && <BookOpen size={12} />}
            {t === "active" && <Zap size={12} />}
            {t === "create" && <Plus size={12} />}
            {t === "browse" ? "Browse" : t === "active" ? `Active${activeEntries.length > 0 ? ` (${activeEntries.length})` : ""}` : "Create"}
          </button>
        ))}
      </div>

      {/* Browse tab — pre-built challenges grid */}
      {tab === "browse" && (
        <div className="grid grid-cols-2 max-160:grid-cols-1 gap-4">
          {PREBUILT_CHALLENGES.map((ch) => {
            const entry = entryMap.get(ch.id);
            const joined = !!entry;
            const diffStyle = DIFFICULTY_STYLES[ch.difficulty];
            const isJoining = joiningId === ch.id;
            const isLeaving = leavingId === ch.id;

            return (
              <div
                key={ch.id}
                className="rounded-2xl border border-(--rule) bg-(--bg-2) p-5.5 flex flex-col"
              >
                <div className="flex items-start justify-between gap-2.5 mb-3.5">
                  <div className="flex items-center gap-2.5">
                    <span className="text-[22px]" aria-hidden="true">{ch.icon}</span>
                    <div>
                      <div className="font-semibold text-[14px] text-(--ink) leading-[1.2]">{ch.title}</div>
                      <div
                        className="font-mono text-[9px] tracking-widest uppercase mt-1 inline-block px-1.75 py-0.5 rounded-full"
                        style={{ background: diffStyle.bg, color: diffStyle.color }}
                      >
                        {diffStyle.label}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.25 shrink-0" style={{ color: ACCENT }}>
                    {TYPE_ICONS[ch.type]}
                  </div>
                </div>

                <p className="text-[12px] leading-[1.6] text-muted-foreground m-0 mb-3.5 flex-1">
                  {ch.description}
                </p>

                <div className="flex items-center justify-between mb-3.5">
                  <div className="font-mono text-[10px] text-muted-foreground">
                    Target: <span className="text-(--ink) font-semibold">{ch.target} {TYPE_UNITS[ch.type]}</span>
                  </div>
                  <div className="font-mono text-[10px] text-muted-foreground">
                    {ch.duration_days}d
                  </div>
                </div>

                {joined ? (
                  <button
                    onClick={() => void leaveChallenge(ch.id)}
                    disabled={isLeaving || isPending}
                    className="w-full h-9 rounded-lg border border-(--rule) bg-transparent font-mono text-[9px] tracking-widest uppercase cursor-pointer transition-all disabled:opacity-40 flex items-center justify-center gap-1.5 text-muted-foreground hover:text-red-500 hover:border-red-400"
                  >
                    {isLeaving ? <Loader2 size={11} className="animate-spin" /> : <X size={11} />}
                    Leave
                  </button>
                ) : (
                  <button
                    onClick={() => void joinPrebuilt(ch.id)}
                    disabled={isJoining || isPending}
                    className="w-full h-9 rounded-lg border-none font-mono text-[9px] tracking-widest uppercase cursor-pointer transition-all disabled:opacity-40 flex items-center justify-center gap-1.5 font-semibold text-(--ch-bg) hover:opacity-90"
                    style={{ background: ACCENT }}
                  >
                    {isJoining ? <Loader2 size={11} className="animate-spin" /> : <Plus size={11} />}
                    Join Challenge
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Active tab */}
      {tab === "active" && (
        <div className="space-y-4">
          {activeEntries.length === 0 && (
            <div className="text-center py-16 rounded-2xl border border-(--rule) bg-(--bg-2) p-8">
              <Zap size={36} className="mx-auto mb-4 opacity-20" style={{ color: ACCENT }} />
              <div className="font-mono text-[11px] tracking-widest uppercase text-muted-foreground">
                No active challenges
              </div>
              <div className="text-[13px] text-muted-foreground mt-1.5">
                Browse pre-built challenges or create your own.
              </div>
              <button
                onClick={() => setTab("browse")}
                className="mt-4 inline-flex items-center gap-1.5 font-mono text-[10px] tracking-widest uppercase font-semibold px-4 py-2 rounded-lg border-none cursor-pointer text-(--ch-bg) transition-all hover:opacity-90"
                style={{ background: ACCENT }}
              >
                <BookOpen size={11} />
                Browse Challenges
              </button>
            </div>
          )}

          {activeEntries.map((entry) => {
            const prebuiltCh = entry.challenge_ref ? PREBUILT_CHALLENGES.find((c) => c.id === entry.challenge_ref) : null;
            const customCh = entry.challenge_id ? customChallenges.find((c) => c.id === entry.challenge_id) : null;
            const ch = prebuiltCh ?? customCh;
            if (!ch) return null;

            const diffStyle = DIFFICULTY_STYLES[ch.difficulty];
            const progress = Math.min(100, Math.round((entry.progress / ch.target) * 100));

            return (
              <div key={entry.id} className="rounded-2xl border border-(--rule) bg-(--bg-2) p-5.5">
                <div className="flex items-start justify-between gap-2.5 mb-3">
                  <div>
                    {"icon" in ch && <span className="text-[18px] mr-2" aria-hidden="true">{ch.icon}</span>}
                    <span className="font-semibold text-[14px] text-(--ink)">{ch.title}</span>
                    <span
                      className="font-mono text-[9px] tracking-widest uppercase ml-2.5 px-1.75 py-0.5 rounded-full inline-block"
                      style={{ background: diffStyle.bg, color: diffStyle.color }}
                    >
                      {diffStyle.label}
                    </span>
                  </div>
                  <button
                    onClick={() => void leaveChallenge(entry.challenge_ref ?? undefined, entry.challenge_id ?? undefined)}
                    disabled={leavingId === (entry.challenge_ref ?? entry.challenge_id ?? "")}
                    className="w-7 h-7 flex items-center justify-center rounded-md border border-(--rule) bg-transparent cursor-pointer text-muted-foreground hover:text-red-500 transition-colors disabled:opacity-40 shrink-0"
                    aria-label="Leave challenge"
                  >
                    {leavingId === (entry.challenge_ref ?? entry.challenge_id) ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <X size={12} />
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[10px] text-muted-foreground">
                    Progress: {entry.progress} / {ch.target} {TYPE_UNITS[ch.type]}
                  </span>
                  <span className="font-mono text-[10px] font-semibold" style={{ color: ACCENT }}>
                    {progress}%
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-(--rule)">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${ACCENT}, color-mix(in srgb, var(--ch-accent) 60%, white))` }}
                  />
                </div>

                <div className="font-mono text-[10px] text-muted-foreground mt-2">
                  Joined {new Date(entry.joined_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create tab */}
      {tab === "create" && (
        <div className="max-w-[560px]">
          <div className="rounded-[20px] border border-(--rule) bg-(--bg-2) p-7 space-y-5">
            <div>
              <label className="font-mono text-[10px] tracking-[0.12em] uppercase text-muted-foreground block mb-1.5">
                Challenge Name *
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Read before bed every night"
                maxLength={100}
                className="w-full text-[14px] px-3.5 py-2.5 rounded-lg border border-(--rule) bg-(--bg) text-(--ink) outline-none focus:border-secondary-foreground transition-colors"
              />
            </div>

            <div>
              <label className="font-mono text-[10px] tracking-[0.12em] uppercase text-muted-foreground block mb-1.5">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="What are you trying to achieve?"
                rows={2}
                maxLength={300}
                className="w-full text-[14px] leading-[1.6] px-3.5 py-2.5 rounded-lg border border-(--rule) bg-(--bg) text-(--ink) outline-none focus:border-secondary-foreground transition-colors resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-mono text-[10px] tracking-[0.12em] uppercase text-muted-foreground block mb-1.5">
                  Type
                </label>
                <select
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as PrebuiltChallenge["type"] }))}
                  className="w-full text-[13px] px-3 py-2.25 rounded-lg border border-(--rule) bg-(--bg) text-(--ink) outline-none cursor-pointer"
                >
                  <option value="streak">Daily Streak</option>
                  <option value="books">Books Finished</option>
                  <option value="time">Reading Time (min)</option>
                  <option value="highlights">Highlights Made</option>
                  <option value="pages">Pages Read</option>
                </select>
              </div>
              <div>
                <label className="font-mono text-[10px] tracking-[0.12em] uppercase text-muted-foreground block mb-1.5">
                  Difficulty
                </label>
                <select
                  value={form.difficulty}
                  onChange={(e) => setForm((f) => ({ ...f, difficulty: e.target.value as PrebuiltChallenge["difficulty"] }))}
                  className="w-full text-[13px] px-3 py-2.25 rounded-lg border border-(--rule) bg-(--bg) text-(--ink) outline-none cursor-pointer"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-mono text-[10px] tracking-[0.12em] uppercase text-muted-foreground block mb-1.5">
                  Target ({TYPE_UNITS[form.type]})
                </label>
                <input
                  type="number"
                  min={1}
                  max={10000}
                  value={form.target}
                  onChange={(e) => setForm((f) => ({ ...f, target: Math.max(1, parseInt(e.target.value) || 1) }))}
                  className="w-full text-[14px] px-3.5 py-2.5 rounded-lg border border-(--rule) bg-(--bg) text-(--ink) outline-none focus:border-secondary-foreground transition-colors"
                />
              </div>
              <div>
                <label className="font-mono text-[10px] tracking-[0.12em] uppercase text-muted-foreground block mb-1.5">
                  Duration (days)
                </label>
                <input
                  type="number"
                  min={1}
                  max={365}
                  value={form.duration_days}
                  onChange={(e) => setForm((f) => ({ ...f, duration_days: Math.max(1, parseInt(e.target.value) || 1) }))}
                  className="w-full text-[14px] px-3.5 py-2.5 rounded-lg border border-(--rule) bg-muted-foreground bg-(--bg) text-(--ink) outline-none focus:border-secondary-foreground transition-colors"
                />
              </div>
            </div>

            {createError && (
              <div className="font-mono text-[11px] text-red-500 bg-red-500/10 rounded-lg px-3.5 py-2.5">
                {createError}
              </div>
            )}

            <button
              onClick={() => void createChallenge()}
              disabled={creating || !form.title.trim()}
              className="w-full h-11 flex items-center justify-center gap-2 font-mono text-[10px] tracking-[0.12em] uppercase font-semibold rounded-[10px] border-none cursor-pointer transition-all hover:opacity-90 disabled:opacity-40 text-(--ch-bg)"
              style={{ background: ACCENT }}
            >
              {creating ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Plus size={14} />
              )}
              {creating ? "Creating…" : "Create Challenge"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
