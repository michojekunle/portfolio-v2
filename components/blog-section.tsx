import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { format } from "date-fns"

export async function BlogSection(): Promise<React.ReactElement> {
  const supabase = await createClient()

  const { data: posts } = await supabase
    .from("blog_posts")
    .select("id, title, slug, excerpt, category, read_time, published_at")
    .eq("published", true)
    .order("published_at", { ascending: false })
    .limit(3)

  const items = posts ?? []

  return (
    <section className="v3-section v3-container" id="blog" aria-labelledby="blog-heading">
      <div className="v3-section-head">
        <div className="num">05 — WRITING</div>
        <div>
          <h2 id="blog-heading">Field <em>notes.</em></h2>
          <div className="sub">
            Short essays on engineering, ZK, and learning things in public. New piece every few
            weeks.
          </div>
        </div>
      </div>

      {items.length > 0 ? (
        <div className="v3-notes-strip">
          {items.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="v3-note-card">
              <div className="date">
                {post.published_at ? format(new Date(post.published_at), "MMM d, yyyy") : ""}
                {post.category && <span className="tag">{post.category}</span>}
              </div>
              <h3>{post.title}</h3>
              {post.excerpt && <p>{post.excerpt}</p>}
              <div className="read">
                Read{post.read_time ? ` · ${post.read_time} min` : ""}{" "}
                <span className="arr" aria-hidden="true">→</span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p style={{ color: "var(--ink-3)", fontFamily: "var(--font-jetbrains-mono)", fontSize: "13px" }}>
          No posts yet. Check back soon.
        </p>
      )}

      <div style={{ textAlign: "center", marginTop: "56px" }}>
        <Link href="/blog" className="v3-btn v3-btn-ghost">
          All notes <span className="arr" aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  )
}
