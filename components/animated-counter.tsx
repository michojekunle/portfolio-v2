"use client"

import { useEffect, useState, useRef } from "react"
import { motion, useMotionValue, useTransform, animate, useInView, useReducedMotion } from "framer-motion"

export function AnimatedCounter({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })
  const shouldReduceMotion = useReducedMotion()
  const [animating, setAnimating] = useState(false)
  
  const match = value.match(/([^0-9.-]*)([0-9.-]+)(.*)/)
  
  const prefix = match ? match[1] : ""
  const numStr = match ? match[2] : ""
  const suffix = match ? match[3] : ""
  const num = match ? parseFloat(numStr) : 0
  
  const count = useMotionValue(0)
  const rounded = useTransform(count, (latest) => {
    const decimals = numStr.includes(".") ? numStr.split(".")[1].length : 0
    return latest.toFixed(decimals)
  })

  useEffect(() => {
    if (!match || shouldReduceMotion) return

    if (isInView) {
      setAnimating(true)
      count.set(0)
      const controls = animate(count, num, { duration: 1.8, ease: [0.16, 1, 0.3, 1] })
      return () => controls.stop()
    }
  }, [isInView, num, count, match, shouldReduceMotion])

  // Always show the real value statically for SSR, bots, scrapers, and before entering view.
  if (!match || !animating || shouldReduceMotion) {
    return <span ref={ref}>{value}</span>
  }

  return (
    <span ref={ref}>
      {prefix}
      <motion.span>{rounded}</motion.span>
      {suffix}
    </span>
  )
}

