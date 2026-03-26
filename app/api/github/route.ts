import { NextResponse } from "next/server";

interface GitHubRepo {
  name: string;
  description: string | null;
  url: string;
  stargazerCount: number;
  primaryLanguage: { name: string } | null;
  repositoryTopics: { nodes: Array<{ topic: { name: string } }> };
  homepageUrl: string | null;
}

interface GitHubGraphQLResponse {
  data: {
    user: {
      pinnedItems: {
        nodes: GitHubRepo[];
      };
    };
  };
  errors?: Array<{ message: string }>;
}

export interface PinnedRepo {
  name: string;
  description: string | null;
  url: string;
  stars: number;
  language: string | null;
  topics: string[];
  homepage: string | null;
}

const QUERY = `
  query {
    user(login: "${process.env.GITHUB_USERNAME ?? "michojekunle"}") {
      pinnedItems(first: 6, types: REPOSITORY) {
        nodes {
          ... on Repository {
            name
            description
            url
            stargazerCount
            primaryLanguage { name }
            repositoryTopics(first: 10) { nodes { topic { name } } }
            homepageUrl
          }
        }
      }
    }
  }
`;

export async function GET(): Promise<Response> {
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    console.error("[github] GITHUB_TOKEN is not set");
    return NextResponse.json(
      { error: "GitHub token not configured" },
      { status: 500 }
    );
  }

  try {
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: QUERY }),
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      throw new Error(`GitHub API responded with ${res.status}`);
    }

    const json = (await res.json()) as GitHubGraphQLResponse;

    if (json.errors?.length) {
      throw new Error(json.errors[0].message);
    }

    const repos: PinnedRepo[] = json.data.user.pinnedItems.nodes.map(
      (repo) => ({
        name: repo.name,
        description: repo.description,
        url: repo.url,
        stars: repo.stargazerCount,
        language: repo.primaryLanguage?.name ?? null,
        topics: repo.repositoryTopics.nodes.map((t) => t.topic.name),
        homepage: repo.homepageUrl,
      })
    );

    return NextResponse.json(repos, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=300",
      },
    });
  } catch (error: unknown) {
    console.error("[github] Failed to fetch pinned repos:", error);
    return NextResponse.json(
      { error: "Failed to fetch GitHub repositories" },
      { status: 500 }
    );
  }
}
