import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { PinnedRepo } from "@/app/api/github/route";

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

interface GitHubGraphQLResponse {
  data: {
    user: {
      pinnedItems: {
        nodes: Array<{
          name: string;
          description: string | null;
          url: string;
          stargazerCount: number;
          primaryLanguage: { name: string } | null;
          repositoryTopics: { nodes: Array<{ topic: { name: string } }> };
          homepageUrl: string | null;
        }>;
      };
    };
  };
  errors?: Array<{ message: string }>;
}

export async function POST(): Promise<Response> {
  const supabase = await createClient();

  // Verify authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "GITHUB_TOKEN not configured" },
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

    // Upsert into projects table by github_url
    const upsertData = repos.map((repo, index) => ({
      title: repo.name,
      description: repo.description ?? "",
      github_url: repo.url,
      demo_url: repo.homepage ?? null,
      tags: repo.topics.length > 0 ? repo.topics : (repo.language ? [repo.language] : []),
      stars: repo.stars,
      language: repo.language,
      category: "featured",
      github_repo: `${process.env.GITHUB_USERNAME ?? "michojekunle"}/${repo.name}`,
      sort_order: index,
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase
      .from("projects")
      .upsert(upsertData, { onConflict: "github_url" });

    if (error) {
      console.error("[sync-github] Supabase upsert error:", error);
      throw new Error(error.message);
    }

    return NextResponse.json({
      success: true,
      synced: repos.length,
    });
  } catch (error: unknown) {
    console.error("[sync-github] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Sync failed",
      },
      { status: 500 }
    );
  }
}
