"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";

export function PlayfulAvatar() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [clickEffect, setClickEffect] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Rotate slightly towards the cursor
    const rotateX = ((y - centerY) / centerY) * -15;
    const rotateY = ((x - centerX) / centerX) * 15;
    
    setRotation({ x: rotateX, y: rotateY });
  }, []);

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotation({ x: 0, y: 0 }); // Reset to flat
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleClick = () => {
    setClickEffect(true);
    setTimeout(() => setClickEffect(false), 500); // 500ms ripple effect
  };

  // Mobile Gyroscope handling
  useEffect(() => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      const beta = event.beta; 
      const gamma = event.gamma; 

      if (beta !== null && gamma !== null) {
        // Assume default holding angle for a phone is ~45deg beta.
        const normalizedBeta = beta - 45; 
        
        // Constrain and amplify for the rotation effect
        const rotateX = Math.max(-15, Math.min(15, (normalizedBeta / 45) * -15));
        const rotateY = Math.max(-15, Math.min(15, (gamma / 45) * 15));
        
        setIsHovered(true); // Treat tilting the phone as "hovering" to reveal elements
        setRotation({ x: rotateX, y: rotateY });
      }
    };

    if (typeof window !== "undefined" && window.DeviceOrientationEvent) {
      // Must request permission on iOS 13+ inside a user interaction normally,
      // but standard binding handles many Android and older iOS devices natively.
      window.addEventListener("deviceorientation", handleOrientation);
    }

    return () => {
      if (typeof window !== "undefined" && window.DeviceOrientationEvent) {
        window.removeEventListener("deviceorientation", handleOrientation);
      }
    };
  }, []);

  return (
    <div 
      className="relative flex justify-center items-center w-full max-w-[280px] mx-auto md:max-w-xs perspective-1000"
      style={{ perspective: "1000px" }}
    >
      {/* Glitch/Holographic background effects */}
      <div 
        className={`absolute inset-0 bg-gradient-to-tr from-purple-500/30 via-cyan-400/20 to-emerald-500/30 rounded-3xl blur-2xl transition-all duration-700 ${
          isHovered ? "opacity-100 scale-110 rotate-12" : "opacity-0 scale-90"
        }`} 
      />
      
      {/* Floating particles (CSS pure animation) */}
      <div className={`absolute inset-0 pointer-events-none transition-opacity duration-500 ${isHovered ? "opacity-100" : "opacity-0"}`}>
        {[...Array(5)].map((_, i) => (
          <div 
            key={i} 
            className="absolute bg-white rounded-full animate-ping"
            style={{ 
              width: Math.random() * 6 + 2 + "px", 
              height: Math.random() * 6 + 2 + "px",
              top: Math.random() * 100 + "%",
              left: Math.random() * 100 + "%",
              animationDuration: Math.random() * 1.5 + 0.5 + "s",
              animationDelay: Math.random() * 1 + "s"
            }}
          />
        ))}
      </div>

      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        className="w-full aspect-[4/5] relative rounded-2xl cursor-pointer group transition-transform ease-out"
        style={{
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale(${isHovered ? 1.05 : 1}) ${clickEffect ? 'scale(0.95)' : ''}`,
          transformStyle: "preserve-3d",
          transitionDuration: isHovered ? "100ms" : "500ms" // Snap to cursor fast, ease out slow
        }}
      >
        {/* Border / Glow Container */}
        <div className="absolute inset-0 rounded-3xl border-2 border-primary/20 bg-background/50 backdrop-blur-sm overflow-hidden" 
             style={{ transform: "translateZ(0px)" }}>
             
          {/* Main image */}
          <div className="absolute inset-2 rounded-2xl overflow-hidden bg-muted">
            <img
              src="https://github.com/michojekunle.png" // User's GitHub avatar as placeholder
              alt="Michael Ojekunle"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            
            {/* Scanline overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] mix-blend-overlay opacity-30 pointer-events-none" />
            
            {/* Holographic wipe effect on hover */}
            <div className={`absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent transform -translate-x-full transition-transform duration-1000 ease-in-out ${isHovered ? 'translate-x-full' : ''}`} />
          </div>
          
        </div>

        {/* 3D Floating Elements */}
        {/* Floating tech badge */}
        <div 
          className={`absolute -right-6 top-8 bg-zinc-900 border border-zinc-700 text-cyan-400 text-xs font-mono px-3 py-1.5 rounded-full shadow-lg shadow-cyan-900/20 transition-all duration-500 flex items-center gap-1 ${
            isHovered ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
          }`}
          style={{ transform: "translateZ(40px)" }}
        >
          <span className="h-1.5 w-1.5 bg-cyan-400 rounded-full animate-pulse" />
          ZKML Build
        </div>

        {/* Floating personal badge */}
        <div 
          className={`absolute -left-6 bottom-12 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-semibold px-3 py-1.5 rounded-full shadow-xl transition-all duration-700 delay-100 ${
            isHovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
          }`}
          style={{ transform: "translateZ(50px)" }}
        >
          ♟️ Chess & 🎸 Guitar
        </div>
      </div>
      
      {/* Easter egg text below */}
      <p className={`absolute -bottom-8 text-xs font-mono text-muted-foreground transition-all duration-500 ${isHovered ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}`}>
        &gt; Asking why?
      </p>
    </div>
  );
}
