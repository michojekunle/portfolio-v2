// impeccable-disable design-system-font-size, design-system-color -- Live slide canvas preview
import { Quote } from "lucide-react";
import { MoSignatureInline, AmdSignatureInline } from "@/lib/brand-mark";
import { wrapperBackgroundFor } from "../lib/color-utils";
import type { ActiveStyle, AspectRatio, BackgroundStyle, LogoMark, Slide } from "../lib/types";

interface Props {
  slide: Slide;
  slideIndex: number;
  style: ActiveStyle;
  backgroundStyle: BackgroundStyle;
  aspectRatio: AspectRatio;
  showBranding: boolean;
  logoImage: string | null;
  logoText: string;
  logoMark: LogoMark;
  topRightTag: string;
  creatorName: string;
  creatorHandle: string;
  isPro?: boolean;
  onUpgradeClick?: () => void;
}

function LogoBadge({
  style,
  logoImage,
  logoText,
  logoMark,
  creatorName,
}: {
  style: ActiveStyle;
  logoImage: string | null;
  logoText: string;
  logoMark: LogoMark;
  creatorName: string;
}): React.ReactElement {
  const badgeBg = style.badgeBg ?? style.accent + "20";
  const badgeColor = style.badgeColor ?? style.accent;
  return (
    <div
      className="w-7 h-7 rounded-lg flex items-center justify-center text-[12px] font-bold overflow-hidden shrink-0"
      style={{ background: badgeBg, color: badgeColor }}
    >
      {logoImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logoImage} alt="" className="w-full h-full object-cover" />
      ) : logoMark === "mo" ? (
        <MoSignatureInline height={16} color={badgeColor} />
      ) : logoMark === "amd" ? (
        <AmdSignatureInline height={16} color={badgeColor} accent={badgeColor} />
      ) : (
        (logoText.trim()[0] || creatorName.trim()[0] || "M").toUpperCase()
      )}
    </div>
  );
}

function SlideBody({
  slide,
  slideIndex,
  style,
  creatorName,
  creatorHandle,
  logoImage,
  logoMark,
}: {
  slide: Slide;
  slideIndex: number;
  style: ActiveStyle;
  creatorName: string;
  creatorHandle: string;
  logoImage: string | null;
  logoMark: LogoMark;
}): React.ReactElement {
  const layout = slide.layout || "default";

  if (layout === "hook") {
    return (
      <div>
        <h3
          className="font-bold leading-[1.15] tracking-[-0.03em] mb-3 m-0"
          style={{
            fontFamily: style.fontTitle,
            fontSize: `calc(clamp(22px,3.5vw,30px) * ${style.titleScale})`,
            color: style.text,
            fontStyle: style.italic ? "italic" : "normal",
          }}
        >
          {slide.title}
        </h3>
        <p className="leading-[1.6] m-0 font-sans" style={{ fontFamily: style.fontBody, fontSize: `calc(14px * ${style.bodyScale})`, color: style.subtext }}>
          {slide.content}
        </p>
      </div>
    );
  }

  if (layout === "split") {
    return (
      <div className="grid grid-cols-2 h-full items-center gap-3 -mx-6 sm:-mx-9 my-0 px-6 sm:px-9 bg-[color-mix(in_oklab,var(--bg-2)_20%,transparent)]">
        <div className="h-full flex items-center border-r pr-3" style={{ borderColor: style.border }}>
          <h3
            className="font-bold leading-[1.2] tracking-[-0.02em] m-0"
            style={{ fontFamily: style.fontTitle, fontSize: `calc(clamp(18px,2.5vw,22px) * ${style.titleScale})`, color: style.text }}
          >
            {slide.title}
          </h3>
        </div>
        <div className="pl-1">
          <p className="leading-normal m-0 font-sans" style={{ fontFamily: style.fontBody, fontSize: `calc(12px * ${style.bodyScale})`, color: style.text }}>
            {slide.content}
          </p>
        </div>
      </div>
    );
  }

  if (layout === "quote") {
    return (
      <div className="relative space-y-3">
        <Quote className="absolute -top-6 -left-4 opacity-10" size={56} style={{ color: style.accent }} />
        <p
          className="leading-[1.6] italic m-0 font-medium pl-3"
          style={{ fontFamily: style.fontTitle, fontSize: `calc(16px * ${style.titleScale})`, color: style.text }}
        >
          &ldquo;{slide.content}&rdquo;
        </p>
        {slide.title && (
          <div className="pt-1">
            <span
              className="inline-block px-3.5 py-1.5 rounded-full border text-[10px] font-mono font-bold tracking-widest uppercase"
              style={{ borderColor: style.accent + "40", color: style.accent }}
            >
              {slide.title}
            </span>
          </div>
        )}
      </div>
    );
  }

  if (layout === "metrics") {
    const metricDisplay = slide.emoji?.trim() ? slide.emoji : `0${slideIndex + 1}`;
    return (
      <div className="space-y-2">
        <div className="font-mono text-[56px] font-bold leading-none tracking-tight" style={{ color: style.accent }}>
          {metricDisplay}
        </div>
        <h3
          className="font-bold leading-[1.2] tracking-[-0.02em] m-0"
          style={{ fontFamily: style.fontTitle, fontSize: `calc(20px * ${style.titleScale})`, color: style.text }}
        >
          {slide.title}
        </h3>
        <p className="leading-normal m-0 font-sans" style={{ fontFamily: style.fontBody, fontSize: `calc(13px * ${style.bodyScale})`, color: style.subtext }}>
          {slide.content}
        </p>
      </div>
    );
  }

  if (layout === "cta") {
    return (
      <div className="text-center space-y-5 p-5 rounded-2xl" style={{ background: style.accent + "08" }}>
        <div
          className="w-15 h-15 rounded-full mx-auto flex items-center justify-center text-[18px] font-bold shadow-sm overflow-hidden"
          style={{ background: style.accent, color: style.bg }}
        >
          {logoImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoImage} alt="" className="w-full h-full object-cover" />
          ) : logoMark === "mo" ? (
            <MoSignatureInline height={28} color={style.bg} />
          ) : logoMark === "amd" ? (
            <AmdSignatureInline height={28} color={style.bg} accent={style.bg} />
          ) : (
            creatorName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)
          )}
        </div>
        <div>
          <h3
            className="font-bold m-0 mb-1"
            style={{ fontFamily: style.fontTitle, fontSize: `calc(20px * ${style.titleScale})`, color: style.text }}
          >
            {slide.title || "Let's connect!"}
          </h3>
          <p className="leading-normal m-0" style={{ fontFamily: style.fontBody, fontSize: `calc(12px * ${style.bodyScale})`, color: style.subtext }}>
            {slide.content || "Follow for daily guides and resources."}
          </p>
        </div>
        <div>
          <span
            className="inline-block px-6 py-2.5 rounded-full text-[13px] font-bold font-mono tracking-wider shadow-sm uppercase"
            style={{ background: style.accent, color: style.bg }}
          >
            {creatorHandle.toLowerCase()}
          </span>
        </div>
      </div>
    );
  }

  // default
  return (
    <div>
      <h3
        className="font-bold leading-[1.2] tracking-[-0.03em] mb-2.5 m-0"
        style={{ fontFamily: style.fontTitle, fontSize: `calc(24px * ${style.titleScale})`, color: style.text }}
      >
        {slide.title}
      </h3>
      <p className="leading-[1.65] m-0 font-sans" style={{ fontFamily: style.fontBody, fontSize: `calc(14px * ${style.bodyScale})`, color: style.subtext }}>
        {slide.content}
      </p>
      {slide.emoji && <div className="text-[40px] mt-4">{slide.emoji}</div>}
    </div>
  );
}

export function SlidePreview({
  slide,
  slideIndex,
  style,
  backgroundStyle,
  aspectRatio,
  showBranding,
  logoImage,
  logoText,
  logoMark,
  topRightTag,
  creatorName,
  creatorHandle,
  isPro = false,
  onUpgradeClick,
}: Props): React.ReactElement {
  const layout = slide.layout || "default";

  // The wrapper's tone is derived from the card's own mood color (same
  // function the canvas exporter uses) — not the site's dark/light theme.
  // Those are two unrelated color sources; tying the preview to the site
  // theme meant the mesh background could never actually match what gets
  // exported, since the export has no concept of the site's toggle state.
  const wrapperBg = backgroundStyle === "mesh" ? wrapperBackgroundFor(style.bg) : undefined;

  return (
    <div
      className="flex items-center justify-center p-3 sm:p-6 rounded-3xl border border-(--rule) min-h-[380px] sm:min-h-[500px] relative overflow-hidden"
      style={wrapperBg ? { background: wrapperBg } : undefined}
    >
      {backgroundStyle === "mesh" && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-45">
          <div className="absolute -top-[10%] -left-[10%] w-[55%] h-[55%] rounded-full blur-20" style={{ background: style.accent }} />
          <div className="absolute -bottom-[10%] -right-[10%] w-[55%] h-[55%] rounded-full blur-20" style={{ background: style.text }} />
        </div>
      )}

      <div
        className="shadow-2xl overflow-hidden flex flex-col justify-between p-6 sm:p-9 relative select-none transition-all duration-300 border w-full"
        style={{
          background: backgroundStyle === "gradient" ? `linear-gradient(135deg, ${style.bg} 0%, ${style.accent}18 100%)` : style.bg,
          borderColor: style.border,
          borderWidth: `${style.borderWidth}px`,
          borderRadius: `${style.borderRadius}px`,
          maxWidth: aspectRatio === "square" ? "420px" : "360px",
          aspectRatio: aspectRatio === "square" ? "1 / 1" : "4 / 5",
          height: "auto",
          minHeight: aspectRatio === "square" ? "300px" : "380px",
          boxShadow: style.shadow,
        }}
      >
        {showBranding && layout !== "cta" && (
          <div className="flex items-center justify-between border-b pb-2.5" style={{ borderColor: style.border }}>
            <div className="flex items-center gap-2">
              <LogoBadge style={style} logoImage={logoImage} logoText={logoText} logoMark={logoMark} creatorName={creatorName} />
              {logoText.trim() && (
                <div className="text-[12px] font-bold tracking-widest uppercase" style={{ color: style.accent, fontFamily: style.fontSans }}>
                  {logoText}
                </div>
              )}
            </div>
            <div className="font-mono text-[9px] tracking-wider" style={{ color: style.text + "80", fontFamily: style.fontMono }}>
              {topRightTag}
            </div>
          </div>
        )}

        <div className="flex-1 flex flex-col justify-center py-2.5">
          <SlideBody
            slide={slide}
            slideIndex={slideIndex}
            style={style}
            creatorName={creatorName}
            creatorHandle={creatorHandle}
            logoImage={logoImage}
            logoMark={logoMark}
          />
        </div>

        {style.divider && layout !== "split" && <div className="h-0.25 w-full" style={{ background: style.border }} />}

        <div className="flex items-center justify-between pt-1.5">
          <span className="font-mono text-[10px] tracking-wider font-semibold" style={{ color: style.text + "80", fontFamily: style.fontMono }}>
            {creatorName}
          </span>
          <span className="font-mono text-[11px] font-bold" style={{ color: style.text, fontFamily: style.fontMono }}>
            {creatorHandle.toLowerCase()}
          </span>
        </div>
      </div>
    </div>
  );
}
