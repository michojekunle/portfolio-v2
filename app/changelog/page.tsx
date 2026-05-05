import type { Metadata } from "next"
import { ExternalLink } from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"

export const metadata: Metadata = {
  title: "Changelog",
  description: "Recent development activity and commits across Michael Ojekunle's projects.",
}

export const revalidate = 1800

interface CommitNode {
  message: string
  committedDate: string
  url: string
  abbreviatedOid: string
}

interface RepoNode {
  name: string
  url: string
  defaultBranchRef: {
    target: {
      history: { nodes: CommitNode[] }
    }
  } | null
}

interface GitHubResponse {
  data: { user: { repositories: { nodes: RepoNode[] } } }
  errors?: Array<{ message: string }>
}

interface ChangelogEntry {
  repo: string
  repoUrl: string
  message: string
  date: string
  url: string
  sha: string
}

async function fetchChangelog(): Promise<ChangelogEntry[]> {
  const token = process.env.GITHUB_TOKEN
  const username = process.env.GITHUB_USERNAME ?? "michojekunle"
  if (!token) return []

  const query = `query {
    user(login: "${username}") {
      repositories(first: 10, orderBy: {field: PUSHED_AT, direction: DESC}, privacy: PUBLIC) {
        nodes {
          name url
          defaultBranchRef { target { ... on Commit { history(first: 5) { nodes { message committedDate url abbreviatedOid } } } } }
        }
      }
    }
  }`

  try {
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
      next: { revalidate: 1800 },
    })
    if (!res.ok) return []
    const json = (await res.json()) as GitHubResponse
    if (json.errors?.length) return []

    const entries: ChangelogEntry[] = []
    for (const repo of json.data.user.repositories.nodes) {
      const commits = repo.defaultBranchRef?.target?.history?.nodes ?? []
      for (const commit of commits) {
        entries.push({ repo: repo.name, repoUrl: repo.url, message: commit.message.split("\n")[0], date: commit.committedDate, url: commit.url, sha: commit.abbreviatedOid })
      }
    }
    return entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 50)
  } catch {
    return []
  }
}

function groupByDate(entries: ChangelogEntry[]): Map<string, ChangelogEntry[]> {
  const groups = new Map<string, ChangelogEntry[]>()
  for (const entry of entries) {
    const key = format(new Date(entry.date), "yyyy-MM-dd")
    const group = groups.get(key) ?? []
    group.push(entry)
    groups.set(key, group)
  }
  return groups
}

export default async function ChangelogPage(): Promise<React.ReactElement> {
  const entries = await fetchChangelog()
  const grouped = groupByDate(entries)

  return (
    <main id="main-content" tabIndex={-1} className="outline-none">
        <section className="pt-[160px] pb-[80px] max-[720px]:pt-[120px] max-[720px]:pb-[56px] max-w-[var(--maxw)] mx-auto px-[var(--gutter)] border-b border-[var(--rule)]">
          <div className="font-mono text-[11px] tracking-[0.18em] text-[var(--ink-3)] mb-[24px]">/CHANGELOG · ACTIVITY</div>
          <h1 className="m-0 font-[family:var(--display-font)] font-normal text-[clamp(64px,10vw,120px)] leading-[0.85] tracking-[-0.04em] text-[var(--ink)] mb-[32px] text-balance [font-variation-settings:'opsz'_144]">
            Site <em className="not-italic italic text-[var(--v3-accent)] [font-variation-settings:'opsz'_144,'SOFT'_100]">changelog.</em>
          </h1>
          <p className="text-[18px] text-[var(--ink-2)] max-w-[52ch] leading-[1.65] m-0">
            The portfolio is a product. Here&apos;s what&apos;s changed and when. Built in public.
          </p>
        </section>

        <section className="max-w-[var(--maxw)] mx-auto px-[var(--gutter)] py-[120px] max-[720px]:py-[72px]">
          {entries.length === 0 ? (
            <p style={{ color: "var(--ink-3)", fontFamily: "var(--font-jetbrains-mono)", fontSize: "13px" }}>
              No activity to show — check back soon.
            </p>
          ) : (
            <div className="v3-changelog">
              {[...grouped.entries()].map(([dateKey, dayEntries]) => (
                <div key={dateKey} className="entry">
                  <div className="date">{format(new Date(dateKey), "MMMM d, yyyy")}</div>
                  <div className="body">
                    <h3>{format(new Date(dateKey), "EEEE")}</h3>
                    <ul>
                      {dayEntries.map((entry) => (
                        <li key={entry.url}>
                          {entry.message}{" "}
                          <a
                            href={entry.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "var(--v3-accent)", textDecoration: "none" }}
                          >
                            <span style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: "11px" }}>
                              {entry.repo}#{entry.sha}
                            </span>
                            <ExternalLink
                              style={{ display: "inline", width: "10px", height: "10px", marginLeft: "4px" }}
                              aria-hidden="true"
                            />
                          </a>
                          <span style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: "10px", color: "var(--ink-3)", marginLeft: "8px" }}>
                            {formatDistanceToNow(new Date(entry.date), { addSuffix: true })}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
  )
}
