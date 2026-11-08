"use client"

import { motion } from "framer-motion"
import { GuestbookEntries } from "@/app/guestbook/guestbook-entries"

import { GuestbookHeroWidget } from "./guestbook-hero-widget"

export function GuestbookClient() {
  const titleWords = "Sign the".split(" ")

  return (
    <>
      <section className="grid grid-cols-1 min-[900px]:grid-cols-[1.4fr_1fr] gap-12 items-center pt-36 pb-18 max-[720px]:pt-24 max-[720px]:pb-12 max-w-(--maxw) mx-auto px-(--gutter) border-b border-(--rule)">
        <div>
          <h1 className="m-0 font-display font-light text-[clamp(44px,7.5vw,98px)] leading-[0.92] tracking-[-0.035em] text-(--ink) mb-8 text-balance fvs-display flex flex-wrap gap-x-4 max-[720px]:gap-x-2.5">
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
              className="italic text-(--v3-accent) fvs-soft"
            >
              guestbook.
            </motion.span>
          </h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-[clamp(17px,2vw,20px)] text-secondary-foreground max-w-[52ch] leading-[1.6] m-0"
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

      <section className="max-w-[880px] mx-auto px-(--gutter) py-20">
        <GuestbookEntries />
      </section>
    </>
  )
}
