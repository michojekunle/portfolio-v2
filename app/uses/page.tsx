import type { Metadata } from "next";
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
          "My primary environment. I keep it minimal with Vim keybindings and a curated set of extensions to stay focused on the home row.",
      },
      {
        name: "Antigravity",
        description:
          "An AI-augmented layer for rapid prototyping. It helps bridge the gap between abstract ideas and executable code.",
      },
      {
        name: "Claude Code",
        description:
          "A terminal-native assistant for deep engineering sessions. It's like having a senior pair programmer available as a first-class citizen in the CLI.",
      },
    ],
  },
  {
    title: "Languages & Frameworks",
    items: [
      {
        name: "TypeScript + Next.js",
        description:
          "My default stack for building orderly, type-safe systems that scale.",
      },
      {
        name: "Solidity",
        description:
          "The language of decentralized truth. For building robust smart contracts on EVM-compatible networks.",
      },
      {
        name: "Cairo",
        description:
          "Computation that can be proven. Exploring the first principles of STARKs and scaling Ethereum via Starknet.",
      },
      {
        name: "Rust",
        description:
          "Systems engineering from the ground up. I use it for CLI tools and whenever I need to strip away abstractions for maximum performance.",
      },
      {
        name: "Flutter / Dart",
        description:
          "Architecting cross-platform interfaces. I'm studying it to understand how to build consistent experiences across different OS abstractions.",
      },
    ],
  },
  {
    title: "Infrastructure & Services",
    items: [
      {
        name: "Vercel",
        description:
          "The foundation for deploying performant, accessible frontends with minimal friction.",
      },
      {
        name: "Supabase",
        description:
          "A complete backend system that respects the power of Postgres. It's where I manage relational order and state.",
      },
      {
        name: "Resend",
        description:
          "Transactional and newsletter emails with custom domain support.",
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
        description:
          "Where ideas take visual shape before they find their way into the DOM.",
      },
      {
        name: "Notion",
        description:
          "My personal knowledge base. A structured container for everything from architectural notes to cross-disciplinary research.",
      },
      {
        name: "Arc Browser",
        description:
          "Implicit context management. I use Spaces to keep my development work, faith-based projects, and personal research isolated yet accessible.",
      },
    ],
  },
  {
    title: "Hardware",
    items: [
      {
        name: "MacBook Pro",
        description:
          "The workhorse. A reliable, high-performance machine that allows me to build without technical friction in my daily workflow.",
      },
    ],
  },
];

export default function UsesPage(): React.ReactElement {
  return (
    <>
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
          <p className="text-muted-foreground leading-relaxed">
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
