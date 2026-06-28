"use client";

import React, { useRef, useState } from "react";
import { motion } from "framer-motion";

interface MagneticWrapperProps {
  children: React.ReactNode;
  className?: string;
  strength?: number; // How far the element pulls (pixels)
  tolerance?: number; // How far the mouse can be to start pulling
}

export function MagneticWrapper({ 
  children, 
  className = "", 
  strength = 15,
  tolerance = 15
}: MagneticWrapperProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isTouch, setIsTouch] = useState(false);

  // Avoid hydration mismatch
  if (typeof window !== "undefined" && !isTouch && window.matchMedia("(pointer: coarse)").matches) {
    setIsTouch(true);
  }

  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isTouch) return;
    const { clientX, clientY } = e;
    const boundingRect = ref.current?.getBoundingClientRect();
    if (!boundingRect) return;

    const { width, height, top, left } = boundingRect;
    
    // Calculate center of element
    const centerX = left + width / 2;
    const centerY = top + height / 2;

    // Calculate distance from center
    const distanceX = clientX - centerX;
    const distanceY = clientY - centerY;

    // Apply strength to calculate offset
    setPosition({
      x: distanceX * (strength / 100),
      y: distanceY * (strength / 100),
    });
  };

  const reset = () => {
    if (isTouch) return;
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      whileTap={isTouch ? { scale: 0.95 } : undefined}
      animate={{ x: isTouch ? 0 : position.x, y: isTouch ? 0 : position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      className={`inline-block ${className}`}
    >
      {children}
    </motion.div>
  );
}
