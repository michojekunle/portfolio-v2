"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"

interface HorizontalScrollProps {
  children: React.ReactNode[]
  title?: React.ReactNode
}

export function HorizontalScroll({ children, title }: HorizontalScrollProps) {
  const targetRef = useRef<HTMLDivElement>(null)
  
  const { scrollYProgress } = useScroll({
    target: targetRef,
  })

  // We want to scroll horizontally by (children.length - 1) * 100% 
  // Wait, better to use a specific width minus viewport width
  // But a simple approach is to map [0, 1] to ["0%", `-${100 - (100 / children.length)}%`]
  // Let's assume each child takes up a significant width, like 85vw.
  const x = useTransform(scrollYProgress, [0, 1], ["0%", `-${100 - (100 / children.length)}%`])

  // If there's only 1 child, no need for horizontal scroll mechanics
  if (children.length <= 1) {
    return (
      <div className="mb-[120px] max-[720px]:mb-[80px]">
        {title && <div className="mb-[48px]">{title}</div>}
        <div className="flex flex-col gap-[40px]">
          {children}
        </div>
      </div>
    )
  }

  return (
    <div className="mb-[120px] max-[720px]:mb-[80px]">
      {title && <div className="mb-[48px]">{title}</div>}
      
      {/* 
        The container height determines how long the scroll takes.
        We'll make it 100vh per extra child.
      */}
      <div ref={targetRef} style={{ height: `${children.length * 100}vh` }} className="relative bg-[var(--bg)] rounded-[24px]">
        <div className="sticky top-0 h-screen flex items-center overflow-hidden">
          <motion.div style={{ x }} className="flex gap-[40px] px-[var(--gutter)]">
            {children.map((child, index) => (
              <div key={index} className="w-[85vw] max-w-[1000px] shrink-0">
                {child}
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
