"use client"

import { useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

interface Verse {
  text: string
  reference: string
}

const FALLBACK_VERSE: Verse = {
  text: "For we are God&apos;s handiwork, created in Christ Jesus to do good works, which God prepared in advance for us to do.",
  reference: "Ephesians 2:10",
}

export function VerseWidget() {
  const [verse, setVerse] = useState<Verse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const fetchVerse = useCallback(async (): Promise<void> => {
    setLoading(true)
    setError(false)

    try {
      const res = await fetch("/api/verse")
      if (!res.ok) throw new Error(`Response ${res.status}`)
      const data = (await res.json()) as Verse
      setVerse(data)
    } catch (err: unknown) {
      console.error("[verse-widget] Failed to fetch verse:", err)
      setError(true)
      setVerse(FALLBACK_VERSE)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchVerse()
  }, [fetchVerse])

  const displayVerse = verse ?? FALLBACK_VERSE

  return (
    <section className="py-10">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Verse of the Day</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => void fetchVerse()}
          disabled={loading}
          aria-label="Refresh verse"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <div className="content-card">
        {loading && !verse ? (
          <div className="space-y-3">
            <div className="h-4 bg-muted rounded animate-pulse" />
            <div className="h-4 bg-muted rounded animate-pulse w-4/5" />
            <div className="h-4 bg-muted rounded animate-pulse w-3/5" />
            <div className="h-3 bg-muted rounded animate-pulse w-1/4 mt-4 ml-auto" />
          </div>
        ) : (
          <>
            {error && (
              <p className="text-xs text-muted-foreground mb-3">Could not load today&apos;s verse — showing a favourite.</p>
            )}
            <blockquote className="italic text-base mb-3 leading-relaxed text-foreground">
              &ldquo;{displayVerse.text}&rdquo;
            </blockquote>
            <footer className="text-right text-sm text-muted-foreground">— {displayVerse.reference}</footer>
          </>
        )}
      </div>
    </section>
  )
}
