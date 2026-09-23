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
  Compass,
  Layers,
  Loader2,
  Plus,
  Rocket,
  Trash2,
} from "lucide-react";
import type { RustChallengeMeta, Quote } from "./types";

interface ArchitectureManifestoProps {
  initialMeta: RustChallengeMeta;
}

const TIERS = [
  {
    n: "01",
    title: "Systems Fundamentals — Non-Negotiable Floor",
    items: [
      "Ownership & borrow-checker edge cases",
      "Unsafe & memory layout",
      "Arc / Mutex / channels / atomics",
      "Custom Allocators & arenas",
      "Async runtime internals",
      "FFI / ABI boundaries",
    ],
  },
  {
    n: "02",
    title: "Backend/Infra — What Makes You Hirable Immediately",
    items: [
      "Tokio (deep, not surface)",
      "gRPC + tonic",
      "SQLx / Postgres",
      "Docker & Containerization",
      "Tracing & Observability",
      "wasm-bindgen",
    ],
  },
  {
    n: "03",
    title: "ZK Depth — Deepen What You Already Own",
    items: [
      "Sumcheck & GKR Protocols",
      "KZG & Multilinear Commitments",
      "Fiat-Shamir Heuristic",
      "zkVMs (SP1, Risc0)",
      "Arithmetic Circuit Design",
    ],
  },
  {
    n: "04",
    title: "zkML — The Synthesis & The Moat",
    items: [
      "Quantization & Fixed-Point Arithmetic",
      "ONNX Model Extraction",
      "Matmul & Conv Circuits",
      "Lookup Arguments (Lasso / Jolt)",
      "EZKL Architecture & Internals",
    ],
  },
];

const MENTAL_MODELS = [
  {
    name: "Big-Picture Thinking",
    text: "Don't over-index on any single skill. A strong week in DSA means nothing if the ZK thread goes cold for months, and vice versa.",
  },
  {
    name: "Realistic Thinking",
    text: "Six months to land six figures is aggressive, not fantasy — conditional on not scattering.",
  },
  {
    name: "Strategic Thinking",
    text: "Every phase reuses the last one's output — the allocator feeds interview readiness, the WASM build feeds the zkML demo, the demo feeds the blog post that feeds applications.",
  },
  {
    name: "Bottom-Line Thinking",
    text: "Each week: did this produce something visible — a merge, a benchmark, a post, a shipped binary? If not, it was practice, not progress.",
  },
];

const TARGETS = [
  { name: "EZKL", type: "zkML · Rust · Direct Target", note: "Study first, then PR", badge: "border-purple-500/40 text-purple-800 dark:text-purple-300 bg-purple-500/10" },
  { name: "SP1 / Risc0", type: "zkVM · Rust", note: "You've already touched SP1", badge: "border-sky-500/40 text-sky-800 dark:text-sky-300 bg-sky-500/10" },
  { name: "arkworks", type: "ZK Primitives · Rust", note: "Directly under your GKR/KZG work", badge: "border-emerald-500/40 text-emerald-800 dark:text-emerald-300 bg-emerald-500/10" },
  { name: "OnlyDust", type: "Paid OSS Bounties", note: "Rust/crypto-native, get paid to contribute", badge: "border-amber-500/40 text-amber-800 dark:text-amber-300 bg-amber-500/10" },
  { name: "Superteam", type: "Bounties & Grants", note: "Solana-adjacent, bridges your Web3 background", badge: "border-amber-500/40 text-amber-800 dark:text-amber-300 bg-amber-500/10" },
];

const BOOK_GROUPS = [
  {
    title: "Rust, Intermediate → Advanced",
    books: [
      { name: "Rust for Rustaceans", author: "Jon Gjengset" },
      { name: "Zero To Production In Rust", author: "Luca Palmieri" },
      { name: "Writing an OS in Rust", author: "Philipp Oppermann · Free" },
    ],
  },
  {
    title: "DSA, Daily Anchor",
    books: [
      { name: "DSAR — Data Structures & Algorithms in Rust", author: "RantAI" },
      { name: "Crafting Interpreters", author: "Robert Nystrom" },
    ],
  },
  {
    title: "The Moat (ZK & AI)",
    books: [
      { name: "Proofs, Arguments, and Zero-Knowledge", author: "Justin Thaler · Free" },
      { name: "Dive into Deep Learning", author: "d2l.ai · Free" },
    ],
  },
];

export function ArchitectureManifesto({
  initialMeta,
}: ArchitectureManifestoProps): React.ReactElement {
  const [whyStarted, setWhyStarted] = useState(initialMeta.why_started ?? "");
  const [quotes, setQuotes] = useState<Quote[]>(initialMeta.quotes ?? []);
  const [editingWhy, setEditingWhy] = useState(false);
  const [savingWhy, setSavingWhy] = useState(false);

  const [newQuote, setNewQuote] = useState("");
  const [newAuthor, setNewAuthor] = useState("");
  const [savingQuotes, setSavingQuotes] = useState(false);

  const saveMeta = async (changes: { why_started?: string; quotes?: Quote[] }): Promise<void> => {
    try {
      const res = await fetch("/api/admin/rust-challenge/meta", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(changes),
      });
      if (!res.ok) throw new Error("Save failed");
      toast.success("Manifesto updated successfully");
    } catch {
      toast.error("Failed to save manifesto");
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
    <div className="space-y-6 sm:space-y-8">
      {/* Vision & Why I Started Hero Monograph */}
      <div className="relative overflow-hidden rounded-2xl border border-orange-500/30 dark:border-orange-500/20 bg-card/85 dark:bg-card/40 backdrop-blur-2xl p-5 sm:p-8 space-y-6 shadow-2xs">
        <span
          aria-hidden
          className="pointer-events-none select-none absolute -top-8 -right-4 text-[12rem] font-serif leading-none text-orange-950/[0.04] dark:text-orange-100/[0.04]"
        >
          &rdquo;
        </span>

        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            <h2 className="font-mono text-xs uppercase tracking-wider text-orange-700 dark:text-orange-400 font-semibold">
              The Purpose & The North Star
            </h2>
          </div>

          {!editingWhy && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setEditingWhy(true)}
              className="h-7 text-xs font-mono px-2.5 rounded-lg border-border/80 hover:bg-muted/50 cursor-pointer"
            >
              Edit Manifesto
            </Button>
          )}
        </div>

        {editingWhy ? (
          <div className="space-y-3">
            <Textarea
              value={whyStarted}
              onChange={(e) => setWhyStarted(e.target.value)}
              className="font-sans text-base min-h-[140px] bg-background dark:bg-black/50 border-border/70 dark:border-white/10 rounded-xl leading-relaxed text-foreground"
              placeholder="Articulate why you are undertaking this 188-day engineering sprint..."
            />
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={handleSaveWhy}
                disabled={savingWhy}
                className="h-8 px-3 text-xs font-mono font-medium bg-orange-600 dark:bg-orange-500 hover:bg-orange-700 dark:hover:bg-orange-600 text-white rounded-lg cursor-pointer"
              >
                {savingWhy ? <Loader2 className="h-3 w-3 animate-spin mr-1.5" /> : <Check className="h-3 w-3 mr-1.5" />}
                Save
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setEditingWhy(false)}
                className="h-8 px-3 text-xs font-mono text-muted-foreground cursor-pointer"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <p className="font-display text-lg sm:text-2xl font-medium leading-relaxed text-foreground text-balance">
            {whyStarted || "Not set yet — articulate your core driver here."}
          </p>
        )}

        {/* Dynamic Quotes Gallery */}
        {quotes.length > 0 && (
          <div className="border-t border-border/40 dark:border-white/5 pt-5 space-y-4">
            {quotes.map((q, i) => (
              <div key={i} className="flex items-start justify-between gap-4 group">
                <div className="flex items-start gap-2.5">
                  <span className="text-2xl leading-none font-serif text-orange-500/70 -mt-1">&ldquo;</span>
                  <div>
                    <p className="text-sm italic text-foreground/90 font-serif leading-relaxed">{q.quote}</p>
                    <p className="text-xs font-mono text-muted-foreground mt-0.5 font-medium">— {q.author}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveQuote(i)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-rose-500 transition-opacity cursor-pointer"
                  title="Remove quote"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add Quote Inline */}
        <div className="pt-2 flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <Input
            value={newQuote}
            onChange={(e) => setNewQuote(e.target.value)}
            placeholder="Add an inspirational quote..."
            className="text-xs bg-background dark:bg-black/30 border-border/70 dark:border-white/10 rounded-lg h-8 text-foreground"
          />
          <Input
            value={newAuthor}
            onChange={(e) => setNewAuthor(e.target.value)}
            placeholder="Author"
            className="text-xs bg-background dark:bg-black/30 border-border/70 dark:border-white/10 rounded-lg h-8 sm:w-44 text-foreground"
          />
          <Button
            size="sm"
            onClick={handleAddQuote}
            disabled={savingQuotes || !newQuote.trim()}
            className="h-8 text-xs font-mono px-3 rounded-lg bg-foreground/10 hover:bg-foreground/20 text-foreground cursor-pointer shrink-0"
          >
            {savingQuotes ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3 mr-1" />}
            Add
          </Button>
        </div>
      </div>

      {/* The 4 Tiers of Engineering Mastery */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            The 4 Tiers of Engineering Mastery
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {TIERS.map((tier) => (
            <div
              key={tier.n}
              className="rounded-2xl border border-border/60 dark:border-border/40 bg-card/75 dark:bg-card/30 backdrop-blur-xl p-4 sm:p-5 space-y-3 shadow-2xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-orange-600 dark:text-orange-400">Tier {tier.n}</span>
                <Badge variant="outline" className="font-mono text-[10px] font-medium">
                  {tier.items.length} Primitives
                </Badge>
              </div>

              <h4 className="font-display text-base font-bold text-foreground">{tier.title}</h4>

              <ul className="space-y-1.5 text-xs text-foreground/80 font-sans">
                {tier.items.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-orange-500/70" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Mental Models & Strategy Grid */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-sky-600 dark:text-sky-400" />
          <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            Mental Models For High-Velocity Execution
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MENTAL_MODELS.map((mm, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-border/60 dark:border-border/40 bg-card/75 dark:bg-card/30 backdrop-blur-xl p-4 sm:p-5 space-y-2 shadow-2xs"
            >
              <h4 className="font-mono text-xs font-bold text-sky-700 dark:text-sky-400 uppercase tracking-wide">
                {mm.name}
              </h4>
              <p className="text-xs sm:text-[13px] text-foreground/85 leading-relaxed font-sans">
                {mm.text}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Target Ecosystems & Bounties */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Rocket className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            Target Repositories & Paid Bounties
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {TARGETS.map((t, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-border/60 dark:border-border/40 bg-card/75 dark:bg-card/30 backdrop-blur-xl p-4 space-y-2 shadow-2xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-display font-bold text-sm text-foreground">{t.name}</span>
                <Badge variant="outline" className={`font-mono text-[9px] px-1.5 py-0 font-semibold ${t.badge}`}>
                  Active Target
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground font-mono">{t.type}</p>
              <p className="text-xs text-foreground/80 font-sans">{t.note}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Reading Moat */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            The Moat: Canonical Architecture & Theory Texts
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {BOOK_GROUPS.map((group, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-border/60 dark:border-border/40 bg-card/75 dark:bg-card/30 backdrop-blur-xl p-4 sm:p-5 space-y-3 shadow-2xs"
            >
              <h4 className="font-mono text-xs font-semibold text-purple-700 dark:text-purple-400 uppercase tracking-wide">
                {group.title}
              </h4>
              <ul className="space-y-2 text-xs font-sans">
                {group.books.map((b, bIdx) => (
                  <li key={bIdx} className="space-y-0.5">
                    <p className="font-medium text-foreground">{b.name}</p>
                    <p className="text-[11px] font-mono text-muted-foreground">{b.author}</p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
