import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { format } from "date-fns"
import { NewsletterCTA } from "./newsletter-cta"
import { MagneticWrapper } from "./magnetic-wrapper"
import { ArrowRight } from "lucide-react"

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
    <section className="py-30 max-180:py-18 max-w-(--maxw) mx-auto px-(--gutter)" id="blog" aria-labelledby="blog-heading">
      <div className="grid grid-cols-[120px_1fr] max-180:grid-cols-1 gap-12 max-180:gap-6 items-baseline mb-20 max-180:mb-12">
        <div className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground pt-4.5">04 — WRITING</div>
        <div>
          <h2 id="blog-heading" className="m-0 font-display font-normal text-[clamp(44px,7vw,88px)] leading-[0.95] tracking-tight text-(--ink) text-balance fvs-display">
            Field <em className="not-italic italic text-(--v3-accent) fvs-soft">notes.</em>
          </h2>
          <div className="col-start-2 max-180:col-start-1 max-w-[56ch] text-[17px] leading-[1.6] text-secondary-foreground mt-4.5">
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
                <ArrowRight className="inline w-4 h-4 ml-1" aria-hidden="true" />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="font-mono text-[13px] text-muted-foreground">
          No posts yet. Check back soon.
        </p>
      )}

      <div className="flex justify-center mt-20 pt-10 border-t border-(--rule) mb-20">
        <MagneticWrapper strength={20}>
          <Link href="/blog" className="group inline-flex items-center justify-center px-8 h-13 rounded-full font-mono text-[11px] uppercase tracking-[0.15em] font-medium cursor-pointer border border-(--rule) bg-transparent text-(--ink) transition-all duration-300 no-underline hover:border-(--v3-accent) hover:text-(--v3-accent) hover:bg-[color-mix(in_oklab,var(--v3-accent)_5%,transparent)]">
            Read all notes <ArrowRight className="inline-block transition-transform duration-300 group-hover:translate-x-1 ml-2.5 w-3 h-3" aria-hidden="true" />
          </Link>
        </MagneticWrapper>
      </div>

      <NewsletterCTA />
    </section>
  )
}
