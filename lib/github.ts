interface GitHubCommit {
  sha: string;
  message: string;
  date: string;
  url: string;
}

interface GitHubCommitResponse {
  sha: string;
  commit: {
    message: string;
    author: {
      date: string;
    };
  };
  html_url: string;
}

/**
 * Extract owner/repo from a GitHub URL.
 * e.g. "https://github.com/michojekunle/portfolio-v2" → "michojekunle/portfolio-v2"
 */
function parseGitHubUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== "github.com") return null;
    const parts = parsed.pathname.split("/").filter(Boolean);
    if (parts.length < 2) return null;
    return `${parts[0]}/${parts[1]}`;
  } catch {
    return null;
  }
}

/**
 * Fetch latest commits for a GitHub repo.
 * Returns up to `count` commits. Fails silently with empty array.
 */
export async function fetchLatestCommits(
  githubUrl: string,
  count: number = 3
): Promise<GitHubCommit[]> {
  const repo = parseGitHubUrl(githubUrl);
  if (!repo) return [];

  const token = process.env.GITHUB_TOKEN;
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const res = await fetch(
      `https://api.github.com/repos/${repo}/commits?per_page=${count}`,
      {
        headers,
        next: { revalidate: 1800 },
      }
    );

    if (!res.ok) return [];

    const data = (await res.json()) as GitHubCommitResponse[];
    return data.map((c) => ({
      sha: c.sha.slice(0, 7),
      message: c.commit.message.split("\n")[0],
      date: c.commit.author.date,
      url: c.html_url,
    }));
  } catch {
    return [];
  }
}

/**
 * Fetch latest commits for multiple repos in parallel.
 * Returns a Map of github_url → commits.
 */
export async function fetchCommitsForProjects(
  githubUrls: string[],
  commitsPerRepo: number = 3
): Promise<Map<string, GitHubCommit[]>> {
  const results = await Promise.all(
    githubUrls.map(async (url) => {
      const commits = await fetchLatestCommits(url, commitsPerRepo);
      return [url, commits] as const;
    })
  );
  return new Map(results);
}

/**
 * Fetch the first image URL from a GitHub repo's README.
 * Returns null if no image found or fetch fails.
 */
export async function fetchReadmeImage(
  githubUrl: string
): Promise<string | null> {
  const repo = parseGitHubUrl(githubUrl);
  if (!repo) return null;

  const token = process.env.GITHUB_TOKEN;
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const res = await fetch(
      `https://api.github.com/repos/${repo}/readme`,
      { headers }
    );
    if (!res.ok) return null;

    const data = (await res.json()) as { content: string; encoding: string };
    if (data.encoding !== "base64") return null;

    const readme = Buffer.from(data.content, "base64").toString("utf-8");

    // Match markdown image: ![alt](url) — take the first one
    const mdMatch = readme.match(/!\[.*?\]\((https?:\/\/[^\s)]+)\)/);
    if (mdMatch) return mdMatch[1];

    // Match HTML img: <img ... src="url" ...>
    const htmlMatch = readme.match(/<img[^>]+src=["'](https?:\/\/[^\s"']+)["']/i);
    if (htmlMatch) return htmlMatch[1];

    // Match raw image URLs on their own line (common for header banners)
    const rawMatch = readme.match(
      /^(https?:\/\/[^\s]+\.(?:png|jpg|jpeg|gif|svg|webp))/im
    );
    if (rawMatch) return rawMatch[1];

    return null;
  } catch {
    return null;
  }
}
