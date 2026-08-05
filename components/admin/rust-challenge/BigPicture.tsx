"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  BookOpen,
  Brain,
  Check,
  ChevronDown,
  Compass,
  GitBranch,
  Layers,
  Loader2,
  Plus,
  Rocket,
  Sparkles,
  Trash2,
} from "lucide-react";
import type { RustChallengeMeta, Quote } from "@/app/api/admin/rust-challenge/meta/route";

interface Props {
  initialMeta: RustChallengeMeta;
}

// The two-color thread from the original roadmap: rust (iron oxide, orange)
// for the systems track, verdigris (copper oxide, teal) for the ZK/zkML
// track — carried through as tier chip colors and section accents instead
// of everything reading as the same neutral gray.
const THREAD = {
  rust: {
    chip: "text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-900/50",
    accent: "text-orange-600 dark:text-orange-400",
    border: "border-orange-300/70 dark:border-orange-800/60",
    iconBg: "bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400",
  },
  verdigris: {
    chip: "text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/30 border-teal-200 dark:border-teal-900/50",
    accent: "text-teal-600 dark:text-teal-400",
    border: "border-teal-300/70 dark:border-teal-800/60",
    iconBg: "bg-teal-100 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400",
  },
} as const;

const TIERS = [
  {
    n: "01",
    thread: "rust" as const,
    title: "Systems fundamentals — non-negotiable floor",
    items: ["ownership & borrow-checker edge cases", "unsafe & memory layout", "Arc / Mutex / channels / atomics", "allocators", "async runtime internals", "FFI / ABI basics"],
  },
  {
    n: "02",
    thread: "rust" as const,
    title: "Backend/infra — what makes you hirable this month",
    items: ["Tokio (deep, not surface)", "gRPC + tonic", "SQLx / Postgres", "Docker", "tracing / observability", "wasm-bindgen"],
  },
  {
    n: "03",
    thread: "verdigris" as const,
    title: "ZK depth — deepen what you already own",
    items: ["sumcheck / GKR", "KZG / multilinear commitments", "Fiat-Shamir", "zkVMs (SP1, Risc0)", "circuit design"],
  },
  {
    n: "04",
    thread: "verdigris" as const,
    title: "zkML — the synthesis, still to build",
    items: ["quantization / fixed-point arithmetic", "ONNX model structure", "matmul circuits", "lookup arguments (Lasso / Jolt-style)", "EZKL internals"],
  },
];

const MENTAL_MODELS = [
  { name: "Big-picture thinking", text: "Don't over-index on any single skill. A strong week in DSA means nothing if the ZK thread goes cold for months, and vice versa." },
  { name: "Realistic thinking", text: "Six months to land six figures is aggressive, not fantasy — conditional on not scattering." },
  { name: "Strategic thinking", text: "Every phase reuses the last one's output — the allocator feeds interview readiness, the WASM build feeds the zkML demo, the demo feeds the blog post that feeds applications." },
  { name: "Bottom-line thinking", text: "Each week: did this produce something visible — a merge, a benchmark, a post, a shipped binary? If not, it was practice, not progress." },
];

const TARGETS = [
  { name: "EZKL", type: "zkML · Rust · direct target", note: "Study first, then PR", thread: "verdigris" as const },
  { name: "SP1 / Risc0", type: "zkVM · Rust", note: "You've already touched SP1", thread: "verdigris" as const },
  { name: "arkworks", type: "ZK primitives · Rust", note: "Directly under your GKR/KZG work", thread: "verdigris" as const },
  { name: "OnlyDust", type: "paid OSS bounties", note: "Rust/crypto-native, get paid to contribute", thread: "rust" as const },
  { name: "Superteam", type: "bounties", note: "Solana-adjacent, bridges your Web3 background", thread: "rust" as const },
];

const BOOK_GROUPS = [
  { title: "Rust, intermediate → advanced", books: [
    { name: "Rust for Rustaceans", author: "Jon Gjengset" },
    { name: "Zero To Production In Rust", author: "Luca Palmieri" },
    { name: "Writing an OS in Rust", author: "Philipp Oppermann · free" },
  ] },
  { title: "DSA, daily anchor", books: [
    { name: "DSAR — Data Structures & Algorithms in Rust", author: "RantAI" },
    { name: "Crafting Interpreters", author: "Robert Nystrom" },
  ] },
  { title: "The moat", books: [
    { name: "Proofs, Arguments, and Zero-Knowledge", author: "Justin Thaler · free" },
    { name: "Dive into Deep Learning", author: "d2l.ai · free" },
  ] },
  { title: "Already in motion", books: [
    { name: "How Successful People Think", author: "John C. Maxwell" },
    { name: "Atomic Habits", author: "James Clear" },
  ] },
];

function SectionHeading({ icon: Icon, thread, children }: { icon: React.ElementType; thread: "rust" | "verdigris"; children: React.ReactNode }): React.ReactElement {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className={`flex items-center justify-center h-6 w-6 rounded-md shrink-0 ${THREAD[thread].iconBg}`}>
        <Icon className="h-3.5 w-3.5" />
      </span>
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{children}</p>
    </div>
  );
}

function WhyAndQuotes({ initialMeta }: { initialMeta: RustChallengeMeta }): React.ReactElement {
  const [whyStarted, setWhyStarted] = useState(initialMeta.why_started ?? "");
  const [quotes, setQuotes] = useState<Quote[]>(initialMeta.quotes);
  const [newQuote, setNewQuote] = useState("");
  const [newAuthor, setNewAuthor] = useState("");
  const [savingWhy, setSavingWhy] = useState(false);
  const [savingQuotes, setSavingQuotes] = useState(false);
  const [editingWhy, setEditingWhy] = useState(false);
  const [minimized, setMinimized] = useState(false);

  const saveMeta = async (changes: { why_started?: string; quotes?: Quote[] }): Promise<void> => {
    try {
      const res = await fetch("/api/admin/rust-challenge/meta", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(changes),
      });
      if (!res.ok) throw new Error("Save failed");
      toast.success("Saved");
    } catch (err) {
      console.error("[rust-challenge/meta] save error:", err);
      toast.error("Failed to save");
    }
  };

  const handleSaveWhy = async (): Promise<void> => {
    setSavingWhy(true);
    try {
      await saveMeta({ why_started: whyStarted.trim() });
      setEditingWhy(false);
    } finally {
      setSavingWhy(false);
    }
  };

  const handleAddQuote = async (): Promise<void> => {
    if (!newQuote.trim()) return;
    const next = [...quotes, { quote: newQuote.trim(), author: newAuthor.trim() || "You" }];
    setSavingQuotes(true);
    try {
      await saveMeta({ quotes: next });
      setQuotes(next);
      setNewQuote("");
      setNewAuthor("");
    } finally {
      setSavingQuotes(false);
    }
  };

  const handleRemoveQuote = async (index: number): Promise<void> => {
    const next = quotes.filter((_, i) => i !== index);
    setSavingQuotes(true);
    try {
      await saveMeta({ quotes: next });
      setQuotes(next);
    } finally {
      setSavingQuotes(false);
    }
  };

  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-orange-200/70 dark:border-orange-900/40 bg-gradient-to-br from-orange-50 via-card to-card dark:from-orange-950/25 dark:via-card dark:to-card transition-all ${
        minimized ? "p-4 space-y-0" : "p-6 sm:p-8 space-y-6"
      }`}
    >
      {/* Oversized decorative quotation mark — purely atmospheric, sits behind the content */}
      <span
        aria-hidden
        className="pointer-events-none select-none absolute -top-6 -right-2 text-[9rem] sm:text-[11rem] font-serif leading-none text-orange-900/[0.05] dark:text-orange-100/[0.05]"
      >
        &rdquo;
      </span>

      <div className="relative">
        <div className={`flex items-center justify-between gap-3 ${minimized ? "" : "mb-3"}`}>
          <div className="flex items-center gap-2">
            <Compass className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            <p className="text-xs font-semibold text-orange-700 dark:text-orange-400 uppercase tracking-wider">Why I started</p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {!editingWhy && !minimized && (
              <Button size="sm" variant="ghost" className="h-6 text-xs px-2" onClick={() => setEditingWhy(true)}>
                Edit
              </Button>
            )}
            <button
              type="button"
              onClick={() => setMinimized((v) => !v)}
              className="h-6 w-6 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-orange-100/60 dark:hover:bg-orange-950/40 transition-colors"
              aria-label={minimized ? "Expand why I started" : "Minimize why I started"}
            >
              <ChevronDown className={`h-4 w-4 transition-transform ${minimized ? "-rotate-90" : ""}`} />
            </button>
          </div>
        </div>

        {minimized ? (
          <p className="text-sm text-muted-foreground truncate mt-1">
            {whyStarted || "Not set yet"}
          </p>
        ) : editingWhy ? (
          <div className="space-y-2">
            <Textarea
              value={whyStarted}
              onChange={(e) => setWhyStarted(e.target.value)}
              className="text-base min-h-28 bg-background/80"
              placeholder="Rewrite this in your own words — why does this matter to you?"
            />
            <Button size="sm" onClick={() => void handleSaveWhy()} disabled={savingWhy}>
              {savingWhy ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <Check className="h-3.5 w-3.5 mr-1.5" />}
              Save
            </Button>
          </div>
        ) : (
          <p className="text-lg sm:text-xl font-medium leading-relaxed text-balance text-foreground/90">
            {whyStarted || "Not set yet — click Edit and write why this matters to you."}
          </p>
        )}
      </div>

      {!minimized && quotes.length > 0 && (
        <div className="relative border-t border-orange-200/60 dark:border-orange-900/40 pt-5 space-y-4">
          {quotes.map((q, i) => (
            <div key={i} className="flex items-start gap-3 group">
              <span className="text-3xl leading-none font-serif text-orange-400/70 dark:text-orange-500/50 shrink-0 -mt-1">&ldquo;</span>
              <div className="min-w-0 flex-1">
                <p className="text-base italic leading-snug text-foreground/90">{q.quote}</p>
                <p className="text-xs text-muted-foreground mt-1 tracking-wide">— {q.author}</p>
              </div>
              <button
                onClick={() => void handleRemoveQuote(i)}
                className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 text-muted-foreground hover:text-destructive mt-1"
                aria-label="Remove quote"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {!minimized && (
      <div className="relative border-t border-orange-200/60 dark:border-orange-900/40 pt-5 space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Add a quote</p>
        <Textarea
          placeholder="A quote that keeps you going"
          value={newQuote}
          onChange={(e) => setNewQuote(e.target.value)}
          className="text-sm min-h-14 bg-background/80"
        />
        <div className="flex gap-2">
          <Input
            placeholder="Attribution (optional — defaults to “You”)"
            value={newAuthor}
            onChange={(e) => setNewAuthor(e.target.value)}
            className="h-9 text-sm flex-1 min-w-0 bg-background/80"
          />
          <Button size="icon" variant="outline" className="h-9 w-9 shrink-0" onClick={() => void handleAddQuote()} disabled={savingQuotes || !newQuote.trim()}>
            {savingQuotes ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </div>
      )}
    </div>
  );
}

export function BigPicture({ initialMeta }: Props): React.ReactElement {
  return (
    <div className="space-y-6">
      <WhyAndQuotes initialMeta={initialMeta} />

      <details className="rounded-lg border border-border bg-card overflow-hidden">
        <summary className="cursor-pointer px-4 py-3 flex items-center justify-between gap-3 list-none [&::-webkit-details-marker]:hidden">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">The Big Picture — the full roadmap, pinned</span>
          </div>
          <Badge variant="outline" className="text-xs shrink-0">reference</Badge>
        </summary>

        <div className="px-4 pb-6 space-y-8 pt-2">
          <div className="border-t border-border pt-5">
            <SectionHeading icon={Compass} thread="rust">The bet</SectionHeading>
            <p className="text-base font-semibold leading-snug text-balance">
              <span className={THREAD.rust.accent}>Systems Rust</span> as the trunk.{" "}
              <span className={THREAD.verdigris.accent}>ZK → zkML</span> as the crown.
            </p>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              Systems Rust isn&apos;t scarce by itself — it&apos;s the trunk that lets you take any backend or infra
              role for income and flexibility. The GKR/KZG/sumcheck work already in your <code className="text-xs bg-muted px-1 py-0.5 rounded">zk</code> repo
              is the scarce part — most Rust engineers, systems-focused or not, have never touched it. Don&apos;t let either crowd out the other.
            </p>
          </div>

          <div className="border-t border-border pt-5">
            <SectionHeading icon={Layers} thread="rust">The skillset picture</SectionHeading>
            <div className="space-y-4">
              {TIERS.map((tier) => (
                <div key={tier.n} className="flex gap-3">
                  <div className={`text-xs font-mono pt-0.5 shrink-0 w-6 font-semibold ${THREAD[tier.thread].accent}`}>{tier.n}</div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{tier.title}</p>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {tier.items.map((item) => (
                        <span key={item} className={`text-xs px-2 py-0.5 rounded-md border ${THREAD[tier.thread].chip}`}>
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={`border-t pt-5 ${THREAD.verdigris.border}`}>
            <SectionHeading icon={GitBranch} thread="verdigris">The zkML convergence</SectionHeading>
            <p className="text-sm text-muted-foreground leading-relaxed">
              zkML needs three things: a working proof system (you have it), systems chops to make it fast (you&apos;re building it),
              and just enough ML to represent a model as a circuit — the smallest of the three lifts. You&apos;ve already
              brushed both major zkML approaches without realizing it: circuit-based (your GKR/KZG work) and zkVM-based
              (<code className="text-xs bg-muted px-1 py-0.5 rounded">ZKAttestify-Sp1-verifier</code>).
            </p>
          </div>

          <div className="border-t border-border pt-5">
            <SectionHeading icon={Brain} thread="rust">Four checks, weekly</SectionHeading>
            <div className="grid gap-3 sm:grid-cols-2">
              {MENTAL_MODELS.map((m) => (
                <div key={m.name} className="rounded-md border border-border/70 p-3">
                  <p className="text-xs font-medium text-primary mb-1">{m.name}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{m.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-border pt-5">
            <SectionHeading icon={Rocket} thread="verdigris">Contribution & income targets</SectionHeading>
            <div className="space-y-2">
              {TARGETS.map((t) => (
                <div key={t.name} className="flex items-center justify-between gap-3 text-sm border-b border-border/60 pb-2.5 last:border-0 last:pb-0">
                  <div className="min-w-0 flex items-center gap-2 flex-wrap">
                    <span className="font-medium shrink-0">{t.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${THREAD[t.thread].chip}`}>{t.type}</span>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">{t.note}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-border pt-5">
            <SectionHeading icon={BookOpen} thread="rust">Reading list</SectionHeading>
            <div className="grid gap-4 sm:grid-cols-2">
              {BOOK_GROUPS.map((group) => (
                <div key={group.title}>
                  <p className="text-xs font-medium text-primary mb-1.5">{group.title}</p>
                  {group.books.map((b) => (
                    <div key={b.name} className="text-xs py-1 border-b border-border/50 last:border-0">
                      <span>{b.name}</span>
                      <span className="text-muted-foreground ml-1.5">— {b.author}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg bg-muted/60 p-4 flex items-start gap-2.5 text-xs text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 shrink-0 mt-0.5 text-orange-500" />
            <p>Identity over goals — the target isn&apos;t &ldquo;get a $100k Rust job in 6 months,&rdquo; it&apos;s &ldquo;become someone who ships Rust and posts about it daily.&rdquo; The income follows the identity.</p>
          </div>
        </div>
      </details>
    </div>
  );
}
