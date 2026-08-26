"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Home,
  FileText,
  FolderOpen,
  User,
  Mail,
  BookOpen,
  Wrench,
  MessageSquare,
  Rss,
  Sun,
  Moon,
  Github,
  Twitter,
  Activity,
  Youtube,
  Instagram,
  Video,
  Library,
} from "lucide-react";
import { useTheme } from "next-themes";
import { createClient } from "@/lib/supabase/client";

interface CommandAction {
  label: string;
  icon: React.ReactNode;
  action: () => void;
  group: string;
  keywords?: string;
}

export function CommandPalette(): React.ReactElement {
  const [open, setOpen] = useState(false);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [books, setBooks] = useState<any[]>([]);
  const router = useRouter();
  const { setTheme, theme } = useTheme();

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();

      const { data: blogData } = await supabase
        .from("blog_posts")
        .select("id, title, slug, category")
        .eq("published", true)
        .order("published_at", { ascending: false });

      const { data: projectData } = await supabase
        .from("projects")
        .select("id, title, category, tags, description")
        .eq("is_hidden", false)
        .order("sort_order", { ascending: true });

      const { data: bookData } = await supabase
        .from("books")
        .select("id, title, author, status")
        .in("status", ["reading", "completed"])
        .order("sort_order", { ascending: true });

      if (blogData) setBlogs(blogData);
      if (projectData) setProjects(projectData);
      if (bookData) setBooks(bookData);
    };

    fetchData();
  }, []);

  const navigate = useCallback(
    (path: string): void => {
      setOpen(false);

      // Handle external links immediately
      if (path.startsWith("http")) {
        window.open(path, "_blank", "noopener,noreferrer");
        return;
      }

      // Small delay to allow the CommandDialog to close and release scroll-lock
      setTimeout(() => {
        if (path.startsWith("#")) {
          const id = path.substring(1);
          if (window.location.pathname !== "/") {
            router.push(`/${path}`);
          } else {
            const element = document.getElementById(id);
            if (element) {
              element.scrollIntoView({ behavior: "smooth" });
            }
          }
        } else if (path.startsWith("project-")) {
          const projectId = path.replace("project-", "");
          const project = projects.find((p) => p.id === projectId);

          if (window.location.pathname !== "/") {
            router.push(`/?project=${projectId}#projects`);
          } else if (project) {
            // 1. Switch the tab first
            window.dispatchEvent(
              new CustomEvent("switch-project-tab", {
                detail: { category: project.category },
              })
            );

            // 2. Wait for the tab to mount and animation to allow IDs to be found
            setTimeout(() => {
              const element = document.getElementById(path);
              if (element) {
                element.scrollIntoView({ behavior: "smooth", block: "center" });
                element.classList.add("ring-2", "ring-primary", "ring-offset-4");
                setTimeout(
                  () =>
                    element.classList.remove(
                      "ring-2",
                      "ring-primary",
                      "ring-offset-4"
                    ),
                  2000
                );
              }
            }, 300); // 300ms matches the delay in ProjectsTabs for query param handling
          }
        } else {
          router.push(path);
        }
      }, 150); // 150ms allows the dialog closing animation to finish
    },
    [router, projects]
  );

  const actions: CommandAction[] = [
    // Navigation
    { label: "Home", icon: <Home className="h-4 w-4" />, action: () => navigate("/"), group: "Navigation" },
    { label: "About", icon: <User className="h-4 w-4" />, action: () => navigate("#about"), group: "Navigation" },
    { label: "Projects", icon: <FolderOpen className="h-4 w-4" />, action: () => navigate("#projects"), group: "Navigation" },
    { label: "Blog", icon: <FileText className="h-4 w-4" />, action: () => navigate("/blog"), group: "Navigation" },
    { label: "Now", icon: <Activity className="h-4 w-4" />, action: () => navigate("#now"), group: "Navigation" },
    { label: "Contact", icon: <Mail className="h-4 w-4" />, action: () => navigate("#contact"), group: "Navigation" },

    // Dynamic Projects
    ...projects.map(p => ({
      label: p.title,
      icon: <FolderOpen className="h-4 w-4 text-primary/60" />,
      action: () => navigate(`project-${p.id}`),
      group: "Projects",
      keywords: `${p.category} ${p.tags?.join(" ") || ""} ${p.description || ""}`
    })),

    // Dynamic Blogs
    ...blogs.map(b => ({
      label: b.title,
      icon: <FileText className="h-4 w-4 text-primary/60" />,
      action: () => navigate(`/blog/${b.slug}`),
      group: "Blog Posts",
      keywords: b.category
    })),

    // Dynamic Books (Reading Log)
    ...books.map(b => ({
      label: b.title,
      icon: <Library className="h-4 w-4 text-primary/60" />,
      action: () => navigate(`/reading/${b.id}`),
      group: "Reading Log",
      keywords: `${b.author} ${b.status === "reading" ? "currently reading" : "finished"}`
    })),

    // Static Uses (Tools & Gear)
    ...[
      { name: "VS Code", desc: "Primary editor. Vim keybindings, minimal extensions." },
      { name: "Antigravity", desc: "AI-augmented editor for rapid prototyping." },
      { name: "Claude Code", desc: "AI coding assistant from Anthropic." },
      { name: "TypeScript + Next.js", desc: "Default stack for production web apps." },
      { name: "Solidity", desc: "Smart contracts for EVM-compatible chains." },
      { name: "Cairo", desc: "StarkNet smart contracts. Provable computation." },
      { name: "Rust", desc: "Systems programming and blockchain infra." },
      { name: "Vercel", desc: "Deployment platform for web apps." },
      { name: "Supabase", desc: "Postgres database and backend-as-a-service." },
      { name: "Figma", desc: "UI/UX design and prototyping." },
      { name: "MacBook Pro", desc: "Primary development machine." },
    ].map(u => ({
      label: u.name,
      icon: <Wrench className="h-4 w-4 text-primary/60" />,
      action: () => navigate("/uses"),
      group: "Uses & Gear",
      keywords: u.desc
    })),

    // Creator Suite Tools
    ...[
      { name: "Explore Creator Suite", desc: "Explore the live tools and productivity apps.", href: "/tools" },
      { name: "BookBreaks Summary Generator", desc: "AI summary generator that turns books into structured content.", href: "/tools/bookbreaks" },
      { name: "Chapterly E-Reader", desc: "Speed reader, AI companion chats, and comprehension checks.", href: "/tools/chapterly" },
      { name: "Flowise Finance OS", desc: "Budgeting, expense tracking, mobile money movement, and analytics.", href: "/tools/flowise" },
      { name: "Vela Daily Log Journal", desc: "Daily reflection, bullet list planning, and mindfulness prompts.", href: "/tools/journal" },
      { name: "Carousel Lab Creator", desc: "Design multi-page visual carousels for LinkedIn and Twitter.", href: "/tools/carousel-lab" },
    ].map(t => ({
      label: t.name,
      icon: <Wrench className="h-4 w-4 text-primary/60" />,
      action: () => navigate(t.href),
      group: "Creator Suite Tools",
      keywords: t.desc
    })),

    // Pages
    { label: "Tools", icon: <Wrench className="h-4 w-4" />, action: () => navigate("/tools"), group: "Pages", keywords: "creator suite productivity apps" },
    { label: "Uses", icon: <Wrench className="h-4 w-4" />, action: () => navigate("/uses"), group: "Pages", keywords: "tools setup hardware software" },
    { label: "Guestbook", icon: <MessageSquare className="h-4 w-4" />, action: () => navigate("/guestbook"), group: "Pages", keywords: "sign message" },
    { label: "Changelog", icon: <BookOpen className="h-4 w-4" />, action: () => navigate("/changelog"), group: "Pages", keywords: "activity updates commits" },
    { label: "RSS Feed", icon: <Rss className="h-4 w-4" />, action: () => navigate("/feed.xml"), group: "Pages" },
    { label: "Videos", icon: <Video className="h-4 w-4" />, action: () => navigate("/videos"), group: "Pages", keywords: "youtube instagram tiktok x watch" },
    { label: "Reading Log", icon: <Library className="h-4 w-4" />, action: () => navigate("/reading"), group: "Pages", keywords: "books notes quotes takeaways" },

    // Theme
    {
      label: "Switch to Light Mode",
      icon: <Sun className="h-4 w-4" />,
      action: () => { setTheme("light"); setOpen(false); },
      group: "Theme",
      keywords: "theme appearance bright",
    },
    {
      label: "Switch to Dark Mode",
      icon: <Moon className="h-4 w-4" />,
      action: () => { setTheme("dark"); setOpen(false); },
      group: "Theme",
      keywords: "theme appearance",
    },

    // Social
    { label: "GitHub", icon: <Github className="h-4 w-4" />, action: () => navigate("https://github.com/michojekunle"), group: "Social" },
    { label: "Twitter / X", icon: <Twitter className="h-4 w-4" />, action: () => navigate("https://x.com/devvmichael"), group: "Social" },
    { label: "YouTube", icon: <Youtube className="h-4 w-4" />, action: () => navigate("https://www.youtube.com/@devvmichael"), group: "Social" },
    { label: "Instagram", icon: <Instagram className="h-4 w-4" />, action: () => navigate("https://instagram.com/devvmichaell/"), group: "Social" },
  ];

  // Filter out current theme option
  const filteredActions = actions.filter((a) => {
    if (a.label === "Switch to Light Mode" && theme === "light") return false;
    if (a.label === "Switch to Dark Mode" && theme === "dark") return false;
    return true;
  });

  const groups = [...new Set(filteredActions.map((a) => a.group))];

  useEffect(() => {
    const down = (e: KeyboardEvent): void => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search everything (blogs, projects, pages)..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {groups.map((group, i) => (
          <div key={group}>
            {i > 0 && <CommandSeparator />}
            <CommandGroup heading={group}>
              {filteredActions
                .filter((a) => a.group === group)
                .map((action, idx) => (
                  <CommandItem
                    key={`${action.group}-${action.label}-${idx}`}
                    onSelect={action.action}
                    keywords={action.keywords ? [action.keywords] : undefined}
                  >
                    {action.icon}
                    <span className="ml-2">{action.label}</span>
                  </CommandItem>
                ))}
            </CommandGroup>
          </div>
        ))}
      </CommandList>
    </CommandDialog>
  );
}

export function CommandPaletteTrigger(): React.ReactElement {
  return (
    <button
      onClick={() =>
        document.dispatchEvent(
          new KeyboardEvent("keydown", { key: "k", metaKey: true })
        )
      }
      className="hidden md:flex items-center gap-3 text-[11px] uppercase tracking-[0.12em] font-medium text-muted-foreground hover:text-(--v3-accent) transition-all duration-200 px-4.5 h-9.5 border border-(--rule) rounded-full bg-transparent hover:bg-(--bg-2) hover:border-(--v3-accent-soft) group"
      aria-label="Open command palette"
    >
      <span className="font-mono">Search</span>
      <kbd className="text-[10px] bg-(--bg-2) px-1.5 py-0.5 rounded font-mono text-muted-foreground border border-(--rule) transition-colors group-hover:border-(--v3-accent-soft) group-hover:text-(--v3-accent)">
        ⌘K
      </kbd>
    </button>
  );
}
