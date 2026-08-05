import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { redirect } from "next/navigation";

interface TableStat {
  label: string;
  count: number;
  countLabel?: string;
  lastUpdated: string | null;
  href: string;
  badge?: string;
  urgent?: boolean;
}

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(d.getDate()).padStart(2, "0")}`;
}

function StatGrid({
  title,
  stats,
}: {
  title: string;
  stats: TableStat[];
}): React.ReactElement {
  return (
    <div className="mt-10 first:mt-0">
      <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
        {title}
      </h2>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className={`rounded-lg border bg-card p-3 sm:p-6 hover:border-foreground/30 transition-colors group min-w-0 ${
              stat.urgent ? "border-foreground/40" : "border-border"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">{stat.label}</p>
                </div>
                {stat.badge && (
                  <span
                    className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] sm:text-xs font-medium mt-1 ${
                      stat.urgent
                        ? "bg-foreground text-background"
                        : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {stat.badge}
                  </span>
                )}
                <p className="text-xl sm:text-3xl font-semibold mt-1 tabular-nums leading-tight">
                  {stat.count}
                  {stat.countLabel && (
                    <span className="text-xs sm:text-sm font-normal text-muted-foreground ml-1">
                      {stat.countLabel}
                    </span>
                  )}
                </p>
                {stat.lastUpdated && (
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 sm:mt-2 truncate">
                    Updated {formatDistanceToNow(new Date(stat.lastUpdated))}{" "}
                    ago
                  </p>
                )}
              </div>
              <ArrowRight className="hidden sm:block h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-1 shrink-0" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
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
    { count: videoCount },
    { count: jobAppCount },
    { count: jobActiveCount },
    { count: messageCount },
    { count: unreadMessageCount },
    { count: subscriberCount },
    { data: rustDays },
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
    supabase.from("site_videos").select("*", { count: "exact", head: true }),
    supabase
      .from("job_applications")
      .select("*", { count: "exact", head: true }),
    supabase
      .from("job_applications")
      .select("*", { count: "exact", head: true })
      .in("status", ["toapply", "applied", "interviewing"]),
    supabase.from("messages").select("*", { count: "exact", head: true }),
    supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("read", false),
    supabase
      .from("email_subscribers")
      .select("*", { count: "exact", head: true }),
    supabase
      .from("rust_challenge_days")
      .select("day_number, challenge_date, completed"),
  ]);

  const rustRows = rustDays ?? [];
  const rustCompleted = rustRows.filter((r) => r.completed).length;
  const rustToday = rustRows.find((r) => r.challenge_date === todayStr());

  const contentStats: TableStat[] = [
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
      label: "Videos",
      count: videoCount ?? 0,
      lastUpdated: null,
      href: "/admin/videos",
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

  const opsStats: TableStat[] = [
    {
      label: "Job Applications",
      count: jobAppCount ?? 0,
      countLabel: "total",
      lastUpdated: null,
      href: "/admin/jobs",
      badge: jobActiveCount ? `${jobActiveCount} active` : undefined,
    },
    {
      label: "Rust Challenge",
      count: rustCompleted,
      countLabel: `/ ${rustRows.length || 180}`,
      lastUpdated: null,
      href: "/admin/rust-challenge",
      badge: rustToday
        ? rustToday.completed
          ? "today done"
          : `day ${rustToday.day_number} pending`
        : undefined,
      urgent: !!rustToday && !rustToday.completed,
    },
    {
      label: "Messages",
      count: messageCount ?? 0,
      countLabel: "total",
      lastUpdated: null,
      href: "/admin/messages",
      badge: unreadMessageCount ? `${unreadMessageCount} unread` : undefined,
      urgent: !!unreadMessageCount,
    },
    {
      label: "Newsletter",
      count: subscriberCount ?? 0,
      countLabel: "subscribers",
      lastUpdated: null,
      href: "/admin/newsletter",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Everything on the site, one click away
        </p>
      </div>

      <StatGrid title="Ops" stats={opsStats} />
      <StatGrid title="Content" stats={contentStats} />

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
            href="/admin/newsletter"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Compose newsletter
          </Link>
          <span className="text-muted-foreground/30">·</span>
          <Link
            href="/admin/rust-challenge"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Today's Rust target
          </Link>
          <span className="text-muted-foreground/30">·</span>
          <Link
            href="/"
            target="_blank"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            View site <ArrowUpRight className="inline w-3 h-3 ml-1" />
          </Link>
          <span className="text-muted-foreground/30">·</span>
          <Link
            href="/blog"
            target="_blank"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            View blog <ArrowUpRight className="inline w-3 h-3 ml-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}
