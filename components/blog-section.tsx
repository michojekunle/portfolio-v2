"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ArrowRight, Calendar } from "lucide-react"
import { toast } from "sonner"

interface BlogPost {
  title: string
  excerpt: string
  date: string
  category: string
  readTime: string
  slug: string
}

const FALLBACK_VERSE = { text: "", reference: "" }
void FALLBACK_VERSE

export function BlogSection() {
  const [subscribeEmail, setSubscribeEmail] = useState("")
  const [subscribeStatus, setSubscribeStatus] = useState<"idle" | "loading" | "success">("idle")

  const blogPosts: BlogPost[] = [
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

  const handleSubscribe = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    setSubscribeStatus("loading")

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error("Supabase configuration missing")
      }

      const { createClient } = await import("@supabase/supabase-js")
      const supabase = createClient(supabaseUrl, supabaseAnonKey)

      const { error } = await supabase
        .from("email_subscribers")
        .insert([{ email: subscribeEmail.trim().toLowerCase() }])

      if (error) {
        throw new Error(error.message)
      }

      setSubscribeStatus("success")
      toast.success("You&apos;re subscribed! I&apos;ll send new posts your way.")
    } catch (error: unknown) {
      console.error("[subscribe] Error:", error)
      toast.error("Subscription failed. Please try again.")
      setSubscribeStatus("idle")
    }
  }

  return (
    <section id="blog" className="py-20">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold mb-2">Blog &amp; Writing</h2>
          <div className="section-rule" />
        </div>
        <Button variant="ghost" size="sm" className="group text-muted-foreground" disabled>
          View All
          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {blogPosts.map((post) => (
          <article
            key={post.title}
            className="group content-card hover:border-foreground/20 transition-colors"
          >
            <Badge
              variant={post.category === "Technical" ? "default" : post.category === "Web3" ? "secondary" : "outline"}
              className="mb-4 text-xs"
            >
              {post.category}
            </Badge>

            <h3 className="text-lg font-semibold mb-2 group-hover:text-foreground transition-colors leading-snug">
              {post.title}
            </h3>

            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{post.excerpt}</p>

            <div className="flex items-center text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5 mr-1.5" />
              <span>{post.date}</span>
              <span className="mx-2">·</span>
              <span>{post.readTime}</span>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-12 flex justify-center">
        <form onSubmit={handleSubscribe} className="flex gap-2 w-full max-w-sm">
          <Input
            type="email"
            placeholder="your@email.com"
            value={subscribeEmail}
            onChange={(e) => setSubscribeEmail(e.target.value)}
            required
            disabled={subscribeStatus === "loading" || subscribeStatus === "success"}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={subscribeStatus === "loading" || subscribeStatus === "success"}
          >
            {subscribeStatus === "loading"
              ? "..."
              : subscribeStatus === "success"
                ? "Subscribed"
                : "Subscribe"}
          </Button>
        </form>
      </div>
    </section>
  )
}
