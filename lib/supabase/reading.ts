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
    progress: (b.progress as number | null) ?? 0,
    status: b.status as "reading" | "completed" | "queued",
    notes: (Array.isArray(b.book_notes) ? b.book_notes : []) as BookNote[],
  }))
}

export async function getPublicBookById(id: string): Promise<PublicBook | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("books")
    .select("id, title, author, cover_url, progress, status, book_notes(id, type, content, page_ref)")
    .eq("id", id)
    .in("status", ["reading", "completed"])
    .maybeSingle()

  if (error || !data) return null

  return {
    id: data.id as string,
    title: data.title as string,
    author: data.author as string,
    cover_url: data.cover_url as string | null,
    progress: (data.progress as number | null) ?? 0,
    status: data.status as "reading" | "completed" | "queued",
    notes: (Array.isArray(data.book_notes) ? data.book_notes : []) as BookNote[],
  }
}
