"use client"

import { useEffect, useState } from "react"
import { motion, useMotionValue, useTransform, animate, useInView } from "framer-motion"
import { useRef } from "react"

export function AnimatedCounter({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })
  
  // Extract number and suffix from string, e.g. "$10M+" -> prefix "$", number 10, suffix "M+"
  // This is a simple regex that finds the first sequence of digits/dots
  const match = value.match(/([^0-9.-]*)([0-9.-]+)(.*)/)
  
  if (!match) {
    return <span>{value}</span>
  }

  const [, prefix, numStr, suffix] = match
  const num = parseFloat(numStr)
  
  const count = useMotionValue(0)
  const rounded = useTransform(count, (latest) => {
    // preserve decimals if original had decimals
    const decimals = numStr.includes(".") ? numStr.split(".")[1].length : 0
    return latest.toFixed(decimals)
  })

  useEffect(() => {
    if (isInView) {
      animate(count, num, { duration: 2, ease: "easeOut" })
    }
  }, [isInView, num, count])

  return (
    <span ref={ref}>
      {prefix}
      <motion.span>{rounded}</motion.span>
      {suffix}
    </span>
  )
}
