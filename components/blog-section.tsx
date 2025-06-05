"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Calendar } from "lucide-react"
import Link from "next/link"

export function BlogSection() {
  const blogPosts = [
    {
      title: "Building Accessible Web3 Applications",
      excerpt: "How to ensure your dApps are accessible to all users, regardless of ability or technical knowledge.",
      date: "May 28, 2025",
      category: "Web3",
      readTime: "8 min read",
      slug: "#",
    },
    {
      title: "The Intersection of Faith and Technology",
      excerpt:
        "Exploring how spiritual principles can guide ethical technology development in the age of AI and blockchain.",
      date: "April 15, 2025",
      category: "Reflection",
      readTime: "12 min read",
      slug: "#",
    },
    {
      title: "Zero-Knowledge Proofs: A Practical Introduction",
      excerpt: "Breaking down complex ZK concepts with practical examples and code snippets for developers.",
      date: "March 3, 2025",
      category: "Technical",
      readTime: "15 min read",
      slug: "#",
    },
    {
      title: "Functional Programming Patterns in TypeScript",
      excerpt: "Applying functional programming principles to write more maintainable TypeScript code.",
      date: "February 10, 2025",
      category: "Technical",
      readTime: "10 min read",
      slug: "#",
    },
  ]

  return (
    <section id="blog" className="py-20">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold mb-2">Blog & Writing</h2>
          <div className="h-1 w-20 bg-primary"></div>
        </div>
        <Button variant="ghost" className="group">
          View All
          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {blogPosts.map((post, index) => (
          <article
            key={post.title}
            className="terminal-card group hover:border-primary/50 transition-colors animate-fade-up"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <Badge
              variant={post.category === "Technical" ? "default" : post.category === "Web3" ? "secondary" : "outline"}
              className="mb-4"
            >
              {post.category}
            </Badge>

            <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
              <Link href={post.slug}>{post.title}</Link>
            </h3>

            <p className="text-muted-foreground mb-4">{post.excerpt}</p>

            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 mr-2" />
              <span>{post.date}</span>
              <span className="mx-2">•</span>
              <span>{post.readTime}</span>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-12 text-center">
        <Button size="lg">Subscribe to Newsletter</Button>
      </div>
    </section>
  )
}
