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
    tierNumber: 1,
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
    tierNumber: 2,
    title: "Backend & Infra — Immediate Employability",
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
    tierNumber: 3,
    title: "ZK Depth — Cryptographic Foundations",
    items: [
      "Sumcheck & GKR Protocols",
      "KZG & Multilinear Commitments",
      "Fiat-Shamir Heuristic",
      "zkVMs (SP1, Risc0)",
      "Arithmetic Circuit Design",
    ],
  },
  {
    tierNumber: 4,
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
  { name: "EZKL", type: "zkML · Rust · Direct Target", note: "Study first, then PR", badge: "border-indigo-500/30 text-indigo-900 dark:text-indigo-300 bg-indigo-500/10" },
  { name: "SP1 / Risc0", type: "zkVM · Rust", note: "You've already touched SP1", badge: "border-sky-500/30 text-sky-900 dark:text-sky-300 bg-sky-500/10" },
  { name: "arkworks", type: "ZK Primitives · Rust", note: "Directly under your GKR/KZG work", badge: "border-emerald-500/30 text-emerald-900 dark:text-emerald-300 bg-emerald-500/10" },
  { name: "OnlyDust", type: "Paid OSS Bounties", note: "Rust/crypto-native, get paid to contribute", badge: "border-amber-500/30 text-amber-900 dark:text-amber-300 bg-amber-500/10" },
  { name: "Superteam", type: "Bounties & Grants", note: "Solana-adjacent, bridges your Web3 background", badge: "border-amber-500/30 text-amber-900 dark:text-amber-300 bg-amber-500/10" },
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
      toast.success("Saved");
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
    <div className="space-y-8">
      {/* Purpose & North Star */}
      <div className="rounded-2xl border border-border/80 bg-card/80 dark:bg-card/40 backdrop-blur-xl p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <Compass className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            <h2 className="font-mono text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              The North Star & Purpose
            </h2>
          </div>

          {!editingWhy && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setEditingWhy(true)}
              className="h-8 text-xs font-mono px-3 rounded-lg border-border/80 hover:bg-muted/50 cursor-pointer"
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
              className="font-sans text-sm sm:text-base min-h-[140px] bg-background border-border/80 rounded-xl leading-relaxed text-foreground"
              placeholder="Articulate why you are undertaking this 188-day engineering sprint..."
            />
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={handleSaveWhy}
                disabled={savingWhy}
                className="h-8 px-3 text-xs font-mono font-medium bg-foreground text-background hover:bg-foreground/90 rounded-lg cursor-pointer"
              >
                {savingWhy ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <Check className="h-3.5 w-3.5 mr-1.5" />}
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
          <p className="font-sans font-medium text-lg sm:text-xl leading-relaxed text-foreground text-balance">
            {whyStarted || "Not set yet — articulate your core purpose here."}
          </p>
        )}

        {/* Quotes List */}
        {quotes.length > 0 && (
          <div className="border-t border-border/60 pt-5 space-y-3">
            {quotes.map((q, i) => (
              <div key={i} className="flex items-start justify-between gap-4 group p-2 rounded-lg hover:bg-muted/30">
                <div className="space-y-0.5">
                  <p className="text-sm italic text-foreground/90 font-sans leading-relaxed">
                    &ldquo;{q.quote}&rdquo;
                  </p>
                  <p className="text-xs font-mono text-muted-foreground">— {q.author}</p>
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
            className="text-xs bg-background border-border/80 rounded-lg h-8 text-foreground"
          />
          <Input
            value={newAuthor}
            onChange={(e) => setNewAuthor(e.target.value)}
            placeholder="Author"
            className="text-xs bg-background border-border/80 rounded-lg h-8 sm:w-44 text-foreground"
          />
          <Button
            size="sm"
            onClick={handleAddQuote}
            disabled={savingQuotes || !newQuote.trim()}
            className="h-8 text-xs font-mono px-3 rounded-lg bg-foreground/10 hover:bg-foreground/20 text-foreground cursor-pointer shrink-0"
          >
            {savingQuotes ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5 mr-1" />}
            Add
          </Button>
        </div>
      </div>

      {/* The 4 Tiers of Mastery */}
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
              key={tier.tierNumber}
              className="rounded-2xl border border-border/80 bg-card/80 dark:bg-card/40 backdrop-blur-xl p-5 space-y-3 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-foreground">
                  Tier {tier.tierNumber}
                </span>
                <Badge variant="outline" className="font-mono text-xs font-medium">
                  {tier.items.length} Primitives
                </Badge>
              </div>

              <h4 className="font-sans font-bold text-base text-foreground">{tier.title}</h4>

              <ul className="space-y-1.5 text-xs sm:text-sm text-foreground/80 font-sans">
                {tier.items.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Mental Models */}
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
              className="rounded-2xl border border-border/80 bg-card/80 dark:bg-card/40 backdrop-blur-xl p-5 space-y-2 shadow-xs"
            >
              <h4 className="font-mono text-xs font-bold text-foreground uppercase tracking-wide">
                {mm.name}
              </h4>
              <p className="text-xs sm:text-sm text-foreground/85 leading-relaxed font-sans">
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
              className="rounded-xl border border-border/80 bg-card/80 dark:bg-card/40 backdrop-blur-xl p-4 space-y-2 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-sans font-bold text-sm text-foreground">{t.name}</span>
                <Badge variant="outline" className={`font-mono text-xs px-2 py-0.5 font-medium ${t.badge}`}>
                  Target
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
          <BookOpen className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            Canonical Architecture & Theory Texts
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {BOOK_GROUPS.map((group, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-border/80 bg-card/80 dark:bg-card/40 backdrop-blur-xl p-5 space-y-3 shadow-xs"
            >
              <h4 className="font-mono text-xs font-semibold text-foreground uppercase tracking-wide">
                {group.title}
              </h4>
              <ul className="space-y-2 text-xs font-sans">
                {group.books.map((b, bIdx) => (
                  <li key={bIdx} className="space-y-0.5">
                    <p className="font-medium text-foreground">{b.name}</p>
                    <p className="text-xs font-mono text-muted-foreground">{b.author}</p>
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
