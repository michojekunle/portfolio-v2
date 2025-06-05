"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, Code, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

export function HeroSection() {
  const [displayText, setDisplayText] = useState("")
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [typingSpeed, setTypingSpeed] = useState(100)

  const phrases = [
    "Frontend. Web3. Solidity. Seeker of Truth.",
    "Building for the decentralized future.",
    "Rooted in divine purpose.",
  ]

  useEffect(() => {
    const currentPhrase = phrases[currentPhraseIndex]

    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          setDisplayText(currentPhrase.substring(0, displayText.length + 1))

          if (displayText.length === currentPhrase.length) {
            setIsDeleting(true)
            setTypingSpeed(1500) // Pause before deleting
          }
        } else {
          setDisplayText(currentPhrase.substring(0, displayText.length - 1))

          if (displayText.length === 0) {
            setIsDeleting(false)
            setCurrentPhraseIndex((currentPhraseIndex + 1) % phrases.length)
            setTypingSpeed(100)
          }
        }
      },
      isDeleting ? typingSpeed / 2 : typingSpeed,
    )

    return () => clearTimeout(timeout)
  }, [displayText, currentPhraseIndex, isDeleting, typingSpeed, phrases])

  return (
    <section className="min-h-[90vh] flex flex-col justify-center pt-20 pb-16">
      <div className="max-w-4xl">
        <div className="inline-flex items-center px-3 py-1 mb-6 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm">
          <Sparkles className="h-3.5 w-3.5 mr-2" />
          <span>Faith-driven developer crafting digital experiences</span>
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">Michael Ojekunle</h1>

        <div className="h-16 md:h-24">
          <h2 className="text-2xl md:text-4xl font-medium text-muted-foreground mb-2">
            {displayText}
            <span className="inline-block w-0.5 h-6 md:h-8 bg-primary animate-cursor-blink ml-1 align-middle"></span>
          </h2>
        </div>

        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mt-6 mb-8">
          A passionate Frontend & Web3 Developer deeply rooted in Solidity, JavaScript/TypeScript, React.js, Next.js,
          Rust, Cairo, and exploring the depths of Haskell, Erlang, and Python.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button size="lg" className="group">
            View Projects
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
          <Button size="lg" variant="outline" className="group">
            <Code className="mr-2 h-4 w-4" />
            Explore Code
          </Button>
        </div>

        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {["Solidity", "React", "Next.js", "TypeScript", "Rust", "Cairo", "Haskell", "Erlang"].map((tech, i) => (
            <div
              key={tech}
              className={cn(
                "terminal-card overflow-hidden hover:scale-105 transition duration-300 glow terminal-card glow flex items-center justify-center py-3 text-sm font-medium",
                "animate-fade-up",
              )}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              {tech}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
