"use client"

import { motion } from "framer-motion"

export function BlogHeroClient() {
  const titleWords = "Notes from the".split(" ")
  
  return (
    <section className="pt-[160px] pb-[80px] max-[720px]:pt-[80px] max-[720px]:pb-[56px] max-w-[var(--maxw)] mx-auto px-[var(--gutter)] border-b border-[var(--rule)]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="font-mono text-[11px] tracking-[0.18em] text-[var(--ink-3)] mb-[24px]"
      >
        FIELD NOTES · ESSAYS
      </motion.div>
      
      <h1 className="m-0 font-display font-light text-[clamp(64px,10vw,140px)] leading-[0.85] tracking-[-0.04em] text-[var(--ink)] mb-[32px] text-balance fvs-display flex flex-wrap gap-x-[16px] max-[720px]:gap-x-[10px]">
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
          field.
        </motion.span>
      </h1>
      
      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="text-[18px] text-[var(--ink-2)] max-w-[52ch] leading-[1.65] m-0"
      >
        Deep dives on engineering, ZK, Rust, and the philosophy of building. Distilled insights from the front lines of technology and learning.
      </motion.p>
    </section>
  )
}
