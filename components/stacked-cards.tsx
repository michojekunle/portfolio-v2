"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform, MotionValue } from "framer-motion"

interface StackedCardsProps {
  children: React.ReactNode[]
  title?: React.ReactNode
}

function Card({ child, index, total, progress }: { child: React.ReactNode, index: number, total: number, progress: MotionValue<number> }) {
  // Start scaling down when this card is sticky and the next cards scroll over it
  const targetScale = 1 - ( (total - index) * 0.05 )
  const scale = useTransform(progress, [index * 0.25, 1], [1, targetScale])
  // Nullify opacity so it stays fully opaque and covers the previous cards cleanly
  const opacity = 1

  return (
    <motion.div
      className="sticky flex flex-col items-center justify-center top-0 pt-[120px] max-[720px]:pt-[80px]"
      style={{
        scale,
        opacity,
        top: `calc(10dvh + ${index * 20}px)`
      }}
    >
      <div className="w-full max-w-[1000px] h-[75vh] min-h-[600px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] rounded-[20px] overflow-hidden bg-[var(--paper)]">
        {child}
      </div>
    </motion.div>
  )
}

export function StackedCards({ children, title }: StackedCardsProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  })

  if (children.length <= 1) {
    return (
      <div className="mb-[120px] max-[720px]:mb-[80px]">
        {title && <div className="mb-[48px]">{title}</div>}
        <div className="flex flex-col gap-[40px] items-center">
          {children.map((child, i) => (
            <div key={i} className="w-full max-w-[1000px]">
              {child}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="mb-[120px] max-[720px]:mb-[80px]">
      {title && <div className="mb-[48px] z-10 relative">{title}</div>}
      <div ref={containerRef} className="relative pb-[10vh]">
        {children.map((child, index) => (
          <Card 
            key={index} 
            index={index} 
            total={children.length} 
            progress={scrollYProgress} 
            child={child} 
          />
        ))}
      </div>
    </div>
  )
}
