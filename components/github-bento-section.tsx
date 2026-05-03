import { CASE_STUDIES } from "@/lib/case-studies"

interface PinnedRepo {
  name: string
  description: string | null
  url: string
  stars: number
  language: string | null
  topics: string[]
  homepage: string | null
}

interface GraphQLRepo {
  name: string
  description: string | null
  url: string
  stargazerCount: number
  primaryLanguage: { name: string } | null
  repositoryTopics: { nodes: Array<{ topic: { name: string } }> }
  homepageUrl: string | null
}

interface GraphQLResponse {
  data?: {
    user?: {
      pinnedItems?: {
        nodes: GraphQLRepo[]
      }
    }
  }
  errors?: Array<{ message: string }>
}

const FEATURED_SLUGS = new Set(CASE_STUDIES.map((cs) => cs.slug))

async function fetchPinnedRepos(): Promise<PinnedRepo[]> {
  const token = process.env.GITHUB_TOKEN
  const username = process.env.GITHUB_USERNAME ?? "michojekunle"

  if (!token) return []

  const query = `
    query {
      user(login: "${username}") {
        pinnedItems(first: 9, types: REPOSITORY) {
          nodes {
            ... on Repository {
              name description url stargazerCount
              primaryLanguage { name }
              repositoryTopics(first: 8) { nodes { topic { name } } }
              homepageUrl
            }
          }
        }
      }
    }
  `

  try {
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
      next: { revalidate: 3600 },
    })

    if (!res.ok) return []

    const json = (await res.json()) as GraphQLResponse
    if (!json.data?.user?.pinnedItems?.nodes) return []

    return json.data.user.pinnedItems.nodes.map((r) => ({
      name: r.name,
      description: r.description,
      url: r.url,
      stars: r.stargazerCount,
      language: r.primaryLanguage?.name ?? null,
      topics: r.repositoryTopics.nodes.map((t) => t.topic.name),
      homepage: r.homepageUrl,
    }))
  } catch {
    return []
  }
}

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f7df1e",
  Solidity: "#aa6746",
  Rust: "#ce4a1a",
  Cairo: "#ff6b6b",
  Python: "#3572a5",
  Go: "#00add8",
  Clarity: "#7b5ea7",
}

export async function GitHubBentoSection(): Promise<React.ReactElement | null> {
  const allRepos = await fetchPinnedRepos()

  // Filter out repos that are already featured as case studies
  const repos = allRepos.filter(
    (r) => !FEATURED_SLUGS.has(r.name) && !FEATURED_SLUGS.has(r.name.replace(/-/g, "").toLowerCase())
  )

  if (repos.length === 0) return null

  return (
    <section
      className="v3-section v3-container"
      id="open-source"
      aria-labelledby="bento-heading"
    >
      <div className="v3-section-head">
        <div className="num">03 — OSS</div>
        <div>
          <h2 id="bento-heading">Other notable <em>work.</em></h2>
          <div className="sub">
            Open source projects on GitHub — tools, experiments, and things I built
            to scratch my own itch.
          </div>
        </div>
      </div>

      <div className="v3-bento-grid">
        {repos.slice(0, 6).map((repo, i) => {
          const langColor = LANGUAGE_COLORS[repo.language ?? ""] ?? "var(--v3-accent)"
          const isWide = i === 0 || i === 4

          return (
            <a
              key={repo.name}
              href={repo.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`v3-bento-card${isWide ? " wide" : ""}`}
              aria-label={`${repo.name} on GitHub`}
            >
              <div className="v3-bento-header">
                <div className="v3-bento-name">{repo.name}</div>
                <span className="v3-bento-stars" aria-label={`${repo.stars} stars`}>
                  ★ {repo.stars}
                </span>
              </div>

              {repo.description && (
                <p className="v3-bento-desc">{repo.description}</p>
              )}

              <div className="v3-bento-footer">
                {repo.language && (
                  <span className="v3-bento-lang">
                    <span
                      className="v3-bento-lang-dot"
                      style={{ background: langColor }}
                      aria-hidden="true"
                    />
                    {repo.language}
                  </span>
                )}
                {repo.topics.slice(0, 2).map((t) => (
                  <span key={t} className="v3-bento-topic">{t}</span>
                ))}
              </div>

              <div className="v3-bento-arrow" aria-hidden="true">↗</div>
            </a>
          )
        })}
      </div>

      <div style={{ textAlign: "center", marginTop: 48 }}>
        <a
          href={`https://github.com/${process.env.GITHUB_USERNAME ?? "michojekunle"}`}
          target="_blank"
          rel="noopener noreferrer"
          className="v3-btn v3-btn-ghost"
        >
          All repos on GitHub <span className="arr" aria-hidden="true">↗</span>
        </a>
      </div>
    </section>
  )
}
