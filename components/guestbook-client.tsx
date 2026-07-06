"use client"

import { motion } from "framer-motion"
import { GuestbookEntries } from "@/app/guestbook/guestbook-entries"

import { GuestbookHeroWidget } from "./guestbook-hero-widget"

export function GuestbookClient() {
  const titleWords = "Sign the".split(" ")

  return (
    <>
      <section className="grid grid-cols-1 min-[900px]:grid-cols-[1.4fr_1fr] gap-[48px] items-center pt-[160px] pb-[80px] max-[720px]:pt-[80px] max-[720px]:pb-[56px] max-w-[var(--maxw)] mx-auto px-[var(--gutter)] border-b border-[var(--rule)]">
        <div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="font-mono text-[11px] tracking-[0.18em] text-[var(--ink-3)] mb-[24px]"
          >
            /GUESTBOOK · LEAVE A NOTE
          </motion.div>
          
          <h1 className="m-0 font-display font-light text-[clamp(48px,8vw,110px)] leading-[0.85] tracking-[-0.04em] text-[var(--ink)] mb-[32px] text-balance fvs-display flex flex-wrap gap-x-[16px] max-[720px]:gap-x-[10px]">
            {titleWords.map((word, i) => (
              <motion.span
                key={i}
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: "0%", opacity: 1 }}
                transition={{
                  duration: 0.8,
                  ease: [0.16, 1, 0.3, 1],
                  delay: i * 0.1
                }}
              >
                {word}
              </motion.span>
            ))}
            <motion.span
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: "0%", opacity: 1 }}
              transition={{
                duration: 0.8,
                ease: [0.16, 1, 0.3, 1],
                delay: titleWords.length * 0.1
              }}
              className="italic text-[var(--v3-accent)] fvs-soft"
            >
              guestbook.
            </motion.span>
          </h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-[18px] text-[var(--ink-2)] max-w-[52ch] leading-[1.65] m-0"
          >
            Drop a note. Tell me what you&apos;re building, what made you think, or just say hi.
            Persists forever (or until I migrate the database again).
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex justify-start min-[900px]:justify-end w-full"
        >
          <GuestbookHeroWidget />
        </motion.div>
      </section>

      <section className="max-w-[880px] mx-auto px-[var(--gutter)] py-[80px]">
        <GuestbookEntries />
      </section>
    </>
  )
}
