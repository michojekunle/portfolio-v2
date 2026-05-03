import { createClient } from "@/lib/supabase/server"
import type { Metadata } from "next"
import { BlogListing } from "@/components/blog-listing"

export const revalidate = 60

export const metadata: Metadata = {
  title: "Field Notes",
  description:
    "Essays on engineering, ZK, Rust, faith, and learning things in public. Roughly one piece every three weeks.",
}

export default async function BlogPage(): Promise<React.ReactElement> {
  const supabase = await createClient()

  const { data: rawPosts } = await supabase
    .from("blog_posts")
    .select(`
      id, title, slug, excerpt, category, read_time, published_at, updated_at, views, external_url, clicks,
      reactions:blog_reactions(count),
      comments:blog_comments(count)
    `)
    .eq("published", true)
    .order("published_at", { ascending: false })

  const posts = (rawPosts ?? []).map((post) => ({
    ...post,
    reactionCount: (post.reactions as unknown as { count: number }[])?.[0]?.count ?? 0,
    commentCount: (post.comments as unknown as { count: number }[])?.[0]?.count ?? 0,
  }))

  return (
    <main id="main-content" tabIndex={-1} className="outline-none">
        <section className="v3-blog-hero v3-container">
          <div className="v3-eyebrow" style={{ marginBottom: 24 }}>
            <b>Field notes</b> · {posts.length} essays
          </div>
          <h1>
            Notes from the <em>field.</em>
          </h1>
          <p className="desc">
            Essays on engineering, ZK, Rust, faith, and learning things in public. Roughly one
            piece every three weeks. Always written longhand first.
          </p>
        </section>

        <section className="v3-container">
          <div className="v3-blog-list">
            <BlogListing initialPosts={posts as Parameters<typeof BlogListing>[0]["initialPosts"]} />
          </div>
        </section>
    </main>
  )
}
