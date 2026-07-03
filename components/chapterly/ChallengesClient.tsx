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

const ACCENT = "#4F6D7A";

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
    <div className="px-[40px] pt-[48px] pb-[48px] max-[1024px]:pt-[80px] max-[720px]:px-[24px] max-[720px]:pb-[32px] max-w-[900px]">
      {/* Header */}
      <div className="mb-[40px]">
        <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-[var(--ink-3)] mb-[6px]">
          {PREBUILT_CHALLENGES.length} pre-built · unlimited custom
        </div>
        <h1 className="font-display text-[32px] font-normal tracking-[-0.02em] fvs-text text-[var(--ink)] m-0 leading-[1.1]">
          Challenges
        </h1>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-[16px] mb-[32px]">
        {[
          { label: "Active", value: activeEntries.length, icon: <Zap size={14} /> },
          { label: "Completed", value: completedEntries.length, icon: <CheckCircle2 size={14} /> },
          { label: "Custom", value: customChallenges.length, icon: <Trophy size={14} /> },
        ].map((s) => (
          <div key={s.label} className="rounded-[12px] p-[18px] border border-[var(--rule)] bg-[var(--bg-2)]">
            <div className="flex items-center gap-[8px] mb-[8px]" style={{ color: ACCENT }}>
              {s.icon}
              <span className="font-mono text-[9px] tracking-[0.12em] uppercase text-[var(--ink-3)]">
                {s.label}
              </span>
            </div>
            <div className="text-[28px] font-bold text-[var(--ink)]">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-[2px] mb-[32px] p-[4px] rounded-[10px] bg-[var(--bg-2)] w-fit border border-[var(--rule)]">
        {(["browse", "active", "create"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex items-center gap-[7px] px-[14px] py-[8px] rounded-[7px] font-mono text-[10px] tracking-[0.1em] uppercase font-semibold border-none cursor-pointer transition-all"
            style={
              tab === t
                ? { background: ACCENT, color: "#fff" }
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
        <div className="grid grid-cols-2 max-[640px]:grid-cols-1 gap-[16px]">
          {PREBUILT_CHALLENGES.map((ch) => {
            const entry = entryMap.get(ch.id);
            const joined = !!entry;
            const diffStyle = DIFFICULTY_STYLES[ch.difficulty];
            const isJoining = joiningId === ch.id;
            const isLeaving = leavingId === ch.id;

            return (
              <div
                key={ch.id}
                className="rounded-[16px] border border-[var(--rule)] bg-[var(--bg-2)] p-[22px] flex flex-col"
              >
                <div className="flex items-start justify-between gap-[10px] mb-[14px]">
                  <div className="flex items-center gap-[10px]">
                    <span className="text-[22px]" aria-hidden="true">{ch.icon}</span>
                    <div>
                      <div className="font-semibold text-[14px] text-[var(--ink)] leading-[1.2]">{ch.title}</div>
                      <div
                        className="font-mono text-[9px] tracking-[0.1em] uppercase mt-[4px] inline-block px-[7px] py-[2px] rounded-full"
                        style={{ background: diffStyle.bg, color: diffStyle.color }}
                      >
                        {diffStyle.label}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-[5px] shrink-0" style={{ color: ACCENT }}>
                    {TYPE_ICONS[ch.type]}
                  </div>
                </div>

                <p className="text-[12px] leading-[1.6] text-[var(--ink-3)] m-0 mb-[14px] flex-1">
                  {ch.description}
                </p>

                <div className="flex items-center justify-between mb-[14px]">
                  <div className="font-mono text-[10px] text-[var(--ink-3)]">
                    Target: <span className="text-[var(--ink)] font-semibold">{ch.target} {TYPE_UNITS[ch.type]}</span>
                  </div>
                  <div className="font-mono text-[10px] text-[var(--ink-3)]">
                    {ch.duration_days}d
                  </div>
                </div>

                {joined ? (
                  <button
                    onClick={() => void leaveChallenge(ch.id)}
                    disabled={isLeaving || isPending}
                    className="w-full h-[36px] rounded-[8px] border border-[var(--rule)] bg-transparent font-mono text-[9px] tracking-[0.1em] uppercase cursor-pointer transition-all disabled:opacity-40 flex items-center justify-center gap-[6px] text-[var(--ink-3)] hover:text-red-500 hover:border-red-400"
                  >
                    {isLeaving ? <Loader2 size={11} className="animate-spin" /> : <X size={11} />}
                    Leave
                  </button>
                ) : (
                  <button
                    onClick={() => void joinPrebuilt(ch.id)}
                    disabled={isJoining || isPending}
                    className="w-full h-[36px] rounded-[8px] border-none font-mono text-[9px] tracking-[0.1em] uppercase cursor-pointer transition-all disabled:opacity-40 flex items-center justify-center gap-[6px] font-semibold text-white hover:opacity-90"
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
        <div className="space-y-[16px]">
          {activeEntries.length === 0 && (
            <div className="text-center py-[64px] rounded-[16px] border border-[var(--rule)] bg-[var(--bg-2)] p-[32px]">
              <Zap size={36} className="mx-auto mb-[16px] opacity-20" style={{ color: ACCENT }} />
              <div className="font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--ink-3)]">
                No active challenges
              </div>
              <div className="text-[13px] text-[var(--ink-3)] mt-[6px]">
                Browse pre-built challenges or create your own.
              </div>
              <button
                onClick={() => setTab("browse")}
                className="mt-[16px] inline-flex items-center gap-[6px] font-mono text-[10px] tracking-[0.1em] uppercase font-semibold px-[16px] py-[8px] rounded-[8px] border-none cursor-pointer text-white transition-all hover:opacity-90"
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
              <div key={entry.id} className="rounded-[16px] border border-[var(--rule)] bg-[var(--bg-2)] p-[22px]">
                <div className="flex items-start justify-between gap-[10px] mb-[12px]">
                  <div>
                    {"icon" in ch && <span className="text-[18px] mr-[8px]" aria-hidden="true">{ch.icon}</span>}
                    <span className="font-semibold text-[14px] text-[var(--ink)]">{ch.title}</span>
                    <span
                      className="font-mono text-[9px] tracking-[0.1em] uppercase ml-[10px] px-[7px] py-[2px] rounded-full inline-block"
                      style={{ background: diffStyle.bg, color: diffStyle.color }}
                    >
                      {diffStyle.label}
                    </span>
                  </div>
                  <button
                    onClick={() => void leaveChallenge(entry.challenge_ref ?? undefined, entry.challenge_id ?? undefined)}
                    disabled={leavingId === (entry.challenge_ref ?? entry.challenge_id ?? "")}
                    className="w-[28px] h-[28px] flex items-center justify-center rounded-[6px] border border-[var(--rule)] bg-transparent cursor-pointer text-[var(--ink-3)] hover:text-red-500 transition-colors disabled:opacity-40 shrink-0"
                    aria-label="Leave challenge"
                  >
                    {leavingId === (entry.challenge_ref ?? entry.challenge_id) ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <X size={12} />
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between mb-[8px]">
                  <span className="font-mono text-[10px] text-[var(--ink-3)]">
                    Progress: {entry.progress} / {ch.target} {TYPE_UNITS[ch.type]}
                  </span>
                  <span className="font-mono text-[10px] font-semibold" style={{ color: ACCENT }}>
                    {progress}%
                  </span>
                </div>
                <div className="h-[6px] rounded-full bg-[var(--rule)]">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${ACCENT}, #6B8FA0)` }}
                  />
                </div>

                <div className="font-mono text-[10px] text-[var(--ink-3)] mt-[8px]">
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
          <div className="rounded-[20px] border border-[var(--rule)] bg-[var(--bg-2)] p-[28px] space-y-[20px]">
            <div>
              <label className="font-mono text-[10px] tracking-[0.12em] uppercase text-[var(--ink-3)] block mb-[6px]">
                Challenge Name *
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Read before bed every night"
                maxLength={100}
                className="w-full text-[14px] px-[14px] py-[10px] rounded-[8px] border border-[var(--rule)] bg-[var(--bg)] text-[var(--ink)] outline-none focus:border-[var(--ink-2)] transition-colors"
              />
            </div>

            <div>
              <label className="font-mono text-[10px] tracking-[0.12em] uppercase text-[var(--ink-3)] block mb-[6px]">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="What are you trying to achieve?"
                rows={2}
                maxLength={300}
                className="w-full text-[14px] leading-[1.6] px-[14px] py-[10px] rounded-[8px] border border-[var(--rule)] bg-[var(--bg)] text-[var(--ink)] outline-none focus:border-[var(--ink-2)] transition-colors resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-[16px]">
              <div>
                <label className="font-mono text-[10px] tracking-[0.12em] uppercase text-[var(--ink-3)] block mb-[6px]">
                  Type
                </label>
                <select
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as PrebuiltChallenge["type"] }))}
                  className="w-full text-[13px] px-[12px] py-[9px] rounded-[8px] border border-[var(--rule)] bg-[var(--bg)] text-[var(--ink)] outline-none cursor-pointer"
                >
                  <option value="streak">Daily Streak</option>
                  <option value="books">Books Finished</option>
                  <option value="time">Reading Time (min)</option>
                  <option value="highlights">Highlights Made</option>
                  <option value="pages">Pages Read</option>
                </select>
              </div>
              <div>
                <label className="font-mono text-[10px] tracking-[0.12em] uppercase text-[var(--ink-3)] block mb-[6px]">
                  Difficulty
                </label>
                <select
                  value={form.difficulty}
                  onChange={(e) => setForm((f) => ({ ...f, difficulty: e.target.value as PrebuiltChallenge["difficulty"] }))}
                  className="w-full text-[13px] px-[12px] py-[9px] rounded-[8px] border border-[var(--rule)] bg-[var(--bg)] text-[var(--ink)] outline-none cursor-pointer"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-[16px]">
              <div>
                <label className="font-mono text-[10px] tracking-[0.12em] uppercase text-[var(--ink-3)] block mb-[6px]">
                  Target ({TYPE_UNITS[form.type]})
                </label>
                <input
                  type="number"
                  min={1}
                  max={10000}
                  value={form.target}
                  onChange={(e) => setForm((f) => ({ ...f, target: Math.max(1, parseInt(e.target.value) || 1) }))}
                  className="w-full text-[14px] px-[14px] py-[10px] rounded-[8px] border border-[var(--rule)] bg-[var(--bg)] text-[var(--ink)] outline-none focus:border-[var(--ink-2)] transition-colors"
                />
              </div>
              <div>
                <label className="font-mono text-[10px] tracking-[0.12em] uppercase text-[var(--ink-3)] block mb-[6px]">
                  Duration (days)
                </label>
                <input
                  type="number"
                  min={1}
                  max={365}
                  value={form.duration_days}
                  onChange={(e) => setForm((f) => ({ ...f, duration_days: Math.max(1, parseInt(e.target.value) || 1) }))}
                  className="w-full text-[14px] px-[14px] py-[10px] rounded-[8px] border border-[var(--rule)] bg-[var(--ink-3)] bg-[var(--bg)] text-[var(--ink)] outline-none focus:border-[var(--ink-2)] transition-colors"
                />
              </div>
            </div>

            {createError && (
              <div className="font-mono text-[11px] text-red-500 bg-red-500/10 rounded-[8px] px-[14px] py-[10px]">
                {createError}
              </div>
            )}

            <button
              onClick={() => void createChallenge()}
              disabled={creating || !form.title.trim()}
              className="w-full h-[44px] flex items-center justify-center gap-[8px] font-mono text-[10px] tracking-[0.12em] uppercase font-semibold rounded-[10px] border-none cursor-pointer transition-all hover:opacity-90 disabled:opacity-40 text-white"
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
