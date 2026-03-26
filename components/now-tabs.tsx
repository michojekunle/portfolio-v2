"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Book,
  Code,
  GraduationCap,
  ChevronDown,
  ChevronUp,
  Quote,
  FileText,
  Lightbulb,
} from "lucide-react"
import { cn } from "@/lib/utils"

type NoteType = "note" | "quote" | "takeaway"

interface BookNote {
  id: string
  book_id: string
  type: NoteType
  content: string
  page_ref: string | null
}

interface BookItem {
  id: string
  title: string
  author: string
  progress: number
  status: string
}

interface LearningItem {
  id: string
  name: string
  progress: number
  description: string | null
}

interface BuildingProject {
  id: string
  name: string
  description: string | null
  status: string
  notes: string | null
  github_url: string | null
}

interface NowTabsProps {
  books: BookItem[]
  learning: LearningItem[]
  building: BuildingProject[]
  bookNotes: BookNote[]
}

const noteTypeConfig: Record<NoteType, { label: string; icon: React.ReactNode }> = {
  note: { label: "Notes", icon: <FileText className="h-3 w-3" /> },
  quote: { label: "Quotes", icon: <Quote className="h-3 w-3" /> },
  takeaway: { label: "Takeaways", icon: <Lightbulb className="h-3 w-3" /> },
}

// ── Book notes panel (shown when expanded) ───────────────────────────────────

interface BookNotesPanelProps {
  notes: BookNote[]
}

function BookNotesPanel({ notes }: BookNotesPanelProps): React.ReactElement {
  const [activeType, setActiveType] = useState<NoteType>("note")
  const filtered = notes.filter((n) => n.type === activeType)
  const countOf = (t: NoteType): number => notes.filter((n) => n.type === t).length

  return (
    <div className="mt-3 pt-3 border-t border-border/60">
      {/* Type selector pills */}
      <div className="flex gap-1 mb-3 flex-wrap">
        {(Object.keys(noteTypeConfig) as NoteType[]).map((t) => (
          <button
            key={t}
            onClick={() => setActiveType(t)}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-colors",
              activeType === t
                ? "bg-foreground text-background font-medium"
                : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            {noteTypeConfig[t].icon}
            {noteTypeConfig[t].label}
            {countOf(t) > 0 && (
              <span className="opacity-60">({countOf(t)})</span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-xs text-muted-foreground italic">
          No {noteTypeConfig[activeType].label.toLowerCase()} yet.
        </p>
      ) : (
        <div className="space-y-3">
          {filtered.map((note) => (
            <div key={note.id} className="flex gap-2.5">
              <span className="shrink-0 mt-0.5 text-muted-foreground">
                {noteTypeConfig[note.type].icon}
              </span>
              <div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {note.type === "quote" ? (
                    <>&ldquo;{note.content}&rdquo;</>
                  ) : (
                    note.content
                  )}
                </p>
                {note.page_ref && (
                  <p className="text-xs text-muted-foreground/60 mt-0.5">
                    p.&nbsp;{note.page_ref}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Book card with expandable notes ─────────────────────────────────────────

interface BookCardProps {
  book: BookItem
  notes: BookNote[]
}

function BookCard({ book, notes }: BookCardProps): React.ReactElement {
  const [open, setOpen] = useState(false)
  const hasNotes = notes.length > 0

  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h4 className="font-medium">{book.title}</h4>
          <p className="text-sm text-muted-foreground">by {book.author}</p>
        </div>
        <Badge
          variant={
            book.status === "reading"
              ? "default"
              : book.status === "completed"
                ? "secondary"
                : "outline"
          }
          className="shrink-0 capitalize"
        >
          {book.status}
        </Badge>
      </div>

      <div className="flex items-center gap-2">
        <Progress value={book.progress} className="h-1.5 flex-1" />
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {book.progress}%
        </span>
      </div>

      {hasNotes && (
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mt-1"
        >
          {open ? (
            <ChevronUp className="h-3 w-3" />
          ) : (
            <ChevronDown className="h-3 w-3" />
          )}
          {open ? "Hide" : "View"} notes &amp; highlights
          <span className="opacity-50">({notes.length})</span>
        </button>
      )}

      {open && <BookNotesPanel notes={notes} />}
    </div>
  )
}

// ── Main tabs component ──────────────────────────────────────────────────────

export function NowTabs({
  books,
  learning,
  building,
  bookNotes,
}: NowTabsProps): React.ReactElement {
  // Group notes by book for O(1) lookup
  const notesByBook = new Map<string, BookNote[]>()
  for (const note of bookNotes) {
    const bucket = notesByBook.get(note.book_id) ?? []
    notesByBook.set(note.book_id, [...bucket, note])
  }

  return (
    <Tabs defaultValue="learning" className="w-full">
      <TabsList className="grid grid-cols-3 mb-8">
        <TabsTrigger value="learning" className="flex items-center gap-2">
          <GraduationCap className="h-4 w-4" />
          <span>Learning</span>
        </TabsTrigger>
        <TabsTrigger value="reading" className="flex items-center gap-2">
          <Book className="h-4 w-4" />
          <span>Reading</span>
        </TabsTrigger>
        <TabsTrigger value="building" className="flex items-center gap-2">
          <Code className="h-4 w-4" />
          <span>Building</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="learning" className="animate-fade-in">
        <div className="content-card">
          {!learning.length ? (
            <p className="text-sm text-muted-foreground">Nothing here yet.</p>
          ) : (
            <div className="space-y-6">
              {learning.map((item) => (
                <div key={item.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">{item.name}</h4>
                    <span className="text-sm text-muted-foreground">
                      {item.progress}%
                    </span>
                  </div>
                  <Progress value={item.progress} className="h-1.5" />
                  {item.description && (
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </TabsContent>

      <TabsContent value="reading" className="animate-fade-in">
        <div className="content-card">
          {!books.length ? (
            <p className="text-sm text-muted-foreground">Nothing here yet.</p>
          ) : (
            <div className="space-y-8">
              {books.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  notes={notesByBook.get(book.id) ?? []}
                />
              ))}
            </div>
          )}
        </div>
      </TabsContent>

      <TabsContent value="building" className="animate-fade-in">
        <div className="content-card">
          {!building.length ? (
            <p className="text-sm text-muted-foreground">Nothing here yet.</p>
          ) : (
            <div className="space-y-8">
              {building.map((project) => (
                <div key={project.id} className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-medium">{project.name}</h4>
                    <Badge
                      variant={
                        project.status === "In Progress"
                          ? "default"
                          : project.status === "Shipped"
                            ? "secondary"
                            : "outline"
                      }
                      className="shrink-0"
                    >
                      {project.status}
                    </Badge>
                  </div>
                  {project.description && (
                    <p className="text-sm text-muted-foreground">
                      {project.description}
                    </p>
                  )}
                  {project.notes && (
                    <p className="text-sm text-muted-foreground leading-relaxed mt-2 pt-2 border-t border-border/60 whitespace-pre-wrap">
                      {project.notes}
                    </p>
                  )}
                  {project.github_url && (
                    <a
                      href={project.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground underline underline-offset-4 mt-1"
                    >
                      View on GitHub
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </TabsContent>
    </Tabs>
  )
}
