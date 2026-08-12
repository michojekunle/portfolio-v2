"use client";

import { motion } from "framer-motion";
import { Github, Twitter, Linkedin, Instagram, Youtube } from "lucide-react";
import { MoMark } from "@/lib/brand-mark";

const socials = [
  { label: "Twitter", icon: Twitter, handle: "@devvmichael", url: "https://x.com/devvmichael" },
  { label: "YouTube", icon: Youtube, handle: "@devvmichael", url: "https://youtube.com/@devvmichael" },
  { label: "Instagram", icon: Instagram, handle: "@devvvmichaell", url: "https://instagram.com/devvvmichaell" },
  { label: "LinkedIn", icon: Linkedin, handle: "in/michael-ojekunle", url: "https://linkedin.com/in/michael-ojekunle" },
  { label: "GitHub", icon: Github, handle: "michojekunle", url: "https://github.com/michojekunle" },
];

// Deliberately still: one fade, no stagger, no typewriter — the point of the
// "minimal" variant is that it reads instantly on a paused frame, not that
// it performs an entrance.
export default function SocialCardMinimalPage(): React.ReactElement {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-(--bg) overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col items-center text-center w-full max-w-md px-(--gutter)"
      >
        <MoMark dim={72} />

        <h1 className="font-display italic text-[clamp(26px,6vw,34px)] text-(--ink) mt-7 mb-1 fvs-soft">Michael Ojekunle</h1>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-(--ink-2) mb-10">michaelojekunle.dev</p>

        <div className="flex items-center justify-center gap-6 flex-wrap">
          {socials.map(({ label, icon: Icon, handle, url }) => (
            <a
              key={label}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-(--ink-2) hover:text-(--ink) transition-colors"
            >
              <Icon className="w-4 h-4" />
              <span className="font-mono text-[12px] tracking-wide">{handle}</span>
            </a>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
