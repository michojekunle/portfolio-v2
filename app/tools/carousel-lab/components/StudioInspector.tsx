"use client";

import React, { useState } from "react";
import { Palette, Shield, Bookmark, Sliders } from "lucide-react";
import { CanvasCustomizerPanel } from "./CanvasCustomizerPanel";
import { BrandingPanel } from "./BrandingPanel";
import { PresetsPanel } from "./PresetsPanel";
import type {
  AestheticMood,
  AspectRatio,
  BackgroundStyle,
  DesignPreset,
  LogoMark,
} from "../lib/types";

export type InspectorTab = "templates" | "brand" | "presets";

interface Props {
  accent: string;
  activeTab?: InspectorTab;
  onTabChange?: (tab: InspectorTab) => void;

  // Customizer props
  aesthetic: AestheticMood;
  onAestheticChange: (mood: AestheticMood) => void;
  aspectRatio: AspectRatio;
  onAspectRatioChange: (value: AspectRatio) => void;
  backgroundStyle: BackgroundStyle;
  onBackgroundStyleChange: (value: BackgroundStyle) => void;
  fontTitle: string;
  onFontTitleChange: (value: string) => void;
  fontBody: string;
  onFontBodyChange: (value: string) => void;
  titleScale: number;
  onTitleScaleChange: (value: number) => void;
  bodyScale: number;
  onBodyScaleChange: (value: number) => void;
  activeBg: string;
  activeText: string;
  activeAccent: string;
  onCustomBgChange: (value: string) => void;
  onCustomTextChange: (value: string) => void;
  onCustomAccentChange: (value: string) => void;
  hasCustomColors: boolean;
  onResetColors: () => void;

  // Branding props
  showBranding: boolean;
  onShowBrandingChange: (value: boolean) => void;
  logoImage: string | null;
  onLogoUpload: (file: File) => void;
  onLogoRemove: () => void;
  logoText: string;
  onLogoTextChange: (value: string) => void;
  logoMark: LogoMark;
  onLogoMarkChange: (value: LogoMark) => void;
  creatorName: string;
  onCreatorNameChange: (value: string) => void;
  topRightTag: string;
  onTopRightTagChange: (value: string) => void;
  creatorHandle: string;
  onCreatorHandleChange: (value: string) => void;

  // Presets props
  presets: DesignPreset[];
  onSavePreset: (name: string) => void;
  onApplyPreset: (preset: DesignPreset) => void;
  onDeletePreset: (id: string) => void;
}

export function StudioInspector({
  accent,
  activeTab: controlledTab,
  onTabChange,
  aesthetic,
  onAestheticChange,
  aspectRatio,
  onAspectRatioChange,
  backgroundStyle,
  onBackgroundStyleChange,
  fontTitle,
  onFontTitleChange,
  fontBody,
  onFontBodyChange,
  titleScale,
  onTitleScaleChange,
  bodyScale,
  onBodyScaleChange,
  activeBg,
  activeText,
  activeAccent,
  onCustomBgChange,
  onCustomTextChange,
  onCustomAccentChange,
  hasCustomColors,
  onResetColors,
  showBranding,
  onShowBrandingChange,
  logoImage,
  onLogoUpload,
  onLogoRemove,
  logoText,
  onLogoTextChange,
  logoMark,
  onLogoMarkChange,
  creatorName,
  onCreatorNameChange,
  topRightTag,
  onTopRightTagChange,
  creatorHandle,
  onCreatorHandleChange,
  presets,
  onSavePreset,
  onApplyPreset,
  onDeletePreset,
}: Props): React.ReactElement {
  const [internalTab, setInternalTab] = useState<InspectorTab>("templates");
  const tab = controlledTab ?? internalTab;

  const handleTabClick = (nextTab: InspectorTab): void => {
    if (onTabChange) onTabChange(nextTab);
    else setInternalTab(nextTab);
  };

  return (
    <div className="rounded-2xl border border-(--rule) bg-(--bg-2) shadow-xs overflow-hidden">
      {/* Tab Switcher Header */}
      <div className="grid grid-cols-3 border-b border-(--rule) bg-(--bg)">
        <button
          type="button"
          onClick={() => handleTabClick("templates")}
          className="py-3 font-mono text-[10px] uppercase tracking-wider font-semibold border-b-2 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          style={{
            borderColor: tab === "templates" ? accent : "transparent",
            color: tab === "templates" ? accent : "var(--ink-3)",
            background: tab === "templates" ? `${accent}0a` : "transparent",
          }}
        >
          <Palette size={12} /> Templates
        </button>

        <button
          type="button"
          onClick={() => handleTabClick("brand")}
          className="py-3 font-mono text-[10px] uppercase tracking-wider font-semibold border-b-2 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          style={{
            borderColor: tab === "brand" ? accent : "transparent",
            color: tab === "brand" ? accent : "var(--ink-3)",
            background: tab === "brand" ? `${accent}0a` : "transparent",
          }}
        >
          <Shield size={12} /> Identity
        </button>

        <button
          type="button"
          onClick={() => handleTabClick("presets")}
          className="py-3 font-mono text-[10px] uppercase tracking-wider font-semibold border-b-2 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          style={{
            borderColor: tab === "presets" ? accent : "transparent",
            color: tab === "presets" ? accent : "var(--ink-3)",
            background: tab === "presets" ? `${accent}0a` : "transparent",
          }}
        >
          <Bookmark size={12} /> Presets
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-0">
        {tab === "templates" && (
          <CanvasCustomizerPanel
            accent={accent}
            aesthetic={aesthetic}
            onAestheticChange={onAestheticChange}
            aspectRatio={aspectRatio}
            onAspectRatioChange={onAspectRatioChange}
            backgroundStyle={backgroundStyle}
            onBackgroundStyleChange={onBackgroundStyleChange}
            fontTitle={fontTitle}
            onFontTitleChange={onFontTitleChange}
            fontBody={fontBody}
            onFontBodyChange={onFontBodyChange}
            titleScale={titleScale}
            onTitleScaleChange={onTitleScaleChange}
            bodyScale={bodyScale}
            onBodyScaleChange={onBodyScaleChange}
            activeBg={activeBg}
            activeText={activeText}
            activeAccent={activeAccent}
            onCustomBgChange={onCustomBgChange}
            onCustomTextChange={onCustomTextChange}
            onCustomAccentChange={onCustomAccentChange}
            hasCustomColors={hasCustomColors}
            onResetColors={onResetColors}
          />
        )}

        {tab === "brand" && (
          <BrandingPanel
            accent={accent}
            showBranding={showBranding}
            onShowBrandingChange={onShowBrandingChange}
            logoImage={logoImage}
            onLogoUpload={onLogoUpload}
            onLogoRemove={onLogoRemove}
            logoText={logoText}
            onLogoTextChange={onLogoTextChange}
            logoMark={logoMark}
            onLogoMarkChange={onLogoMarkChange}
            creatorName={creatorName}
            onCreatorNameChange={onCreatorNameChange}
            topRightTag={topRightTag}
            onTopRightTagChange={onTopRightTagChange}
            creatorHandle={creatorHandle}
            onCreatorHandleChange={onCreatorHandleChange}
          />
        )}

        {tab === "presets" && (
          <div className="p-6 space-y-5">
            <PresetsPanel
              accent={accent}
              presets={presets}
              onSave={onSavePreset}
              onApply={onApplyPreset}
              onDelete={onDeletePreset}
            />
          </div>
        )}
      </div>
    </div>
  );
}
