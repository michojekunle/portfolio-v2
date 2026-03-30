import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Uses",
  description:
    "Hardware, software, tools, and setup that Michael Ojekunle uses daily for development.",
};

interface ToolItem {
  name: string;
  description: string;
  url?: string;
}

interface ToolCategory {
  title: string;
  items: ToolItem[];
}

const categories: ToolCategory[] = [
  {
    title: "Editor & Terminal",
    items: [
      {
        name: "VS Code",
        description:
          "Primary editor. Vim keybindings, minimal extensions, Gruvian theme.",
      },
      {
        name: "Antigravity",
        description: "AI-augmented editor for rapid prototyping and pair coding.",
      },
      {
        name: "Claude Code",
        description: "AI coding assistant from Anthropic — terminal-native pair programmer.",
      },
    ],
  },
  {
    title: "Languages & Frameworks",
    items: [
      {
        name: "TypeScript + Next.js",
        description: "Default stack for production web apps. App Router, RSC, Turbopack.",
      },
      {
        name: "Solidity",
        description: "Smart contracts for EVM-compatible chains. Foundry for testing.",
      },
      {
        name: "Cairo",
        description: "StarkNet smart contracts. Provable computation on L2.",
      },
      {
        name: "Rust",
        description: "Systems programming, CLI tools, and blockchain infrastructure.",
      },
      {
        name: "Flutter / Dart",
        description: "Cross-platform mobile development for iOS and Android.",
      },
    ],
  },
  {
    title: "Infrastructure & Services",
    items: [
      {
        name: "Vercel",
        description: "Deployment platform. Automatic previews, edge functions, analytics.",
      },
      {
        name: "Supabase",
        description:
          "Postgres database, auth, row-level security, real-time subscriptions.",
      },
      {
        name: "Resend",
        description: "Transactional and newsletter emails with custom domain support.",
      },
      {
        name: "GitHub",
        description: "Source control, CI/CD via Actions, project management.",
      },
    ],
  },
  {
    title: "Design & Productivity",
    items: [
      {
        name: "Figma",
        description: "UI/UX design, component systems, prototyping.",
      },
      {
        name: "Notion",
        description:
          "Documentation, project notes, personal knowledge base.",
      },
      {
        name: "Arc Browser",
        description: "Primary browser. Spaces for context-switching between projects.",
      },
    ],
  },
  {
    title: "Hardware",
    items: [
      {
        name: "MacBook Pro",
        description: "Primary development machine. Fast builds, great battery.",
      },
    ],
  },
];

export default function UsesPage(): React.ReactElement {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-20 px-6 max-w-2xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-10 no-underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Home
        </Link>

        <div className="mb-12">
          <h1 className="text-3xl font-semibold tracking-tight mb-2">Uses</h1>
          <p className="text-muted-foreground">
            Hardware, software, and tools I use daily for building things.
          </p>
        </div>

        <div className="space-y-12">
          {categories.map((category) => (
            <section key={category.title}>
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
                {category.title}
              </h2>
              <div className="space-y-4">
                {category.items.map((item) => (
                  <div key={item.name} className="group">
                    <h3 className="font-medium text-sm">
                      {item.url ? (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline underline-offset-4"
                        >
                          {item.name}
                        </a>
                      ) : (
                        item.name
                      )}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
      <div className="max-w-2xl mx-auto px-6">
        <Footer />
      </div>
    </>
  );
}
