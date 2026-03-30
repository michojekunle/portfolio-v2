import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import Link from "next/link";
import { ArrowLeft, GitCommit, ExternalLink } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

export const metadata: Metadata = {
  title: "Changelog",
  description:
    "Recent development activity and commits across Michael Ojekunle's projects.",
};

export const revalidate = 1800;

interface CommitNode {
  message: string;
  committedDate: string;
  url: string;
  abbreviatedOid: string;
}

interface RepoNode {
  name: string;
  url: string;
  defaultBranchRef: {
    target: {
      history: {
        nodes: CommitNode[];
      };
    };
  } | null;
}

interface GitHubResponse {
  data: {
    user: {
      repositories: {
        nodes: RepoNode[];
      };
    };
  };
  errors?: Array<{ message: string }>;
}

interface ChangelogEntry {
  repo: string;
  repoUrl: string;
  message: string;
  date: string;
  url: string;
  sha: string;
}

async function fetchChangelog(): Promise<ChangelogEntry[]> {
  const token = process.env.GITHUB_TOKEN;
  const username = process.env.GITHUB_USERNAME ?? "michojekunle";

  if (!token) return [];

  const query = `
    query {
      user(login: "${username}") {
        repositories(first: 10, orderBy: {field: PUSHED_AT, direction: DESC}, privacy: PUBLIC) {
          nodes {
            name
            url
            defaultBranchRef {
              target {
                ... on Commit {
                  history(first: 5) {
                    nodes {
                      message
                      committedDate
                      url
                      abbreviatedOid
                    }
                  }
                }
              }
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
      },
      body: JSON.stringify({ query }),
      next: { revalidate: 1800 },
    });

    if (!res.ok) return [];

    const json = (await res.json()) as GitHubResponse;
    if (json.errors?.length) return [];

    const entries: ChangelogEntry[] = [];
    for (const repo of json.data.user.repositories.nodes) {
      const commits = repo.defaultBranchRef?.target?.history?.nodes ?? [];
      for (const commit of commits) {
        entries.push({
          repo: repo.name,
          repoUrl: repo.url,
          message: commit.message.split("\n")[0],
          date: commit.committedDate,
          url: commit.url,
          sha: commit.abbreviatedOid,
        });
      }
    }

    // Sort all by date descending
    entries.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return entries.slice(0, 50);
  } catch {
    return [];
  }
}

function groupByDate(
  entries: ChangelogEntry[]
): Map<string, ChangelogEntry[]> {
  const groups = new Map<string, ChangelogEntry[]>();
  for (const entry of entries) {
    const key = format(new Date(entry.date), "yyyy-MM-dd");
    const group = groups.get(key) ?? [];
    group.push(entry);
    groups.set(key, group);
  }
  return groups;
}

export default async function ChangelogPage(): Promise<React.ReactElement> {
  const entries = await fetchChangelog();
  const grouped = groupByDate(entries);

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-20 px-6 max-w-2xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-10 no-underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Home
        </Link>

        <div className="mb-12">
          <h1 className="text-3xl font-semibold tracking-tight mb-2">
            Changelog
          </h1>
          <p className="text-muted-foreground">
            Recent development activity across my open-source projects.
          </p>
        </div>

        {entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No activity to show. Check back later.
          </p>
        ) : (
          <div className="space-y-10">
            {[...grouped.entries()].map(([dateKey, dayEntries]) => (
              <section key={dateKey}>
                <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4 sticky top-20 bg-background/80 backdrop-blur-sm py-1 z-10">
                  {format(new Date(dateKey), "EEEE, MMMM d, yyyy")}
                </h2>
                <div className="space-y-0 border-l border-border/60 pl-6 ml-1">
                  {dayEntries.map((entry) => (
                    <div
                      key={entry.url}
                      className="relative pb-5 last:pb-0"
                    >
                      {/* Timeline dot */}
                      <div className="absolute -left-[29px] top-1 w-2 h-2 rounded-full bg-border" />

                      <div className="flex items-start gap-2">
                        <GitCommit className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0 mt-0.5" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm leading-relaxed">
                            {entry.message}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground/60">
                            <a
                              href={entry.repoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-foreground transition-colors font-medium"
                            >
                              {entry.repo}
                            </a>
                            <span>·</span>
                            <a
                              href={entry.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-mono hover:text-foreground transition-colors inline-flex items-center gap-1"
                            >
                              {entry.sha}
                              <ExternalLink className="h-2.5 w-2.5" />
                            </a>
                            <span>·</span>
                            <span>
                              {formatDistanceToNow(new Date(entry.date), {
                                addSuffix: true,
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
      <div className="max-w-2xl mx-auto px-6">
        <Footer />
      </div>
    </>
  );
}
