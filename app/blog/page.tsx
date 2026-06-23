import { createClient } from "@/lib/supabase/server"
import type { Metadata } from "next"
import { BlogListing } from "@/components/blog-listing"

export const revalidate = 60

export const metadata: Metadata = {
  title: "Field Notes",
  description:
    "Essays on engineering, ZK, Rust, faith, and learning things in public. Roughly one piece every three weeks.",
}

import { NewsletterCTA } from "@/components/newsletter-cta"

export default async function BlogPage(): Promise<React.ReactElement> {
  const supabase = await createClient()

  const { data: rawPosts, error: postsErr } = await supabase
    .from("blog_posts")
    .select(`
      id, title, slug, excerpt, category, read_time, published_at, updated_at, views, external_url, clicks,
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
        <section className="pt-[160px] pb-[80px] max-[720px]:pt-[120px] max-[720px]:pb-[56px] max-w-[var(--maxw)] mx-auto px-[var(--gutter)] border-b border-[var(--rule)]">
          <div className="font-mono text-[11px] tracking-[0.18em] text-[var(--ink-3)] mb-[24px]">FIELD NOTES · ESSAYS</div>
          <h1 className="m-0 font-display font-normal text-[clamp(64px,10vw,120px)] leading-[0.85] tracking-[-0.04em] text-[var(--ink)] mb-[32px] text-balance fvs-display">
            Notes from the <em className="not-italic italic text-[var(--v3-accent)] fvs-soft">field.</em>
          </h1>
          <p className="text-[18px] text-[var(--ink-2)] max-w-[52ch] leading-[1.65] m-0">
            Deep dives on engineering, ZK, Rust, and the philosophy of building. Distilled insights from the front lines of technology and learning.
          </p>
        </section>

        <section className="px-[var(--gutter)] py-[80px]">
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
