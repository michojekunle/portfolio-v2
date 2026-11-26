"use client";

import { useState } from "react";
import { X, Sparkles, ShieldAlert, Check, Plus, Trash2, Mic } from "lucide-react";
import type { VoiceProfile } from "../lib/types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  voiceProfile: VoiceProfile | null;
  onSaveVoiceProfile: (profile: VoiceProfile | null) => void;
  accent: string;
}

export function VoicePersonaModal({
  isOpen,
  onClose,
  voiceProfile,
  onSaveVoiceProfile,
  accent,
}: Props): React.ReactElement | null {
  const [activeTab, setActiveTab] = useState<"analyze" | "guardrails">("analyze");
  const [samplePostsText, setSamplePostsText] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Local draft state initialized from prop
  const [toneSummary, setToneSummary] = useState(voiceProfile?.toneSummary ?? "");
  const [cadence, setCadence] = useState<"staccato" | "balanced" | "narrative">(voiceProfile?.cadence ?? "balanced");
  const [bannedWords, setBannedWords] = useState<string[]>(
    voiceProfile?.bannedWords ?? ["delve", "unlock", "supercharge", "synergy", "game-changer", "testament", "in conclusion"]
  );
  const [customRules, setCustomRules] = useState<string[]>(
    voiceProfile?.customRules ?? [
      "Keep sentences under 15 words",
      "Avoid motivational fluff or generic advice",
      "Start hook with a concrete observation or metric",
    ]
  );
  const [newBannedWord, setNewBannedWord] = useState("");
  const [newRule, setNewRule] = useState("");

  if (!isOpen) return null;

  const handleAnalyzeVoice = async (): Promise<void> => {
    const raw = samplePostsText.trim();
    if (!raw) {
      setError("Please paste at least 1 sample post or excerpt.");
      return;
    }
    setError(null);
    setAnalyzing(true);

    // Split by separator or treat as posts
    const splitPosts = raw.split(/\n---+\n|\n\n\n+/).map((p) => p.trim()).filter((p) => p.length > 10);
    const postsToAnalyze = splitPosts.length > 0 ? splitPosts.slice(0, 3) : [raw];

    try {
      const res = await fetch("/api/carousel-lab/voice-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ posts: postsToAnalyze }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Analysis failed");

      const profile = data.voiceProfile as VoiceProfile;
      setToneSummary(profile.toneSummary);
      setCadence(profile.cadence);
      setBannedWords(profile.bannedWords);
      setCustomRules(profile.customRules);
      setActiveTab("guardrails");
    } catch (err) {
      console.error("[voice-profile] error:", err);
      setError(err instanceof Error ? err.message : "Failed to analyze sample posts.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAddBannedWord = (): void => {
    const w = newBannedWord.trim().toLowerCase();
    if (w && !bannedWords.includes(w)) {
      setBannedWords([...bannedWords, w]);
      setNewBannedWord("");
    }
  };

  const handleRemoveBannedWord = (word: string): void => {
    setBannedWords(bannedWords.filter((w) => w !== word));
  };

  const handleAddRule = (): void => {
    const r = newRule.trim();
    if (r && !customRules.includes(r)) {
      setCustomRules([...customRules, r]);
      setNewRule("");
    }
  };

  const handleRemoveRule = (rule: string): void => {
    setCustomRules(customRules.filter((r) => r !== rule));
  };

  const handleSave = (): void => {
    const profile: VoiceProfile = {
      toneSummary: toneSummary.trim() || "Direct, clear, concise, and authentic.",
      cadence,
      bannedWords,
      customRules,
      sampleSnippets: voiceProfile?.sampleSnippets ?? [],
      extractedAt: Date.now(),
    };
    onSaveVoiceProfile(profile);
    onClose();
  };

  const handleReset = (): void => {
    if (window.confirm("Remove your saved voiceprint and reset to system defaults?")) {
      onSaveVoiceProfile(null);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-xl rounded-2xl border border-(--rule) bg-(--bg) shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        style={{ borderColor: "var(--rule)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-(--rule)">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${accent}20`, color: accent }}>
              <Mic size={16} />
            </div>
            <div>
              <h2 className="text-[16px] font-bold text-(--ink) m-0">Creator Voiceprint & Guardrails</h2>
              <p className="text-[11px] text-muted-foreground m-0">
                Train the generator to ghostwrite in your authentic voice and enforce boundaries.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-(--ink) hover:bg-(--bg-2) transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-(--rule) px-6 pt-3 gap-6 bg-(--bg-2)">
          <button
            type="button"
            onClick={() => setActiveTab("analyze")}
            className="pb-3 font-mono text-[11px] uppercase tracking-wider font-semibold border-b-2 transition-colors cursor-pointer"
            style={{
              borderColor: activeTab === "analyze" ? accent : "transparent",
              color: activeTab === "analyze" ? accent : "var(--ink-3)",
            }}
          >
            1. Infer Voice From Posts
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("guardrails")}
            className="pb-3 font-mono text-[11px] uppercase tracking-wider font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5"
            style={{
              borderColor: activeTab === "guardrails" ? accent : "transparent",
              color: activeTab === "guardrails" ? accent : "var(--ink-3)",
            }}
          >
            <ShieldAlert size={12} /> 2. Guardrails & Boundaries
          </button>
        </div>

        {/* Body content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {error && (
            <div className="p-3 rounded-lg text-[12px] bg-red-500/10 border border-red-500/30 text-red-500">
              {error}
            </div>
          )}

          {activeTab === "analyze" && (
            <div className="space-y-4">
              <div>
                <label className="block font-mono text-[10px] tracking-widest uppercase mb-1.5 text-muted-foreground">
                  Paste 1 to 3 of your best posts / tweets / excerpts
                </label>
                <textarea
                  rows={6}
                  placeholder={`Example:\nMost founders waste 40 hours building features nobody asked for. Here is our 3-step test to validate customer demand before touching code...\n\n(Separate multiple posts with '---')`}
                  value={samplePostsText}
                  onChange={(e) => setSamplePostsText(e.target.value)}
                  className="w-full rounded-xl p-3.5 text-sm outline-none border border-(--rule) bg-(--bg-2) text-(--ink) resize-none focus:border-(--ink)"
                />
              </div>

              <button
                type="button"
                onClick={() => void handleAnalyzeVoice()}
                disabled={analyzing || !samplePostsText.trim()}
                className="w-full py-3 rounded-xl font-mono text-[11px] uppercase tracking-wider font-bold text-white flex items-center justify-center gap-2 disabled:opacity-50 transition-opacity cursor-pointer"
                style={{ background: accent }}
              >
                <Sparkles size={14} />
                {analyzing ? "Analyzing linguistic cadence & tone..." : "Analyze My Voiceprint"}
              </button>

              {toneSummary && (
                <div className="p-4 rounded-xl border border-(--rule) bg-(--bg-2) space-y-2 mt-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      Inferred Voice Profile
                    </span>
                    <span className="font-mono text-[10px] font-semibold text-emerald-400 capitalize">
                      Cadence: {cadence}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-(--ink) m-0 leading-relaxed">
                    &ldquo;{toneSummary}&rdquo;
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "guardrails" && (
            <div className="space-y-5">
              {/* Tone Summary fine-tuning */}
              <div>
                <label className="block font-mono text-[10px] tracking-widest uppercase mb-1.5 text-muted-foreground">
                  Voiceprint Summary Statement
                </label>
                <input
                  type="text"
                  value={toneSummary}
                  onChange={(e) => setToneSummary(e.target.value)}
                  placeholder="e.g. Direct, technical, contrarian, no corporate fluff"
                  className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none border border-(--rule) bg-(--bg-2) text-(--ink)"
                />
              </div>

              {/* Cadence */}
              <div>
                <label className="block font-mono text-[10px] tracking-widest uppercase mb-1.5 text-muted-foreground">
                  Sentence Cadence
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["staccato", "balanced", "narrative"] as const).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCadence(c)}
                      className="py-2 rounded-lg border text-[11px] font-mono capitalize tracking-wide transition-colors cursor-pointer"
                      style={{
                        borderColor: cadence === c ? accent : "var(--rule)",
                        background: cadence === c ? `${accent}15` : "var(--bg-2)",
                        color: cadence === c ? accent : "var(--ink-2)",
                      }}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Banned Words (Anti-AI Clichés) */}
              <div>
                <label className="block font-mono text-[10px] tracking-widest uppercase mb-1.5 text-muted-foreground">
                  Forbidden Banned Words & Clichés (AI Will Never Use These)
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2.5">
                  {bannedWords.map((word) => (
                    <span
                      key={word}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono border border-red-500/30 bg-red-500/10 text-red-400"
                    >
                      {word}
                      <button
                        type="button"
                        onClick={() => handleRemoveBannedWord(word)}
                        className="hover:text-red-200 cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add banned word (e.g. delve, synergy)"
                    value={newBannedWord}
                    onChange={(e) => setNewBannedWord(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddBannedWord();
                      }
                    }}
                    className="flex-1 rounded-lg px-3 py-1.5 text-[12px] outline-none border border-(--rule) bg-(--bg-2) text-(--ink)"
                  />
                  <button
                    type="button"
                    onClick={handleAddBannedWord}
                    className="px-3 py-1.5 rounded-lg border border-(--rule) text-[11px] font-mono hover:bg-(--bg-2) cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Custom Guardrails */}
              <div>
                <label className="block font-mono text-[10px] tracking-widest uppercase mb-1.5 text-muted-foreground">
                  Custom Boundary Rules (Always Enforced)
                </label>
                <div className="space-y-2 mb-2.5">
                  {customRules.map((rule) => (
                    <div
                      key={rule}
                      className="flex items-center justify-between p-2 rounded-lg border border-(--rule) bg-(--bg-2) text-[12px] text-(--ink)"
                    >
                      <span>• {rule}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveRule(rule)}
                        className="text-muted-foreground hover:text-red-400 cursor-pointer p-1"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add boundary rule (e.g. 'Never use emojis', 'Keep lines under 12 words')"
                    value={newRule}
                    onChange={(e) => setNewRule(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddRule();
                      }
                    }}
                    className="flex-1 rounded-lg px-3 py-1.5 text-[12px] outline-none border border-(--rule) bg-(--bg-2) text-(--ink)"
                  />
                  <button
                    type="button"
                    onClick={handleAddRule}
                    className="px-3 py-1.5 rounded-lg border border-(--rule) text-[11px] font-mono hover:bg-(--bg-2) cursor-pointer flex items-center gap-1"
                  >
                    <Plus size={12} /> Add
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 px-6 border-t border-(--rule) bg-(--bg-2)">
          {voiceProfile ? (
            <button
              type="button"
              onClick={handleReset}
              className="text-[11px] font-mono text-red-400 hover:underline cursor-pointer"
            >
              Reset to Defaults
            </button>
          ) : <div />}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-[12px] font-mono border border-(--rule) hover:bg-(--bg) transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl text-[12px] font-mono font-bold text-white flex items-center gap-1.5 shadow-sm transition-opacity hover:opacity-90 cursor-pointer"
              style={{ background: accent }}
            >
              <Check size={14} /> Save Voiceprint & Rules
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
