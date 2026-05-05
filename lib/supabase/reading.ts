import { createClient } from "@/lib/supabase/server"

export type NoteType = "note" | "quote" | "takeaway"

export interface BookNote {
  id: string
  type: NoteType
  content: string
  page_ref: string | null
}

export interface PublicBook {
  id: string
  title: string
  author: string
  cover_url: string | null
  progress: number
  status: "reading" | "completed" | "queued"
  notes: BookNote[]
}

export async function getPublicBooks(): Promise<PublicBook[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("books")
    .select("id, title, author, cover_url, progress, status, book_notes(id, type, content, page_ref)")
    .in("status", ["reading", "completed"])
    .order("sort_order", { ascending: true })

  if (error || !data) return []

  return data.map((b) => ({
    id: b.id as string,
    title: b.title as string,
    author: b.author as string,
    cover_url: b.cover_url as string | null,
    progress: b.progress as number,
    status: b.status as "reading" | "completed" | "queued",
    notes: ((b.book_notes ?? []) as BookNote[]),
  }))
}
