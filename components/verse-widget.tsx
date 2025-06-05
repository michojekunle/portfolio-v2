"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

interface Verse {
  text: string
  reference: string
}

export function VerseWidget() {
  const [verse, setVerse] = useState<Verse>({
    text: "For we are God's handiwork, created in Christ Jesus to do good works, which God prepared in advance for us to do.",
    reference: "Ephesians 2:10",
  })
  const [loading, setLoading] = useState(false)

  const verses = [
    {
      text: "For we are God's handiwork, created in Christ Jesus to do good works, which God prepared in advance for us to do.",
      reference: "Ephesians 2:10",
    },
    {
      text: "Whatever you do, work at it with all your heart, as working for the Lord, not for human masters.",
      reference: "Colossians 3:23",
    },
    {
      text: "In all your ways acknowledge him, and he will make straight your paths.",
      reference: "Proverbs 3:6",
    },
    {
      text: "I can do all things through Christ who strengthens me.",
      reference: "Philippians 4:13",
    },
    {
      text: "Let your light shine before others, that they may see your good deeds and glorify your Father in heaven.",
      reference: "Matthew 5:16",
    },
  ]

  const getRandomVerse = () => {
    setLoading(true)

    // Simulate API call
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * verses.length)
      setVerse(verses[randomIndex])
      setLoading(false)
    }, 600)
  }

  useEffect(() => {
    // Set initial verse
    const randomIndex = Math.floor(Math.random() * verses.length)
    setVerse(verses[randomIndex])
  }, [])

  return (
    <section className="py-10">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Verse of the Day</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={getRandomVerse}
          disabled={loading}
          className={loading ? "animate-spin" : ""}
        >
          <RefreshCw className="h-4 w-4" />
          <span className="sr-only">Refresh verse</span>
        </Button>
      </div>

      <Card className="bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 border-primary/20">
        <CardContent className="p-6">
          <blockquote className="italic text-lg mb-4">"{verse.text}"</blockquote>
          <footer className="text-right text-sm font-medium text-muted-foreground">— {verse.reference}</footer>
        </CardContent>
      </Card>
    </section>
  )
}
