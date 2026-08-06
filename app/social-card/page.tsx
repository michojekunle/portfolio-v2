"use client";

import { motion, Variants } from "framer-motion";
import { Github, Twitter, Linkedin, Globe, Instagram, Youtube } from "lucide-react";
import React from "react";

// TikTok icon SVG component
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

export default function SocialCardPage() {
  const name = "MICHAEL OJEKUNLE.".split("");
  const introWords = "Building things that matter, one ship at a time.".split(" ");

  const containerVariants: Variants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const charVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", damping: 12, stiffness: 100 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", damping: 15, stiffness: 100 },
    },
  };

  const socialGridVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 2.4 },
    },
  };

  // Content platforms — always shown, these are what a video viewer actually follows.
  const primarySocials = [
    { icon: <Twitter className="w-6 h-6 sm:w-6 sm:h-6" />, label: "X", handle: "@devvmichael", url: "https://x.com/devvmichael" },
    { icon: <Youtube className="w-6 h-6 sm:w-6 sm:h-6" />, label: "YouTube", handle: "@devvmichael", url: "https://youtube.com/@devvmichael" },
    { icon: <Instagram className="w-6 h-6 sm:w-6 sm:h-6" />, label: "Instagram", handle: "@devvvmichaell", url: "https://instagram.com/devvvmichaell" },
    { icon: <TikTokIcon className="w-6 h-6 sm:w-6 sm:h-6" />, label: "TikTok", handle: "@devvvmichaell", url: "https://tiktok.com/@devvvmichaell" },
  ];

  // Professional links — clutter on a vertical video frame, kept for the desktop/wide case only.
  const secondarySocials = [
    { icon: <Linkedin className="w-6 h-6" />, label: "LinkedIn", handle: "in/michael-ojekunle", url: "https://linkedin.com/in/michael-ojekunle" },
    { icon: <Github className="w-6 h-6" />, label: "GitHub", handle: "michojekunle", url: "https://github.com/michojekunle" },
  ];

  return (
    // Full-bleed, single surface — no nested "card floating on a page." An
    // end-of-video card should read as one graphic that fills the frame,
    // not a webpage UI with a smaller box and visible margins around it.
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-(--bg) overflow-hidden">
      {/* Background texture spans the whole frame, not just a card's interior */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(var(--ink) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      {/* Top accent line spans the true edge of the frame, like a cinematic top bar */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-(--v3-accent) to-transparent opacity-70" />

      <div className="relative z-10 flex flex-col items-center text-center w-full max-w-4xl px-(--gutter)">
        {/* Website badge */}
        <motion.a
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.1 }}
          href="https://michaelojekunle.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 mb-8 sm:mb-8 font-mono text-sm sm:text-sm tracking-wider text-(--ink-2)"
        >
          <Globe className="w-3.5 h-3.5 sm:w-3.5 sm:h-3.5 text-(--v3-accent)" />
          michaelojekunle.dev
        </motion.a>

        {/* Name typewriter — the brand mark, biggest thing on the frame */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="font-display font-extrabold text-[clamp(56px,16vw,110px)] tracking-[-0.04em] text-(--ink) leading-[0.95] mb-7 sm:mb-5 fvs-display"
        >
          {name.map((char, index) => (
            <motion.span key={index} variants={charVariants} className={char === "." ? "text-(--v3-accent)" : ""}>
              {char}
            </motion.span>
          ))}
        </motion.div>

        {/* Intro typewriter */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="font-mono text-[clamp(15px,4vw,17px)] uppercase tracking-[0.15em] sm:tracking-[0.2em] text-(--ink-2) mb-16 sm:mb-14 max-w-[280px] sm:max-w-xl"
        >
          <motion.span
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 0, transition: { delay: 1.5 } },
            }}
          />
          {introWords.map((word, wordIndex) => (
            <React.Fragment key={`word-${wordIndex}`}>
              <span className="inline-block whitespace-nowrap">
                {word.split("").map((char, charIndex) => (
                  <motion.span key={`intro-${wordIndex}-${charIndex}`} variants={charVariants} className="inline-block">
                    {char}
                  </motion.span>
                ))}
              </span>
              {wordIndex < introWords.length - 1 && " "}
            </React.Fragment>
          ))}
        </motion.div>

        {/* Social row — plain icon + handle pairs, no per-item card chrome,
            so the whole screen reads as one flat graphic instead of a grid
            of nested boxes. Mobile shows only the content platforms a video
            viewer actually follows, as a tight 2x2 grid; LinkedIn/GitHub are
            professional-context links that only earn their space on the wider surface. */}
        <motion.div
          variants={socialGridVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 gap-x-8 gap-y-9 sm:flex sm:flex-wrap sm:items-center sm:justify-center sm:gap-x-10 sm:gap-y-6"
        >
          {primarySocials.map((social, i) => (
            <motion.a
              key={i}
              variants={itemVariants}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2.5 sm:gap-2.5 text-(--ink) opacity-90 hover:opacity-100 transition-opacity"
            >
              <span className="text-(--v3-accent)">{social.icon}</span>
              <span className="font-mono text-sm sm:text-base font-medium tracking-wide">{social.handle}</span>
            </motion.a>
          ))}
        </motion.div>

        {/* Professional links — desktop/wide only, kept off the vertical mobile frame */}
        <motion.div
          variants={socialGridVariants}
          initial="hidden"
          animate="visible"
          className="hidden sm:flex sm:flex-wrap sm:items-center sm:justify-center sm:gap-x-10 sm:gap-y-6 sm:mt-6"
        >
          {secondarySocials.map((social, i) => (
            <motion.a
              key={i}
              variants={itemVariants}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 text-(--ink) opacity-90 hover:opacity-100 transition-opacity"
            >
              <span className="text-(--v3-accent)">{social.icon}</span>
              <span className="font-mono text-base font-medium tracking-wide">{social.handle}</span>
            </motion.a>
          ))}
        </motion.div>
      </div>

      {/* Bottom accent line mirrors the top — frames the whole card top and bottom */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-(--v3-accent) to-transparent opacity-70" />
    </div>
  );
}
