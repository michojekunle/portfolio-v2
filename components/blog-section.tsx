import { createClient } from "@/lib/supabase/server"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, Calendar } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { NewsletterForm } from "./newsletter-form"

export async function BlogSection(): Promise<React.ReactElement> {
  const supabase = await createClient()

  const { data: posts } = await supabase
    .from("blog_posts")
    .select("id, title, slug, excerpt, category, read_time, published_at")
    .eq("published", true)
    .order("published_at", { ascending: false })
    .limit(4)

  return (
    <section id="blog" className="py-20">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold mb-2">Blog &amp; Writing</h2>
          <div className="section-rule" />
        </div>
        <Button variant="ghost" size="sm" className="group text-muted-foreground" asChild>
          <Link href="/blog">
            View All
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </div>

      {!posts?.length ? (
        <p className="text-sm text-muted-foreground">No posts yet. Check back soon.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group content-card hover:border-foreground/20 transition-colors no-underline"
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

              {post.excerpt && (
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{post.excerpt}</p>
              )}

              <div className="flex items-center text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5 mr-1.5" />
                <span>
                  {post.published_at ? format(new Date(post.published_at), "MMM d, yyyy") : ""}
                </span>
                {post.read_time && (
                  <>
                    <span className="mx-2">·</span>
                    <span>{post.read_time}</span>
                  </>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-12 flex justify-center">
        <NewsletterForm />
      </div>
    </section>
  )
}
