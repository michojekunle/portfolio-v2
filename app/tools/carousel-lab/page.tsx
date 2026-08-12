"use client";

import { useCallback, useEffect, useState } from "react";
import { TOOL_COLORS } from "@/lib/tool-colors";
import { MOOD_STYLES } from "./lib/constants";
import { exportSlideAsPNG, exportSlidesAsPDF, exportSlidesAsZip } from "./lib/export-slides";
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
} from "./lib/types";
import { useColorOverrides } from "./lib/use-color-overrides";
import { useDesignPresets } from "./lib/use-design-presets";
import { useLogoUpload } from "./lib/use-logo-upload";
import { readDraft, writeDraft, clearDraft } from "./lib/draft-storage";
import { PageHeader } from "./components/PageHeader";
import { GeneratorForm } from "./components/GeneratorForm";
import { BrandingPanel } from "./components/BrandingPanel";
import { CanvasCustomizerPanel } from "./components/CanvasCustomizerPanel";
import { PresetsPanel } from "./components/PresetsPanel";
import { DraftRestoreBanner } from "./components/DraftRestoreBanner";
import { ExportToolbar } from "./components/ExportToolbar";
import { LayoutPicker } from "./components/LayoutPicker";
import { SlidePreview } from "./components/SlidePreview";
import { SlideNavControls } from "./components/SlideNavControls";
import { SlideContentEditor } from "./components/SlideContentEditor";
import { SlideStackPanel } from "./components/SlideStackPanel";

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
  const activeStyle: ActiveStyle = {
    bg: customBg || activeMoodStyle.bg,
    text: customText || activeMoodStyle.text,
    accent: customAccent || activeMoodStyle.accent,
    subtext: activeMoodStyle.subtext,
    border: activeMoodStyle.border,
    borderWidth: activeMoodStyle.borderWidth,
    borderRadius: activeMoodStyle.borderRadius,
    fontTitle: fontTitle !== "default" ? fontTitle : activeMoodStyle.fontTitle,
    fontBody: fontBody !== "default" ? fontBody : activeMoodStyle.fontBody,
    titleScale,
    bodyScale,
    italic: activeMoodStyle.isItalicTitle,
    divider: activeMoodStyle.showDivider,
    shadow: activeMoodStyle.shadow,
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
          theme:
            aesthetic === "Premium Editorial (Zamir)"
              ? "Dark"
              : aesthetic === "Maximalist" || aesthetic === "Brutalist"
                ? "Bold"
                : aesthetic === "Light Editorial (Zamir Light)"
                  ? "Earthy"
                  : "Minimal",
          mode: inputMode === "refine" ? "refine" : "topic",
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
  }, [topic, roughNotes, inputMode, slideCount, aesthetic, hasSlides, pendingDraft]);

  const startManualDeck = (): void => {
    if (hasSlides && !window.confirm("Starting a manual deck replaces your current slides and can't be undone. Continue?")) return;
    if (pendingDraft) {
      clearDraft();
      setPendingDraft(null);
    }
    setSlides(MANUAL_DECK);
    setActiveSlideIndex(0);
  };

  const updateActiveSlide = (field: keyof Slide, value: string): void => {
    setSlides((prev) => prev.map((s, idx) => (idx === activeSlideIndex ? { ...s, [field]: value } : s)));
  };

  const addSlide = (): void => {
    setSlides((prev) => [
      ...prev,
      { title: "New Key Takeaway", content: "Describe this main concept or point in a short, scroll-stopping sentence.", emoji: "💡", layout: "default" },
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
      await exportSlideAsPNG(activeSlide, activeSlideIndex, aspectRatio, { style: activeStyle, brand: brandConfig, backgroundStyle, aspectRatio });
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
      await exportSlidesAsZip(slides, aspectRatio, { style: activeStyle, brand: brandConfig, backgroundStyle, aspectRatio }, topic.slice(0, 20));
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
      await exportSlidesAsPDF(slides, aspectRatio, { style: activeStyle, brand: brandConfig, backgroundStyle, aspectRatio }, topic.slice(0, 16));
    } catch (err) {
      console.error("[carousel-lab] PDF export failed:", err);
    } finally {
      setExportLoading(null);
    }
  };

  return (
    <main id="main-content" tabIndex={-1} className="outline-none min-h-screen" style={{ background: "var(--bg)" }}>
      <PageHeader accent={ACCENT} accentSoft={ACCENT_SOFT} accentBorder={ACCENT_BORDER} />

      <section className="max-w-310 mx-auto px-[var(--gutter,24px)] py-12">
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
        />

        {hasSlides && (
          <div className="grid grid-cols-[330px_1fr_260px] max-[1120px]:grid-cols-[290px_1fr] max-[800px]:grid-cols-1 gap-8">
            {/* Deliberately not sticky and no inner max-height/overflow.
                Three stacked panels (Branding, Canvas Customizer, Presets)
                routinely run taller than the viewport now. A capped-height
                sticky sidebar trapped scrolling in its own cramped inner
                scrollbar; an uncapped sticky one stayed pinned near the top
                while still taller than the viewport, visually overlapping
                the SlideStackPanel row wrapped beneath it at narrower widths
                (verified: sidebar rect spanned y=38 to y=1419 in a 900px-tall
                viewport). A plain static column avoids both — it scrolls
                with the page like everything else, just without the
                "follows you" convenience, which isn't worth either bug. */}
            <div className="space-y-6 max-[800px]:order-2">
              <BrandingPanel
                accent={ACCENT}
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
              />

              <CanvasCustomizerPanel
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
              />

              <PresetsPanel accent={ACCENT} presets={presets} onSave={handleSavePreset} onApply={handleApplyPreset} onDelete={deletePreset} />
            </div>

            <div className="space-y-6">
              <ExportToolbar
                accent={ACCENT}
                slideNumber={activeSlideIndex + 1}
                slideCount={slides.length}
                exportLoading={exportLoading}
                onExportPng={() => void handleExportPng()}
                onExportZip={() => void handleExportZip()}
                onExportPdf={() => void handleExportPdf()}
              />

              {activeSlide && <LayoutPicker accent={ACCENT} activeLayout={activeSlide.layout || "default"} onChange={(layout) => updateActiveSlide("layout", layout)} />}

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

              <SlideNavControls
                accent={ACCENT}
                slideCount={slides.length}
                activeIndex={activeSlideIndex}
                onSelect={setActiveSlideIndex}
                onPrev={() => setActiveSlideIndex((prev) => prev - 1)}
                onNext={() => setActiveSlideIndex((prev) => prev + 1)}
              />

              {activeSlide && <SlideContentEditor slide={activeSlide} onChange={updateActiveSlide} />}
            </div>

            <SlideStackPanel
              accent={ACCENT}
              slides={slides}
              activeIndex={activeSlideIndex}
              onSelect={setActiveSlideIndex}
              onAdd={addSlide}
              onDuplicate={duplicateSlide}
              onDelete={deleteSlide}
            />
          </div>
        )}
      </section>
    </main>
  );
}
