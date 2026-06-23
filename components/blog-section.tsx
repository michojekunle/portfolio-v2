import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { format } from "date-fns"
import { NewsletterCTA } from "./newsletter-cta"

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
    <section className="py-[120px] max-[720px]:py-[72px] max-w-[var(--maxw)] mx-auto px-[var(--gutter)]" id="blog" aria-labelledby="blog-heading">
      <div className="grid grid-cols-[120px_1fr] max-[720px]:grid-cols-1 gap-[48px] max-[720px]:gap-[12px] items-baseline mb-[80px] max-[720px]:mb-[48px]">
        <div className="font-mono text-[11px] tracking-[0.18em] text-[var(--ink-3)] pt-[18px]">04 — WRITING</div>
        <div>
          <h2 id="blog-heading" className="m-0 font-display font-normal text-[clamp(44px,7vw,88px)] leading-[0.95] tracking-[-0.025em] text-[var(--ink)] text-balance fvs-display">
            Field <em className="not-italic italic text-[var(--v3-accent)] fvs-soft">notes.</em>
          </h2>
          <div className="col-start-2 max-[720px]:col-start-1 max-w-[56ch] text-[17px] leading-[1.6] text-[var(--ink-2)] mt-[18px]">
            Short essays on engineering, ZK, and learning in public.
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
        <p className="font-mono text-[13px] text-[var(--ink-3)]">
          No posts yet. Check back soon.
        </p>
      )}

      <div className="flex justify-center mt-[80px] pt-[40px] border-t border-[var(--rule)] mb-[80px]">
        <Link href="/blog" className="group inline-flex items-center justify-center px-[32px] h-[52px] rounded-full font-mono text-[11px] uppercase tracking-[0.15em] font-medium cursor-pointer border border-[var(--rule)] bg-transparent text-[var(--ink)] transition-all duration-300 no-underline hover:border-[var(--v3-accent)] hover:text-[var(--v3-accent)] hover:bg-[color-mix(in_oklab,var(--v3-accent)_5%,transparent)]">
          Read all notes <span className="inline-block transition-transform duration-300 group-hover:translate-x-[4px] ml-[10px]" aria-hidden="true">→</span>
        </Link>
      </div>

      <NewsletterCTA />
    </section>
  )
}
