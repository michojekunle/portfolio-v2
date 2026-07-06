"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { TiltCard } from "./tilt-card";
import { MagneticWrapper } from "./magnetic-wrapper";
import { PlatformEmbed } from "./videos/PlatformEmbed";
import { YoutubeEmbed } from "./videos/YoutubeEmbed";
import type { SiteVideo } from "@/lib/videos/types";

interface Platform {
  name: string;
  handle: string;
  url: string;
  tagline: string;
  color: string;
  icon: React.ReactNode;
}

function YoutubeIcon(): React.ReactElement {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-[22px] h-[22px]">
      <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.8ZM9.6 15.5V8.5l6.3 3.5-6.3 3.5Z" />
    </svg>
  );
}

function InstagramIcon(): React.ReactElement {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-[22px] h-[22px]">
      <rect x="2.5" y="2.5" width="19" height="19" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function TiktokIcon(): React.ReactElement {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-[20px] h-[20px]">
      <path d="M16.6 0c.4 2.7 2 4.4 4.7 4.6v3.3c-1.6.2-3-.3-4.6-1.2v6.6c0 5.6-6 9.1-10.8 6.4A6.6 6.6 0 0 1 8 7.4v3.5a3.3 3.3 0 1 0 2.4 3.2V0h6.2Z" />
    </svg>
  );
}

function XIcon(): React.ReactElement {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-[19px] h-[19px]">
      <path d="M18.9 1.8h3.7l-8 9.2 9.5 12.5h-7.4l-5.8-7.6-6.6 7.6H.6l8.6-9.9L0 1.8h7.6l5.3 7 6-7Zm-1.3 19.5h2L6.5 4h-2l13.1 17.3Z" />
    </svg>
  );
}

const PLATFORMS: Platform[] = [
  {
    name: "YouTube",
    handle: "@devvmichael",
    url: "https://www.youtube.com/@devvmichael",
    tagline: "Long-form build logs, deep dives, and shipped-project walkthroughs.",
    color: "#FF0000",
    icon: <YoutubeIcon />,
  },
  {
    name: "Instagram",
    handle: "@devvmichaell",
    url: "https://instagram.com/devvmichaell/",
    tagline: "Behind-the-scenes clips, workspace shots, and quick demos.",
    color: "#E1306C",
    icon: <InstagramIcon />,
  },
  {
    name: "TikTok",
    handle: "@devvmichael",
    url: "https://www.tiktok.com/@devvmichaell",
    tagline: "Fast-cut dev tips and bite-sized lessons from real projects.",
    color: "#000000",
    icon: <TiktokIcon />,
  },
  {
    name: "X",
    handle: "@devvmichael",
    url: "https://x.com/devvmichael",
    tagline: "Build threads, live commentary, and the occasional hot take.",
    color: "var(--ink)",
    icon: <XIcon />,
  },
];

interface Props {
  introVideo: SiteVideo | null;
  featuredVideos: SiteVideo[];
  highlightVideos: SiteVideo[];
}

export function VideosClient({ introVideo, featuredVideos, highlightVideos }: Props): React.ReactElement {
  const titleWords = "Watch me build.".split(" ");

  return (
    <>
      {/* ── Hero: heading left, intro + recent videos right ── */}
      <section className="pt-[160px] pb-[80px] max-[720px]:pt-[80px] max-[720px]:pb-[56px] max-w-[var(--maxw)] mx-auto px-[var(--gutter)] border-b border-[var(--rule)]">
        <div className="grid grid-cols-[1.05fr_0.95fr] max-[960px]:grid-cols-1 gap-[56px] max-[960px]:gap-[40px] items-start">
          {/* Left: heading + copy */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="font-mono text-[11px] tracking-[0.18em] text-[var(--ink-3)] mb-[24px]"
            >
              /VIDEOS · ELSEWHERE
            </motion.div>

            <h1 className="m-0 font-display font-light text-[clamp(40px,6vw,88px)] leading-[0.9] tracking-[-0.04em] text-[var(--ink)] mb-[28px] text-balance fvs-display flex flex-wrap gap-x-[14px]">
              {titleWords.map((word, i) => {
                const isBuild = word === "build.";
                return (
                  <motion.span
                    key={i}
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: "0%", opacity: 1 }}
                    transition={{
                      duration: 0.8,
                      ease: [0.16, 1, 0.3, 1],
                      delay: i * 0.1,
                    }}
                    className={isBuild ? "italic text-[var(--v3-accent)] fvs-soft" : ""}
                  >
                    {word}
                  </motion.span>
                );
              })}
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="font-sans font-normal text-[18px] text-[var(--ink-2)] max-w-[42ch]"
            >
              Every platform where I share process over polish — the same
              projects you see here, shot as it happens.
            </motion.p>

            {/* Recent videos highlighted inline under the heading, if any beyond the sidebar's first pick */}
            {featuredVideos.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.55 }}
                className="mt-[36px] flex items-center gap-[10px]"
              >
                <Sparkles size={13} style={{ color: "var(--v3-accent)" }} aria-hidden="true" />
                <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-[var(--ink-3)]">
                  Recently posted — {featuredVideos.length === 1 ? "1 pick" : `${featuredVideos.length} picks`} on the right
                </span>
              </motion.div>
            )}
          </div>

          {/* Right: intro video + featured recent videos */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-[16px]"
          >
            {introVideo ? (
              <div className="rounded-[16px] overflow-hidden border border-[var(--rule)]">
                <PlatformEmbed video={introVideo} />
                <div className="px-[16px] py-[12px] bg-[var(--bg-2)]">
                  <div className="font-mono text-[8px] tracking-[0.14em] uppercase mb-[3px]" style={{ color: "var(--v3-accent)" }}>
                    Start here
                  </div>
                  <div className="text-[13px] font-medium text-[var(--ink)]">{introVideo.title}</div>
                </div>
              </div>
            ) : (
              <div className="rounded-[16px] border border-dashed border-[var(--rule)] bg-[var(--bg-2)] aspect-video flex flex-col items-center justify-center gap-[10px] px-[24px] text-center">
                <Sparkles size={20} style={{ color: "var(--ink-3)" }} aria-hidden="true" />
                <div className="font-mono text-[10px] tracking-[0.1em] uppercase text-[var(--ink-3)]">
                  Intro video coming soon
                </div>
                <p className="text-[12px] text-[var(--ink-3)] max-w-[32ch] m-0">
                  A short walkthrough of what I do and what this whole thing is about.
                </p>
              </div>
            )}

            {featuredVideos.length > 0 && (
              <div className="grid grid-cols-2 max-[520px]:grid-cols-1 gap-[12px]">
                {featuredVideos.map((video) => (
                  <div key={video.id} className="rounded-[12px] overflow-hidden border border-[var(--rule)]">
                    {video.platform === "youtube" ? (
                      <YoutubeEmbed url={video.url} title={video.title} />
                    ) : (
                      <PlatformEmbed video={video} />
                    )}
                    <div className="px-[10px] py-[8px] bg-[var(--bg-2)]">
                      <div className="text-[11px] font-medium text-[var(--ink)] line-clamp-1">
                        {video.title}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* ── Highlights ── */}
      <section className="max-w-[var(--maxw)] mx-auto px-[var(--gutter)] py-[80px] max-[720px]:py-[48px] border-b border-[var(--rule)]">
        <div className="flex items-center justify-between mb-[32px]">
          <div>
            <div className="font-mono text-[10px] tracking-[0.16em] uppercase text-[var(--ink-3)] mb-[6px]">
              Highlights
            </div>
            <h2 className="font-display text-[28px] font-normal tracking-[-0.02em] text-[var(--ink)] m-0">
              Recent clips
            </h2>
          </div>
        </div>

        {highlightVideos.length > 0 ? (
          <div className="grid grid-cols-3 max-[900px]:grid-cols-2 max-[560px]:grid-cols-1 gap-[24px]">
            {highlightVideos.map((video, i) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                className="rounded-[14px] overflow-hidden border border-[var(--rule)] bg-[var(--bg-2)]"
              >
                <PlatformEmbed video={video} />
                <div className="px-[14px] py-[12px]">
                  <div className="font-mono text-[8px] tracking-[0.1em] uppercase mb-[4px] text-[var(--ink-3)]">
                    {video.platform}
                  </div>
                  <div className="text-[13px] font-medium text-[var(--ink)] line-clamp-2">
                    {video.title}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="rounded-[16px] border border-dashed border-[var(--rule)] py-[48px] text-center">
            <p className="text-[13px] text-[var(--ink-3)] m-0">
              New clips get added here regularly — check back soon.
            </p>
          </div>
        )}
      </section>

      {/* ── Platform links ── */}
      <section className="max-w-[var(--maxw)] mx-auto px-[var(--gutter)] py-[80px] max-[720px]:py-[48px]">
        <div className="mb-[32px]">
          <div className="font-mono text-[10px] tracking-[0.16em] uppercase text-[var(--ink-3)] mb-[6px]">
            Follow along
          </div>
          <h2 className="font-display text-[28px] font-normal tracking-[-0.02em] text-[var(--ink)] m-0">
            Everywhere I post
          </h2>
        </div>

        <div className="grid grid-cols-2 max-[820px]:grid-cols-1 gap-[24px]">
          {PLATFORMS.map((platform, i) => (
            <motion.div
              key={platform.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            >
              <TiltCard intensity={6} className="h-full">
                <a
                  href={platform.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Watch on ${platform.name} — ${platform.handle}`}
                  className="group relative flex flex-col h-full no-underline p-[32px] max-[480px]:p-[24px] rounded-[20px] border border-[var(--rule)] bg-[var(--bg-2)] overflow-hidden transition-colors duration-200 hover:border-[var(--ink-3)]"
                >
                  {/* Accent glow, top-right */}
                  <div
                    className="absolute -top-[60px] -right-[60px] w-[160px] h-[160px] rounded-full opacity-[0.12] blur-[10px] transition-opacity duration-300 group-hover:opacity-[0.2]"
                    style={{ background: platform.color }}
                    aria-hidden="true"
                  />

                  <div className="flex items-center justify-between mb-[28px] relative">
                    <div
                      className="w-[48px] h-[48px] rounded-[12px] flex items-center justify-center shrink-0"
                      style={{
                        background: `color-mix(in srgb, ${platform.color} 14%, transparent)`,
                        color: platform.color === "#000000" ? "var(--ink)" : platform.color,
                      }}
                    >
                      {platform.icon}
                    </div>
                    <ArrowUpRight
                      size={20}
                      className="text-[var(--ink-3)] transition-all duration-200 group-hover:text-[var(--ink)] group-hover:translate-x-[3px] group-hover:-translate-y-[3px]"
                      aria-hidden="true"
                    />
                  </div>

                  <h3 className="font-display text-[26px] font-normal tracking-[-0.02em] text-[var(--ink)] m-0 mb-[6px] fvs-text">
                    {platform.name}
                  </h3>
                  <div className="font-mono text-[11px] tracking-[0.08em] text-[var(--ink-3)] mb-[16px]">
                    {platform.handle}
                  </div>
                  <p className="font-sans text-[14px] leading-[1.6] text-[var(--ink-2)] m-0 mb-[24px] max-w-[38ch]">
                    {platform.tagline}
                  </p>

                  <div className="mt-auto flex items-center gap-[8px] font-mono text-[10px] tracking-[0.1em] uppercase font-semibold text-[var(--ink)]">
                    Watch on {platform.name}
                    <ArrowUpRight size={13} className="transition-transform duration-200 group-hover:translate-x-[2px] group-hover:-translate-y-[2px]" aria-hidden="true" />
                  </div>
                </a>
              </TiltCard>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-[56px] pt-[32px] border-t border-[var(--rule)] flex items-center justify-between max-[480px]:flex-col max-[480px]:items-start max-[480px]:gap-[16px]"
        >
          <p className="font-sans text-[14px] text-[var(--ink-3)] m-0">
            New uploads land first on YouTube, then get cut down everywhere
            else.
          </p>
          <MagneticWrapper strength={15}>
            <a
              href="/contact"
              className="inline-flex items-center gap-[8px] font-mono text-[11px] tracking-[0.1em] uppercase font-medium no-underline px-[18px] py-[10px] rounded-full border border-[var(--rule)] text-[var(--ink)] transition-all duration-200 hover:border-[var(--ink-3)] hover:-translate-y-[1px]"
            >
              Suggest a topic
              <ArrowUpRight size={13} aria-hidden="true" />
            </a>
          </MagneticWrapper>
        </motion.div>
      </section>
    </>
  );
}
