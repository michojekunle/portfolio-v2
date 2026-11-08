import { NextResponse } from "next/server";

const QUERY = `
  query {
    user(login: "${process.env.GITHUB_USERNAME ?? "michojekunle"}") {
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
      pinnedItems(first: 6, types: REPOSITORY) {
        nodes {
          ... on Repository {
            name
            primaryLanguage { name, color }
            languages(first: 5, orderBy: {field: SIZE, direction: DESC}) {
              edges {
                size
                node {
                  name
                  color
                }
              }
            }
          }
        }
      }
    }
  }
`;

export async function GET(): Promise<Response> {
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    return NextResponse.json({ error: "GitHub token not configured" }, { status: 500 });
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

    if (!res.ok) throw new Error("Failed to fetch from GitHub API");

    const json = await res.json();
    if (json.errors) throw new Error(json.errors[0].message);

    const user = json.data.user;
    
    // 1. Parse contribution calendar for the last 7 days
    const weeks = user.contributionsCollection.contributionCalendar.weeks;
    // Flat map all days
    const allDays = weeks.flatMap((w: any) => w.contributionDays);
    // Get last 7 days
    const last7Days = allDays.slice(-7);
    
    const commitsThisWeek = last7Days.reduce((acc: number, day: any) => acc + day.contributionCount, 0);
    const activityData = last7Days.map((day: any) => day.contributionCount);
    
    // 2. Parse language stats from pinned repos
    const pinnedRepos = user.pinnedItems.nodes;
    const languageMap = new Map<string, { size: number, color: string, projects: number }>();
    
    for (const repo of pinnedRepos) {
      if (!repo.languages?.edges) continue;
      // Mark primary language count
      const primary = repo.primaryLanguage?.name;
      
      for (const edge of repo.languages.edges) {
        const lang = edge.node.name;
        const color = edge.node.color;
        const size = edge.size;
        
        const existing = languageMap.get(lang) || { size: 0, color, projects: 0 };
        existing.size += size;
        if (lang === primary) existing.projects += 1;
        
        languageMap.set(lang, existing);
      }
    }
    
    const sortedLangs = Array.from(languageMap.entries())
      .sort((a, b) => b[1].size - a[1].size)
      .slice(0, 5) // top 5
      .map(([name, data]) => {
        return {
          name,
          color: data.color || "#ccc",
          projects: data.projects,
          size: data.size
        };
      });
      
    // Calculate percentages for langs
    const totalSize = sortedLangs.reduce((acc, l) => acc + l.size, 0);
    const langsWithLevels = sortedLangs.map(l => ({
      name: l.name,
      color: l.color,
      projects: l.projects || 1, // Fallback if it's not a primary language for any pinned repo
      level: totalSize > 0 ? Math.round((l.size / totalSize) * 100) : 0,
      desc: `Primary language used across ${l.projects || 1} pinned repos.`
    }));

    return NextResponse.json({
      changelog: {
        commitsThisWeek,
        activityData,
        activeRepos: pinnedRepos.length,
        branch: "main"
      },
      languages: langsWithLevels
    }, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=300",
      },
    });

  } catch (error) {
    console.error("[github stats] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
