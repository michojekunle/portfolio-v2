import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ArrowRight } from "lucide-react";
import { redirect } from "next/navigation";

interface TableStat {
  label: string;
  count: number;
  lastUpdated: string | null;
  href: string;
}

export default async function AdminDashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const [
    { count: blogCount, data: latestBlog },
    { count: projectCount, data: latestProject },
    { count: bookCount, data: latestBook },
    { count: learningCount },
    { count: buildingCount, data: latestBuilding },
  ] = await Promise.all([
    supabase
      .from("blog_posts")
      .select("updated_at", { count: "exact" })
      .order("updated_at", { ascending: false })
      .limit(1),
    supabase
      .from("projects")
      .select("updated_at", { count: "exact" })
      .order("updated_at", { ascending: false })
      .limit(1),
    supabase
      .from("books")
      .select("updated_at", { count: "exact" })
      .order("updated_at", { ascending: false })
      .limit(1),
    supabase.from("learning_items").select("*", { count: "exact", head: true }),
    supabase
      .from("building_projects")
      .select("updated_at", { count: "exact" })
      .order("updated_at", { ascending: false })
      .limit(1),
  ]);

  const stats: TableStat[] = [
    {
      label: "Blog Posts",
      count: blogCount ?? 0,
      lastUpdated: latestBlog?.[0]?.updated_at ?? null,
      href: "/admin/blog",
    },
    {
      label: "Projects",
      count: projectCount ?? 0,
      lastUpdated: latestProject?.[0]?.updated_at ?? null,
      href: "/admin/projects",
    },
    {
      label: "Books",
      count: bookCount ?? 0,
      lastUpdated: latestBook?.[0]?.updated_at ?? null,
      href: "/admin/now",
    },
    {
      label: "Learning Items",
      count: learningCount ?? 0,
      lastUpdated: null,
      href: "/admin/now",
    },
    {
      label: "Building Projects",
      count: buildingCount ?? 0,
      lastUpdated: latestBuilding?.[0]?.updated_at ?? null,
      href: "/admin/now",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Overview of your portfolio content
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="content-card hover:border-foreground/20 transition-colors group"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-3xl font-semibold mt-1 tabular-nums">
                  {stat.count}
                </p>
                {stat.lastUpdated && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Updated {formatDistanceToNow(new Date(stat.lastUpdated))}{" "}
                    ago
                  </p>
                )}
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-10 content-card">
        <h2 className="text-sm font-medium mb-3">Quick links</h2>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/blog/new"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            + New blog post
          </Link>
          <span className="text-muted-foreground/30">·</span>
          <Link
            href="/admin/projects"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Sync GitHub repos
          </Link>
          <span className="text-muted-foreground/30">·</span>
          <Link
            href="/"
            target="_blank"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            View site ↗
          </Link>
          <span className="text-muted-foreground/30">·</span>
          <Link
            href="/blog"
            target="_blank"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            View blog ↗
          </Link>
        </div>
      </div>
    </div>
  );
}
