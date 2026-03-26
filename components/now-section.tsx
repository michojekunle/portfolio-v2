import { createClient } from "@/lib/supabase/server"
import { formatDistanceToNow } from "date-fns"
import { NowTabs } from "./now-tabs"

export async function NowSection(): Promise<React.ReactElement> {
  const supabase = await createClient()

  const [{ data: books }, { data: learning }, { data: building }] = await Promise.all([
    supabase.from("books").select("*").order("sort_order"),
    supabase.from("learning_items").select("*").order("sort_order"),
    supabase.from("building_projects").select("*").order("sort_order"),
  ])

  const allUpdates = [
    ...(books ?? []).map((b) => new Date(b.updated_at as string)),
    ...(learning ?? []).map((l) => new Date(l.updated_at as string)),
    ...(building ?? []).map((p) => new Date(p.updated_at as string)),
  ]
  const latestUpdatedAt = allUpdates.length
    ? allUpdates.reduce((a, b) => (a > b ? a : b))
    : null

  return (
    <section id="now" className="py-10">
      <h2 className="text-3xl font-bold mb-2">Now</h2>
      <div className="section-rule" />
      <p className="text-muted-foreground mb-1">
        What I&apos;m currently focused on, learning, and exploring.
      </p>
      {latestUpdatedAt && (
        <p className="text-xs text-muted-foreground mb-6">
          Last updated {formatDistanceToNow(latestUpdatedAt)} ago
        </p>
      )}

      <NowTabs
        books={books ?? []}
        learning={learning ?? []}
        building={building ?? []}
      />
    </section>
  )
}
