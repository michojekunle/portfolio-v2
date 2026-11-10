import { CASE_STUDIES } from "@/lib/case-studies";
import { MagneticWrapper } from "./magnetic-wrapper";
import { ArrowUpRight, GitCommit, Clock, GitBranch } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";

interface PinnedRepo {
  name: string;
  description: string | null;
  url: string;
  language: string | null;
  topics: string[];
  homepage: string | null;
  pushedAt: string | null;
}

interface ContributionDay {
  contributionCount: number;
  date: string;
}

interface ContributionWeek {
  contributionDays: ContributionDay[];
}

interface GitHubData {
  avatarUrl: string;
  totalContributions: number;
  totalRepos: number;
  weeks: ContributionWeek[];
  repos: PinnedRepo[];
}

const FEATURED_SLUGS = new Set(CASE_STUDIES.map((cs) => cs.slug));

async function fetchGitHubData(): Promise<GitHubData | null> {
  const token = process.env.GITHUB_TOKEN;
  const username = process.env.GITHUB_USERNAME ?? "michojekunle";

  if (!token) return null;

  const query = `
    query {
      user(login: "${username}") {
        avatarUrl
        repositories { totalCount }
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                contributionCount
                date
              }
            }
          }
        }
        pinnedItems(first: 9, types: REPOSITORY) {
          nodes {
            ... on Repository {
              name description url
              primaryLanguage { name }
              repositoryTopics(first: 8) { nodes { topic { name } } }
              homepageUrl
              pushedAt
            }
          }
        }
      }
    }
  `;

  try {
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "User-Agent": "portfolio",
      },
      body: JSON.stringify({ query }),
      next: { revalidate: 3600 },
    });

    if (!res.ok) return null;

    const json = await res.json();
    const user = json.data?.user;
    if (!user) return null;

    const pinnedNodes = user.pinnedItems?.nodes ?? [];
    const repos: PinnedRepo[] = pinnedNodes.map((r: any) => ({
      name: r.name,
      description: r.description,
      url: r.url,
      language: r.primaryLanguage?.name ?? null,
      topics: r.repositoryTopics?.nodes?.map((t: any) => t.topic.name) ?? [],
      homepage: r.homepageUrl,
      pushedAt: r.pushedAt ?? null,
    }));

    return {
      avatarUrl: user.avatarUrl,
      totalContributions:
        user.contributionsCollection?.contributionCalendar
          ?.totalContributions ?? 2102,
      totalRepos: user.repositories?.totalCount ?? 229,
      weeks: user.contributionsCollection?.contributionCalendar?.weeks ?? [],
      repos,
    };
  } catch {
    return null;
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
};

export async function GitHubBentoSection(): Promise<React.ReactElement | null> {
  const data = await fetchGitHubData();
  if (!data) return null;

  // Filter out repos that are already featured as case studies
  const filteredRepos = data.repos.filter(
    (r) =>
      !FEATURED_SLUGS.has(r.name) &&
      !FEATURED_SLUGS.has(r.name.replace(/-/g, "").toLowerCase()),
  );

  const monthLabels: { label: string; weekIndex: number }[] = [];
  let lastMonth = -1;
  data.weeks.forEach((week, i) => {
    if (week.contributionDays[0]) {
      const m = new Date(week.contributionDays[0].date).getUTCMonth();
      if (m !== lastMonth) {
        monthLabels.push({
          label: new Date(week.contributionDays[0].date).toLocaleDateString(
            "en-US",
            { month: "short", timeZone: "UTC" },
          ),
          weekIndex: i,
        });
        lastMonth = m;
      }
    }
  });

  return (
    <section
      className="py-30 max-[720px]:py-18 relative max-w-(--maxw) mx-auto px-(--gutter)"
      id="open-source"
      aria-labelledby="bento-heading"
    >
      <div className="mb-16 max-[720px]:mb-10">
        <div>
          <h2
            id="bento-heading"
            className="m-0 font-display font-normal text-[clamp(44px,7vw,88px)] leading-[0.95] tracking-tight text-(--ink) text-balance fvs-display"
          >
            Activity
          </h2>
          <div className="max-w-[56ch] text-[17px] leading-[1.6] text-secondary-foreground mt-4.5">
            Real code in public: commit streaks, cryptographic implementations,
            and libraries built to scratch my own itch.
          </div>
        </div>
      </div>

      {/* GitHub Activity Card (Inspired by timidan.eth & live developer matrices) */}
      <div className="mb-10 rounded-2xl border border-(--rule) bg-(--paper) p-6 sm:p-8 shadow-[0_16px_40px_-12px_color-mix(in_oklab,var(--ink)_6%,transparent)]">
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-(--rule)">
          <div className="flex items-center gap-3.5">
            {data.avatarUrl && (
              <Image
                src={data.avatarUrl}
                alt="Michael Ojekunle"
                width={44}
                height={44}
                className="rounded-full border border-(--rule)"
                unoptimized
              />
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[14px] font-semibold text-(--ink)">
                  @michojekunle
                </span>
                <span className="font-mono text-[10px] tracking-wider uppercase px-2 py-0.5 rounded-full border border-(--rule) bg-(--bg-2) text-muted-foreground">
                  GitHub
                </span>
              </div>
              <div className="text-[13px] text-secondary-foreground mt-0.5">
                Software engineer &amp; builder · Systems &amp; AI
                infrastructure
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 font-mono text-[12px]">
            <div>
              <span className="text-[16px] font-semibold text-(--ink) block leading-tight">
                {data.totalRepos}
              </span>
              <span className="text-muted-foreground text-[11px] uppercase tracking-wider">
                Repos
              </span>
            </div>
            <div className="w-px h-7 bg-(--rule)" />
            <div>
              <span className="text-[16px] font-semibold text-(--v3-accent) block leading-tight">
                {data.totalContributions.toLocaleString()}
              </span>
              <span className="text-muted-foreground text-[11px] uppercase tracking-wider">
                Contributions (1 yr)
              </span>
            </div>
          </div>
        </div>

        {/* Contributions Matrix */}
        <div className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <span className="font-mono text-[13px] font-medium text-(--ink) flex items-center gap-2">
              <GitCommit className="w-4 h-4 text-(--v3-accent)" />
              <span>
                {data.totalContributions.toLocaleString()} contributions in the
                last year
              </span>
            </span>
            <div className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
              <span>Less</span>
              <span className="w-2.5 h-2.5 rounded-[2px] bg-(--bg-2) border border-(--rule)/40 inline-block" />
              <span className="w-2.5 h-2.5 rounded-[2px] bg-[color-mix(in_oklab,var(--v3-accent)_35%,var(--paper))] inline-block" />
              <span className="w-2.5 h-2.5 rounded-[2px] bg-[color-mix(in_oklab,var(--v3-accent)_70%,var(--paper))] inline-block" />
              <span className="w-2.5 h-2.5 rounded-[2px] bg-(--v3-accent) inline-block" />
              <span>More</span>
            </div>
          </div>

          {/* Matrix Scroll Wrapper */}
          <div className="overflow-x-auto pb-2 scrollbar-thin">
            {/* Month labels row */}
            <div className="flex gap-[3px] min-w-[720px] justify-between mb-1.5 font-mono text-[10px] text-muted-foreground select-none">
              {data.weeks.map((_, i) => {
                const label = monthLabels.find((ml) => ml.weekIndex === i);
                return (
                  <div key={i} className="w-[11px] shrink-0 text-left">
                    {label ? label.label : ""}
                  </div>
                );
              })}
            </div>
            <div className="flex gap-[3px] min-w-[720px] justify-between">
              {data.weeks.map((week, wIdx) => (
                <div key={wIdx} className="flex flex-col gap-[3px]">
                  {week.contributionDays.map((day) => {
                    const count = day.contributionCount;
                    let bg = "bg-(--bg-2) border border-(--rule)/40";
                    if (count > 0 && count <= 2) {
                      bg =
                        "bg-[color-mix(in_oklab,var(--v3-accent)_35%,var(--paper))]";
                    } else if (count > 2 && count <= 5) {
                      bg =
                        "bg-[color-mix(in_oklab,var(--v3-accent)_70%,var(--paper))]";
                    } else if (count > 5) {
                      bg = "bg-(--v3-accent)";
                    }

                    return (
                      <div
                        key={day.date}
                        className={`w-[11px] h-[11px] rounded-[2px] transition-transform hover:scale-125 ${bg}`}
                        title={`${day.date}: ${count} contribution${count !== 1 ? "s" : ""}`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Pinned Repositories with Recency Timestamps */}
      <div className="grid grid-cols-3 max-[920px]:grid-cols-2 max-[720px]:grid-cols-1 gap-4 mb-16">
        {filteredRepos.slice(0, 6).map((repo, i) => {
          const langColor =
            LANGUAGE_COLORS[repo.language ?? ""] ?? "var(--v3-accent)";
          const isWide = i === 0 || i === 4;

          return (
            <a
              key={repo.name}
              href={repo.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`group flex flex-col bg-(--paper) border border-(--rule) rounded-xl p-6 h-full no-underline text-inherit transition-all duration-200 relative overflow-hidden hover:border-(--v3-accent) hover:-translate-y-0.5 hover:shadow-[0_12px_24px_-12px_rgba(0,0,0,0.1)] ${isWide ? "col-span-2 max-[920px]:col-span-1" : ""}`}
              aria-label={`${repo.name} on GitHub`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="font-display font-normal text-[22px] text-(--ink) leading-[1.1] fvs-text group-hover:text-(--v3-accent) transition-colors">
                  {repo.name}
                </div>
                {repo.pushedAt && (
                  <span className="inline-flex items-center gap-1 font-mono text-[11px] text-muted-foreground whitespace-nowrap">
                    <Clock className="w-3 h-3 text-(--v3-accent)" />
                    {formatDistanceToNow(new Date(repo.pushedAt), {
                      addSuffix: true,
                    })}
                  </span>
                )}
              </div>

              {repo.description && (
                <p className="text-[14px] leading-[1.6] text-secondary-foreground mb-6 flex-[1] line-clamp-3 overflow-hidden">
                  {repo.description}
                </p>
              )}

              <div className="flex flex-wrap gap-2.5 items-center mt-auto pt-3 border-t border-(--rule)/50">
                {repo.language && (
                  <span className="flex items-center gap-1.5 font-mono text-[12px] text-muted-foreground">
                    <svg
                      className="w-2 h-2 shrink-0"
                      viewBox="0 0 8 8"
                      aria-hidden="true"
                    >
                      <circle cx="4" cy="4" r="4" fill={langColor} />
                    </svg>
                    {repo.language}
                  </span>
                )}
                {repo.topics.slice(0, 2).map((t) => (
                  <span
                    key={t}
                    className="font-mono text-[11px] px-2 py-0.5 rounded bg-(--bg-2) text-secondary-foreground border border-(--rule)/50"
                  >
                    {t}
                  </span>
                ))}
              </div>

              <div
                className="absolute top-5 right-5 text-(--v3-accent) opacity-0 -translate-x-1 translate-y-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0"
                aria-hidden="true"
              >
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </a>
          );
        })}
      </div>

      <div className="flex justify-center mt-12">
        <MagneticWrapper strength={20}>
          <a
            href={`https://github.com/${process.env.GITHUB_USERNAME ?? "michojekunle"}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full font-mono text-[12px] uppercase tracking-wider font-medium cursor-pointer border border-(--rule) bg-transparent text-(--ink) transition-all duration-200 no-underline hover:border-muted-foreground hover:bg-(--paper)"
          >
            All repos on GitHub{" "}
            <ArrowUpRight
              className="inline-block transition-transform duration-250 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 w-4 h-4"
              aria-hidden="true"
            />
          </a>
        </MagneticWrapper>
      </div>
    </section>
  );
}
