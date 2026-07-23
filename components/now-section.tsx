import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { createClient } from "@/lib/supabase/server"
import { MagneticWrapper } from "./magnetic-wrapper"
import { SpotifyListeningPanel } from "./spotify-listening-panel"
import { getSpotifyNowPlaying, getSpotifyTopTracks, getSpotifyRecentlyPlayed } from "@/lib/spotify"
import { ArrowRight, ArrowUpRight } from "lucide-react"

// DB column is `name` for building_projects and learning_items
interface BuildingItem {
  name: string
  description?: string | null
  status?: string | null
  notes?: string | null
  github_url?: string | null
  updated_at?: string | null
}

interface LearningItem {
  name: string
  description?: string | null
  progress?: number | null
  updated_at?: string | null
}

// DB column is `title` + `status` for books
interface BookItem {
  title: string
  author?: string | null
  status?: string | null   // "reading" | "completed" | "queued"
  cover_url?: string | null
  updated_at?: string | null
}

function UpdatedBadge({ date }: { date?: string | null }): React.ReactElement | null {
  if (!date) return null
  return (
    <span className="font-mono text-[9px] tracking-[0.1em] uppercase text-muted-foreground/60 whitespace-nowrap">
      Updated {formatDistanceToNow(new Date(date))} ago
    </span>
  )
}

function statusClass(status: string | null | undefined): string {
  if (!status) return ""
  const s = status.toLowerCase().replace(/\s+/g, "-")
  const base = "inline-flex items-center gap-1 font-mono text-[9px] tracking-[0.12em] uppercase px-2 py-0.75 rounded font-semibold align-middle ml-2"
  const map: Record<string, string> = {
    "in-progress": `${base} bg-[color-mix(in_oklab,var(--v3-accent-soft)_80%,transparent)] text-(--v3-accent)`,
    "in progress": `${base} bg-[color-mix(in_oklab,var(--v3-accent-soft)_80%,transparent)] text-(--v3-accent)`,
    "shipped": `${base} bg-[color-mix(in_oklab,#16a34a_20%,var(--bg))] text-[#16a34a] border border-[color-mix(in_oklab,#16a34a_40%,transparent)] dark:text-[#4ade80]`,
    "paused": `${base} bg-(--bg-2) text-muted-foreground`,
    "ideating": `${base} bg-[color-mix(in_oklab,#9333ea_20%,var(--bg))] text-[#9333ea] border border-[color-mix(in_oklab,#9333ea_40%,transparent)] dark:text-[#c084fc]`,
  }
  return map[s] ?? `${base} bg-(--bg-2) text-muted-foreground`
}

export async function NowSection(): Promise<React.ReactElement> {
  const supabase = await createClient()

  const [
    { data: booksRaw, error: booksErr },
    { data: learningRaw, error: learningErr },
    { data: buildingRaw, error: buildingErr },
    nowPlaying,
    topTracks,
    recentlyPlayed,
  ] = await Promise.all([
    supabase.from("books").select("title, author, status, cover_url, updated_at").order("sort_order"),
    supabase.from("learning_items").select("name, description, progress, updated_at").order("sort_order"),
    supabase.from("building_projects").select("name, description, status, notes, github_url, updated_at").order("sort_order"),
    getSpotifyNowPlaying(),
    getSpotifyTopTracks(),
    getSpotifyRecentlyPlayed(),
  ])

  if (booksErr) console.error("[NowSection] books:", booksErr.message)
  if (learningErr) console.error("[NowSection] learning:", learningErr.message)
  if (buildingErr) console.error("[NowSection] building:", buildingErr.message)

  const building = (buildingRaw ?? []) as BuildingItem[]
  const learning = (learningRaw ?? []) as LearningItem[]
  const books = (booksRaw ?? []) as BookItem[]

  return (
    <section className="relative py-30 max-180:py-18 bg-(--bg-2) border-y border-(--rule)" id="now" aria-labelledby="now-heading">
      <div className="max-w-(--maxw) mx-auto px-(--gutter)">
        <div className="grid grid-cols-[120px_1fr] max-180:grid-cols-1 gap-12 max-180:gap-6 items-baseline mb-20 max-180:mb-12">
          <div className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground pt-4.5 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-(--v3-accent) animate-pulse" />
            04 — NOW
          </div>
          <div>
            <h2 id="now-heading" className="m-0 font-display font-normal text-[clamp(44px,7vw,88px)] leading-[0.95] tracking-tight text-(--ink) text-balance fvs-display">
              Currently <em className="not-italic italic text-(--v3-accent) fvs-soft">working on.</em>
            </h2>
            <div className="col-start-2 max-180:col-start-1 max-w-[56ch] text-[17px] leading-[1.6] text-secondary-foreground mt-4.5">
              A live snapshot — Spotify updates in real time, everything else the moment it changes.
            </div>
          </div>
        </div>

        <SpotifyListeningPanel
          initialNowPlaying={nowPlaying}
          initialTopTracks={topTracks}
          initialRecentlyPlayed={recentlyPlayed}
        />

        <h3 className="font-mono text-[10px] tracking-[0.18em] uppercase text-muted-foreground mb-6 font-medium">The work</h3>
        <div className="grid grid-cols-3 max-[920px]:grid-cols-1 gap-0 border-y border-(--rule)">

          {/* Building */}
          <div className="p-[36px_32px] border-r border-(--rule) last:border-r-0 max-[920px]:border-r-0 max-[920px]:border-b max-[920px]:border-(--rule) max-[920px]:last:border-b-0">
            <h4 className="font-mono text-[10px] tracking-[0.18em] uppercase text-muted-foreground m-[0_0_28px] font-medium flex items-center gap-2 before:content-[''] before:w-2 before:h-2 before:bg-(--v3-accent) before:rounded-full">Building</h4>
            <ul className="list-none p-0 m-0">
              {building.length > 0 ? (
                building.map((item, i) => (
                  <li key={i} className="py-4 border-b border-dashed border-(--rule) last:border-b-0">
                    <b className="block font-display text-[20px] font-normal tracking-[-0.012em] text-(--ink) mb-1 fvs-text">
                      {item.name}
                      {item.status && (
                        <span className={statusClass(item.status)}>
                          {item.status}
                        </span>
                      )}
                    </b>
                    {item.description && (
                      <span className="font-mono text-[11px] text-muted-foreground tracking-[0.04em]">{item.description}</span>
                    )}
                    {item.notes && (
                      <span className="notes">{item.notes}</span>
                    )}
                    <div className="flex items-center justify-between gap-3 mt-2">
                      {item.github_url ? (
                        <a
                          href={item.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="github-link"
                          aria-label={`${item.name} repository`}
                        >
                          GitHub <ArrowUpRight className="inline w-3 h-3 ml-1" />
                        </a>
                      ) : <span />}
                      <UpdatedBadge date={item.updated_at} />
                    </div>
                  </li>
                ))
              ) : (
                <li className="py-4 border-b border-dashed border-(--rule) last:border-b-0">
                  <b className="block font-display text-[20px] font-normal tracking-[-0.012em] text-(--ink) mb-1 fvs-text">
                    Something new <span className={statusClass("in-progress")}>In Progress</span>
                  </b>
                  <span className="font-mono text-[11px] text-muted-foreground tracking-[0.04em]">always</span>
                </li>
              )}
            </ul>
          </div>

          {/* Learning */}
          <div className="p-[36px_32px] border-r border-(--rule) last:border-r-0 max-[920px]:border-r-0 max-[920px]:border-b max-[920px]:border-(--rule) max-[920px]:last:border-b-0">
            <h4 className="font-mono text-[10px] tracking-[0.18em] uppercase text-muted-foreground m-[0_0_28px] font-medium flex items-center gap-2 before:content-[''] before:w-2 before:h-2 before:bg-(--v3-accent) before:rounded-full">Learning</h4>
            <ul className="list-none p-0 m-0">
              {learning.length > 0 ? (
                learning.map((item, i) => (
                  <li key={i} className="py-4 border-b border-dashed border-(--rule) last:border-b-0">
                    <b className="block font-display text-[20px] font-normal tracking-[-0.012em] text-(--ink) mb-1 fvs-text">{item.name}</b>
                    {item.description && (
                      <span className="font-mono text-[11px] text-muted-foreground tracking-[0.04em]">{item.description}</span>
                    )}
                    {typeof item.progress === "number" && item.progress > 0 && (
                      <div
                        className="h-0.75 bg-(--rule) rounded-sm overflow-hidden mt-2 mb-1"
                        role="progressbar"
                        aria-valuenow={item.progress}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`${item.progress}% complete`}
                      >
                        <div className="h-full bg-(--v3-accent) rounded-sm transition-[width] duration-800 ease-[cubic-bezier(0.2,0.8,0.2,1)]" style={{ width: `${item.progress}%` }} />
                      </div>
                    )}
                    <div className="mt-2">
                      <UpdatedBadge date={item.updated_at} />
                    </div>
                  </li>
                ))
              ) : (
                <li className="py-4 border-b border-dashed border-(--rule) last:border-b-0">
                  <b className="block font-display text-[20px] font-normal tracking-[-0.012em] text-(--ink) mb-1 fvs-text">ZK proofs</b>
                  <span className="font-mono text-[11px] text-muted-foreground tracking-[0.04em]">slowly, carefully</span>
                </li>
              )}
            </ul>
          </div>

          {/* Off-screen / reading */}
          <div className="p-[36px_32px] border-r border-(--rule) last:border-r-0 max-[920px]:border-r-0 max-[920px]:border-b max-[920px]:border-(--rule) max-[920px]:last:border-b-0">
            <h4 className="font-mono text-[10px] tracking-[0.18em] uppercase text-muted-foreground m-[0_0_28px] font-medium flex items-center gap-2 before:content-[''] before:w-2 before:h-2 before:bg-(--v3-accent) before:rounded-full">Off-screen</h4>
            <ul className="list-none p-0 m-0">
              {books.length > 0 ? (
                <>
                  {books.slice(0, 4).map((b, i) => (
                    <li key={i} className="py-4 border-b border-dashed border-(--rule) last:border-b-0">
                      <b className="block font-display text-[20px] font-normal tracking-[-0.012em] text-(--ink) mb-1 fvs-text">
                        {b.title}
                        {b.status === "reading" && (
                          <span className={statusClass("in-progress")}>reading</span>
                        )}
                      </b>
                      {b.author && (
                        <span className="font-mono text-[11px] text-muted-foreground tracking-[0.04em]">by {b.author}</span>
                      )}
                      <div className="mt-2">
                        <UpdatedBadge date={b.updated_at} />
                      </div>
                    </li>
                  ))}
                  <li className="pt-6">
                    <Link href="/reading" className="font-mono text-[11px] uppercase tracking-[0.12em] text-(--v3-accent) hover:text-(--v3-accent-2) transition-colors no-underline font-semibold flex items-center gap-2 group/read">
                      Full reading log <ArrowRight className="inline-block transition-transform duration-200 group-hover/read:translate-x-1 w-3 h-3 ml-1" />
                    </Link>
                  </li>
                </>
              ) : (
                <li className="py-4 border-b border-dashed border-(--rule) last:border-b-0">
                  <b className="block font-display text-[20px] font-normal tracking-[-0.012em] text-(--ink) mb-1 fvs-text">Reading &amp; walking</b>
                  <span className="font-mono text-[11px] text-muted-foreground tracking-[0.04em]">Lagos evenings</span>
                </li>
              )}
            </ul>
          </div>

        </div>

        <div className="flex justify-center mt-20 pt-10 border-t border-(--rule)">
          <MagneticWrapper strength={20}>
            <Link href="/about" className="group inline-flex items-center justify-center px-8 h-13 rounded-full font-mono text-[11px] uppercase tracking-[0.15em] font-medium cursor-pointer border border-(--rule) bg-transparent text-(--ink) transition-all duration-300 no-underline hover:border-(--v3-accent) hover:text-(--v3-accent) hover:bg-[color-mix(in_oklab,var(--v3-accent)_5%,transparent)]">
              More about my journey <ArrowRight className="inline-block transition-transform duration-300 group-hover:translate-x-1 ml-2.5 w-4 h-4" aria-hidden="true" />
            </Link>
          </MagneticWrapper>
        </div>
      </div>
    </section>
  )
}
