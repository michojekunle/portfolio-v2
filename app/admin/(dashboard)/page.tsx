import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  ArrowUpRight,
  Flame,
  Briefcase,
  Mail,
  Users,
  PenTool,
  Code2,
  BookOpen,
  MonitorPlay,
  Hammer,
  GraduationCap
} from "lucide-react";
import { redirect } from "next/navigation";

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(d.getDate()).padStart(2, "0")}`;
}

// Abstract SVG patterns for visual flair
const GridPattern = () => (
  <svg className="absolute inset-0 w-full h-full opacity-[0.03] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="grid-pattern" width="24" height="24" patternUnits="userSpaceOnUse">
        <path d="M 24 0 L 0 0 0 24" fill="none" stroke="currentColor" strokeWidth="1" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#grid-pattern)" />
  </svg>
);

const Sparkline = ({ active }: { active: boolean }) => (
  <svg className={`absolute right-0 bottom-0 w-32 h-16 opacity-10 transition-opacity duration-700 ${active ? 'opacity-30' : ''} pointer-events-none`} viewBox="0 0 100 50" preserveAspectRatio="none">
    <path d="M0 50 C 20 40, 40 10, 60 30 S 80 10, 100 20 L 100 50 Z" fill="currentColor" />
  </svg>
);

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
    { count: projectCount },
    { count: bookCount },
    { count: learningCount },
    { count: buildingCount },
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
    supabase.from("projects").select("*", { count: "exact", head: true }),
    supabase.from("books").select("*", { count: "exact", head: true }),
    supabase.from("learning_items").select("*", { count: "exact", head: true }),
    supabase.from("building_projects").select("*", { count: "exact", head: true }),
    supabase.from("site_videos").select("*", { count: "exact", head: true }),
    supabase.from("job_applications").select("*", { count: "exact", head: true }),
    supabase
      .from("job_applications")
      .select("*", { count: "exact", head: true })
      .in("status", ["toapply", "applied", "interviewing"]),
    supabase.from("messages").select("*", { count: "exact", head: true }),
    supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("read", false),
    supabase.from("email_subscribers").select("*", { count: "exact", head: true }),
    supabase
      .from("rust_challenge_days")
      .select("day_number, challenge_date, completed, rust_completed, dsa_completed, frontend_completed, system_design_completed")
      .order("day_number", { ascending: true }),
  ]);

  const rustRows = (rustDays ?? []).map((r: any) => ({
    ...r,
    isActive: Boolean(r.completed || r.rust_completed || r.dsa_completed || r.frontend_completed || r.system_design_completed),
  }));
  const rustCompleted = rustRows.filter((r) => r.completed).length;
  const nextPending = rustRows.find((r: any) => !r.completed);
  const rustProgress = rustRows.length > 0 ? Math.round((rustCompleted / rustRows.length) * 100) : 0;
  
  // Calculate Sequential Non-Breaking Streak
  let streak = 0;
  for (const r of rustRows) {
    if (r.isActive) {
      streak++;
    } else {
      break;
    }
  }

  // Base card class for glassmorphism, subtle borders, and smooth hover lifts
  const cardBaseClass = "group relative overflow-hidden rounded-2xl bg-card/40 backdrop-blur-xl border border-border/40 hover:border-border/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.1)] transition-all duration-300 ease-out hover:-translate-y-[2px] p-5 sm:p-6 flex flex-col";

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6">
      <div className="mb-10 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground/90">Welcome back.</h1>
          <p className="text-sm text-muted-foreground mt-1.5 font-medium tracking-wide">COMMAND CENTER</p>
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <Link href="/" target="_blank" className="text-xs text-muted-foreground hover:text-foreground flex items-center transition-colors">
            View Site <ArrowUpRight className="ml-1 w-3.5 h-3.5" strokeWidth={1.5} />
          </Link>
          <div className="w-px h-3 bg-border/60" />
          <Link href="/admin/blog/new" className="text-xs bg-foreground text-background font-medium px-3 py-1.5 rounded-full hover:bg-foreground/90 transition-colors">
            + New Post
          </Link>
        </div>
      </div>

      {/* Bento Box Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[minmax(160px,auto)]">
        
        {/* HERO: Rust Challenge (2x2) */}
        <Link href="/admin/rust-challenge" className={`col-span-1 sm:col-span-2 lg:col-span-2 lg:row-span-2 ${cardBaseClass}`}>
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <GridPattern />
          <div className="relative flex justify-between items-start mb-auto">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500 border border-orange-500/20">
                <Flame className="w-5 h-5" strokeWidth={1.5} />
              </div>
              <span className="text-sm font-medium tracking-wide text-foreground/80">Rust Challenge</span>
            </div>
            {nextPending && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-medium bg-orange-500/20 text-orange-400 border border-orange-500/30">
                Day {nextPending.day_number} Active
              </span>
            )}
          </div>
          <div className="relative mt-8">
            <div className="flex items-baseline gap-2">
              <span className="text-6xl tracking-tighter font-semibold text-foreground/90">{streak}</span>
              <span className="text-lg text-muted-foreground font-medium uppercase tracking-wider">Day Streak</span>
            </div>
            <div className="mt-6">
              <div className="flex justify-between text-xs text-muted-foreground mb-2 font-medium">
                <span>{rustProgress}% Completed</span>
                <span className="tabular-nums">{rustCompleted} / {rustRows.length || 180}</span>
              </div>
              <div className="h-1.5 w-full bg-muted/50 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-orange-500/80 rounded-full relative"
                  style={{ width: `${rustProgress}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20" />
                </div>
              </div>
            </div>
          </div>
          <ArrowUpRight className="absolute top-6 right-6 w-5 h-5 text-muted-foreground/30 group-hover:text-foreground/70 transition-colors" strokeWidth={1.5} />
        </Link>

        {/* HERO: Job Applications (1x2 on Desktop) */}
        <Link href="/admin/jobs" className={`col-span-1 lg:col-span-1 lg:row-span-2 ${cardBaseClass}`}>
          <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <Sparkline active={!!jobActiveCount} />
          <div className="relative flex justify-between items-start mb-auto">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400 border border-blue-500/20">
              <Briefcase className="w-4 h-4" strokeWidth={1.5} />
            </div>
            {jobActiveCount ? (
              <span className="inline-flex items-center px-2 py-1 rounded text-[10px] font-medium bg-blue-500 text-white">
                {jobActiveCount} Active
              </span>
            ) : null}
          </div>
          <div className="relative mt-8">
            <span className="text-4xl tracking-tighter font-semibold text-foreground/90">{jobAppCount ?? 0}</span>
            <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider font-medium">Total Apps</p>
          </div>
        </Link>

        {/* Messages */}
        <Link href="/admin/messages" className={`col-span-1 ${cardBaseClass}`}>
          <div className="relative flex justify-between items-start mb-auto">
            <div className="p-2 bg-zinc-500/10 rounded-lg text-zinc-400 border border-zinc-500/20 group-hover:text-zinc-200 transition-colors">
              <Mail className="w-4 h-4" strokeWidth={1.5} />
            </div>
            {unreadMessageCount ? (
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            ) : null}
          </div>
          <div className="relative mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl tracking-tighter font-semibold text-foreground/90">{messageCount ?? 0}</span>
              {unreadMessageCount ? (
                 <span className="text-xs text-red-400 font-medium">{unreadMessageCount} new</span>
              ) : null}
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wider font-medium">Messages</p>
          </div>
        </Link>

        {/* Newsletter */}
        <Link href="/admin/newsletter" className={`col-span-1 ${cardBaseClass}`}>
          <div className="relative flex justify-between items-start mb-auto">
            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400 border border-indigo-500/20 group-hover:text-indigo-300 transition-colors">
              <Users className="w-4 h-4" strokeWidth={1.5} />
            </div>
          </div>
          <div className="relative mt-4">
            <span className="text-3xl tracking-tighter font-semibold text-foreground/90">{subscriberCount ?? 0}</span>
            <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wider font-medium">Subscribers</p>
          </div>
        </Link>

        {/* Blog Posts */}
        <Link href="/admin/blog" className={`col-span-1 ${cardBaseClass}`}>
          <div className="relative flex justify-between items-start mb-auto">
            <div className="p-2 bg-zinc-500/10 rounded-lg text-zinc-400 border border-zinc-500/20 group-hover:text-zinc-200 transition-colors">
              <PenTool className="w-4 h-4" strokeWidth={1.5} />
            </div>
          </div>
          <div className="relative mt-4">
            <span className="text-3xl tracking-tighter font-semibold text-foreground/90">{blogCount ?? 0}</span>
            <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wider font-medium">Blog Posts</p>
            {latestBlog?.[0]?.updated_at && (
              <p className="text-[10px] text-muted-foreground/60 mt-2 truncate">Updated {formatDistanceToNow(new Date(latestBlog[0].updated_at))} ago</p>
            )}
          </div>
        </Link>

        {/* Projects */}
        <Link href="/admin/projects" className={`col-span-1 ${cardBaseClass}`}>
          <div className="relative flex justify-between items-start mb-auto">
            <div className="p-2 bg-zinc-500/10 rounded-lg text-zinc-400 border border-zinc-500/20 group-hover:text-zinc-200 transition-colors">
              <Code2 className="w-4 h-4" strokeWidth={1.5} />
            </div>
          </div>
          <div className="relative mt-4">
            <span className="text-3xl tracking-tighter font-semibold text-foreground/90">{projectCount ?? 0}</span>
            <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wider font-medium">Projects</p>
          </div>
        </Link>

        {/* Learning & Building (2 col span on large) */}
        <Link href="/admin/now" className={`col-span-1 sm:col-span-2 lg:col-span-2 ${cardBaseClass} sm:flex-row sm:items-center justify-between`}>
           <div className="flex flex-col sm:flex-row gap-6 sm:gap-12 w-full">
              {/* Books */}
              <div className="flex-1">
                 <div className="flex items-center gap-2 mb-3">
                    <BookOpen className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.5} />
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Reading</span>
                 </div>
                 <span className="text-2xl tracking-tight font-semibold text-foreground/90">{bookCount ?? 0}</span>
              </div>
              
              <div className="hidden sm:block w-px bg-border/50" />
              
              {/* Building */}
              <div className="flex-1">
                 <div className="flex items-center gap-2 mb-3">
                    <Hammer className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.5} />
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Building</span>
                 </div>
                 <span className="text-2xl tracking-tight font-semibold text-foreground/90">{buildingCount ?? 0}</span>
              </div>
              
              <div className="hidden sm:block w-px bg-border/50" />
              
              {/* Learning */}
              <div className="flex-1">
                 <div className="flex items-center gap-2 mb-3">
                    <GraduationCap className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.5} />
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Learning</span>
                 </div>
                 <span className="text-2xl tracking-tight font-semibold text-foreground/90">{learningCount ?? 0}</span>
              </div>
           </div>
           <ArrowUpRight className="hidden sm:block absolute top-6 right-6 w-5 h-5 text-muted-foreground/30 group-hover:text-foreground/70 transition-colors" strokeWidth={1.5} />
        </Link>
        
        {/* Videos */}
        <Link href="/admin/videos" className={`col-span-1 sm:col-span-2 lg:col-span-2 ${cardBaseClass}`}>
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative flex justify-between items-center h-full">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-purple-500/10 rounded-md text-purple-400 border border-purple-500/20">
                  <MonitorPlay className="w-3.5 h-3.5" strokeWidth={1.5} />
                </div>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Videos Published</span>
              </div>
              <span className="text-3xl tracking-tighter font-semibold text-foreground/90">{videoCount ?? 0}</span>
            </div>
            <ArrowUpRight className="w-5 h-5 text-muted-foreground/30 group-hover:text-foreground/70 transition-colors" strokeWidth={1.5} />
          </div>
        </Link>

      </div>
    </div>
  );
}
