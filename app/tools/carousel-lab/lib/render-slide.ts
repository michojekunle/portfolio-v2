import type { ActiveStyle, AspectRatio, BackgroundStyle, BrandConfig, Slide } from "./types";
import { FONT_MONO_STACK, FONT_SANS_STACK } from "./constants";
import { wrapperBackgroundFor } from "./color-utils";

export interface RenderConfig {
  style: ActiveStyle;
  brand: BrandConfig;
  backgroundStyle: BackgroundStyle;
  aspectRatio: AspectRatio;
}

// Text Wrapping Helper — greedy word-wrap against a max pixel width measured
// in the font that's about to be drawn.
function getWrappedLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, fontStr: string): string[] {
  ctx.font = fontStr;
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (let n = 0; n < words.length; n++) {
    const testLine = currentLine + words[n] + " ";
    const testWidth = ctx.measureText(testLine).width;
    if (testWidth > maxWidth && n > 0) {
      lines.push(currentLine.trim());
      currentLine = words[n] + " ";
    } else {
      currentLine = testLine;
    }
  }
  lines.push(currentLine.trim());
  return lines;
}

// `font` is required (not read from ambient ctx.font state) — a version of
// this that relied on whatever font the last getWrappedLines() call happened
// to leave set would draw titles in whatever body font was last measured,
// since title/body wrapping calls interleave. Always pass the font this
// particular call actually wants.
function drawLines(
  ctx: CanvasRenderingContext2D,
  lines: string[],
  x: number,
  startY: number,
  lineHeight: number,
  color: string,
  font: string,
  align: CanvasTextAlign = "left"
): number {
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  let y = startY;
  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], x, y);
    y += lineHeight;
  }
  ctx.textAlign = "left"; // reset
  return y;
}

// Solid-color circle, heavily blurred, at 30% opacity — matches the live
// preview's ambient glow (a container at opacity-30 wrapping two blurred,
// fully-opaque circles). A radial gradient fading from the center outward
// reads as much weaker/muddier than a flat color blurred only at its edge.
function drawGlowBlob(ctx: CanvasRenderingContext2D, cx: number, cy: number, diameter: number, color: string): void {
  ctx.save();
  ctx.filter = `blur(${diameter * 0.22}px)`;
  ctx.globalAlpha = 0.3;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(cx, cy, diameter / 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/**
 * Renders one slide onto a canvas at export resolution. Mirrors the live DOM
 * preview pixel-for-pixel where it matters (fonts, corner radius, mesh
 * glow) since the two are drawn through completely independent code paths —
 * see the layout branches below for the per-template positioning math.
 */
export function drawSlideToCanvas(
  ctx: CanvasRenderingContext2D,
  slide: Slide,
  index: number,
  canvasWidth: number,
  canvasHeight: number,
  config: RenderConfig
): void {
  const { style, brand, backgroundStyle, aspectRatio } = config;
  const layout = slide.layout || "default";

  // The live preview renders the card as a smaller rounded box floating
  // inside a larger "device mockup" wrapper, with blurred mesh-glow circles
  // visible in the wrapper around the card's edges — the card itself is
  // always a flat/solid surface, never the glow. Reproduce that here: paint
  // the wrapper (+ glow) across the full canvas first, then draw the actual
  // card inset within it and translate into the card's own coordinate space
  // so all the card-content math below operates in local (0,0)-(width,height)
  // coordinates regardless of the bleed.
  const bleed = backgroundStyle === "mesh" ? 0.055 : 0;
  const cardX = canvasWidth * bleed;
  const cardY = canvasHeight * bleed;
  const width = canvasWidth - cardX * 2;
  const height = canvasHeight - cardY * 2;

  const scale = width / (aspectRatio === "square" ? 420 : 360);
  const cardRadius = style.borderRadius * scale;

  if (bleed > 0) {
    ctx.fillStyle = wrapperBackgroundFor(style.bg);
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    drawGlowBlob(ctx, canvasWidth * 0.15, canvasHeight * 0.15, canvasWidth * 0.5, style.accent);
    drawGlowBlob(ctx, canvasWidth * 0.85, canvasHeight * 0.85, canvasWidth * 0.5, style.text);

    // Card drop shadow + base fill, cast from outside the upcoming clip —
    // clipped shapes can't cast shadows, so this has to happen first.
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.45)";
    ctx.shadowBlur = canvasWidth * 0.025;
    ctx.shadowOffsetY = canvasHeight * 0.008;
    ctx.fillStyle = style.bg;
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, width, height, cardRadius);
    ctx.fill();
    ctx.restore();
  }

  ctx.save();
  ctx.translate(cardX, cardY);

  const margin = 36 * scale;
  const contentWidth = width - margin * 2;

  // Clip everything to the card's rounded corners — the DOM preview gets
  // this for free from CSS border-radius + overflow-hidden; canvas needs an
  // explicit clip path or the background fill spills into square corners
  // while the border (drawn further down) looks rounded.
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(0, 0, width, height, cardRadius);
  ctx.clip();

  // 1. Draw Background — the card is always a flat surface (mesh glow lives
  // in the wrapper, painted above, when bleed > 0); only "gradient" changes
  // what's drawn directly on the card itself.
  if (backgroundStyle === "gradient") {
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, style.bg);
    grad.addColorStop(1, style.accent + "1a");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  } else {
    ctx.fillStyle = style.bg;
    ctx.fillRect(0, 0, width, height);
  }

  const wrap = (text: string, maxWidth: number, font: string): string[] => getWrappedLines(ctx, text, maxWidth, font);
  const lines = (
    ls: string[],
    x: number,
    startY: number,
    lineHeight: number,
    color: string,
    font: string,
    align: CanvasTextAlign = "left"
  ): number => drawLines(ctx, ls, x, startY, lineHeight, color, font, align);

  // Calculate Y Boundaries for Center Container
  const logoSize = 28 * scale;
  const headerBottom = brand.showBranding && layout !== "cta" ? margin + logoSize + 10 * scale : margin;

  const footerHeight = style.divider && layout !== "split" ? 20 * scale + 30 * scale : 20 * scale;
  const footerTop = height - margin - footerHeight;

  const centerHeight = footerTop - headerBottom;
  const centerY = headerBottom + centerHeight / 2;

  // 2. Creator Branding Header (Top)
  if (brand.showBranding && layout !== "cta") {
    // Logo icon badge background
    ctx.fillStyle = style.accent + "1a";
    ctx.beginPath();
    ctx.roundRect(margin, margin, logoSize, logoSize, 8 * scale);
    ctx.fill();

    // Uploaded logo image, clipped to the badge's rounded square; falls back
    // to a monogram (never an emoji glyph — some environments can't fall
    // back to a color-emoji font mid-canvas-text-run and render tofu
    // instead) matching the preview's default badge closely enough.
    if (brand.logoImage) {
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(margin, margin, logoSize, logoSize, 8 * scale);
      ctx.clip();
      ctx.drawImage(brand.logoImage, margin, margin, logoSize, logoSize);
      ctx.restore();
    } else {
      ctx.fillStyle = style.accent;
      ctx.font = "bold " + Math.round(12 * scale) + "px " + FONT_SANS_STACK;
      ctx.textAlign = "center";
      const monogram = (brand.logoText.trim()[0] || brand.creatorName.trim()[0] || "M").toUpperCase();
      ctx.fillText(monogram, margin + logoSize / 2, margin + logoSize / 2 + 4 * scale);
      ctx.textAlign = "left"; // reset
    }

    // Logo brand text
    ctx.fillStyle = style.accent;
    ctx.font = "bold " + Math.round(12 * scale) + "px " + FONT_SANS_STACK;
    const spacedLogo = brand.logoText.split("").join(" ");
    ctx.fillText(spacedLogo, margin + logoSize + 8 * scale, margin + logoSize / 2 + 4 * scale);

    // Top right tag
    ctx.fillStyle = style.text + "80";
    ctx.font = "bold " + Math.round(9 * scale) + "px " + FONT_MONO_STACK;
    ctx.textAlign = "right";
    ctx.fillText(brand.topRightTag, width - margin, margin + logoSize / 2 + 4 * scale);
    ctx.textAlign = "left"; // reset

    // Header bottom border
    ctx.strokeStyle = style.border;
    ctx.lineWidth = 1 * scale;
    ctx.beginPath();
    ctx.moveTo(margin, margin + logoSize + 10 * scale);
    ctx.lineTo(width - margin, margin + logoSize + 10 * scale);
    ctx.stroke();
  }

  // 3. Draw Layout Content (Vertically Centered)
  if (layout === "hook") {
    const titleFont = `${style.italic ? "italic " : ""}bold ${Math.round(28 * scale)}px ${style.fontTitle}`;
    const titleLineHeight = 34 * scale;
    const bodyFont = `${Math.round(14 * scale)}px ${style.fontBody}`;
    const bodyLineHeight = 22 * scale;
    const spacing = 16 * scale;

    const titleLines = wrap(slide.title, contentWidth, titleFont);
    const contentLines = wrap(slide.content, contentWidth, bodyFont);

    const titleH = titleLines.length * titleLineHeight;
    const bodyH = contentLines.length * bodyLineHeight;
    const totalH = titleH + spacing + bodyH;
    const startY = centerY - totalH / 2;

    lines(titleLines, margin, startY + titleLineHeight - 8 * scale, titleLineHeight, style.text, titleFont);
    lines(contentLines, margin, startY + titleH + spacing + bodyLineHeight - 6 * scale, bodyLineHeight, style.subtext, bodyFont);
  } else if (layout === "split") {
    // Split layout container background
    ctx.fillStyle = style.accent + "08";
    ctx.fillRect(margin - 12 * scale, headerBottom + 12 * scale, width / 2 - margin, centerHeight - 24 * scale);

    // Left split (Title)
    const leftWidth = width / 2 - margin - 20 * scale;
    const titleFont = `bold ${Math.round(20 * scale)}px ${style.fontTitle}`;
    const titleLineHeight = 26 * scale;
    const titleLines = wrap(slide.title, leftWidth, titleFont);
    const titleH = titleLines.length * titleLineHeight;
    const leftStartY = centerY - titleH / 2;
    lines(titleLines, margin, leftStartY + titleLineHeight - 6 * scale, titleLineHeight, style.text, titleFont);

    // Right split (Content)
    const rightWidth = width / 2 - margin - 20 * scale;
    const bodyFont = `${Math.round(13 * scale)}px ${style.fontBody}`;
    const bodyLineHeight = 19 * scale;
    const contentLines = wrap(slide.content, rightWidth, bodyFont);
    const contentH = contentLines.length * bodyLineHeight;
    const rightStartY = centerY - contentH / 2;
    lines(contentLines, width / 2 + 10 * scale, rightStartY + bodyLineHeight - 4 * scale, bodyLineHeight, style.text, bodyFont);
  } else if (layout === "quote") {
    // Big background quote mark
    ctx.fillStyle = style.accent + "1a";
    ctx.font = `italic bold ${Math.round(72 * scale)}px Georgia, serif`;
    ctx.fillText("“", margin, centerY - 60 * scale);

    const bodyFont = `italic 500 ${Math.round(16 * scale)}px ${style.fontTitle}`;
    const bodyLineHeight = 26 * scale;
    const contentLines = wrap(slide.content, contentWidth - 20 * scale, bodyFont);
    const contentH = contentLines.length * bodyLineHeight;

    const badgeHeight = 28 * scale;
    const spacing = 16 * scale;
    const totalH = contentH + (slide.title ? spacing + badgeHeight : 0);
    const startY = centerY - totalH / 2;

    lines(contentLines, margin + 12 * scale, startY + bodyLineHeight - 6 * scale, bodyLineHeight, style.text, bodyFont);

    if (slide.title) {
      const badgeY = startY + contentH + spacing;
      const badgeText = slide.title.toUpperCase();
      const badgeFont = `bold ${Math.round(10 * scale)}px ${FONT_MONO_STACK}`;
      ctx.font = badgeFont;
      const textW = ctx.measureText(badgeText).width;
      const badgeW = textW + 28 * scale;

      ctx.strokeStyle = style.accent + "40";
      ctx.lineWidth = 1.5 * scale;
      ctx.beginPath();
      ctx.roundRect(margin + 12 * scale, badgeY, badgeW, badgeHeight, badgeHeight / 2);
      ctx.stroke();

      ctx.fillStyle = style.accent;
      ctx.textAlign = "center";
      ctx.fillText(badgeText, margin + 12 * scale + badgeW / 2, badgeY + badgeHeight / 2 + 4 * scale);
      ctx.textAlign = "left"; // reset
    }
  } else if (layout === "metrics") {
    const numFont = `bold ${Math.round(56 * scale)}px ${FONT_MONO_STACK}`;
    const numLineHeight = 56 * scale;
    const titleFont = `bold ${Math.round(20 * scale)}px ${style.fontTitle}`;
    const titleLineHeight = 26 * scale;
    const bodyFont = `${Math.round(13 * scale)}px ${style.fontBody}`;
    const bodyLineHeight = 19 * scale;
    const spacing = 12 * scale;

    const titleLines = wrap(slide.title, contentWidth, titleFont);
    const contentLines = wrap(slide.content, contentWidth, bodyFont);

    const titleH = titleLines.length * titleLineHeight;
    const bodyH = contentLines.length * bodyLineHeight;
    const totalH = numLineHeight + spacing + titleH + spacing + bodyH;
    const startY = centerY - totalH / 2;

    ctx.fillStyle = style.accent;
    ctx.font = numFont;
    ctx.fillText(`0${index + 1}`, margin, startY + numLineHeight - 8 * scale);

    lines(titleLines, margin, startY + numLineHeight + spacing + titleLineHeight - 6 * scale, titleLineHeight, style.text, titleFont);
    lines(
      contentLines,
      margin,
      startY + numLineHeight + spacing + titleH + spacing + bodyLineHeight - 4 * scale,
      bodyLineHeight,
      style.subtext,
      bodyFont
    );
  } else if (layout === "cta") {
    // Background card
    const cardWidth = contentWidth;
    const cardHeight = centerHeight - 20 * scale;
    const ctaCardX = margin;
    const ctaCardY = headerBottom + 10 * scale;

    ctx.fillStyle = style.accent + "08";
    ctx.beginPath();
    ctx.roundRect(ctaCardX, ctaCardY, cardWidth, cardHeight, 24 * scale);
    ctx.fill();

    const avatarRadius = 30 * scale;
    const titleFont = `bold ${Math.round(20 * scale)}px ${style.fontTitle}`;
    const bodyFont = `${Math.round(12 * scale)}px ${style.fontBody}`;
    const btnFont = `bold ${Math.round(12 * scale)}px ${FONT_MONO_STACK}`;
    const btnHeight = 36 * scale;

    const titleLines = wrap(slide.title || "Let's connect!", cardWidth - 40 * scale, titleFont);
    const contentLines = wrap(slide.content || "Follow for daily guides and resources.", cardWidth - 40 * scale, bodyFont);

    const spacing1 = 20 * scale;
    const spacing2 = 12 * scale;
    const spacing3 = 20 * scale;

    const titleH = titleLines.length * 26 * scale;
    const bodyH = contentLines.length * 18 * scale;
    const totalH = avatarRadius * 2 + spacing1 + titleH + spacing2 + bodyH + spacing3 + btnHeight;
    const startY = ctaCardY + cardHeight / 2 - totalH / 2;

    // Avatar
    ctx.fillStyle = style.accent;
    ctx.beginPath();
    ctx.arc(width / 2, startY + avatarRadius, avatarRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = style.bg;
    ctx.font = `bold ${Math.round(16 * scale)}px ${FONT_SANS_STACK}`;
    ctx.textAlign = "center";
    const initials = brand.creatorName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
    ctx.fillText(initials, width / 2, startY + avatarRadius + 6 * scale);

    // Title
    const titleY = startY + avatarRadius * 2 + spacing1;
    lines(titleLines, width / 2, titleY + 20 * scale, 26 * scale, style.text, titleFont, "center");

    // Content
    const bodyY = titleY + titleH + spacing2;
    lines(contentLines, width / 2, bodyY + 14 * scale, 18 * scale, style.subtext, bodyFont, "center");

    // Button — preview applies CSS `uppercase` to this one (unlike the
    // lowercase footer link), so the export must uppercase it too.
    const btnY = bodyY + bodyH + spacing3;
    ctx.font = btnFont;
    const btnText = brand.creatorHandle.toUpperCase();
    const textW = ctx.measureText(btnText).width;
    const btnW = textW + 48 * scale;

    ctx.fillStyle = style.accent;
    ctx.beginPath();
    ctx.roundRect(width / 2 - btnW / 2, btnY, btnW, btnHeight, btnHeight / 2);
    ctx.fill();

    ctx.fillStyle = style.bg;
    ctx.textAlign = "center";
    ctx.fillText(btnText, width / 2, btnY + btnHeight / 2 + 4 * scale);
    ctx.textAlign = "left"; // reset
  } else {
    // Default Centered slide
    const titleFont = `bold ${Math.round(24 * scale)}px ${style.fontTitle}`;
    const titleLineHeight = 30 * scale;
    const bodyFont = `${Math.round(14 * scale)}px ${style.fontBody}`;
    const bodyLineHeight = 22 * scale;
    const spacing = 12 * scale;

    const titleLines = wrap(slide.title, contentWidth, titleFont);
    const contentLines = wrap(slide.content, contentWidth, bodyFont);

    const emojiHeight = slide.emoji ? 50 * scale : 0;
    const totalH =
      titleLines.length * titleLineHeight + spacing + contentLines.length * bodyLineHeight + (slide.emoji ? spacing + emojiHeight : 0);
    const startY = centerY - totalH / 2;

    let currentY = lines(titleLines, margin, startY + titleLineHeight - 6 * scale, titleLineHeight, style.text, titleFont);
    currentY = lines(contentLines, margin, currentY + spacing, bodyLineHeight, style.subtext, bodyFont);

    if (slide.emoji) {
      ctx.font = `${Math.round(36 * scale)}px ${FONT_SANS_STACK}`;
      ctx.fillText(slide.emoji, margin, currentY + spacing + 30 * scale);
    }
  }

  // 4. Divider Line (Zamir style)
  if (style.divider && layout !== "split") {
    ctx.strokeStyle = style.border;
    ctx.lineWidth = 1.5 * scale;
    ctx.beginPath();
    ctx.moveTo(margin, footerTop);
    ctx.lineTo(width - margin, footerTop);
    ctx.stroke();
  }

  // 5. Creator Name (Bottom Left) — matches the preview's font-mono footer text
  ctx.fillStyle = style.text + "80";
  ctx.font = "bold " + Math.round(10 * scale) + "px " + FONT_MONO_STACK;
  ctx.fillText(brand.creatorName, margin, height - margin);

  // 6. Brand Website Link (Bottom Right)
  ctx.fillStyle = style.text;
  ctx.font = "bold " + Math.round(11 * scale) + "px " + FONT_MONO_STACK;
  ctx.textAlign = "right";
  ctx.fillText(brand.creatorHandle.toLowerCase(), width - margin, height - margin);
  ctx.textAlign = "left"; // reset

  // Remove the corner clip before stroking the border so the rounded
  // outline itself isn't clipped away — its outer half would otherwise fall
  // outside the clip path and disappear.
  ctx.restore();
  ctx.strokeStyle = style.border;
  ctx.lineWidth = style.borderWidth * scale;
  const inset = ctx.lineWidth / 2;
  ctx.beginPath();
  ctx.roundRect(inset, inset, width - inset * 2, height - inset * 2, Math.max(cardRadius - inset, 0));
  ctx.stroke();

  // Undo the translate into card-local space from the top of the function.
  ctx.restore();
}
