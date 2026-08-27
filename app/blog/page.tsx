import { createClient } from "@/lib/supabase/server"
import type { Metadata } from "next"
import { BlogListing } from "@/components/blog-listing"

export const revalidate = 60

export const metadata: Metadata = {
  title: "Field Notes",
  description:
    "Essays on engineering, ZK, Rust, faith, and learning things in public. Roughly one piece every three weeks.",
}

import { BlogHeroClient } from "@/components/blog-hero-client"
import { NewsletterCTA } from "@/components/newsletter-cta"

export default async function BlogPage(): Promise<React.ReactElement> {
  const supabase = await createClient()

  const { data: rawPosts, error: postsErr } = await supabase
    .from("blog_posts")
    .select(`
      id, title, slug, excerpt, category, read_time, published_at, updated_at, views, external_url, clicks, cover_image,
      reactions:blog_reactions(count),
      comments:blog_comments(count)
    `)
    .eq("published", true)
    .order("published_at", { ascending: false })

  if (postsErr) console.error("[BlogPage] failed to fetch posts:", postsErr.message)

  const posts = (rawPosts ?? []).map((post) => ({
    ...post,
    reactionCount: (post.reactions as unknown as { count: number }[])?.[0]?.count ?? 0,
    commentCount: (post.comments as unknown as { count: number }[])?.[0]?.count ?? 0,
  }))

  return (
    <main id="main-content" tabIndex={-1} className="outline-none">
        <BlogHeroClient />

        <section className="px-(--gutter) py-20">
          <div className="v3-blog-list">
            <BlogListing initialPosts={posts as Parameters<typeof BlogListing>[0]["initialPosts"]} />
          </div>
        </section>

        <NewsletterCTA 
          title="Deep dives, delivered." 
          description="Get my latest field notes and technical essays directly in your inbox. No noise, just high-signal thoughts."
        />
    </main>
  )
}
