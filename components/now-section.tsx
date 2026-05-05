import Link from "next/link"
import { createClient } from "@/lib/supabase/server"

// DB column is `name` for building_projects and learning_items
interface BuildingItem {
  name: string
  description?: string | null
  status?: string | null
  notes?: string | null
  github_url?: string | null
}

interface LearningItem {
  name: string
  description?: string | null
  progress?: number | null
}

// DB column is `title` + `status` for books
interface BookItem {
  title: string
  author?: string | null
  status?: string | null   // "reading" | "completed" | "queued"
  cover_url?: string | null
}

function statusClass(status: string | null | undefined): string {
  if (!status) return ""
  const s = status.toLowerCase().replace(/\s+/g, "-")
  const base = "inline-flex items-center gap-[4px] font-mono text-[9px] tracking-[0.12em] uppercase px-[8px] py-[3px] rounded-[4px] font-semibold align-middle ml-[8px]"
  const map: Record<string, string> = {
    "in-progress": `${base} bg-[color-mix(in_oklab,var(--v3-accent-soft)_80%,transparent)] text-[var(--v3-accent)]`,
    "in progress": `${base} bg-[color-mix(in_oklab,var(--v3-accent-soft)_80%,transparent)] text-[var(--v3-accent)]`,
    "shipped": `${base} bg-[color-mix(in_oklab,#16a34a_20%,var(--bg))] text-[#16a34a] border border-[color-mix(in_oklab,#16a34a_40%,transparent)] dark:text-[#4ade80]`,
    "paused": `${base} bg-[var(--bg-2)] text-[var(--ink-3)]`,
    "ideating": `${base} bg-[color-mix(in_oklab,#9333ea_20%,var(--bg))] text-[#9333ea] border border-[color-mix(in_oklab,#9333ea_40%,transparent)] dark:text-[#c084fc]`,
  }
  return map[s] ?? `${base} bg-[var(--bg-2)] text-[var(--ink-3)]`
}

export async function NowSection(): Promise<React.ReactElement> {
  const supabase = await createClient()

  const [{ data: booksRaw }, { data: learningRaw }, { data: buildingRaw }] = await Promise.all([
    supabase
      .from("books")
      .select("title, author, status, cover_url")
      .order("sort_order"),
    supabase
      .from("learning_items")
      .select("name, description, progress")
      .order("sort_order"),
    supabase
      .from("building_projects")
      .select("name, description, status, notes, github_url")
      .order("sort_order"),
  ])

  const building = (buildingRaw ?? []) as BuildingItem[]
  const learning = (learningRaw ?? []) as LearningItem[]
  const books = (booksRaw ?? []) as BookItem[]

  return (
    <section className="relative py-[120px] max-[720px]:py-[72px] bg-[var(--bg-2)] border-y border-[var(--rule)]" id="now" aria-labelledby="now-heading">
      <div className="max-w-[var(--maxw)] mx-auto px-[var(--gutter)]">
        <div className="grid grid-cols-[120px_1fr] max-[720px]:grid-cols-1 gap-[48px] max-[720px]:gap-[12px] items-baseline mb-[80px] max-[720px]:mb-[48px]">
          <div className="font-mono text-[11px] tracking-[0.18em] text-[var(--ink-2)] pt-[18px]">04 — NOW</div>
          <div>
            <h2 id="now-heading" className="m-0 font-[family:var(--display-font)] font-normal text-[clamp(44px,7vw,88px)] leading-[0.95] tracking-[-0.025em] text-[var(--ink)] text-balance [font-variation-settings:'opsz'_144]">
              Currently <em className="not-italic italic text-[var(--v3-accent)] [font-variation-settings:'opsz'_144,'SOFT'_100]">working on.</em>
            </h2>
            <div className="col-start-2 max-[720px]:col-start-1 max-w-[56ch] text-[17px] leading-[1.6] text-[var(--ink-2)] mt-[18px]">
              A snapshot. Updated when something meaningful changes — not on a schedule.
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 max-[920px]:grid-cols-1 gap-0 border-y border-[var(--rule)]">

          {/* Building */}
          <div className="p-[36px_32px] border-r border-[var(--rule)] last:border-r-0 max-[920px]:border-r-0 max-[920px]:border-b max-[920px]:border-[var(--rule)] max-[920px]:last:border-b-0">
            <h4 className="font-mono text-[10px] tracking-[0.18em] uppercase text-[var(--ink-3)] m-[0_0_28px] font-medium flex items-center gap-[8px] before:content-[''] before:w-[8px] before:h-[8px] before:bg-[var(--v3-accent)] before:rounded-full">Building</h4>
            <ul className="list-none p-0 m-0">
              {building.length > 0 ? (
                building.map((item, i) => (
                  <li key={i} className="py-[16px] border-b border-dashed border-[var(--rule)] last:border-b-0">
                    <b className="block font-[family:var(--display-font)] text-[20px] font-normal tracking-[-0.012em] text-[var(--ink)] mb-[4px] [font-variation-settings:'opsz'_96]">
                      {item.name}
                      {item.status && (
                        <span className={statusClass(item.status)}>
                          {item.status}
                        </span>
                      )}
                    </b>
                    {item.description && (
                      <span className="font-mono text-[11px] text-[var(--ink-3)] tracking-[0.04em]">{item.description}</span>
                    )}
                    {item.notes && (
                      <span className="notes">{item.notes}</span>
                    )}
                    {item.github_url && (
                      <a
                        href={item.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="github-link"
                        aria-label={`${item.name} repository`}
                      >
                        GitHub ↗
                      </a>
                    )}
                  </li>
                ))
              ) : (
                <li className="py-[16px] border-b border-dashed border-[var(--rule)] last:border-b-0">
                  <b className="block font-[family:var(--display-font)] text-[20px] font-normal tracking-[-0.012em] text-[var(--ink)] mb-[4px] [font-variation-settings:'opsz'_96]">
                    Something new <span className={statusClass("in-progress")}>In Progress</span>
                  </b>
                  <span className="font-mono text-[11px] text-[var(--ink-3)] tracking-[0.04em]">always</span>
                </li>
              )}
            </ul>
          </div>

          {/* Learning */}
          <div className="p-[36px_32px] border-r border-[var(--rule)] last:border-r-0 max-[920px]:border-r-0 max-[920px]:border-b max-[920px]:border-[var(--rule)] max-[920px]:last:border-b-0">
            <h4 className="font-mono text-[10px] tracking-[0.18em] uppercase text-[var(--ink-3)] m-[0_0_28px] font-medium flex items-center gap-[8px] before:content-[''] before:w-[8px] before:h-[8px] before:bg-[var(--v3-accent)] before:rounded-full">Learning</h4>
            <ul className="list-none p-0 m-0">
              {learning.length > 0 ? (
                learning.map((item, i) => (
                  <li key={i} className="py-[16px] border-b border-dashed border-[var(--rule)] last:border-b-0">
                    <b className="block font-[family:var(--display-font)] text-[20px] font-normal tracking-[-0.012em] text-[var(--ink)] mb-[4px] [font-variation-settings:'opsz'_96]">{item.name}</b>
                    {item.description && (
                      <span className="font-mono text-[11px] text-[var(--ink-3)] tracking-[0.04em]">{item.description}</span>
                    )}
                    {typeof item.progress === "number" && item.progress > 0 && (
                      <div
                        className="h-[3px] bg-[var(--rule)] rounded-[2px] overflow-hidden mt-[8px] mb-[4px]"
                        role="progressbar"
                        aria-valuenow={item.progress}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`${item.progress}% complete`}
                      >
                        <div className="h-full bg-[var(--v3-accent)] rounded-[2px] transition-[width] duration-800 ease-[cubic-bezier(0.2,0.8,0.2,1)]" style={{ width: `${item.progress}%` }} />
                      </div>
                    )}
                  </li>
                ))
              ) : (
                <li className="py-[16px] border-b border-dashed border-[var(--rule)] last:border-b-0">
                  <b className="block font-[family:var(--display-font)] text-[20px] font-normal tracking-[-0.012em] text-[var(--ink)] mb-[4px] [font-variation-settings:'opsz'_96]">ZK proofs</b>
                  <span className="font-mono text-[11px] text-[var(--ink-3)] tracking-[0.04em]">slowly, carefully</span>
                </li>
              )}
            </ul>
          </div>

          {/* Off-screen / reading */}
          <div className="p-[36px_32px] border-r border-[var(--rule)] last:border-r-0 max-[920px]:border-r-0 max-[920px]:border-b max-[920px]:border-[var(--rule)] max-[920px]:last:border-b-0">
            <h4 className="font-mono text-[10px] tracking-[0.18em] uppercase text-[var(--ink-3)] m-[0_0_28px] font-medium flex items-center gap-[8px] before:content-[''] before:w-[8px] before:h-[8px] before:bg-[var(--v3-accent)] before:rounded-full">Off-screen</h4>
            <ul className="list-none p-0 m-0">
              {books.length > 0 ? (
                books.slice(0, 6).map((b, i) => (
                  <li key={i} className="py-[16px] border-b border-dashed border-[var(--rule)] last:border-b-0">
                    <b className="block font-[family:var(--display-font)] text-[20px] font-normal tracking-[-0.012em] text-[var(--ink)] mb-[4px] [font-variation-settings:'opsz'_96]">
                      {b.title}
                      {b.status === "reading" && (
                        <span className={statusClass("in-progress")}>reading</span>
                      )}
                    </b>
                    {b.author && (
                      <span className="font-mono text-[11px] text-[var(--ink-3)] tracking-[0.04em]">by {b.author}</span>
                    )}
                  </li>
                ))
              ) : (
                <li className="py-[16px] border-b border-dashed border-[var(--rule)] last:border-b-0">
                  <b className="block font-[family:var(--display-font)] text-[20px] font-normal tracking-[-0.012em] text-[var(--ink)] mb-[4px] [font-variation-settings:'opsz'_96]">Reading &amp; walking</b>
                  <span className="font-mono text-[11px] text-[var(--ink-3)] tracking-[0.04em]">Lagos evenings</span>
                </li>
              )}
            </ul>
          </div>

        </div>

        <div style={{ marginTop: 48, textAlign: "center" }}>
          <Link href="/about" className="inline-flex items-center gap-[10px] px-[24px] py-[14px] rounded-full font-sans text-[14px] font-medium tracking-[-0.005em] cursor-pointer border border-[var(--rule)] bg-transparent text-[var(--ink)] transition-all duration-200 no-underline hover:border-[var(--ink-3)] hover:bg-[var(--paper)] group">
            More about me <span className="inline-block transition-transform duration-250 group-hover:translate-x-[4px]" aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
