"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence, Variants } from "framer-motion"

export function Preloader(): React.ReactElement {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    try {
      const hasSeen = sessionStorage.getItem("hasSeenPreloader")
      if (hasSeen) {
        setIsLoading(false)
        return
      }
    } catch {}

    const timer = setTimeout(() => {
      setIsLoading(false)
      try {
        sessionStorage.setItem("hasSeenPreloader", "true")
      } catch {}
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  const name = "MICHAEL OJEKUNLE.".split("")
  const intro = "Architecting the decentralized web, pixel by pixel.".split("")

  const containerVariants: Variants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12, // Slowed down from 0.08
      },
    },
  }

  const charVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", damping: 12, stiffness: 100 }
    },
  }

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          key="preloader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 1.2, ease: [0.76, 0, 0.24, 1] } }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-(--bg) px-(--gutter)"
          aria-hidden="true"
        >
          <div className="flex flex-col items-center text-center">
            {/* Name typewriter */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ y: "-50px", opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
              className="font-display font-extrabold text-[clamp(50px,11vw,140px)] tracking-[-0.04em] text-(--ink) leading-[1.0] mb-6 fvs-display"
            >
              {name.map((char, index) => (
                <motion.span key={index} variants={charVariants} className={char === "." ? "text-(--v3-accent)" : ""}>
                  {char}
                </motion.span>
              ))}
            </motion.div>
            
            {/* Intro typewriter (starts slightly later) */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ y: "-30px", opacity: 0, transition: { duration: 0.8, ease: "easeInOut", delay: 0.1 } }}
              className="font-mono text-[clamp(12px,1.5vw,16px)] uppercase tracking-[0.2em] text-secondary-foreground"
            >
              {/* Dummy span to delay the second line stagger naturally */}
              <motion.span variants={{ hidden: { opacity: 0 }, visible: { opacity: 0, transition: { delay: 2.2 } } }} />
              {intro.map((char, index) => (
                <motion.span key={`intro-${index}`} variants={charVariants} className="inline-block">
                  {char === " " ? "\u00A0" : char}
                </motion.span>
              ))}
            </motion.div>
          </div>
          
          {/* Subtle loading bar */}
          <div className="absolute bottom-10 w-[200px] h-0.5 bg-(--rule) overflow-hidden">
             <motion.div 
               initial={{ x: "-100%" }}
               animate={{ x: "0%" }}
               transition={{ duration: 2.0, ease: "easeInOut" }}
               className="w-full h-full bg-(--ink)"
             />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
