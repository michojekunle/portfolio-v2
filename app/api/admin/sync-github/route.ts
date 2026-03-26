import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { PinnedRepo } from "@/app/api/github/route";

// Build at call-time so the env var is always resolved at runtime, not module-load.
function buildQuery(username: string): string {
  return `
    query {
      user(login: "${username}") {
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
}

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

interface ExistingProject {
  id: string;
  github_url: string | null;
}

export async function POST(): Promise<Response> {
  const supabase = await createClient();

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

  const githubUsername = process.env.GITHUB_USERNAME ?? "michojekunle";

  try {
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: buildQuery(githubUsername) }),
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

    // Fetch existing github_url → id mapping instead of relying on a DB-level
    // UNIQUE constraint (error 42P10 if constraint doesn't exist).
    const { data: existing, error: fetchError } = await supabase
      .from("projects")
      .select("id, github_url")
      .not("github_url", "is", null);

    if (fetchError) {
      throw new Error(
        `Failed to fetch existing projects: ${fetchError.message}`
      );
    }

    const existingByUrl = new Map<string, string>(
      (existing as ExistingProject[]).map((p) => [
        p.github_url as string,
        p.id,
      ])
    );

    let inserted = 0;
    let updated = 0;

    for (const [index, repo] of repos.entries()) {
      const row = {
        title: repo.name,
        description: repo.description ?? "",
        github_url: repo.url,
        demo_url: repo.homepage ?? null,
        tags:
          repo.topics.length > 0
            ? repo.topics
            : repo.language
              ? [repo.language]
              : [],
        stars: repo.stars,
        language: repo.language,
        category: "featured",
        github_repo: `${githubUsername}/${repo.name}`,
        sort_order: index,
        updated_at: new Date().toISOString(),
      };

      const existingId = existingByUrl.get(repo.url);

      if (existingId) {
        const { error } = await supabase
          .from("projects")
          .update(row)
          .eq("id", existingId);
        if (error) {
          throw new Error(`Update failed for ${repo.name}: ${error.message}`);
        }
        updated++;
      } else {
        const { error } = await supabase.from("projects").insert(row);
        if (error) {
          throw new Error(`Insert failed for ${repo.name}: ${error.message}`);
        }
        inserted++;
      }
    }

    return NextResponse.json({
      success: true,
      synced: repos.length,
      inserted,
      updated,
    });
  } catch (error: unknown) {
    console.error("[sync-github] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Sync failed" },
      { status: 500 }
    );
  }
}
