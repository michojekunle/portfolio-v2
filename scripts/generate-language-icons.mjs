#!/usr/bin/env node
/**
 * Renders the French Daily and Spanish Daily app icons (pure vector geometry, no font dependency)
 * to every size the PWA install surfaces need. Run after changing the mark:
 *   node scripts/generate-language-icons.mjs
 *
 * The mark: a violet exercise-book page with Seyès ruling, the red margin rule,
 * and a white "f" in French school cursive, written on the baseline.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
// sharp ships as a dependency of next; resolve it from there rather than adding a direct dep.
const requireFromNext = createRequire(createRequire(import.meta.url).resolve("next/package.json"));
const sharp = requireFromNext("sharp");

const VIOLET = "#4B2FA8";

/** School-cursive "f": lead-in on the baseline, tall upper loop, descending lower loop, exit stroke. */
const FRENCH_GLYPH = `<path d="M182 300 C222 298 268 270 296 220 C320 176 324 128 298 120 C270 112 262 168 266 230 C270 300 280 372 268 412 C258 444 226 438 230 404 C234 366 280 322 324 304 C346 295 366 292 388 296"
        fill="none" stroke="#FFFFFF" stroke-linecap="round" stroke-linejoin="round" stroke-width="30"/>`;

/**
 * Cursive "ñ": lead-in, two humps, exit stroke, and the tilde. Drawn small and
 * scaled up about its centre so it carries the same visual weight as the "f".
 */
const SPANISH_GLYPH = `<g transform="translate(306 238) scale(1.42) translate(-264 -238)">
        <path d="M176 304 C198 300 210 266 216 238 C220 216 242 214 244 240 L245 304 C248 262 266 226 294 226 C318 226 320 250 318 274 L316 294 C314 312 330 314 352 302"
          fill="none" stroke="#FFFFFF" stroke-linecap="round" stroke-linejoin="round" stroke-width="22"/>
        <path d="M210 182 C224 160 242 160 258 176 C274 192 290 192 306 170"
          fill="none" stroke="#FFFFFF" stroke-linecap="round" stroke-linejoin="round" stroke-width="18"/>
      </g>`;

/** Android notification badge: the glyph alone, white on transparent (Android masks it to a silhouette). */
function badgeSvg(glyph) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="96 64 320 384" width="512" height="512">${glyph}</svg>`;
}
const MARGIN_RED = "#FF7A7F";

/** @param {{ rounded: boolean; scale: number }} opts */
function frenchSvg({ rounded, scale }) {
  // Content is drawn on a 512 grid and scaled about the centre (maskable icons need a safe zone).
  const t = `translate(256 256) scale(${scale}) translate(-256 -256)`;
  const radius = rounded ? 112 : 0;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs><clipPath id="c"><rect width="512" height="512" rx="${radius}"/></clipPath></defs>
  <g clip-path="url(#c)">
    <rect width="512" height="512" fill="${VIOLET}"/>
    <g transform="${t}">
      <g stroke="#FFFFFF" stroke-opacity="0.07" stroke-width="2">
        ${[136, 160, 184, 232, 256, 280, 328, 352, 376, 424].map((y) => `<line x1="-200" y1="${y}" x2="712" y2="${y}"/>`).join("")}
      </g>
      <g stroke="#FFFFFF" stroke-opacity="0.2" stroke-width="4">
        ${[112, 208, 304, 400].map((y) => `<line x1="-200" y1="${y}" x2="712" y2="${y}"/>`).join("")}
      </g>
      <line x1="150" y1="-200" x2="150" y2="712" stroke="${MARGIN_RED}" stroke-width="8"/>
      ${FRENCH_GLYPH}
    </g>
  </g>
</svg>`;
}

const BLUE = "#1D4FB8";

/**
 * Spanish: a blue cuadrícula (even square grid), the red margin, and a white
 * cursive "ñ" — the one letter that says Spanish at a glance.
 * @param {{ rounded: boolean; scale: number }} opts
 */
function spanishSvg({ rounded, scale }) {
  const t = `translate(256 256) scale(${scale}) translate(-256 -256)`;
  const radius = rounded ? 112 : 0;
  const grid = Array.from({ length: 30 }, (_, i) => -224 + i * 32);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs><clipPath id="c"><rect width="512" height="512" rx="${radius}"/></clipPath></defs>
  <g clip-path="url(#c)">
    <rect width="512" height="512" fill="${BLUE}"/>
    <g transform="${t}">
      <g stroke="#FFFFFF" stroke-opacity="0.13" stroke-width="2">
        ${grid.map((v) => `<line x1="-200" y1="${v}" x2="712" y2="${v}"/><line x1="${v}" y1="-200" x2="${v}" y2="712"/>`).join("")}
      </g>
      <line x1="150" y1="-200" x2="150" y2="712" stroke="${MARGIN_RED}" stroke-width="8"/>
      ${SPANISH_GLYPH}
    </g>
  </g>
</svg>`;
}

for (const [lang, markSvg] of /** @type {const} */ ([["french", frenchSvg], ["spanish", spanishSvg]])) {
const outDir = path.join(root, "public", "icons", lang);
await mkdir(outDir, { recursive: true });

const anySvg = markSvg({ rounded: true, scale: 1 });
const maskableSvg = markSvg({ rounded: false, scale: 0.78 });
const fullBleedSvg = markSvg({ rounded: false, scale: 0.92 });

await writeFile(path.join(outDir, "icon.svg"), anySvg);

const jobs = [
  { svg: anySvg, size: 192, file: "icon-192.png" },
  { svg: anySvg, size: 512, file: "icon-512.png" },
  { svg: maskableSvg, size: 192, file: "maskable-192.png" },
  { svg: maskableSvg, size: 512, file: "maskable-512.png" },
  // iOS rounds the corners itself and rejects transparency.
  { svg: fullBleedSvg, size: 180, file: "apple-touch-icon.png" },
  { svg: anySvg, size: 32, file: "favicon-32.png" },
  { svg: badgeSvg(lang === "french" ? FRENCH_GLYPH : SPANISH_GLYPH), size: 96, file: "badge-96.png" },
];

for (const job of jobs) {
  await sharp(Buffer.from(job.svg), { density: 384 }).resize(job.size, job.size).png({ compressionLevel: 9 }).toFile(path.join(outDir, job.file));
  console.log(`wrote public/icons/${lang}/${job.file}`);
}
}
