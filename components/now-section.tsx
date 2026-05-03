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
  const map: Record<string, string> = {
    "in-progress": "v3-status-in-progress",
    "in progress": "v3-status-in-progress",
    "shipped": "v3-status-shipped",
    "paused": "v3-status-paused",
    "ideating": "v3-status-ideating",
  }
  return map[s] ?? "v3-status-paused"
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
    <section className="v3-section v3-accent-section" id="now" aria-labelledby="now-heading">
      <div className="v3-container">
        <div className="v3-section-head">
          <div className="num">04 — NOW</div>
          <div>
            <h2 id="now-heading">Currently <em>working on.</em></h2>
            <div className="sub">
              A snapshot. Updated when something meaningful changes — not on a schedule.
            </div>
          </div>
        </div>

        <div className="v3-now-grid">

          {/* Building */}
          <div className="v3-now-col">
            <h4>Building</h4>
            <ul>
              {building.length > 0 ? (
                building.map((item, i) => (
                  <li key={i}>
                    <b>
                      {item.name}
                      {item.status && (
                        <span className={`v3-status-badge ${statusClass(item.status)}`}>
                          {item.status}
                        </span>
                      )}
                    </b>
                    {item.description && (
                      <span className="meta">{item.description}</span>
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
                <li>
                  <b>Something new <span className="v3-status-badge v3-status-in-progress">In Progress</span></b>
                  <span className="meta">always</span>
                </li>
              )}
            </ul>
          </div>

          {/* Learning */}
          <div className="v3-now-col">
            <h4>Learning</h4>
            <ul>
              {learning.length > 0 ? (
                learning.map((item, i) => (
                  <li key={i}>
                    <b>{item.name}</b>
                    {item.description && (
                      <span className="meta">{item.description}</span>
                    )}
                    {typeof item.progress === "number" && item.progress > 0 && (
                      <div
                        className="v3-progress-bar"
                        role="progressbar"
                        aria-valuenow={item.progress}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`${item.progress}% complete`}
                      >
                        <div className="fill" style={{ width: `${item.progress}%` }} />
                      </div>
                    )}
                  </li>
                ))
              ) : (
                <li>
                  <b>ZK proofs</b>
                  <span className="meta">slowly, carefully</span>
                </li>
              )}
            </ul>
          </div>

          {/* Off-screen / reading */}
          <div className="v3-now-col">
            <h4>Off-screen</h4>
            <ul>
              {books.length > 0 ? (
                books.slice(0, 6).map((b, i) => (
                  <li key={i}>
                    <b>
                      {b.title}
                      {b.status === "reading" && (
                        <span className="v3-status-badge v3-status-in-progress">reading</span>
                      )}
                    </b>
                    {b.author && (
                      <span className="meta">by {b.author}</span>
                    )}
                  </li>
                ))
              ) : (
                <li>
                  <b>Reading &amp; walking</b>
                  <span className="meta">Lagos evenings</span>
                </li>
              )}
            </ul>
          </div>

        </div>

        <div style={{ marginTop: 48, textAlign: "center" }}>
          <Link href="/about" className="v3-btn v3-btn-ghost">
            More about me <span className="arr" aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
