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
} from "lucide-react";
import { useTheme } from "next-themes";

interface CommandAction {
  label: string;
  icon: React.ReactNode;
  action: () => void;
  group: string;
  keywords?: string;
}

export function CommandPalette(): React.ReactElement {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { setTheme, theme } = useTheme();

  const navigate = useCallback(
    (path: string): void => {
      setOpen(false);
      if (path.startsWith("#")) {
        // Hash navigation — scroll on home page
        if (window.location.pathname !== "/") {
          router.push(`/${path}`);
        } else {
          document.querySelector(path)?.scrollIntoView({ behavior: "smooth" });
        }
      } else if (path.startsWith("http")) {
        window.open(path, "_blank", "noopener,noreferrer");
      } else {
        router.push(path);
      }
    },
    [router]
  );

  const actions: CommandAction[] = [
    // Navigation
    { label: "Home", icon: <Home className="h-4 w-4" />, action: () => navigate("/"), group: "Navigation" },
    { label: "About", icon: <User className="h-4 w-4" />, action: () => navigate("#about"), group: "Navigation" },
    { label: "Projects", icon: <FolderOpen className="h-4 w-4" />, action: () => navigate("#projects"), group: "Navigation" },
    { label: "Blog", icon: <FileText className="h-4 w-4" />, action: () => navigate("/blog"), group: "Navigation" },
    { label: "Now", icon: <Activity className="h-4 w-4" />, action: () => navigate("#now"), group: "Navigation" },
    { label: "Contact", icon: <Mail className="h-4 w-4" />, action: () => navigate("#contact"), group: "Navigation" },

    // Pages
    { label: "Uses", icon: <Wrench className="h-4 w-4" />, action: () => navigate("/uses"), group: "Pages", keywords: "tools setup hardware software" },
    { label: "Guestbook", icon: <MessageSquare className="h-4 w-4" />, action: () => navigate("/guestbook"), group: "Pages", keywords: "sign message" },
    { label: "Changelog", icon: <BookOpen className="h-4 w-4" />, action: () => navigate("/changelog"), group: "Pages", keywords: "activity updates commits" },
    { label: "RSS Feed", icon: <Rss className="h-4 w-4" />, action: () => navigate("/feed.xml"), group: "Pages" },

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
      <CommandInput placeholder="Search pages, actions, and more..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {groups.map((group, i) => (
          <div key={group}>
            {i > 0 && <CommandSeparator />}
            <CommandGroup heading={group}>
              {filteredActions
                .filter((a) => a.group === group)
                .map((action) => (
                  <CommandItem
                    key={action.label}
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
      className="hidden md:flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 border border-border rounded-md"
      aria-label="Open command palette"
    >
      <span>Search</span>
      <kbd className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-mono">
        ⌘K
      </kbd>
    </button>
  );
}
