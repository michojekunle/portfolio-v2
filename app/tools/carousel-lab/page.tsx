"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { TOOL_COLORS } from "@/lib/tool-colors";
import { MOOD_STYLES } from "./lib/constants";
import { exportSlideAsPNG, exportSlidesAsPDF, exportSlidesAsZip } from "./lib/export-slides";
import { CAROUSEL_FONT_VARIABLES, CAROUSEL_MONO_FONT, CAROUSEL_SANS_FONT, resolveCarouselFont } from "./lib/fonts";
import type {
  ActiveStyle,
  AestheticMood,
  AspectRatio,
  BackgroundStyle,
  BrandConfig,
  CarouselDraft,
  DesignPreset,
  DesignPresetData,
  ExportKind,
  InputMode,
  GenerateResponse,
  LogoMark,
  Slide,
  SlideLayout,
  VoiceProfile,
} from "./lib/types";
import { STARTER_DECKS, type StarterDeck } from "./lib/starter-decks";
import { useColorOverrides } from "./lib/use-color-overrides";
import { useDesignPresets } from "./lib/use-design-presets";
import { useLogoUpload } from "./lib/use-logo-upload";
import { readDraft, writeDraft, clearDraft } from "./lib/draft-storage";
import { PageHeader } from "./components/PageHeader";
import { GeneratorForm } from "./components/GeneratorForm";
import { StudioInspector } from "./components/StudioInspector";
import { SlideDeckFilmstrip } from "./components/SlideDeckFilmstrip";
import { DraftRestoreBanner } from "./components/DraftRestoreBanner";
import { ExportToolbar } from "./components/ExportToolbar";
import { LayoutPicker } from "./components/LayoutPicker";
import { SlidePreview } from "./components/SlidePreview";
import { SlideNavControls } from "./components/SlideNavControls";
import { Sparkles, X, Layers, Palette } from "lucide-react";
import { SlideContentEditor } from "./components/SlideContentEditor";
import { UpgradeModal } from "./components/UpgradeModal";
import { VoicePersonaModal } from "./components/VoicePersonaModal";

const { accent: ACCENT, accentSoft: ACCENT_SOFT, accentBorder: ACCENT_BORDER } = TOOL_COLORS["carousel-lab"];

const MANUAL_DECK: Slide[] = [
  {
    title: "The Ultimate Hook Title",
    content: "Tap 'Edit Slide Content' in the sidebar below to customize this text directly.",
    layout: "hook",
  },
  {
    title: "Key Point 01",
    content: "Illustrate your first concept or instruction in 2-3 clean, punchy sentences.",
    layout: "default",
  },
  {
    title: "Let's connect!",
    content: "Customize this call to action layout to redirect swipers to your personal brand site.",
    layout: "cta",
  },
];

function getThemeForAesthetic(mood: AestheticMood): string {
  switch (mood) {
    case "Terminal Obsidian":
      return "Tech";
    case "Venture Thesis":
      return "Executive";
    case "Midnight Neon":
      return "Growth";
    case "Warm Clay & Mindset":
      return "Mindset";
    case "Linear Swiss":
      return "Design";
    case "Brutalist Punch":
    case "Brutalist":
      return "Brutalist";
    case "Premium Editorial (Zamir)":
    case "Light Editorial (Zamir Light)":
      return "Editorial";
    case "Maximalist":
      return "Bold";
    case "Minimalist Notes":
    case "Minimalist Clean":
    case "Minimalist":
    default:
      return "Minimal";
  }
}

export default function CarouselLabPage(): React.ReactElement {
  const [inputMode, setInputMode] = useState<InputMode>("topic");
  const [topic, setTopic] = useState("");
  const [roughNotes, setRoughNotes] = useState("");
  const [slideCount, setSlideCount] = useState(5);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [exportLoading, setExportLoading] = useState<ExportKind | null>(null);

  // Brand personalization — defaults to Michael Ojekunle's own identity
  const [aesthetic, setAesthetic] = useState<AestheticMood>("Premium Editorial (Zamir)");
  const [creatorName, setCreatorName] = useState("Michael Ojekunle");
  const [creatorHandle, setCreatorHandle] = useState("michaelojekunle.dev");
  const [showBranding, setShowBranding] = useState(true);
  const [topRightTag, setTopRightTag] = useState("Field Notes");
  const [logoText, setLogoText] = useState("MICHAEL");
  const [logoMark, setLogoMark] = useState<LogoMark>("mo");
  const { logoImage, logoImageEl, upload: uploadLogo, remove: removeLogo } = useLogoUpload();

  // Canvas customization
  const [backgroundStyle, setBackgroundStyle] = useState<BackgroundStyle>("mesh");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("portrait");
  const [fontTitle, setFontTitle] = useState("default");
  const [fontBody, setFontBody] = useState("default");
  const [titleScale, setTitleScale] = useState(1);
  const [bodyScale, setBodyScale] = useState(1);
  const { customBg, customText, customAccent, setCustomBg, setCustomText, setCustomAccent, resetOverrides } = useColorOverrides();
  const { presets, savePreset, deletePreset } = useDesignPresets();
  const [pendingDraft, setPendingDraft] = useState<CarouselDraft | null>(null);

  // Pro tier state (defaults to active so all features & unwatermarked exports are enabled)
  const [isPro, setIsPro] = useState(true);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [importNotification, setImportNotification] = useState<string | null>(null);

  // Voiceprint & Guardrails state
  const [voiceProfile, setVoiceProfile] = useState<VoiceProfile | null>(null);
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);
  const [mobileStudioTab, setMobileStudioTab] = useState<"canvas" | "inspector">("canvas");
  const studioRef = useRef<HTMLDivElement>(null);

  // Hydrate Pro status & check for thread import on mount
  useEffect(() => {
    try {
      const storedPro = localStorage.getItem("carousel_lab_is_pro");
      if (storedPro === "true") {
        setIsPro(true);
      }

      // Check for saved voice profile
      const storedVoice = localStorage.getItem("carousel_lab_voice_profile");
      if (storedVoice) {
        try {
          const parsed = JSON.parse(storedVoice);
          if (parsed && parsed.toneSummary) {
            setVoiceProfile(parsed);
          }
        } catch {
          // ignore corrupted profile
        }
      }

      // Check for redirect callback from payment provider (?pro=unlocked or ?checkout=success)
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        if (params.get("pro") === "unlocked" || params.get("checkout") === "success") {
          setIsPro(true);
          localStorage.setItem("carousel_lab_is_pro", "true");
          setImportNotification("🎉 Payment verified! Pro features and watermark removal are permanently active.");
        }
      }

      const imported = localStorage.getItem("carousel_lab_import");
      if (imported) {
        const data = JSON.parse(imported);
        if (data && Array.isArray(data.slides) && data.slides.length > 0) {
          setSlides(data.slides);
          if (data.topic) setTopic(data.topic);
          setActiveSlideIndex(0);
          localStorage.removeItem("carousel_lab_import");
          setImportNotification(`Imported ${data.slides.length} slides from Thread Studio!`);
        }
      }
    } catch (err) {
      console.error("[carousel-lab] Hydration error:", err);
    }
  }, []);

  const handleTogglePro = (nextPro: boolean): void => {
    setIsPro(nextPro);
    if (nextPro) {
      localStorage.setItem("carousel_lab_is_pro", "true");
    } else {
      localStorage.removeItem("carousel_lab_is_pro");
    }
  };

  const activeSlide = slides[activeSlideIndex] ?? null;
  const hasSlides = slides.length > 0;
  const activeMoodStyle = MOOD_STYLES[aesthetic];

  // Still warn on an actual browser-level unload (reload/close/back) even
  // though autosave exists (below) — autosave is debounced, so the very
  // latest few keystrokes could still be unwritten at the moment of unload.
  useEffect(() => {
    if (!hasSlides) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent): void => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasSlides]);

  // Resolved style + brand config, threaded into both the live preview and
  // the canvas exporter so the two can never independently drift.
  const rawTitleFont = fontTitle !== "default" ? fontTitle : activeMoodStyle.fontTitle;
  const rawBodyFont = fontBody !== "default" ? fontBody : activeMoodStyle.fontBody;
  const activeStyle: ActiveStyle = {
    bg: customBg || activeMoodStyle.bg,
    text: customText || activeMoodStyle.text,
    accent: customAccent || activeMoodStyle.accent,
    subtext: activeMoodStyle.subtext,
    border: activeMoodStyle.border,
    borderWidth: activeMoodStyle.borderWidth,
    borderRadius: activeMoodStyle.borderRadius,
    fontTitle: resolveCarouselFont(rawTitleFont),
    fontBody: resolveCarouselFont(rawBodyFont),
    fontMono: CAROUSEL_MONO_FONT,
    fontSans: CAROUSEL_SANS_FONT,
    titleScale,
    bodyScale,
    italic: activeMoodStyle.isItalicTitle,
    divider: activeMoodStyle.showDivider,
    shadow: activeMoodStyle.shadow,
    badgeBg: activeMoodStyle.badgeBg,
    badgeColor: activeMoodStyle.badgeColor,
  };

  const brandConfig: BrandConfig = {
    showBranding,
    logoText,
    logoImage: logoImageEl,
    logoMark,
    topRightTag,
    creatorName,
    creatorHandle,
  };

  // Design presets and the autosaved draft both capture the "how it looks"
  // state — mood, fonts, sizes, color overrides, branding — never slide
  // content and never the uploaded logo image (not serializable into
  // localStorage). One builder/applier pair, reused by both features, so
  // they can't quietly drift into capturing different fields.
  const currentDesign: DesignPresetData = {
    aesthetic,
    backgroundStyle,
    aspectRatio,
    fontTitle,
    fontBody,
    titleScale,
    bodyScale,
    customBg,
    customText,
    customAccent,
    showBranding,
    logoMark,
    logoText,
    topRightTag,
    creatorName,
    creatorHandle,
  };

  const applyDesign = (d: DesignPresetData): void => {
    setAesthetic(d.aesthetic);
    setBackgroundStyle(d.backgroundStyle);
    setAspectRatio(d.aspectRatio);
    setFontTitle(d.fontTitle);
    setFontBody(d.fontBody);
    setTitleScale(d.titleScale);
    setBodyScale(d.bodyScale);
    setCustomBg(d.customBg);
    setCustomText(d.customText);
    setCustomAccent(d.customAccent);
    setShowBranding(d.showBranding);
    setLogoMark(d.logoMark);
    setLogoText(d.logoText);
    setTopRightTag(d.topRightTag);
    setCreatorName(d.creatorName);
    setCreatorHandle(d.creatorHandle);
  };

  const handleSavePreset = (name: string): void => savePreset(name, currentDesign);
  const handleApplyPreset = (preset: DesignPreset): void => applyDesign(preset.data);

  // Runs once, before the autosave effect below has ever had a chance to
  // write anything (it only fires once hasSlides is true, and slides starts
  // empty) — so this always sees whatever the *previous* session left behind,
  // never something this render just wrote.
  useEffect(() => {
    const draft = readDraft();
    if (draft && draft.slides.length > 0) setPendingDraft(draft);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only
  }, []);

  const handleRestoreDraft = (): void => {
    if (!pendingDraft) return;
    setSlides(pendingDraft.slides);
    setActiveSlideIndex(pendingDraft.activeSlideIndex);
    setTopic(pendingDraft.topic);
    setRoughNotes(pendingDraft.roughNotes);
    setInputMode(pendingDraft.inputMode);
    setSlideCount(pendingDraft.slideCount);
    applyDesign(pendingDraft.design);
    setPendingDraft(null);
  };

  const handleDiscardDraft = (): void => {
    clearDraft();
    setPendingDraft(null);
  };

  // Debounced autosave — waits for a pause in editing rather than writing to
  // localStorage on every keystroke. Only runs once there's a deck and only
  // after the restore-or-discard decision above has been made, so it can
  // never overwrite an unconfirmed draft out from under that prompt.
  useEffect(() => {
    if (!hasSlides || pendingDraft) return;
    const timeout = setTimeout(() => {
      writeDraft({
        savedAt: Date.now(),
        slides,
        activeSlideIndex,
        topic,
        roughNotes,
        inputMode,
        slideCount,
        design: currentDesign,
      });
    }, 800);
    return () => clearTimeout(timeout);
  }, [hasSlides, pendingDraft, slides, activeSlideIndex, topic, roughNotes, inputMode, slideCount, currentDesign]);

  const generate = useCallback(async (): Promise<void> => {
    const activeTextSource = inputMode === "refine" ? roughNotes.trim() : topic.trim();
    if (!activeTextSource) return;
    if (hasSlides && !window.confirm("Generating a new deck replaces your current slides and can't be undone. Continue?")) return;
    // Starting fresh content implicitly resolves any still-open restore
    // prompt — otherwise the autosave effect below stays paused forever
    // (it defers to an unresolved pendingDraft), silently leaving this new
    // deck unprotected while the banner keeps showing stale, unrelated info.
    if (pendingDraft) {
      clearDraft();
      setPendingDraft(null);
    }
    setLoading(true);
    setSlides([]);
    setActiveSlideIndex(0);

    try {
      const res = await fetch("/api/carousel-lab/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: activeTextSource,
          slideCount,
          theme: getThemeForAesthetic(aesthetic),
          mode: inputMode === "refine" ? "refine" : "topic",
          voiceProfile: voiceProfile ?? undefined,
        }),
      });

      const data = (await res.json()) as GenerateResponse;
      if (!res.ok || data.error) throw new Error(data.error ?? `Request failed: ${res.status}`);
      if (!data.slides || data.slides.length === 0) throw new Error("No slides returned from AI");

      // First slide as Hook, last as CTA, everything between as Default.
      const mapped = data.slides.map((s, idx) => ({
        ...s,
        layout: idx === 0 ? ("hook" as SlideLayout) : idx === data.slides.length - 1 ? ("cta" as SlideLayout) : ("default" as SlideLayout),
      }));
      setSlides(mapped);
    } catch (err) {
      console.error("[carousel-lab] generate error:", err);
    } finally {
      setLoading(false);
    }
  }, [topic, roughNotes, inputMode, slideCount, aesthetic, voiceProfile, hasSlides, pendingDraft]);

  const handleSaveVoiceProfile = (profile: VoiceProfile | null): void => {
    setVoiceProfile(profile);
    if (profile) {
      localStorage.setItem("carousel_lab_voice_profile", JSON.stringify(profile));
      setImportNotification(`Saved Voiceprint: "${profile.toneSummary}" (${profile.bannedWords.length} banned words)`);
    } else {
      localStorage.removeItem("carousel_lab_voice_profile");
      setImportNotification("Reset to standard neutral tone.");
    }
  };

  const startManualDeck = (): void => {
    if (hasSlides && !window.confirm("Starting a manual deck replaces your current slides and can't be undone. Continue?")) return;
    if (pendingDraft) {
      clearDraft();
      setPendingDraft(null);
    }
    setSlides(MANUAL_DECK);
    setActiveSlideIndex(0);
  };

  const handleSelectStarterDeck = (deck: StarterDeck): void => {
    if (hasSlides && !window.confirm(`Loading "${deck.title}" replaces your current slides and can't be undone. Continue?`)) return;
    if (pendingDraft) {
      clearDraft();
      setPendingDraft(null);
    }
    setSlides(deck.slides);
    setActiveSlideIndex(0);
    setTopic(deck.title);
    setAesthetic(deck.aesthetic);
    setAspectRatio(deck.aspectRatio);
    setBackgroundStyle(deck.backgroundStyle);
    setTopRightTag(deck.topRightTag);
    if (deck.logoText !== undefined) setLogoText(deck.logoText);
    if (deck.logoMark) setLogoMark(deck.logoMark);
    setFontTitle(deck.fontTitle ?? "default");
    setFontBody(deck.fontBody ?? "default");
    resetOverrides();
    setInputMode("topic");
    setMobileStudioTab("canvas");
    setImportNotification(`Loaded "${deck.title}" template with ${deck.aesthetic} styling!`);
    requestAnimationFrame(() => {
      studioRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const updateActiveSlide = (field: keyof Slide, value: string): void => {
    setSlides((prev) => prev.map((s, idx) => (idx === activeSlideIndex ? { ...s, [field]: value } : s)));
  };

  const addSlide = (): void => {
    setSlides((prev) => [
      ...prev,
      { title: "New Key Takeaway", content: "Describe this main concept or point in a short, scroll-stopping sentence.", emoji: "", layout: "default" },
    ]);
    setActiveSlideIndex(slides.length);
  };

  const deleteSlide = (index: number): void => {
    if (slides.length <= 1) return;
    setSlides((prev) => prev.filter((_, idx) => idx !== index));
    setActiveSlideIndex((prev) => Math.max(0, prev - 1));
  };

  const duplicateSlide = (index: number): void => {
    const target = slides[index];
    if (!target) return;
    setSlides((prev) => [...prev.slice(0, index + 1), { ...target }, ...prev.slice(index + 1)]);
    setActiveSlideIndex(index + 1);
  };

  const handleExportPng = async (): Promise<void> => {
    if (!activeSlide) return;
    setExportLoading("png");
    try {
      await exportSlideAsPNG(activeSlide, activeSlideIndex, aspectRatio, { style: activeStyle, brand: brandConfig, backgroundStyle, aspectRatio, isPro });
    } catch (err) {
      console.error("[carousel-lab] PNG export failed:", err);
    } finally {
      setExportLoading(null);
    }
  };

  const handleExportZip = async (): Promise<void> => {
    if (exportLoading) return;
    setExportLoading("zip");
    try {
      await exportSlidesAsZip(slides, aspectRatio, { style: activeStyle, brand: brandConfig, backgroundStyle, aspectRatio, isPro }, topic.slice(0, 20));
    } catch (err) {
      console.error("[carousel-lab] ZIP export failed:", err);
    } finally {
      setExportLoading(null);
    }
  };

  const handleExportPdf = async (): Promise<void> => {
    if (exportLoading) return;
    setExportLoading("pdf");
    try {
      await exportSlidesAsPDF(slides, aspectRatio, { style: activeStyle, brand: brandConfig, backgroundStyle, aspectRatio, isPro }, topic.slice(0, 16));
    } catch (err) {
      console.error("[carousel-lab] PDF export failed:", err);
    } finally {
      setExportLoading(null);
    }
  };

  return (
    <main id="main-content" tabIndex={-1} className={`outline-none min-h-screen ${CAROUSEL_FONT_VARIABLES}`} style={{ background: "var(--bg)" }}>
      <PageHeader
        accent={ACCENT}
        accentSoft={ACCENT_SOFT}
        accentBorder={ACCENT_BORDER}
        isPro={isPro}
        onUpgradeClick={() => setUpgradeModalOpen(true)}
      />

      <section className="max-w-310 mx-auto px-[var(--gutter,24px)] py-12">
        {importNotification && (
          <div className="mb-6 p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-between font-mono text-xs">
            <div className="flex items-center gap-2">
              <Sparkles size={16} />
              <span>{importNotification}</span>
            </div>
            <button
              type="button"
              onClick={() => setImportNotification(null)}
              className="p-1 hover:opacity-75 cursor-pointer"
              aria-label="Dismiss notification"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {pendingDraft && (
          <DraftRestoreBanner
            accent={ACCENT}
            savedAt={pendingDraft.savedAt}
            slideCount={pendingDraft.slides.length}
            onRestore={handleRestoreDraft}
            onDiscard={handleDiscardDraft}
          />
        )}

        <GeneratorForm
          accent={ACCENT}
          inputMode={inputMode}
          onModeChange={setInputMode}
          topic={topic}
          onTopicChange={setTopic}
          roughNotes={roughNotes}
          onRoughNotesChange={setRoughNotes}
          slideCount={slideCount}
          onSlideCountChange={setSlideCount}
          loading={loading}
          onGenerate={() => void generate()}
          onStartManual={startManualDeck}
          onSelectStarterDeck={handleSelectStarterDeck}
          voiceProfile={voiceProfile}
          onOpenVoiceModal={() => setVoiceModalOpen(true)}
        />

        {hasSlides && (
          <div ref={studioRef} className="space-y-6">
            {/* Mobile Segmented Switcher (Visible on <lg screens) */}
            <div className="grid grid-cols-2 lg:hidden rounded-xl border border-(--rule) bg-(--bg-2) p-1">
              <button
                type="button"
                onClick={() => setMobileStudioTab("canvas")}
                className={`py-2.5 rounded-lg font-mono text-[11px] uppercase tracking-wider font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  mobileStudioTab === "canvas" ? "text-white" : "text-muted-foreground"
                }`}
                style={{
                  background: mobileStudioTab === "canvas" ? ACCENT : "transparent",
                }}
              >
                <Layers size={13} /> Canvas & Slides
              </button>
              <button
                type="button"
                onClick={() => setMobileStudioTab("inspector")}
                className={`py-2.5 rounded-lg font-mono text-[11px] uppercase tracking-wider font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  mobileStudioTab === "inspector" ? "text-white" : "text-muted-foreground"
                }`}
                style={{
                  background: mobileStudioTab === "inspector" ? ACCENT : "transparent",
                }}
              >
                <Palette size={13} /> Design Inspector
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_390px] xl:grid-cols-[1fr_420px] gap-8 items-start">
              {/* Studio Stage: Export Bar, Canvas Hero, Slide Filmstrip, Editor */}
              <div className={`space-y-6 ${mobileStudioTab === "canvas" ? "block" : "hidden"} lg:block`}>
                <ExportToolbar
                  accent={ACCENT}
                  slideNumber={activeSlideIndex + 1}
                  slideCount={slides.length}
                  exportLoading={exportLoading}
                  onExportPng={() => void handleExportPng()}
                  onExportZip={() => void handleExportZip()}
                  onExportPdf={() => void handleExportPdf()}
                />

                {activeSlide && (
                  <LayoutPicker
                    accent={ACCENT}
                    activeLayout={activeSlide.layout || "default"}
                    onChange={(layout) => updateActiveSlide("layout", layout)}
                  />
                )}

                {activeSlide && (
                  <SlidePreview
                    slide={activeSlide}
                    slideIndex={activeSlideIndex}
                    style={activeStyle}
                    backgroundStyle={backgroundStyle}
                    aspectRatio={aspectRatio}
                    showBranding={showBranding}
                    logoImage={logoImage}
                    logoText={logoText}
                    logoMark={logoMark}
                    topRightTag={topRightTag}
                    creatorName={creatorName}
                    creatorHandle={creatorHandle}
                  />
                )}

                {/* Horizontal Slide Deck Filmstrip */}
                <SlideDeckFilmstrip
                  slides={slides}
                  activeSlideIndex={activeSlideIndex}
                  onSelect={setActiveSlideIndex}
                  onAdd={addSlide}
                  onDuplicate={duplicateSlide}
                  onDelete={deleteSlide}
                  accent={ACCENT}
                  style={activeStyle}
                />

                <SlideNavControls
                  accent={ACCENT}
                  slideCount={slides.length}
                  activeIndex={activeSlideIndex}
                  onSelect={setActiveSlideIndex}
                  onPrev={() => setActiveSlideIndex((prev) => prev - 1)}
                  onNext={() => setActiveSlideIndex((prev) => prev + 1)}
                />

                {activeSlide && (
                  <SlideContentEditor
                    slide={activeSlide}
                    onChange={updateActiveSlide}
                  />
                )}
              </div>

              {/* Studio Inspector: Unified 3-Tab Control Panel */}
              <div className={`space-y-6 lg:sticky lg:top-6 ${mobileStudioTab === "inspector" ? "block" : "hidden"} lg:block`}>
                <StudioInspector
                  accent={ACCENT}
                  aesthetic={aesthetic}
                  onAestheticChange={setAesthetic}
                  aspectRatio={aspectRatio}
                  onAspectRatioChange={setAspectRatio}
                  backgroundStyle={backgroundStyle}
                  onBackgroundStyleChange={setBackgroundStyle}
                  fontTitle={fontTitle}
                  onFontTitleChange={setFontTitle}
                  fontBody={fontBody}
                  onFontBodyChange={setFontBody}
                  titleScale={titleScale}
                  onTitleScaleChange={setTitleScale}
                  bodyScale={bodyScale}
                  onBodyScaleChange={setBodyScale}
                  activeBg={activeStyle.bg}
                  activeText={activeStyle.text}
                  activeAccent={activeStyle.accent}
                  onCustomBgChange={setCustomBg}
                  onCustomTextChange={setCustomText}
                  onCustomAccentChange={setCustomAccent}
                  hasCustomColors={!!(customBg || customText || customAccent)}
                  onResetColors={resetOverrides}
                  showBranding={showBranding}
                  onShowBrandingChange={setShowBranding}
                  logoImage={logoImage}
                  onLogoUpload={uploadLogo}
                  onLogoRemove={removeLogo}
                  logoText={logoText}
                  onLogoTextChange={setLogoText}
                  logoMark={logoMark}
                  onLogoMarkChange={setLogoMark}
                  creatorName={creatorName}
                  onCreatorNameChange={setCreatorName}
                  topRightTag={topRightTag}
                  onTopRightTagChange={setTopRightTag}
                  creatorHandle={creatorHandle}
                  onCreatorHandleChange={setCreatorHandle}
                  presets={presets}
                  onSavePreset={handleSavePreset}
                  onApplyPreset={handleApplyPreset}
                  onDeletePreset={deletePreset}
                />
              </div>
            </div>
          </div>
        )}
      </section>

      <UpgradeModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        isPro={isPro}
        onTogglePro={handleTogglePro}
        accent={ACCENT}
      />

      <VoicePersonaModal
        isOpen={voiceModalOpen}
        onClose={() => setVoiceModalOpen(false)}
        voiceProfile={voiceProfile}
        onSaveVoiceProfile={handleSaveVoiceProfile}
        accent={ACCENT}
      />
    </main>
  );
}
