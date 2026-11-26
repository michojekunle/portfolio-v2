"use client";

import { useState } from "react";
import { Plus, Sparkles, Rocket, LayoutTemplate, ArrowRight, Layers, Mic, MicOff, Loader2 } from "lucide-react";
import type { InputMode, VoiceProfile } from "../lib/types";
import { STARTER_DECKS, TRACK_METAS, type StarterDeck, type TemplateTrack } from "../lib/starter-decks";
import { useAudioRecorder } from "../lib/use-audio-recorder";
import { TemplateVisualPreview } from "./TemplateVisualPreview";

const TABS: { id: InputMode; label: string }[] = [
  { id: "topic", label: "From Topic" },
  { id: "refine", label: "Refine Raw Draft" },
  { id: "templates", label: "Starter Templates" },
  { id: "manual", label: "Start Manually" },
];

interface Props {
  accent: string;
  inputMode: InputMode;
  onModeChange: (mode: InputMode) => void;
  topic: string;
  onTopicChange: (value: string) => void;
  roughNotes: string;
  onRoughNotesChange: (value: string) => void;
  slideCount: number;
  onSlideCountChange: (value: number) => void;
  loading: boolean;
  onGenerate: () => void;
  onStartManual: () => void;
  onSelectStarterDeck: (deck: StarterDeck) => void;
  voiceProfile: VoiceProfile | null;
  onOpenVoiceModal: () => void;
}

function SlideCountSlider({
  accent,
  slideCount,
  onSlideCountChange,
  heightClass,
}: {
  accent: string;
  slideCount: number;
  onSlideCountChange: (v: number) => void;
  heightClass: string;
}): React.ReactElement {
  const pct = ((slideCount - 3) / (8 - 3)) * 100;
  return (
    <div className="w-[200px] max-[720px]:w-full">
      <label className="block font-mono text-[10px] tracking-[0.14em] uppercase mb-2.5 text-muted-foreground">
        Slides ({slideCount})
      </label>
      <div className={`flex items-center gap-3 ${heightClass} px-3 rounded-[10px] border border-(--rule) bg-(--bg)`}>
        <input
          type="range"
          min={3}
          max={8}
          value={slideCount}
          onChange={(e) => onSlideCountChange(Number(e.target.value))}
          className="flex-1 h-1 rounded-full appearance-none cursor-pointer"
          style={{ background: `linear-gradient(90deg, ${accent} ${pct}%, var(--rule) ${pct}%)`, accentColor: accent }}
          aria-label="Number of slides"
        />
        <span className="font-mono text-sm font-semibold text-(--ink)">{slideCount}</span>
      </div>
    </div>
  );
}

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
}

function StarterDeckCard({
  deck,
  accent,
  onSelect,
}: {
  deck: StarterDeck;
  accent: string;
  onSelect: (deck: StarterDeck) => void;
}): React.ReactElement {
  const [activeSlideIdx, setActiveSlideIdx] = useState(0);
  const currentSlide = deck.slides[activeSlideIdx] || deck.slides[0];

  return (
    <div className="p-4 rounded-2xl border border-(--rule) bg-(--bg) flex flex-col justify-between gap-3 group hover:border-muted-foreground/60 transition-all duration-150">
      <div className="space-y-3">
        {/* Top Meta: Track, Audience & Slide Count */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full border border-(--rule) text-(--ink-2) bg-(--bg-2)">
            {deck.trackLabel} • {deck.targetAudience}
          </span>
          <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
            <Layers size={10} /> {deck.slides.length} slides
          </span>
        </div>

        {/* Showcase Stage: True Aspect-Ratio Unstretched Slide Mockup */}
        <div className="w-full py-4 px-2 rounded-xl bg-(--bg-2)/70 border border-(--rule) flex flex-col items-center justify-center relative overflow-hidden">
          <TemplateVisualPreview
            aesthetic={deck.aesthetic}
            aspectRatio={deck.aspectRatio}
            slide={currentSlide}
            track={deck.track}
            creatorName={deck.creatorName}
            creatorHandle={deck.creatorHandle}
            topRightTag={deck.topRightTag}
            logoText={deck.logoText}
            slideIndex={activeSlideIdx}
            totalSlides={deck.slides.length}
            className="shadow-md"
          />

          {/* Interactive Slide Layout Switcher Pills */}
          <div className="flex items-center gap-1 mt-3 px-2 py-1 rounded-full bg-(--bg) border border-(--rule) shadow-xs overflow-x-auto max-w-full scrollbar-none">
            {deck.slides.map((s, idx) => {
              const label =
                s.layout === "hook"
                  ? "Hook"
                  : s.layout === "split"
                  ? "Split"
                  : s.layout === "metrics"
                  ? "Stat"
                  : s.layout === "quote"
                  ? "Quote"
                  : s.layout === "cta"
                  ? "CTA"
                  : `#${idx + 1}`;
              const isActive = activeSlideIdx === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveSlideIdx(idx);
                  }}
                  className={`px-2 py-0.5 rounded-full font-mono text-[8px] uppercase tracking-wider font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    isActive ? "text-white" : "text-(--ink-3)"
                  }`}
                  style={{
                    background: isActive ? accent : "transparent",
                  }}
                  title={`Preview Slide ${idx + 1}: ${s.layout || "default"} layout`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Deck Title & Subtitle */}
        <div>
          <h4 className="text-[14px] font-bold text-(--ink) m-0 group-hover:text-primary transition-colors">
            {deck.title}
          </h4>
          <p className="text-[11px] leading-relaxed text-muted-foreground m-0 mt-0.5">
            {deck.subtitle}
          </p>
        </div>
      </div>

      {/* Footer: Style metadata & Load Deck Action */}
      <div className="flex items-center justify-between pt-2 border-t border-(--rule)">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-muted-foreground">
            Style: <b className="text-(--ink-2)">{deck.aesthetic}</b>
          </span>
          <span className="text-[8px] font-mono px-1.5 py-0.25 rounded border border-(--rule) text-muted-foreground uppercase">
            {deck.aspectRatio === "square" ? "1:1" : "4:5"}
          </span>
        </div>
        <button
          type="button"
          onClick={() => onSelect(deck)}
          className="px-3.5 py-1.5 rounded-lg font-mono text-[10px] uppercase tracking-wider font-semibold text-white flex items-center gap-1.5 transition-opacity hover:opacity-90 cursor-pointer shadow-xs"
          style={{ background: accent }}
        >
          Load Deck <ArrowRight size={11} />
        </button>
      </div>
    </div>
  );
}

export function GeneratorForm({
  accent,
  inputMode,
  onModeChange,
  topic,
  onTopicChange,
  roughNotes,
  onRoughNotesChange,
  slideCount,
  onSlideCountChange,
  loading,
  onGenerate,
  onStartManual,
  onSelectStarterDeck,
  voiceProfile,
  onOpenVoiceModal,
}: Props): React.ReactElement {
  const [selectedTrack, setSelectedTrack] = useState<TemplateTrack>("all");
  const { isRecording, recordingDuration, isTranscribing, startRecording, stopRecording, error: micError } = useAudioRecorder();

  const canGenerate = (inputMode === "topic" ? topic.trim() : roughNotes.trim()) && !loading;

  const filteredDecks = STARTER_DECKS.filter((deck) => {
    if (selectedTrack === "all") return true;
    return deck.track === selectedTrack;
  });

  const handleStopRecording = async (): Promise<void> => {
    const transcript = await stopRecording();
    if (transcript) {
      if (inputMode === "topic") {
        onTopicChange(transcript);
      } else {
        const appended = roughNotes ? `${roughNotes}\n\n${transcript}` : transcript;
        onRoughNotesChange(appended);
        onModeChange("refine");
      }
    }
  };

  return (
    <div
      className="rounded-2xl p-8 max-[720px]:p-5 mb-10 space-y-6"
      style={{ background: "var(--bg-2)", border: "1px solid var(--rule)" }}
    >
      {/* Top Header: Mode Tabs + Voiceprint status button */}
      <div className="flex items-center justify-between border-b border-(--rule) pb-0.25 gap-4 overflow-x-auto flex-wrap">
        <div className="flex gap-6 shrink-0">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onModeChange(tab.id)}
              className="pb-3 font-mono text-[10px] uppercase tracking-[0.14em] font-semibold cursor-pointer border-b-2 transition-colors duration-150 shrink-0 flex items-center gap-1.5"
              style={{
                color: inputMode === tab.id ? accent : "var(--ink-3)",
                borderColor: inputMode === tab.id ? accent : "transparent",
              }}
            >
              {tab.id === "templates" && <LayoutTemplate size={12} />}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Voice Persona & Guardrails Pill */}
        <button
          type="button"
          onClick={onOpenVoiceModal}
          className="mb-2 px-3 py-1.5 rounded-lg border font-mono text-[10px] uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
          style={{
            borderColor: voiceProfile ? `${accent}80` : "var(--rule)",
            background: voiceProfile ? `${accent}15` : "var(--bg)",
            color: voiceProfile ? accent : "var(--ink-3)",
          }}
          title={voiceProfile ? `Voiceprint Active: ${voiceProfile.toneSummary}` : "Configure your custom tone & boundaries"}
        >
          <Mic size={11} className={voiceProfile ? "text-emerald-400" : ""} />
          <span>
            {voiceProfile ? `Voice: ${voiceProfile.cadence}` : "Set Tone & Guardrails"}
          </span>
          {voiceProfile && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          )}
        </button>
      </div>

      {micError && (
        <div className="p-3 rounded-lg text-[11px] bg-red-500/10 border border-red-500/30 text-red-400 font-mono">
          {micError}
        </div>
      )}

      {/* AUDIO RECORDING ACTIVE BANNER */}
      {isRecording && (
        <div className="p-4 rounded-xl border border-red-500/40 bg-red-500/10 flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
            <span className="font-mono text-[12px] font-bold text-red-400">
              Recording Voice Brain-Dump... ({formatDuration(recordingDuration)})
            </span>
          </div>
          <button
            type="button"
            onClick={() => void handleStopRecording()}
            className="px-4 py-1.5 rounded-lg bg-red-500 text-white font-mono text-[11px] uppercase tracking-wider font-bold hover:bg-red-600 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <MicOff size={13} /> Stop & Transcribe
          </button>
        </div>
      )}

      {isTranscribing && (
        <div className="p-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 flex items-center gap-3">
          <Loader2 size={16} className="text-emerald-400 animate-spin" />
          <span className="font-mono text-[12px] font-semibold text-emerald-400">
            Transcribing voice memo via Whisper AI...
          </span>
        </div>
      )}

      {inputMode === "topic" && (
        <div className="space-y-4">
          <div className="flex gap-4 max-[720px]:flex-col">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2.5">
                <label htmlFor="carousel-topic" className="block font-mono text-[10px] tracking-[0.14em] uppercase text-muted-foreground">
                  Topic or Content Pitch
                </label>
                {!isRecording && (
                  <button
                    type="button"
                    onClick={() => void startRecording()}
                    className="text-[10px] font-mono text-muted-foreground hover:text-red-400 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Mic size={11} className="text-red-400" /> Speak Topic
                  </button>
                )}
              </div>
              <input
                id="carousel-topic"
                type="text"
                placeholder="e.g. 5 Rules for Focus, How We Scaled to 10M Req/Sec, Zero-Marginal-Code Moats..."
                value={topic}
                onChange={(e) => onTopicChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") onGenerate();
                }}
                className="w-full rounded-[10px] px-4 h-13 text-base outline-none transition-colors duration-150"
                style={{ background: "var(--bg)", border: "1px solid var(--rule)", color: "var(--ink)" }}
                onFocus={(e) => (e.currentTarget.style.borderColor = accent)}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--rule)")}
              />
            </div>
            <SlideCountSlider accent={accent} slideCount={slideCount} onSlideCountChange={onSlideCountChange} heightClass="h-13" />
          </div>

          <div className="flex items-center gap-2 pt-1 flex-wrap">
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Or pick proven structure:
            </span>
            {STARTER_DECKS.slice(0, 4).map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => onSelectStarterDeck(d)}
                className="px-2.5 py-1 rounded-md text-[10px] font-mono tracking-tight bg-(--bg) border border-(--rule) hover:border-muted-foreground transition-colors text-(--ink-2) cursor-pointer"
              >
                {d.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {inputMode === "refine" && (
        <div className="space-y-4">
          <div className="flex gap-4 max-[720px]:flex-col">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2.5">
                <label htmlFor="carousel-notes" className="block font-mono text-[10px] tracking-[0.14em] uppercase text-muted-foreground">
                  Rough Notes / Copy Draft / Ideas Outline
                </label>
                {!isRecording && (
                  <button
                    type="button"
                    onClick={() => void startRecording()}
                    className="text-[10px] font-mono text-muted-foreground hover:text-red-400 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Mic size={11} className="text-red-400" /> Record Voice Brain-Dump
                  </button>
                )}
              </div>
              <textarea
                id="carousel-notes"
                placeholder="Paste your rough outline, outline points, draft notes, or record audio thoughts for AI to structure into high-converting slides..."
                value={roughNotes}
                onChange={(e) => onRoughNotesChange(e.target.value)}
                rows={4}
                className="w-full rounded-[10px] p-4 text-[14px] outline-none transition-colors duration-150 resize-none font-sans"
                style={{ background: "var(--bg)", border: "1px solid var(--rule)", color: "var(--ink)" }}
                onFocus={(e) => (e.currentTarget.style.borderColor = accent)}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--rule)")}
              />
            </div>
            <SlideCountSlider accent={accent} slideCount={slideCount} onSlideCountChange={onSlideCountChange} heightClass="h-24" />
          </div>

          <div className="flex items-center gap-2 pt-1 flex-wrap">
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Need a tested framework?
            </span>
            <button
              type="button"
              onClick={() => onModeChange("templates")}
              className="text-[10px] font-mono underline text-muted-foreground hover:text-(--ink) cursor-pointer"
            >
              Browse 5 Core Tracks & Templates →
            </button>
          </div>
        </div>
      )}

      {inputMode === "templates" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-[14px] font-semibold text-(--ink) m-0">
                Template Tracks: 5 Core Aesthetic Movements
              </h3>
              <p className="text-[12px] text-muted-foreground m-0 mt-0.5">
                From stark Swiss minimalism to social-native tweet frames, high-voltage maximalism, code terminals, and executive newsprint.
              </p>
            </div>
            <span className="font-mono text-[10px] text-emerald-400 font-medium">
              {filteredDecks.length} Ready Templates
            </span>
          </div>

          {/* Core Track Filter Tabs */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {TRACK_METAS.map((track) => (
              <button
                key={track.id}
                type="button"
                onClick={() => setSelectedTrack(track.id)}
                className="px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-wider shrink-0 transition-colors border cursor-pointer flex items-center gap-1.5"
                style={{
                  borderColor: selectedTrack === track.id ? accent : "var(--rule)",
                  background: selectedTrack === track.id ? `${accent}18` : "var(--bg)",
                  color: selectedTrack === track.id ? accent : "var(--ink-3)",
                }}
              >
                <span>{track.label}</span>
                <span className="text-[8px] opacity-70">({track.badge})</span>
              </button>
            ))}
          </div>

          {/* Starter Decks Grid */}
          <div className="grid grid-cols-2 max-[960px]:grid-cols-1 gap-4 pt-1">
            {filteredDecks.map((deck) => (
              <StarterDeckCard
                key={deck.id}
                deck={deck}
                accent={accent}
                onSelect={onSelectStarterDeck}
              />
            ))}
          </div>
        </div>
      )}

      {inputMode === "manual" && (
        <div className="p-6 rounded-[10px] border border-(--rule) bg-(--bg) text-center">
          <p className="text-sm leading-[1.65] text-secondary-foreground m-0">
            <Rocket size={14} className="inline mr-1 text-primary align-text-bottom" /> Skip AI generation entirely! Start with a default empty 3-slide template (Hook Cover, Body Point, Brand CTA Card) and craft your
            layout parameters, brand initials logo, and custom content slides directly in the sidebar design panels.
          </p>
        </div>
      )}

      {inputMode === "manual" ? (
        <button
          type="button"
          onClick={onStartManual}
          className="w-full h-13 rounded-[10px] font-mono text-[11px] uppercase tracking-[0.14em] font-semibold transition-all duration-200 text-white flex items-center justify-center gap-2 cursor-pointer"
          style={{ background: accent }}
        >
          <Plus size={14} /> Start Designer Canvas
        </button>
      ) : inputMode === "templates" ? null : (
        <button
          type="button"
          onClick={onGenerate}
          disabled={loading || (inputMode === "topic" ? !topic.trim() : !roughNotes.trim())}
          className="w-full h-13 rounded-[10px] font-mono text-[11px] uppercase tracking-[0.14em] font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-white flex items-center justify-center gap-2 cursor-pointer"
          style={{ background: canGenerate ? accent : "var(--rule)" }}
        >
          <Sparkles size={14} />
          {loading ? "Generating slides..." : "Generate carousel"}
        </button>
      )}
    </div>
  );
}
