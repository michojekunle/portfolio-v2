"use client";
// impeccable-disable design-system-font-size, design-system-color -- miniature canvas preview mockup renderer

import React from "react";
import { Quote, MessageCircle, Repeat2, Heart, Bookmark, Check } from "lucide-react";
import type { AestheticMood, AspectRatio, Slide, SlideLayout } from "../lib/types";
import type { TemplateTrack } from "../lib/starter-decks";

interface Props {
  aesthetic: AestheticMood;
  aspectRatio?: AspectRatio;
  slide?: Slide;
  track?: TemplateTrack;
  title?: string;
  content?: string;
  layout?: SlideLayout;
  creatorName?: string;
  creatorHandle?: string;
  topRightTag?: string;
  logoText?: string;
  slideIndex?: number;
  totalSlides?: number;
  className?: string;
}

/**
 * Authentic miniature visual preview card of an aesthetic archetype and slide layout.
 * Strictly maintains 4:5 portrait (or 1:1 square) aspect ratio so previews never stretch.
 */
export function TemplateVisualPreview({
  aesthetic,
  aspectRatio = "portrait",
  slide,
  track,
  title,
  content,
  layout,
  creatorName = "Michael Ojekunle",
  creatorHandle = "@michaelojekunle",
  topRightTag = "Field Notes",
  logoText = "MICHAEL",
  slideIndex = 0,
  totalSlides = 5,
  className = "",
}: Props): React.ReactElement {
  const isSquare = aspectRatio === "square";
  const slideTitle = slide?.title || title || "The Simplicity Advantage";
  const slideContent = slide?.content || content || "Clean typography and focused readability across all devices.";
  const slideLayout: SlideLayout = slide?.layout || layout || "hook";
  const slideEmoji = slide?.emoji || "";
  const pageNum = slideIndex + 1;
  const isSocialNative = track === "social-native" || (track as string) === "twitter" || aesthetic === "Linear Swiss" && (track as string) === "social-native";

  // Enforce strict 4:5 or 1:1 aspect ratio: never stretch horizontally
  const aspectClass = isSquare ? "w-[180px] h-[180px] aspect-square" : "w-[168px] h-[210px] aspect-[4/5]";

  // ───────────────────────────────────────────────────────────────────────────
  // 1. TERMINAL OBSIDIAN (Developer & Systems)
  // ───────────────────────────────────────────────────────────────────────────
  if (aesthetic === "Terminal Obsidian") {
    return (
      <div
        className={`${aspectClass} shrink-0 rounded-xl p-2.5 flex flex-col justify-between overflow-hidden border border-[#30363D] relative select-none font-mono ${className}`}
        style={{ background: "#0D1117", color: "#E6EDF3" }}
      >
        {/* Terminal Header */}
        <div className="flex items-center justify-between border-b border-[#30363D] pb-1">
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#EC6A5E]" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#F5BF4F]" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#62C554]" />
            <span className="text-[7px] text-[#8B949E] ml-1">sh — 80×24</span>
          </div>
          <span className="text-[6px] text-[#22C55E] tracking-widest font-semibold">DEV://</span>
        </div>

        {/* Terminal Body by Layout */}
        <div className="my-auto space-y-1">
          {slideLayout === "hook" && (
            <>
              <div className="text-[6px] text-[#22C55E] flex items-center gap-1">
                <span>$</span>
                <span className="text-[#8B949E]">cat architecture.md</span>
              </div>
              <div className="text-[9px] font-bold text-[#E6EDF3] leading-tight line-clamp-2">
                {slideTitle}
              </div>
              <div className="text-[6.5px] text-[#8B949E] line-clamp-2 leading-relaxed">
                {slideContent}
              </div>
              <div className="flex gap-1 pt-0.5">
                <span className="px-1 py-0.25 rounded bg-[#22C55E]/15 text-[#22C55E] text-[6px] border border-[#22C55E]/30 font-semibold">
                  P99: 8ms
                </span>
                <span className="px-1 py-0.25 rounded bg-[#30363D] text-[#8B949E] text-[6px]">
                  redis.ts
                </span>
              </div>
            </>
          )}

          {slideLayout === "split" && (
            <>
              <div className="text-[6px] text-[#8B949E]">$ diff -u naive.ts optimal.ts</div>
              <div className="grid grid-cols-2 gap-1.5 py-0.5">
                <div className="border-r border-[#30363D] pr-1">
                  <div className="text-[6px] text-red-400 font-bold">- Naive Pool</div>
                  <div className="text-[6px] text-[#8B949E] line-clamp-2 mt-0.5 leading-tight">{slideTitle}</div>
                </div>
                <div className="pl-0.5">
                  <div className="text-[6px] text-[#22C55E] font-bold">+ Single-Flight</div>
                  <div className="text-[6px] text-[#E6EDF3] line-clamp-2 mt-0.5 leading-tight">{slideContent}</div>
                </div>
              </div>
            </>
          )}

          {slideLayout === "metrics" && (
            <div className="text-center py-1">
              <div className="text-[6px] text-[#8B949E]">$ benchmark --throughput</div>
              <div className="text-[18px] font-black text-[#22C55E] tracking-tight leading-none mt-0.5">
                {slideEmoji || "99.9%"}
              </div>
              <div className="text-[7.5px] font-bold text-[#E6EDF3] mt-0.5 line-clamp-1">{slideTitle}</div>
              <div className="text-[6px] text-[#8B949E] line-clamp-2 mt-0.5">{slideContent}</div>
            </div>
          )}

          {slideLayout === "quote" && (
            <div className="p-1.5 rounded bg-[#161B22] border border-[#30363D]">
              <div className="text-[6px] text-[#22C55E]">// Architecture Rule</div>
              <div className="text-[7px] text-[#E6EDF3] italic line-clamp-3 leading-snug mt-0.5">
                &ldquo;{slideContent}&rdquo;
              </div>
              <div className="text-[6px] text-[#8B949E] mt-1 text-right">— {slideTitle}</div>
            </div>
          )}

          {slideLayout === "cta" && (
            <div className="text-center py-1 space-y-1">
              <div className="text-[6px] text-[#22C55E]">$ git push origin main</div>
              <div className="text-[8.5px] font-bold text-white">{slideTitle}</div>
              <div className="text-[6.5px] text-[#8B949E] line-clamp-2">{slideContent}</div>
              <div className="px-2 py-0.75 rounded bg-[#22C55E] text-[#0D1117] font-bold text-[6.5px] uppercase tracking-wider inline-block">
                Clone Blueprint →
              </div>
            </div>
          )}

          {slideLayout === "default" && (
            <>
              <div className="text-[6px] text-[#22C55E]">$ cat step_0{pageNum}.md</div>
              <div className="text-[8.5px] font-bold text-[#E6EDF3] leading-snug line-clamp-2">{slideTitle}</div>
              <div className="text-[6.5px] text-[#8B949E] line-clamp-3 leading-relaxed mt-0.5">{slideContent}</div>
            </>
          )}
        </div>

        {/* Terminal Footer */}
        <div className="flex items-center justify-between pt-1 border-t border-[#30363D] text-[6.5px] text-[#8B949E]">
          <span>git:(main)</span>
          <span className="text-[#22C55E]">0{pageNum}/0{totalSlides}</span>
        </div>
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 2. SOCIAL-NATIVE (X / Twitter / Threads)
  // ───────────────────────────────────────────────────────────────────────────
  if (isSocialNative) {
    return (
      <div
        className={`${aspectClass} shrink-0 rounded-xl p-2.5 flex flex-col justify-between overflow-hidden border border-[#27272A] relative select-none font-sans ${className}`}
        style={{ background: "#09090B", color: "#F4F4F5" }}
      >
        {/* Tweet Header: Avatar, Display Name, Verified Badge, Handle */}
        <div className="flex items-center justify-between border-b border-[#27272A] pb-1">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full bg-[#1D9BF0] flex items-center justify-center text-[7px] font-bold text-white shrink-0">
              M
            </div>
            <div className="leading-none">
              <div className="text-[7.5px] font-bold text-white flex items-center gap-0.5">
                <span>{creatorName}</span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#1D9BF0] text-white text-[5px] flex items-center justify-center">✓</span>
              </div>
              <div className="text-[6px] text-zinc-400 mt-0.25">{creatorHandle}</div>
            </div>
          </div>
          <span className="text-[6px] font-mono text-zinc-400">🧵 {pageNum}/{totalSlides}</span>
        </div>

        {/* Tweet Content Body */}
        <div className="my-auto space-y-1">
          {slideLayout === "hook" && (
            <>
              <div className="text-[9px] font-bold text-white leading-tight line-clamp-2">
                {slideTitle}
              </div>
              <div className="text-[7px] text-zinc-300 leading-normal line-clamp-3">
                {slideContent}
              </div>
              <div className="text-[6.5px] text-[#1D9BF0] font-semibold">
                4 harsh realities about retention 🧵👇
              </div>
            </>
          )}

          {slideLayout === "split" && (
            <div className="space-y-1">
              <div className="text-[7.5px] font-bold text-white">{slideTitle}</div>
              <div className="p-1 rounded bg-[#18181B] border border-[#27272A] text-[6.5px] leading-tight space-y-0.5">
                <div className="text-red-400">❌ Before: Product features</div>
                <div className="text-[#1D9BF0]">✅ After: Relieved pain point</div>
              </div>
              <div className="text-[6.5px] text-zinc-300 line-clamp-2 leading-tight">{slideContent}</div>
            </div>
          )}

          {slideLayout === "metrics" && (
            <div className="text-center py-1">
              <div className="text-[19px] font-black text-[#1D9BF0] tracking-tight leading-none">
                {slideEmoji || "84%"}
              </div>
              <div className="text-[7.5px] font-bold text-white mt-0.5 line-clamp-1">{slideTitle}</div>
              <div className="text-[6.5px] text-zinc-400 line-clamp-2 mt-0.5">{slideContent}</div>
            </div>
          )}

          {slideLayout === "quote" && (
            <div className="p-1.5 rounded-lg bg-[#18181B] border border-[#27272A]">
              <Quote size={10} className="text-[#1D9BF0] mb-0.5 opacity-80" />
              <div className="text-[7px] text-zinc-200 italic line-clamp-3 leading-snug">
                &ldquo;{slideContent}&rdquo;
              </div>
              <div className="text-[6px] font-mono text-[#1D9BF0] mt-1 font-semibold">— {slideTitle}</div>
            </div>
          )}

          {slideLayout === "cta" && (
            <div className="text-center py-1 space-y-1">
              <div className="text-[8px] font-bold text-white">{slideTitle}</div>
              <div className="text-[6.5px] text-zinc-300 line-clamp-2">{slideContent}</div>
              <div className="w-full py-1 rounded-full bg-[#1D9BF0] text-white font-bold text-[6.5px] uppercase tracking-wider text-center">
                Follow {creatorHandle}
              </div>
            </div>
          )}

          {slideLayout === "default" && (
            <>
              <div className="text-[8.5px] font-bold text-white leading-snug line-clamp-2">{slideTitle}</div>
              <div className="text-[7px] text-zinc-300 line-clamp-3 leading-relaxed mt-0.5">{slideContent}</div>
            </>
          )}
        </div>

        {/* Native Tweet Engagement Footer */}
        <div className="flex items-center justify-between pt-1 border-t border-[#27272A] text-[6.5px] text-zinc-400 font-mono">
          <span className="flex items-center gap-0.5"><MessageCircle size={7} /> 48</span>
          <span className="flex items-center gap-0.5"><Repeat2 size={7} /> 192</span>
          <span className="flex items-center gap-0.5"><Heart size={7} /> 1.4K</span>
          <span className="flex items-center gap-0.5"><Bookmark size={7} /> 310</span>
        </div>
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 3. VENTURE THESIS (Executive Newsprint)
  // ───────────────────────────────────────────────────────────────────────────
  if (aesthetic === "Venture Thesis") {
    return (
      <div
        className={`${aspectClass} shrink-0 rounded-xl p-2.5 flex flex-col justify-between overflow-hidden border border-[#E2DDD2] relative select-none font-serif ${className}`}
        style={{ background: "#F8F6F0", color: "#0F172A", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}
      >
        {/* Newspaper Masthead */}
        <div className="border-b border-[#0F172A]/20 pb-0.75 text-center">
          <div className="text-[6px] font-mono uppercase tracking-[0.2em] text-[#B45309] font-bold">
            THE VENTURE MEMORANDUM
          </div>
          <div className="text-[5.5px] text-[#475569] italic">Vol. IX • Special Issue</div>
        </div>

        {/* Headline & Body by Layout */}
        <div className="my-auto space-y-1">
          {slideLayout === "hook" && (
            <>
              <div className="text-[9.5px] font-bold leading-tight text-[#0F172A] line-clamp-2">
                {slideTitle}
              </div>
              <div className="h-0.5 w-5 bg-[#B45309]" />
              <div className="text-[6.5px] text-[#475569] leading-relaxed line-clamp-3 font-sans">
                {slideContent}
              </div>
            </>
          )}

          {slideLayout === "split" && (
            <div className="grid grid-cols-2 gap-1.5 py-0.5">
              <div className="border-r border-[#0F172A]/20 pr-1">
                <div className="text-[7px] font-bold text-[#0F172A] line-clamp-2 leading-tight">{slideTitle}</div>
                <div className="text-[5.5px] font-mono text-[#B45309] mt-0.5 uppercase">Core Thesis</div>
              </div>
              <div className="pl-0.5">
                <div className="text-[6px] text-[#475569] font-sans line-clamp-3 leading-tight">{slideContent}</div>
              </div>
            </div>
          )}

          {slideLayout === "metrics" && (
            <div className="text-center py-1">
              <div className="text-[18px] font-black text-[#B45309] leading-none tracking-tight">
                {slideEmoji || "$120B"}
              </div>
              <div className="text-[7.5px] font-bold text-[#0F172A] mt-0.5 line-clamp-1">{slideTitle}</div>
              <div className="text-[6px] text-[#475569] font-sans line-clamp-2 mt-0.5">{slideContent}</div>
            </div>
          )}

          {slideLayout === "quote" && (
            <div className="relative p-1.5 rounded bg-[#F1EFEA] border border-[#E2DDD2]">
              <div className="text-[10px] font-serif text-[#B45309] leading-none mb-0.5">“</div>
              <div className="text-[7.5px] italic text-[#0F172A] leading-snug line-clamp-3">
                &ldquo;{slideContent}&rdquo;
              </div>
              <div className="text-[6px] font-mono text-[#B45309] mt-1 font-semibold uppercase">— {slideTitle}</div>
            </div>
          )}

          {slideLayout === "cta" && (
            <div className="text-center py-1 space-y-1">
              <div className="text-[8px] font-bold text-[#0F172A]">{slideTitle}</div>
              <div className="text-[6.5px] text-[#475569] font-sans line-clamp-2">{slideContent}</div>
              <div className="px-2.5 py-0.75 rounded border border-[#B45309] text-[#B45309] font-mono text-[6px] font-bold uppercase tracking-wider inline-block">
                Read Executive Memo →
              </div>
            </div>
          )}

          {slideLayout === "default" && (
            <>
              <div className="text-[8.5px] font-bold text-[#0F172A] leading-snug line-clamp-2">{slideTitle}</div>
              <div className="text-[6.5px] text-[#475569] font-sans line-clamp-3 leading-relaxed mt-0.5">{slideContent}</div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-0.75 border-t border-[#0F172A]/20 text-[6px] font-mono text-[#475569]">
          <span className="font-semibold text-[#0F172A]">CAPITAL ALLOCATION</span>
          <span className="text-[#B45309]">PAGE 0{pageNum}</span>
        </div>
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 4. MIDNIGHT NEON (Maximalist & Acid Pop)
  // ───────────────────────────────────────────────────────────────────────────
  if (aesthetic === "Midnight Neon") {
    return (
      <div
        className={`${aspectClass} shrink-0 rounded-xl p-2.5 flex flex-col justify-between overflow-hidden border-2 border-[#27272A] relative select-none font-sans ${className}`}
        style={{ background: "#000000", color: "#FFFFFF", boxShadow: "0 0 16px rgba(163,230,53,0.1)" }}
      >
        {/* Top Tag */}
        <div className="flex items-center justify-between">
          <span className="px-1 py-0.25 rounded-sm bg-[#A3E635] text-black font-black text-[6px] uppercase tracking-wider">
            VIRAL PLAYBOOK
          </span>
          <span className="text-[6px] font-mono text-[#A3E635] font-bold">0{pageNum} // 0{totalSlides}</span>
        </div>

        {/* Content Body */}
        <div className="my-auto space-y-1">
          {slideLayout === "hook" && (
            <>
              <div className="text-[9.5px] font-black leading-tight text-white line-clamp-2 tracking-tight">
                {slideTitle}
              </div>
              <div className="p-1 rounded bg-[#18181B] border border-[#27272A] text-[6.5px] text-[#D1D5DB] line-clamp-2">
                <b className="text-[#A3E635]">RULE:</b> {slideContent}
              </div>
            </>
          )}

          {slideLayout === "split" && (
            <div className="space-y-1">
              <div className="text-[7.5px] font-black uppercase text-white">{slideTitle}</div>
              <div className="grid grid-cols-2 gap-1">
                <div className="p-1 rounded bg-[#18181B] border border-zinc-700 text-[6px] text-zinc-400">
                  BEFORE: Beige copy
                </div>
                <div className="p-1 rounded bg-[#18181B] border border-[#A3E635] text-[6px] text-[#A3E635]">
                  AFTER: High voltage
                </div>
              </div>
              <div className="text-[6px] text-zinc-300 line-clamp-2">{slideContent}</div>
            </div>
          )}

          {slideLayout === "metrics" && (
            <div className="text-center py-1">
              <div className="text-[20px] font-black text-[#A3E635] tracking-tight leading-none">
                {slideEmoji || "3.8x"}
              </div>
              <div className="text-[7.5px] font-black uppercase text-white mt-0.5 line-clamp-1">{slideTitle}</div>
              <div className="text-[6px] text-zinc-300 line-clamp-2 mt-0.5">{slideContent}</div>
            </div>
          )}

          {slideLayout === "quote" && (
            <div className="p-1.5 rounded bg-[#18181B] border border-[#A3E635]/40 text-center">
              <div className="text-[7.5px] font-black text-white italic line-clamp-3 leading-snug">
                &ldquo;{slideContent}&rdquo;
              </div>
              <div className="text-[6px] font-mono text-[#A3E635] mt-1 font-bold">— {slideTitle}</div>
            </div>
          )}

          {slideLayout === "cta" && (
            <div className="text-center py-1 space-y-1">
              <div className="text-[8.5px] font-black text-white uppercase">{slideTitle}</div>
              <div className="text-[6.5px] text-zinc-300 line-clamp-2">{slideContent}</div>
              <div className="w-full py-1 rounded bg-[#A3E635] text-black font-black text-[6.5px] uppercase tracking-wider text-center">
                Stand Out Now →
              </div>
            </div>
          )}

          {slideLayout === "default" && (
            <>
              <div className="text-[8.5px] font-black text-white leading-snug line-clamp-2">{slideTitle}</div>
              <div className="text-[6.5px] text-zinc-300 line-clamp-3 leading-relaxed mt-0.5">{slideContent}</div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-0.75 border-t border-[#27272A] text-[6px] font-mono text-zinc-400">
          <span className="text-white font-bold">GROWTH BLUEPRINT</span>
          <span className="text-[#A3E635]">SWIPE →</span>
        </div>
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 5. BRUTALIST PUNCH (Raw Concrete & Heavy Shadows)
  // ───────────────────────────────────────────────────────────────────────────
  if (aesthetic === "Brutalist Punch" || aesthetic === "Brutalist") {
    return (
      <div
        className={`${aspectClass} shrink-0 rounded-none p-2.5 flex flex-col justify-between overflow-hidden border-2 border-black relative select-none font-mono ${className}`}
        style={{ background: "#F3F4F6", color: "#000000", boxShadow: "3px 3px 0px #000000" }}
      >
        <div className="border-b-2 border-black pb-0.75 flex items-center justify-between font-bold text-[7px]">
          <span>[CONTRARIAN]</span>
          <span>NO. 0{pageNum}</span>
        </div>

        <div className="my-auto space-y-1">
          <div className="text-[9px] font-black uppercase leading-tight text-black line-clamp-2">
            {slideTitle}
          </div>
          <div className="text-[6.5px] text-zinc-800 leading-tight p-1 bg-white border border-black line-clamp-3">
            {slideContent}
          </div>
        </div>

        <div className="border-t-2 border-black pt-0.75 flex items-center justify-between text-[6.5px] font-bold">
          <span>DEBATE ME</span>
          <span>→</span>
        </div>
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 6. WARM CLAY & MINDSET (Philosophy & Essays)
  // ───────────────────────────────────────────────────────────────────────────
  if (aesthetic === "Warm Clay & Mindset") {
    return (
      <div
        className={`${aspectClass} shrink-0 rounded-xl p-2.5 flex flex-col justify-between overflow-hidden border border-[#38332E] relative select-none font-serif ${className}`}
        style={{ background: "#181513", color: "#F5EFE6" }}
      >
        <div className="flex items-center justify-between border-b border-[#38332E] pb-0.75">
          <span className="text-[6px] font-mono uppercase tracking-widest text-[#EA580C] font-semibold">
            ESSAY // CRAFT
          </span>
          <span className="text-[6px] text-[#A8A29E] italic">0{pageNum}</span>
        </div>

        <div className="my-auto space-y-1">
          <div className="text-[9px] font-bold italic leading-tight text-[#F5EFE6] line-clamp-2">
            {slideTitle}
          </div>
          <div className="text-[6.5px] text-[#A8A29E] leading-relaxed line-clamp-3 italic">
            &ldquo;{slideContent}&rdquo;
          </div>
        </div>

        <div className="flex items-center justify-between pt-0.75 border-t border-[#38332E] text-[6px] font-mono text-[#A8A29E]">
          <span className="text-[#EA580C]">TIMELINESS</span>
          <span>DEV</span>
        </div>
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 7. LINEAR SWISS (Design & Craft)
  // ───────────────────────────────────────────────────────────────────────────
  if (aesthetic === "Linear Swiss") {
    return (
      <div
        className={`${aspectClass} shrink-0 rounded-xl p-2.5 flex flex-col justify-between overflow-hidden border border-[#27272A] relative select-none font-sans ${className}`}
        style={{ background: "#09090B", color: "#F4F4F5" }}
      >
        <div className="flex items-center justify-between border-b border-[#27272A] pb-1">
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6366F1]" />
            <span className="text-[7px] font-medium tracking-wide text-zinc-300">DESIGN CRAFT</span>
          </div>
          <span className="text-[6px] font-mono text-zinc-400">0{pageNum}/0{totalSlides}</span>
        </div>

        <div className="my-auto space-y-1">
          {slideLayout === "metrics" ? (
            <div className="text-center py-1">
              <div className="text-[19px] font-black text-[#6366F1] tracking-tight leading-none">
                {slideEmoji || "30ms"}
              </div>
              <div className="text-[7.5px] font-bold text-white mt-0.5 line-clamp-1">{slideTitle}</div>
              <div className="text-[6.5px] text-zinc-400 line-clamp-2 mt-0.5">{slideContent}</div>
            </div>
          ) : (
            <>
              <div className="text-[9px] font-bold text-white tracking-tight leading-snug line-clamp-2">
                {slideTitle}
              </div>
              <div className="text-[6.5px] text-zinc-400 leading-normal line-clamp-3">
                {slideContent}
              </div>
              <div className="flex items-center gap-1.5 pt-0.5">
                <span className="text-[6px] font-mono text-[#6366F1] font-semibold bg-[#6366F1]/15 px-1 py-0.25 rounded border border-[#6366F1]/30">
                  30ms threshold
                </span>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-between pt-0.75 border-t border-[#27272A] text-[6px] font-mono text-zinc-400">
          <span>michaelojekunle.dev</span>
          <span className="text-zinc-400">SWIPE →</span>
        </div>
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 8. PREMIUM EDITORIAL (Zamir Dark Luxury)
  // ───────────────────────────────────────────────────────────────────────────
  if (aesthetic === "Premium Editorial (Zamir)") {
    return (
      <div
        className={`${aspectClass} shrink-0 rounded-xl p-2.5 flex flex-col justify-between overflow-hidden border border-[#27272A] relative select-none font-serif ${className}`}
        style={{ background: "#080809", color: "#FFFFFF" }}
      >
        <div className="flex items-center justify-between border-b border-[#27272A] pb-0.75">
          <span className="text-[6px] font-mono tracking-widest uppercase text-[#C5A880]">
            ZAMIR EDITORIAL
          </span>
          <span className="text-[6px] font-mono text-zinc-400">0{pageNum}</span>
        </div>

        <div className="my-auto space-y-1">
          <div className="text-[9px] font-bold italic text-white leading-tight line-clamp-2">
            {slideTitle}
          </div>
          <div className="text-[6.5px] text-zinc-400 font-sans line-clamp-3 leading-relaxed">
            {slideContent}
          </div>
        </div>

        <div className="flex items-center justify-between pt-0.75 border-t border-[#27272A] text-[6px] font-mono text-zinc-400">
          <span className="text-[#C5A880]">MICHAEL OJEKUNLE</span>
          <span>DEV</span>
        </div>
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 9. LIGHT EDITORIAL (Zamir Light Linen)
  // ───────────────────────────────────────────────────────────────────────────
  if (aesthetic === "Light Editorial (Zamir Light)") {
    return (
      <div
        className={`${aspectClass} shrink-0 rounded-xl p-2.5 flex flex-col justify-between overflow-hidden border border-[#E7E2D8] relative select-none font-serif ${className}`}
        style={{ background: "#FAF8F5", color: "#1C1917" }}
      >
        <div className="flex items-center justify-between border-b border-[#E7E2D8] pb-0.75">
          <span className="text-[6px] font-mono tracking-widest uppercase text-[#855F2F]">
            DAYTIME EDITORIAL
          </span>
          <span className="text-[6px] font-mono text-[#57534E]">0{pageNum}</span>
        </div>

        <div className="my-auto space-y-1">
          <div className="text-[9px] font-bold italic text-[#1C1917] leading-tight line-clamp-2">
            {slideTitle}
          </div>
          <div className="text-[6.5px] text-[#57534E] font-sans line-clamp-3 leading-relaxed">
            {slideContent}
          </div>
        </div>

        <div className="flex items-center justify-between pt-0.75 border-t border-[#E7E2D8] text-[6px] font-mono text-[#855F2F]">
          <span>READING TIME: 3M</span>
          <span>→</span>
        </div>
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 10. MINIMALIST CLEAN (Stark Swiss Typography)
  // ───────────────────────────────────────────────────────────────────────────
  return (
    <div
      className={`${aspectClass} shrink-0 rounded-xl p-2.5 flex flex-col justify-between overflow-hidden border border-[#E5E5E5] relative select-none font-sans ${className}`}
      style={{ background: "#FFFFFF", color: "#111111", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
    >
      <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-0.75">
        <span className="text-[6px] font-mono uppercase tracking-wider text-[#FF6B35] font-bold">
          MINIMALIST NOTE
        </span>
        <span className="text-[6px] font-mono text-zinc-400">0{pageNum}</span>
      </div>

      <div className="my-auto space-y-1">
        {slideLayout === "metrics" ? (
          <div className="text-center py-1">
            <div className="text-[19px] font-black text-[#111111] tracking-tight leading-none">
              {slideEmoji || "10x"}
            </div>
            <div className="text-[7.5px] font-bold text-[#111111] mt-0.5 line-clamp-1">{slideTitle}</div>
            <div className="text-[6.5px] text-[#555555] line-clamp-2 mt-0.5">{slideContent}</div>
          </div>
        ) : (
          <>
            <div className="text-[9px] font-bold text-[#111111] leading-tight line-clamp-2">
              {slideTitle}
            </div>
            <div className="text-[6.5px] text-[#555555] line-clamp-3 leading-normal">
              {slideContent}
            </div>
          </>
        )}
      </div>

      <div className="flex items-center justify-between pt-0.75 border-t border-[#E5E5E5] text-[6px] font-mono text-zinc-400">
        <span>CLEAN SLATE</span>
        <span className="text-[#FF6B35]">NEXT</span>
      </div>
    </div>
  );
}
