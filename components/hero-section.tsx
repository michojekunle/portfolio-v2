"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, Code } from "lucide-react"

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
            setTypingSpeed(1500)
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
        <div className="inline-flex items-center px-3 py-1 mb-6 text-xs text-muted-foreground border border-border rounded-full">
          Faith-driven developer crafting digital experiences
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight">
          Michael Ojekunle
        </h1>

        <div className="h-16 md:h-24">
          <h2 aria-hidden="true" className="text-2xl md:text-4xl font-medium text-muted-foreground mb-2">
            {displayText}
            <span className="inline-block w-0.5 h-6 md:h-8 bg-foreground animate-cursor-blink ml-1 align-middle" />
          </h2>
          {/* Static phrase announced by screen readers; visual typewriter is aria-hidden */}
          <span className="sr-only">{phrases[currentPhraseIndex]}</span>
        </div>

        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mt-6 mb-8 leading-relaxed">
          A passionate Frontend &amp; Web3 Developer deeply rooted in Solidity, JavaScript/TypeScript, React.js, Next.js,
          Rust, Cairo, and exploring the depths of Haskell, Erlang, and Python.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button size="lg" className="group" asChild>
            <a href="#projects">
              View Projects
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
          </Button>
          <Button size="lg" variant="outline" className="group" asChild>
            <a href="https://github.com/michojekunle" target="_blank" rel="noopener noreferrer">
              <Code className="mr-2 h-4 w-4" />
              Explore Code
            </a>
          </Button>
        </div>

        <div className="mt-16 grid grid-cols-4 md:grid-cols-8 gap-3">
          {["Solidity", "React", "Next.js", "TypeScript", "Rust", "Cairo", "Haskell", "Erlang"].map((tech) => (
            <div
              key={tech}
              className="border border-border rounded-md flex items-center justify-center py-3 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
            >
              {tech}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
