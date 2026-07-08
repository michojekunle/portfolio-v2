"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { FREE_BOOK_LIMIT } from "@/lib/chapterly/types";
import type {
  ChBookWithStats,
  ReadingStatus,
} from "@/lib/chapterly/types";
import {
  BookMarked,
  Plus,
  Search,
  Upload,
  X,
  BookOpen,
  CheckCircle,
  PauseCircle,
  XCircle,
  Circle,
  Loader2,
  AlertCircle,
  Sparkles,
  Pencil,
  Trash2,
  Camera,
  Save,
  Check,
  FileText,
  Cloud,
  HardDrive,
} from "lucide-react";
import { saveFileLocally } from "@/lib/chapterly/idb";
import { SummaryDrawer } from "./SummaryDrawer";
import type { SummaryBook } from "./SummaryDrawer";

const ACCENT = "var(--ch-accent)";

const STATUS_CONFIG: Record<
  ReadingStatus,
  { label: string; icon: React.ReactElement; color: string }
> = {
  unread: { label: "Unread", icon: <Circle size={12} />, color: "#9CA3AF" },
  reading: { label: "Reading", icon: <BookOpen size={12} />, color: ACCENT },
  finished: {
    label: "Finished",
    icon: <CheckCircle size={12} />,
    color: "#16A34A",
  },
  abandoned: {
    label: "Abandoned",
    icon: <XCircle size={12} />,
    color: "#DC2626",
  },
  on_hold: {
    label: "On Hold",
    icon: <PauseCircle size={12} />,
    color: "#D97706",
  },
};

const ALLOWED_EXTENSIONS = [
  ".pdf",
  ".epub",
  ".docx",
  ".txt",
  ".md",
  ".html",
  ".fb2",
  ".cbz",
];
const MAX_FILE_MB = 5;



interface RecommendedBook {
  title: string;
  author: string;
  tagline: string;
  description: string;
  cover_url: string;
  category: string;
  content: string;
}

const PICKS: RecommendedBook[] = [
  {
    title: "Atomic Habits",
    author: "James Clear",
    tagline: "Tiny changes, remarkable results.",
    description: "The definitive guide to building good habits and breaking bad ones using the science of small improvements.",
    cover_url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=200",
    category: "Productivity",
    content: `## Core Premise
Small habits compound into extraordinary results. A 1% improvement every day makes you 37× better in a year.

## Why This Book Matters
For anyone who has tried and failed to build lasting habits. James Clear reframes the problem: you don't rise to the level of your goals, you fall to the level of your systems.

## Key Insights

1. **Habits Are the Compound Interest of Self-Improvement**
Just as money multiplies through compound interest, the effects of your habits multiply as you repeat them. A slight change in daily habits can guide your life to a very different destination.

2. **Focus on Identity, Not Outcomes**
The most effective way to change your habits is to focus not on what you want to achieve, but on who you wish to become. Every action is a vote for the type of person you want to be.

3. **The 4 Laws of Behavior Change**
All habits follow the same loop: Cue → Craving → Response → Reward. To build a good habit: make it obvious, make it attractive, make it easy, make it satisfying.

4. **Environment Is the Invisible Hand**
Behavior is a function of the person in their environment. Design your surroundings so the right cues are visible and the wrong ones are hidden.

5. **The Two-Minute Rule**
When starting a new habit, scale it down to two minutes or less. "Read before bed" becomes "Read one page." The goal is to make starting effortless.

6. **Never Miss Twice**
Missing once is an accident. Missing twice is the start of a new habit. The first mistake never ruins you — it's the spiral of repeated mistakes that does.

7. **Habit Stacking**
Link a new habit to an existing one. "After I pour my morning coffee, I will journal for one minute." The existing habit becomes the cue.

## Memorable Quotes

> "You do not rise to the level of your goals. You fall to the level of your systems."

> "Every action you take is a vote for the type of person you wish to become."

## Action Steps

1. Choose one habit. Write the implementation intention: "I will [BEHAVIOR] at [TIME] in [LOCATION]."
2. Stack it onto something you already do automatically.
3. Prepare your environment the night before so the first action requires no decision.
4. Track it with a simple calendar — mark an X each day. Don't break the chain.
5. After 30 days, raise the difficulty by 1%.

## One-Line Takeaway
Build the system, become the person — the results follow automatically.`,
  },
  {
    title: "Deep Work",
    author: "Cal Newport",
    tagline: "Rules for focused success in a distracted world.",
    description: "The ability to focus without distraction is becoming rare and increasingly valuable. Newport argues it's the superpower of the 21st century.",
    cover_url: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=200",
    category: "Focus",
    content: `## Core Premise
Deep work — professional activity performed in a state of distraction-free concentration — is the skill that separates winners from everyone else in the knowledge economy.

## Why This Book Matters
For knowledge workers drowning in shallow busywork. Newport provides both the case for depth and a practical rulebook for achieving it.

## Key Insights

1. **Deep Work Is Rare and Valuable Simultaneously**
As attention becomes fragmented, the ability to do cognitively demanding work is both rarer and more economically rewarded. This is a structural arbitrage most people miss.

2. **Shallow Work Has an Invisible Cost**
Email, meetings, and social media feel productive but rarely create value that is hard to replicate. Treat shallow work as a cost to minimize, not a job to do well.

3. **Schedule Every Minute of Your Day**
Time blocking is about intentionality, not rigidity. When you decide in advance what you'll do with every hour, you reclaim time that would otherwise drift into low-value activities.

4. **Embrace Boredom**
The ability to concentrate is a skill that requires practice. If you seek distraction the moment you're bored, you undermine your capacity for depth. Train your attention like a muscle.

5. **Work Deeply, Then Disconnect Completely**
End each day with a shutdown ritual. Once you stop working, your brain continues processing in the background. Rest is productive — but only if you fully disconnect.

## Memorable Quotes

> "Clarity about what matters provides clarity about what does not."

> "The ability to perform deep work is becoming increasingly rare at exactly the same time it is becoming increasingly valuable."

## Action Steps

1. Block 90-minute deep work sessions in your calendar — treat them as immovable.
2. Choose a depth philosophy: monastic, bimodal, or rhythmic.
3. Create a shutdown ritual: review tasks, capture loose ends, say "shutdown complete."
4. Delete one social media app for 30 days. Note what you actually miss.
5. Track deep work hours weekly. Set a target and protect it.

## One-Line Takeaway
Depth is the rarest resource in modern work — and the one that compounds the most.`,
  },
  {
    title: "The Psychology of Money",
    author: "Morgan Housel",
    tagline: "Timeless lessons on wealth, greed, and happiness.",
    description: "Doing well with money has little to do with how smart you are and a lot to do with how you behave. 19 short stories that change how you think about wealth.",
    cover_url: "https://images.unsplash.com/photo-1565514020179-026b92b84bb6?auto=format&fit=crop&q=80&w=200",
    category: "Finance",
    content: `## Core Premise
Financial success is less about technical knowledge and more about behavior, time, and managing your own psychology under uncertainty.

## Why This Book Matters
For anyone who earns, saves, or invests. Housel reframes personal finance as a deeply human discipline — not a mathematical one.

## Key Insights

1. **No One Is Crazy**
Everyone's financial behavior makes sense given their personal history with money. Different experiences lead to radically different assumptions about risk and value.

2. **Wealth Is What You Don't See**
Real wealth is not the cars or houses people display — it's the money not spent, the freedom not yet exercised. Wealth is what remains invisible.

3. **Compounding Requires Staying in the Game**
Warren Buffett's wealth is largely a function of starting early and never stopping. Avoiding catastrophic loss matters more than maximizing returns.

4. **Save Like a Pessimist, Invest Like an Optimist**
Pessimism about the short run gives you a margin of safety. Optimism about the long run lets you hold through volatility. Both are necessary simultaneously.

5. **Freedom Is the Highest Dividend**
The highest form of wealth is the ability to wake up and do whatever you want, with whoever you want, for however long you want.

## Memorable Quotes

> "The most important financial skill is getting the goalpost to stop moving."

> "Wealth is the nice cars not purchased. The diamonds not bought."

> "Getting money requires taking risks. Keeping money requires the opposite."

## Action Steps

1. Define your "enough number" — the wealth that buys the freedom you actually want.
2. Set up automatic savings into an index fund. Never look at it during downturns.
3. Calculate how many hours of your life each major purchase costs.
4. Write a one-paragraph investment policy statement. Read it before any financial decision outside your plan.
5. Ask monthly: "Did I spend in ways that increased my actual freedom, or just my visible status?"

## One-Line Takeaway
The best financial plan is the one you can stick to through fear, greed, and every market condition.`,
  },
  {
    title: "Thinking, Fast and Slow",
    author: "Daniel Kahneman",
    tagline: "Two systems that drive the way we think.",
    description: "Nobel laureate Daniel Kahneman reveals the two cognitive systems that shape our judgments and the systematic biases that lead us astray.",
    cover_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
    category: "Psychology",
    content: `## Core Premise
The mind runs on two systems: fast intuitive thinking and slow deliberate reasoning. Understanding when each system fails is the foundation of sound judgment.

## Why This Book Matters
For anyone who makes decisions — which is everyone. Kahneman reveals systematic errors in human reasoning and gives you tools to catch yourself before costly mistakes.

## Key Insights

1. **System 1 vs System 2**
System 1 is fast, automatic, and largely unconscious. System 2 is slow, deliberate, and effortful. Most errors happen when System 1 overrides where System 2 should lead.

2. **Anchoring Is Everywhere**
The first number you encounter has a disproportionate influence on all subsequent judgments — even when it's completely irrelevant to the decision.

3. **Overconfidence Is the Most Destructive Bias**
People systematically overestimate their knowledge and underestimate uncertainty. Experts are often no better calibrated than laypeople in their predictions.

4. **Loss Aversion Shapes Every Decision**
Losses loom roughly twice as large as equivalent gains. This drives irrational risk aversion and resistance to change.

5. **The Remembering Self Runs Your Life**
We don't choose between experiences — we choose between memories of experiences. The peak and end of an experience matter far more than its duration.

## Memorable Quotes

> "Nothing in life is as important as you think it is, while you are thinking about it."

> "Our comforting conviction that the world makes sense rests on our almost unlimited ability to ignore our ignorance."

## Action Steps

1. Before a major decision, write your confidence level (0-100%) and key assumptions. Review in 3 months.
2. In negotiations, introduce your own anchor early rather than adjusting from theirs.
3. Apply the pre-mortem: imagine a project has failed before it starts. What went wrong?
4. When assessing risk, look up base rates — don't trust vividness.
5. For recurring high-stakes decisions, build rules instead of relying on intuition.

## One-Line Takeaway
Know which system is running your decisions — and when to override it.`,
  },
  {
    title: "The Almanack of Naval Ravikant",
    author: "Eric Jorgenson",
    tagline: "A guide to wealth and happiness.",
    description: "A curated collection of Naval Ravikant's wisdom on building wealth and achieving inner peace — compiled from years of tweets, podcasts, and essays.",
    cover_url: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&q=80&w=200",
    category: "Wealth & Philosophy",
    content: `## Core Premise
Wealth and happiness are learnable skills, not luck. Naval distills the principles behind both into a coherent, practical philosophy anyone can apply.

## Why This Book Matters
For people who want to build lasting wealth without sacrificing peace of mind. Naval's frameworks cut through conventional career advice with a fundamentally different model.

## Key Insights

1. **Seek Wealth, Not Money or Status**
Wealth is assets that earn while you sleep. Money is how you transfer time. Status is your rank in the hierarchy. Wealth is the real goal — it buys freedom.

2. **Specific Knowledge Cannot Be Trained**
Build skills at the intersection of what you're obsessed with, naturally good at, and what the world needs. This cannot be outsourced or automated.

3. **Leverage Is the Force Multiplier**
Code and media are the new leverage — they have zero marginal cost and can reach millions while you sleep. Build things that scale without you.

4. **Play Long-Term Games with Long-Term People**
All returns in life come from compound interest — in relationships, knowledge, and wealth. Choose people and fields where you can play for decades.

5. **Happiness Is a Skill, Not a Destination**
Happiness is the absence of desire — the recognition that the present moment is sufficient. It can be trained through meditation, presence, and reducing the stories you tell yourself.

## Memorable Quotes

> "Earn with your mind, not your time."

> "Desire is a contract you make with yourself to be unhappy until you get what you want."

> "The purpose of wealth is freedom. Nothing more, nothing less."

## Action Steps

1. Map your specific knowledge: what would you talk about obsessively even unpaid? Start building there.
2. Identify one type of leverage you can access — write, code, teach, or invest.
3. Audit last week: categorize time as wealth-building vs. status games. Eliminate the latter.
4. Begin 10 minutes of daily silence — observe thoughts without acting on them.
5. Write a personal definition of "enough." Optimize for reaching that, not for more.

## One-Line Takeaway
Wealth is freedom; happiness is peace — both are skills you build, not things that happen to you.`,
  },
];

// Rotates daily so all users see the same pick on a given day
function getDailyPick(): RecommendedBook {
  const start = new Date(new Date().getFullYear(), 0, 0).getTime();
  const dayOfYear = Math.floor((Date.now() - start) / 86_400_000);
  return PICKS[dayOfYear % PICKS.length] as RecommendedBook;
}

interface Props {
  books: ChBookWithStats[];
}

// ─── Edit Modal ──────────────────────────────────────────────────────────────

interface EditModalProps {
  book: ChBookWithStats;
  onClose: () => void;
  onSaved: (updated: ChBookWithStats) => void;
  onDeleted: (id: string) => void;
}

function EditBookModal({ book, onClose, onSaved, onDeleted }: EditModalProps): React.ReactElement {
  const [title, setTitle] = useState(book.title);
  const [author, setAuthor] = useState(book.author ?? "");
  const [status, setStatus] = useState<ReadingStatus>(book.status);
  const [coverPreview, setCoverPreview] = useState<string | null>(book.cover_url ?? null);
  const [coverBase64, setCoverBase64] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const coverInputRef = useRef<HTMLInputElement>(null);

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError("Cover image must be under 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setCoverPreview(dataUrl);
      setCoverBase64(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (): Promise<void> => {
    if (!title.trim()) { setError("Title is required."); return; }
    setSaving(true);
    setError(null);
    try {
      const body: Record<string, unknown> = {
        title: title.trim(),
        author: author.trim() || null,
        status,
      };
      if (coverBase64) body.cover_url = coverBase64;

      const res = await fetch(`/api/chapterly/books/${book.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(d.error ?? "Failed to save");
      }
      const { book: updated } = await res.json() as { book: ChBookWithStats };
      setSaved(true);
      onSaved({ ...updated, total_reading_time_minutes: book.total_reading_time_minutes, highlight_count: book.highlight_count, note_count: book.note_count, session_count: book.session_count });
      setTimeout(onClose, 600);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleCloudSync = async (): Promise<void> => {
    if (!book.file_url.startsWith("local://")) return;
    setSyncing(true);
    setError(null);
    try {
      const localId = book.file_url.replace("local://", "");
      const { getLocalFile, deleteLocalFile } = await import("@/lib/chapterly/idb");
      const blob = await getLocalFile(localId);
      if (!blob) throw new Error("Local file not found on this device");

      const file = new File([blob], `${book.title}.${book.file_format}`, { type: blob.type });

      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title.trim() || book.title);
      formData.append("book_id", book.id); // Triggers update instead of insert

      const res = await fetch("/api/chapterly/upload", { method: "POST", body: formData });
      if (!res.ok) {
        const d = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(d.error ?? "Failed to sync to cloud");
      }

      const { book: updated } = await res.json() as { book: ChBookWithStats };
      
      // Clean up local file
      await deleteLocalFile(localId);

      onSaved({ ...updated, total_reading_time_minutes: book.total_reading_time_minutes, highlight_count: book.highlight_count, note_count: book.note_count, session_count: book.session_count });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sync failed");
    } finally {
      setSyncing(false);
    }
  };

  const handleDelete = async (): Promise<void> => {
    setDeleting(true);
    setError(null);
    try {
      try {
        const res = await fetch(`/api/chapterly/books/${book.id}`, { method: "DELETE" });
        if (!res.ok && res.status !== 404) throw new Error("Failed to delete from server");
      } catch (err) {
        if (navigator.onLine) throw err;
      }

      if (book.file_url.startsWith("local://")) {
        const localId = book.file_url.replace("local://", "");
        const { deleteLocalFile } = await import("@/lib/chapterly/idb");
        await deleteLocalFile(localId);
      }

      try {
        const q = JSON.parse(localStorage.getItem("chapterly_queued_books") || "[]") as ChBookWithStats[];
        const remaining = q.filter(b => b.id !== book.id);
        localStorage.setItem("chapterly_queued_books", JSON.stringify(remaining));
      } catch {}

      onDeleted(book.id);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
      setDeleting(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-[520px] rounded-[20px] shadow-2xl border border-[var(--rule)] bg-[var(--bg)] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-[24px] py-[18px] border-b border-[var(--rule)]">
          <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-[var(--ink-3)]">
            Edit Book
          </div>
          <button
            onClick={onClose}
            className="w-[28px] h-[28px] rounded-[6px] flex items-center justify-center border-none bg-transparent cursor-pointer text-[var(--ink-3)] hover:text-[var(--ink)] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-[24px] space-y-[20px]">
          {/* Cover + title/author side-by-side */}
          <div className="flex items-start gap-[20px]">
            {/* Cover picker */}
            <div className="shrink-0">
              <div
                className="w-[88px] h-[120px] rounded-[10px] relative overflow-hidden cursor-pointer group border border-[var(--rule)]"
                style={{ background: "color-mix(in srgb, var(--ch-accent) 9%, transparent)" }}
                onClick={() => coverInputRef.current?.click()}
                title="Change cover"
              >
                {coverPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={coverPreview}
                    alt="Cover"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookMarked size={28} style={{ color: ACCENT, opacity: 0.5 }} />
                  </div>
                )}
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-[4px] transition-opacity">
                  <Camera size={18} className="text-white" />
                  <span className="font-mono text-[8px] uppercase tracking-[0.08em] text-white">
                    Change
                  </span>
                </div>
              </div>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleCoverChange}
              />
              <button
                onClick={() => coverInputRef.current?.click()}
                className="mt-[6px] w-full font-mono text-[8px] tracking-[0.08em] uppercase text-center text-[var(--ink-3)] hover:text-[var(--ink)] bg-transparent border-none cursor-pointer p-0 transition-colors"
              >
                Upload cover
              </button>
            </div>

            {/* Title + Author */}
            <div className="flex-1 space-y-[12px]">
              <div>
                <label className="font-mono text-[9px] tracking-[0.1em] uppercase text-[var(--ink-3)] block mb-[6px]">
                  Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full h-[40px] px-[12px] rounded-[8px] text-[14px] outline-none bg-[var(--bg-2)] border border-[var(--rule)] text-[var(--ink)] focus:border-[var(--ink-2)] transition-colors"
                  placeholder="Book title"
                />
              </div>
              <div>
                <label className="font-mono text-[9px] tracking-[0.1em] uppercase text-[var(--ink-3)] block mb-[6px]">
                  Author
                </label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full h-[40px] px-[12px] rounded-[8px] text-[14px] outline-none bg-[var(--bg-2)] border border-[var(--rule)] text-[var(--ink)] focus:border-[var(--ink-2)] transition-colors"
                  placeholder="Author name"
                />
              </div>
            </div>
          </div>

          {/* Status selector */}
          <div>
            <label className="font-mono text-[9px] tracking-[0.1em] uppercase text-[var(--ink-3)] block mb-[10px]">
              Reading Status
            </label>
            <div className="grid grid-cols-3 max-[360px]:grid-cols-2 gap-[8px]">
              {(Object.keys(STATUS_CONFIG) as ReadingStatus[]).map((s) => {
                const cfg = STATUS_CONFIG[s];
                const active = status === s;
                return (
                  <button
                    key={s}
                    onClick={() => setStatus(s)}
                    className="h-[38px] rounded-[8px] border font-mono text-[9px] tracking-[0.08em] uppercase cursor-pointer transition-all flex items-center justify-center gap-[6px]"
                    style={
                      active
                        ? { background: cfg.color + "20", borderColor: cfg.color, color: cfg.color, fontWeight: 600 }
                        : { background: "var(--bg-2)", borderColor: "var(--rule)", color: "var(--ink-3)" }
                    }
                  >
                    {cfg.icon}
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div
              className="rounded-[8px] px-[14px] py-[10px] flex items-center gap-[8px] text-[12px]"
              style={{ background: "rgba(220,38,38,0.08)", color: "#DC2626", border: "1px solid rgba(220,38,38,0.2)" }}
            >
              <AlertCircle size={14} className="shrink-0" />
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-[10px] pt-[4px]">
            {/* Delete */}
            {confirmDelete ? (
              <div className="flex items-center gap-[8px]">
                <span className="font-mono text-[10px] text-[#DC2626]">Sure?</span>
                <button
                  onClick={() => void handleDelete()}
                  disabled={deleting}
                  className="h-[36px] px-[14px] rounded-[8px] font-mono text-[9px] tracking-[0.08em] uppercase font-semibold cursor-pointer border-none transition-all disabled:opacity-60"
                  style={{ background: "#DC2626", color: "var(--ch-bg)" }}
                >
                  {deleting ? <Loader2 size={13} className="animate-spin" /> : "Yes, delete"}
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="h-[36px] px-[14px] rounded-[8px] font-mono text-[9px] tracking-[0.08em] uppercase cursor-pointer border border-[var(--rule)] bg-transparent text-[var(--ink-3)] hover:text-[var(--ink)] transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="h-[36px] px-[12px] rounded-[8px] font-mono text-[9px] tracking-[0.08em] uppercase cursor-pointer flex items-center gap-[6px] border border-[var(--rule)] bg-transparent text-[#DC2626] hover:bg-[rgba(220,38,38,0.06)] transition-colors"
              >
                <Trash2 size={13} />
                Delete
              </button>
            )}

            {/* Sync to Cloud */}
            {book.file_url.startsWith("local://") && !confirmDelete && (
              <button
                onClick={() => void handleCloudSync()}
                disabled={syncing || saving}
                className="h-[36px] px-[12px] rounded-[8px] font-mono text-[9px] tracking-[0.08em] uppercase cursor-pointer flex items-center gap-[6px] border border-[var(--rule)] bg-transparent text-[#1D4ED8] hover:bg-[rgba(29,78,216,0.06)] transition-colors disabled:opacity-50"
              >
                {syncing ? <Loader2 size={13} className="animate-spin" /> : <Cloud size={13} />}
                Sync to Cloud
              </button>
            )}

            <div className="flex-1" />

            <button
              onClick={onClose}
              className="h-[36px] px-[14px] rounded-[8px] font-mono text-[9px] tracking-[0.08em] uppercase cursor-pointer border border-[var(--rule)] bg-transparent text-[var(--ink-3)] hover:text-[var(--ink)] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => void handleSave()}
              disabled={saving || saved}
              className="h-[36px] px-[18px] rounded-[8px] font-mono text-[9px] tracking-[0.08em] uppercase font-semibold cursor-pointer border-none flex items-center gap-[6px] transition-all disabled:opacity-70"
              style={saved ? { background: "#16A34A", color: "var(--ch-bg)" } : { background: ACCENT, color: "var(--ch-bg)" }}
            >
              {saving ? (
                <Loader2 size={13} className="animate-spin" />
              ) : saved ? (
                <><Check size={13} /> Saved</>
              ) : (
                <><Save size={13} /> Save changes</>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Main Library Client ──────────────────────────────────────────────────────

export function ChLibraryClient({ books: initialBooks }: Props): React.ReactElement {
  const [books, setBooks] = useState(initialBooks);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ReadingStatus | "all">("all");
  const [uploading, setUploading] = useState(false);
  const [importingPick, setImportingPick] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [editingBook, setEditingBook] = useState<ChBookWithStats | null>(null);
  const [summaryBook, setSummaryBook] = useState<SummaryBook | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const syncOfflineBooks = async () => {
      try {
        const q = JSON.parse(localStorage.getItem("chapterly_queued_books") || "[]") as ChBookWithStats[];
        if (!q.length) return;
        const remaining = [];
        let syncedCount = 0;
        for (const b of q) {
          try {
            const res = await fetch("/api/chapterly/upload", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                title: b.title,
                file_url: b.file_url,
                file_format: b.file_format,
                file_size_bytes: b.file_size_bytes,
              }),
            });
            if (!res.ok) remaining.push(b);
            else syncedCount++;
          } catch {
            remaining.push(b);
          }
        }
        localStorage.setItem("chapterly_queued_books", JSON.stringify(remaining));
        if (syncedCount > 0) {
          // Ideally we refresh the book list here, but a window reload works too for simplicity on next visit
        }
      } catch {
        // ignore
      }
    };

    const handleOnline = () => {
      void syncOfflineBooks();
    };

    window.addEventListener("online", handleOnline);
    
    if (navigator.onLine) {
      void syncOfflineBooks();
    } else {
      try {
        const q = JSON.parse(localStorage.getItem("chapterly_queued_books") || "[]") as ChBookWithStats[];
        if (q.length > 0) {
          setBooks((prev) => {
            const newBooks = q.filter((bq) => !prev.some((p) => p.id === bq.id));
            return [...newBooks, ...prev];
          });
        }
      } catch {}
    }

    return () => window.removeEventListener("online", handleOnline);
  }, []);

  const DAILY_PICK = getDailyPick();

  const handleBookSaved = useCallback((updated: ChBookWithStats): void => {
    setBooks((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
  }, []);

  const handleBookDeleted = useCallback((id: string): void => {
    setBooks((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const importDailyPick = async (): Promise<void> => {
    if (books.length >= FREE_BOOK_LIMIT) {
      setUploadError(`Free plan limit: ${FREE_BOOK_LIMIT} books. Upgrade to add more.`);
      return;
    }
    setImportingPick(true);
    setUploadError(null);
    try {
      const dataUrl = `data:text/markdown;charset=utf-8,${encodeURIComponent(DAILY_PICK.content)}`;
      const res = await fetch("/api/chapterly/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `Summary: ${DAILY_PICK.title}`,
          author: DAILY_PICK.author,
          cover_url: DAILY_PICK.cover_url,
          file_url: dataUrl,
          file_format: "md",
          file_size_bytes: DAILY_PICK.content.length,
        }),
      });

      if (!res.ok) {
        const errData = (await res.json()) as { error?: string };
        throw new Error(errData.error || "Failed to import pick");
      }

      const { book } = (await res.json()) as { book: ChBookWithStats };
      setBooks((prev) => [
        { ...book, total_reading_time_minutes: 0, highlight_count: 0, note_count: 0, session_count: 0 },
        ...prev,
      ]);
    } catch (err) {
      console.error("[library] daily pick error:", err);
      setUploadError(err instanceof Error ? err.message : "Failed to import daily pick");
    } finally {
      setImportingPick(false);
    }
  };

  const filtered = books.filter((b) => {
    const matchQuery =
      !query ||
      b.title.toLowerCase().includes(query.toLowerCase()) ||
      b.author?.toLowerCase().includes(query.toLowerCase());
    const matchStatus = statusFilter === "all" || b.status === statusFilter;
    return matchQuery && matchStatus;
  });

  const handleFileSelection = (file: File): void => {
    setUploadError(null);
    const sizeMB = file.size / 1024 / 1024;
    if (sizeMB > MAX_FILE_MB) {
      setUploadError(`File too large. Maximum is ${MAX_FILE_MB}MB.`);
      return;
    }
    const ext = file.name.toLowerCase().split(".").pop();
    if (!ALLOWED_EXTENSIONS.some((e) => e === `.${ext}`)) {
      setUploadError(`Unsupported format. Supported: ${ALLOWED_EXTENSIONS.join(", ")}`);
      return;
    }
    setPendingFile(file);
  };

  const processLocalUpload = async (): Promise<void> => {
    if (!pendingFile) return;
    setUploading(true);
    setUploadError(null);
    try {
      const titleGuess = pendingFile.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ");
      const ext = pendingFile.name.toLowerCase().split(".").pop();
      const localId = crypto.randomUUID();
      
      // Save file blob to IndexedDB
      await saveFileLocally(localId, pendingFile);

      // We still want to sync the DB record so progress and highlights are tracked
      // We pass the local id as the file_url
      const formData = new FormData();
      formData.append("title", titleGuess);
      formData.append("file", pendingFile); // API ignores file upload to cloud if we pass special metadata, wait, the API as written will upload it!
      
      // We need to change how we talk to the API. 
      // If we use JSON body instead of FormData, the API won't try to upload the file to Supabase.
      const dataUrl = `local://${localId}`;
      let format = "other";
      if (["pdf", "epub", "docx", "txt", "md", "html", "fb2", "cbz"].includes(ext || "")) {
        format = ext || "other";
      }

      let newBook: ChBookWithStats | null = null;
      let uploadErr: string | null = null;

      if (navigator.onLine) {
        try {
          const res = await fetch("/api/chapterly/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: titleGuess,
              file_url: dataUrl,
              file_format: format,
              file_size_bytes: pendingFile.size,
            }),
          });
          if (!res.ok) {
            const errData = (await res.json().catch(() => ({}))) as { error?: string };
            uploadErr = errData.error || "Upload failed";
          } else {
            const { book } = (await res.json()) as { book: ChBookWithStats };
            newBook = { ...book, total_reading_time_minutes: 0, highlight_count: 0, note_count: 0, session_count: 0 };
          }
        } catch (e) {
          console.warn("Failed to reach server, falling back to offline", e);
        }
      }

      if (!newBook && !uploadErr) {
        newBook = {
          id: `temp_${localId}`,
          user_id: "local",
          title: titleGuess,
          author: null,
          cover_url: null,
          file_url: dataUrl,
          file_format: format as any,
          file_size_bytes: pendingFile.size,
          status: "unread",
          current_page: 0,
          total_pages: null,
          progress_pct: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          genres: [],
          tags: [],
          rating: null,
          description: null,
          language: null,
          published_year: null,
          is_private: true,
          metadata: null,
          total_reading_time_minutes: 0,
          highlight_count: 0,
          note_count: 0,
          session_count: 0,
        };
        try {
          const q = JSON.parse(localStorage.getItem("chapterly_queued_books") || "[]");
          q.push(newBook);
          localStorage.setItem("chapterly_queued_books", JSON.stringify(q));
        } catch {}
      }

      if (uploadErr && !newBook) {
        throw new Error(uploadErr);
      }

      if (newBook) {
        setBooks((prev) => [newBook!, ...prev]);
      }
      setPendingFile(null);
      setShowUpload(false);
    } catch (err) {
      console.error("[chapterly/library] local upload error:", err);
      setUploadError(err instanceof Error ? err.message : "Local save failed");
    } finally {
      setUploading(false);
    }
  };

  const processCloudUpload = async (): Promise<void> => {
    if (!pendingFile) return;
    if (books.filter((b) => !b.file_url.startsWith("local://")).length >= FREE_BOOK_LIMIT) {
      setUploadError(`Free plan is limited to ${FREE_BOOK_LIMIT} cloud books. Upgrade to add more.`);
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      const titleGuess = pendingFile.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ");

      const formData = new FormData();
      formData.append("file", pendingFile);
      formData.append("title", titleGuess);

      const res = await fetch("/api/chapterly/upload", { method: "POST", body: formData });

      if (!res.ok) {
        const errData = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(errData.error || "Upload failed");
      }

      const { book } = (await res.json()) as { book: ChBookWithStats };
      setBooks((prev) => [
        { ...book, total_reading_time_minutes: 0, highlight_count: 0, note_count: 0, session_count: 0 },
        ...prev,
      ]);
      setPendingFile(null);
      setShowUpload(false);
    } catch (err) {
      console.error("[chapterly/library] upload error:", err);
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e: React.DragEvent): void => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelection(file);
  };

  return (
    <>
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-[32px] gap-[16px] flex-wrap">
        <div>
          <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-[var(--ink-3)] mb-[6px]">
            {books.length} {books.length === 1 ? "book" : "books"}
          </div>
          <h1 className="font-display text-[32px] max-[720px]:text-[26px] font-normal tracking-[-0.02em] fvs-text text-[var(--ink)] m-0 leading-[1.1]">
            Library
          </h1>
        </div>
        <button
          onClick={() => {
            setShowUpload(true);
            setPendingFile(null);
            setUploadError(null);
          }}
          className="inline-flex items-center gap-[8px] font-mono text-[10px] tracking-[0.12em] uppercase font-semibold px-[16px] py-[10px] rounded-[10px] text-(--bg) cursor-pointer border-none transition-all hover:opacity-90"
          style={{ background: ACCENT }}
        >
          <Plus size={14} /> Add Book
        </button>
      </div>

      {/* ── Upload panel ── */}
      {showUpload && (
        <div className="mb-[32px] rounded-[16px] border border-[var(--rule)] bg-[var(--bg-2)] overflow-hidden">
          <div className="flex items-center justify-between px-[24px] py-[16px] border-b border-[var(--rule)]">
            <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-[var(--ink-3)]">
              Upload a book
            </div>
            <button
              onClick={() => { setShowUpload(false); setUploadError(null); setPendingFile(null); }}
              className="w-[28px] h-[28px] rounded-[6px] flex items-center justify-center border-none bg-transparent cursor-pointer text-[var(--ink-3)] hover:text-[var(--ink)]"
            >
              <X size={16} />
            </button>
          </div>

          {!pendingFile ? (
            <div
              className={`m-[20px] rounded-[12px] border-2 border-dashed flex flex-col items-center justify-center py-[48px] max-[480px]:py-[28px] px-[24px] text-center transition-all cursor-pointer ${
                dragOver ? "border-[var(--ch-accent)] bg-[color-mix(in oklab, var(--ch-accent) 6%, transparent)]" : "border-[var(--rule)]"
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              onClick={() => fileRef.current?.click()}
            >
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.epub,.docx,.txt,.md,.html,.fb2,.cbz"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelection(f); }}
              />
              <Upload size={36} className="mb-[16px] opacity-40 text-[var(--ink)]" />
              <div className="font-semibold text-[14px] text-[var(--ink)] mb-[6px]">
                Drop your book here
              </div>
              <div className="font-mono text-[10px] tracking-[0.1em] uppercase text-[var(--ink-3)]">
                PDF, EPUB, DOCX, TXT, MD, HTML, FB2, CBZ · Max {MAX_FILE_MB}MB
              </div>
              <button
                type="button"
                className="mt-[20px] font-mono text-[10px] tracking-[0.12em] uppercase font-semibold px-[14px] py-[8px] rounded-[8px] border-none cursor-pointer transition-all hover:opacity-90 text-(--bg)"
                style={{ background: ACCENT }}
                onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}
              >
                Browse files
              </button>
            </div>
          ) : (
            <div className="p-[24px] flex flex-col items-center">
              <div className="w-full p-[16px] rounded-[10px] border border-[var(--rule)] bg-[var(--bg)] flex items-center justify-between mb-[24px]">
                <div className="flex items-center gap-[12px] overflow-hidden">
                  <FileText size={20} style={{ color: ACCENT }} />
                  <div className="truncate text-[14px] font-semibold text-[var(--ink)]">
                    {pendingFile.name}
                  </div>
                </div>
                <div className="font-mono text-[10px] text-[var(--ink-3)] shrink-0 ml-[12px]">
                  {(pendingFile.size / 1024 / 1024).toFixed(1)}MB
                </div>
              </div>

              {uploading ? (
                <div className="flex flex-col items-center justify-center py-[20px]">
                  <Loader2 size={32} className="animate-spin mb-[12px]" style={{ color: ACCENT }} />
                  <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--ink-3)]">
                    Saving...
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-[16px] w-full">
                  <button
                    onClick={() => void processLocalUpload()}
                    className="flex flex-col items-center justify-center p-[20px] rounded-[12px] border border-[var(--rule)] bg-[var(--bg)] cursor-pointer transition-all hover:border-[#16A34A] hover:bg-[rgba(22,163,74,0.04)] group"
                  >
                    <div className="w-[40px] h-[40px] rounded-full bg-[rgba(22,163,74,0.1)] text-[#16A34A] flex items-center justify-center mb-[12px] group-hover:scale-110 transition-transform">
                      <HardDrive size={20} />
                    </div>
                    <div className="font-semibold text-[14px] text-[var(--ink)] mb-[4px]">Local Device</div>
                    <div className="font-mono text-[9px] text-[var(--ink-3)] text-center tracking-[0.05em]">
                      Unlimited books<br/>Stored on this device only
                    </div>
                  </button>

                  <button
                    onClick={() => void processCloudUpload()}
                    className="flex flex-col items-center justify-center p-[20px] rounded-[12px] border border-[var(--rule)] bg-[var(--bg)] cursor-pointer transition-all hover:border-[#1D4ED8] hover:bg-[rgba(29,78,216,0.04)] group"
                  >
                    <div className="w-[40px] h-[40px] rounded-full bg-[rgba(29,78,216,0.1)] text-[#1D4ED8] flex items-center justify-center mb-[12px] group-hover:scale-110 transition-transform">
                      <Cloud size={20} />
                    </div>
                    <div className="font-semibold text-[14px] text-[var(--ink)] mb-[4px]">Cloud Sync</div>
                    <div className="font-mono text-[9px] text-[var(--ink-3)] text-center tracking-[0.05em]">
                      Read across devices<br/>{books.filter((b) => !b.file_url.startsWith("local://")).length}/{FREE_BOOK_LIMIT} slots used
                    </div>
                  </button>
                </div>
              )}
              
              {!uploading && (
                <button
                  onClick={() => setPendingFile(null)}
                  className="mt-[24px] font-mono text-[10px] tracking-[0.1em] uppercase text-[var(--ink-3)] hover:text-[var(--ink)] bg-transparent border-none cursor-pointer transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          )}
          {uploadError && (
            <div
              className="mx-[20px] mb-[20px] rounded-[8px] px-[16px] py-[12px] flex items-start gap-[10px] text-[13px]"
              style={{ background: "rgba(220,38,38,0.08)", color: "#DC2626", border: "1px solid rgba(220,38,38,0.2)" }}
            >
              <AlertCircle size={16} className="shrink-0 mt-[1px]" />
              {uploadError}
            </div>
          )}
        </div>
      )}

      {/* ── Daily Pick Banner ── */}
      <div
        className="mb-[32px] rounded-[16px] border p-[24px] flex items-center justify-between gap-[24px] max-[720px]:flex-col max-[720px]:items-start max-[720px]:gap-[16px]"
        style={{ borderColor: "var(--rule)", background: "linear-gradient(135deg, color-mix(in oklab, var(--ch-accent) 8%, transparent) 0%, color-mix(in oklab, var(--ch-accent) 2%, transparent) 100%)" }}
      >
        <div className="flex items-start gap-[16px]">
          <div
            className="w-[48px] h-[48px] rounded-[12px] flex items-center justify-center shrink-0"
            style={{ background: "color-mix(in oklab, var(--ch-accent) 12%, transparent)" }}
          >
            <Sparkles size={20} style={{ color: ACCENT }} />
          </div>
          <div>
            <div className="font-mono text-[9px] tracking-[0.12em] uppercase text-[var(--ink-3)] mb-[4px] flex items-center gap-[6px]">
              <span className="w-[6px] h-[6px] rounded-full animate-pulse inline-block" style={{ background: ACCENT }} />
              Daily Summary Pick
              <span
                className="font-mono text-[8px] tracking-[0.1em] uppercase px-[6px] py-[2px] rounded-[4px]"
                style={{ background: "color-mix(in oklab, var(--ch-accent) 12%, transparent)", color: ACCENT }}
              >
                {DAILY_PICK.category}
              </span>
            </div>
            <h2 className="text-[18px] font-semibold text-[var(--ink)] m-0 mb-[6px]">
              {DAILY_PICK.title} <span className="font-normal text-[14px] text-[var(--ink-3)]">by {DAILY_PICK.author}</span>
            </h2>
            <p className="text-[12px] leading-[1.5] text-[var(--ink-3)] m-0 max-w-[580px]">
              {DAILY_PICK.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-[8px] shrink-0 flex-wrap">
          <button
            onClick={() =>
              setSummaryBook({
                title: DAILY_PICK.title,
                author: DAILY_PICK.author,
                cover_url: DAILY_PICK.cover_url,
                previewContent: DAILY_PICK.content,
              })
            }
            className="flex items-center gap-[6px] font-mono text-[9px] tracking-[0.12em] uppercase font-semibold px-[16px] py-[10px] rounded-[8px] border-none cursor-pointer transition-all hover:opacity-90 text-[var(--ch-bg)]"
            style={{ background: ACCENT }}
          >
            <FileText size={13} />
            Read Summary
          </button>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="flex items-center gap-[12px] mb-[28px] flex-wrap">
        <div className="relative flex-1 min-w-[140px]">
          <Search size={14} className="absolute left-[12px] top-1/2 -translate-y-1/2 text-[var(--ink-3)]" />
          <input
            type="text"
            placeholder="Search books…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full h-[40px] pl-[36px] pr-[12px] rounded-[8px] text-[14px] outline-none bg-[var(--bg-2)] border border-[var(--rule)] text-[var(--ink)] focus:border-[var(--ink-2)] transition-colors"
          />
        </div>
        <div className="flex items-center gap-[6px] overflow-x-auto pb-[2px] scrollbar-none">
          {(["all", "unread", "reading", "finished", "on_hold", "abandoned"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className="font-mono text-[9px] tracking-[0.1em] uppercase px-[10px] py-[6px] rounded-full border-none cursor-pointer transition-all whitespace-nowrap"
              style={
                statusFilter === s
                  ? { background: ACCENT, color: "var(--ch-bg)" }
                  : { background: "var(--bg-2)", color: "var(--ink-3)", outline: "1px solid var(--rule)" }
              }
            >
              {s === "all" ? "All" : STATUS_CONFIG[s as ReadingStatus]?.label ?? s}
            </button>
          ))}
        </div>
      </div>

      {/* ── Grid ── */}
      {filtered.length === 0 ? (
        <div className="text-center py-[80px]">
          <BookMarked size={48} className="mx-auto mb-[16px] opacity-20 text-[var(--ink)]" />
          <div className="font-mono text-[11px] uppercase tracking-[0.1em] text-[var(--ink-3)] mb-[20px]">
            {query || statusFilter !== "all" ? "No books match your filters" : "Your library is empty"}
          </div>
          {!query && statusFilter === "all" && (
            <button
              onClick={() => setShowUpload(true)}
              className="inline-flex items-center gap-[8px] font-mono text-[10px] tracking-[0.12em] uppercase font-semibold px-[16px] py-[10px] rounded-[10px] text-(--bg) border-none cursor-pointer"
              style={{ background: ACCENT }}
            >
              <Plus size={14} /> Upload your first book
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-5 max-[1300px]:grid-cols-4 max-[1000px]:grid-cols-3 max-[700px]:grid-cols-2 max-[400px]:grid-cols-2 gap-[20px]">
          {filtered.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              onEdit={() => setEditingBook(book)}
              onSummary={() =>
                setSummaryBook({
                  id: book.id,
                  title: book.title,
                  author: book.author,
                  cover_url: book.cover_url,
                })
              }
            />
          ))}
        </div>
      )}

      {/* ── Edit Modal ── */}
      {editingBook && (
        <EditBookModal
          book={editingBook}
          onClose={() => setEditingBook(null)}
          onSaved={handleBookSaved}
          onDeleted={handleBookDeleted}
        />
      )}

      {/* ── Summary Drawer ── */}
      {summaryBook && (
        <SummaryDrawer
          book={summaryBook}
          onClose={() => setSummaryBook(null)}
        />
      )}
    </>
  );
}

// ─── Book Card ────────────────────────────────────────────────────────────────

function BookCard({ book, onEdit, onSummary }: { book: ChBookWithStats; onEdit: () => void; onSummary: () => void }): React.ReactElement {
  const cfg = STATUS_CONFIG[book.status] ?? STATUS_CONFIG.unread;

  return (
    <div className="group relative block rounded-[14px] border border-[var(--rule)] bg-[var(--bg-2)] hover:border-[var(--ink-3)] hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Action buttons — appear on hover */}
      <div className="absolute top-[8px] right-[8px] z-10 flex items-center gap-[4px] opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onSummary(); }}
          className="w-[28px] h-[28px] rounded-full flex items-center justify-center border-none cursor-pointer shadow-md"
          style={{ background: "color-mix(in oklab, var(--ch-accent) 90%, transparent)", color: "var(--ch-bg)" }}
          title="View summary"
        >
          <FileText size={12} />
        </button>
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit(); }}
          className="w-[28px] h-[28px] rounded-full flex items-center justify-center border-none cursor-pointer shadow-md"
          style={{ background: "rgba(0,0,0,0.6)", color: "var(--ch-bg)" }}
          title="Edit book"
        >
          <Pencil size={12} />
        </button>
      </div>

      {/* Card is a link for reading */}
      <Link href={`/tools/chapterly/read/${book.id}`} className="block no-underline">
        {/* Local Indicator */}
        {book.file_url.startsWith("local://") && (
          <div className="absolute top-[10px] left-[10px] z-10 w-[24px] h-[24px] rounded-full flex items-center justify-center shadow-md bg-[rgba(22,163,74,0.9)] text-[#fff]" title="Stored on this device">
            <HardDrive size={12} />
          </div>
        )}
        {/* Cover */}
        <div
          className="w-full aspect-[3/4] flex items-center justify-center relative overflow-hidden"
          style={{ background: "color-mix(in srgb, var(--ch-accent) 9%, transparent)" }}
        >
          {book.cover_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={book.cover_url}
              alt={book.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <BookMarked size={32} style={{ color: ACCENT, opacity: 0.6 }} />
          )}
        </div>

        {/* Meta */}
        <div className="p-[12px]">
          <div className="text-[13px] font-semibold text-[var(--ink)] line-clamp-2 leading-[1.3] mb-[4px]">
            {book.title}
          </div>
          {book.author && (
            <div className="font-mono text-[10px] text-[var(--ink-3)] truncate">
              {book.author}
            </div>
          )}

          {/* Progress bar */}
          <div className="mt-[10px] h-[3px] rounded-full bg-[var(--rule)]">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${book.progress_pct}%`, background: `linear-gradient(90deg, ${ACCENT}, color-mix(in srgb, var(--ch-accent) 60%, white))` }}
            />
          </div>

          {/* Status + % */}
          <div className="flex items-center justify-between mt-[8px]">
            <span
              className="inline-flex items-center gap-[4px] font-mono text-[8px] tracking-[0.08em] uppercase px-[6px] py-[2px] rounded-full"
              style={{ background: cfg.color + "18", color: cfg.color }}
            >
              {cfg.icon}
              {cfg.label}
            </span>
            <span className="font-mono text-[9px] text-[var(--ink-3)]">
              {Math.round(book.progress_pct)}%
            </span>
          </div>

          {/* Mini stats */}
          <div className="flex items-center gap-[10px] mt-[8px] pt-[8px] border-t border-[var(--rule)]">
            {book.highlight_count > 0 && (
              <span className="font-mono text-[8px] text-[var(--ink-3)]">
                {book.highlight_count} ✦
              </span>
            )}
            {book.note_count > 0 && (
              <span className="font-mono text-[8px] text-[var(--ink-3)]">
                {book.note_count} notes
              </span>
            )}
            {book.total_reading_time_minutes > 0 && (
              <span className="font-mono text-[8px] text-[var(--ink-3)]">
                {book.total_reading_time_minutes}m read
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
