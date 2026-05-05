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
      className="py-[120px] max-[720px]:py-[72px] relative max-w-[var(--maxw)] mx-auto px-[var(--gutter)]"
      id="open-source"
      aria-labelledby="bento-heading"
    >
      <div className="grid grid-cols-[120px_1fr] max-[720px]:grid-cols-1 gap-[48px] max-[720px]:gap-[12px] items-baseline mb-[80px] max-[720px]:mb-[48px]">
        <div className="font-mono text-[11px] tracking-[0.18em] text-[var(--ink-2)] pt-[18px]">03 — OSS</div>
        <div>
          <h2 id="bento-heading" className="m-0 font-[family:var(--display-font)] font-normal text-[clamp(44px,7vw,88px)] leading-[0.95] tracking-[-0.025em] text-[var(--ink)] text-balance [font-variation-settings:'opsz'_144]">
            Other notable <em className="not-italic italic text-[var(--v3-accent)] [font-variation-settings:'opsz'_144,'SOFT'_100]">work.</em>
          </h2>
          <div className="col-start-2 max-[720px]:col-start-1 max-w-[56ch] text-[17px] leading-[1.6] text-[var(--ink-2)] mt-[18px]">
            Open source projects on GitHub — tools, experiments, and things I built
            to scratch my own itch.
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 max-[920px]:grid-cols-2 max-[720px]:grid-cols-1 gap-[16px] mb-[64px]">
        {repos.slice(0, 6).map((repo, i) => {
          const langColor = LANGUAGE_COLORS[repo.language ?? ""] ?? "var(--v3-accent)"
          const isWide = i === 0 || i === 4

          return (
            <a
              key={repo.name}
              href={repo.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`group flex flex-col bg-[var(--paper)] border border-[var(--rule)] rounded-[12px] p-[24px] no-underline text-inherit transition-all duration-200 relative overflow-hidden hover:border-[var(--v3-accent)] hover:-translate-y-[2px] hover:shadow-[0_12px_24px_-12px_rgba(0,0,0,0.1)] ${isWide ? "col-span-2 max-[920px]:col-span-1" : ""}`}
              aria-label={`${repo.name} on GitHub`}
            >
              <div className="flex justify-between items-start mb-[12px]">
                <div className="font-[family:var(--display-font)] font-normal text-[24px] text-[var(--ink)] leading-[1.1] [font-variation-settings:'opsz'_96]">{repo.name}</div>
                <span className="font-mono text-[11px] text-[var(--ink-3)] border border-[var(--rule)] px-[6px] py-[2px] rounded-[4px]" aria-label={`${repo.stars} stars`}>
                  ★ {repo.stars}
                </span>
              </div>

              {repo.description && (
                <p className="text-[14px] leading-[1.6] text-[var(--ink-2)] m-[0_0_24px] flex-[1] line-clamp-3 overflow-hidden">{repo.description}</p>
              )}

              <div className="flex flex-wrap gap-[8px] items-center mt-auto">
                {repo.language && (
                  <span className="flex items-center gap-[6px] font-mono text-[10px] text-[var(--ink-3)]">
                    <span
                      className="w-[8px] h-[8px] rounded-full"
                      style={{ background: langColor }}
                      aria-hidden="true"
                    />
                    {repo.language}
                  </span>
                )}
                {repo.topics.slice(0, 2).map((t) => (
                  <span key={t} className="font-mono text-[10px] text-[var(--ink-3)] bg-[var(--bg)] border border-[var(--rule)] px-[8px] py-[2px] rounded-full">{t}</span>
                ))}
              </div>

              <div className="absolute top-[24px] right-[24px] text-[var(--v3-accent)] opacity-0 -translate-x-[4px] translate-y-[4px] transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0" aria-hidden="true">↗</div>
            </a>
          )
        })}
      </div>

      <div style={{ textAlign: "center", marginTop: 48 }}>
        <a
          href={`https://github.com/${process.env.GITHUB_USERNAME ?? "michojekunle"}`}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-[10px] px-[24px] py-[14px] rounded-full font-sans text-[14px] font-medium tracking-[-0.005em] cursor-pointer border border-[var(--rule)] bg-transparent text-[var(--ink)] transition-all duration-200 no-underline hover:border-[var(--ink-3)] hover:bg-[var(--paper)]"
        >
          All repos on GitHub <span className="inline-block transition-transform duration-250 group-hover:-translate-y-[2px] group-hover:translate-x-[2px]" aria-hidden="true">↗</span>
        </a>
      </div>
    </section>
  )
}
